param([switch]$FromClipboard, [switch]$FromStdin)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -Force
$secretDirectory = Join-Path $env:LOCALAPPDATA 'DexterPortfolioChat'
$secretPath = Join-Path $secretDirectory 'openai-key.dpapi'
New-Item -ItemType Directory -Path $secretDirectory -Force | Out-Null
$accountSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
& icacls.exe $secretDirectory /inheritance:r /grant:r "*$($accountSid):(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not restrict the local secrets directory.' }
if ($FromClipboard -or $FromStdin) {
  $plainKey = if ($FromStdin) { [Console]::In.ReadToEnd() } else { Get-Clipboard -Raw }
  if (-not $plainKey -or -not $plainKey.Trim().StartsWith('sk-')) { throw 'The clipboard does not contain an OpenAI key. Nothing was saved.' }
  $secureKey = ConvertTo-SecureString $plainKey.Trim() -AsPlainText -Force
  $plainKey = $null
} else {
  $secureKey = Read-Host 'Paste the OpenAI project key (masked; never paste it into chat)' -AsSecureString
}
$secureKey | ConvertFrom-SecureString | Set-Content -LiteralPath $secretPath -Encoding utf8 -NoNewline
if ($FromClipboard) { Set-Clipboard -Value '' }
Write-Output 'OpenAI project key saved with Windows user-bound DPAPI encryption and restricted file access. Key value was not printed.'
