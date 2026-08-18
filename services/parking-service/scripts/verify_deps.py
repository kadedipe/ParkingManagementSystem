# ============================================================================
# Dependency Verification - Verify Installed Packages
# ============================================================================

# parking-management-system/services/parking-service/scripts/verify_deps.py

import sys
import subprocess
import importlib.metadata
from typing import List, Tuple

REQUIRED_PACKAGES = {
    "fastapi": "0.104.1",
    "uvicorn": "0.24.0",
    "sqlalchemy": "2.0.23",
    "alembic": "1.12.1",
    "asyncpg": "0.29.0",
    "redis": "5.0.1",
    "python-jose": "3.3.0",
    "passlib": "1.7.4",
    "pydantic": "2.5.0",
    "httpx": "0.25.2",
    "geopy": "2.4.1",
    "celery": "5.3.4",
    "loguru": "0.7.2",
    "prometheus-client": "0.19.0",
}

def verify_package(package_name: str, expected_version: str) -> Tuple[bool, str]:
    """Verify if package is installed and version matches"""
    try:
        installed_version = importlib.metadata.version(package_name)
        if installed_version == expected_version:
            return True, installed_version
        return False, installed_version
    except importlib.metadata.PackageNotFoundError:
        return False, "NOT INSTALLED"

def main():
    print("=" * 60)
    print("Verifying Python Dependencies")
    print("=" * 60)
    print()

    all_ok = True
    for package, expected_version in REQUIRED_PACKAGES.items():
        is_ok, actual_version = verify_package(package, expected_version)
        status = "✓" if is_ok else "✗"
        color = "\033[92m" if is_ok else "\033[91m"
        reset = "\033[0m"
        print(f"{color}{status}{reset} {package:<20} expected: {expected_version:<10} actual: {actual_version}")
        if not is_ok:
            all_ok = False

    print()
    if all_ok:
        print("\033[92m✓ All dependencies are installed correctly\033[0m")
    else:
        print("\033[91m✗ Some dependencies are missing or have incorrect versions\033[0m")
        print("\nRun 'pip install -r requirements.txt' to install missing dependencies")

if __name__ == "__main__":
    main()