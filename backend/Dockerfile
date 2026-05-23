# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install system utilities & postgresql-client
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Nuclei (Binary)
ENV NUCLEI_VERSION=v2.9.8
RUN curl -L "https://github.com/projectdiscovery/nuclei/releases/download/${NUCLEI_VERSION}/nuclei_2.9.8_linux_amd64.zip" -o nuclei.zip && \
    unzip nuclei.zip && \
    mv nuclei /usr/local/bin/ && \
    rm nuclei.zip

# Create non-root user
RUN adduser --disabled-password --gecos "" appuser

# Bake Nuclei Templates
RUN /usr/local/bin/nuclei -update-templates || true && \
    mkdir -p /home/appuser/nuclei-templates && \
    for p in /root/.nuclei-templates /root/.nuclei /root/.local/share/nuclei-templates /root/nuclei-templates; do \
        if [ -d "$p" ]; then \
            cp -r "$p"/* /home/appuser/nuclei-templates/ 2>/dev/null || true; \
        fi; \
    done && \
    chown -R appuser:appuser /home/appuser/nuclei-templates || true

# Copy built JAR from builder
COPY --from=builder /app/target/orchestrator-1.0.0.jar app.jar

# Copy Knowledge Base & Certs
COPY --chown=appuser:appuser knowledge-base /app/knowledge-base
COPY --chown=appuser:appuser certs /app/certs

# Create reports and project-docs directories and chown them to appuser
RUN mkdir -p /app/reports /app/project-docs && \
    chown -R appuser:appuser /app/reports /app/project-docs

# Switch to non-root user
USER appuser

# Expose API Port
EXPOSE 8000

# Start command
CMD ["java", "-jar", "app.jar"]
