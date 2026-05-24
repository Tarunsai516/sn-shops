# ===== Stage 1: Build =====
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===== Stage 2: Run =====
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/target/sn-shops-backend-1.0.0.jar app.jar

RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
