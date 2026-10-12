param([switch]$ForLocalLauncher)
$ErrorActionPreference = 'Stop'
if (-not $ForLocalLauncher) { throw 'Internal helper. Start the assistant with npm run chat:openai.' }
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -Force
$secretPath = Join-Path $env:LOCALAPPDATA 'DexterPortfolioChat\openai-key.dpapi'
if (-not (Test-Path -LiteralPath $secretPath)) { throw 'Run scripts/set-openai-key.ps1 first.' }
$secureKey = Get-Content -LiteralPath $secretPath -Raw | ConvertTo-SecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
