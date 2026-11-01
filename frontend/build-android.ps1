$ErrorActionPreference = "Stop"

if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $candidates = @(
        "F:\Pears_Important\.gradle\jdks\eclipse_adoptium-17-amd64-windows.2",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Java\jdk-17*"
    )
    foreach ($cand in $candidates) {
        $resolved = Get-Item $cand -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved -and (Test-Path "$($resolved.FullName)\bin\java.exe")) {
            $env:JAVA_HOME = $resolved.FullName
            break
        }
    }
}
if ($env:JAVA_HOME) {
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
    Write-Host "Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
}

if (Test-Path "F:\gradle") {
    $env:GRADLE_USER_HOME = "F:\gradle"
    $env:TEMP = "$env:LOCALAPPDATA\Temp"
    $env:TMP = "$env:LOCALAPPDATA\Temp"
} else {
    $env:GRADLE_USER_HOME = "E:\gradle"
    $env:TEMP = "$env:LOCALAPPDATA\Temp"
    $env:TMP = "$env:LOCALAPPDATA\Temp"
    New-Item -ItemType Directory -Path "E:\gradle" -Force | Out-Null
}

$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
Write-Host "Using ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Cyan

# Clean stale build and autolinking caches
if (Test-Path "$PSScriptRoot\android\build") {
    Remove-Item -Recurse -Force "$PSScriptRoot\android\build" -ErrorAction SilentlyContinue
}
if (Test-Path "$PSScriptRoot\android\app\build") {
    Remove-Item -Recurse -Force "$PSScriptRoot\android\app\build" -ErrorAction SilentlyContinue
}

Set-Location $PSScriptRoot\android
.\gradlew.bat app:assembleRelease -x lint -x test --no-build-cache -PreactNativeArchitectures=arm64-v8a @args

if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed with exit code $LASTEXITCODE"
}

$builtApk = Get-ChildItem "$PSScriptRoot\android\app\build\outputs\apk\release" -Filter "*.apk" -Recurse | Select-Object -First 1
if (-not $builtApk) {
    $builtApk = Get-ChildItem "$PSScriptRoot\android\app\build\outputs\apk" -Filter "*.apk" -Recurse | Select-Object -First 1
}
if ($builtApk) {
    Copy-Item $builtApk.FullName "$PSScriptRoot\..\Kurnool-One.apk" -Force
    Write-Host "BUILD SUCCESS: Standalone APK generated at $PSScriptRoot\..\Kurnool-One.apk ($([math]::Round($builtApk.Length / 1MB, 2)) MB)" -ForegroundColor Green
} else {
    Write-Error "No APK found in build outputs directory."
}
