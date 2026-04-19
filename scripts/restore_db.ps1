# PowerShell script to start Docker Compose and restore PostgreSQL database from dump on Windows

# Stop on any error
$ErrorActionPreference = "Stop"

# Load .env variables if file exists
$envFile = Join-Path -Path (Get-Location) -ChildPath ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
        $pair = $_ -split '=', 2
        if ($pair.Count -eq 2) {
            $name = $pair[0].Trim()
            $value = $pair[1].Trim(' "')
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Define PostgreSQL credentials with defaults if not set in .env
$pgUser = $env:POSTGRES_USER
if (-not $pgUser) { $pgUser = 'sees_user' }
$pgPassword = $env:POSTGRES_PASSWORD
if (-not $pgPassword) { $pgPassword = 'sees_password' }
$pgDb = $env:POSTGRES_DB
if (-not $pgDb) { $pgDb = 'sees_db' }

Write-Host "Starting Docker Compose services..."
# Bring up services (uses Docker Compose V2 syntax)
docker compose up -d

# Container name (as defined in docker-compose.yml)
$containerName = "sees-postgres"

# Wait for PostgreSQL to be ready inside the container
function Wait-ForPostgres {
    param(
        [int]$maxAttempts = 30,
        [int]$delaySec = 2
    )
    Write-Host "Waiting for PostgreSQL inside container $containerName..."
    for ($i = 1; $i -le $maxAttempts; $i++) {
        $ready = docker exec $containerName pg_isready -U $pgUser | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PostgreSQL is ready."
            return
        }
        Start-Sleep -Seconds $delaySec
    }
    Throw "PostgreSQL did not become ready in time."
}

Wait-ForPostgres

# Path to dump file (relative to project root)
$dumpFile = Join-Path -Path (Get-Location) -ChildPath "backups\sees_db_complete.dump"
if (-not (Test-Path $dumpFile)) {
    Throw "Dump file not found at $dumpFile"
}

Write-Host "Copying dump file into container..."
# Copy dump into container's /tmp directory
docker cp "$dumpFile" "${containerName}:/tmp/sees_db.dump"

Write-Host "Restoring database inside container..."
# Run pg_restore inside the container
docker exec -e PGPASSWORD=$pgPassword $containerName pg_restore -U $pgUser -d $pgDb -Fc /tmp/sees_db.dump

Write-Host "Database restoration complete."
