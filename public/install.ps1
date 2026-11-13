# hanzo Windows installer (PowerShell)
#
#   irm https://hanzo.sh/install.ps1 | iex
#
# Downloads one prebuilt native binary per tool, verifies its SHA-256 checksum,
# installs into $HOME\.local\bin, and ensures it is on the User PATH.

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}

$HanzoDir = if ($env:HANZO_INSTALL_DIR) { $env:HANZO_INSTALL_DIR } else { Join-Path $HOME '.local\bin' }
$CliRepo  = if ($env:HANZO_CLI_REPO)    { $env:HANZO_CLI_REPO }    else { 'hanzoai/cli' }
$Quiet    = ($env:HANZO_QUIET -eq '1')

$Tools = @(
    @{ Name = 'hanzo';  Display = 'hanzo';        Repo = 'hanzoai/cli';    Bin = 'hanzo';        Alias = 'hanzo-cli' },
    @{ Name = 'node';   Display = 'hanzod';       Repo = 'hanzoai/node';   Bin = 'hanzod';       Alias = 'hanzo-node' },
    @{ Name = 'zt';     Display = 'hanzozt';      Repo = 'hanzozt/zt';     Bin = 'zt';           Alias = 'hanzozt' },
    @{ Name = 'gen';    Display = 'hanzo-gen';    Repo = 'hanzoai/gen';    Bin = 'gen';          Alias = 'hanzo-gen' },
    @{ Name = 'dev';    Display = 'hanzo-dev';    Repo = 'hanzoai/dev';    Bin = 'dev';          Alias = 'hanzo-dev' },
    @{ Name = 'engine'; Display = 'hanzo-engine'; Repo = 'hanzoai/engine'; Bin = 'hanzo-engine'; Alias = 'engine' },
    @{ Name = 'mcp';    Display = 'hanzo-mcp';    Repo = 'hanzoai/mcp';    Bin = 'hanzo-mcp';    Alias = 'mcp' },
    @{ Name = 'cloud';  Display = 'hanzo-cloud';  Repo = 'hanzoai/cloud';  Bin = 'hanzo-cloud';  Alias = 'cloud' }
)

if (-not $Quiet) {
    Write-Host @"
    __
   / /_  ____ _____  ____  ____
  / __ \/ __ `/ __ \/_  / / __ \
 / / / / /_/ / / / / / /_/ /_/ /
/_/ /_/\__,_/_/ /_/ /___/\____/
"@ -ForegroundColor DarkGray
}

$wantRaw = if ($args -and $args.Count -gt 0) { $args } elseif ($env:HANZO_TOOLS) { $env:HANZO_TOOLS -split '[,\s]+' | Where-Object { $_ } } else { @() }
$want = @($wantRaw | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ })

if (($want -contains 'dev' -or $want -contains 'hanzo-dev') -and ($want -notcontains 'mcp' -and $want -notcontains 'hanzo-mcp')) {
    $want += 'mcp'
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

$token = $env:HANZO_INSTALL_TOKEN
if (-not $token) { $token = $env:GH_TOKEN }
if (-not $token) { $token = $env:GITHUB_TOKEN }
$hdr = @{ 'User-Agent' = 'hanzo-sh/1.0' }
if ($token) { $hdr['Authorization'] = "Bearer $token" }

$tmp = Join-Path ([IO.Path]::GetTempPath()) ("hanzo-sh-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
New-Item -ItemType Directory -Force -Path $HanzoDir | Out-Null

$oneInstaller = Join-Path $tmp 'install.ps1'
try {
    $apiUrl = "https://api.github.com/repos/$CliRepo/contents/install.ps1?ref=main"
    $rawUrl = "https://raw.githubusercontent.com/$CliRepo/main/install.ps1"
    $fetched = $false
    try {
        $apiHdr = $hdr.Clone()
        $apiHdr['Accept'] = 'application/vnd.github.raw'
        Invoke-WebRequest -UseBasicParsing -Uri $apiUrl -Headers $apiHdr -OutFile $oneInstaller
        $fetched = (Test-Path $oneInstaller) -and ((Get-Item $oneInstaller).Length -gt 0)
    } catch { $fetched = $false }
    if (-not $fetched) {
        Invoke-WebRequest -UseBasicParsing -Uri $rawUrl -Headers @{ 'User-Agent' = 'hanzo-sh/1.0' } -OutFile $oneInstaller
    }
} catch {
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    throw "Failed to fetch installer from ${CliRepo}: $_"
}

$installed = @()
$failed    = @()

try {
    $selected = foreach ($t in $Tools) {
        if ($want.Count -eq 0 -or $want -contains 'all' -or $want -contains 'default' -or $want -contains 'full') {
            $t
        } elseif ($want -contains $t.Name -or $want -contains $t.Display -or $want -contains $t.Bin -or $want -contains $t.Alias -or ($t.Name -eq 'zt' -and ($want -contains 'hanzo-zt'))) {
            $t
        }
    }

    foreach ($t in $selected) {
        $env:HANZO_INSTALL_PREFIX = $HanzoDir
        $env:HANZO_INSTALL_REPO   = $t.Repo
        $env:HANZO_INSTALL_BIN    = $t.Bin
        $env:HANZO_INSTALL_ALIAS  = $t.Alias
        if ($t.Repo -ne $CliRepo) { Remove-Item env:HANZO_VERSION -ErrorAction SilentlyContinue }

        try {
            & powershell -NoProfile -ExecutionPolicy Bypass -File $oneInstaller | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "installer exited $LASTEXITCODE" }

            $exePath = Join-Path $HanzoDir "$($t.Bin).exe"
            if (-not (Test-Path $exePath)) { throw "missing $exePath" }

            if ($t.Bin -eq 'zt') {
                Copy-Item -Force $exePath (Join-Path $HanzoDir 'hanzo-zt.exe')
            }

            $ver = ''
            try {
                $vOut = & $exePath --version 2>$null | Select-Object -First 1
                if ($vOut -match 'v?(\d+\.\d+\.\d+)') { $ver = $Matches[1] }
            } catch {}
            if (-not $ver) { $ver = '?' }

            Write-Host "  + $($t.Display) $ver" -ForegroundColor Green
            $installed += $t.Display
        } catch {
            Write-Host "  x $($t.Display) ($_ )" -ForegroundColor Red
            $failed += $t.Display
        }
    }
} finally {
    Remove-Item env:HANZO_INSTALL_PREFIX, env:HANZO_INSTALL_REPO, env:HANZO_INSTALL_BIN, env:HANZO_INSTALL_ALIAS -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}

# Remove curl->Invoke-WebRequest alias confusion in PowerShell profiles only if absent? No, leave profile untouched;
# Add $HanzoDir to User PATH so future shells find hanzo directly.
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$parts = @()
if ($userPath) { $parts = $userPath -split ';' | Where-Object { $_ } }
if ($parts -notcontains $HanzoDir) {
    [Environment]::SetEnvironmentVariable('Path', ((@($HanzoDir) + $parts) -join ';'), 'User')
    Write-Host "`n  Added $HanzoDir to User PATH."
}
if (($env:Path -split ';') -notcontains $HanzoDir) {
    $env:Path = "$HanzoDir;$env:Path"
}

Write-Host ""
if ($installed.Count -eq 0) { throw "nothing was installed" }
Write-Host ("  Installed and available in {0}: {1}" -f $HanzoDir, ($installed -join ' '))
if ($failed.Count -gt 0) {
    Write-Host ("  incomplete - did not install: {0}" -f ($failed -join ' ')) -ForegroundColor Red
    exit 1
}
Write-Host "  ready -> $HanzoDir" -ForegroundColor Green
Write-Host ""
Write-Host "  quick start:"
Write-Host "    hanzo                # sign in, pick your coding agent, launch it"
Write-Host "    hanzo up             # run the cloud on this machine"
Write-Host "    hanzo --help         # every command"
Write-Host "    hanzo-mcp --help     # the MCP server"
Write-Host ""
