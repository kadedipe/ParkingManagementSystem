# ============================================================================
# Dependency Verification - Verify Installed Packages
# ============================================================================

# parking-management-system/services/notification-service/scripts/verify_deps.py

import sys
import importlib.metadata
from typing import List, Tuple, Dict
import subprocess
import json

REQUIRED_PACKAGES: Dict[str, str] = {
    "fastapi": "0.104.1",
    "uvicorn": "0.24.0",
    "sqlalchemy": "2.0.23",
    "alembic": "1.12.1",
    "asyncpg": "0.29.0",
    "redis": "5.0.1",
    "celery": "5.3.4",
    "python-jose": "3.3.0",
    "passlib": "1.7.4",
    "pydantic": "2.5.0",
    "httpx": "0.25.2",
    "loguru": "0.7.2",
    "prometheus-client": "0.19.0",
    "sendgrid": "6.10.0",
    "expo-server-sdk": "3.7.0",
    "firebase-admin": "6.4.0",
    "twilio": "8.9.0",
    "jinja2": "3.1.2",
    "boto3": "1.33.6",
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

def check_security_vulnerabilities() -> List[Dict]:
    """Check for security vulnerabilities using safety"""
    try:
        result = subprocess.run(
            ["safety", "check", "--json"],
            capture_output=True,
            text=True,
        )
        if result.stdout:
            return json.loads(result.stdout)
        return []
    except Exception as e:
        print(f"Error running safety check: {e}")
        return []

def main():
    print("=" * 60)
    print("Verifying Notification Service Dependencies")
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
    
    # Check security vulnerabilities
    vulnerabilities = check_security_vulnerabilities()
    if vulnerabilities:
        print("\033[91mSecurity vulnerabilities found:\033[0m")
        for vuln in vulnerabilities:
            print(f"  - {vuln.get('package')} {vuln.get('version')}: {vuln.get('vulnerability')}")
        all_ok = False
    else:
        print("\033[92m✓ No security vulnerabilities found\033[0m")

    # Check if celery is configured properly
    try:
        import celery
        print(f"\033[92m✓ Celery version: {celery.__version__}\033[0m")
    except ImportError:
        print("\033[91m✗ Celery not installed properly\033[0m")
        all_ok = False

    if all_ok:
        print("\n\033[92m✓ All dependencies are installed correctly\033[0m")
    else:
        print("\n\033[91m✗ Some dependencies are missing or have incorrect versions\033[0m")
        print("\nRun 'pip install -r requirements.txt' to install missing dependencies")
        sys.exit(1)

if __name__ == "__main__":
    main()