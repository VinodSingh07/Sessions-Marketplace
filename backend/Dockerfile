FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for psycopg2 and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

EXPOSE 8000

# Default command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
