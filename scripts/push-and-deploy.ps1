param(
    [string]$Branch = "main",
    [string]$Remote = "origin",
    [string]$CommitMessage = "",
    [string]$WebhookUrl = "",
    [string]$ApiToken = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Assert-LastExitCode {
    param([string]$Step)

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

Push-Location $root
try {
    git status --short --branch
    Assert-LastExitCode -Step "git status"

    git add -A
    Assert-LastExitCode -Step "git add"

    $hasChanges = $false
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 1) {
        $hasChanges = $true
    }
    elseif ($LASTEXITCODE -ne 0) {
        throw "git diff --cached failed with exit code $LASTEXITCODE"
    }

    if ($hasChanges) {
        if (-not $CommitMessage) {
            $CommitMessage = "Prepare deployment " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
        git commit -m $CommitMessage
        Assert-LastExitCode -Step "git commit"
    }

    git push $Remote $Branch
    Assert-LastExitCode -Step "git push"

    if (-not $WebhookUrl) {
        $WebhookUrl = $env:COOLIFY_WEBHOOK_PROD
    }

    if (-not $ApiToken) {
        $ApiToken = $env:COOLIFY_TOKEN_PROD
    }

    if ($WebhookUrl -and $ApiToken) {
        Invoke-WebRequest -Method Get -Uri $WebhookUrl -Headers @{ Authorization = "Bearer $ApiToken" } | Out-Null
        Write-Host "Coolify deployment triggered."
    }
    else {
        Write-Host "Push completed. GitHub Actions can trigger deployment if repository secrets are configured."
    }
}
finally {
    Pop-Location
}
