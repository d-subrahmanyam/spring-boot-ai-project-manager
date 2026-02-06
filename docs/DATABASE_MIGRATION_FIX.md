# Database Migration Fix - Quick Guide

## Problem

You have existing `tasks` in the database from before the Project entity was created. When Hibernate tries to add the foreign key constraint, it fails because those tasks reference non-existent projects.

**Error**: 
```
Key (project_id)=(25aea98f-fb86-40ba-8163-084cb55f3f8c) is not present in table "projects"
```

---

## Solutions

### Option 1: Quick Fix - Drop and Recreate (Development Only)

**Use this if you don't need the existing data**

1. Connect to PostgreSQL:
   ```bash
   psql -U postgres -d your_database_name
   ```

2. Drop the tables:
   ```sql
   DROP TABLE IF EXISTS tasks CASCADE;
   DROP TABLE IF EXISTS projects CASCADE;
   ```

3. Restart your Spring Boot application
   - Hibernate will recreate the tables with proper schema

---

### Option 2: Migrate Existing Data (Recommended)

**Use this if you want to keep existing tasks**

1. Stop your Spring Boot application

2. Connect to PostgreSQL:
   ```bash
   psql -U postgres -d your_database_name
   ```

3. Create projects from existing tasks:
   ```sql
   -- Create the projects table if it doesn't exist yet
   CREATE TABLE IF NOT EXISTS projects (
       id VARCHAR(36) PRIMARY KEY,
       title VARCHAR(500) NOT NULL,
       created_at TIMESTAMP NOT NULL,
       updated_at TIMESTAMP NOT NULL
   );
   
   -- Insert projects for all distinct project_ids from tasks
   INSERT INTO projects (id, title, created_at, updated_at)
   SELECT DISTINCT 
       project_id,
       'Migrated Project',
       NOW(),
       NOW()
   FROM tasks
   WHERE NOT EXISTS (
       SELECT 1 FROM projects WHERE id = tasks.project_id
   );
   ```

4. Verify the migration:
   ```sql
   -- Check if all tasks now have a corresponding project
   SELECT COUNT(*) as orphaned_tasks
   FROM tasks t
   WHERE NOT EXISTS (
       SELECT 1 FROM projects p WHERE p.id = t.project_id
   );
   ```
   
   Should return `0` orphaned tasks.

5. Restart your Spring Boot application

---

### Option 3: Use Hibernate Auto-Create (Fresh Start)

**Easiest option - loses all data**

1. Update `application.yaml`:
   ```yaml
   spring:
     jpa:
       hibernate:
         ddl-auto: create  # Change from 'update' to 'create'
   ```

2. Restart application (tables will be recreated)

3. **Important**: Change back to `update` after first run:
   ```yaml
   spring:
     jpa:
       hibernate:
         ddl-auto: update  # Restore to 'update'
   ```

---

## Verification

After applying the fix, verify everything works:

1. Start the application - should start without errors

2. Check the logs for:
   ```
   Hibernate: create table projects (...)
   Hibernate: alter table if exists tasks add constraint ...
   ```
   
   Should complete without errors

3. Test creating a new project via API:
   ```bash
   curl -X POST "http://localhost:8080/api/agent/projects?projectRequest=Test+Project"
   ```

4. Verify in database:
   ```sql
   SELECT * FROM projects;
   SELECT * FROM tasks;
   ```

---

## Understanding the Error

### What Happened

1. **Before**: Tasks had `project_id` as just a `VARCHAR` column with no foreign key
2. **After**: Tasks have `project_id` as a **foreign key** to the `projects` table
3. **Problem**: Your old tasks have `project_id` values that don't exist in `projects` table

### Why Foreign Key Failed

```sql
-- Hibernate tries to create foreign key constraint
ALTER TABLE tasks 
ADD CONSTRAINT fk_task_project 
FOREIGN KEY (project_id) REFERENCES projects(id);

-- But tasks table has:
project_id = '25aea98f-fb86-40ba-8163-084cb55f3f8c'

-- And projects table is empty or doesn't have that ID
-- Result: FOREIGN KEY CONSTRAINT VIOLATION ❌
```

### The Fix

```sql
-- First, create the missing project
INSERT INTO projects (id, title, created_at, updated_at)
VALUES ('25aea98f-fb86-40ba-8163-084cb55f3f8c', 
        'Migrated Project', 
        NOW(), 
        NOW());

-- Now the foreign key can be created ✅
```

---

## Recommended Approach for Your Situation

Based on the error, I recommend **Option 2** (Migrate Existing Data):

### Steps:

1. **Stop Spring Boot application**

2. **Run this SQL** (connect with `psql` or any PostgreSQL client):

```sql
-- Ensure projects table exists
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create projects from existing tasks
INSERT INTO projects (id, title, created_at, updated_at)
SELECT DISTINCT 
    project_id,
    COALESCE(
        'Project: ' || LEFT(MIN(description), 40) || '...',
        'Migrated Project'
    ) as title,
    NOW(),
    NOW()
FROM tasks
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE id = tasks.project_id
)
GROUP BY project_id;

-- Verify (should return 0)
SELECT COUNT(*) as orphaned_tasks
FROM tasks t
WHERE NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = t.project_id
);
```

3. **Restart Spring Boot application**

4. **Verify** - check logs for successful startup

---

## Prevention for Future

To avoid this issue in production:

1. **Use Flyway or Liquibase** for database migrations
   ```xml
   <dependency>
       <groupId>org.flywaydb</groupId>
       <artifactId>flyway-core</artifactId>
   </dependency>
   ```

2. **Test migrations on copy of production data**

3. **Use `validate` in production**:
   ```yaml
   spring:
     jpa:
       hibernate:
         ddl-auto: validate  # Only validate, don't modify schema
   ```

4. **Version control your schema changes**

---

## Quick Command Reference

### Connect to PostgreSQL
```bash
psql -U postgres -d spring_boot_pm
```

### List tables
```sql
\dt
```

### Describe table structure
```sql
\d projects
\d tasks
```

### Count records
```sql
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM tasks;
```

### Exit psql
```
\q
```

---

## After Migration

Once the migration is complete, your data will look like:

**projects table**:
```
id                                   | title                     | created_at          | updated_at
-------------------------------------|---------------------------|---------------------|-------------------
25aea98f-fb86-40ba-8163-084cb55f3f8c | Migrated Project          | 2026-02-05 11:45:00 | 2026-02-05 11:45:00
```

**tasks table** (unchanged, but now with valid foreign key):
```
id    | project_id                           | description           | ...
------|--------------------------------------|----------------------|-----
...   | 25aea98f-fb86-40ba-8163-084cb55f3f8c | Setup database...    | ...
```

The foreign key constraint will now work because the project exists! ✅

---

**Status**: Choose an option above and apply the fix. Option 2 is recommended if you want to keep existing data.
