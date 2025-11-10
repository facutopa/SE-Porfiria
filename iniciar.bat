@echo off
setlocal enabledelayedexpansion

echo.
echo ==============================================
echo   SE-Porfiria - Sistema Experto de Diagnóstico
echo ==============================================
echo.

:: Verificar si Node.js está instalado
echo Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo.
    echo Por favor, instala Node.js 18 o superior desde:
    echo https://nodejs.org/
    echo.
    echo Después de instalar Node.js, ejecuta este script nuevamente.
    pause
    exit /b 1
)

:: Verificar versión de Node.js
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js instalado: %NODE_VERSION%

:: Extraer número de versión mayor
for /f "tokens=1 delims=v." %%a in ("%NODE_VERSION%") do set MAJOR_VERSION=%%a
if %MAJOR_VERSION% lss 18 (
    echo [ERROR] Se requiere Node.js versión 18 o superior.
    echo Versión actual: %NODE_VERSION%
    echo.
    echo Por favor, actualiza Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar si npm está instalado
echo Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta instalado.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm instalado: %NPM_VERSION%
echo.

:: Verificar si node_modules existe
if not exist "node_modules" (
    echo [INFO] node_modules no encontrado. Instalando dependencias...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Error al instalar dependencias.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas correctamente.
    echo.
) else (
    echo [OK] Dependencias ya instaladas.
    echo.
)

:: Verificar si Prisma está configurado
echo Verificando configuracion de Prisma...
if not exist "prisma\dev.db" (
    echo [INFO] Base de datos no encontrada. Configurando Prisma...
    echo.
    
    :: Generar cliente de Prisma
    echo Generando cliente de Prisma...
    call npx prisma generate
    if %errorlevel% neq 0 (
        echo [ERROR] Error al generar cliente de Prisma.
        pause
        exit /b 1
    )
    
    :: Aplicar migraciones y cargar datos iniciales
    echo Aplicando migraciones y cargando datos iniciales...
    call npx prisma migrate reset --force
    if %errorlevel% neq 0 (
        echo [ERROR] Error al aplicar migraciones.
        pause
        exit /b 1
    )
    
    echo.
    echo [OK] Base de datos configurada correctamente.
    echo.
) else (
    :: Verificar si el cliente de Prisma está generado
    if not exist "node_modules\.prisma" (
        echo [INFO] Generando cliente de Prisma...
        call npx prisma generate
        if %errorlevel% neq 0 (
            echo [ERROR] Error al generar cliente de Prisma.
            pause
            exit /b 1
        )
    )
    echo [OK] Base de datos ya configurada.
    echo.
)

:: Todo listo, iniciar la aplicación
echo ==============================================
echo   Todo esta listo. Iniciando aplicacion...
echo ==============================================
echo.
echo La aplicacion estara disponible en: http://localhost:3000
echo Credenciales por defecto:
echo   Email: doctor@example.com
echo   Clave: demo123
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.

:: Iniciar el servidor de desarrollo
call npm run dev

pause

