# lanXpert Check-Up 📘

Her şeyin düzgün çalıştığından emin olmak için bu listeyi takip edin:

## 1. Veritabanı (Supabase) ✅
- [x] `schema.sql` Supabase SQL Editor'da çalıştırıldı mı?
- [x] Tablolar (`users`, `questions`, `answers`, `usage_logs`) oluşturuldu mu?
- [x] **Trigger Kontrolü**: Yeni bir kullanıcı eklendiğinde `users` tablosuna otomatik kayıt düşüyor mu? (SQL'deki `on_auth_user_created` trigger'ı).
- [x] **Bağlantı Testi**: `node verify-db.js` komutu başarıyla çalışıyor mu?

## 2. Kimlik Doğrulama (Auth) ✅
- [x] `/auth/register` sayfası üzerinden yeni bir kullanıcı oluşturulabiliyor mu?
- [x] `/auth/login` sayfası üzerinden giriş yapılabiliyor mu?
- [x] Giriş yaptıktan sonra ana sayfada e-posta adresiniz görünüyor mu?

## 3. Soru Sistemi ✍️
- [x] `/questions/new` sayfasından yeni bir çeviri sorusu sorulabiliyor mu?
- [x] Sorular `/questions` sayfasındaki akışta (feed) görünüyor mu?
- [x] Günlük kota sistemi (`usage_logs`) çalışıyor mu? (Günde 20 soru sınırı).

## 4. Yapay Zeka (Gemini) 🤖
- [x] Gemini API anahtarı `.env.local` içinde doğru tanımlı mı?
- [x] AI Fallback API hattı (`/api/ai/answer`) hazır mı?

## 5. Arayüz & Tasarım 🎨
- [x] Modern Dark Theme aktif mi?
- [x] `21st.dev` bileşenleri düzgün yüklenmiş ve derlenmiş mi? (`npm run build` hatasız geçiyor mu?)

---
**Not**: Eğer Supabase tarafında SQL kodlarını henüz çalıştırmadıysanız, `web/db/schema.sql` dosyasındakileri kopyalayıp Supabase dashboard'unda çalıştırmayı unutmayın!
