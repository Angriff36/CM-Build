# sync_secrets.ps1

param(
  [string]$Config = "dev",
  [string]$Project = "ck-dev",
  [switch]$Validate
)

# Colored output functions
function Write-Green { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Red { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Yellow { param($Message) Write-Host $Message -ForegroundColor Yellow }

# Required secrets
$requiredSecrets = @("SUPABASE_URL", "SUPABASE_ANON_KEY", "FLAGS_API_KEY")

# Map config to project
$projectMap = @{
  "dev" = "ck-dev"
  "stg" = "ck-stg"
  "prod" = "ck-prod"
}

if (-not $projectMap.ContainsKey($Config)) {
  Write-Red "Error: Invalid config '$Config'. Must be one of: dev, stg, prod"
  exit 1
}

$ActualProject = $projectMap[$Config]

if (-not (Get-Command doppler -ErrorAction SilentlyContinue)) {
  Write-Red "Error: Doppler CLI not installed. Please install it first."
  exit 1
}

if ($Validate) {
  Write-Green "Validating secrets for config: $Config (project: $ActualProject)"
  try {
    $secrets = doppler secrets download --project $ActualProject --config $Config --format json | ConvertFrom-Json
    $missing = @()
    foreach ($secret in $requiredSecrets) {
      if (-not $secrets.PSObject.Properties.Name.Contains($secret)) {
        $missing += $secret
      }
    }
    if ($missing.Count -gt 0) {
      Write-Red "Missing required secrets: $($missing -join ', ')"
      exit 1
    }
    Write-Green "All required secrets present."
    
    # Validate Doppler template
    Write-Green "Validating Doppler template..."
    doppler secrets substitute configs/doppler.env.template --project $ActualProject --config $Config --output /tmp/template_test.env
    if ($LASTEXITCODE -eq 0) {
      Write-Green "Doppler template validation successful."
      Remove-Item /tmp/template_test.env -ErrorAction SilentlyContinue
    } else {
      Write-Red "Doppler template validation failed."
      exit 1
    }
  } catch {
    Write-Red "Failed to validate secrets. Check your Doppler access."
    exit 1
  }
} else {
  Write-Green "Syncing secrets for config: $Config"

  try {
    # Use Doppler template to generate .env file
    doppler secrets substitute configs/doppler.env.template --project $ActualProject --config $Config --output .env
    if ($LASTEXITCODE -eq 0) {
      Write-Green "Secrets synced successfully to .env using template."
    } else {
      # Fallback to direct download
      Write-Yellow "Template failed, falling back to direct download..."
      doppler secrets download --config $Config --format env > .env
      Write-Green "Secrets synced successfully to .env"
    }
  } catch {
    Write-Red "Failed to sync secrets. Check your Doppler access."
    exit 1
  }
}