# Script para desplegar frontend en AWS S3
# Uso: .\deploy-s3.ps1

Write-Host "🚀 Desplegando SGIB Frontend a AWS S3..." -ForegroundColor Cyan

# Configuración
$BUCKET_NAME = "sgib-web-frontend"
$REGION = "us-east-1"

# 1. Build del proyecto
Write-Host "`n📦 Construyendo proyecto..." -ForegroundColor Yellow
Set-Location client
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# 2. Sincronizar con S3
Write-Host "`n☁️  Subiendo archivos a S3..." -ForegroundColor Yellow
aws s3 sync dist/ s3://$BUCKET_NAME --delete --region $REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir a S3" -ForegroundColor Red
    exit 1
}

# 3. Invalidar cache de CloudFront (opcional, si usas CloudFront)
# $DISTRIBUTION_ID = "TU_DISTRIBUTION_ID"
# Write-Host "`n🔄 Invalidando cache de CloudFront..." -ForegroundColor Yellow
# aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

Write-Host "`n✅ Deploy completado exitosamente!" -ForegroundColor Green
Write-Host "🌐 URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com" -ForegroundColor Cyan

Set-Location ..
