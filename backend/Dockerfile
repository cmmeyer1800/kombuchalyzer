# Stage 1: Build Stage
FROM python:3.13-slim AS builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install uv
# We use the official install script or pip. Pip is easiest in this context.
RUN pip install uv

WORKDIR /app

# Copy dependency definitions
# We copy uv.lock if it exists (using wildcard trick) to ensure reproducible builds
COPY pyproject.toml uv.lock* ./

# Install dependencies
# --frozen: use the lockfile strictly (fails if lockfile is missing or out of sync)
# --no-dev: do not install development dependencies
# --no-install-project: do not install the current project as a package (since we just run app.py)
# If you don't have a lockfile yet, remove --frozen.
RUN uv sync --frozen --no-dev --no-install-project || uv sync --no-dev --no-install-project

# Stage 2: Final Runtime Stage
FROM python:3.13-slim

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv
COPY entrypoint.sh /app/entrypoint.sh
COPY alembic /app/alembic
COPY alembic.ini /app/alembic.ini

# Enable the virtual environment by adding it to the PATH
# This ensures all subsequent commands use the installed dependencies
ENV PATH="/app/.venv/bin:$PATH"

# Copy the application code
COPY kbalyzer /app/kbalyzer

EXPOSE 8000

CMD ["uvicorn", "kbalyzer.main:app", "--host", "0.0.0.0", "--port", "8000"]

ENTRYPOINT [ "/app/entrypoint.sh" ]
