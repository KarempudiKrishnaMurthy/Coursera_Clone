# Multi-stage Dockerfile for CourseHub Backend
# Stage 1: Build the JAR
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper and POM
COPY pom.xml .
COPY src ./src

# Install Maven if needed or build directly
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

# Stage 2: Runtime Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
