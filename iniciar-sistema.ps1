# Sistema SE-Porfiria - Iniciador (PowerShell)
# Encoding: UTF-8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema SE-Porfiria - Iniciador" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Node.js 18+ desde https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "[OK] Java instalado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Java no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Java 11+ desde https://adoptium.net/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar Maven
try {
    $mvnVersion = mvn --version 2>&1 | Select-Object -First 1
    Write-Host "[OK] Maven instalado: $mvnVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Maven no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Maven 3.6+ desde https://maven.apache.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Obtener directorio del script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ========================================
# FRONTEND - SE-Porfiria
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurando Frontend (SE-Porfiria)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location $scriptDir

if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al instalar dependencias del frontend" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host "[OK] Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencias del frontend ya están instaladas" -ForegroundColor Green
}

if (-not (Test-Path "prisma\dev.db")) {
    Write-Host "[INFO] Configurando base de datos..." -ForegroundColor Yellow
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al generar cliente de Prisma" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    npx prisma migrate reset --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al configurar base de datos" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host "[OK] Base de datos configurada" -ForegroundColor Green
} else {
    Write-Host "[INFO] Generando cliente de Prisma..." -ForegroundColor Yellow
    npx prisma generate
    Write-Host "[OK] Base de datos lista" -ForegroundColor Green
}

Write-Host ""

# ========================================
# BACKEND - kie-server
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurando Backend (kie-server)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$kieServerDir = Join-Path $scriptDir "kie-server"
Set-Location $kieServerDir

if (-not (Test-Path "target")) {
    Write-Host "[INFO] Compilando proyecto backend..." -ForegroundColor Yellow
    mvn clean compile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al compilar el backend" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host "[OK] Backend compilado" -ForegroundColor Green
} else {
    Write-Host "[OK] Backend ya está compilado" -ForegroundColor Green
}

Write-Host ""

# ========================================
# INICIAR SERVICIOS
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Servicios" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Se abrirán dos ventanas:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Presiona Ctrl+C en cada ventana para detener los servicios" -ForegroundColor Yellow
Write-Host ""

# Iniciar backend en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$kieServerDir'; Write-Host 'SE-Porfiria - Backend (kie-server)' -ForegroundColor Cyan; mvn spring-boot:run"

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar frontend en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; Write-Host 'SE-Porfiria - Frontend' -ForegroundColor Cyan; npm run dev"

# Esperar a que el frontend esté listo y abrir en el navegador
Write-Host "[INFO] Esperando a que el frontend esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
Write-Host "[INFO] Abriendo navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "[OK] Servicios iniciados en ventanas separadas" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema iniciado correctamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:8080/api/porfiria/health" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales por defecto:" -ForegroundColor Yellow
Write-Host "  Email: doctor@example.com" -ForegroundColor White
Write-Host "  Contraseña: demo123" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para cerrar esta ventana"

