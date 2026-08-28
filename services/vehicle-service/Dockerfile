FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY requirements.prod.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY src ./src
COPY alembic.ini ./alembic.ini
COPY alembic ./alembic
USER app
EXPOSE 8080
CMD ["sh","-c","uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
