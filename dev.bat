@echo off
echo Instalando dependencias...
cd Server && npm install
cd ../Client && npm install
cd ..

echo Iniciando desenvolvimento...
npm run dev
