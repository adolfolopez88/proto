# Rebuild Limpio para Fix de Error
# Script ultra-agresivo para solucionar el error de addEventListener

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Rebuild Limpio - Fix addEventListener" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar TODO
Write-Host "[1/4] Limpiando cache y builds..." -ForegroundColor Yellow

$cleanPaths = @(".angular/cache", "dist", "node_modules/.cache")

foreach ($path in $cleanPaths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path
        Write-Host "  [OK] $path eliminado" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] $path no existe" -ForegroundColor Gray
    }
}

Write-Host ""

# Paso 2: Verificar cambios en archivos clave
Write-Host "[2/4] Verificando archivos corregidos..." -ForegroundColor Yellow

$mainTs = Get-Content "src/main.ts" -Raw
$polyfillsTs = Get-Content "src/polyfills.ts" -Raw

if ($mainTs -match "document.readyState") {
    Write-Host "  [OK] main.ts tiene fix de DOM" -ForegroundColor Green
} else {
    Write-Host "  [WARN] main.ts podria necesitar actualizacion" -ForegroundColor Red
}

if ($polyfillsTs -match "addEventListener") {
    Write-Host "  [OK] polyfills.ts tiene fix" -ForegroundColor Green
} else {
    Write-Host "  [WARN] polyfills.ts podria necesitar actualizacion" -ForegroundColor Red
}

Write-Host ""

# Paso 3: Build de produccion
Write-Host "[3/4] Building produccion (con buildOptimizer=false)..." -ForegroundColor Yellow
Write-Host "Esto puede tomar 2-5 minutos..." -ForegroundColor Gray
Write-Host ""

npm run build:prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Build completado" -ForegroundColor Green
    Write-Host ""

    # Paso 4: Verificar archivos generados
    Write-Host "[4/4] Verificando archivos generados..." -ForegroundColor Yellow

    if (Test-Path "dist/fuse/index.html") {
        $files = Get-ChildItem "dist/fuse" -Recurse -File
        $jsFiles = $files | Where-Object { $_.Extension -eq ".js" }
        $totalSize = ($files | Measure-Object -Property Length -Sum).Sum / 1MB

        Write-Host "  [OK] index.html existe" -ForegroundColor Green
        Write-Host "  [OK] $($jsFiles.Count) archivos JS generados" -ForegroundColor Green
        Write-Host "  [OK] Tamano total: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green

        # Buscar addEventListener en los bundles
        Write-Host ""
        Write-Host "  Verificando addEventListener en bundles..." -ForegroundColor Gray

        $found = $false
        foreach ($jsFile in $jsFiles | Select-Object -First 3) {
            $content = Get-Content $jsFile.FullName -Raw
            if ($content -match "addEventListener") {
                Write-Host "    [OK] Encontrado en $($jsFile.Name)" -ForegroundColor Green
                $found = $true
                break
            }
        }

        if (-not $found) {
            Write-Host "    [WARN] addEventListener no encontrado en bundles principales" -ForegroundColor Yellow
            Write-Host "    Esto podria indicar que fue eliminado por el optimizer" -ForegroundColor Yellow
        }

        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   BUILD COMPLETADO                    " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""

        # Opciones
        Write-Host "Opciones:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Testing local primero (RECOMENDADO)" -ForegroundColor White
        Write-Host "   cd dist/fuse" -ForegroundColor Gray
        Write-Host "   npx http-server -p 8080" -ForegroundColor Gray
        Write-Host "   Luego abre: http://localhost:8080" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Deploy directo a Digital Ocean" -ForegroundColor White
        Write-Host "   npm run deploy:do" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Deploy a Firebase" -ForegroundColor White
        Write-Host "   firebase deploy --only hosting" -ForegroundColor Gray
        Write-Host ""

        $choice = Read-Host "Selecciona una opcion (1-3, o Enter para salir)"

        switch ($choice) {
            "1" {
                Write-Host ""
                Write-Host "Iniciando servidor local..." -ForegroundColor Cyan
                Write-Host "Abre http://localhost:8080 en tu navegador" -ForegroundColor Green
                Write-Host "Presiona F12 y verifica que NO haya errores en Console" -ForegroundColor Yellow
                Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
                Write-Host ""
                Set-Location dist/fuse
                npx http-server -p 8080
            }
            "2" {
                Write-Host ""
                Write-Host "Desplegando a Digital Ocean..." -ForegroundColor Cyan
                npm run deploy:do
            }
            "3" {
                Write-Host ""
                Write-Host "Desplegando a Firebase..." -ForegroundColor Cyan
                firebase deploy --only hosting
            }
            default {
                Write-Host ""
                Write-Host "Para desplegar mas tarde, ejecuta:" -ForegroundColor Gray
                Write-Host "  npm run deploy:do" -ForegroundColor White
                Write-Host ""
            }
        }

    } else {
        Write-Host "[ERROR] index.html no encontrado en dist/fuse/" -ForegroundColor Red
        Write-Host "El build no genero los archivos esperados" -ForegroundColor Red
    }

} else {
    Write-Host ""
    Write-Host "[ERROR] Build fallo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "  - Errores de TypeScript en el codigo" -ForegroundColor White
    Write-Host "  - Dependencias faltantes" -ForegroundColor White
    Write-Host "  - Problemas de memoria" -ForegroundColor White
    Write-Host ""
    Write-Host "Intenta:" -ForegroundColor Yellow
    Write-Host "  npm install" -ForegroundColor White
    Write-Host "  npm run build:prod" -ForegroundColor White
}

Write-Host ""
