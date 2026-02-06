# Database Persistence Implementation Guide

**Date**: February 5, 2026  
**Version**: 1.0  
**Author**: AI Assistant

## Overview

This document describes the implementation of database persistence for the Agent Orchestration Service using JPA, PostgreSQL, and MapStruct mapper library. The system was refactored from an in-memory HashMap-based storage to a production-ready persistent database solution.

---

## Table of Contents

1. [Changes Summary](#changes-summary)
2. [Architecture Overview](#architecture-overview)
3. [Components Created](#components-created)
4. [Dependencies Added](#dependencies-added)
5. [Database Schema](#database-schema)
6. [Code Changes](#code-changes)
7. [Migration Guide](#migration-guide)
8. [Testing](#testing)
9. [Best Practices](#best-practices)

---

## Changes Summary

### What Changed?

| Component | Before | After |
|-----------|--------|-------|
| Storage | In-memory HashMap | PostgreSQL database with JPA |
| Data Model | Task VO only | TaskEntity (JPA) + Task VO |
| Repository | Manual HashMap operations | Spring Data JPA Repository |
| Mapping | Manual conversion | MapStruct mapper |
| Persistence | Lost on restart | Permanent database storage |
| Transaction | None | Spring @Transactional |

### Benefits

✅ **Persistent Storage**: Data survives application restarts  
✅ **ACID Transactions**: Data integrity guaranteed  
✅ **Scalability**: Can handle large datasets efficiently  
✅ **Query Capabilities**: Rich querying through Spring Data JPA  
✅ **Audit Trail**: CreatedAt and UpdatedAt timestamps  
✅ **Type Safety**: Compile-time mapping with MapStruct  
✅ **Maintainability**: Separation of concerns (Entity vs VO)

---

## Architecture Overview

### Before: In-Memory Storage

```
┌─────────────────────────────────────┐
│  AgentOrchestrationService          │
│  ┌───────────────────────────────┐  │
│  │ HashMap<String, Task>         │  │
│  │ HashMap<String, List<Task>>   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Issues**:
- Data lost on restart
- No query capabilities
- No transaction support
- Not scalable

### After: Database Persistence

```
┌─────────────────────────────────────┐
│  AgentOrchestrationService          │
│  ┌───────────────────────────────┐  │
│  │ TaskRepository (JPA)          │  │
│  │ TaskMapper (MapStruct)        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Spring Data JPA                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  PostgreSQL Database                │
│  ┌───────────────────────────────┐  │
│  │ tasks table                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Benefits**:
- Persistent storage
- Rich querying
- ACID transactions
- Scalable

---

## Components Created

### 1. TaskEntity (JPA Entity)

**File**: `src/main/java/io/subbu/ai/pm/models/TaskEntity.java`

**Purpose**: JPA entity representing the Task table in PostgreSQL

**Key Features**:
- `@Entity` annotation for JPA mapping
- `@Table(name = "tasks")` for table name
- Lombok annotations for boilerplate reduction
- Audit fields (createdAt, updatedAt)
- Lifecycle callbacks (@PrePersist, @PreUpdate)

**Fields**:
```java
- id: String (Primary Key)
- projectId: String (Foreign Key concept)
- description: TEXT
- type: String
- status: String (default: "PENDING")
- result: TEXT
- assignedAgent: String
- createdAt: LocalDateTime (auto-set)
- updatedAt: LocalDateTime (auto-updated)
```

### 2. TaskRepository (Spring Data JPA)

**File**: `src/main/java/io/subbu/ai/pm/repos/TaskRepository.java`

**Purpose**: Data access layer for Task operations

**Methods**:
```java
// Inherited from JpaRepository
- save(TaskEntity)
- findById(String)
- findAll()
- delete(TaskEntity)
- count()

// Custom query methods
- findByProjectId(String): List<TaskEntity>
- findByStatus(String): List<TaskEntity>
- findByAssignedAgent(String): List<TaskEntity>
- findByProjectIdAndStatus(String, String): List<TaskEntity>
- countByProjectId(String): long
```

### 3. TaskMapper (MapStruct)

**File**: `src/main/java/io/subbu/ai/pm/mappers/TaskMapper.java`

**Purpose**: Bidirectional mapping between TaskEntity and Task VO

**Key Methods**:
```java
// Entity to VO
- Task toVO(TaskEntity entity)
- List<Task> toVOList(List<TaskEntity> entities)

// VO to Entity
- TaskEntity toEntity(Task vo, String projectId)
- void updateEntityFromVO(Task vo, @MappingTarget TaskEntity entity)
```

**Features**:
- `@Mapper(componentModel = "spring")` for Spring integration
- Compile-time code generation
- Type-safe mapping
- Null handling
- Ignore timestamp fields during updates

---

## Dependencies Added

### Maven Dependencies (pom.xml)

#### 1. MapStruct

```xml
<!-- Properties -->
<mapstruct.version>1.5.5.Final</mapstruct.version>

<!-- Dependency -->
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>${mapstruct.version}</version>
</dependency>
```

#### 2. Annotation Processors

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </path>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>${mapstruct.version}</version>
            </path>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok-mapstruct-binding</artifactId>
                <version>0.2.0</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

**Note**: `lombok-mapstruct-binding` ensures Lombok and MapStruct work together correctly.

---

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    result TEXT,
    assigned_agent VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent);
```

**Auto-generated by JPA**: When you run the application with `spring.jpa.hibernate.ddl-auto=update`, Hibernate will create/update the table automatically.

---

## Code Changes

### AgentOrchestrationService

#### Before: HashMap-based Storage

```java
@Service
public class AgentOrchestrationService {
    private final Map<String, Task> tasks;
    private final Map<String, List<Task>> projectTasks;
    
    public AgentOrchestrationService(...) {
        this.tasks = new HashMap<>();
        this.projectTasks = new HashMap<>();
    }
    
    public List<Task> processProjectRequest(...) {
        // Store in HashMap
        tasks.put(taskId, task);
        projectTasks.put(projectId, projectTaskList);
    }
}
```

#### After: JPA Repository

```java
@Service
@Transactional
public class AgentOrchestrationService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    
    public AgentOrchestrationService(..., 
                                     TaskRepository taskRepository,
                                     TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }
    
    public List<Task> processProjectRequest(...) {
        // Convert to entity and save
        TaskEntity entity = taskMapper.toEntity(task, projectId);
        TaskEntity savedEntity = taskRepository.save(entity);
        Task savedTask = taskMapper.toVO(savedEntity);
    }
}
```

### Key Method Changes

#### 1. processProjectRequest()

**Before**:
```java
tasks.put(taskId, task);
projectTasks.put(projectId, projectTaskList);
```

**After**:
```java
TaskEntity entity = taskMapper.toEntity(task, projectId);
TaskEntity savedEntity = taskRepository.save(entity);
Task savedTask = taskMapper.toVO(savedEntity);
```

#### 2. executeTask()

**Before**:
```java
Task task = tasks.get(taskId);
if (task == null) throw new IllegalArgumentException(...);
```

**After**:
```java
TaskEntity entity = taskRepository.findById(taskId)
        .orElseThrow(() -> new IllegalArgumentException(...));
Task task = taskMapper.toVO(entity);
```

#### 3. getProjectTasks()

**Before**:
```java
List<Task> projectTaskList = projectTasks.get(projectId);
if (projectTaskList == null) throw new IllegalArgumentException(...);
return new ArrayList<>(projectTaskList);
```

**After**:
```java
List<TaskEntity> entities = taskRepository.findByProjectId(projectId);
if (entities.isEmpty()) throw new IllegalArgumentException(...);
return taskMapper.toVOList(entities);
```

---

## Migration Guide

### Step 1: Backup Existing Data (If Any)

If you have existing data in memory, export it before migration:

```java
// Add temporary endpoint to export data
@GetMapping("/admin/export-tasks")
public Map<String, Object> exportTasks() {
    // Return all in-memory data as JSON
}
```

### Step 2: Update Dependencies

```bash
mvn clean install
```

This will:
- Download MapStruct
- Generate mapper implementations
- Compile all code

### Step 3: Database Setup

Ensure PostgreSQL is running:

```bash
docker-compose up -d
```

Verify connection in `application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/project-db
    username: superuser
    password: pa55ward
  jpa:
    hibernate:
      ddl-auto: update  # Creates/updates tables automatically
```

### Step 4: Run the Application

```bash
mvn spring-boot:run
```

Check logs for:
```
Hibernate: create table tasks (...)
```

### Step 5: Verify

Test the endpoints:

```bash
# Create a project
POST /api/projects
{
  "projectId": "test-project-1",
  "request": "Build a REST API"
}

# Get tasks
GET /api/projects/test-project-1/tasks
```

---

## Testing

### Unit Tests

Create tests for the new components:

```java
@DataJpaTest
class TaskRepositoryTest {
    @Autowired
    private TaskRepository repository;
    
    @Test
    void testFindByProjectId() {
        TaskEntity task = TaskEntity.builder()
            .id("task-1")
            .projectId("proj-1")
            .description("Test task")
            .status("PENDING")
            .build();
        repository.save(task);
        
        List<TaskEntity> tasks = repository.findByProjectId("proj-1");
        assertEquals(1, tasks.size());
    }
}
```

### Integration Tests

```java
@SpringBootTest
@Transactional
class AgentOrchestrationServiceTest {
    @Autowired
    private AgentOrchestrationService service;
    
    @Test
    void testProcessProjectRequest() {
        List<Task> tasks = service.processProjectRequest(
            "proj-1", 
            "Build a web app"
        );
        
        assertNotNull(tasks);
        assertTrue(tasks.size() > 0);
        
        // Verify persistence
        List<Task> retrieved = service.getProjectTasks("proj-1");
        assertEquals(tasks.size(), retrieved.size());
    }
}
```

---

## Best Practices

### 1. Transaction Management

Always use `@Transactional` for methods that modify data:

```java
@Transactional
public void updateTask(String taskId, String newStatus) {
    TaskEntity entity = taskRepository.findById(taskId)
        .orElseThrow(...);
    entity.setStatus(newStatus);
    taskRepository.save(entity);
}
```

### 2. Error Handling

Use proper exception handling:

```java
public Task getTask(String taskId) {
    TaskEntity entity = taskRepository.findById(taskId)
        .orElseThrow(() -> new TaskNotFoundException(taskId));
    return taskMapper.toVO(entity);
}
```

### 3. Pagination

For large datasets, use pagination:

```java
public interface TaskRepository extends JpaRepository<TaskEntity, String> {
    Page<TaskEntity> findByProjectId(String projectId, Pageable pageable);
}

// Usage
Pageable pageable = PageRequest.of(0, 20);
Page<TaskEntity> page = taskRepository.findByProjectId(projectId, pageable);
```

### 4. DTOs vs Entities

- **Never expose entities directly to API**
- Always use VOs/DTOs for API responses
- Entities are for database layer only

### 5. Mapping Performance

MapStruct generates efficient code at compile-time:
- No reflection
- Direct field access
- Optimal performance

---

## Troubleshooting

### MapStruct Mapper Not Found

**Error**: `Could not autowire. No beans of 'TaskMapper' type found.`

**Solution**: 
```bash
mvn clean compile
```

MapStruct generates implementation at compile-time.

### Table Not Created

**Error**: `Table "tasks" doesn't exist`

**Solution**: Check `application.yaml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # or create-drop for dev
    show-sql: true  # See SQL in logs
```

### Lombok + MapStruct Issues

**Error**: MapStruct can't find getters/setters

**Solution**: Ensure `lombok-mapstruct-binding` is in annotation processors:
```xml
<path>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok-mapstruct-binding</artifactId>
    <version>0.2.0</version>
</path>
```

---

## Performance Considerations

### 1. Lazy Loading

For future enhancements with relationships:
```java
@OneToMany(fetch = FetchType.LAZY)
private List<TaskEntity> subtasks;
```

### 2. Caching

Add caching for frequently accessed data:
```java
@Cacheable("tasks")
public Task getTask(String taskId) {
    // ...
}
```

### 3. Batch Operations

Use batch inserts for multiple tasks:
```java
List<TaskEntity> entities = tasks.stream()
    .map(task -> taskMapper.toEntity(task, projectId))
    .collect(Collectors.toList());
taskRepository.saveAll(entities);
```

---

## Future Enhancements

### 1. Add Projects Table

Create a proper Project entity:
```java
@Entity
@Table(name = "projects")
public class ProjectEntity {
    @Id
    private String id;
    
    @OneToMany(mappedBy = "project")
    private List<TaskEntity> tasks;
}
```

### 2. Add Audit Information

Use Spring Data JPA auditing:
```java
@EntityListeners(AuditingEntityListener.class)
@Entity
public class TaskEntity {
    @CreatedBy
    private String createdBy;
    
    @LastModifiedBy
    private String lastModifiedBy;
}
```

### 3. Add Soft Delete

Instead of hard delete:
```java
@Entity
@SQLDelete(sql = "UPDATE tasks SET deleted = true WHERE id=?")
@Where(clause = "deleted = false")
public class TaskEntity {
    private boolean deleted = false;
}
```

---

## Summary

### Files Created

1. ✅ `src/main/java/io/subbu/ai/pm/models/TaskEntity.java` - JPA Entity
2. ✅ `src/main/java/io/subbu/ai/pm/repos/TaskRepository.java` - JPA Repository
3. ✅ `src/main/java/io/subbu/ai/pm/mappers/TaskMapper.java` - MapStruct Mapper
4. ✅ `docs/DATABASE_PERSISTENCE_IMPLEMENTATION.md` - This documentation

### Files Modified

1. ✅ `pom.xml` - Added MapStruct dependencies
2. ✅ `src/main/java/io/subbu/ai/pm/services/AgentOrchestrationService.java` - Refactored to use JPA

### Status

✅ **All Changes Implemented Successfully**  
✅ **Code Compiles Without Errors**  
✅ **Ready for Testing**  
✅ **Production-Ready Architecture**

---

## References

- [Spring Data JPA Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [MapStruct Documentation](https://mapstruct.org/)
- [Lombok Documentation](https://projectlombok.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**End of Document**
