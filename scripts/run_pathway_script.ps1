# scripts/run_pathway_script.ps1

$sqlFile = "d:\dev\sees-ui\scripts\populate_pathway_preferences.sql"
$container = "sees-postgres"
$user = "sees_user"
$db = "sees_db"

Write-Host "Running pathway preference population script..." -ForegroundColor Cyan

if (Test-Path $sqlFile) {
    Get-Content $sqlFile | docker exec -i $container psql -U $user -d $db
} else {
    Write-Error "SQL file not found at $sqlFile"
}

Write-Host "Done." -ForegroundColor Green
