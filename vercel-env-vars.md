# 🔧 Variabile de Mediu pentru Vercel

## 📋 Variabilele pe care trebuie să le adaugi în Vercel Dashboard

### **1. Deschide Vercel Dashboard**
1. Deschide: https://vercel.com/dashboard
2. Click pe proiectul tău "luxbid"
3. Click "Settings" (tab-ul din sus)
4. Click "Environment Variables" (în meniul din stânga)

### **2. Adaugă următoarele variabile:**

#### **DATABASE_URL**
```
Name: DATABASE_URL
Value: postgresql://postgres:password@localhost:5432/luxbid
Environment: Production, Preview, Development
```

#### **NEXTAUTH_SECRET**
```
Name: NEXTAUTH_SECRET
Value: [generează un secret random]
Environment: Production, Preview, Development
```

#### **NEXTAUTH_URL**
```
Name: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
Environment: Production, Preview, Development
```

### **3. Cum să generezi NEXTAUTH_SECRET**
```bash
# Rulează în terminal
openssl rand -base64 32
```

### **4. Cum să obții DATABASE_URL**
1. Deschide: https://supabase.com
2. Creează cont și proiect nou
3. În Dashboard > Settings > Database
4. Copiază "Connection string" > "URI"

### **5. Cum să afli NEXTAUTH_URL**
1. După primul deploy, Vercel îți va da un URL
2. Va fi ceva de genul: `https://luxbid-abc123.vercel.app`
3. Folosește acel URL pentru NEXTAUTH_URL

## 🎯 **PAȘII RAPIDI**

### **Opțiunea 1: Database Local (Pentru test)**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/luxbid
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-project.vercel.app
```

### **Opțiunea 2: Database Supabase (Recomandat)**
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-project.vercel.app
```

## ✅ **VERIFICARE**

După ce ai adăugat variabilele:
1. Click "Save"
2. Click "Redeploy" (dacă este necesar)
3. Testează aplicația la URL-ul dat de Vercel
