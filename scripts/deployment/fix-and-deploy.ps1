# Fix Production Error and Deploy
# Script para limpiar, rebuildar y desplegar

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Fix y Deploy de Produccion         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Limpiar cache
Write-Host "[PASO 1] Limpiando cache..." -ForegroundColor Yellow
if (Test-Path ".angular/cache") {
    Remove-Item -Recurse -Force ".angular/cache"
    Write-Host "[OK] Cache Angular limpiado" -ForegroundColor Green
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "[OK] Carpeta dist eliminada" -ForegroundColor Green
}
Write-Host ""

# PASO 2: Build de produccion
Write-Host "[PASO 2] Building produccion..." -ForegroundColor Yellow
Write-Host "Esto puede tomar 2-5 minutos..." -ForegroundColor Gray
Write-Host ""

npm run build:prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Build completado exitosamente" -ForegroundColor Green
    Write-Host ""

    # PASO 3: Verificar archivos
    Write-Host "[PASO 3] Verificando archivos..." -ForegroundColor Yellow
    if (Test-Path "dist/fuse/index.html") {
        $fileCount = (Get-ChildItem "dist/fuse" -Recurse -File | Measure-Object).Count
        $buildSize = (Get-ChildItem "dist/fuse" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

        Write-Host "[OK] Archivos generados: $fileCount" -ForegroundColor Green
        Write-Host "[OK] Tamano total: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Green
        Write-Host ""

        # PASO 4: Preguntar si desplegar
        Write-Host "[PASO 4] Listo para desplegar" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Opciones:" -ForegroundColor Cyan
        Write-Host "1. Deploy a Digital Ocean (157.245.226.11)" -ForegroundColor White
        Write-Host "2. Deploy a Firebase Hosting" -ForegroundColor White
        Write-Host "3. Solo testing local (http-server)" -ForegroundColor White
        Write-Host "4. Salir" -ForegroundColor White
        Write-Host ""

        $opcion = Read-Host "Selecciona una opcion (1-4)"

        switch ($opcion) {
            "1" {
                Write-Host ""
                Write-Host "Desplegando a Digital Ocean..." -ForegroundColor Cyan
                npm run deploy:do
            }
            "2" {
                Write-Host ""
                Write-Host "Desplegando a Firebase..." -ForegroundColor Cyan
                firebase deploy --only hosting
            }
            "3" {
                Write-Host ""
                Write-Host "Iniciando servidor local..." -ForegroundColor Cyan
                Write-Host "URL: http://localhost:8080" -ForegroundColor Green
                Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Gray
                Write-Host ""
                cd dist/fuse
                npx http-server -p 8080
            }
            "4" {
                Write-Host "Saliendo..." -ForegroundColor Gray
            }
            default {
                Write-Host "Opcion invalida" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "[ERROR] No se encontro index.html en dist/fuse/" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "[ERROR] Build fallo" -ForegroundColor Red
    Write-Host "Revisa los errores arriba" -ForegroundColor Red
}

Write-Host ""
