#!/usr/bin/env pwsh
# Database Migration Script
# Fixes foreign key constraint issue by creating missing projects

Write-Host "🔧 Database Migration Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "pa55ward"
$dbName = "project-db"
$username = "superuser"
$host = "localhost"
$port = "5432"

Write-Host "📊 Database Info:" -ForegroundColor Yellow
Write-Host "   Host: $host" -ForegroundColor Gray
Write-Host "   Database: $dbName" -ForegroundColor Gray
Write-Host "   User: $username" -ForegroundColor Gray
Write-Host ""

# SQL script to migrate data
$migrationSQL = @"
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

-- Verify migration
SELECT COUNT(*) as orphaned_tasks
FROM tasks t
WHERE NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = t.project_id
);
"@

Write-Host "🚀 Running migration..." -ForegroundColor Yellow

try {
    # Execute the migration
    $migrationSQL | psql -h $host -p $port -U $username -d $dbName -v ON_ERROR_STOP=1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Summary:" -ForegroundColor Yellow

        # Get count of projects created
        $countSQL = "SELECT COUNT(*) as project_count FROM projects;"
        $projectCount = $countSQL | psql -h $host -p $port -U $username -d $dbName -t -A

        Write-Host "   Projects created: $projectCount" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Restart your Spring Boot application" -ForegroundColor Gray
        Write-Host "   2. The foreign key constraint should now succeed" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD
}
"@
