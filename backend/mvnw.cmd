@ECHO OFF
SETLOCAL

set MAVEN_PROJECTBASEDIR=%~dp0
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

set WRAPPER_DIR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_PROPERTIES=%WRAPPER_DIR%\maven-wrapper.properties

if not exist "%WRAPPER_PROPERTIES%" (
  echo [ERROR] %WRAPPER_PROPERTIES% not found.
  exit /b 1
)

if not exist "%WRAPPER_JAR%" (
  echo Downloading Maven wrapper jar...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$props = Get-Content '%WRAPPER_PROPERTIES%' | Where-Object { $_ -match '^wrapperUrl=' }; " ^
    "$url = ($props -replace '^wrapperUrl=', '').Trim(); " ^
    "if (-not $url) { throw 'wrapperUrl not found in maven-wrapper.properties' }; " ^
    "New-Item -ItemType Directory -Force -Path '%WRAPPER_DIR%' | Out-Null; " ^
    "Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile '%WRAPPER_JAR%'"
  if errorlevel 1 (
    echo [ERROR] Failed to download maven-wrapper.jar
    exit /b 1
  )
)

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] JAVA is not installed or not in PATH.
  exit /b 1
)

set MAVEN_CMD_LINE_ARGS=%*

"%JAVA_EXE%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  -classpath "%WRAPPER_JAR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %MAVEN_CMD_LINE_ARGS%

ENDLOCAL
