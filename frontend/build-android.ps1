$ErrorActionPreference = "Stop"
$env:GRADLE_USER_HOME = "E:\gradle"
$env:TEMP = "E:\temp"
$env:TMP = "E:\temp"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

New-Item -ItemType Directory -Path "E:\gradle", "E:\temp" -Force | Out-Null

Set-Location $PSScriptRoot\android
.\gradlew.bat app:assembleRelease -x lint -x test --no-build-cache -PreactNativeArchitectures=arm64-v8a @args

$builtApk = Get-ChildItem "$PSScriptRoot\android\app\build\outputs\apk\release" -Filter "*.apk" -Recurse | Select-Object -First 1
if (-not $builtApk) {
    $builtApk = Get-ChildItem "$PSScriptRoot\android\app\build\outputs\apk" -Filter "*.apk" -Recurse | Select-Object -First 1
}
if ($builtApk) {
    Copy-Item $builtApk.FullName "$PSScriptRoot\..\Kurnool-One.apk" -Force
    Write-Host "BUILD SUCCESS: Standalone APK generated at $PSScriptRoot\..\Kurnool-One.apk ($([math]::Round($builtApk.Length / 1MB, 2)) MB)" -ForegroundColor Green
}
