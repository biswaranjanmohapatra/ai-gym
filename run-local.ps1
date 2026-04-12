# Local Development Script for evo-fitness-planner

Write-Host "--- Switching to LOCAL (SQLite) Mode ---" -ForegroundColor Cyan

# 1. Update .env for SQLite
$envContent = "DATABASE_URL=`"file:C:/Users/biswa/OneDrive/Desktop/evo-fitness-planner/backend/prisma/dev.db`"`nJWT_SECRET=`"supersecret123456789`"`nPORT=5000"
Set-Content -Path "backend/.env" -Value $envContent

# 2. Update schema.prisma for SQLite
$schemaPath = "backend/prisma/schema.prisma"
(Get-Content $schemaPath) -replace 'provider = "postgresql"', 'provider = "sqlite"' | Set-Content $schemaPath
(Get-Content $schemaPath) -replace '@default\(uuid\(\)\)', '@default(cuid())' | Set-Content $schemaPath

# 3. Clean up Vercel locks if any
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 4. Generate & Push
cd backend
Write-Host "Syncing SQLite database..."
npx prisma generate
npx prisma db push --accept-data-loss
npx tsx prisma/seed.ts

Write-Host "--- READY! Starting local servers... ---" -ForegroundColor Green
cd ..
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
npm run dev
