# AETHER CALISTHENICS - AKILLI VÜCUT AĞIRLIĞI ANTRENMAN PLATFORMU

Aether Calisthenics, modern ve yüksek performanslı bir Calisthenics (vücut ağırlığı sporu) web platformudur. Sporcuların disiplin alanlarını keşfetmesini, temel kuvvet seviyelerini ölçmesini, hedeflerine göre yapay zeka destekli haftalık antrenman programları üretmesini ve Aether AI Koç ile canlı antrenman tavsiyeleri almasını sağlar.

Bu proje, geleneksel sunucu (PHP/Apache) ve yerel ilişkisel veritabanı (MySQL) bağımlılıklarından tamamen arındırılmış; **%100 İstemci Taraflı (Pure HTML5/CSS3/Vanilla JS)** ve **BaaS (Backend as a Service - Google Firebase & Cloud Firestore)** mimarisine geçirilmiştir.

---

## 🚀 Proje Mimarisi & Teknolojiler

- **Frontend & İstemci:**
  - **HTML5:** Semantik, SEO dostu ve erişilebilir sayfa yapısı (`index.html` doğrudan ana dizinde).
  - **CSS3:** Responsive Grid, Flexbox, Glassmorphism, Neon Dark atletik tema (`css/style.css`, `css/components.css`).
  - **Vanilla JavaScript (ES6+):** Sıfır kütüphane bağımlılığı; modüler, saf ve asenkron JavaScript mimarisi (`js/app.js`, `js/data.js`, `js/programGenerator.js`, `js/aiCoach.js`).
  - **İkonografi:** FontAwesome 6 Pro CDN & Inter tipografisi.

- **BaaS (Backend as a Service):**
  - **Google Firebase Authentication:** E-posta/şifre ile güvenli bulut kimlik doğrulaması.
  - **Google Cloud Firestore:** NoSQL doküman tabanlı gerçek zamanlı bulut veritabanı (`users`, `assessments`, `goals`, `programs` koleksiyonları).
  - **Otomatik Çevrimdışı / LocalStorage Desteği:** Firebase API anahtarları henüz girilmemiş olsa bile kullanıcı deneyimini aksatmayan yerel BaaS fallback katmanı.

- **Dağıtım (Deployment):**
  - Sıfır sunucu kurulumu gereksinimi (Zero-Server Architecture).
  - **GitHub Pages**, **Vercel**, **Netlify** veya **Cloudflare Pages** üzerinde tek tıkla canlıya alınabilir ve özel bağlantı (URL) ile paylaşılabilir.

---

## 🌟 Temel Özellikler

1. **Göz Alıcı Hero & Günün Hareketi:**
   - Atletik neon karanlık tema, dinamik günün hareketi kartı, istatistik sayaçları ve etkileyici çağrı butonları.

2. **Disiplin Alanları:**
   - **Statik (Statics):** Front Lever, Planche, Back Lever, Human Flag, Handstand vb.
   - **Dinamik (Dynamics):** Bar Muscle-Up, Handstand Push-Up, Pistol Squat, Russian / Impossible Dips vb.
   - **Freestyle (Serbest Stil):** 360 Bar Spin, 540 Bar Spin, Geinger Salto, Shrimp Flip vb.
   - Zorluk seviyeleri, primer/sekonder kas grupları ve ön koşul hareketleri ile zengin kart arayüzü.

3. **Temel Güç Değerlendirmesi (Baseline Assessment):**
   - Kullanıcının temel barfiks, şınav, dips, hollow body, L-sit ve amut verileri bulut veritabanında saklanır.

4. **Akıllı Darboğaz & Kıyaslama Algoritması:**
   - Seçilen hedef hareketlerin gerektirdiği kuvvet eşikleri ile sporcunun mevcut gücü kıyaslanır.
   - Kuvvet eksiği varsa **[GÜÇ & TENDON HAZIRLIĞI]**, yeterliyse **[SAF TEKNİK & AŞAMA]** antrenman protokolü otomatik atanır.

5. **Kişiselleştirilmiş Program Sihirbazı:**
   - Gün sayısı (2-5 gün), bölünme türü (Push-Pull-Legs, Upper-Lower, Full Body, Skill Hibrit) ve seans süresine göre tam haftalık antrenman takvimi üretilir.
   - Üretilen programlar Cloud Firestore'a kaydedilebilir ve PDF olarak yazdırılabilir.

6. **Aether AI Koç (Canlı Asistan):**
   - Calisthenics biyomekaniği, tendon sağlığı, progresyon takılmaları ve beslenme konusunda uzman yüzen akıllı koç widget'ı.

7. **BaaS Durum & Yönetim Paneli:**
   - Navbarda bulunan BaaS göstergesi ile bağlantı durumu anlık izlenebilir ve arayüz üzerinden kendi Firebase anahtarlarınız kaydedilebilir.

---

## 🌐 GitHub Pages ile Ücretsiz Canlı Link Alma (Deployment)

Projeyi GitHub üzerinden yayınlayıp herkese açık özel bir linkle paylaşmak için:

### 1. Dosyaları GitHub Deponuza Gönderin (Push)
```bash
git add .
git commit -m "feat: Pure HTML/JS mimarisi ve Firebase BaaS entegrasyonu"
git push origin main
```

### 2. GitHub Pages'i Etkinleştirin
1. GitHub'da deponuzun (repository) sayfasına gidin.
2. Üst menüden **Settings (Ayarlar)** sekmesine tıklayın.
3. Sol menüden **Pages** seçeneğini seçin.
4. **Build and deployment > Source** kısmında **"Deploy from a branch"** seçeneğini işaretleyin.
5. **Branch** kısmında `main` (veya `master`) dalını ve klasör olarak `/ (root)` seçip **Save** butonuna tıklayın.
6. 1-2 dakika içinde GitHub size özel canlı bağlantınızı verecektir:
   ```
   https://kullaniciadiniz.github.io/calisthenics-app/
   ```

---

## 🔧 Firebase BaaS Yapılandırması (İsteğe Bağlı)

Uygulama, varsayılan olarak yerel depolama desteğiyle sıfır ayarla çalışır. Kendi Firebase bulut veritabanınızı bağlamak için:

1. [Firebase Console](https://console.firebase.google.com)'a gidin ve Google hesabınızla giriş yapın.
2. **Proje Ekle (Add Project)** diyerek ücretsiz bir proje oluşturun (örn: `aether-calisthenics`).
3. Proje panelinde:
   - **Authentication** > **Get Started** > **Email/Password** sağlayıcısını etkinleştirin.
   - **Firestore Database** > **Create database** > **Start in test mode** seçeneğini işaretleyin.
4. **Project Settings (Proje Ayarları)** > **General** > **Your apps** bölümünden **Web (</>)** simgesine tıklayın.
5. Verilen `firebaseConfig` nesnesini kopyalayın:
   - **Yöntem A (Arayüzden):** Sitedeki sağ üst **"BaaS"** butonuna tıklayıp JSON kodunu yapıştırın ve "Kaydet"e basın.
   - **Yöntem B (Koddan):** `js/firebaseConfig.js` dosyasındaki `firebaseConfig` nesnesine kendi anahtarlarınızı yazın.

---

## 📂 Dizin Yapısı

```
calisthenics-app/
├── index.html            # Ana giriş sayfası (Root SPA)
├── README.md             # Proje dokümantasyonu
├── css/
│   ├── style.css         # Ana stiller, reset, grid, tipografi, animasyonlar
│   └── components.css    # Kartlar, modallar, BaaS paneli, sihirbaz ve AI Koç stilleri
├── js/
│   ├── firebaseConfig.js # Firebase Cloud Firestore & Auth SDK yapılandırması
│   ├── api.js            # BaaS istemcisi (Auth, Firestore CRUD ve Fallback)
│   ├── data.js           # Hareket kütüphanesi, seviyeler, kas grupları
│   ├── programGenerator.js # Akıllı antrenman üretim algoritması
│   ├── aiCoach.js        # Aether AI Calisthenics koçu
│   └── app.js            # SPA yönlendirmeleri, modal yönetimi, UI etkileşimleri
└── *.jpg                 # Web için optimize edilmiş 14 hareket görseli
```

---

## 📜 Lisans & Telif

© 2026 Aether Calisthenics. Modern Web Standartları (HTML5, CSS3, Vanilla JS & Google Firebase BaaS).
