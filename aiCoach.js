/**
 * AETHER CALISTHENICS - AKILLI YAPAY ZEKA KOÇU (AI COACH)
 * 
 * Özellikler:
 * - HERKESE AÇIKTIR (Üye olan ve olmayan herkes doğrudan kullanabilir).
 * - KATI SPOR FİLTRESİ: Yalnızca Calisthenics, Fitness, Biyomekanik, Egzersiz, Tendon Sağlığı ve Sporcu Beslenmesi yanıtlanır.
 * - Spor dışı soruları (siyaset, teknoloji, genel sohbet, hava durumu vb.) kesinlikle reddeder.
 * - Üye kullanıcıların güç verilerini ve hedeflerini analiz ederek kişiselleştirilmiş rehberlik sunar.
 */

const AICoach = {
  isOpen: false,
  isTyping: false,
  messages: [],

  init() {
    this.bindEvents();
    this.updateAuthState();
  },

  bindEvents() {
    const launcher = document.getElementById("ai-widget-launcher");
    if (launcher) {
      launcher.addEventListener("click", () => this.toggleChat());
    }

    const closeBtn = document.getElementById("ai-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeChat());
    }

    const form = document.getElementById("ai-chat-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }
  },

  toggleChat() {
    this.isOpen ? this.closeChat() : this.openChat();
  },

  openChat() {
    this.isOpen = true;
    const windowEl = document.getElementById("ai-chat-window");
    if (windowEl) windowEl.classList.add("open");

    this.updateAuthState();

    if (this.messages.length === 0) {
      this.sendInitialGreeting();
    }
  },

  closeChat() {
    this.isOpen = false;
    const windowEl = document.getElementById("ai-chat-window");
    if (windowEl) windowEl.classList.remove("open");
  },

  updateAuthState() {
    // HERKESE AÇIK: Kilit ekranı kaldırıldı, input ve gönder butonu herkes için daima aktif!
    const guestOverlay = document.getElementById("ai-guest-overlay");
    if (guestOverlay) guestOverlay.style.display = "none";

    const inputField = document.getElementById("ai-user-input");
    const sendBtn = document.getElementById("ai-send-btn");
    if (inputField) inputField.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
  },

  async sendInitialGreeting() {
    const user = CalisthenicsAPI.getCurrentUser();

    if (user) {
      const goals = await CalisthenicsAPI.getGoals() || [];
      const targetSkills = CALISTHENICS_DATA.skills.filter(s => goals.includes(s.id)).map(s => s.name);

      let greeting = `Selam **${user.name}**! Ben Aether Calisthenics & Spor Yapay Zeka Koçun 🤖⚡\n\n`;
      if (targetSkills.length > 0) {
        greeting += `Hedeflerin listemde hazır: **${targetSkills.join(', ')}** üzerinde çalışıyorsun.\n\n`;
      }
      greeting += `Hareket formları, biyomekanik, tendon ağrısı, antrenman splitleri veya sporcu beslenmesi hakkında kafana takılan her şeyi sorabilirsin.\n\n*(Not: Yalnızca spor, fitness ve calisthenics konularında yanıt vermekteyim!)*`;
      this.addBotMessage(greeting);
    } else {
      let greeting = `Selam sporcu! Ben **Aether Calisthenics & Fitness Yapay Zeka Koçun** 🤖⚡\n\n` +
        `Bana Calisthenics hareketleri (*Planche, Front Lever, Muscle-Up vb.*), vücut ağırlığı antrenmanları, form düzeltmeleri, tendon sağlığı veya sporcu beslenmesi hakkında her şeyi sorabilirsin.\n\n` +
        `⚠️ **Kural:** Ben yalnızca spor, fitness ve antrenman odaklı bir koçum; spor dışı soruları yanıtlamıyorum. Aklındaki antrenman sorusu nedir?`;
      this.addBotMessage(greeting);
    }
  },

  async handleUserSubmit() {
    const input = document.getElementById("ai-user-input");
    if (!input) return;

    const text = input.value.trim();
    if (!text || this.isTyping) return;

    input.value = "";
    this.addUserMessage(text);

    await this.processQuery(text);
  },

  askQuickQuestion(questionText) {
    if (!this.isOpen) this.openChat();
    this.addUserMessage(questionText);
    this.processQuery(questionText);
  },

  addUserMessage(text) {
    this.messages.push({ sender: 'user', text });
    const container = document.getElementById("ai-messages-container");
    if (!container) return;

    const msgEl = document.createElement("div");
    msgEl.className = "ai-message user";
    msgEl.innerHTML = `<div class="ai-msg-bubble">${this.escapeHtml(text)}</div>`;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  },

  addBotMessage(text) {
    this.messages.push({ sender: 'bot', text });
    const container = document.getElementById("ai-messages-container");
    if (!container) return;

    const msgEl = document.createElement("div");
    msgEl.className = "ai-message bot";
    msgEl.innerHTML = `<div class="ai-msg-bubble">${this.formatMarkdown(text)}</div>`;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  },

  showTypingIndicator() {
    this.isTyping = true;
    const container = document.getElementById("ai-messages-container");
    if (!container) return;

    const indEl = document.createElement("div");
    indEl.className = "ai-typing-indicator";
    indEl.id = "ai-active-typing";
    indEl.innerHTML = `
      <div class="ai-typing-dot"></div>
      <div class="ai-typing-dot"></div>
      <div class="ai-typing-dot"></div>
    `;
    container.appendChild(indEl);
    container.scrollTop = container.scrollHeight;
  },

  hideTypingIndicator() {
    this.isTyping = false;
    const indEl = document.getElementById("ai-active-typing");
    if (indEl) indEl.remove();
  },

  /**
   * KATI SPOR VE FİTNESS UYGUNLUK KONTROLÜ
   * Soru spor, fitness, calisthenics, antrenman, biyomekanik veya sporcu beslenmesi ile ilgili mi?
   */
  isSportsRelated(query) {
    const q = query.toLowerCase().trim();

    // 1. Selamlaşma ve genel nezaket ifadeleri (izin verilir)
    const greetings = [
      "selam", "merhaba", "slm", "mrb", "naber", "nasılsın", "kimsin", "sen kimsin", 
      "ne yapabilirsin", "hey", "günaydın", "iyi günler", "iyi akşamlar", "teşekkür", "sağol", "eyvallah"
    ];
    if (greetings.some(g => q === g || q.startsWith(g + " ") || q.endsWith(" " + g))) {
      return { isSports: true, isGreeting: true };
    }

    // 2. Açıkça Spor Dışı Konular (Kara Liste)
    const nonSportsKeywords = [
      "siyaset", "seçim", "parti", "erdoğan", "chp", "akp", "cumhurbaşkanı", "meclis", "bakan", "oy ver", "milletvekili",
      "hava durumu", "yağmur", "kar yağar", "derece hava", "fırtına", "rüzgar",
      "film", "dizi", "sinema", "oyuncu", "aktör", "netflix", "hollywood", "oscar",
      "valorant", "league of legends", "lol ", "csgo", "counter strike", "minecraft", "gta", "playstation", "xbox", "pubg",
      "kod yaz", "javascript", "python", "yazılım", "programlama", "php kodu", "html kodu", "css kodu", "sql sorgusu",
      "dolar", "euro", "altın", "borsa", "hisse", "bitcoin", "kripto", "btc", "eth", "enflasyon", "faiz",
      "matematik", "integral", "türev", "geometri", "fizik formülü", "kimya denklemi", "tarih dersi", "osmanlı", "savaş",
      "aşk", "sevgili", "burç", "astroloji", "fal bak", "rüya tabiri", "evlilik", "felsefe", "şiir yaz", "şarkı söyle", "fıkra anlat"
    ];

    if (nonSportsKeywords.some(bad => q.includes(bad))) {
      return { isSports: false, isGreeting: false };
    }

    // 3. Spor, Calisthenics ve Biyomekanik Anahtar Kelimeleri (Beyaz Liste)
    const sportsKeywords = [
      // Hareketler & Beceriler
      "planche", "lever", "front lever", "back lever", "muscle up", "muscle-up", "handstand", "amut", "hspu",
      "barfiks", "pull up", "pullup", "chin up", "şınav", "push up", "pushup", "dips", "hollow body", "l sit", "lsit",
      "v sit", "vsit", "human flag", "bayrak", "freestyle", "360", "540", "salto", "geinger", "shrimp flip",
      "dragon flag", "german hang", "skin the cat", "pistol squat", "squat", "nordic curl", "pike push", "zanetti",
      "tuck", "straddle", "maltese", "victorian", "iron cross", "pseudo",
      // Anatomi & Eklemler
      "kas", "tendon", "eklem", "bağ doku", "biceps", "triceps", "omuz", "deltoid", "sırt", "lat", "latissimus",
      "trapez", "göğüs", "pec", "serratus", "bacak", "quad", "kuadriseps", "hamstring", "glute", "kalça", "kalf",
      "core", "karın", "oblik", "pelvik", "bel", "bilek", "dirsek", "skapula", "kürek kemiği", "postür",
      // Antrenman Terimleri & İlkeleri
      "spor", "fitness", "gym", "calisthenic", "kalistenik", "antrenman", "antreman", "idman", "egzersiz", "çalışma",
      "program", "rutin", "split", "ppl", "full body", "upper lower", "set", "tekrar", "rep", "rpe", "rir",
      "tükeniş", "failure", "dinlenme", "toparlanma", "recovery", "ısınma", "soğuma", "esneme", "mobilite",
      "stretching", "kardiyo", "cardio", "hiit", "koşu", "ağırlık", "dambıl", "bar", "halka", "ring", "parallette",
      "lastik", "direnç bandı", "tebeşir", "chalk", "deload", "hipertrofi", "kuvvet", "güç", "patlayıcı",
      // Biyomekanik & Form
      "form", "teknik", "açı", "tork", "kaldıraç", "biyomekanik", "kilit", "düz kol", "straight arm", "bent arm",
      "protraksiyon", "retraksiyon", "depresyon", "elevasyon", "cambré", "false grip", "ağrı", "sızı", "sakatlık", "tendonit",
      // Sporcu Beslenmesi
      "protein", "kreatin", "creatine", "bcaa", "whey", "beslenme", "karbonhidrat", "yağ", "kalori", "makro",
      "bulk", "cut", "definasyon", "kilo", "yağ yakımı", "su", "kolajen", "tavuk", "yumurta", "supplement", "öğün"
    ];

    const matchFound = sportsKeywords.some(word => q.includes(word));
    return { isSports: matchFound, isGreeting: false };
  },

  /**
   * Soruyu işleyip yanıt üretir (Katı Spor Filtreli)
   */
  async processQuery(query) {
    this.showTypingIndicator();

    const user = CalisthenicsAPI.getCurrentUser();
    const stats = await CalisthenicsAPI.getAssessment() || {};
    const goals = await CalisthenicsAPI.getGoals() || [];
    const targetSkills = CALISTHENICS_DATA.skills.filter(s => goals.includes(s.id));

    const q = query.toLowerCase().trim();

    // 500ms - 850ms doğal düşünme gecikmesi
    await new Promise(r => setTimeout(r, 650));

    // SPOR UYGUNLUK TESTİ
    const check = this.isSportsRelated(q);

    let reply = "";

    // DURUM A: SPOR DIŞI SORU -> KESİNLİKLE REDDET!
    if (!check.isSports) {
      reply = `🚫 **Yalnızca Spor ve Antrenman Sorularına Yanıt Veriyorum:**\n\n` +
        `Ben Aether Calisthenics & Spor Yapay Zeka Koçuyum. Sistemim yalnızca **calisthenics, vücut ağırlığı antrenmanları, fitness, biyomekanik, hareket formları, sakatlık önleme ve sporcu beslenmesi** üzerine programlanmıştır.\n\n` +
        `Siyaset, genel kültür, teknoloji, hava durumu, dersler veya spor dışı konularda yanıt üretemiyorum.\n\n` +
        `Lütfen Planche, Front Lever, barfiks, antrenman splitleri, eklem sağlığı veya beslenme gibi **sporla ilgili bir soru sor!** 🏋️‍♂️⚡`;
    }
    // DURUM B: SELAMLAŞMA
    else if (check.isGreeting) {
      const nameStr = user ? ` **${user.name}**` : ` sporcu`;
      reply = `Selam${nameStr}! Antrenmanlar nasıl gidiyor? Bugün calisthenics hareketleri, form düzeltme, tendon sağlığı veya antrenman programınla ilgili ne öğrenmek istersin? ⚡`;
    }
    // DURUM C: SPOR VE CALISTHENICS SORULARI
    else {
      // 1. PLANCHE & DİRSEK / TENDON AĞRISI
      if (q.includes("planche") && (q.includes("ağrı") || q.includes("dirsek") || q.includes("bilek") || q.includes("biceps") || q.includes("tendon"))) {
        reply = `⚠️ **Planche ve Distal Biceps Tendonu Uyarısı:**\n\n` +
          `Planche'ta dirseklerin iç kısmında sızı hissediyorsan bu kas değil, **distal biceps tendonu zorlanmasıdır**. Tendonlar kaslara göre 3-4 kat daha yavaş kanlanır ve adapte olur.\n\n` +
          `**Ne Yapmalısın?**\n` +
          `1. **Ağrı varken asla tam düz kol basma:** 3-5 gün düz kol statiklerine ara ver.\n` +
          `2. **Paralel Bar (Parallettes) Kullan:** Yerde eller düzken bilek ve dirsek açısı aşırı zorlanır. Paralel barlarda nötr tutuş dirsek stresini %40 azaltır.\n` +
          `3. **Tendon Güçlendirme:** Hafif kiloyla yüksek tekrarlı (20-25 tekrar) *Biceps Zottman Curl* ve *Direnç Bandı Düz Kol Çekişleri* ile bölgeye kan pompala.\n` +
          `4. **Aşama Düşür:** Doğrudan Straddle veya Tuck kasmak yerine, göğsünü kubbeleştirip *Planche Lean* ile statik bekle.`;
      }
      // 2. PLANCHE NASIL GELİŞİR
      else if (q.includes("planche") || q.includes("uçak")) {
        const userPP = stats.pseudoPushups || 0;
        const userDips = stats.dips || 0;
        reply = `🤸‍♂️ **Planche Biyomekaniği ve Gelişim Stratejisi:**\n\n` +
          `Planche'ın sırrı normal şınav sayısı değildir; **düz kol torku (straight-arm torque)** ve **maksimum skapula protraksiyonudur** (kürek kemiklerini dışarı kubbe gibi itmek).\n\n` +
          (user ? `Şu anki verilerine göre: **${userDips} Dips** ve **${userPP} Pseudo Planche Şınavı** basabiliyorsun.\n\n` : '') +
          `**Gelişim İpuçları:**\n` +
          `• **Planche Lean Açısı:** Ayak parmak uçlarındayken omuzlarını el bileklerinin en az 15 cm önüne geçir. Kollar dirsekten milimetrik dahi bükülmemeli!\n` +
          `• **Pseudo Planche Push-up:** Ellerini göğüs hizasında değil, tam kalça hizana koyarak şınav çek. Planche kuvvetini 1'e 1 taklit eden tek dinamik harekettir.\n` +
          `• **Zanetti Press:** Hafif dambıllarla sırt üstü yatıp düz kolları iki yana açarak ön omuz tendonlarını zırhla.`;
      }
      // 3. FRONT LEVER / KALÇA DÜŞMESİ
      else if (q.includes("front lever") || (q.includes("lever") && !q.includes("back lever"))) {
        const userPull = stats.pullups || 0;
        const userC2B = stats.chestToBar || 0;
        reply = `⚓ **Front Lever Ustalık Rehberi:**\n\n` +
          `Front Lever'da kalçanın aşağı düşmesi veya belin çökmesi iki ana nedenden kaynaklanır: **Skapula Depresyonu Eksikliği** veya **Posterior Pelvic Tilt (PPT) Kaybı**.\n\n` +
          (user ? `Mevcut Çekiş Kapasiten: **${userPull} Nizami Barfiks** ve **${userC2B} Göğse Barfiks**.\n\n` : '') +
          `**Düzeltme Adımları:**\n` +
          `1. **Kolları Bükme:** Dirsekleri kırdığın an latissimus kası gerilimini kaybeder. Barı yere doğru düz kollarla bastırarak vücudunu yükselt.\n` +
          `2. **Kalçayı Sık (Posterior Tilt):** Göbeğini içeri çek, kalçanı (glute) ve bacaklarını kütük gibi sık. Karın boşalırsa vücut muz gibi bükülür.\n` +
          `3. **Dragon Flag:** Yerde bench üzerinde Dragon Flag çalışmak Front Lever'daki aynı kaldıraç açısını oluşturur.`;
      }
      // 4. BACK LEVER
      else if (q.includes("back lever")) {
        reply = `🔄 **Back Lever ve Biceps Güvenliği:**\n\n` +
          `Back Lever omuz ekstansiyonu esnekliği ve biceps tendonunun gerilim altında güçlenmesini sağlar.\n\n` +
          `• **Ön Koşul:** Tam Back Lever denemeden önce barda en az 30 saniye rahatça *German Hang* asılı kalabilmelisin.\n` +
          `• **Tuck -> Adv Tuck -> Straddle:** Kademeli açıl. Kolları asla dirsekten bükme; bükük kol biceps tendonundaki yükü aniden yırtılma riskiyle katlar!`;
      }
      // 5. MUSCLE-UP GEÇİŞİ / TRANSITION
      else if (q.includes("muscle up") || q.includes("muscle-up")) {
        const userC2B = stats.chestToBar || 0;
        reply = `⚡ **Muscle-Up Geçişi (Transition) Sırrı:**\n\n` +
          `Muscle-up'ta takılmanın %90 sebebi çekişin azlığı değil, **çekişin açısıdır**.\n\n` +
          `**Altın Kurallar:**\n` +
          `• **Bara Doğru Değil, Barın Etrafına Çekil:** Barın altına dümdüz çekilirsen kafan bara çarpar. Gövdenle hafif geriye yay (C eğrisi) çizip göğüs hizasında barın üzerine devrilmelisin.\n` +
          `• **Chest-to-Bar Gücü:** Patlayıcı göğse/karına çekişi en az 5-6 temiz tekrara çıkardığında muscle-up çocuk oyuncağı haline gelir!\n` +
          `• **Bilek Devrimi (Brisk Wrists):** Bar göğüs altına indiği milisaniyede bileklerini barın üstüne hızla yuvarla.`;
      }
      // 6. AMUT / HANDSTAND & HSPU
      else if (q.includes("amut") || q.includes("handstand") || q.includes("hspu")) {
        reply = `🤸 **Serbest Amut (Handstand) ve HSPU Rehberi:**\n\n` +
          `Amutta durmak saf kuvvet değil, **el bileği mikro düzeltmeleridir**.\n\n` +
          `1. **Parmak Uçlarıyla Kavra (Cambré):** Avuç içini yere yapıştırma, parmak uçlarını pençe gibi yere bas. Öne düşecekken parmaklarınla yeri it, arkaya düşecekken avuç tabanına ağırlık ver.\n` +
          `2. **Omuzları Kulaklara İt (Elevation):** Yeri vücudundan uzağa iterek omuz eklemini kilitle.\n` +
          `3. **Amutta Şınav (HSPU):** Baş ile eller bir üçgen (tripod) oluşturmalıdır. Dirsekleri yana değil, 45 derece gövdeye yakın tut.`;
      }
      // 7. BESLENME, PROTEİN, KİLO & KREATİN
      else if (q.includes("protein") || q.includes("beslenme") || q.includes("kreatin") || q.includes("kilo") || q.includes("kalori") || q.includes("bulk") || q.includes("cut")) {
        reply = `🥗 **Calisthenics Sporcu Beslenmesi İlkeleri:**\n\n` +
          `Calisthenics'te başarı **Güç / Vücut Ağırlığı Oranına (Strength-to-Weight Ratio)** dayanır. Kas kütlesi yüksek, gereksiz vücut yağı düşük olmalıdır.\n\n` +
          `• **Protein İhtiyacı:** Günlük vücut ağırlığının kilogramı başına **1.6g - 2.0g** kaliteli protein (tavuk, yumurta, balık, lor/peynir, mercimek).\n` +
          `• **Kreatin Monohidrat:** Günlük 3-5 gram kreatin, kas içi ATP depolarını artırarak patlayıcı çekiş ve statik tutuş sürelerini %10-15 artırabilir.\n` +
          `• **Tendonlar İçin Kolajen & C Vitamini:** Antrenmandan 45 dakika önce alınan C vitamini destekli kolajen, tendon dokularının kanlanmasını ve onarımını hızlandırır.\n` +
          `• **Su:** Kas ve tendon esnekliği için günde en az 2.5 - 3 litre su tüketilmelidir.`;
      }
      // 8. BİLEK AĞRISI
      else if (q.includes("bilek") && (q.includes("ağrı") || q.includes("acı") || q.includes("zorlan"))) {
        reply = `🩹 **El Bileği Ağrısı ve Korunma Rehberi:**\n\n` +
          `Şınav, amut ve planche'ta el bilekleri 90 derece büküldüğünde büyük baskı altına girer.\n\n` +
          `1. **Parallettes (Paralel Barlar):** Bileklerin nötr (düz) pozisyonda kalmasını sağlayarak baskıyı sıfırlar.\n` +
          `2. **Bilek Isınması:** Her antrenman öncesi diz üstünde elleri öne, geriye ve yanlara çevirerek 5 dakika bilek esnetmesi yap.\n` +
          `3. **Parmakları Dışa Çevir:** Yerde şınav veya planche lean yaparken elleri 45 derece dışa doğru çevirmek bilek sıkışmasını engeller.`;
      }
      // 9. ANTRENMAN SIKLIĞI & DİNLENME
      else if (q.includes("haftada") || q.includes("gün") || q.includes("kaç kez") || q.includes("program") || q.includes("dinlenme") || q.includes("split")) {
        reply = `📅 **Calisthenics Antrenman Sıklığı:**\n\n` +
          `Statik hareketler (Planche, Lever) merkezi sinir sistemini (CNS) ve tendonları klasik ağırlık antrenmanından daha fazla yorar.\n\n` +
          `• **İdeal Sıklık:** Haftada **3 ila 4 gün** en yüksek verimi sağlar.\n` +
          `• **Toparlanma Kuralı:** Ağır bir itiş veya çekiş gününden sonra aynı eklem grubuna en az **48 saat** toparlanma süresi tanınmalıdır.\n` +
          `• **Sihirbaz:** Sitemizin *"Hedeflerim"* bölümündeki Akıllı Program Sihirbazını kullanarak günlerine ve seçtiğin split'e (PPL, Full Body vb.) göre tam takvim oluşturabilirsin!`;
      }
      // 10. BANA ÖZEL ANALİZ
      else if (q.includes("bana özel") || q.includes("durum") || q.includes("analiz") || q.includes("seviyem")) {
        if (user) {
          reply = `📊 **Kişisel Güç ve Darboğaz Raporun:**\n\n` +
            `• Nizami Barfiks: **${stats.pullups || 0} tekrar**\n` +
            `• Patlayıcı Göğse Barfiks: **${stats.chestToBar || 0} tekrar**\n` +
            `• Paralel Bar Dips: **${stats.dips || 0} tekrar**\n` +
            `• Pseudo Planche Şınav: **${stats.pseudoPushups || 0} tekrar**\n` +
            `• Duvarda Amut: **${stats.handstandWall || 0} saniye**\n\n`;

          if (targetSkills.length > 0) {
            reply += `Seçili hedeflerin: **${targetSkills.map(s => s.name).join(', ')}**.\n\n`;
            reply += `💡 **Koç Tavsiyesi:** `;
            if ((stats.pseudoPushups || 0) < 10 && targetSkills.some(s => s.id === 'planche')) {
              reply += `Planche için en büyük açığın öne eğimli itiş kuvveti. Programında önceliği *Planche Lean* ve *Pseudo Planche Push-up* çalışmalarına vermelisin.`;
            } else if ((stats.chestToBar || 0) < 5 && targetSkills.some(s => s.id === 'front-lever' || s.id === 'muscle-up')) {
              reply += `Lever ve Muscle-up için patlayıcı çekişi 5 tekrarın üzerine çıkarmaya odaklanmalısın.`;
            } else {
              reply += `Temel kuvvet altyapın sağlam görünüyor! Doğrudan aşamalı teknik kilitlenmelerine ve nöral adaptasyona odaklanabilirsin.`;
            }
          } else {
            reply += `Henüz "Alanlar" kısmından hedef hareket seçmedin. İstediğin hareketleri ekle, onlar için tam teşhis koyayım!`;
          }
        } else {
          reply = `📊 **Genel Seviye Ölçüm Kriterleri:**\n\n` +
            `Kişisel analiz yapabilmem için şu 4 temel metriği bilmem gerekir:\n` +
            `1. Kaç nizami barfiks çekiyorsun?\n` +
            `2. Kaç paralel bar dips yapabiliyorsun?\n` +
            `3. Duvarda kaç saniye amutta kalabiliyorsun?\n` +
            `4. Hedeflediğin hareket hangisi (Planche, Front Lever vb.)?\n\n` +
            `*(İpucu: Siteye ücretsiz üye olup "Temel Güç Analizi" formunu doldurursan bu analizi sistem senin net verilerine göre otomatik yapar!)*`;
        }
      }
      // 11. BUGÜN NE ÇALIŞAYIM
      else if (q.includes("bugün") || q.includes("ne çalış") || q.includes("antrenman yap")) {
        reply = `🔥 **Günün Dengeli Calisthenics Seansı:**\n\n` +
          `1. **Isınma (10 Dk):** Bilek rotasyonları, omuz dislokasyonları ve skapula aktivasyonu.\n` +
          `2. **Beceri & Statik Bloğu (15 Dk):** Sinir sistemi tazeyken Planche Lean veya Tuck Front Lever (4 set x Form bozulana kadar).\n` +
          `3. **Temel Kuvvet Bloğu (25 Dk):** Derin Dips + Ağırlıklı/Nizami Barfiks süper seti (4 set x 6-8 tekrar).\n` +
          `4. **Core Kapanışı (10 Dk):** 3 set Hollow Body Hold (30 sn) + L-Sit basışı.`;
      }
      // 12. GENEL SPOR VE EGZERSİZ CEVABI
      else {
        reply = `Harika bir spor sorusu! Calisthenics ve vücut ağırlığı antrenmanlarında temel prensip **kaldıraç kollarını (lever arm)**, **eklem gerilimini** ve **progresif aşamalandırmayı (progression)** doğru yönetmektir.\n\n` +
          `Daha spesifik bir tavsiye için bana hareketin formunu, dinlenme sürelerini, set/tekrar sayılarını veya eklem sağlığıyla ilgili detayları sorabilirsin! 🏋️‍♂️⚡`;
      }
    }

    this.hideTypingIndicator();
    this.addBotMessage(reply);
  },

  formatMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '&bull; ');
  },

  escapeHtml(string) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return String(string).replace(/[&<>"']/g, s => entityMap[s]);
  }
};

window.AICoach = AICoach;
