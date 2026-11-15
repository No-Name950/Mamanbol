/* ============================================================
   MamanBol — app.js
   ВСТАВЬ СЮДА СВОИ КЛЮЧИ SUPABASE (Project Settings → API)
   ============================================================ */
const SUPABASE_URL = "СЮДА_ВСТАВИТЬ";       // например: https://abcdxyz.supabase.co
const SUPABASE_ANON_KEY = "СЮДА_ВСТАВИТЬ";  // длинный ключ "anon public"
/* ============================================================ */

(function () {
  "use strict";

  /* ---------- RIASEC directions ---------- */
  const DIRS = {
    R: { name: "Реалистичное", tag: "техника и руки", color: "var(--c-r)",
         about: "Ты в своей стихии, когда можно работать руками, с техникой и реальными вещами. Тебе важен понятный, ощутимый результат." },
    I: { name: "Исследовательское", tag: "анализ и наука", color: "var(--c-i)",
         about: "Тебе нравится думать, анализировать и докапываться до сути. Ты задаёшь вопросы «почему» и «как это устроено»." },
    A: { name: "Артистическое", tag: "творчество и дизайн", color: "var(--c-a)",
         about: "Ты мыслишь образами и идеями, замечаешь красоту и хочешь создавать новое, а не следовать строгим шаблонам." },
    S: { name: "Социальное", tag: "люди и помощь", color: "var(--c-s)",
         about: "Тебе хорошо рядом с людьми: помогать, учить, поддерживать. Ты чувствуешь других и легко находишь общий язык." },
    E: { name: "Предприимчивое", tag: "лидерство и бизнес", color: "var(--c-e)",
         about: "Ты умеешь вести за собой, убеждать и добиваться целей. Тебе интересны бизнес, влияние и большие задачи." },
    C: { name: "Конвенциональное", tag: "данные и порядок", color: "var(--c-c)",
         about: "Ты ценишь порядок, точность и систему. Тебе хорошо даётся работа с данными, цифрами и структурой." }
  };
  const ORDER = ["R", "I", "A", "S", "E", "C"];

  /* ---------- School subjects ---------- */
  const SUBJECTS = {
    math: "Математика",
    phys: "Физика",
    bio: "Биология и химия",
    lang: "Языки (рус/каз/англ)",
    hist: "История и обществознание",
    cs: "Информатика",
    art: "Искусство и творчество"
  };

  /* ---------- Questions ----------
     Block 1: 18 RIASEC (3 per direction). type:"riasec", d: direction letter
     Block 2: 7 subjects + 5 skills. type:"subject"/"skill", k: key
     Skill → direction mapping for the profile vector. */
  const SKILL_DIM = { comm: "S", analysis: "I", creative: "A", hands: "R", lead: "E" };

  const QUESTIONS = [
    // --- Block 1: RIASEC ---
    { type: "riasec", d: "R", t: "Мне нравится работать руками: чинить, собирать, мастерить." },
    { type: "riasec", d: "I", t: "Я люблю решать сложные задачи и головоломки." },
    { type: "riasec", d: "A", t: "Я люблю придумывать новое: образы, тексты, музыку, идеи." },
    { type: "riasec", d: "S", t: "Мне приятно помогать людям и объяснять им что-то." },
    { type: "riasec", d: "E", t: "Мне нравится брать ответственность и вести других за собой." },
    { type: "riasec", d: "C", t: "Мне нравится порядок, когда всё разложено по полочкам." },

    { type: "riasec", d: "R", t: "Я с интересом разбираюсь в технике, механизмах и оборудовании." },
    { type: "riasec", d: "I", t: "Мне интересно докапываться до сути: почему всё устроено именно так." },
    { type: "riasec", d: "A", t: "Я замечаю красоту и обращаю внимание на то, как что-то выглядит." },
    { type: "riasec", d: "S", t: "Я хорошо чувствую настроение других и легко нахожу общий язык." },
    { type: "riasec", d: "E", t: "Я люблю убеждать и отстаивать свою точку зрения." },
    { type: "riasec", d: "C", t: "Я аккуратно работаю с цифрами, таблицами и документами." },

    { type: "riasec", d: "R", t: "Мне больше по душе дело на выезде или в движении, чем только за столом." },
    { type: "riasec", d: "I", t: "Меня увлекают наука, эксперименты и анализ данных." },
    { type: "riasec", d: "A", t: "Мне комфортнее там, где можно творить, а не следовать строгим шаблонам." },
    { type: "riasec", d: "S", t: "Я хочу, чтобы моя работа приносила пользу людям напрямую." },
    { type: "riasec", d: "E", t: "Меня привлекают бизнес, деньги и амбициозные цели." },
    { type: "riasec", d: "C", t: "Мне спокойнее, когда есть чёткие правила и инструкции." },

    // --- Block 2: subjects ---
    { type: "subject", k: "math", t: "Насколько тебе нравится и легко даётся математика?" },
    { type: "subject", k: "phys", t: "Насколько тебе нравится и легко даётся физика?" },
    { type: "subject", k: "bio",  t: "Насколько тебе нравятся биология и химия?" },
    { type: "subject", k: "lang", t: "Насколько тебе нравятся языки (русский, казахский, английский)?" },
    { type: "subject", k: "hist", t: "Насколько тебе нравятся история и обществознание?" },
    { type: "subject", k: "cs",   t: "Насколько тебе нравится информатика и работа с компьютером?" },
    { type: "subject", k: "art",  t: "Насколько тебе нравятся искусство, рисование, дизайн?" },

    // --- Block 2: skills ---
    { type: "skill", k: "comm",     t: "Мне легко общаться и находить подход к разным людям." },
    { type: "skill", k: "analysis", t: "Я люблю работать с числами, логикой и анализом." },
    { type: "skill", k: "creative", t: "Я люблю придумывать и создавать что-то новое." },
    { type: "skill", k: "hands",    t: "Мне нравится работать руками и с техникой." },
    { type: "skill", k: "lead",     t: "Я умею организовывать процесс и вести за собой команду." }
  ];

  const OPTIONS = [
    { t: "Совсем не про меня", v: 0 },
    { t: "Скорее нет", v: 1 },
    { t: "Как когда", v: 2 },
    { t: "Скорее да", v: 3 },
    { t: "Это точно я", v: 4 }
  ];

  /* ---------- Universities ---------- */
  const UNIS = {
    nu:      { name: "Nazarbayev University", city: "Астана", profile: "Инженерия, наука, бизнес, IT — на английском, сильнейшая исследовательская база.", url: "https://nu.edu.kz" },
    aitu:    { name: "Astana IT University", city: "Астана", profile: "IT, разработка, кибербезопасность, Data Science.", url: "https://astanait.edu.kz" },
    satbayev:{ name: "Satbayev University (КазНИТУ)", city: "Алматы", profile: "Инженерия, геология, нефтегаз, строительство, архитектура.", url: "https://satbayev.university" },
    kbtu:    { name: "КБТУ", city: "Алматы", profile: "IT, нефтегаз, энергетика, финансы, математика.", url: "https://kbtu.edu.kz" },
    sdu:     { name: "SDU University", city: "Каскелен", profile: "IT, инженерия, бизнес, педагогика.", url: "https://sdu.edu.kz" },
    kimep:   { name: "КИМЭП", city: "Алматы", profile: "Бизнес, финансы, право, международные отношения, журналистика (на английском).", url: "https://kimep.kz" },
    narxoz:  { name: "Университет Нархоз", city: "Алматы", profile: "Экономика, финансы, учёт, бизнес, право.", url: "https://narxoz.kz" },
    almau:   { name: "AlmaU (Алматы Менеджмент Университет)", city: "Алматы", profile: "Менеджмент, маркетинг, предпринимательство, дизайн.", url: "https://almau.edu.kz" },
    kaznu:   { name: "КазНУ им. аль-Фараби", city: "Алматы", profile: "Классический универ: наука, психология, языки, журналистика, экология.", url: "https://kaznu.kz" },
    enu:     { name: "ЕНУ им. Л. Гумилёва", city: "Астана", profile: "Международные отношения, экономика, педагогика, госуправление.", url: "https://enu.kz" },
    kaznmu:  { name: "КазНМУ им. Асфендиярова", city: "Алматы", profile: "Медицина: лечебное дело, педиатрия, стоматология, фармация.", url: "https://kaznmu.edu.kz" },
    kazgasa: { name: "КазГАСА (МОК)", city: "Алматы", profile: "Архитектура, дизайн, строительство.", url: "https://kazgasa.kz" },
    kaznpu:  { name: "КазНПУ им. Абая", city: "Алматы", profile: "Педагогика, психология, дефектология, подготовка учителей.", url: "https://kaznpu.kz" },
    kazguu:  { name: "Maqsut Narikbayev University (КАЗГЮУ)", city: "Астана", profile: "Право, международное право, госуправление, IT.", url: "https://kazguu.kz" },
    kazatu:  { name: "КазАТУ им. С. Сейфуллина", city: "Астана", profile: "Агрономия, ветеринария, агроинженерия, логистика.", url: "https://kazatu.edu.kz" }
  };

  /* ---------- Professions ----------
     w: вектор RIASEC [R,I,A,S,E,C], 0..3
     subj: ключевые школьные предметы
     sal: зарплатная вилка в Казахстане (ориентир, ₸/мес)
     uni: подходящие вузы */
  const PROFS = [
    { name: "Разработчик ПО", w: [1,3,1,0,1,2], subj: ["cs","math"], desc: "Создаёт сайты, приложения и сервисы, превращая задачи в работающий код.", sal: "400 000 – 1 500 000 ₸", uni: ["aitu","kbtu","nu"] },
    { name: "Data-аналитик / Data Scientist", w: [0,3,0,0,1,3], subj: ["math","cs"], desc: "Находит в данных закономерности и превращает их в выводы и прогнозы.", sal: "450 000 – 1 400 000 ₸", uni: ["aitu","nu","sdu"] },
    { name: "Специалист по кибербезопасности", w: [1,3,0,0,1,2], subj: ["cs","math"], desc: "Защищает системы и данные компаний от взломов и утечек.", sal: "500 000 – 1 500 000 ₸", uni: ["aitu","kbtu"] },
    { name: "Инженер-строитель", w: [3,2,1,0,1,1], subj: ["phys","math"], desc: "Проектирует и ведёт строительство зданий, дорог и мостов.", sal: "300 000 – 900 000 ₸", uni: ["satbayev","kazgasa"] },
    { name: "Инженер-механик", w: [3,2,0,0,0,1], subj: ["phys","math"], desc: "Разрабатывает и обслуживает машины, станки и механизмы.", sal: "300 000 – 850 000 ₸", uni: ["satbayev","kbtu"] },
    { name: "Инженер-нефтяник / геолог", w: [3,3,0,0,1,1], subj: ["phys","math"], desc: "Работает с добычей нефти и газа — ключевая отрасль Казахстана.", sal: "500 000 – 1 800 000 ₸", uni: ["satbayev","kbtu"] },
    { name: "Инженер-энергетик", w: [3,2,0,0,1,1], subj: ["phys","math"], desc: "Отвечает за выработку и передачу электроэнергии.", sal: "300 000 – 950 000 ₸", uni: ["satbayev","kbtu"] },
    { name: "Архитектор", w: [2,1,3,0,1,1], subj: ["art","math","phys"], desc: "Проектирует здания и пространства — на стыке искусства и инженерии.", sal: "350 000 – 1 100 000 ₸", uni: ["kazgasa","satbayev"] },
    { name: "Графический / UX-дизайнер", w: [0,1,3,1,1,1], subj: ["art","cs"], desc: "Делает интерфейсы, логотипы и графику понятными и красивыми.", sal: "300 000 – 1 000 000 ₸", uni: ["almau","narxoz","kazgasa"] },
    { name: "Дизайнер интерьера", w: [1,0,3,1,1,1], subj: ["art"], desc: "Планирует и оформляет пространство жилых и рабочих помещений.", sal: "250 000 – 900 000 ₸", uni: ["kazgasa","almau"] },
    { name: "Врач", w: [1,3,0,2,0,1], subj: ["bio"], desc: "Ставит диагноз и лечит людей, постоянно учится и принимает решения.", sal: "250 000 – 1 000 000 ₸", uni: ["kaznmu","nu"] },
    { name: "Стоматолог", w: [2,2,1,2,1,0], subj: ["bio"], desc: "Лечит зубы и заботится о здоровье полости рта; востребован и в частной практике.", sal: "350 000 – 1 500 000 ₸", uni: ["kaznmu"] },
    { name: "Фармацевт", w: [1,2,0,1,1,3], subj: ["bio"], desc: "Разбирается в лекарствах, консультирует и работает в аптеках и лабораториях.", sal: "250 000 – 700 000 ₸", uni: ["kaznmu"] },
    { name: "Медсестра / фельдшер", w: [2,1,0,3,0,1], subj: ["bio"], desc: "Заботится о пациентах, выполняет процедуры и поддерживает людей рядом.", sal: "200 000 – 500 000 ₸", uni: ["kaznmu"] },
    { name: "Психолог", w: [0,2,1,3,1,0], subj: ["bio","hist"], desc: "Помогает людям разобраться в себе, справиться со стрессом и отношениями.", sal: "250 000 – 800 000 ₸", uni: ["kaznu","enu"] },
    { name: "Логопед / дефектолог", w: [0,1,1,3,0,1], subj: ["bio","lang"], desc: "Помогает детям и взрослым с речью и развитием; очень востребован.", sal: "200 000 – 600 000 ₸", uni: ["kaznpu"] },
    { name: "Учитель / педагог", w: [0,1,1,3,1,1], subj: ["lang","hist","math"], desc: "Объясняет сложное простыми словами и помогает ученикам расти.", sal: "250 000 – 700 000 ₸", uni: ["kaznpu","enu"] },
    { name: "Юрист", w: [0,1,0,1,2,3], subj: ["hist","lang"], desc: "Разбирается в законах, защищает интересы людей и организаций.", sal: "300 000 – 1 500 000 ₸", uni: ["kazguu","kaznu"] },
    { name: "Экономист", w: [0,2,0,0,2,3], subj: ["math","hist"], desc: "Анализирует финансы и рынки, помогает принимать денежные решения.", sal: "300 000 – 1 000 000 ₸", uni: ["narxoz","kimep","nu"] },
    { name: "Финансовый аналитик", w: [0,2,0,0,1,3], subj: ["math"], desc: "Оценивает вложения, считает риски и прибыль компаний и банков.", sal: "400 000 – 1 300 000 ₸", uni: ["kimep","narxoz","nu"] },
    { name: "Бухгалтер / аудитор", w: [0,1,0,0,0,3], subj: ["math"], desc: "Ведёт учёт, проверяет отчётность и следит за порядком в финансах.", sal: "250 000 – 800 000 ₸", uni: ["narxoz","almau"] },
    { name: "Банковский специалист", w: [0,1,0,1,2,3], subj: ["math"], desc: "Работает с клиентами, кредитами и операциями в банке.", sal: "250 000 – 900 000 ₸", uni: ["narxoz","kimep"] },
    { name: "Маркетолог", w: [0,1,2,1,3,1], subj: ["lang","hist"], desc: "Продвигает продукты, изучает аудиторию и придумывает кампании.", sal: "300 000 – 1 100 000 ₸", uni: ["almau","narxoz","kimep"] },
    { name: "SMM-специалист / контент-мейкер", w: [0,1,3,1,2,1], subj: ["lang","cs"], desc: "Ведёт соцсети брендов, снимает и пишет контент, растит аудиторию.", sal: "250 000 – 900 000 ₸", uni: ["almau","narxoz"] },
    { name: "Предприниматель", w: [1,1,1,1,3,1], subj: ["math","lang"], desc: "Запускает своё дело: находит идею, собирает команду, берёт риск на себя.", sal: "очень разная — зависит от дела", uni: ["almau","kimep","nu"] },
    { name: "Менеджер проектов", w: [0,1,1,1,3,2], subj: ["math","lang"], desc: "Организует команды и сроки, чтобы проект дошёл до результата.", sal: "400 000 – 1 300 000 ₸", uni: ["almau","kimep"] },
    { name: "Журналист", w: [0,1,3,2,1,0], subj: ["lang","hist"], desc: "Рассказывает истории: пишет тексты, снимает видео, ведёт медиа.", sal: "250 000 – 800 000 ₸", uni: ["kaznu","kimep"] },
    { name: "PR-специалист", w: [0,1,2,2,2,1], subj: ["lang","hist"], desc: "Формирует образ компании или человека, работает со СМИ и аудиторией.", sal: "300 000 – 1 000 000 ₸", uni: ["kimep","almau"] },
    { name: "Переводчик / лингвист", w: [0,1,2,2,1,1], subj: ["lang"], desc: "Переводит и работает с языками в бизнесе, медиа и дипломатии.", sal: "250 000 – 900 000 ₸", uni: ["kaznu","enu"] },
    { name: "Международник / дипломат", w: [0,2,1,2,2,1], subj: ["lang","hist"], desc: "Работает с другими странами: переговоры, соглашения, представительство.", sal: "300 000 – 1 200 000 ₸", uni: ["kimep","enu","nu"] },
    { name: "Специалист госуправления", w: [0,1,0,1,2,3], subj: ["hist","lang"], desc: "Работает в государственных органах: проекты, политика, услуги для людей.", sal: "250 000 – 900 000 ₸", uni: ["enu","kazguu"] },
    { name: "HR-специалист", w: [0,1,1,3,2,1], subj: ["lang","hist"], desc: "Подбирает людей в компанию и помогает команде работать слаженно.", sal: "300 000 – 900 000 ₸", uni: ["almau","narxoz"] },
    { name: "Логист / специалист по снабжению", w: [1,1,0,1,2,3], subj: ["math","hist"], desc: "Организует перевозки, склады и поставки, чтобы всё приходило вовремя.", sal: "300 000 – 950 000 ₸", uni: ["kazatu","narxoz"] },
    { name: "Агроном", w: [3,2,0,1,1,1], subj: ["bio","math"], desc: "Отвечает за урожай и современные технологии в сельском хозяйстве.", sal: "250 000 – 800 000 ₸", uni: ["kazatu"] },
    { name: "Ветеринар", w: [2,2,0,2,0,1], subj: ["bio"], desc: "Лечит животных — от домашних до сельскохозяйственных.", sal: "250 000 – 700 000 ₸", uni: ["kazatu"] },
    { name: "Эколог", w: [1,3,1,1,0,1], subj: ["bio","phys"], desc: "Изучает влияние на природу и помогает делать производство чище.", sal: "250 000 – 800 000 ₸", uni: ["kaznu","kazatu"] },
    { name: "Биотехнолог / химик", w: [1,3,0,0,0,2], subj: ["bio","phys"], desc: "Работает в лабораториях: наука, фарма, пищевые и химические технологии.", sal: "250 000 – 900 000 ₸", uni: ["nu","kaznu"] },
    { name: "Геодезист / картограф", w: [3,1,0,0,0,2], subj: ["math","phys"], desc: "Измеряет землю и создаёт карты для строительства и кадастра.", sal: "300 000 – 800 000 ₸", uni: ["satbayev"] },
    { name: "3D-художник / аниматор", w: [1,1,3,0,1,1], subj: ["art","cs"], desc: "Создаёт графику, анимацию и миры для игр, кино и рекламы.", sal: "300 000 – 1 100 000 ₸", uni: ["aitu","kazgasa"] },
    { name: "Социальный работник", w: [0,1,1,3,1,1], subj: ["hist","bio"], desc: "Поддерживает людей в трудной ситуации и помогает им решать проблемы.", sal: "200 000 – 500 000 ₸", uni: ["kaznu","enu"] }
  ];

  /* ============================================================
     Helpers
     ============================================================ */
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const views = ["loading", "auth", "home", "test", "result", "history"];
  function show(name) {
    views.forEach((v) => { const n = $("view-" + v); if (n) n.hidden = (v !== name); });
    $("topbar").hidden = (name === "loading" || name === "auth");
    window.scrollTo({ top: 0 });
  }

  /* ============================================================
     Supabase
     ============================================================ */
  let sb = null;
  let currentUser = null;
  let isGuest = false;
  const keysReady = SUPABASE_URL && SUPABASE_URL !== "СЮДА_ВСТАВИТЬ" &&
                    SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "СЮДА_ВСТАВИТЬ";

  if (keysReady && window.supabase) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  /* ============================================================
     Theme toggle
     ============================================================ */
  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("mb-theme"); } catch (e) {}
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    $("themeBtn").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const isDark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      const next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("mb-theme", next); } catch (e) {}
    });
  })();

  /* ============================================================
     Home: directions preview
     ============================================================ */
  (function buildDirGrid() {
    const g = $("dirGrid");
    ORDER.forEach((k) => {
      const d = DIRS[k];
      const c = el("div", "dir-card",
        '<span class="dir-dot" style="background:' + d.color + '"></span>' +
        '<div><b>' + d.name + '</b><span>' + d.tag + '</span></div>');
      g.appendChild(c);
    });
  })();

  /* ============================================================
     Auth UI
     ============================================================ */
  let mode = "login"; // or "signup"

  function setMode(m) {
    mode = m;
    $("tabLogin").classList.toggle("active", m === "login");
    $("tabSignup").classList.toggle("active", m === "signup");
    $("nameField").hidden = (m === "login");
    $("authSubmit").textContent = (m === "login") ? "Войти" : "Создать аккаунт";
    $("inpPass").setAttribute("autocomplete", m === "login" ? "current-password" : "new-password");
    $("authHint").textContent = (m === "login")
      ? "Нет аккаунта? Нажми «Регистрация»."
      : "Уже есть аккаунт? Нажми «Вход».";
    hideMsg();
  }
  function showMsg(text, kind) {
    const m = $("authMsg");
    m.textContent = text; m.className = "form-msg " + (kind || "err"); m.hidden = false;
  }
  function hideMsg() { $("authMsg").hidden = true; }

  function ruAuthError(err) {
    const msg = (err && err.message ? err.message : "").toLowerCase();
    if (msg.includes("invalid login")) return "Неверный email или пароль.";
    if (msg.includes("already registered") || msg.includes("already been registered")) return "Этот email уже зарегистрирован. Попробуй войти.";
    if (msg.includes("password should be")) return "Пароль слишком короткий — минимум 6 символов.";
    if (msg.includes("unable to validate email") || msg.includes("invalid email")) return "Проверь, правильно ли введён email.";
    if (msg.includes("email not confirmed")) return "Email не подтверждён. Проверь почту или попроси отключить подтверждение email в Supabase.";
    if (msg.includes("rate limit") || msg.includes("too many")) return "Слишком много попыток. Подожди немного и попробуй снова.";
    if (msg.includes("failed to fetch") || msg.includes("networkerror")) return "Нет связи с сервером. Проверь интернет и правильность ключей Supabase.";
    return err && err.message ? err.message : "Что-то пошло не так. Попробуй ещё раз.";
  }

  $("tabLogin").addEventListener("click", () => setMode("login"));
  $("tabSignup").addEventListener("click", () => setMode("signup"));

  $("authForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMsg();
    if (!sb) { showMsg("Ключи Supabase не вставлены в app.js. Открой файл и впиши SUPABASE_URL и SUPABASE_ANON_KEY.", "err"); return; }

    const name = $("inpName").value.trim();
    const email = $("inpEmail").value.trim();
    const pass = $("inpPass").value;
    const btn = $("authSubmit");
    btn.disabled = true;
    const prev = btn.textContent;
    btn.textContent = "Подождите…";

    try {
      if (mode === "signup") {
        if (!name) { showMsg("Введи имя.", "err"); return; }
        const { data, error } = await sb.auth.signUp({
          email, password: pass, options: { data: { full_name: name } }
        });
        if (error) { showMsg(ruAuthError(error), "err"); return; }
        if (data.session) {
          onLoggedIn(data.user);
        } else {
          // email confirmation on
          showMsg("Аккаунт создан! Подтверди email по ссылке из письма, затем войди.", "ok");
          setMode("login");
        }
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) { showMsg(ruAuthError(error), "err"); return; }
        onLoggedIn(data.user);
      }
    } catch (err) {
      showMsg(ruAuthError(err), "err");
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  });

  $("guestBtn").addEventListener("click", () => {
    const name = $("inpName").value.trim() || "Гость";
    enterGuest(name);
  });

  function enterGuest(name) {
    isGuest = true;
    currentUser = { id: "guest", email: "", user_metadata: { full_name: name }, guest: true };
    $("userEmail").innerHTML = '<span class="guest-badge">гостевой режим</span>';
    $("logoutBtn").hidden = false;
    $("logoutBtn").textContent = "Выйти";
    $("helloName").textContent = "Привет, " + displayName(currentUser) + "!";
    show("home");
  }

  $("logoutBtn").addEventListener("click", async () => {
    if (sb && !isGuest) await sb.auth.signOut();
    currentUser = null;
    isGuest = false;
    $("logoutBtn").hidden = true;
    $("userEmail").textContent = "";
    show("auth");
    setMode("login");
  });

  function displayName(user) {
    const n = user && user.user_metadata && user.user_metadata.full_name;
    return n || (user && user.email ? user.email.split("@")[0] : "друг");
  }

  function onLoggedIn(user) {
    currentUser = user;
    $("userEmail").textContent = user.email || "";
    $("logoutBtn").hidden = false;
    $("helloName").textContent = "Привет, " + displayName(user) + "!";
    show("home");
  }

  /* ============================================================
     Test flow
     ============================================================ */
  let answers = new Array(QUESTIONS.length).fill(null);
  let current = 0;
  $("qTotal").textContent = QUESTIONS.length;

  function startTest() {
    answers = new Array(QUESTIONS.length).fill(null);
    current = 0;
    show("test");
    renderQuestion("fwd");
  }

  function renderQuestion(dir) {
    const q = QUESTIONS[current];
    const card = $("qCard");

    $("qNum").textContent = current + 1;
    $("progBar").style.width = (current / QUESTIONS.length * 100) + "%";
    $("blockTag").textContent = current < 18 ? "Блок 1 · склонности" : "Блок 2 · предметы и навыки";

    const tag = $("qTag");
    if (q.type === "riasec") {
      const d = DIRS[q.d];
      tag.textContent = d.name + " · " + d.tag;
      tag.style.color = d.color;
    } else if (q.type === "subject") {
      tag.textContent = "Школьный предмет";
      tag.style.color = "var(--accent-ink)";
    } else {
      tag.textContent = "Навык";
      tag.style.color = "var(--accent-ink)";
    }
    $("qText").textContent = q.t;

    const opts = $("opts");
    opts.innerHTML = "";
    OPTIONS.forEach((o) => {
      const b = el("button", "opt" + (answers[current] === o.v ? " sel" : ""),
        '<span class="dot"></span><span>' + o.t + "</span>");
      b.type = "button";
      b.addEventListener("click", () => choose(o.v));
      opts.appendChild(b);
    });

    card.classList.remove("anim-in", "anim-back");
    void card.offsetWidth;
    card.classList.add(dir === "back" ? "anim-back" : "anim-in");

    $("backBtn").disabled = (current === 0);
    updateNext();
  }

  function updateNext() {
    const btn = $("nextBtn");
    btn.disabled = answers[current] === null;
    btn.textContent = (current === QUESTIONS.length - 1) ? "Показать результат →" : "Далее →";
  }

  function choose(v) {
    answers[current] = v;
    const opts = $("opts").children;
    for (let i = 0; i < opts.length; i++) opts[i].classList.toggle("sel", OPTIONS[i].v === v);
    updateNext();
  }

  function next() {
    if (answers[current] === null) return;
    if (current === QUESTIONS.length - 1) { $("progBar").style.width = "100%"; finish(); return; }
    current++; renderQuestion("fwd");
  }
  function back() { if (current === 0) return; current--; renderQuestion("back"); }

  $("startBtn").addEventListener("click", startTest);
  $("restartBtn").addEventListener("click", startTest);
  $("histStartBtn").addEventListener("click", startTest);
  $("nextBtn").addEventListener("click", next);
  $("backBtn").addEventListener("click", back);
  $("historyBtn").addEventListener("click", openHistory);
  $("toHistoryBtn").addEventListener("click", openHistory);
  $("histHomeBtn").addEventListener("click", () => show("home"));

  document.addEventListener("keydown", (e) => {
    if ($("view-test").hidden) return;
    if (e.key >= "1" && e.key <= "5") choose(OPTIONS[parseInt(e.key, 10) - 1].v);
    else if (e.key === "ArrowRight" || e.key === "Enter") { if (!$("nextBtn").disabled) next(); }
    else if (e.key === "ArrowLeft") back();
  });

  /* ============================================================
     Scoring
     ============================================================ */
  // max per direction: all have a skill (+4) except C → use per-dim max for normalization
  const DIM_MAX = { R: 16, I: 16, A: 16, S: 16, E: 16, C: 12 };

  function computeProfile() {
    const raw = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const subj = {}; Object.keys(SUBJECTS).forEach((k) => subj[k] = 0);

    QUESTIONS.forEach((q, i) => {
      const v = answers[i] || 0;
      if (q.type === "riasec") raw[q.d] += v;
      else if (q.type === "subject") subj[q.k] = v;
      else if (q.type === "skill") raw[SKILL_DIM[q.k]] += v; // skill reinforces its direction
    });

    const norm = {}; // 0..1 per direction
    ORDER.forEach((k) => norm[k] = raw[k] / DIM_MAX[k]);
    return { raw, norm, subj };
  }

  function cosine(u, p) {
    let dot = 0, nu = 0, np = 0;
    for (let i = 0; i < ORDER.length; i++) {
      const a = u[ORDER[i]], b = p[i];
      dot += a * b; nu += a * a; np += b * b;
    }
    if (nu === 0 || np === 0) return 0;
    return dot / (Math.sqrt(nu) * Math.sqrt(np));
  }

  function matchProfessions(profile) {
    const userTop3 = ORDER.slice().sort((a, b) => profile.norm[b] - profile.norm[a]).slice(0, 3);

    const scored = PROFS.map((p) => {
      const cos = cosine(profile.norm, p.w); // 0..1
      // subject match: средняя нормированная оценка по ключевым предметам
      let sSum = 0; p.subj.forEach((k) => sSum += (profile.subj[k] || 0) / 4);
      const subjMatch = p.subj.length ? sSum / p.subj.length : 0.5;
      const pct = Math.round((0.6 * cos + 0.4 * subjMatch) * 100);

      // объяснение
      const profDims = ORDER.map((k, i) => ({ k, w: p.w[i] })).sort((a, b) => b.w - a.w)
        .filter((x) => x.w >= 2).slice(0, 2).map((x) => x.k);
      const matchedDirs = profDims.filter((k) => userTop3.includes(k)).map((k) => DIRS[k].name);
      const strongSubj = p.subj.filter((k) => (profile.subj[k] || 0) >= 3).map((k) => SUBJECTS[k].toLowerCase());

      let why = "";
      if (matchedDirs.length) why += "Совпадает с твоим направлением: " + matchedDirs.join(" и ") + ".";
      else why += "Частично совпадает с твоим профилем склонностей.";
      if (strongSubj.length) why += " Пригодятся любимые предметы: " + strongSubj.join(", ") + ".";

      return { p, pct, why };
    });

    scored.sort((a, b) => b.pct - a.pct);
    return scored;
  }

  /* ============================================================
     Result rendering
     ============================================================ */
  function finish() {
    const profile = computeProfile();
    const matched = matchProfessions(profile);
    const ranked = ORDER.slice().sort((a, b) => profile.norm[b] - profile.norm[a]);
    const topProfs = matched.slice(0, 7);

    renderBars(profile, ranked);
    renderTops(ranked);
    renderProfs(topProfs);

    $("resEyebrow").textContent = "Твой результат";
    show("result");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll("#bars .track > i").forEach((i) => i.style.width = i.dataset.w + "%");
    }));

    saveResult(profile, ranked, topProfs);
  }

  function renderBars(profile, ranked) {
    const box = $("bars"); box.innerHTML = "";
    ORDER.forEach((k) => {
      const d = DIRS[k];
      const p = Math.round(profile.norm[k] * 100);
      const isTop = ranked.indexOf(k) < 3;
      const row = el("div", "bar-row",
        '<div class="bar-top">' +
          '<span class="bar-name"><span class="sw" style="background:' + d.color + '"></span>' +
            d.name + ' <small>' + d.tag + '</small></span>' +
          '<span class="bar-val">' + p + '%</span></div>' +
        '<div class="track"><i data-w="' + p + '" style="background:' + d.color + (isTop ? "" : ";opacity:.7") + '"></i></div>');
      box.appendChild(row);
    });
  }

  function renderTops(ranked) {
    const box = $("tops"); box.innerHTML = "";
    const labels = ["Ведущее направление", "Второе направление", "Третье направление"];
    ranked.slice(0, 3).forEach((k, idx) => {
      const d = DIRS[k];
      const c = el("div", "top-card",
        '<div class="tc-head"><h4>' + d.name + '</h4><span class="rank">' + labels[idx] + '</span></div>' +
        '<p>' + d.about + '</p>');
      c.style.borderLeftColor = d.color;
      box.appendChild(c);
    });
  }

  function uniBlock(keys) {
    return '<div class="unis">' + keys.map((key) => {
      const u = UNIS[key]; if (!u) return "";
      return '<div class="uni"><a href="' + u.url + '" target="_blank" rel="noopener">' + esc(u.name) + '</a>' +
             '<div class="uni-meta">' + esc(u.city) + ' · ' + esc(u.profile) + '</div></div>';
    }).join("") + '</div>';
  }

  function renderProfs(list) {
    const grid = $("profGrid"); grid.innerHTML = "";
    list.forEach((item) => {
      const p = item.p;
      const dims = ORDER.map((k, i) => ({ k, w: p.w[i] })).sort((a, b) => b.w - a.w)
        .filter((x) => x.w >= 2).slice(0, 2);
      const tags = dims.map((x) => '<span style="background:' + DIRS[x.k].color + '">' + DIRS[x.k].name + '</span>').join("");
      const subjNames = p.subj.map((k) => SUBJECTS[k]).join(", ");

      const card = el("div", "prof",
        '<div class="prof-top"><h4>' + esc(p.name) + '</h4><span class="match">' + item.pct + '%</span></div>' +
        '<div class="tags">' + tags + '</div>' +
        '<div class="why">' + esc(item.why) + '</div>' +
        '<div class="pdesc">' + esc(p.desc) + '</div>' +
        '<div class="field-line"><b>Важные предметы</b>' + esc(subjNames) + '</div>' +
        '<div class="field-line"><b>Зарплата в Казахстане (ориентир)</b><span class="salary">' + esc(p.sal) + '</span></div>' +
        '<div class="field-line"><b>Куда поступать</b>' + uniBlock(p.uni) + '</div>');
      grid.appendChild(card);
    });
  }

  /* ============================================================
     Save & history (Supabase)
     ============================================================ */
  // --- guest history in localStorage ---
  const GUEST_KEY = "mb-guest-results";
  function guestLoad() {
    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]"); } catch (e) { return []; }
  }
  function guestSave(row) {
    try {
      const all = guestLoad();
      all.unshift(row);
      localStorage.setItem(GUEST_KEY, JSON.stringify(all.slice(0, 50)));
      return true;
    } catch (e) { return false; }
  }

  async function saveResult(profile, ranked, topProfs) {
    const msg = $("saveMsg");
    if (!currentUser) { msg.hidden = true; return; }

    const scores = {};
    ORDER.forEach((k) => scores[k] = Math.round(profile.norm[k] * 100));
    const top_professions = topProfs.map((x) => ({ name: x.p.name, match: x.pct }));

    // guest mode → save locally in the browser
    if (isGuest || !sb) {
      msg.hidden = false;
      const ok = guestSave({ scores: { dirs: scores, top3: ranked.slice(0, 3) }, top_professions, created_at: new Date().toISOString() });
      if (ok) { msg.className = "save-msg ok"; msg.textContent = "✓ Результат сохранён на этом устройстве (гостевой режим)."; }
      else { msg.className = "save-msg"; msg.textContent = ""; msg.hidden = true; }
      return;
    }

    msg.hidden = false; msg.className = "save-msg"; msg.textContent = "Сохраняем результат…";
    try {
      const { error } = await sb.from("results").insert({
        user_id: currentUser.id,
        scores: { dirs: scores, top3: ranked.slice(0, 3) },
        top_professions
      });
      if (error) throw error;
      msg.className = "save-msg ok"; msg.textContent = "✓ Результат сохранён в «Мои результаты».";
    } catch (e) {
      msg.className = "save-msg err";
      msg.textContent = "Не удалось сохранить результат (" + (e.message || "ошибка") + "). Проверь таблицу results и RLS в Supabase.";
    }
  }

  function renderHistoryRows(box, data) {
    if (!data || !data.length) {
      box.innerHTML = '<p class="hist-empty">Пока нет результатов. Пройди тест — он сохранится здесь.</p>';
      return;
    }
    box.innerHTML = "";
    data.forEach((row) => {
      const date = new Date(row.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
      const top3 = (row.scores && row.scores.top3 || []).map((k) => DIRS[k] ? DIRS[k].name : k).join(" · ");
      const profs = (row.top_professions || []).slice(0, 4)
        .map((p) => '<span>' + esc(p.name) + ' · ' + p.match + '%</span>').join("");
      const c = el("div", "hist-card",
        '<div class="hist-top"><span class="hist-dirs">' + esc(top3 || "—") + '</span>' +
        '<span class="hist-date">' + esc(date) + '</span></div>' +
        '<div class="hist-profs">' + profs + '</div>');
      box.appendChild(c);
    });
  }

  async function openHistory() {
    show("history");
    const box = $("historyList");
    box.innerHTML = '<p class="hist-empty">Загрузка…</p>';
    if (!currentUser) { box.innerHTML = '<p class="hist-empty">История доступна после входа.</p>'; return; }

    if (isGuest || !sb) { renderHistoryRows(box, guestLoad()); return; }

    try {
      const { data, error } = await sb.from("results")
        .select("id, scores, top_professions, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      renderHistoryRows(box, data);
    } catch (e) {
      box.innerHTML = '<p class="hist-empty">Не удалось загрузить историю: ' + esc(e.message || "ошибка") + '</p>';
    }
  }

  /* ============================================================
     PWA: install prompt + service worker
     ============================================================ */
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $("installBtn").hidden = false;
  });
  $("installBtn").addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("installBtn").hidden = true;
  });
  window.addEventListener("appinstalled", () => { $("installBtn").hidden = true; });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ============================================================
     Boot
     ============================================================ */
  async function boot() {
    show("auth"); setMode("login");
    if (!sb) {
      // keys not set — app still fully usable via "Попробовать без регистрации"
      showMsg("Вход по аккаунту включится после подключения Supabase. Пока можно пройти тест без регистрации →", "ok");
      return;
    }
    try {
      const { data } = await sb.auth.getSession();
      if (data && data.session) { onLoggedIn(data.session.user); return; }
    } catch (e) {}
  }

  boot();
})();
