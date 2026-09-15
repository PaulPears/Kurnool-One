$ErrorActionPreference = "Stop"
$env:GRADLE_USER_HOME = "E:\gradle"
$env:TEMP = "E:\temp"
$env:TMP = "E:\temp"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

New-Item -ItemType Directory -Path "E:\gradle", "E:\temp" -Force | Out-Null

Set-Location $PSScriptRoot\android
.\gradlew.bat app:assembleDebug -x lint -x test --no-build-cache -PreactNativeArchitectures=arm64-v8a @args
