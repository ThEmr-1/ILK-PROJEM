# AETHER CALISTHENICS - AKILLI ANTRENMAN PLATFORMU

Bu proje, modern bir Calisthenics (vücut ağırlığı sporu) web platformudur. Sporcuların ilgilendikleri disiplinleri keşfetmesini, temel kuvvet seviyelerini ölçmesini ve seçtikleri hedeflere göre otomatik kişiselleştirilmiş haftalık antrenman programları elde etmesini sağlar.

---

## 🚀 Proje Mimarisi

- **Frontend:**
  - Modern HTML5, Responsive CSS3 (CSS Grid, Flexbox, Glassmorphism, Neon Dark Tema).
  - Vanilla JavaScript (ES6+), Modüler yapı (`app.js`, `data.js`, `programGenerator.js`, `api.js`).
  - FontAwesome 6 ikon seti ve Inter tipografisi.
  - **Dual-Mode:** PHP/MySQL aktifken REST API ile çalışır; PHP olmadan doğrudan tarayıcıda açıldığında `localStorage` üzerinde kesintisiz çalışarak anında test edilebilir!

- **Backend:**
  - **PHP (PDO)** tabanlı RESTful API mimarisi.
  - **MySQL / MariaDB** veritabanı (İlişkisel şema, ON DELETE CASCADE, güvenli bcrypt şifreleme).
  - `router.php` ile harici web sunucusu kurmadan `php -S` ile çalıştırılabilir.

---

## 🌟 Temel Özellikler

1. **Göz Alıcı & Sıkmayan Ana Sayfa (Landing Page):**
   - Atletik neon karanlık tema, dinamik günün hareketi kartı, istatistik sayaçları ve etkileyici çağrı butonları.
   
2. **Alanlar (Disciplines):**
   - **Statik (Statics):** Front Lever, Planche, Back Lever, Human Flag, Handstand vb.
   - **Dinamik (Dynamics):** Bar Muscle-Up, Handstand Push-Up, Pistol Squat, Russian / Impossible Dips vb.
   - **Freestyle (Serbest Stil):** 360 Bar Spin, 540 Bar Spin, Geinger Salto, Shrimp Flip vb.
   - Tıklanan kategorinin tüm hareketleri görseli, zorluk seviyesi ve çalışan kaslarıyla listelenir.

3. **Üyelik & Kısıtlama Sistemi:**
   - Üye olmayan misafirler hareket detaylarını ve açıklamalarını görebilir.
   - Özel program ve aşama rehberi istediklerinde üye olmaları gerektiği belirtilir.
   - Üyeler hareketleri **"Hedeflerime Ekle"** diyerek havuzlarına alabilir.

4. **Temel Hareketler & Güç Analizi (Baseline Assessment):**
   - Üyeler temel calisthenics hareketlerini girer:
     - Barfiks (Pull-up)
     - Şınav (Push-up)
     - Dips
     - Hollow Body Hold (sn)
     - L-Sit Hold (sn)
     - Duvarda Amut (sn)
   - Bu veriler veritabanında depolanır.

5. **Hedeflerim & Akıllı Darboğaz Teşhisi:**
   - Kullanıcı aynı anda 2 veya daha fazla hareket seçebilir (örn: Front Lever + Planche).
   - Sistem hedeflenen hareketin gerektirdiği güç eşikleriyle kullanıcının gücünü kıyaslar:
     - **Temel Güç Eksikse:** `[GÜÇ & TENDON HAZIRLIĞI]` protokolü (temel hipertrofi ve tendon adaptasyonu öncelikli).
     - **Güç Yeterliyse:** `[SAF TEKNİK & AŞAMA]` protokolü (%100 nöromüsküler ustalık, denge ve kilitlenmeye odaklı).

6. **Akıllı Program Oluşturma Sihirbazı:**
   - **Soru 1:** Haftada kaç kez spor yapılacak? (2, 3, 4, 5 gün) & Hangi günler? (Pzt, Çar, Cum vb.)
   - **Soru 2:** Program türü tercihi? (Push-Pull-Legs, Upper-Lower, Full Body, Skill + Strength Hibriti)
   - **Soru 3:** Seans süresi? (45, 60, 90 dakika)
   - **Sonuç:** Gün gün egzersizler, setler, tekrarlar/saniyeler, dinlenme aralıkları ve koçluk notları içeren haftalık antrenman takvimi oluşturulur, kaydedilebilir ve PDF olarak yazdırılabilir.

---

## 🛠️ Kurulum ve Çalıştırma

### Yöntem 1: Doğrudan Tarayıcıda Açma (Sıfır Kurulum)
`frontend/index.html` dosyasını Google Chrome veya herhangi bir tarayıcıda çift tıklayarak açabilirsiniz. Dual-Mode sayesinde tüm özellikler (üyelik, analiz, hedefler, program oluşturma) anında çalışacaktır.

### Yöntem 2: PHP & MySQL ile Çalıştırma

#### 1. Veritabanını Hazırlayın
MySQL yönetim panelinizde (örn. phpMyAdmin veya MySQL Workbench) `backend/database/schema.sql` dosyasını çalıştırın:
```sql
SOURCE backend/database/schema.sql;
```
*(Varsayılan veritabanı adı `calisthenics_db`, kullanıcı adı `root`, şifre boşluktur. Değiştirmek isterseniz `backend/config/db.php` dosyasını düzenleyebilirsiniz.)*

#### 2. Sunucuyu Başlatın
Proje kök dizininde terminalden şu komutu girin:
```bash
php -S localhost:8000 backend/router.php
```
Artık tarayıcınızdan **`http://localhost:8000`** adresine giderek sistemi PHP ve MySQL backend ile kullanabilirsiniz!

#### 3. XAMPP / WAMP Kullanıyorsanız:
`calisthenics-app` klasörünü `htdocs` (veya WAMP için `www`) dizinine kopyalayın ve tarayıcınızdan `http://localhost/calisthenics-app/frontend/index.html` adresini açın.
