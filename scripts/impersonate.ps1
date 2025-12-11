# impersonate.ps1
# Impersonate roles locally via Supabase CLI for RLS testing
# Outputs sample JWT tokens with company_id and role claims
# References: I1.T5

param(
    [string]$Role = "staff",
    [string]$CompanyId = "11111111-1111-1111-1111-111111111111",
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\impersonate.ps1 [-Role <role>] [-CompanyId <uuid>] [-Help]"
    Write-Host "Roles: staff, manager, event_lead, owner"
    Write-Host "Outputs a sample JWT token for testing RLS policies"
    exit 0
}

# Validate role
$validRoles = @("staff", "manager", "event_lead", "owner")
if ($Role -notin $validRoles) {
    Write-Host "Invalid role. Valid roles: $($validRoles -join ', ')" -ForegroundColor Red
    exit 1
}

# Validate CompanyId format (basic UUID check)
if ($CompanyId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
    Write-Host "Invalid CompanyId format. Must be UUID." -ForegroundColor Red
    exit 1
}

# Generate a sample JWT payload (not cryptographically signed, for testing only)
$header = @{
    alg = "HS256"
    typ = "JWT"
} | ConvertTo-Json -Compress

$payload = @{
    company_id = $CompanyId
    role = $Role
    exp = [int](Get-Date -UFormat %s) + 3600  # Expires in 1 hour
    iat = [int](Get-Date -UFormat %s)
} | ConvertTo-Json -Compress

# Base64 encode (PowerShell compatible)
$headerEncoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($header)) -replace '\+', '-' -replace '/', '_' -replace '='
$payloadEncoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($payload)) -replace '\+', '-' -replace '/', '_' -replace '='

# Fake signature (not valid, for demo)
$signature = "fake_signature_for_testing_only"

$jwt = "$headerEncoded.$payloadEncoded.$signature"

Write-Host "Sample JWT Token for Role: $Role, CompanyId: $CompanyId"
Write-Host "Token: $jwt"
Write-Host ""
Write-Host "To use in testing:"
Write-Host "SET LOCAL jwt.claims.company_id = '$CompanyId';"
Write-Host "SET LOCAL jwt.claims.role = '$Role';"
Write-Host ""
Write-Host "Or set Authorization header: Bearer $jwt"

exit 0