/**
 * AETHER CALISTHENICS - ANA UYGULAMA MANTIĞI
 * SPA Bölüm Yönlendirmesi, Hareket Filtreleme, Kıyaslama Algoritması,
 * Üyelik & Değerlendirme Entegrasyonu ve Sihirbaz Yönetimi.
 */

// Global Uygulama Durumu (State)
const AppState = {
  currentCategory: "statik",
  selectedSkillForModal: null,
  activeWizardStep: 1,
  wizardConfig: {
    daysCount: 3,
    selectedDays: ["Pazartesi", "Çarşamba", "Cuma"],
    splitType: "push_pull_legs",
    duration: 60
  },
  filters: {
    searchQuery: "",
    difficulty: "all",
    muscle: "all",
    crossCategory: false
  },
  currentGeneratedProgram: null
};

// Sayfa Yüklendiğinde Başlat
document.addEventListener("DOMContentLoaded", async () => {
  initHeroRandomizer();
  updateAuthUI();
  selectCategory("statik");
  await refreshGoalsCounter();
  if (window.AICoach) AICoach.init();
  
  // URL hash kontrolü
  const hash = window.location.hash.replace("#", "");
  if (hash && ["home", "alanlar", "hedeflerim", "programlarim"].includes(hash)) {
    switchSection(hash);
  }
});

/* ==========================================================================
   1. BÖLÜM VE SAYFA YÖNLENDİRME (SPA ROUTING)
   ========================================================================== */
function switchSection(sectionId) {
  // Tüm bölümleri gizle
  document.querySelectorAll("section[id^='section-']").forEach(sec => {
    sec.style.display = "none";
  });

  // İlgili bölümü aç
  const target = document.getElementById(`section-${sectionId}`);
  if (target) {
    target.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Navbar linklerini güncelle
  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
  const navItem = document.getElementById(`nav-${sectionId}`);
  if (navItem) navItem.classList.add("active");

  // Bölüme özel veri yüklemeleri
  if (sectionId === "hedeflerim") {
    loadGoalsSection();
  } else if (sectionId === "programlarim") {
    loadSavedProgramsSection();
  }
}

function checkAuthAndGoGoals() {
  const user = CalisthenicsAPI.getCurrentUser();
  if (!user) {
    showToast("Özel program oluşturmak için önce lütfen üye olun veya giriş yapın.", "info");
    openModal("register-modal");
  } else {
    switchSection("hedeflerim");
  }
}

/* ==========================================================================
   2. HERO GÜNÜN HAREKETİ RASTGELE SEÇİCİ
   ========================================================================== */
function initHeroRandomizer() {
  const featuredSkills = CALISTHENICS_DATA.skills.filter(s => s.levelRank >= 3);
  const randomSkill = featuredSkills[Math.floor(Math.random() * featuredSkills.length)];

  if (randomSkill) {
    document.getElementById("hero-card-img").src = randomSkill.image;
    const heroBlur = document.getElementById("hero-blur-bg");
    if (heroBlur) heroBlur.style.backgroundImage = `url('${encodeURI(randomSkill.image)}')`;
    document.getElementById("hero-card-name").textContent = randomSkill.name;
    document.getElementById("hero-card-level").textContent = randomSkill.level;
    document.getElementById("hero-card-desc").textContent = randomSkill.shortDescription;
    
    const cat = CALISTHENICS_DATA.categories.find(c => c.id === randomSkill.categoryId);
    document.getElementById("hero-card-cat").textContent = cat ? cat.name : "Calisthenics";

    let reqTxt = "Temel Güç Şartı";
    if (randomSkill.minStrengthReqs) {
      const parts = [];
      if (randomSkill.minStrengthReqs.pullups) parts.push(`${randomSkill.minStrengthReqs.pullups} Barfiks`);
      if (randomSkill.minStrengthReqs.pushups) parts.push(`${randomSkill.minStrengthReqs.pushups} Şınav`);
      if (randomSkill.minStrengthReqs.dips) parts.push(`${randomSkill.minStrengthReqs.dips} Dips`);
      reqTxt = parts.slice(0, 2).join(' + ');
    }
    document.getElementById("hero-card-req").textContent = reqTxt;
  }
}

/* ==========================================================================
   3. ALANLAR & KATEGORİ & CANLI FİLTRELEME
   ========================================================================== */
async function selectCategory(categoryId) {
  AppState.currentCategory = categoryId;

  // Kategori Butonları Görünümü
  document.querySelectorAll(".category-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === categoryId);
  });

  // Kategori Bilgi Bannerını Güncelle
  const catData = CALISTHENICS_DATA.categories.find(c => c.id === categoryId);
  const banner = document.getElementById("category-banner");
  if (catData && banner) {
    banner.className = `category-info-banner ${categoryId}`;
    document.getElementById("category-banner-title").textContent = catData.name;
    document.getElementById("category-banner-desc").textContent = catData.description;
  }

  // Hareketleri filtreleyerek ekrana bas
  await renderFilteredSkills();
}

function handleSkillSearch(val) {
  AppState.filters.searchQuery = (val || "").trim().toLowerCase();
  const clearBtn = document.getElementById("search-clear-btn");
  if (clearBtn) {
    clearBtn.style.display = AppState.filters.searchQuery ? "flex" : "none";
  }
  renderFilteredSkills();
}

function clearSkillSearch() {
  const input = document.getElementById("skill-search-input");
  if (input) input.value = "";
  handleSkillSearch("");
}

function handleDifficultyFilter(val) {
  AppState.filters.difficulty = val;
  renderFilteredSkills();
}

function handleMuscleFilter(val) {
  AppState.filters.muscle = val;
  renderFilteredSkills();
}

function handleCrossCategoryToggle(checked) {
  AppState.filters.crossCategory = Boolean(checked);
  renderFilteredSkills();
}

function resetAllFilters() {
  AppState.filters = {
    searchQuery: "",
    difficulty: "all",
    muscle: "all",
    crossCategory: false
  };

  const searchInput = document.getElementById("skill-search-input");
  if (searchInput) searchInput.value = "";
  const clearBtn = document.getElementById("search-clear-btn");
  if (clearBtn) clearBtn.style.display = "none";

  const diffSelect = document.getElementById("filter-difficulty");
  if (diffSelect) diffSelect.value = "all";

  const muscleSelect = document.getElementById("filter-muscle");
  if (muscleSelect) muscleSelect.value = "all";

  const crossToggle = document.getElementById("filter-cross-category");
  if (crossToggle) crossToggle.checked = false;

  renderFilteredSkills();
}

async function renderFilteredSkills() {
  const { searchQuery, difficulty, muscle, crossCategory } = AppState.filters;

  // Temel havuz
  let pool = CALISTHENICS_DATA.skills;
  if (!crossCategory) {
    pool = pool.filter(s => s.categoryId === AppState.currentCategory);
  }

  // 1. Arama filtresi (İsim, Türkçe İsim, Açıklama veya Kas eşleşmesi)
  if (searchQuery) {
    pool = pool.filter(s => {
      const nameMatch = s.name.toLowerCase().includes(searchQuery);
      const trNameMatch = s.turkishName.toLowerCase().includes(searchQuery);
      const descMatch = s.shortDescription.toLowerCase().includes(searchQuery);
      const muscleMatch = s.muscles.some(m => m.toLowerCase().includes(searchQuery));
      return nameMatch || trNameMatch || descMatch || muscleMatch;
    });
  }

  // 2. Zorluk seviyesi filtresi
  if (difficulty && difficulty !== "all") {
    pool = pool.filter(s => s.level.toLowerCase().includes(difficulty.toLowerCase()));
  }

  // 3. Hedef kas grubu filtresi
  if (muscle && muscle !== "all") {
    pool = pool.filter(s => s.muscles.some(m => m.toLowerCase().includes(muscle.toLowerCase())));
  }

  // Durum çubuğu ve Sıfırla butonunu güncelle
  const isFilterActive = Boolean(searchQuery || difficulty !== "all" || muscle !== "all" || crossCategory);
  const resetBtn = document.getElementById("btn-reset-filters");
  if (resetBtn) resetBtn.style.display = isFilterActive ? "inline-flex" : "none";

  const statusText = document.getElementById("filter-matched-text");
  if (statusText) {
    statusText.textContent = isFilterActive 
      ? `Filtrelenen: ${pool.length} hareket bulundu` 
      : `Toplam ${pool.length} hareket listeleniyor`;
  }

  const categorySkillsCount = document.getElementById("category-skills-count");
  if (categorySkillsCount && !crossCategory) {
    categorySkillsCount.textContent = `${pool.length} Hareket`;
  }

  // Grid içeriğini oluştur
  const container = document.getElementById("skills-container");
  if (!container) return;
  container.innerHTML = "";

  if (pool.length === 0) {
    container.innerHTML = `
      <div class="empty-filter-state">
        <i class="fa-solid fa-filter-circle-xmark"></i>
        <h4 style="font-size:1.25rem; font-weight:700; margin-bottom:8px; color:#fff;">Eşleşen Hareket Bulunamadı</h4>
        <p style="font-size:0.9rem; max-width:460px; margin:0 auto 18px;">
          Girdiğiniz arama terimine veya seçili filtrelere uygun bir hareket bulunamadı. Filtreleri sıfırlayarak tüm hareketleri görebilirsiniz.
        </p>
        <button class="btn btn-secondary btn-sm" onclick="resetAllFilters()">
          <i class="fa-solid fa-rotate-left"></i> Filtreleri Sıfırla
        </button>
      </div>
    `;
    return;
  }

  const userGoals = await CalisthenicsAPI.getGoals();

  pool.forEach(skill => {
    const isGoal = userGoals.includes(skill.id);
    const cat = CALISTHENICS_DATA.categories.find(c => c.id === skill.categoryId);
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <div class="skill-card-img">
        <div class="card-blur-bg" style="background-image: url('${encodeURI(skill.image)}');"></div>
        <img src="${skill.image}" alt="${skill.name}" loading="lazy">
        <span class="skill-badge-category">${cat ? cat.badge : 'Beceri'}</span>
        <span class="skill-badge-level">${skill.level}</span>
      </div>
      <div class="skill-card-body">
        <h4 class="skill-card-title">${skill.name}</h4>
        <div class="skill-card-sub">${skill.turkishName}</div>
        <p class="skill-card-desc">${skill.shortDescription}</p>
        
        <div class="skill-muscles">
          ${skill.muscles.slice(0, 3).map(m => `<span class="muscle-chip">${m}</span>`).join('')}
        </div>

        <div class="skill-card-actions">
          <button class="btn btn-secondary btn-sm btn-card-detail" onclick="viewSkillDetails('${skill.id}')">
            <i class="fa-solid fa-eye"></i> Detayları Gör
          </button>
          <button class="btn-card-goal ${isGoal ? 'in-goals' : ''}" 
                  id="goal-btn-${skill.id}" 
                  onclick="toggleGoal('${skill.id}', event)" 
                  title="${isGoal ? 'Hedeflerimden Çıkar' : 'Hedeflerime Ekle'}">
            <i class="fa-solid ${isGoal ? 'fa-check' : 'fa-plus'}"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ==========================================================================
   4. HAREKET DETAY MODALI
   ========================================================================== */
async function viewSkillDetails(skillId) {
  const skill = CALISTHENICS_DATA.skills.find(s => s.id === skillId);
  if (!skill) return;

  AppState.selectedSkillForModal = skill;

  document.getElementById("m-skill-img").src = skill.image;
  const modalBlur = document.getElementById("m-skill-blur-bg");
  if (modalBlur) modalBlur.style.backgroundImage = `url('${encodeURI(skill.image)}')`;

  document.getElementById("m-skill-name").textContent = skill.name;
  document.getElementById("m-skill-sub").textContent = skill.turkishName;
  document.getElementById("m-skill-level").textContent = skill.level;
  document.getElementById("m-skill-desc").textContent = skill.fullDescription;

  // Kaslar
  const musclesBox = document.getElementById("m-skill-muscles");
  musclesBox.innerHTML = skill.muscles.map(m => `<span class="muscle-chip" style="font-size:0.8rem; padding:4px 10px;">${m}</span>`).join('');

  // Kullanıcı ve Güç Seviyesi Kıyaslama
  const user = CalisthenicsAPI.getCurrentUser();
  const userStats = user ? (await CalisthenicsAPI.getAssessment() || {}) : null;

  const reqsBox = document.getElementById("m-skill-reqs");
  reqsBox.innerHTML = "";

  if (skill.minStrengthReqs) {
    for (const [key, reqVal] of Object.entries(skill.minStrengthReqs)) {
      let label = key;
      if (key === 'pullups') label = 'Nizami Barfiks (Tekrar)';
      else if (key === 'chestToBar') label = 'Göğse/Karına Patlayıcı Barfiks';
      else if (key === 'dips') label = 'Paralel Bar Dips (Tekrar)';
      else if (key === 'pseudoPushups') label = 'Pseudo Planche / Pike Şınav';
      else if (key === 'hollowHold') label = 'Hollow Body Duruşu (Sn)';
      else if (key === 'handstandWall') label = 'Duvarda Amut (Sn)';
      else if (key === 'lsitHold') label = 'L-Sit Duruşu (Sn)';

      const currentVal = userStats ? (userStats[key] || 0) : null;
      let statusHtml = `<span class="req-status" style="background:rgba(255,255,255,0.08); color:var(--text-dim);">Gereken: ${reqVal}</span>`;

      if (currentVal !== null) {
        const isPass = currentVal >= reqVal;
        statusHtml = `<span class="req-status ${isPass ? 'pass' : 'fail'}">${currentVal} / ${reqVal} ${isPass ? '✓ Yeterli' : '✗ Eksik'}</span>`;
      }

      const reqItem = document.createElement("div");
      reqItem.className = "req-item";
      reqItem.innerHTML = `<span><strong>${label}</strong></span> ${statusHtml}`;
      reqsBox.appendChild(reqItem);
    }
  } else {
    reqsBox.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem;">Bu hareket için özel güç eşiği gerekmemektedir.</div>`;
  }

  // İlerleyiş Basamakları
  const progBox = document.getElementById("m-skill-progressions");
  progBox.innerHTML = "";
  if (skill.progressions && skill.progressions.length > 0) {
    skill.progressions.forEach(p => {
      const pItem = document.createElement("div");
      pItem.className = "progression-step-item";
      const imgHtml = p.image ? `
        <div class="progression-step-img-wrap">
          <div class="step-blur-bg" style="background-image: url('${encodeURI(p.image)}');"></div>
          <img src="${p.image}" alt="${p.name}" class="step-main-img">
        </div>` : '';
      pItem.innerHTML = `
        <div class="step-num">Aşama ${p.step} • ${p.duration}</div>
        <div class="step-title">${p.name}</div>
        <div class="step-desc">${p.desc}</div>
        ${imgHtml}
      `;
      progBox.appendChild(pItem);
    });
  }

  // Üyelik Kontrolü & Buton Görünürlüğü
  const guestLock = document.getElementById("m-guest-lock");
  const userActions = document.getElementById("m-user-actions");
  const toggleBtn = document.getElementById("m-btn-toggle-goal");

  if (!user) {
    guestLock.style.display = "block";
    userActions.style.display = "none";
  } else {
    guestLock.style.display = "none";
    userActions.style.display = "flex";

    const userGoals = await CalisthenicsAPI.getGoals();
    const isGoal = userGoals.includes(skill.id);
    toggleBtn.className = isGoal ? "btn btn-accent" : "btn btn-primary";
    toggleBtn.innerHTML = isGoal 
      ? `<i class="fa-solid fa-check"></i> Hedeflerimde Mevcut (Çıkar)` 
      : `<i class="fa-solid fa-plus"></i> Hedeflerime Ekle`;
  }

  openModal("skill-detail-modal");
}

/* ==========================================================================
   5. HEDEFLERİM YÖNETİMİ
   ========================================================================== */
async function toggleGoal(skillId, event) {
  if (event) event.stopPropagation();

  const user = CalisthenicsAPI.getCurrentUser();
  if (!user) {
    showToast("Hedef ekleyip özel program oluşturmak için lütfen üye olun.", "info");
    openModal("register-modal");
    return;
  }

  const currentGoals = await CalisthenicsAPI.getGoals();
  const exists = currentGoals.includes(skillId);

  if (exists) {
    await CalisthenicsAPI.removeGoal(skillId);
    showToast("Hareket hedeflerinden çıkarıldı.", "info");
  } else {
    await CalisthenicsAPI.addGoal(skillId);
    showToast("Hareket hedeflerine eklendi!", "success");
  }

  // UI güncelle
  const cardGoalBtn = document.getElementById(`goal-btn-${skillId}`);
  if (cardGoalBtn) {
    cardGoalBtn.classList.toggle("in-goals", !exists);
    cardGoalBtn.innerHTML = `<i class="fa-solid ${!exists ? 'fa-check' : 'fa-plus'}"></i>`;
  }

  await refreshGoalsCounter();
  if (document.getElementById("section-hedeflerim").style.display === "block") {
    loadGoalsSection();
  }
}

async function toggleSkillGoalFromModal() {
  if (!AppState.selectedSkillForModal) return;
  await toggleGoal(AppState.selectedSkillForModal.id);
  // Modal içi butonu güncelle
  const userGoals = await CalisthenicsAPI.getGoals();
  const isGoal = userGoals.includes(AppState.selectedSkillForModal.id);
  const toggleBtn = document.getElementById("m-btn-toggle-goal");
  if (toggleBtn) {
    toggleBtn.className = isGoal ? "btn btn-accent" : "btn btn-primary";
    toggleBtn.innerHTML = isGoal 
      ? `<i class="fa-solid fa-check"></i> Hedeflerimde Mevcut (Çıkar)` 
      : `<i class="fa-solid fa-plus"></i> Hedeflerime Ekle`;
  }
}

async function refreshGoalsCounter() {
  const user = CalisthenicsAPI.getCurrentUser();
  const counter = document.getElementById("goals-count");
  if (!user) {
    counter.style.display = "none";
    return;
  }
  const goals = await CalisthenicsAPI.getGoals();
  if (goals.length > 0) {
    counter.style.display = "inline-block";
    counter.textContent = goals.length;
  } else {
    counter.style.display = "none";
  }
}

async function loadGoalsSection() {
  const user = CalisthenicsAPI.getCurrentUser();
  const guestAlert = document.getElementById("goals-guest-alert");
  const userPanel = document.getElementById("goals-user-panel");

  if (!user) {
    guestAlert.style.display = "block";
    userPanel.style.display = "none";
    return;
  }

  guestAlert.style.display = "none";
  userPanel.style.display = "block";

  const goalIds = await CalisthenicsAPI.getGoals();
  const chipsContainer = document.getElementById("goals-list-chips");
  const noGoalsMsg = document.getElementById("no-goals-message");
  const diagBox = document.getElementById("goals-diagnostic-box");
  const startWizardBanner = document.getElementById("start-wizard-banner");

  chipsContainer.innerHTML = "";

  if (goalIds.length === 0) {
    noGoalsMsg.style.display = "block";
    diagBox.style.display = "none";
    startWizardBanner.style.display = "none";
    document.getElementById("program-wizard").style.display = "none";
    return;
  }

  noGoalsMsg.style.display = "none";
  diagBox.style.display = "block";
  startWizardBanner.style.display = "block";

  const targetSkills = CALISTHENICS_DATA.skills.filter(s => goalIds.includes(s.id));

  // Çipleri listele
  targetSkills.forEach(skill => {
    const chip = document.createElement("div");
    chip.className = "goal-chip";
    chip.innerHTML = `
      <span>${skill.name}</span>
      <button class="goal-chip-remove" onclick="toggleGoal('${skill.id}')" title="Hedefi Kaldır">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    chipsContainer.appendChild(chip);
  });

  // Kullanıcı Güç Seviyesi ve Darboğaz Analizi
  const userStats = await CalisthenicsAPI.getAssessment() || {
    pullups: 8, chestToBar: 3, dips: 12, pseudoPushups: 5, hollowHold: 30, lsitHold: 10, handstandWall: 20
  };

  const diagItemsContainer = document.getElementById("diagnostic-items-container");
  diagItemsContainer.innerHTML = "";

  targetSkills.forEach(skill => {
    const evalResult = ProgramGenerator.evaluateSkillReadiness(skill, userStats);
    const item = document.createElement("div");
    item.className = "diagnostic-item";

    const isStrength = evalResult.mode === "STRENGTH_BUILDING_WITH_PREP";

    item.innerHTML = `
      <div class="diag-title-row">
        <strong style="font-size:1.05rem;">${skill.name} (${skill.turkishName})</strong>
        <span class="diag-badge ${isStrength ? 'strength' : 'technique'}">
          ${isStrength ? '⚠️ Temel Güç Açığı Mevcut' : '✓ Güç Yeterli: Teknik Odaklı'}
        </span>
      </div>
      <p class="diag-explanation">
        ${evalResult.explanation}
      </p>
      ${evalResult.bottlenecks.length > 0 ? `
        <div style="margin-top:8px; font-size:0.8rem; color:#ffb300;">
          <strong>Eksik Kriterler:</strong> ${evalResult.bottlenecks.map(b => `${b.label}: ${b.current} (Gereken: ${b.required})`).join(', ')}
        </div>
      ` : ''}
    `;
    diagItemsContainer.appendChild(item);
  });
}

/* ==========================================================================
   6. AKILLI PROGRAM SİHİRBAZI (WIZARD)
   ========================================================================== */
function startProgramWizard() {
  document.getElementById("program-wizard").style.display = "block";
  goToWizardStep(1);
  document.getElementById("program-wizard").scrollIntoView({ behavior: "smooth" });
}

function goToWizardStep(stepNum) {
  AppState.activeWizardStep = stepNum;

  // Adımları gizle / göster
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`wizard-step-${i}`);
    if (stepEl) stepEl.classList.toggle("active", i === stepNum);

    const dotEl = document.getElementById(`dot-step-${i}`);
    if (dotEl) {
      dotEl.classList.toggle("active", i === stepNum);
      dotEl.classList.toggle("completed", i < stepNum);
    }
  }
}

function selectFrequency(days) {
  AppState.wizardConfig.daysCount = days;
  document.querySelectorAll("#wizard-step-1 .option-card").forEach(c => {
    c.classList.toggle("selected", Number(c.dataset.days) === days);
  });
}

function toggleDaySelection(btn) {
  btn.classList.toggle("selected");
  const selectedButtons = document.querySelectorAll("#day-selector-pills .day-badge-btn.selected");
  AppState.wizardConfig.selectedDays = Array.from(selectedButtons).map(b => b.dataset.day);
}

function selectSplit(splitType) {
  AppState.wizardConfig.splitType = splitType;
  document.querySelectorAll("#wizard-step-2 .option-card").forEach(c => {
    c.classList.toggle("selected", c.dataset.split === splitType);
  });
}

function selectDuration(mins) {
  AppState.wizardConfig.duration = mins;
  document.querySelectorAll("#wizard-step-3 .option-card").forEach(c => {
    c.classList.toggle("selected", Number(c.dataset.duration) === mins);
  });
}

async function finalizeAndBuildProgram() {
  const user = CalisthenicsAPI.getCurrentUser();
  const goalIds = await CalisthenicsAPI.getGoals();
  const targetSkills = CALISTHENICS_DATA.skills.filter(s => goalIds.includes(s.id));

  const userStats = await CalisthenicsAPI.getAssessment() || {
    pullups: 8, chestToBar: 3, dips: 12, pseudoPushups: 5, hollowHold: 30, lsitHold: 10, handstandWall: 20
  };

  // Program Oluşturucu Motorunu Çalıştır
  const program = ProgramGenerator.generateProgram({
    targetSkills: targetSkills,
    userStats: userStats,
    daysCount: AppState.wizardConfig.daysCount,
    selectedDays: AppState.wizardConfig.selectedDays,
    splitType: AppState.wizardConfig.splitType,
    sessionDuration: AppState.wizardConfig.duration
  });

  AppState.currentGeneratedProgram = program;

  // Sonuç HTML'ini Oluştur
  renderGeneratedProgram(program);
  goToWizardStep(4);
}

function renderGeneratedProgram(program) {
  const container = document.getElementById("generated-program-result");
  if (!container) return;

  container.innerHTML = `
    <div class="program-output-card">
      <div class="program-header-row">
        <div>
          <span class="section-tag">Kişiselleştirilmiş Haftalık Plan</span>
          <h3 style="font-size:1.6rem; font-weight:800;">${program.meta.splitType}</h3>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">
            Haftada <strong>${program.meta.daysPerWeek} Gün</strong> (${program.meta.selectedDays.join(', ')}) • 
            Seans Süresi: <strong>${program.meta.sessionDuration}</strong>
          </p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.print()">
          <i class="fa-solid fa-print"></i> Yazdır / PDF İndir
        </button>
      </div>

      <div style="background:rgba(0, 229, 255, 0.06); border-left:4px solid var(--accent-cyan); padding:14px 18px; margin-bottom:24px; border-radius:0 8px 8px 0;">
        <strong style="color:var(--accent-cyan); display:block; margin-bottom:4px;">Programlama Stratejisi Notu:</strong>
        <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5;">
          Hedeflediğin hareketler için girdiğin temel kuvvet verileri incelendi. 
          Kuvvet eksiği olan hareketlerde <strong>[GÜÇ & TENDON HAZIRLIĞI]</strong>, gücü hazır olanlarda ise <strong>[SAF TEKNİK & AŞAMA]</strong> protokolü uygulandı.
        </p>
      </div>

      <div class="program-schedule-grid">
        ${program.schedule.map(day => `
          <div class="program-day-card">
            <div class="program-day-header">
              <h4>${day.title} (${day.dayName})</h4>
              <span class="day-badge">${day.focusTag}</span>
            </div>

            <table class="exercise-table">
              <thead>
                <tr>
                  <th style="width:40%;">Egzersiz</th>
                  <th style="width:20%;">Tür</th>
                  <th style="width:20%;">Set & Tekrar/Süre</th>
                  <th style="width:20%;">Dinlenme</th>
                </tr>
              </thead>
              <tbody>
                ${day.exercises.map(ex => `
                  <tr>
                    <td class="exercise-name-col">
                      ${ex.name}
                      ${ex.note ? `<span class="exercise-note">${ex.note}</span>` : ''}
                    </td>
                    <td><span style="font-size:0.8rem; color:var(--text-dim);">${ex.type}</span></td>
                    <td><strong>${ex.sets}</strong></td>
                    <td><span style="color:var(--accent-cyan);">${ex.rest}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border-subtle);">
        <h5 style="font-size:0.95rem; margin-bottom:8px; color:var(--text-main);">Önemli Antrenman Prensipleri:</h5>
        <ul style="list-style:disc; padding-left:20px; font-size:0.85rem; color:var(--text-muted); line-height:1.7;">
          ${program.principles.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

async function saveCurrentProgram() {
  if (!AppState.currentGeneratedProgram) return;

  await CalisthenicsAPI.saveProgram(AppState.currentGeneratedProgram);
  showToast("Program başarıyla kaydedildi! 'Programlarım' sekmesinden istediğin zaman ulaşabilirsin.", "success");
  switchSection("programlarim");
}

/* ==========================================================================
   7. KAYITLI PROGRAMLAR LİSTESİ
   ========================================================================== */
async function loadSavedProgramsSection() {
  const user = CalisthenicsAPI.getCurrentUser();
  const container = document.getElementById("saved-programs-container");

  if (!user) {
    container.innerHTML = `
      <div class="member-lock-banner">
        <h4><i class="fa-solid fa-lock"></i> Kayıtlı Programlarınızı Görmek İçin Giriş Yapın</h4>
        <p>Oluşturduğunuz programlar hesabınızda güvenle saklanır.</p>
        <button class="btn btn-primary btn-sm" onclick="openModal('login-modal')">Giriş Yap</button>
      </div>
    `;
    return;
  }

  const programs = await CalisthenicsAPI.getPrograms();

  if (programs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
        <i class="fa-solid fa-calendar-xmark" style="font-size:3rem; color:var(--text-dim); margin-bottom:16px; display:block;"></i>
        Henüz kayıtlı bir antrenman programınız bulunmuyor.
        <div style="margin-top:20px;">
          <button class="btn btn-primary" onclick="switchSection('hedeflerim')">
            <i class="fa-solid fa-wand-magic-sparkles"></i> İlk Programını Oluştur
          </button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:28px;">
      ${programs.map(prog => `
        <div class="program-output-card" style="margin-top:0;">
          <div class="program-header-row">
            <div>
              <span class="section-tag">${prog.generatedAt} Tarihinde Oluşturuldu</span>
              <h3 style="font-size:1.4rem; font-weight:700;">${prog.meta.splitType}</h3>
              <p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">
                ${prog.meta.daysPerWeek} Gün/Hafta (${prog.meta.selectedDays.join(', ')}) • Süre: ${prog.meta.sessionDuration}
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Yazdır
            </button>
          </div>

          <div class="program-schedule-grid">
            ${prog.schedule.map(d => `
              <div class="program-day-card">
                <div class="program-day-header">
                  <h4>${d.title} (${d.dayName})</h4>
                  <span class="day-badge">${d.focusTag}</span>
                </div>
                <table class="exercise-table">
                  <tbody>
                    ${d.exercises.map(ex => `
                      <tr>
                        <td class="exercise-name-col">${ex.name} ${ex.note ? `<span class="exercise-note">${ex.note}</span>` : ''}</td>
                        <td>${ex.sets}</td>
                        <td style="color:var(--accent-cyan);">${ex.rest}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   8. KULLANICI GİRİŞ, KAYIT VE DEĞERLENDİRME
   ========================================================================== */
function updateAuthUI() {
  const user = CalisthenicsAPI.getCurrentUser();
  const guestDiv = document.getElementById("auth-guest-actions");
  const userDiv = document.getElementById("auth-user-actions");

  if (user) {
    guestDiv.style.display = "none";
    userDiv.style.display = "flex";
    document.getElementById("nav-user-name").textContent = user.name;
    document.getElementById("nav-user-avatar").textContent = user.name.charAt(0).toUpperCase();
  } else {
    guestDiv.style.display = "flex";
    userDiv.style.display = "none";
  }

  if (window.AICoach) {
    AICoach.updateAuthState();
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pass = document.getElementById("reg-password").value;

  const res = await CalisthenicsAPI.register(name, email, pass);
  if (res.success) {
    showToast(`Hoş geldin ${name}! Hesabın başarıyla oluşturuldu.`, "success");
    closeModal("register-modal");
    updateAuthUI();
    // İlk kayıtta doğrudan temel değerlendirme modalını aç!
    setTimeout(() => {
      openAssessmentModal();
    }, 400);
  } else {
    showToast(res.message, "error");
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;

  const res = await CalisthenicsAPI.login(email, pass);
  if (res.success) {
    showToast(`Tekrar hoş geldin, ${res.user.name}!`, "success");
    closeModal("login-modal");
    updateAuthUI();
    refreshGoalsCounter();
    if (document.getElementById("section-hedeflerim").style.display === "block") {
      loadGoalsSection();
    }
  } else {
    showToast(res.message, "error");
  }
}

function logoutUser() {
  CalisthenicsAPI.logout();
  updateAuthUI();
  refreshGoalsCounter();
  showToast("Oturum kapatıldı.", "info");
  switchSection("home");
}

async function openAssessmentModal() {
  const user = CalisthenicsAPI.getCurrentUser();
  if (!user) {
    openModal("login-modal");
    return;
  }

  const stats = await CalisthenicsAPI.getAssessment();
  if (stats) {
    document.getElementById("stat-pullups").value = stats.pullups || 8;
    if (document.getElementById("stat-chest-to-bar")) document.getElementById("stat-chest-to-bar").value = stats.chestToBar || 3;
    document.getElementById("stat-dips").value = stats.dips || 12;
    if (document.getElementById("stat-pseudo-pushups")) document.getElementById("stat-pseudo-pushups").value = stats.pseudoPushups || 5;
    document.getElementById("stat-hollow").value = stats.hollowHold || 30;
    document.getElementById("stat-lsit").value = stats.lsitHold || 10;
    document.getElementById("stat-handstand").value = stats.handstandWall || 20;
  }

  openModal("assessment-modal");
}

async function handleAssessmentSubmit(e) {
  e.preventDefault();
  const stats = {
    pullups: Number(document.getElementById("stat-pullups").value),
    chestToBar: Number(document.getElementById("stat-chest-to-bar") ? document.getElementById("stat-chest-to-bar").value : 3),
    dips: Number(document.getElementById("stat-dips").value),
    pseudoPushups: Number(document.getElementById("stat-pseudo-pushups") ? document.getElementById("stat-pseudo-pushups").value : 5),
    hollowHold: Number(document.getElementById("stat-hollow").value),
    lsitHold: Number(document.getElementById("stat-lsit").value),
    handstandWall: Number(document.getElementById("stat-handstand").value)
  };

  await CalisthenicsAPI.saveAssessment(stats);
  showToast("Temel güç verilerin güncellendi! Programların bu verilere göre şekillenecek.", "success");
  closeModal("assessment-modal");

  if (document.getElementById("section-hedeflerim").style.display === "block") {
    loadGoalsSection();
  }
}

/* ==========================================================================
   9. MODAL & TOAST YARDIMCILARI
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "auto";
  }
}

// Dışarı tıklanınca modal kapatma
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "auto";
  }
});

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";

  let icon = "fa-circle-info";
  let color = "var(--accent-cyan)";
  if (type === "success") {
    icon = "fa-circle-check";
    color = "var(--accent-green)";
  } else if (type === "error") {
    icon = "fa-triangle-exclamation";
    color = "var(--accent-red)";
  }

  toast.innerHTML = `<i class="fa-solid ${icon}" style="color:${color};"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.4s ease";
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
