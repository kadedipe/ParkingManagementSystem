FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 && rm -rf /var/lib/apt/lists/*
COPY requirements.prod.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m -u 10001 appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
CMD ["sh","-c","uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
