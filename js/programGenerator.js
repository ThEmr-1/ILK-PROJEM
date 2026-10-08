/**
 * Calisthenics Akıllı Program Oluşturucu (Smart Program Generator)
 * Biyomekanik ve Spor Bilimi Odaklı Egzersiz Eşleştirme Motoru
 */

const ProgramGenerator = {
  /**
   * Bir hareketin temel güç yeterliliğini değerlendirir
   */
  evaluateSkillReadiness(skill, userStats) {
    if (!skill || !skill.minStrengthReqs) {
      return {
        ready: true,
        mode: "TECHNIQUE_DOMINANT",
        strengthScore: 100,
        bottlenecks: [],
        recommendation: "Temel güç yeterli. Doğrudan beceri tekniği ve aşamalı denge çalışmalarına odaklanın."
      };
    }

    const reqs = skill.minStrengthReqs;
    const bottlenecks = [];
    let totalScore = 0;
    let countedMetrics = 0;

    for (const [key, reqVal] of Object.entries(reqs)) {
      const userVal = Number(userStats[key]) || 0;
      const ratio = userVal / reqVal;
      totalScore += Math.min(ratio, 1.2); // max 120%
      countedMetrics++;

      if (userVal < reqVal) {
        let label = key;
        if (key === 'pullups') label = 'Nizami Barfiks (Tekrar)';
        else if (key === 'chestToBar') label = 'Göğse/Karına Patlayıcı Barfiks';
        else if (key === 'dips') label = 'Paralel Bar Dips (Tekrar)';
        else if (key === 'pseudoPushups') label = 'Pseudo Planche / Pike Şınav';
        else if (key === 'hollowHold') label = 'Hollow Body Duruşu (Sn)';
        else if (key === 'handstandWall') label = 'Duvarda Amut (Sn)';
        else if (key === 'lsitHold') label = 'L-Sit Duruşu (Sn)';

        bottlenecks.push({
          metric: key,
          label: label,
          current: userVal,
          required: reqVal,
          deficit: reqVal - userVal
        });
      }
    }

    const avgScore = countedMetrics > 0 ? (totalScore / countedMetrics) * 100 : 100;
    const isStrengthDeficient = bottlenecks.length > 0;

    return {
      ready: !isStrengthDeficient,
      mode: isStrengthDeficient ? "STRENGTH_BUILDING_WITH_PREP" : "TECHNIQUE_DOMINANT",
      strengthScore: Math.round(avgScore),
      bottlenecks: bottlenecks,
      title: isStrengthDeficient ? "Temel Güç & Tendon Adaptasyonu Odaklı" : "Saf Teknik & Nöromüsküler İlerleme Odaklı",
      explanation: isStrengthDeficient 
        ? skill.strengthBottleneckExplanation 
        : skill.techniqueBottleneckExplanation
    };
  },

  /**
   * Çoklu hedefler için genel profil ve antrenman önceliği analizi
   */
  analyzeMultipleGoals(skills, userStats) {
    const skillAnalyses = skills.map(skill => {
      const evaluation = this.evaluateSkillReadiness(skill, userStats);
      return {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.categoryId,
        evaluation: evaluation
      };
    });

    const strengthDeficientCount = skillAnalyses.filter(s => s.evaluation.mode === "STRENGTH_BUILDING_WITH_PREP").length;
    const overallMode = strengthDeficientCount > 0 ? "HYBRID_STRENGTH_SKILL" : "PURE_SKILL_PROGRESSION";

    return {
      skillAnalyses,
      overallMode,
      strengthDeficientCount,
      pureTechniqueCount: skills.length - strengthDeficientCount
    };
  },

  /**
   * Ana Program Üretici Fonksiyonu
   */
  generateProgram(params) {
    const {
      targetSkills,
      userStats,
      daysCount = 3,
      selectedDays = ['Pazartesi', 'Çarşamba', 'Cuma'],
      splitType = 'push_pull_legs',
      experienceLevel = 'intermediate',
      sessionDuration = '60'
    } = params;

    const analysis = this.analyzeMultipleGoals(targetSkills, userStats);

    const daysPlan = [];
    const activeDays = selectedDays.slice(0, daysCount);

    if (splitType === 'push_pull_legs') {
      daysPlan.push(...this.buildPPLSchedule(activeDays, targetSkills, analysis, userStats));
    } else if (splitType === 'upper_lower') {
      daysPlan.push(...this.buildUpperLowerSchedule(activeDays, targetSkills, analysis, userStats));
    } else if (splitType === 'skill_strength') {
      daysPlan.push(...this.buildSkillStrengthSchedule(activeDays, targetSkills, analysis, userStats));
    } else {
      daysPlan.push(...this.buildFullBodySchedule(activeDays, targetSkills, analysis, userStats));
    }

    return {
      id: "prog_" + Date.now(),
      generatedAt: new Date().toLocaleDateString('tr-TR'),
      meta: {
        splitType: this.getSplitLabel(splitType),
        daysPerWeek: daysCount,
        selectedDays: activeDays,
        sessionDuration: `${sessionDuration} Dakika`,
        targetSkillsCount: targetSkills.length,
        overallMode: analysis.overallMode
      },
      analysisSummary: analysis,
      schedule: daysPlan,
      principles: [
        "Planche ve Lever gibi statiklerde kollar dirsekten milimetrik dahi bükülmemelidir (Straight-arm lock).",
        "Normal şınav dayanıklılık içindir; Planche için elleri kalça hizasına yaklaştırarak (Pseudo Planche) öne eğilin.",
        "Muscle-up için yavaş barfiks değil, göğüs kemiğine patlayıcı çekiş (Chest-to-bar) çalışın.",
        "Tendon adaptasyonu kas gelişiminden 3-4 kat daha yavaş sürer; ağrı veya sızı hissettiğinizde eklemleri dinlendirin."
      ]
    };
  },

  getSplitLabel(splitType) {
    const labels = {
      'push_pull_legs': 'İtiş - Çekiş - Bacak (Push / Pull / Legs)',
      'upper_lower': 'Üst Gövde - Alt Gövde (Upper / Lower)',
      'full_body': 'Tüm Vücut (Full Body)',
      'skill_strength': 'Beceri Odaklı & Güç Hibriti (Skill + Strength)'
    };
    return labels[splitType] || 'Özel Dağılım';
  },

  /**
   * Push / Pull / Legs Split Oluşturucu
   */
  buildPPLSchedule(days, targetSkills, analysis, userStats) {
    const schedule = [];
    const pushSkills = targetSkills.filter(s => s.id === 'planche' || s.id === 'hspu' || s.id === 'handstand' || s.id === 'impossible-dips');
    const pullSkills = targetSkills.filter(s => s.id === 'front-lever' || s.id === 'back-lever' || s.id === 'muscle-up');
    const freestyleSkills = targetSkills.filter(s => s.categoryId === 'freestyle');

    days.forEach((dayName, index) => {
      const cycleMod = index % 3;
      let dayTitle = "";
      let focusTag = "";
      let exercises = [];

      if (cycleMod === 0) {
        dayTitle = "GÜN " + (index + 1) + ": Çekiş & Statik Lever / Patlayıcılık (PULL)";
        focusTag = "Latissimus, Arka Omuz, Biceps, Skapula Çekişi";

        pullSkills.forEach(skill => {
          const evalItem = analysis.skillAnalyses.find(a => a.skillId === skill.id);
          exercises.push(this.createSkillExerciseBlock(skill, evalItem));
        });

        if (pullSkills.length === 0) {
          exercises.push({
            name: "Tuck Front Lever & Düz Kol Çekiş Pratiği",
            type: "Düz Kol Çekiş",
            sets: "4 Set x 10-15 sn",
            rest: "90 sn",
            note: "Kollar kilitli, kürek kemikleri aşağı bastırılmalı (Depresyon)."
          });
        }

        exercises.push(
          { name: "Patlayıcı Göğse Barfiks (Explosive High Pull-ups)", type: "Hız & Güç", sets: "4 Set x 4-6 Tekrar", rest: "120 sn", note: "Barı göğüs kemiğine/karına patlayıcı fırlatın." },
          { name: "Ağırlıklı veya Yavaş Eksenli Barfiks", type: "Temel Kuvvet", sets: "4 Set x 6-8 Tekrar", rest: "120 sn", note: "İniş 3 saniye kontrollü, tam dip asılış." },
          { name: "Scapular Pull-ups (Düz Kol Kürek Kemiği Çekişi)", type: "Tendon & Eklem", sets: "3 Set x 10-12 Tekrar", rest: "60 sn", note: "Dirsek bükmeden sırttan yükselme." },
          { name: "Dragon Flag Negatifleri & Biceps Asılışı", type: "Core & Antagonist", sets: "3 Set x 6-8 Tekrar", rest: "75 sn", note: "Bel yerde boşluk yapmayacak şekilde sopa gibi inin." }
        );

      } else if (cycleMod === 1) {
        dayTitle = "GÜN " + (index + 1) + ": İtiş & Planche / Amut Omuz Gücü (PUSH)";
        focusTag = "Ön Deltoid, Biceps Tendonu, Triceps, Serratus";

        pushSkills.forEach(skill => {
          const evalItem = analysis.skillAnalyses.find(a => a.skillId === skill.id);
          exercises.push(this.createSkillExerciseBlock(skill, evalItem));
        });

        if (pushSkills.length === 0) {
          exercises.push({
            name: "Planche Lean (Kollar Kilitli Maksimum Öne Eğim)",
            type: "Düz Kol İtiş",
            sets: "5 Set x 20 sn",
            rest: "90 sn",
            note: "Bilekleri ısıtın, kürek kemiklerini kubbe gibi dışa itin (Protraksiyon)."
          });
        }

        exercises.push(
          { name: "Pseudo Planche Push-ups (Eller Kalça Hizasında Şınav)", type: "Planche Spesifik", sets: "4 Set x 8-10 Tekrar", rest: "120 sn", note: "Normal şınav değil! Omuzlar bileklerin çok önünde kalmalı." },
          { name: "Derin Paralel Bar Dips", type: "Ağır İtiş Tabanı", sets: "4 Set x 8-12 Tekrar", rest: "90 sn", note: "Tam açıklıkta göğüs ve triceps güçlendirmesi." },
          { name: "Elevated Pike Push-ups (Amutta Şınav Hazırlığı)", type: "Dikey Omuz", sets: "3 Set x 8 Tekrar", rest: "90 sn", note: "Ayaklar yüksekte, kafa ellerin önüne üçgen inmeli." },
          { name: "El Bileği ve Biceps Tendonu Güçlendirme", type: "Tendon Zırhı", sets: "3 Set x 15 Tekrar", rest: "60 sn", note: "Planche sakatlıklarını önleyici hafif esneme ve tork." }
        );

      } else {
        dayTitle = "GÜN " + (index + 1) + ": Bacak, Core & Freestyle Dinamik (LEGS & SKILL)";
        focusTag = "Kuadriseps, Glute, Hamstring, Core ve Salınım Akışı";

        freestyleSkills.forEach(skill => {
          const evalItem = analysis.skillAnalyses.find(a => a.skillId === skill.id);
          exercises.push(this.createSkillExerciseBlock(skill, evalItem));
        });

        exercises.push(
          { name: "Pistol Squat (Tek Bacak Çömelme)", type: "Tek Bacak Kuvveti", sets: "4 Set x 5-8 Tekrar (Her bacak)", rest: "90 sn", note: "Topuk yerden kalkmadan tam derinlik." },
          { name: "Nordic Hamstring Curl", type: "Diz Arkası Sağlığı", sets: "3 Set x 6 Tekrar", rest: "90 sn", note: "Vücudu öne kontrollü frenleyin." },
          { name: "Hollow Body Rocks & L-Sit Hold", type: "Pelvik Sertlik", sets: "4 Set x 30 sn", rest: "60 sn", note: "Bel yere sıfır boşlukla yapıştırılmalıdır." },
          { name: "Barda Asılarak Bacak Kaldırma (Toes to Bar)", type: "Dinamik Core", sets: "3 Set x 10 Tekrar", rest: "75 sn", note: "Sallanmadan ayak uçları bara temas etmeli." }
        );
      }

      schedule.push({
        dayName: dayName,
        title: dayTitle,
        focusTag: focusTag,
        exercises: exercises
      });
    });

    return schedule;
  },

  buildUpperLowerSchedule(days, targetSkills, analysis, userStats) {
    const schedule = [];

    days.forEach((dayName, index) => {
      const isUpper = index % 2 === 0;
      let dayTitle = isUpper 
        ? `GÜN ${index + 1}: Üst Gövde Düz Kol & Patlayıcı Kuvvet (UPPER)` 
        : `GÜN ${index + 1}: Bacak, Core Sıkışması & Tendon Bakımı (LOWER)`;

      const exercises = [];

      if (isUpper) {
        targetSkills.filter(s => s.id !== 'pistol-squat').forEach(skill => {
          const evalItem = analysis.skillAnalyses.find(a => a.skillId === skill.id);
          exercises.push(this.createSkillExerciseBlock(skill, evalItem));
        });

        exercises.push(
          { name: "Pseudo Planche Push-ups + Patlayıcı Çekiş Süper Seti", type: "Spesifik Kuvvet", sets: "4 Set x 6-8 Tekrar", rest: "120 sn", note: "Düz kol torku ve yüksek çekiş dengesi." },
          { name: "Derin Dips + Ağırlıklı Barfiks", type: "Temel Hipertrofi", sets: "4 Set x 6-8 Tekrar", rest: "120 sn", note: "Tendonları güçlendiren ana itiş/çekiş." },
          { name: "Facepulls & Scapula Retraksiyon", type: "Omuz Sağlığı", sets: "3 Set x 15 Tekrar", rest: "60 sn", note: "Omuz kapsülü dengesi." }
        );
      } else {
        exercises.push(
          { name: "Pistol Squat / Bulgar Split Squat", type: "Bacak Kuvveti", sets: "4 Set x 8 Tekrar", rest: "90 sn", note: "Kusursuz denge ve derinlik." },
          { name: "Dragon Flag Statik Tutuş", type: "İleri Düzey Core", sets: "4 Set x 6-8 sn", rest: "90 sn", note: "Lever için gereken gövde kütüğü." },
          { name: "L-Sit / V-Sit Basışı", type: "Sıkışma Gücü", sets: "4 Set x 15-20 sn", rest: "75 sn", note: "Omuzları bastırıp kalçayı havaya itin." }
        );
      }

      schedule.push({
        dayName: dayName,
        title: dayTitle,
        focusTag: isUpper ? "Planche/Lever Torku, Göğüs, Sırt, Omuz" : "Bacaklar, Kalça ve Tüm Core",
        exercises: exercises
      });
    });

    return schedule;
  },

  buildFullBodySchedule(days, targetSkills, analysis, userStats) {
    const schedule = [];

    days.forEach((dayName, index) => {
      const dayTitle = `GÜN ${index + 1}: Tam Vücut Entegre Calisthenics (FULL BODY)`;
      const exercises = [];

      const skillForToday = targetSkills[index % targetSkills.length] || targetSkills[0];
      if (skillForToday) {
        const evalItem = analysis.skillAnalyses.find(a => a.skillId === skillForToday.id);
        exercises.push(this.createSkillExerciseBlock(skillForToday, evalItem));
      }

      exercises.push(
        { name: "Patlayıcı / Temiz Barfiks", type: "Çekiş Gücü", sets: "4 Set x 8 Tekrar", rest: "90 sn", note: "Tam kilitlenme." },
        { name: "Pseudo Planche Push-ups veya Dips", type: "İtiş Gücü", sets: "4 Set x 10 Tekrar", rest: "90 sn", note: "Öne eğim açısını koruyun." },
        { name: "Pistol Squat Pratiği", type: "Alt Vücut", sets: "3 Set x 6 Tekrar", rest: "75 sn", note: "Gerekirse kutu desteğiyle." },
        { name: "Hollow Body & L-Sit Hibriti", type: "Gövde Sertliği", sets: "3 Set x 40 sn", rest: "60 sn", note: "Karın kilitli tutulur." }
      );

      schedule.push({
        dayName: dayName,
        title: dayTitle,
        focusTag: "İtiş + Çekiş + Bacak + Beceri",
        exercises: exercises
      });
    });

    return schedule;
  },

  buildSkillStrengthSchedule(days, targetSkills, analysis, userStats) {
    const schedule = [];

    days.forEach((dayName, index) => {
      const isSkillHeavy = index % 2 === 0;
      const dayTitle = isSkillHeavy
        ? `GÜN ${index + 1}: Düz Kol Becerisi, Denge ve Aşamalar (SKILL FOCUS)`
        : `GÜN ${index + 1}: Ağır Taban, Patlayıcılık & Tendon Güçlendirme (STRENGTH BASE)`;

      const exercises = [];

      if (isSkillHeavy) {
        targetSkills.forEach(skill => {
          const evalItem = analysis.skillAnalyses.find(a => a.skillId === skill.id);
          exercises.push(this.createSkillExerciseBlock(skill, evalItem, true));
        });

        exercises.push(
          { name: "Amut (Handstand) Denge Pratiği", type: "Denge", sets: "5 Set x Kaliteli Deneme", rest: "90 sn", note: "Yorulmadan sinir sistemi çalışması." },
          { name: "Planche Lean & Scapula Retraksiyon", type: "Nöromüsküler", sets: "3 Set x 20 sn", rest: "60 sn", note: "Kollar kilitli." }
        );
      } else {
        exercises.push(
          { name: "Ağırlıklı Barfiks veya Patlayıcı Chest-to-Bar", type: "Ağır Çekiş", sets: "5 Set x 5 Tekrar", rest: "150 sn", note: "Patlayıcı çekiş gücü." },
          { name: "Ağırlıklı Dips veya Pseudo Planche Push-ups", type: "Ağır İtiş", sets: "5 Set x 6 Tekrar", rest: "150 sn", note: "Ön deltoid ve tendon adaptasyonu." },
          { name: "Dragon Flag & L-Sit Basışı", type: "Core Sertliği", sets: "4 Set x 8 Tekrar", rest: "90 sn", note: "Tam gövde kilitlenmesi." }
        );
      }

      schedule.push({
        dayName: dayName,
        title: dayTitle,
        focusTag: isSkillHeavy ? "Saf Teknik & Düz Kol İlerleyişi" : "Maksimum Kuvvet ve Kas Kütlesi",
        exercises: exercises
      });
    });

    return schedule;
  },

  /**
   * Seçilen becerinin analizine göre özel egzersiz bloğu üretir
   */
  createSkillExerciseBlock(skill, evalItem, forceTechniqueFocus = false) {
    const isStrengthDeficient = evalItem && evalItem.evaluation.mode === "STRENGTH_BUILDING_WITH_PREP" && !forceTechniqueFocus;

    if (isStrengthDeficient) {
      const introProgression = skill.progressions && skill.progressions[0] ? skill.progressions[0].name : "Temel Hazırlık";
      return {
        name: `[GÜÇ & TENDON HAZIRLIĞI] ${skill.name} - ${introProgression}`,
        type: `Hedef Beceri: ${skill.name} (Tendon & Güç Odaklı)`,
        sets: "4 Set x 10-15 sn (veya Destekli 5-6 Tekrar)",
        rest: "120 sn",
        note: `BİYOMEKANİK DARBOĞAZ: ${evalItem.evaluation.bottlenecks.map(b => b.label).join(', ')} değerlerin henüz tam hareket torkunu karşılamıyor. Normal şınav yerine Planche Lean ve dips ile tendon gücü inşa ediliyor!`
      };
    } else {
      const midProgression = skill.progressions && skill.progressions[1] ? skill.progressions[1].name : "Teknik Geliştirme";
      return {
        name: `[SAF TEKNİK & AŞAMA] ${skill.name} - ${midProgression}`,
        type: `Hedef Beceri: ${skill.name} (Teknik Odaklı)`,
        sets: "5 Set x 10-15 sn (veya 3-5 Kaliteli Tekrar)",
        rest: "150 sn",
        note: "Kuvvet temelin kusursuz! %100 düz kol kilitlenmesi, skapula kontrolü ve nöral koordinasyona odaklan."
      };
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgramGenerator;
}
