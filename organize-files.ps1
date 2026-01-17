# Script to organize project files into proper directory structure

$baseDir = "C:\Proyectos\mcp\Proto"
Set-Location $baseDir

# Create directory structure
$directories = @(
    "docs\firebase",
    "docs\deployment",
    "docs\docker",
    "docs\general",
    "scripts\deployment",
    "scripts\diagnostics",
    "scripts\docker"
)

Write-Host "Creating directory structure..." -ForegroundColor Green
foreach ($dir in $directories) {
    $fullPath = Join-Path $baseDir $dir
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Cyan
    }
}

# Move Firebase documentation
Write-Host "`nMoving Firebase documentation..." -ForegroundColor Green
$firebaseDocs = @(
    "FIREBASE_INTEGRATION.md",
    "FIREBASE_COMPATIBILITY_FIX.md",
    "FIREBASE-FIXES.md",
    "FIREBASE-VERSION-FIX.md",
    "FIREBASE-INJECTION-FIX.md",
    "INSTALL_FIREBASE_CLI.md"
)
foreach ($file in $firebaseDocs) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\firebase\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Yellow
    }
}

# Move Deployment documentation
Write-Host "`nMoving Deployment documentation..." -ForegroundColor Green
$deploymentDocs = @(
    "DEPLOY.md",
    "DEPLOY_MANUAL.md",
    "DEPLOY_DIGITAL_OCEAN.md",
    "DEPLOY_QUICKSTART.md",
    "DEPLOY_PASSWORD_SSH.md",
    "QUICK_DEPLOY_PASSWORD.md",
    "DEPLOY_EASYPANEL.md",
    "SOLUCION_NO_ACCESO.md",
    "FIX_PRODUCTION_ERROR.md",
    "SOLUCION_ERROR_PERSISTENTE.md",
    "SOLUCION_ERROR_DEPLOY.md",
    "README_DEPLOY.md",
    "EASYPANEL_PORT_CONFIG.md",
    "ERRORES_CORREGIDOS.md"
)
foreach ($file in $deploymentDocs) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\deployment\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Yellow
    }
}

# Move Docker documentation
Write-Host "`nMoving Docker documentation..." -ForegroundColor Green
$dockerDocs = @(
    "DOCKER_DEPLOY.md",
    "DEPLOY_DOCKER_GUIDE.md",
    "DOCKER_VERSIONS.md"
)
foreach ($file in $dockerDocs) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\docker\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Yellow
    }
}

# Move General documentation
Write-Host "`nMoving General documentation..." -ForegroundColor Green
$generalDocs = @(
    "Super_Claude_Docs.md",
    "conversation.txt",
    "instrucciones.md",
    "bitacora.txt"
)
foreach ($file in $generalDocs) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\general\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Yellow
    }
}

# Move Deployment scripts
Write-Host "`nMoving Deployment scripts..." -ForegroundColor Green
$deploymentScripts = @(
    "deploy-do.ps1",
    "deploy-do.sh",
    "deploy-manual.ps1",
    "deploy-docker.ps1",
    "deploy-docker.sh",
    "deploy-docker-simple.ps1",
    "fix-and-deploy.ps1"
)
foreach ($file in $deploymentScripts) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts\deployment\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Yellow
    }
}

# Move Diagnostic scripts
Write-Host "`nMoving Diagnostic scripts..." -ForegroundColor Green
$diagnosticScripts = @(
    "diagnostico-droplet.ps1",
    "diagnostico-deploy.ps1",
    "test-ssh-commands.ps1",
    "verify-docker.ps1"
)
foreach ($file in $diagnosticScripts) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts\diagnostics\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Yellow
    }
}

# Move Docker scripts
Write-Host "`nMoving Docker scripts..." -ForegroundColor Green
$dockerScripts = @(
    "rebuild-clean.ps1",
    "fix-port-80.sh"
)
foreach ($file in $dockerScripts) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts\docker\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Organization Complete ===" -ForegroundColor Green
Write-Host "`nVerifying organization..." -ForegroundColor Green

# Count files in each directory
Write-Host "`nFiles per directory:"
foreach ($dir in $directories) {
    $count = (Get-ChildItem -Path $dir -File).Count
    Write-Host "  $dir : $count files" -ForegroundColor Cyan
}

Write-Host "`nDone!" -ForegroundColor Green
