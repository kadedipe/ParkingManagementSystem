from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

import requests

API_URL = os.environ.get("RAILWAY_API_URL", "https://backboard.railway.com/graphql/v2")
TOKEN = os.environ["RAILWAY_TOKEN"]
PROJECT_ID = os.environ["RAILWAY_PROJECT_ID"]
ENVIRONMENT_NAME = os.environ.get("RAILWAY_ENVIRONMENT_NAME", "production")
NOTIFICATION_SERVICE_ID = os.environ["NOTIFICATION_SERVICE_ID"]
STATE_FILE = Path("/tmp/railway-state.json")

session = requests.Session()
session.headers.update(
    {
        "Content-Type": "application/json",
        "Project-Access-Token": TOKEN,
        "User-Agent": "ParkingManagementSystem-GitHubActions/1.0",
        "Accept": "application/json",
    }
)


def gql(query: str, variables: dict | None = None) -> dict:
    response = session.post(
        API_URL,
        json={"query": query, "variables": variables or {}},
        timeout=30,
    )
    if not response.ok:
        detail = response.text[:1000].replace(TOKEN, "***")
        raise RuntimeError(f"Railway API HTTP {response.status_code}: {detail}")
    body = response.json()
    if body.get("errors"):
        messages = "; ".join(error.get("message", "GraphQL error") for error in body["errors"])
        raise RuntimeError(f"Railway GraphQL error: {messages}")
    return body["data"]


def discover_and_configure() -> dict:
    token_info = gql("query { projectToken { projectId environmentId } }")["projectToken"]
    project_id = token_info["projectId"]
    environment_id = token_info["environmentId"]

    if project_id != PROJECT_ID:
        raise RuntimeError(
            f"RAILWAY_TOKEN belongs to project {project_id}, not expected project {PROJECT_ID}"
        )

    project = gql(
        """
        query project($id: String!) {
          project(id: $id) {
            id
            name
            services { edges { node { id name } } }
            environments { edges { node { id name } } }
          }
        }
        """,
        {"id": project_id},
    )["project"]

    environments = {
        edge["node"]["id"]: edge["node"]["name"]
        for edge in project["environments"]["edges"]
    }
    environment_name = environments.get(environment_id)
    if environment_name != ENVIRONMENT_NAME:
        raise RuntimeError(
            f"RAILWAY_TOKEN is scoped to environment {environment_name!r}, not {ENVIRONMENT_NAME!r}"
        )

    services = [edge["node"] for edge in project["services"]["edges"]]
    if not any(service["id"] == NOTIFICATION_SERVICE_ID for service in services):
        raise RuntimeError("Notification service is not present in the token-scoped Railway project")

    variables_query = """
        query variables($projectId: String!, $environmentId: String!, $serviceId: String) {
          variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId)
        }
    """

    postgres_candidates: list[dict] = []
    redis_candidates: list[dict] = []
    for service in services:
        if service["id"] == NOTIFICATION_SERVICE_ID:
            continue
        variables = gql(
            variables_query,
            {
                "projectId": project_id,
                "environmentId": environment_id,
                "serviceId": service["id"],
            },
        )["variables"] or {}
        keys = set(variables) if isinstance(variables, dict) else set()
        if "DATABASE_URL" in keys:
            postgres_candidates.append(service)
        if "REDIS_URL" in keys:
            redis_candidates.append(service)

    def choose(candidates: list[dict], hint: str) -> dict | None:
        if not candidates:
            return None
        preferred = [service for service in candidates if hint in service["name"].lower()]
        return (preferred or candidates)[0]

    postgres = choose(postgres_candidates, "postgres")
    redis = choose(redis_candidates, "redis")
    if postgres is None:
        raise RuntimeError("No Railway service exposing DATABASE_URL was found in production")
    if redis is None:
        raise RuntimeError("No Railway service exposing REDIS_URL was found in production")

    database_ref = "$" + "{{" + postgres["name"] + ".DATABASE_URL}}"
    redis_ref = "$" + "{{" + redis["name"] + ".REDIS_URL}}"

    gql(
        """
        mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) {
          variableCollectionUpsert(input: $input)
        }
        """,
        {
            "input": {
                "projectId": project_id,
                "environmentId": environment_id,
                "serviceId": NOTIFICATION_SERVICE_ID,
                "variables": {
                    "DATABASE_URL": database_ref,
                    "REDIS_URL": redis_ref,
                    "ENVIRONMENT": "production",
                    "PORT": "8080",
                    "DOCS_ENABLED": "false",
                },
                "skipDeploys": True,
            }
        },
    )

    state = {
        "project_id": project_id,
        "project_name": project["name"],
        "environment_id": environment_id,
        "environment_name": environment_name,
        "notification_id": NOTIFICATION_SERVICE_ID,
        "postgres_name": postgres["name"],
        "redis_name": redis["name"],
    }
    STATE_FILE.write_text(json.dumps(state), encoding="utf-8")

    print(f"Railway project token valid for project: {project['name']}")
    print(f"Production environment verified: {environment_name}")
    print(f"PostgreSQL service discovered: {postgres['name']}")
    print(f"Redis service discovered: {redis['name']}")
    print("Notification DATABASE_URL and REDIS_URL references updated without exposing values.")
    return state


def deploy(state: dict) -> None:
    deployments_query = """
        query deployments($input: DeploymentListInput!) {
          deployments(input: $input, first: 5) {
            edges { node { id status createdAt } }
          }
        }
    """
    deploy_input = {
        "projectId": state["project_id"],
        "serviceId": state["notification_id"],
    }

    before = gql(deployments_query, {"input": deploy_input})["deployments"]["edges"]
    before_id = before[0]["node"]["id"] if before else None

    gql(
        """
        mutation serviceInstanceDeploy($serviceId: String!, $environmentId: String!) {
          serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId)
        }
        """,
        {
            "serviceId": state["notification_id"],
            "environmentId": state["environment_id"],
        },
    )
    print("Railway Notification deployment triggered.")

    deployment_id = None
    for _ in range(30):
        edges = gql(deployments_query, {"input": deploy_input})["deployments"]["edges"]
        if edges and edges[0]["node"]["id"] != before_id:
            deployment_id = edges[0]["node"]["id"]
            break
        time.sleep(2)
    if deployment_id is None:
        raise RuntimeError("A new Railway deployment did not appear after deployment trigger")

    print(f"Railway deployment ID: {deployment_id}")
    for _ in range(150):
        edges = gql(deployments_query, {"input": deploy_input})["deployments"]["edges"]
        node = next((edge["node"] for edge in edges if edge["node"]["id"] == deployment_id), None)
        if node is None:
            time.sleep(4)
            continue
        status = str(node["status"]).upper()
        print(f"Railway deployment status: {status}")
        if status == "SUCCESS":
            print("Notification deployment reached SUCCESS; Railway /health gate passed.")
            return
        if status in {"FAILED", "CRASHED", "REMOVED", "REMOVING"}:
            raise RuntimeError(f"Notification deployment reached terminal failure state: {status}")
        time.sleep(4)

    raise RuntimeError("Timed out waiting for Railway Notification deployment to reach a terminal state")


def main() -> int:
    try:
        state = discover_and_configure()
        deploy(state)
        return 0
    except Exception as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
