# ---------- BUILD STAGE ----------
# Use Maven + JDK to build the application
FROM maven:3.9.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first (better caching)
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build jar file
RUN mvn clean package -DskipTests




# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:17-jdk-jammy

# Working directory
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/onedeoleela-0.0.1-SNAPSHOT.jar .

# Expose Spring Boot port
EXPOSE 8080

# Run application
ENTRYPOINT ["java","-jar","onedeoleela-0.0.1-SNAPSHOT.jar"]