# PostgreSQL Timezone Fix - Complete Solution

## Problem Summary
The Spring Boot application was failing to connect to PostgreSQL with the error:
```
FATAL: invalid value for parameter "TimeZone": "Asia/Calcutta"
```

## Root Cause
1. **Obsolete Timezone**: Windows system timezone was set to "Asia/Calcutta" (obsolete identifier)
2. **PostgreSQL Requirement**: PostgreSQL only accepts IANA timezone database identifiers
3. **Modern Identifier**: "Asia/Calcutta" was renamed to "Asia/Kolkata" in the IANA database
4. **PostgreSQL Rejection**: PostgreSQL rejects the obsolete identifier

## Solutions Applied

### 1. Application Code Changes
**File**: `src/main/java/io/subbu/ai/pm/SpringBootProjectManagerApplication.java`

Added JVM-level timezone setting before Spring Boot initialization:
```java
public static void main(String[] args) {
    // Set default timezone to UTC to avoid timezone issues with PostgreSQL
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    SpringApplication.run(SpringBootProjectManagerApplication.class, args);
}
```

**Benefits**:
- Sets timezone at JVM level before any database connections
- Ensures all Java date/time operations use UTC
- Prevents timezone-related bugs

### 2. Application Configuration Changes
**File**: `src/main/resources/application.yaml`

#### a) Hibernate JPA Properties
```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          time_zone: UTC
```

#### b) JDBC URL Parameter
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/project-db?serverTimezone=UTC
```

#### c) HikariCP Connection Initialization
```yaml
spring:
  datasource:
    hikari:
      connection-init-sql: SET TIME ZONE 'UTC'
```

**Benefits**:
- Triple-layer protection against timezone issues
- Ensures all database connections use UTC
- Consistent timezone across all database operations

### 3. Docker Compose Changes
**File**: `compose.yaml`

Added PostgreSQL timezone environment variables:
```yaml
services:
  postgres:
    environment:
      - 'TZ=UTC'
      - 'PGTZ=UTC'
```

**Benefits**:
- Sets PostgreSQL server timezone to UTC
- Ensures consistency between application and database
- Prevents timezone conversion issues

## Why UTC?
1. **Universal Standard**: No daylight saving time complications
2. **Database Best Practice**: Industry standard for backend systems
3. **No Ambiguity**: Avoids timezone conversion errors
4. **Cross-Platform**: Works consistently across all operating systems
5. **International Support**: Simplifies multi-region deployments

## Testing the Fix

### 1. Clean Start
```powershell
# Stop and remove existing containers and volumes
docker-compose down -v

# Clean and rebuild the application
mvn clean compile

# Start the application
mvn spring-boot:run
```

### 2. Verify Success
The application should start without timezone errors. Look for:
- ✅ No "FATAL: invalid value for parameter TimeZone" errors
- ✅ Successful PostgreSQL connection
- ✅ Hibernate initialization complete
- ✅ Application running on http://localhost:8080

## Alternative Solutions (If Issues Persist)

### Option A: Change System Timezone
If you prefer using local timezone:
```powershell
# Run as Administrator
Set-TimeZone -Id "India Standard Time"
```

Then update configuration to use:
```yaml
hibernate:
  jdbc:
    time_zone: Asia/Kolkata  # Modern IANA identifier
```

### Option B: JVM Arguments
Add to Maven configuration in `pom.xml`:
```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration>
    <jvmArguments>-Duser.timezone=UTC</jvmArguments>
  </configuration>
</plugin>
```

## Files Modified
1. ✅ `src/main/java/io/subbu/ai/pm/SpringBootProjectManagerApplication.java`
2. ✅ `src/main/resources/application.yaml`
3. ✅ `compose.yaml`

## Verification Checklist
- [x] JVM timezone set to UTC in main class
- [x] Hibernate JDBC timezone configured
- [x] JDBC URL includes serverTimezone parameter
- [x] HikariCP connection initialization sets timezone
- [x] PostgreSQL container timezone environment variables set
- [x] Docker containers and volumes cleaned
- [x] Application compiled successfully

## Next Steps
1. Start the application using `mvn spring-boot:run` or `start.bat`
2. Verify no timezone errors in console output
3. Check database connectivity
4. Test application functionality

## Support
If issues persist:
1. Check PostgreSQL logs: `docker-compose logs postgres`
2. Verify PostgreSQL is running: `docker ps`
3. Check application logs for other errors
4. Ensure no firewall blocking port 5432

## References
- PostgreSQL Timezone Documentation: https://www.postgresql.org/docs/current/datetime-config-files.html
- Hibernate Timezone Configuration: https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html
- Spring Boot Data Access: https://docs.spring.io/spring-boot/docs/current/reference/html/data.html
