param(
    [Parameter(Mandatory = $true)]
    [string]$ParentDomain,
    [string]$ProductSubdomain = "foody",
    [string]$AdminUser = "admin"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$examplePath = Join-Path $root ".env.example"

if (-not (Test-Path $examplePath)) {
    throw ".env.example not found at $examplePath"
}

if (-not (Test-Path $envPath)) {
    Copy-Item $examplePath $envPath
}

function Set-KeyValue {
    param(
        [string]$Content,
        [string]$Key,
        [string]$Value
    )

    $escaped = [Regex]::Escape($Key)
    if ($Content -match "(?m)^$escaped=") {
        return [Regex]::Replace($Content, "(?m)^$escaped=.*$", { param($match) "$Key=$Value" })
    }

    return ($Content.TrimEnd() + "`r`n$Key=$Value`r`n")
}

function New-RandomPassword {
    $chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@%*?"
    -join (1..24 | ForEach-Object { $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)] })
}

$productDomain = "$ProductSubdomain.$ParentDomain"
$adminDomain = "admin.$productDomain"

$content = Get-Content $envPath -Raw
$passwordMatch = [regex]::Match($content, "(?m)^ADMIN_PASS=(.*)$")
$existingPassword = if ($passwordMatch.Success) { $passwordMatch.Groups[1].Value } else { "" }
if (-not $existingPassword -or $existingPassword -eq "change-me-now") {
    $existingPassword = New-RandomPassword
}

$content = Set-KeyValue -Content $content -Key "PRODUCT_DOMAIN" -Value $productDomain
$content = Set-KeyValue -Content $content -Key "ADMIN_DOMAIN" -Value $adminDomain
$content = Set-KeyValue -Content $content -Key "ADMIN_USER" -Value $AdminUser
$content = Set-KeyValue -Content $content -Key "ADMIN_PASS" -Value $existingPassword
$content = Set-KeyValue -Content $content -Key "COOKIE_SECURE" -Value "false"

Set-Content -Path $envPath -Value $content -Encoding ascii

Write-Host "Updated $envPath"
Write-Host "PRODUCT_DOMAIN=$productDomain"
Write-Host "ADMIN_DOMAIN=$adminDomain"
Write-Host "ADMIN_USER=$AdminUser"
Write-Host "ADMIN_PASS=$existingPassword"
