/**
 * AETHER CALISTHENICS - FIREBASE BaaS (Backend as a Service) YAPILANDIRMASI
 * 
 * Bu dosya, uygulamanın Firebase Cloud Firestore (Veritabanı) ve 
 * Firebase Authentication (Kullanıcı Girişi/Kaydı) BaaS servislerini bağlar.
 * 
 * Kendi Firebase Projenizi Bağlamak İçin 4 Basit Adım:
 * 1. https://console.firebase.google.com adresine gidin ve Google hesabınızla oturum açın.
 * 2. "Proje Ekle" (Add Project) diyerek ücretsiz bir proje oluşturun (örn: aether-calisthenics).
 * 3. Proje içinde:
 *    - "Authentication" > "Başlayın" > "E-posta/Şifre" sağlayıcısını aktif edin.
 *    - "Firestore Database" > "Veritabanı Oluştur" > "Test modunda başlat" (Start in test mode) seçeneğini seçin.
 * 4. "Proje Ayarları" > "Web uygulaması ekle" (</> simgesi) seçip aşağıdaki firebaseConfig nesnesine
 *    kendi API anahtarlarınızı yapıştırın.
 * 
 * NOT: Kendi anahtarlarınızı girene kadar sistem otomatik olarak tarayıcınızın
 * yerel LocalStorage BaaS simülasyonunu kullanır ve site %100 kesintisiz çalışmaya devam eder.
 */

// Varsayılan Firebase Yapılandırması (Kendi bilgilerinizi buraya yapıştırabilirsiniz)
let firebaseConfig = {
  apiKey: "AIzaSy_BURAYA_FIREBASE_API_KEY_GIRIN",
  authDomain: "aether-calisthenics.firebaseapp.com",
  projectId: "aether-calisthenics",
  storageBucket: "aether-calisthenics.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Tarayıcı üzerinden girilmiş özel config varsa öncelikli kullan
try {
  const customConfig = localStorage.getItem("calisthenics_custom_firebase_config");
  if (customConfig) {
    const parsed = JSON.parse(customConfig);
    if (parsed.apiKey && !parsed.apiKey.includes("BURAYA_FIREBASE")) {
      firebaseConfig = parsed;
    }
  }
} catch (e) {}

// Firebase SDK Başlatıcı
const FirebaseService = {
  isConfigured: false,
  auth: null,
  db: null,

  init() {
    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK yüklenemedi. LocalStorage BaaS modu devrede.");
      return false;
    }

    const isValid = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("BURAYA_FIREBASE");

    if (isValid) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.isConfigured = true;
        console.log("🔥 Firebase BaaS başarıyla bağlandı! (Cloud Firestore & Auth Aktif)");
        return true;
      } catch (err) {
        console.warn("Firebase başlatılırken hata oluştu, LocalStorage modu kullanılıyor:", err.message);
        this.isConfigured = false;
        return false;
      }
    } else {
      console.log("ℹ️ Firebase yapılandırması henüz girilmedi. Uygulama %100 uyumlu LocalStorage BaaS modunda çalışıyor.");
      this.isConfigured = false;
      return false;
    }
  },

  // Firebase yapılandırmasını dinamik olarak güncelleme
  saveCustomConfig(newConfig) {
    try {
      localStorage.setItem("calisthenics_custom_firebase_config", JSON.stringify(newConfig));
      window.location.reload();
      return true;
    } catch (e) {
      return false;
    }
  },

  // Yapılandırmayı sıfırlama
  resetConfig() {
    localStorage.removeItem("calisthenics_custom_firebase_config");
    window.location.reload();
  }
};

// Sayfa yüklendiğinde başlat
if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
  window.FirebaseService = FirebaseService;
}
