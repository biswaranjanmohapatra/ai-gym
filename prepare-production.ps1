# Production Preparation Script for evo-fitness-planner

Write-Host "--- Switching to PRODUCTION (PostgreSQL) Mode ---" -ForegroundColor Yellow

# 1. Update schema.prisma for PostgreSQL
$schemaPath = "backend/prisma/schema.prisma"
(Get-Content $schemaPath) -replace 'provider = "sqlite"', 'provider = "postgresql"' | Set-Content $schemaPath
(Get-Content $schemaPath) -replace '@default\(cuid\(\)\)', '@default(uuid())' | Set-Content $schemaPath

# 2. Update .env for Production reference (Vercel uses its own variables, but this keeps local logs clean)
$envContent = "DATABASE_URL=`"postgresql://neondb_owner:npg_UG4HoQgDAX9e@ep-purple-lab-a4gydfgm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`"`nJWT_SECRET=`"supersecret123456789`"`nPORT=5000"
Set-Content -Path "backend/.env" -Value $envContent

cd backend
npx prisma generate
cd ..

Write-Host "--- SUCCESS! ---" -ForegroundColor Green
Write-Host "You can now safely run: git add . ; git commit -m 'Commit message' ; git push" -ForegroundColor Cyan
