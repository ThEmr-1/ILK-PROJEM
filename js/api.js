/**
 * Calisthenics API & State Yönetimi
 * 
 * Varsayılan Mod: %100 Bağımsız LocalStorage Tabanlı Client-First Mimari
 * - GitHub Pages, VS Code Live Server ve masaüstünde çift tıklamayla SIFIR ağ hatası ile çalışır.
 * - Hiçbir harici PHP/MySQL sunucu ihtiyacı olmadan tüm üyelik, analiz, hedef ve programlama özelliklerini sunar.
 * - İleride gerçek bir PHP sunucusu (php -S localhost:8000) kullanılmak istenirse `enableBackendServer: true` yapılabilir.
 */

const CalisthenicsAPI = {
  // PHP Backend Sunucusu Kullanımı
  // false (Varsayılan): Tüm verileri tarayıcıda (LocalStorage) saklar, sunucuya GET/POST isteği ATMAZ.
  // true: Sadece PHP/MySQL sunucusu çalışırken REST API üzerinden haberleşir.
  enableBackendServer: false,

  // Backend API kök dizini (PHP server çalışırken kullanılır)
  baseUrl: "../backend/api",

  // Aktif oturum bilgisi
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

  // Kullanıcı Kaydı
  async register(name, email, password) {
    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/register.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            this.setCurrentUser(data.user);
            return data;
          }
        }
      } catch (e) {
        console.warn("Backend offline, LocalStorage moduna geçildi.");
      }
    }

    // %100 Kesintisiz LocalStorage Modu
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

  // Kullanıcı Girişi
  async login(email, password) {
    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            this.setCurrentUser(data.user);
            return data;
          }
        }
      } catch (e) {
        console.warn("Backend offline, LocalStorage üzerinden giriş kontrol ediliyor.");
      }
    }

    // %100 Kesintisiz LocalStorage Modu
    const users = JSON.parse(localStorage.getItem("calisthenics_users") || "[]");
    const found = users.find(u => u.email === email && u.password === password);

    if (found) {
      this.setCurrentUser(found);
      return { success: true, message: "Giriş başarılı!", user: found };
    }

    return { success: false, message: "E-posta veya şifre hatalı!" };
  },

  // Çıkış
  logout() {
    this.setCurrentUser(null);
  },

  // Temel Hareketler & Güç Seviyesi Değerlendirmesini Kaydetme
  async saveAssessment(stats) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Oturum açılmalı." };

    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/assessment.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, stats })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            user.assessmentCompleted = true;
            user.stats = stats;
            this.setCurrentUser(user);
            return data;
          }
        }
      } catch (e) {
        console.warn("Backend offline, assessment LocalStorage'a yazılıyor.");
      }
    }

    // LocalStorage Modu
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

    return { success: true, message: "Temel hareket verileriniz başarıyla kaydedildi!", stats };
  },

  // Kullanıcının Güç Seviyesini Getirme
  async getAssessment() {
    const user = this.getCurrentUser();
    if (!user) return null;

    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/assessment.php?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stats) return data.stats;
        }
      } catch (e) {}
    }

    const localData = localStorage.getItem(`calisthenics_assessment_${user.id}`);
    return localData ? JSON.parse(localData) : (user.stats || null);
  },

  // Hedefleri Getirme
  async getGoals() {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/goals.php?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) return data.goals;
        }
      } catch (e) {}
    }

    const raw = localStorage.getItem(`calisthenics_goals_${user.id}`);
    return raw ? JSON.parse(raw) : [];
  },

  // Hedef Ekleme
  async addGoal(skillId) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Lütfen önce üye olun veya giriş yapın." };

    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/goals.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, skillId })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) return data;
        }
      } catch (e) {}
    }

    const goals = await this.getGoals();
    if (!goals.includes(skillId)) {
      goals.push(skillId);
      localStorage.setItem(`calisthenics_goals_${user.id}`, JSON.stringify(goals));
      return { success: true, message: "Hedeflerinize eklendi!", goals };
    }
    return { success: true, message: "Bu hareket zaten hedeflerinizde var.", goals };
  },

  // Hedef Kaldırma
  async removeGoal(skillId) {
    const user = this.getCurrentUser();
    if (!user) return { success: false };

    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/goals.php?userId=${user.id}&skillId=${skillId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) return data;
        }
      } catch (e) {}
    }

    let goals = await this.getGoals();
    goals = goals.filter(id => id !== skillId);
    localStorage.setItem(`calisthenics_goals_${user.id}`, JSON.stringify(goals));
    return { success: true, message: "Hedef çıkarıldı.", goals };
  },

  // Oluşturulan Programı Kaydetme
  async saveProgram(programData) {
    const user = this.getCurrentUser();
    if (!user) return { success: false };

    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/my_programs.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, program: programData })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) return data;
        }
      } catch (e) {}
    }

    const userPrograms = JSON.parse(localStorage.getItem(`calisthenics_programs_${user.id}`) || "[]");
    userPrograms.unshift(programData); // En yenisi başa
    localStorage.setItem(`calisthenics_programs_${user.id}`, JSON.stringify(userPrograms));

    return { success: true, message: "Program kaydedildi!" };
  },

  // Kullanıcının Kayıtlı Programlarını Getirme
  async getPrograms() {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (this.enableBackendServer) {
      try {
        const res = await fetch(`${this.baseUrl}/my_programs.php?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) return data.programs;
        }
      } catch (e) {}
    }

    const raw = localStorage.getItem(`calisthenics_programs_${user.id}`);
    return raw ? JSON.parse(raw) : [];
  }
};
