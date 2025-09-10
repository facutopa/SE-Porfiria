#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏥 Configurando SE-Porfiria...\n');

// Verificar Node.js
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

if (parseInt(nodeVersion.slice(1).split('.')[0]) < 18) {
  console.error('❌ Se requiere Node.js 18 o superior');
  process.exit(1);
}

// Crear archivo .env si no existe
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creando archivo .env...');
  const envContent = `# Base de datos
DATABASE_URL="file:./dev.db"

# JWT Secret para autenticación
JWT_SECRET="${generateRandomString(32)}"

# Configuración de la aplicación
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generateRandomString(32)}"

# Configuración PWA
PWA_NAME="SE-Porfiria"
PWA_SHORT_NAME="SE-Porfiria"
PWA_DESCRIPTION="Sistema Experto para diagnóstico temprano de Porfiria"
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado');
} else {
  console.log('✅ Archivo .env ya existe');
}

// Instalar dependencias
console.log('\n📦 Instalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias:', error.message);
  process.exit(1);
}

// Generar cliente Prisma
console.log('\n🗄️ Configurando base de datos...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma generado');
} catch (error) {
  console.error('❌ Error generando cliente Prisma:', error.message);
  process.exit(1);
}

// Crear base de datos
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Base de datos creada');
} catch (error) {
  console.error('❌ Error creando base de datos:', error.message);
  process.exit(1);
}

console.log('\n🎉 ¡Configuración completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Ejecuta: npm run dev');
console.log('2. Abre: http://localhost:3000');
console.log('3. Regístrate como médico o personal CIPYP');
console.log('\n📚 Documentación: README.md');

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
