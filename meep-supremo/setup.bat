@echo off
echo 🚀 MEEP SUPREMO - Setup Completo Automatico
echo ==========================================

cd /d "%~dp0"

echo 📦 1. Instalando dependencias do projeto principal...
call npm install

echo 📦 2. Instalando dependencias do frontend...
cd frontend
call npm install

echo 📦 3. Instalando dependencias do backend...
cd ..\backend
call npm install

echo 🔧 4. Configurando banco de dados...
call npx prisma generate
call npx prisma migrate dev --name init
call npx prisma db seed

echo 🔄 5. Buildando o frontend...
cd ..\frontend
call npm run build

echo 🔄 6. Buildando o backend...
cd ..\backend
call npm run build

echo ✅ Setup completo! O MEEP Supremo esta pronto!
echo.
echo 🎯 Para executar em desenvolvimento:
echo    npm run dev          # Frontend + Backend
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    Health:   http://localhost:8000/health
echo.
echo 🔑 Login padrao:
echo    Email: admin@meep-supremo.com
echo    Senha: admin123
echo.
echo 🚀 PRONTO PARA COMEÇAR OS TRABALHOS!
pause
