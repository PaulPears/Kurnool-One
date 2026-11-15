$ErrorActionPreference = "Stop"
$env:JAVA_HOME = "F:\Pears_Important\.gradle\jdks\eclipse_adoptium-17-amd64-windows.2"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$sdkManager = "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "Running sdkmanager..."
echo y | & $sdkManager "platforms;android-36" "build-tools;36.0.0"
Write-Host "Finished sdkmanager."

