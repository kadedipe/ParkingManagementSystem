# ============================================================================
# Setup Script - Python Package Setup
# ============================================================================

# parking-management-system/services/parking-service/setup.py

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="parking-service",
    version="2.0.0",
    author="Parking Management Team",
    author_email="dev@parkingapp.com",
    description="Parking Service Microservice",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/parkingapp/parking-service",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.9",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "black>=23.11.0",
            "flake8>=6.1.0",
            "mypy>=1.7.0",
            "isort>=5.12.0",
            "pre-commit>=3.5.0",
        ],
        "prod": [
            "uvicorn[standard]>=0.24.0",
            "gunicorn>=21.2.0",
        ],
        "test": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.1.0",
            "pytest-mock>=3.12.0",
            "httpx>=0.25.0",
            "faker>=20.0.0",
        ],
        "docs": [
            "sphinx>=7.2.0",
            "sphinx-rtd-theme>=2.0.0",
            "myst-parser>=2.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "parking-service=main:main",
        ],
    },
)