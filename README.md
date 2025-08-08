# LuxBID - Luxury Private Offers Platform

LuxBID este o platformă modernă pentru vânzarea obiectelor de lux prin oferte private, similar cu Chrono24, dar cu un model de business unic.

## 🎯 Concept

**Modelul de business LuxBID:**
- **Vânzătorii** își listează obiectele de lux (ceasuri, genți, bijuterii)
- **Cumpărătorii** fac oferte private (nu publice)
- **Vânzătorul** alege oferta cea mai bună
- **După plata comisionului**, datele se dezvăluie reciproc

## ✨ Caracteristici

### 🔐 Sistem de Oferte Private
- Oferte confidențiale între cumpărători și vânzători
- Fără licitații publice - doar oferte private
- Vânzătorul alege oferta preferată
- Anonimitate până la acceptarea ofertei

### 💰 Sistem de Plăți
- Integrare completă cu Stripe
- Comision de 5% pentru platformă
- Plăți securizate și automate
- Notificări în timp real

### 🏠 Dashboard Complet
- Statistici în timp real
- Gestionarea listărilor
- Istoricul ofertelor
- Rapoarte detaliate

### 💬 Sistem de Mesaje
- Comunicare privată între utilizatori
- Mesaje în timp real
- Notificări pentru mesaje noi

### ⭐ Sistem de Review-uri
- Rating-uri și comentarii
- Statistici de reputație
- Sistem de feedback

### 🔔 Notificări în Timp Real
- Notificări push pentru oferte
- Actualizări de status
- Mesaje importante

### 📊 Rapoarte și Analytics
- Statistici detaliate
- Export de date (CSV)
- Analize de performanță

### 🛡️ Sistem de Moderare
- Admin panel complet
- Moderarea conținutului
- Raportarea utilizatorilor
- Sistem de ban/unban

## 🚀 Tehnologii

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** Node.js, Next.js API Routes
- **Database:** SQLite (development), PostgreSQL (production)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **File Storage:** Local filesystem + Sharp
- **Deployment:** Vercel/AWS

## 📦 Instalare

1. **Clonează repository-ul**
```bash
git clone https://github.com/yourusername/luxbid.git
cd luxbid
```

2. **Instalează dependențele**
```bash
npm install
```

3. **Configurează variabilele de mediu**
```bash
cp .env.example .env
```

Editează `.env` cu valorile tale:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
```

4. **Generează și migrează baza de date**
```bash
npx prisma generate
npx prisma db push
```

5. **Populează baza de date cu date de test**
```bash
npm run db:seed
```

6. **Pornește aplicația**
```bash
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:3000`

## 🎮 Utilizare

### Pentru Vânzători
1. **Înregistrare** ca vânzător
2. **Creează listări** pentru obiectele de lux
3. **Primește oferte** private de la cumpărători
4. **Alege oferta** cea mai bună
5. **Completează vânzarea** după plata comisionului

### Pentru Cumpărători
1. **Înregistrare** ca cumpărător
2. **Browse listări** de obiecte de lux
3. **Fă oferte private** pentru obiectele dorite
4. **Așteaptă răspunsul** vânzătorului
5. **Completează achiziția** dacă oferta este acceptată

## 📁 Structura Proiectului

```
luxbid/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── (auth)/            # Pagini de autentificare
│   │   ├── (dashboard)/       # Dashboard
│   │   ├── listings/          # Listări
│   │   ├── admin/             # Admin panel
│   │   └── reports/           # Rapoarte
│   ├── components/            # Componente React
│   │   ├── ui/               # Componente UI
│   │   └── providers/        # Providers
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilități
│   └── types/                # Tipuri TypeScript
├── prisma/                   # Schema și migrații
├── public/                   # Fișiere statice
└── uploads/                  # Imagini încărcate
```

## 🔧 API Endpoints

### Listări
- `GET /api/listings` - Lista toate listările
- `POST /api/listings` - Creează o listare nouă
- `GET /api/listings/[id]` - Detalii listare
- `PUT /api/listings/[id]` - Actualizează listarea
- `DELETE /api/listings/[id]` - Șterge listarea

### Oferte
- `GET /api/offers` - Lista ofertele
- `POST /api/offers` - Creează o ofertă nouă
- `PATCH /api/offers/[id]/accept` - Acceptă o ofertă

### Plăți
- `POST /api/payments/create-session` - Creează sesiune de plată
- `GET /api/payments/session/[sessionId]` - Detalii sesiune

### Utilizatori
- `POST /api/auth/register` - Înregistrare
- `POST /api/auth/login` - Autentificare

## 🎨 Design System

Platforma folosește un design system modern cu:
- **Tailwind CSS** pentru styling
- **Radix UI** pentru componente accesibile
- **Lucide React** pentru iconuri
- **Design responsive** pentru toate dispozitivele

## 🔒 Securitate

- **Autentificare** cu NextAuth.js
- **Validare** cu Zod
- **Autorizare** bazată pe roluri
- **Sanitizare** input-uri
- **HTTPS** în producție

## 🚀 Deployment

### Vercel (Recomandat)
1. Conectează repository-ul la Vercel
2. Configurează variabilele de mediu
3. Deploy automat la fiecare push

### AWS
1. Configurează EC2 sau ECS
2. Setează PostgreSQL RDS
3. Configurează CloudFront pentru CDN

## 🤝 Contribuții

1. Fork repository-ul
2. Creează un branch pentru feature (`git checkout -b feature/amazing-feature`)
3. Commit schimbările (`git commit -m 'Add amazing feature'`)
4. Push la branch (`git push origin feature/amazing-feature`)
5. Deschide un Pull Request

## 📄 Licență

Acest proiect este licențiat sub [MIT License](LICENSE).

## 🆘 Suport

Pentru suport și întrebări:
- Deschide un issue pe GitHub
- Contactează echipa de dezvoltare
- Consultă documentația

---

**LuxBID** - Platforma de lux pentru oferte private 🎯
