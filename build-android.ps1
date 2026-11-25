param(
    [Parameter(Mandatory)][string]$SdkRoot,
    [Parameter(Mandatory)][string]$OutputApk,
    [string]$BuildToolsVersion = '34.0.0'
)

$ErrorActionPreference = 'Stop'
$projectPath = $PSScriptRoot
$buildPath = if ($env:TOY_CLAW_BUILD_DIR) {$env:TOY_CLAW_BUILD_DIR} else {[IO.Path]::GetFullPath((Join-Path $projectPath '../../99_Temp/toy-claw-park/build'))}
$javaClasses = Join-Path $buildPath 'classes'
$dexPath = Join-Path $buildPath 'dex'
$buildTools = Join-Path $SdkRoot "build-tools/$BuildToolsVersion"
$platformJar = Join-Path $SdkRoot 'platforms/android-34/android.jar'
$androidProject = Join-Path $projectPath 'android'
$assets = Join-Path $buildPath 'assets'
$resources = Join-Path $buildPath 'resources.zip'
$unpacked = Join-Path $buildPath 'unsigned.apk'
$aligned = Join-Path $buildPath 'aligned.apk'
$signingDir = if ($env:TOY_CLAW_SIGNING_DIR) {$env:TOY_CLAW_SIGNING_DIR} else {[IO.Path]::GetFullPath((Join-Path $projectPath '../../30_Assets/toy-claw-park/local-signing'))}
$signingKey = Join-Path $signingDir 'pad-game.p12'
$apkPath = [IO.Path]::GetFullPath($OutputApk)

function Invoke-BuildTool([string]$tool, [string[]]$arguments) {
    & $tool @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$([IO.Path]::GetFileName($tool)) failed with code $LASTEXITCODE"
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $assets 'index.html'))) {
    throw 'Run bundle.mjs before building the APK.'
}
New-Item -ItemType Directory -Force -Path $javaClasses,$dexPath,([IO.Path]::GetDirectoryName($apkPath)) | Out-Null
$aapt = Join-Path $buildTools 'aapt2.exe'
Invoke-BuildTool $aapt @('compile', '--dir', (Join-Path $androidProject 'res'), '-o', $resources)
Invoke-BuildTool $aapt @('link', '-I', $platformJar, '--manifest', (Join-Path $androidProject 'AndroidManifest.xml'), '-o', $unpacked, $resources)

$javaFiles = Get-ChildItem -LiteralPath (Join-Path $androidProject 'src') -Filter '*.java' -Recurse | ForEach-Object FullName
Invoke-BuildTool (Join-Path $env:JAVA_HOME 'bin/javac.exe') (@('-encoding', 'UTF-8', '--release', '8', '-classpath', $platformJar, '-d', $javaClasses) + $javaFiles)
$classFiles = Get-ChildItem -LiteralPath $javaClasses -Filter '*.class' -Recurse | ForEach-Object FullName
Invoke-BuildTool (Join-Path $buildTools 'd8.bat') (@('--lib', $platformJar, '--min-api', '26', '--output', $dexPath) + $classFiles)
# AAPT2 34 on Windows writes backslashes inside nested -A asset names.
# The JDK jar tool emits the forward slashes Android AssetManager requires.
$jar = Join-Path $env:JAVA_HOME 'bin/jar.exe'
Invoke-BuildTool $jar @('uf', $unpacked, '-C', $dexPath, 'classes.dex', '-C', $buildPath, 'assets')
$entries = & $jar tf $unpacked
if ($LASTEXITCODE -ne 0 -or ($entries -match '\\') -or $entries -notcontains 'assets/media/park-logo.webp') {
    throw 'Invalid Android asset paths in package.'
}
Invoke-BuildTool (Join-Path $buildTools 'zipalign.exe') @('-f', '4', $unpacked, $aligned)

if (-not (Test-Path -LiteralPath $signingKey)) { throw 'Original local signing identity is required for tablet updates.' }
$locked = Get-Content -Raw -LiteralPath (Join-Path $signingDir 'password.dpapi') | ConvertTo-SecureString
$env:TOY_CLAW_LOCAL_PASS = [Net.NetworkCredential]::new('', $locked).Password
try {
    Invoke-BuildTool (Join-Path $buildTools 'apksigner.bat') @('sign','--v4-signing-enabled','false','--ks',$signingKey,'--ks-pass','env:TOY_CLAW_LOCAL_PASS','--key-pass','env:TOY_CLAW_LOCAL_PASS','--out',$apkPath,$aligned)
} finally {
    Remove-Item Env:TOY_CLAW_LOCAL_PASS -ErrorAction SilentlyContinue
}
Invoke-BuildTool (Join-Path $buildTools 'apksigner.bat') @('verify', '--verbose', $apkPath)
Invoke-BuildTool (Join-Path $buildTools 'zipalign.exe') @('-c', '4', $apkPath)
Write-Output $apkPath
