#!/bin/bash

# 🚀 Script Simplu pentru Deployment LuxBID
# Acest script face totul automat - doar rulează-l!

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 LuxBID - Deployment Automat${NC}"
echo "=================================="

# Verifică dacă suntem în directorul corect
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Nu sunt în directorul corect. Navighez la luxbid...${NC}"
    cd luxbid
fi

# Verifică dacă Git este configurat
if ! git config --get user.name > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Git nu este configurat. Configurez...${NC}"
    git config --global user.name "LuxBID Deploy"
    git config --global user.email "deploy@luxbid.com"
fi

# Verifică dacă Vercel CLI este instalat
if ! command -v npx vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI nu este găsit. Instalez...${NC}"
    npm install -g vercel
fi

# Commit toate schimbările
echo -e "${BLUE}📝 Commit toate schimbările...${NC}"
git add .
git commit -m "🚀 Deployment automat - $(date)" || true

# Verifică dacă există un proiect Vercel
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${BLUE}🔧 Configurare proiect Vercel...${NC}"
    echo -e "${YELLOW}📋 Următorii pași:${NC}"
    echo "1. Deschide https://vercel.com"
    echo "2. Creează un cont (dacă nu ai)"
    echo "3. Click 'New Project'"
    echo "4. Importă din GitHub: $(git remote get-url origin 2>/dev/null || echo 'your-repo-url')"
    echo "5. Configurează variabilele de mediu:"
    echo "   - DATABASE_URL: postgresql://..."
    echo "   - NEXTAUTH_SECRET: $(openssl rand -base64 32)"
    echo "   - NEXTAUTH_URL: https://your-domain.vercel.app"
    echo ""
    echo -e "${GREEN}✅ După ce ai făcut asta, rulează din nou: ./deploy-simple.sh${NC}"
    exit 0
fi

# Deploy cu Vercel
echo -e "${BLUE}🚀 Deploy cu Vercel...${NC}"
npx vercel --prod

echo -e "${GREEN}🎉 Deployment complet!${NC}"
echo ""
echo -e "${BLUE}📊 Informații:${NC}"
echo "- URL: https://your-project.vercel.app"
echo "- Dashboard: https://vercel.com/dashboard"
echo ""
echo -e "${YELLOW}⚠️  Nu uita să configurezi:${NC}"
echo "1. Database URL în Vercel Dashboard"
echo "2. Stripe keys (dacă folosești plăți)"
echo "3. Domain personalizat (opțional)"
