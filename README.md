# lanXpert - Topluluk Destekli Dil Öğrenme Platformu

Modern bir dil öğrenme platformu. Yapay zeka ve topluluk gücüyle diller öğrenin.

## Özellikler

- Kullanıcı kayıt ve giriş sistemi (Supabase Auth)
- Çeviri soruları sorma ve cevaplama
- AI destekli otomatik cevaplar (Gemini)
- Günlük kullanım kotası sistemi
- Modern, dark-theme arayüz
- Responsive tasarım

## Kurulum

### 1. Bağımlılıkları Kurun

```bash
cd web
npm install
```

### 2. Supabase Veritabanını Yapılandırın

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. SQL Editor'da `web/db/schema.sql` dosyasındaki SQL kodlarını çalıştırın
4. Project Settings > API bölümünden gerekli anahtarları alın

### 3. Environment Variables

`web/.env.local` dosyasını düzenleyin:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI Configuration (Opsiyonel)
GEMINI_API_KEY=your-gemini-api-key
```

**Not:** Gemini API anahtarı opsiyoneldir. Eğer eklemezseniz, AI fallback özelliği devre dışı kalır.

### 4. Veritabanı Bağlantısını Test Edin

```bash
cd web
node verify-db.js
```

### 5. Projeyi Çalıştırın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Veritabanı Kontrolü

`checklist.md` dosyasında adım adım kontrol listesi bulunmaktadır.

## Kullanılan Teknolojiler

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API Routes
- **Veritabanı:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **AI:** Google Gemini
- **UI Components:** Custom components, Radix UI

## Proje Yapısı

```
web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API endpoints
│   │   ├── auth/         # Auth pages
│   │   ├── questions/    # Question pages
│   │   └── page.tsx      # Ana sayfa
│   ├── components/       # React components
│   │   ├── blocks/       # Büyük bileşenler
│   │   └── ui/           # UI bileşenleri
│   ├── lib/              # Yardımcı kütüphaneler
│   └── utils/            # Utility fonksiyonlar
├── db/
│   └── schema.sql        # Veritabanı şeması
└── public/               # Static dosyalar
```

## Önemli Notlar

1. İlk kullanıcı kayıt olduğunda otomatik olarak `users` tablosuna kaydedilir (trigger)
2. Günlük soru sorma limiti: Free tier için 20 soru
3. AI özelliği için Gemini API anahtarı gereklidir
4. Veritabanı şeması mutlaka uygulanmalıdır

## Sorun Giderme

### Build Hataları

Eğer build sırasında hata alırsanız:

```bash
rm -rf .next
npm run build
```

### Veritabanı Bağlantı Hatası

1. Supabase Project URL ve anahtarlarınızı kontrol edin
2. `verify-db.js` script'ini çalıştırarak bağlantıyı test edin
3. SQL şemasının tamamen uygulandığından emin olun

### TypeScript Hatası

```bash
npx tsc --noEmit
```

komutuyla tip hatalarını kontrol edebilirsiniz.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Push yapın
5. Pull request gönderin

## Lisans

MIT License
