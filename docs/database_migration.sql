-- Database Migration Script for Project Entity
-- Run this SQL to fix foreign key constraint issue
-- Database: project-db
-- User: superuser

-- Step 1: Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Step 2: Create projects from existing distinct project_ids in tasks table
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

-- Step 3: Verify data integrity
-- This should return 0 if migration is successful
SELECT COUNT(*) as orphaned_tasks
FROM tasks t
WHERE NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = t.project_id
);

-- Step 4: Show created projects
SELECT id, title, created_at
FROM projects
ORDER BY created_at DESC;

