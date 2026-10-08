/**
 * Calisthenics Master Veritabanı (Gerçekçi Biyomekanik & Spor Bilimi Eşikleri)
 * 
 * Biyomekanik Not:
 * - Standart şınav (push-up) bükük kol (bent-arm) dayanıklılığıdır; Planche gibi düz kol (straight-arm) 
 *   ve biceps tendonu/ön omuz torku gerektiren hareketler için asla tek başına bir ölçüt değildir!
 * - Front Lever için standart barfiks değil, kollar düz skapula çekişi ve göğse patlayıcı çekiş esastır.
 * - Muscle-up için barfiks sayısı değil, göğse/karına patlayıcı çekiş (Chest-to-bar) belirleyicidir.
 */

const CALISTHENICS_DATA = {
  categories: [
    {
      id: "statik",
      name: "Statik (Statics)",
      badge: "Düz Kol İzometrik Güç",
      icon: "fa-solid fa-anchor",
      description: "Vücudun yerçekimine karşı düz kol kilitlenmesiyle sabit tutulduğu, devasa tendon ve skapula torku gerektiren hareketler.",
      color: "#00d2ff"
    },
    {
      id: "dinamik",
      name: "Dinamik (Dynamics)",
      badge: "Patlayıcı Güç & İvme",
      icon: "fa-solid fa-bolt",
      description: "Hızlı kasılma, patlayıcı itiş/çekiş ve geniş hareket açısında vücut ağırlığını hızlandıran yetenekler.",
      color: "#ff6b6b"
    },
    {
      id: "freestyle",
      name: "Freestyle (Serbest Stil)",
      badge: "Akrobasi & Salınım",
      icon: "fa-solid fa-wind",
      description: "Bar üzerinde salınım momentumu (swing), hava hakimiyeti, dönüşler ve akrobatik yakalamalar.",
      color: "#a855f7"
    }
  ],

  // Temel Hareketler ve Gerçekçi Test Kriterleri
  baselineRequirements: {
    pullups: { label: "Temiz Nizami Barfiks (Tekrar)", desc: "Çene barın üstüne, tam kilitli iniş" },
    chestToBar: { label: "Patlayıcı Göğse Barfiks (Chest-to-Bar)", desc: "Barı göğüs kemiğine veya karına patlayıcı çekme" },
    dips: { label: "Paralel Bar Dips (Tekrar)", desc: "En az 90 derece derinlikte temiz itiş" },
    pseudoPushups: { label: "Pseudo Planche / Pike Şınav (Tekrar)", desc: "Eller kalça hizasında öne eğimli veya ayaklar yüksekte amut şınavı hazırlığı" },
    hollowHold: { label: "Hollow Body Duruşu (Saniye)", desc: "Bel yere tam yapışık, gövde gerginliği" },
    handstandWall: { label: "Duvarda Amut Duruşu (Saniye)", desc: "Omuzlar kulaklara itili düz amut" },
    lsitHold: { label: "L-Sit Duruşu (Saniye)", desc: "Dizler kilitli 90 derece bacak kaldırışı" }
  },

  skills: [
    // ==================== STATİK HAREKETLER ====================
    {
      id: "planche",
      categoryId: "statik",
      name: "Planche",
      turkishName: "Uçak Duruşu (Full Planche)",
      level: "Usta Seviye (S Tier)",
      levelRank: 5,
      image: "planche.jpg",
      shortDescription: "Sadece eller yerde/barda, kollar kilitli şekilde vücudu havada yere paralel tutma.",
      fullDescription: "Planche, calisthenics dünyasının en yüksek tendon yüklenmesi gerektiren itiş statiğidir. Standart şınavla kesinlikle kıyaslanamaz! Vücut ağırlığınızın yarattığı kaldıraç kolu bileklerin metrelerce gerisindedir; bu torku karşılamak için ön deltoid, biceps tendonu, serratus anterior ve maksimum skapula protraksiyonu (kürek kemiklerini dışa itme) şarttır.",
      muscles: ["Ön Omuz (Maksimum Tork)", "Distal Biceps Tendonu", "Serratus Anterior", "Üst Göğüs", "Core & Kalça Ekstansiyonu"],
      // GERÇEKÇİ PLANCHE ŞARTLARI:
      minStrengthReqs: {
        dips: 25,              // Derin ve ağır itiş tabanı
        pseudoPushups: 15,     // Eller kalça hizasında öne eğik şınav (Planche'ın gerçek simülasyonu)
        handstandWall: 60,     // Dikey itiş ve omuz depresyon/elevasyon hakimiyeti
        hollowHold: 45,        // Pelvik tilt ve karın kilitlenmesi
        pullups: 15            // Omuz kapsülü ve antagonist kas dengesi
      },
      strengthBottleneckExplanation: "DİKKAT: Standart şınav çekmek Planche için neredeyse hiçbir şey ifade etmez! Planche; dirseklerin dümdüz kilitlendiği, biceps tendonunun gerildiği ve ellerin kalça hizasına kadar öne eğildiği (Pseudo Planche) bambaşka bir kuvvettir. Mevcut seviyenizde en az 25 dips ve eller kalçada 15 Pseudo Planche Şınavı gücü henüz bulunmuyor. Tendon sakatlığı yaşamamak için doğrudan 'Planche Lean' ve kademeli 'Tuck Planche' hazırlık programı uygulanacaktır.",
      techniqueBottleneckExplanation: "Temel itiş ve amut kuvvetin üst seviyede! Planche için gereken altyapı hazır. Şu anki darboğazın tamamen biyomekanik: Kürek kemiklerinin maksimum dışa itilmesi (tam protraksiyon), kalçanın omuz hizasından aşağı düşmemesi ve ağırlık merkezinin parmak uçlarına aktarılması (Planche Lean açısı). %100 teknik ve bant destekli aşamalara odaklanıyoruz.",
      progressions: [
        { step: 1, name: "Planche Lean (Maksimum Öne Eğim)", duration: "4x20-30 sn", desc: "Kollar kilitli, omuzlar el bileklerinin 15-20 cm önüne taşınır, tam protraksiyon." },
        { step: 2, name: "Tuck Planche", duration: "5x8-12 sn", desc: "Dizler göğse kilitli, kollar sopa gibi gergin, kalça omuz hizasında havada." },
        { step: 3, name: "Advanced Tuck Planche", duration: "4x8-10 sn", desc: "Sırt düzleştirilir, kalça 90 dereceye açılır, omuz yükü 2 katına çıkar." },
        { step: 4, name: "Straddle Planche", duration: "4x5-8 sn", desc: "Bacaklar yanlara V şeklinde açılarak manivela dengelenir." },
        { step: 5, name: "Full Planche", duration: "3-6 sn hold", desc: "Bacaklar bitişik, parmak uçlarına kadar kilitli kusursuz yatay çizgi." }
      ],
      accessoryExercises: ["Pseudo Planche Push-ups", "Zanetti Dumbbell Press", "Wrist Tendon Conditioning", "Scapular Push-ups", "Reverse Hyperextension"]
    },
    {
      id: "front-lever",
      categoryId: "statik",
      name: "Front Lever",
      turkishName: "Ön Düzlem Duruşu",
      level: "İleri Seviye (A Tier)",
      levelRank: 4,
      image: "front lever.jpg",
      shortDescription: "Bara asılarak kollar gergin vaziyette vücudu yere paralel sabit kilit tutma.",
      fullDescription: "Calisthenics'in en saygın çekiş statiğidir. Sıradan barfiks gibi bükük kol çekişi değil; kolların dirsekten kilitli olduğu düz kol (straight-arm) skapula depresyonu ve latissimus torkudur.",
      muscles: ["Latissimus Dorsi", "Teres Major", "Arka Omuz", "Karın & Posterior Pelvic Tilt", "Alt Trapez"],
      minStrengthReqs: {
        pullups: 15,           // Temel çekiş tabanı
        chestToBar: 8,         // Patlayıcı çekiş gücü
        hollowHold: 45,        // Bel boşluğu bırakmayan karın sertliği
        lsitHold: 20           // Skapula depresyonu ve bacak kaldırma gücü
      },
      strengthBottleneckExplanation: "Standart barfiks sayınız fena olmasa bile, göğse patlayıcı çekiş (en az 8 temiz Chest-to-bar) veya 45 sn kesintisiz Hollow Body gerginliği eksik. Düz kolla lat kaslarını kitlemek için öncelikle skapula çekişi ve Dragon Flag ile gövde sertliği geliştirilmelidir.",
      techniqueBottleneckExplanation: "Çekiş kuvvetin fazlasıyla yeterli! Sorun dirseklerin hafif bükülmesi, kürek kemiklerinin aşağı bastırılamaması (depresyon eksikliği) veya kalçanın düşmesidir. Doğrudan Tuck ve Straddle Lever teknik açılarına odaklanılacak.",
      progressions: [
        { step: 1, name: "Tuck Front Lever", duration: "4x15-20 sn", desc: "Dizler göğse yapışık, kollar kilitli, sırt tam yere paralel.", image: "tuckfrontlever.jpg" },
        { step: 2, name: "Advanced Tuck Front Lever", duration: "4x10-15 sn", desc: "Kalça 90 derece açılır, sırt masa gibi düzleşir." },
        { step: 3, name: "One Leg / Halflay Lever", duration: "4x8-10 sn", desc: "Bir bacak tam uzatılırken diğeri bükülü kalır." },
        { step: 4, name: "Straddle Front Lever", duration: "4x6-10 sn", desc: "Bacaklar yanlara açık, tam düz yatay hat." },
        { step: 5, name: "Full Front Lever", duration: "3-8 sn hold", desc: "Bacaklar bitişik, ayak uçları gergin, sıfır bükülme." }
      ],
      accessoryExercises: ["Scapular Pull-ups", "Dragon Flag", "Ice Cream Makers", "Straight-Arm Lat Pulldown", "Hollow Body Rocks"]
    },
    {
      id: "back-lever",
      categoryId: "statik",
      name: "Back Lever",
      turkishName: "Arka Düzlem Duruşu",
      level: "Orta-İleri",
      levelRank: 3,
      image: "back lever.jpg",
      shortDescription: "Bara arkadan asılarak yüz yere bakacak şekilde yatay düzlemde asılı kalma.",
      fullDescription: "Omuz ekstansiyonu esnekliği ve biceps distal tendonlarının ters gerilime adaptasyonunu sağlayan temel statik.",
      muscles: ["Biceps & Distal Tendon", "Ön Omuz", "Göğüs (Pectoralis)", "Bel & Glute"],
      minStrengthReqs: {
        pullups: 12,
        dips: 15,
        hollowHold: 35
      },
      strengthBottleneckExplanation: "Biceps ve omuz tendonlarının ters gerilime sakatlanmadan dayanabilmesi için temel dips ve barfiks gücü artırılmalı, German Hang esnekliği kazanılmalıdır.",
      techniqueBottleneckExplanation: "Kuvvet tabanın hazır. Omuzları geriye kilitleme, kalça sıkılığı ve başın nötr pozisyonda tutulması tekniklerine odaklanılacak.",
      progressions: [
        { step: 1, name: "German Hang (Ters Asılış)", duration: "3x20-30 sn", desc: "Omuz mobilitesi ve biceps tendon adaptasyonu." },
        { step: 2, name: "Tuck Back Lever", duration: "4x12 sn", desc: "Dizler bükülü yatay duruş." },
        { step: 3, name: "Straddle Back Lever", duration: "4x8-10 sn", desc: "Bacaklar iki yana açık, yatay kilit." },
        { step: 4, name: "Full Back Lever", duration: "3-8 sn", desc: "Kusursuz kapalı yatay çizgi." }
      ],
      accessoryExercises: ["Skin the Cat", "German Hang Pull-outs", "Reverse Hyperextensions"]
    },
    {
      id: "human-flag",
      categoryId: "statik",
      name: "Human Flag",
      turkishName: "İnsan Bayrağı",
      level: "İleri Seviye",
      levelRank: 4,
      image: "humanflag.jpg",
      shortDescription: "Dikey direği tutup vücudu yana doğru yatay bir bayrak gibi havada tutma.",
      fullDescription: "Alt kol direği iterken üst kolun direği asıldığı, inanılmaz oblik ve omuz torku üreten hareket.",
      muscles: ["Oblikler (Yan Karın)", "Omuz Kuşağı", "Latissimus Dorsi", "Quadratus Lumborum"],
      minStrengthReqs: {
        pullups: 15,
        dips: 20,
        handstandWall: 45,
        hollowHold: 40
      },
      strengthBottleneckExplanation: "Alt kolun dikey itişi ve üst kolun çekişi henüz dengelenmiş değil. Yan karın (oblik) ve omuz itiş gücü tabanı inşa edilmeli.",
      techniqueBottleneckExplanation: "Fiziksel güç yeterli. Direğe göre el mesafesi, alt omzun tam kilitlenmesi ve vücudun yana dönmemesi teknikleri çalışılacak.",
      progressions: [
        { step: 1, name: "Vertical Flag Hold", duration: "4x10-15 sn", desc: "Dikey eksende itme-çekme açısı alıştırması." },
        { step: 2, name: "Tuck Human Flag", duration: "4x8-10 sn", desc: "Dizler göğse çekili yatay denge." },
        { step: 3, name: "Straddle Human Flag", duration: "3x6-8 sn", desc: "Bacaklar açık, yatay tutuş." },
        { step: 4, name: "Full Human Flag", duration: "3-6 sn", desc: "Kusursuz düz bayrak." }
      ],
      accessoryExercises: ["Side Planks (Ağırlıklı)", "Overhead Press", "Windshield Wipers", "Scapular Pulls"]
    },
    {
      id: "handstand",
      categoryId: "statik",
      name: "Handstand (Amut)",
      turkishName: "Serbest Amut Duruşu",
      level: "Orta Seviye",
      levelRank: 2,
      image: "handstand.jpg",
      shortDescription: "Eller üzerinde baş aşağı dengede kalarak düz bir çizgi halinde durma.",
      fullDescription: "Kuvvetten çok nöromüsküler el bileği kontrolü, omuz mobilitesi ve denge ustalığı gerektirir.",
      muscles: ["Tüm Omuz Kuşağı", "El Bileği Fleksörleri", "Triceps", "Core"],
      minStrengthReqs: {
        handstandWall: 35,
        dips: 10,
        hollowHold: 30
      },
      strengthBottleneckExplanation: "Duvarda yorulmadan en az 35-40 saniye rahat kalamıyorsanız omuzlarınız dengeye odaklanamadan yorulur. Önce duvarda dayanıklılık artırılmalı.",
      techniqueBottleneckExplanation: "Kuvvet fazlasıyla var! Parmak uçlarıyla yeri kavrama (cambré mikro düzeltmeleri), bakış noktası ve omuzları kulaklara itme tekniği çalışılacak.",
      progressions: [
        { step: 1, name: "Chest-to-Wall Handstand", duration: "3x45 sn", desc: "Yüz duvara dönük düz hizalanma." },
        { step: 2, name: "Wall Taps / Heel Pulls", duration: "3x10 tekrar", desc: "Parmak ucuyla duvardan hafif ayrılma." },
        { step: 3, name: "Freestanding Handstand Kick-up", duration: "5x Deneme", desc: "Yerden sıçrayıp serbest dengeyi yakalama." },
        { step: 4, name: "Consistent Freestanding Hold", duration: "30+ sn", desc: "Sakin nefesle tam kontrol." }
      ],
      accessoryExercises: ["Pike Push-ups", "Hollow Body Rocks", "Wrist Mobility Drills", "Shoulder Dislocates"]
    },

    // ==================== DİNAMİK HAREKETLER ====================
    {
      id: "muscle-up",
      categoryId: "dinamik",
      name: "Bar Muscle-Up",
      turkishName: "Barda Muscle-Up",
      level: "Orta-İleri",
      levelRank: 3,
      image: "muscleup.jpg",
      shortDescription: "Bardan çekişle başlayıp geçiş anında barın üstüne yükselerek dips ile bitirme.",
      fullDescription: "Muscle-up'ın sırrı yavaş 15 barfiks çekmek değildir! Barı göğüs kemiğine kadar tek hamlede fırlatabilen patlayıcı çekiş (Explosive High Pull-up) ve bilek devrimidir.",
      muscles: ["Patlayıcı Latissimus", "Triceps", "Göğüs", "Bilek/Ön Kol", "Core"],
      minStrengthReqs: {
        pullups: 12,           // Temel çekiş
        chestToBar: 5,         // En az 5 patlayıcı göğse barfiks (Kritik Eşik!)
        dips: 15,              // Dips bitirişi
        hollowHold: 30
      },
      strengthBottleneckExplanation: "DİKKAT: Barfiks sayınız 12 olsa bile, barı göğsünüze/karnınıza kadar patlayıcı çekemiyorsanız (en az 5 Chest-to-bar yoksa) barın üstüne dönemezsiniz. Patlayıcı çekiş ve tek bar dips kuvveti geliştirilmelidir.",
      techniqueBottleneckExplanation: "Patlayıcı çekiş gücün hazır! Sorun bara doğrudan dümdüz çekilmekte. Gövdeye hafif C yayı çizdirip göğsü barın üzerine devirme (transition) zamanlamasına odaklanılacaktır.",
      progressions: [
        { step: 1, name: "Explosive High Pull-ups", duration: "5x3 tekrar", desc: "Barı göğüs altına/karına kadar patlayıcı fırlatma." },
        { step: 2, name: "Straight Bar Dips", duration: "4x8 tekrar", desc: "Tek düz bar üzerinde derin dips." },
        { step: 3, name: "Banded Muscle-up Transition", duration: "4x4 tekrar", desc: "Lastikle geçiş açısını sinir sistemine kodlama." },
        { step: 4, name: "Strict Bar Muscle-up", duration: "3-5 tekrar", desc: "Ayak sallamadan tertemiz yükseliş." }
      ],
      accessoryExercises: ["Chest-to-Bar Pull-ups", "Russian Dips", "False Grip Pull-ups", "Jumping Muscle-ups"]
    },
    {
      id: "hspu",
      categoryId: "dinamik",
      name: "Handstand Push-Up (HSPU)",
      turkishName: "Amutta Şınav",
      level: "İleri Seviye",
      levelRank: 4,
      image: "hspushup.jpg",
      shortDescription: "Amut pozisyonundayken kolları büküp başı tripod üçgenine indirerek geri itme.",
      fullDescription: "Vücut ağırlığının %100'ünü dikey eksende basmayı gerektiren muazzam bir omuz ve triceps gücü testidir.",
      muscles: ["Ön & Yan Omuz", "Triceps", "Üst Trapez", "Core & Denge"],
      minStrengthReqs: {
        pseudoPushups: 12,     // Ayaklar yüksekte Pike Push-up veya derin şınav
        dips: 20,              // Triceps ve itiş temeli
        handstandWall: 50      // Omuz dayanıklılığı
      },
      strengthBottleneckExplanation: "Vücut ağırlığının tamamını dikeyde basabilmek için en az 12 temiz ayaklar yüksekte Pike Push-up ve 20 derin dips gücü gereklidir.",
      techniqueBottleneckExplanation: "İtiş gücün tam! Dirseklerin dışa açılmaması (45 derece gövdeye yakın kalması) ve başın ellerin önüne üçgen (tripod) açıyla inmesi tekniği çalışılacaktır.",
      progressions: [
        { step: 1, name: "Elevated Pike Push-ups", duration: "4x8-10 tekrar", desc: "Ayaklar kutuda dikey basış." },
        { step: 2, name: "Wall HSPU Negatives", duration: "5x3 tekrar (5 sn yavaş iniş)", desc: "Eksantrik kuvvet inşası." },
        { step: 3, name: "Wall Assisted HSPU", duration: "4x5-8 tekrar", desc: "Tam açıklıkta amutta şınav." },
        { step: 4, name: "Freestanding HSPU", duration: "1-4 tekrar", desc: "Duvarsız serbest basış." }
      ],
      accessoryExercises: ["Overhead Kettlebell Press", "Dips", "Tiger Bend Push-ups"]
    },
    {
      id: "pistol-squat",
      categoryId: "dinamik",
      name: "Pistol Squat",
      turkishName: "Tek Bacak Çömelme",
      level: "Orta Seviye",
      levelRank: 2,
      image: "pistolsquat.jpg",
      shortDescription: "Tek bacak üzerinde tam çömelip diğer bacağı öne düz uzatarak kalkma.",
      fullDescription: "Calisthenics bacak antrenmanlarının şahıdır. Kuadriseps kuvveti ve ayak bileği dorsifleksiyon mobilitesi ister.",
      muscles: ["Quadriceps", "Gluteus Maximus", "Hamstrings", "Ayak Bileği"],
      minStrengthReqs: {
        hollowHold: 20
      },
      strengthBottleneckExplanation: "Tek bacakla kalkış yapacak kuadriseps ve glute gücü için kademeli kutu çömelmeleri uygulanmalıdır.",
      techniqueBottleneckExplanation: "Kuvvet yeterli! Ayak bileği esnekliği ve öne uzatılan bacağın yere değmemesi için kalça fleksörü kontrolü üzerine odaklanılacak.",
      progressions: [
        { step: 1, name: "Box Pistol Squat", duration: "3x8 tekrar", desc: "Kutuya tek bacakla oturup kalkma." },
        { step: 2, name: "Assisted Pistol Squat", duration: "3x6 tekrar", desc: "Destek alarak tam derinlik." },
        { step: 3, name: "Full Pistol Squat", duration: "3x6-8 tekrar", desc: "Tam serbest derinlik." }
      ],
      accessoryExercises: ["Bulgarian Split Squat", "Ankle Mobility", "Nordic Curls"]
    },
    {
      id: "impossible-dips",
      categoryId: "dinamik",
      name: "Russian Dip",
      turkishName: "Rus Dipsi (Russian Dip)",
      level: "İleri Seviye",
      levelRank: 4,
      image: "russian dips.jpg",
      shortDescription: "Paralel barda dirseklerin üzerine inip tekrar eller üzerine basarak yükselme.",
      fullDescription: "Triceps tendonlarını ve dirsek mekaniğini üstün seviyede zorlayan ileri düzey bir itiş varyasyonudur.",
      muscles: ["Triceps", "Ön Omuz", "Pectoralis Major", "Ön Kol"],
      minStrengthReqs: {
        dips: 20
      },
      strengthBottleneckExplanation: "Dirsekleri bara yatırıp basabilmek için en az 20 sağlam standart dips gücü şarttır.",
      techniqueBottleneckExplanation: "Dirsek-bilek geçiş açısı ve momentumsuz saf tendon basış tekniği çalışılacaktır.",
      progressions: [
        { step: 1, name: "Deep Dips", duration: "4x10 tekrar", desc: "Maksimum derinlikte dips." },
        { step: 2, name: "Forearm Transfer Hold", duration: "3x15 sn", desc: "Ön kol geçişinde statik bekleme." },
        { step: 3, name: "Full Russian Dip", duration: "3x5 tekrar", desc: "Ön koldan avuç içine patlayıcı basış." }
      ],
      accessoryExercises: ["Skull Crushers", "Straight Bar Dips", "Triceps Pushdowns"]
    },

    // ==================== FREESTYLE HAREKETLER ====================
    {
      id: "spin-360",
      categoryId: "freestyle",
      name: "360 Bar Spin",
      turkishName: "360 Derece Bar Dönüşü",
      level: "Orta-İleri",
      levelRank: 3,
      image: "360 dönüş.jpg",
      shortDescription: "Bar üzerinde sallanıp havada tam tur 360 derece dönerek barı tekrar yakalama.",
      fullDescription: "Salınım momentumu (swing), havada omuz üzerinden dönme ve barı yeniden yakalama refleksini gerektirir.",
      muscles: ["Kavrama (Grip)", "Latissimus Dorsi", "Core", "Omuz Kuşağı"],
      minStrengthReqs: {
        pullups: 12,
        hollowHold: 35
      },
      strengthBottleneckExplanation: "Barı havada tekrar yakalarken omzun yerinden oynamaması ve şoku absorbe etmesi için güçlü bir barfiks ve asılış tabanı şarttır.",
      techniqueBottleneckExplanation: "Fiziksel gücün hazır! Dönüş zamanlaması, barı bırakma açısı ve barı kaçırmamak için bakış koordinasyonuna %100 odaklanacağız.",
      progressions: [
        { step: 1, name: "Cast Swing Dynamics", duration: "5x5 tekrar", desc: "Barda kontrollü yüksek salınım." },
        { step: 2, name: "180 Half Turn on Low Bar", duration: "10 tekrar", desc: "Alçak barda yarım dönüş ve tutuş alıştırması." },
        { step: 3, name: "Mat-Assisted 360 Release", duration: "Tekrar", desc: "Minder üstünde tam 360 dönüş." },
        { step: 4, name: "Clean High Bar 360 Spin", duration: "Usta Seviye", desc: "Yüksek barda temiz yakalayış." }
      ],
      accessoryExercises: ["Bar Kips", "High Swings", "Towel Grip Pull-ups"]
    },
    {
      id: "540-swing",
      categoryId: "freestyle",
      name: "540 Bar Spin",
      turkishName: "540 Derece Bar Dönüşü",
      level: "Usta Seviye",
      levelRank: 5,
      image: "540.jpg",
      shortDescription: "Salınımın tepe noktasında barı bırakıp 1.5 tur dönerek barı ters yakalama.",
      fullDescription: "Freestyle yarışmalarının zirve hareketidir. 360 dönüşünden 180 derece daha fazla rotasyon içerir.",
      muscles: ["Bilek & Ön Kol", "Trapez", "Oblikler", "Sırt"],
      minStrengthReqs: {
        pullups: 15,
        hollowHold: 45
      },
      strengthBottleneckExplanation: "Yüksek salınım ve havada ani rotasyon için ön kol kavrama gücü ve latissimus patlayıcılığı artırılmalıdır.",
      techniqueBottleneckExplanation: "Kuvvet hazır. Havadaki açısal momentumu artırmak için kol çekişini gövdeye yakın tutma tekniği çalışılacaktır.",
      progressions: [
        { step: 1, name: "Mastering 360 Spin", duration: "10/10 başarı", desc: "360 dönüşü her denemede firesiz yapabilme." },
        { step: 2, name: "High Angle Cast", duration: "5 tekrar", desc: "Salınımı yatayın 45 derece üzerine çıkarma." },
        { step: 3, name: "Solid 540 Catch", duration: "Usta", desc: "Barı temiz kavrama ve salınımı absorbe etme." }
      ],
      accessoryExercises: ["Tuck Rotations", "Explosive Pull-ups", "Bar Catches"]
    },
    {
      id: "geinger-salto",
      categoryId: "freestyle",
      name: "Geinger Salto",
      turkishName: "Geinger Saltosu",
      level: "Usta Seviye",
      levelRank: 5,
      image: "geinger salto.jpg",
      shortDescription: "Geriye salınımda barı bırakıp geriye salto ve yarım burguyla barı yakalama.",
      fullDescription: "Artistik cimnastikten sokak calisthenics'ine geçen en estetik hareketlerden biridir.",
      muscles: ["Core", "Tüm Sırt", "Kalça Fleksörleri", "Omuz"],
      minStrengthReqs: {
        pullups: 15,
        dips: 15,
        hollowHold: 45
      },
      strengthBottleneckExplanation: "Bardan fırlama anındaki gerilim ve tap kuvveti için güçlü core ve çekiş altyapısı lazımdır.",
      techniqueBottleneckExplanation: "Fiziksel güç tamam! 'Hollow-to-Arch' bacak vuruşu ve başın dönüş yönüne bakması tekniği çalışılacaktır.",
      progressions: [
        { step: 1, name: "Giant Tap Swing", duration: "Tekrar", desc: "Bar üzerinde kusursuz bacak vuruşu." },
        { step: 2, name: "Trampoline Backflip + Half Twist", duration: "Hava hakimiyeti", desc: "Havadaki burgu refleksini oturtma." },
        { step: 3, name: "Freestyle Bar Geinger", duration: "Final", desc: "Yüksek barda temiz yakalayış." }
      ],
      accessoryExercises: ["Back Extensions", "Arch Body Rocks", "Toes to Bar"]
    },
    {
      id: "shrimp-flip",
      categoryId: "freestyle",
      name: "Shrimp Flip",
      turkishName: "Karides Taklası (Shrimp Flip)",
      level: "İleri Seviye",
      levelRank: 4,
      image: "shrimp flip.jpg",
      shortDescription: "Bar üzerinde oturur pozisyondan geriye sıçrayıp barın altından süzülerek barı tekrar yakalama.",
      fullDescription: "Görsel olarak izleyenleri büyüleyen modern bir sokak calisthenics hareketidir.",
      muscles: ["Ön Kol / Bilek", "Core", "Triceps", "Kalça"],
      minStrengthReqs: {
        pullups: 12,
        dips: 15
      },
      strengthBottleneckExplanation: "Barın üstüne rahat çıkabilmek ve barda otururken vücudu fırlatabilmek için itiş temeli gereklidir.",
      techniqueBottleneckExplanation: "Güç hazır. Arkaya atlayış açısı ve elleri doğru milisaniyede açıp kapatma koordinasyonuna odaklanacağız.",
      progressions: [
        { step: 1, name: "Bar Sit Balance", duration: "Rahatlık", desc: "Bar üzerinde dengede oturma." },
        { step: 2, name: "Drop-to-Hang Drill", duration: "5 tekrar", desc: "Barı bırakmadan geriye düşüşü absorbe etme." },
        { step: 3, name: "Full Shrimp Flip", duration: "Tekrar", desc: "Temiz release ve catch." }
      ],
      accessoryExercises: ["Straight Bar Dips", "Grip Hangs", "Dragon Flags"]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CALISTHENICS_DATA;
}
