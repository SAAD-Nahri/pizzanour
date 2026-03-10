param(
    [string]$ComposeFile = "docker-compose.yml"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$composePath = Join-Path $root $ComposeFile
$envPath = Join-Path $root ".env"

function Assert-LastExitCode {
    param([string]$Step)

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

if (-not (Test-Path $composePath)) {
    throw "Compose file not found: $composePath"
}

if (-not (Test-Path $envPath)) {
    throw ".env not found. Run scripts/setup-env.ps1 first."
}

function Get-EnvValue {
    param([string]$Key, [string]$DefaultValue)

    $line = Select-String -Path $envPath -Pattern "^$Key=(.*)$" | Select-Object -First 1
    if (-not $line) {
        return $DefaultValue
    }
    return $line.Matches[0].Groups[1].Value
}

$websitePort = Get-EnvValue -Key "WEBSITE_PORT" -DefaultValue "3002"
$adminPort = Get-EnvValue -Key "ADMIN_PORT" -DefaultValue "3102"

Push-Location $root
try {
    docker compose -f $composePath up -d --build
    Assert-LastExitCode -Step "docker compose up"

    docker compose -f $composePath ps
    Assert-LastExitCode -Step "docker compose ps"

    Write-Host "Waiting for services to respond..."
    Start-Sleep -Seconds 5

    $websiteResponse = Invoke-WebRequest -Uri "http://127.0.0.1:$websitePort/health" -UseBasicParsing
    $adminResponse = Invoke-WebRequest -Uri "http://127.0.0.1:$adminPort/health" -UseBasicParsing

    if ($websiteResponse.StatusCode -ne 200) {
        throw "Website health check returned $($websiteResponse.StatusCode)"
    }

    if ($adminResponse.StatusCode -ne 200) {
        throw "Admin health check returned $($adminResponse.StatusCode)"
    }

    Write-Host "Website: http://127.0.0.1:$websitePort"
    Write-Host "Admin: http://127.0.0.1:$adminPort/admin"
    Write-Host "Local deployment checks passed."
}
finally {
    Pop-Location
}
