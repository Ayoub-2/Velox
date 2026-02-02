# Base Image: Python 3.10 Slim
FROM python:3.10-slim

# Proxy ARGs (Passed from docker-compose)
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

# Set Environment Variables for Build
ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY
ENV NO_PROXY=$NO_PROXY
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Working Directory
WORKDIR /app

# System Dependencies (including offline debug tools)
# curl, iputils-ping: Connectivity debugging
# postgresql-client: For offline DB access (psql, pg_dump)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    iputils-ping \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Nuclei (Binary)
ENV NUCLEI_VERSION=v2.9.8
RUN curl -L "https://github.com/projectdiscovery/nuclei/releases/download/${NUCLEI_VERSION}/nuclei_2.9.8_linux_amd64.zip" -o nuclei.zip && \
    apt-get update && apt-get install -y unzip && \
    unzip nuclei.zip && \
    mv nuclei /usr/local/bin/ && \
    rm nuclei.zip

# Bake Nuclei Templates (Offline support)
# We run this during build so the container has them pre-installed.
RUN nuclei -update-templates

# Install Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Copy Application Code
COPY . .

# Expose API Port
EXPOSE 8000

# Start Command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
