/**
 * AETHER CALISTHENICS - BaaS (Backend as a Service) API & STATE YÖNETİMİ
 * 
 * Veritabanı ve Kimlik Doğrulama:
 * - Firebase Cloud Firestore & Firebase Authentication (Google BaaS)
 * - %100 İstemci Taraflı JavaScript API'leri (PHP / SQL tamamen kaldırılmıştır)
 * - Firebase çevrimdışıyken veya ilk kurulum öncesinde kesintisiz LocalStorage BaaS desteği
 */

const CalisthenicsAPI = {
  // BaaS Servis Başlatıcı
  init() {
    if (window.FirebaseService) {
      window.FirebaseService.init();
    }
  },

  // BaaS Durumunu Sorgulama
  getBaaSStatus() {
    const isFb = window.FirebaseService && window.FirebaseService.isConfigured;
    return {
      isFirebase: isFb,
      provider: isFb ? "Firebase (Cloud Firestore & Auth)" : "LocalStorage BaaS",
      projectId: isFb ? (window.firebaseConfig ? window.firebaseConfig.projectId : "aether-calisthenics") : "Yerel Depolama"
    };
  },

  // Aktif oturum bilgisi (Cache)
  getCurrentUser() {
    try {
      const raw = localStorage.getItem("calisthenics_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem("calisthenics_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("calisthenics_user");
      }
    } catch (e) {}
  },

  // Kullanıcı Kaydı (Firebase Auth + Cloud Firestore 'users' koleksiyonu)
  async register(name, email, password) {
    const fb = window.FirebaseService;

    // 1. Firebase BaaS Aktifse:
    if (fb && fb.isConfigured && fb.auth) {
      try {
        const userCred = await fb.auth.createUserWithEmailAndPassword(email, password);
        const fbUser = userCred.user;
        
        try {
          await fbUser.updateProfile({ displayName: name });
        } catch (pErr) {}

        const userData = {
          id: fbUser.uid,
          name: name,
          email: email,
          assessmentCompleted: false,
          createdAt: new Date().toISOString()
        };

        // Cloud Firestore'a kullanıcı profilini yaz
        await fb.db.collection("users").doc(fbUser.uid).set(userData);
        this.setCurrentUser(userData);

        return {
          success: true,
          message: `Hoş geldin ${name}! Firebase hesabın başarıyla oluşturuldu.`,
          user: userData
        };
      } catch (err) {
        let msg = err.message;
        if (err.code === "auth/email-already-in-use") msg = "Bu e-posta adresi zaten kayıtlı!";
        else if (err.code === "auth/weak-password") msg = "Şifre en az 6 karakter olmalıdır.";
        else if (err.code === "auth/invalid-email") msg = "Geçersiz e-posta adresi formatı.";
        return { success: false, message: msg };
      }
    }

    // 2. LocalStorage BaaS Modu:
    const users = JSON.parse(localStorage.getItem("calisthenics_users") || "[]");
    if (users.find(u => u.email === email)) {
      return { success: false, message: "Bu e-posta adresi zaten kayıtlı!" };
    }

    const newUser = {
      id: "usr_" + Date.now(),
      name,
      email,
      password,
      assessmentCompleted: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("calisthenics_users", JSON.stringify(users));
    this.setCurrentUser(newUser);

    return {
      success: true,
      message: "Kayıt başarıyla tamamlandı!",
      user: newUser
    };
  },

  // Kullanıcı Girişi (Firebase Auth + Cloud Firestore)
  async login(email, password) {
    const fb = window.FirebaseService;

    // 1. Firebase BaaS Aktifse:
    if (fb && fb.isConfigured && fb.auth) {
      try {
        const userCred = await fb.auth.signInWithEmailAndPassword(email, password);
        const fbUser = userCred.user;

        // Cloud Firestore'dan kullanıcı profilini oku
        let userData = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split("@")[0],
          email: email,
          assessmentCompleted: false
        };

        try {
          const docSnap = await fb.db.collection("users").doc(fbUser.uid).get();
          if (docSnap.exists) {
            userData = docSnap.data();
          }
        } catch (dbErr) {}

        this.setCurrentUser(userData);
        return {
          success: true,
          message: "Firebase üzerinden giriş başarılı!",
          user: userData
        };
      } catch (err) {
        let msg = "E-posta veya şifre hatalı!";
        if (err.code === "auth/invalid-email") msg = "Geçersiz e-posta adresi!";
        else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          msg = "E-posta veya şifre hatalı!";
        }
        return { success: false, message: msg };
      }
    }

    // 2. LocalStorage BaaS Modu:
    const users = JSON.parse(localStorage.getItem("calisthenics_users") || "[]");
    const found = users.find(u => u.email === email && u.password === password);

    if (found) {
      this.setCurrentUser(found);
      return { success: true, message: "Giriş başarılı!", user: found };
    }

    return { success: false, message: "E-posta veya şifre hatalı!" };
  },

  // Çıkış
  async logout() {
    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.auth) {
      try {
        await fb.auth.signOut();
      } catch (e) {}
    }
    this.setCurrentUser(null);
  },

  // Temel Hareketler & Güç Seviyesi Değerlendirmesini Kaydetme (Firestore 'assessments')
  async saveAssessment(stats) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Oturum açılmalı." };

    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.db) {
      try {
        await fb.db.collection("assessments").doc(user.id).set({
          userId: user.id,
          stats: stats,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        await fb.db.collection("users").doc(user.id).set({
          assessmentCompleted: true
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore yazma uyarısı:", e.message);
      }
    }

    // Yerel Depolamayı da Senkron Tut
    localStorage.setItem(`calisthenics_assessment_${user.id}`, JSON.stringify(stats));
    user.assessmentCompleted = true;
    user.stats = stats;
    this.setCurrentUser(user);

    const users = JSON.parse(localStorage.getItem("calisthenics_users") || "[]");
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].assessmentCompleted = true;
      users[idx].stats = stats;
      localStorage.setItem("calisthenics_users", JSON.stringify(users));
    }

    return { success: true, message: "Temel hareket verileriniz BaaS veritabanına kaydedildi!", stats };
  },

  // Kullanıcının Güç Seviyesini Getirme (Firestore 'assessments')
  async getAssessment() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.db) {
      try {
        const docSnap = await fb.db.collection("assessments").doc(user.id).get();
        if (docSnap.exists && docSnap.data().stats) {
          const stats = docSnap.data().stats;
          localStorage.setItem(`calisthenics_assessment_${user.id}`, JSON.stringify(stats));
          return stats;
        }
      } catch (e) {}
    }

    const localData = localStorage.getItem(`calisthenics_assessment_${user.id}`);
    return localData ? JSON.parse(localData) : (user.stats || null);
  },

  // Hedefleri Getirme (Firestore 'goals')
  async getGoals() {
    const user = this.getCurrentUser();
    if (!user) return [];

    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.db) {
      try {
        const docSnap = await fb.db.collection("goals").doc(user.id).get();
        if (docSnap.exists && Array.isArray(docSnap.data().goals)) {
          const goals = docSnap.data().goals;
          localStorage.setItem(`calisthenics_goals_${user.id}`, JSON.stringify(goals));
          return goals;
        }
      } catch (e) {}
    }

    const raw = localStorage.getItem(`calisthenics_goals_${user.id}`);
    return raw ? JSON.parse(raw) : [];
  },

  // Hedef Ekleme (Firestore 'goals' arrayUnion)
  async addGoal(skillId) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Lütfen önce üye olun veya giriş yapın." };

    let goals = await this.getGoals();
    if (!goals.includes(skillId)) {
      goals.push(skillId);
    }

    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.db) {
      try {
        await fb.db.collection("goals").doc(user.id).set({
          userId: user.id,
          goals: goals,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {}
    }

    localStorage.setItem(`calisthenics_goals_${user.id}`, JSON.stringify(goals));
    return { success: true, message: "Hedeflerinize eklendi!", goals };
  },

  // Hedef Kaldırma (Firestore 'goals')
  async removeGoal(skillId) {
    const user = this.getCurrentUser();
    if (!user) return { success: false };

    let goals = await this.getGoals();
    goals = goals.filter(id => id !== skillId);

    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.db) {
      try {
        await fb.db.collection("goals").doc(user.id).set({
          userId: user.id,
          goals: goals,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {}
    }

    localStorage.setItem(`calisthenics_goals_${user.id}`, JSON.stringify(goals));
    return { success: true, message: "Hedef çıkarıldı.", goals };
  },

  // Oluşturulan Programı Kaydetme (Firestore 'programs')
  async saveProgram(programData) {
    const user = this.getCurrentUser();
    if (!user) return { success: false };

    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.db) {
      try {
        await fb.db.collection("programs").add({
          userId: user.id,
          program: programData,
          createdAt: new Date().toISOString()
        });
      } catch (e) {}
    }

    const userPrograms = JSON.parse(localStorage.getItem(`calisthenics_programs_${user.id}`) || "[]");
    userPrograms.unshift(programData); // En yenisi başa
    localStorage.setItem(`calisthenics_programs_${user.id}`, JSON.stringify(userPrograms));

    return { success: true, message: "Program BaaS veritabanına kaydedildi!" };
  },

  // Kullanıcının Kayıtlı Programlarını Getirme (Firestore 'programs')
  async getPrograms() {
    const user = this.getCurrentUser();
    if (!user) return [];

    const fb = window.FirebaseService;
    if (fb && fb.isConfigured && fb.db) {
      try {
        const snap = await fb.db.collection("programs")
          .where("userId", "==", user.id)
          .get();

        if (!snap.empty) {
          const remoteList = [];
          snap.forEach(doc => {
            const data = doc.data();
            if (data.program) remoteList.push(data.program);
          });
          if (remoteList.length > 0) {
            localStorage.setItem(`calisthenics_programs_${user.id}`, JSON.stringify(remoteList));
            return remoteList;
          }
        }
      } catch (e) {}
    }

    const raw = localStorage.getItem(`calisthenics_programs_${user.id}`);
    return raw ? JSON.parse(raw) : [];
  }
};

// Sayfa yüklendiğinde BaaS istemcisini başlat
CalisthenicsAPI.init();
