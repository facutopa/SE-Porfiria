@echo off
chcp 65001 >nul
echo ========================================
echo   Sistema SE-Porfiria - Iniciador
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no está instalado o no está en el PATH
    echo Por favor instala Node.js 18+ desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar Java
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java no está instalado o no está en el PATH
    echo Por favor instala Java 11+ desde https://adoptium.net/
    pause
    exit /b 1
)

REM Verificar Maven
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven no está instalado o no está en el PATH
    echo Por favor instala Maven 3.6+ desde https://maven.apache.org/
    pause
    exit /b 1
)

echo [OK] Todas las herramientas necesarias están instaladas
echo.

REM ========================================
REM FRONTEND - SE-Porfiria
REM ========================================
echo ========================================
echo   Configurando Frontend (SE-Porfiria)
echo ========================================
cd /d "%~dp0"

if not exist "node_modules" (
    echo [INFO] Instalando dependencias del frontend...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al instalar dependencias del frontend
        pause
        exit /b 1
    )
    echo [OK] Dependencias del frontend instaladas
) else (
    echo [OK] Dependencias del frontend ya están instaladas
)

if not exist "prisma\dev.db" (
    echo [INFO] Configurando base de datos...
    call npx prisma generate
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al generar cliente de Prisma
        pause
        exit /b 1
    )
    call npx prisma migrate reset --force
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al configurar base de datos
        pause
        exit /b 1
    )
    echo [OK] Base de datos configurada
) else (
    echo [INFO] Generando cliente de Prisma...
    call npx prisma generate
    echo [OK] Base de datos lista
)

echo.

REM ========================================
REM BACKEND - kie-server
REM ========================================
echo ========================================
echo   Configurando Backend (kie-server)
echo ========================================
cd /d "%~dp0kie-server"

if not exist "target" (
    echo [INFO] Compilando proyecto backend...
    call mvn clean compile
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al compilar el backend
        pause
        exit /b 1
    )
    echo [OK] Backend compilado
) else (
    echo [OK] Backend ya está compilado
)

echo.

REM ========================================
REM INICIAR SERVICIOS
REM ========================================
echo ========================================
echo   Iniciando Servicios
echo ========================================
echo.
echo [INFO] Se abrirán dos ventanas:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:8080
echo.
echo [INFO] Presiona Ctrl+C en cada ventana para detener los servicios
echo.

REM Iniciar backend en nueva ventana
start "SE-Porfiria - Backend (kie-server)" cmd /k "cd /d %~dp0kie-server && mvn spring-boot:run"

REM Esperar un poco para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar frontend en nueva ventana
start "SE-Porfiria - Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Esperar a que el frontend esté listo y abrir en el navegador
echo [INFO] Esperando a que el frontend esté listo...
timeout /t 8 /nobreak >nul
echo [INFO] Abriendo navegador...
start http://localhost:3000

echo.
echo [OK] Servicios iniciados en ventanas separadas
echo.
echo ========================================
echo   Sistema iniciado correctamente
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080/api/porfiria/health
echo.
echo Credenciales por defecto:
echo   Email: doctor@example.com
echo   Contraseña: demo123
echo.
pause

