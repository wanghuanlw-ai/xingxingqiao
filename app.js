(function () {
  "use strict";

  const STORAGE = {
    assessment: "xingxingqiao.assessment",
    favorites: "xingxingqiao.favorites",
    lastRead: "xingxingqiao.lastRead",
    accessibility: "xingxingqiao.accessibility",
    draft: "xingxingqiao.assessmentDraft"
  };

  const state = {
    profile: null,
    favorites: [],
    lastRead: null,
    accessibility: { mode: "soft", fontScale: 1 },
    assessmentStep: 0,
    answers: {},
    bookFilters: { level: "all", interest: "all" },
    currentBookId: null,
    currentPage: 0,
    isReading: false,
    readingTimer: null,
    readingPos: 0,
    agentMuted: false
  };

  const ICON_PATHS = {
    home: '<path d="M3 10.8 12 3l9 7.8V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
    clipboard:
      '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>',
    library:
      '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
    "book-open":
      '<path d="M2 4h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/>',
    heart:
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    play: '<path d="m8 5 11 7-11 7Z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    volume:
      '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    rotate:
      '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    info:
      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    sparkle:
      '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z"/>',
    arrow:
      '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "shield-check":
      '<path d="M12 3 4 6v5c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6Z"/><path d="m9 12 2 2 4-4"/>'
  };

  const main = document.getElementById("main");
  const toastEl = document.getElementById("toast");
  const siteNav = document.getElementById("site-nav");
  const navToggle = document.querySelector(".nav-toggle");

  function icon(name, size) {
    const paths = ICON_PATHS[name];
    if (!paths) return "";
    return `<svg class="icon" width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }

  function storeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function storeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      toast("当前浏览器无法保存进度，但本次体验仍可继续。");
    }
  }

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2800);
  }

  function loadState() {
    state.profile = storeGet(STORAGE.assessment, null);
    state.favorites = storeGet(STORAGE.favorites, []);
    state.lastRead = storeGet(STORAGE.lastRead, null);
    state.accessibility = Object.assign(
      { mode: "soft", fontScale: 1 },
      storeGet(STORAGE.accessibility, {})
    );
    const draft = storeGet(STORAGE.draft, null);
    if (draft && !state.profile) {
      state.assessmentStep = draft.step || 0;
      state.answers = draft.answers || {};
    }
  }

  function saveDraft() {
    storeSet(STORAGE.draft, {
      step: state.assessmentStep,
      answers: state.answers
    });
  }

  function saveProfile(profile) {
    state.profile = profile;
    storeSet(STORAGE.assessment, profile);
    storeSet(STORAGE.draft, null);
  }

  function saveAccessibility() {
    storeSet(STORAGE.accessibility, state.accessibility);
  }

  function saveFavorites() {
    storeSet(STORAGE.favorites, state.favorites);
  }

  function saveLastRead() {
    storeSet(STORAGE.lastRead, state.lastRead);
  }

  function applyAccessibility() {
    document.body.dataset.theme = state.accessibility.mode || "soft";
    document.documentElement.style.setProperty(
      "--reader-font-scale",
      state.accessibility.fontScale || 1
    );
  }

  function setMode(mode) {
    state.accessibility.mode = mode;
    saveAccessibility();
    applyAccessibility();
    renderRoute();
  }

  function changeFont(delta) {
    state.accessibility.fontScale = Math.max(
      0.9,
      Math.min(1.35, (state.accessibility.fontScale || 1) + delta)
    );
    saveAccessibility();
    applyAccessibility();
    const scaleLabel = document.querySelector("[data-font-scale]");
    if (scaleLabel) scaleLabel.textContent = Math.round(state.accessibility.fontScale * 100) + "%";
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    if (!raw) return { name: "home" };
    const parts = raw.split("/");
    return { name: parts[0], param: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function navigate(hash) {
    if (location.hash === hash) {
      renderRoute();
    } else {
      location.hash = hash;
    }
  }

  function updateNav(activeRoute) {
    const navName = activeRoute === "read" ? "books" : activeRoute;
    document.querySelectorAll(".site-nav a, .bottom-nav a").forEach(function (link) {
      const active = link.dataset.route === navName;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function renderRoute() {
    stopReading();
    const route = parseRoute();
    const valid = ["home", "assess", "agent", "books", "read", "guide", "research"];

    if (!valid.includes(route.name)) {
      navigate("#/home");
      return;
    }

    if (route.name === "read") {
      const book = findBook(route.param);
      if (!book || book.sample || !book.pages.length) {
        navigate("#/books");
        return;
      }
      if (state.currentBookId !== route.param) {
        state.currentBookId = route.param;
        state.currentPage = 0;
      } else {
        state.currentPage = Math.max(0, Math.min(state.currentPage, book.pages.length - 1));
      }
    }

    main.innerHTML = RENDER[route.name](route.param);
    document.body.dataset.route = route.name;
    updateNav(route.name);
    applyAccessibility();
    requestAnimationFrame(function () {
      main.focus({ preventScroll: true });
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function findBook(id) {
    return window.BOOKS.find(function (book) {
      return book.id === id;
    });
  }

  function getBookCover(book) {
    return window.illustrationFor(book.coverKey);
  }

  function hanCharacters(text) {
    const chars = Array.from(text || "");
    const seen = new Set();
    const result = [];
    chars.forEach(function (ch) {
      if (!seen.has(ch) && /\p{Script=Han}/u.test(ch)) {
        seen.add(ch);
        result.push(ch);
      }
    });
    return result;
  }

  function charProfile(text) {
    const data = window.CHAR_DATA || { freq: {}, cum: {}, level: {} };
    const chars = hanCharacters(text);
    let high = 0;
    let mid = 0;
    let low = 0;
    const rare = [];
    chars.forEach(function (ch) {
      const rank = data.freq ? data.freq[ch] : undefined;
      if (!rank || rank > 500) {
        low += 1;
        rare.push({ char: ch, rank: rank || null, level: data.level ? data.level[ch] : undefined });
      } else if (rank <= 100) {
        high += 1;
      } else {
        mid += 1;
      }
    });
    return {
      total: chars.length,
      high: high,
      mid: mid,
      low: low,
      highRatio: chars.length ? Math.round((high / chars.length) * 100) : 0,
      rare: rare
        .sort(function (a, b) {
          return (b.rank || 99999) - (a.rank || 99999);
        })
        .slice(0, 6)
    };
  }

  function bookCharProfile(book) {
    const text = (book.pages || [])
      .map(function (page) {
        return page.sentences;
      })
      .join("");
    return charProfile(text);
  }

  function charStatsHtml(profile) {
    if (!profile || !profile.total) return "";
    const rareText = profile.rare.length
      ? " · 待学：" + profile.rare.map(function (item) { return item.char; }).join(" ")
      : "";
    return `<div class="char-stats">高频字 ${profile.high} / ${profile.total} · 中频字 ${profile.mid} · 待学字 ${profile.low}${rareText}</div>`;
  }

  function dimensionBars(complexity) {
    const items = [
      ["词", complexity.lexical],
      ["句", complexity.syntactic],
      ["篇", complexity.discourse],
      ["用", complexity.pragmatic]
    ];
    return `<div class="complexity-bars" aria-label="四维复杂度">${items
      .map(function (item) {
        return `<span class="dim"><span class="dim-label">${item[0]}</span><span class="dim-track"><span class="dim-fill" style="--v:${item[1]}"></span></span></span>`;
      })
      .join("")}</div>`;
  }

  function renderSentenceWithHighlights(text, highlights) {
    const chars = Array.from(text);
    const marked = new Array(chars.length).fill(false);
    (highlights || []).forEach(function (word) {
      let index = text.indexOf(word);
      while (index >= 0) {
        for (let i = 0; i < word.length; i += 1) {
          marked[index + i] = true;
        }
        index = text.indexOf(word, index + 1);
      }
    });
    return chars
      .map(function (ch, index) {
        return `<span class="char ${marked[index] ? "keyword" : ""}" data-i="${index}">${esc(ch)}</span>`;
      })
      .join("");
  }

  function decorateBottomNav() {
    const iconMap = { home: "home", assess: "clipboard", agent: "sparkle", books: "library" };
    document.querySelectorAll(".bottom-nav a").forEach(function (link) {
      const slot = link.querySelector(".bottom-nav-icon");
      if (slot) slot.innerHTML = icon(iconMap[link.dataset.route] || "home", 20);
    });
  }

  const RENDER = {};

  RENDER.home = function () {
    const profile = state.profile;
    const profileLine = profile
      ? `<a class="profile-chip" href="#/assess">${icon("sparkle", 16)}<span>上次画像：${profile.bandLabel} · L${profile.level} · ${profile.interestTags
          .slice(0, 2)
          .join(" / ")}</span>${icon("arrow", 16)}</a>`
      : "";
    return `
      <div class="view home-view">
        <section class="home-hero" aria-labelledby="hero-title">
          <div class="hero-art" aria-hidden="true">${window.illustrationFor("hero")}</div>
          <p class="hero-research">基于语料库的孤独症儿童分级阅读干预研究原型</p>
          <div class="hero-copy">
            <h1 id="hero-title">星星桥</h1>
            <p class="hero-subtitle">找到孩子愿意读、也读得懂的那一页。</p>
            <div class="hero-actions">
              <a class="button button-primary" href="#/agent">${icon("sparkle", 20)}<span>和星星伴读聊聊</span></a>
              <a class="button button-ghost" href="#/assess">${icon("clipboard", 20)}<span>开始 3 分钟评估</span></a>
              <a class="button button-ghost" href="#/books">${icon("library", 20)}<span>直接进入书架</span></a>
            </div>
            ${profileLine}
          </div>
        </section>

        <section class="section home-principle" aria-labelledby="principle-title">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">为什么不是普通分级</p>
              <h2 id="principle-title">读懂，不只要会认字</h2>
              <p class="section-lede">孤独症儿童常常能读出字，却在语用、语篇和隐含信息处卡住。星星桥从四个维度同时判断文本是否适合。</p>
            </div>
            <div class="dimension-grid">
              <div class="dimension-item">
                <span class="dimension-index">词</span>
                <h3>词汇</h3>
                <p>看字频、词频与抽象度，先让孩子遇到熟悉的词。</p>
              </div>
              <div class="dimension-item">
                <span class="dimension-index">句</span>
                <h3>句法</h3>
                <p>控制句长、嵌套与特殊句式，降低在线加工负担。</p>
              </div>
              <div class="dimension-item">
                <span class="dimension-index">篇</span>
                <h3>语篇</h3>
                <p>关注指代、连接与主题转换，让前后关系清楚可见。</p>
              </div>
              <div class="dimension-item">
                <span class="dimension-index">用</span>
                <h3>语用</h3>
                <p>识别隐喻、反语与社会情境依赖，补上最难的一环。</p>
              </div>
            </div>
            <p class="data-source-note">字频参照 Jun Da 汉字字频表，分级参照国家教育研究院汉字分级标准检索系统。</p>
          </div>
        </section>

        <section class="section home-steps" aria-labelledby="steps-title">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">今晚怎么陪读</p>
              <h2 id="steps-title">三步，从书页走到理解</h2>
            </div>
            <div class="process-grid">
              <div class="process-item">
                <span class="process-number">01</span>
                <h3>先连接</h3>
                <p>先看图画、预告变化，取得孩子的注意力，再开始读。</p>
              </div>
              <div class="process-item">
                <span class="process-number">02</span>
                <h3>再共读</h3>
                <p>一句一句来，读到关键词时指图、停顿、重复。</p>
              </div>
              <div class="process-item">
                <span class="process-number">03</span>
                <h3>后回看</h3>
                <p>让孩子回看、指认、接词，用“多一词原则”把话接长。</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section home-cta" aria-labelledby="home-cta-title">
          <div class="home-cta-art" aria-hidden="true">${window.illustrationFor("cover-greet")}</div>
          <div class="home-cta-copy">
            <p class="eyebrow">从孩子已经喜欢的东西开始</p>
            <h2 id="home-cta-title">兴趣和难度，一样重要</h2>
            <p>孩子对某样东西的专注，不是阅读的障碍，而是最好的入口。</p>
            <a class="button button-primary" href="#/assess">${icon("clipboard", 20)}<span>开始评估</span></a>
          </div>
        </section>
      </div>
    `;
  };

  function hasAnswer(question) {
    const value = state.answers[question.id];
    if (question.type === "multi") return Array.isArray(value) && value.length > 0;
    return typeof value === "number";
  }

  function normalizeInterests(values) {
    const mapping = {
      "家人朋友": "朋友",
      "动物": "自然天气",
      "社会情境": "社会情境"
    };
    const tags = [];
    (values || []).forEach(function (value) {
      const tag = mapping[value] || value;
      if (window.ALL_INTERESTS.includes(tag) && !tags.includes(tag)) tags.push(tag);
      if (tag === "朋友" && !tags.includes("日常生活")) tags.push("日常生活");
    });
    if (!tags.length) tags.push("日常生活");
    return tags.slice(0, 4);
  }

  function average(values) {
    if (!values.length) return 0;
    return values.reduce(function (sum, value) {
      return sum + value;
    }, 0) / values.length;
  }

  function computeProfile() {
    const a = state.answers;
    const number = function (id) {
      return typeof a[id] === "number" ? a[id] : 1;
    };
    const core = average([
      number("expression"),
      number("attention"),
      number("syntax"),
      number("pragmatic"),
      number("change")
    ]);
    const support = average([number("familiar"), number("support")]);
    const raw = core * 1.08 + support * 0.32 + 0.72;
    const level = Math.max(1, Math.min(5, Math.round(raw)));
    const band = level <= 2 ? "星芽" : level === 3 ? "星叶" : "星桥";
    const interestTags = normalizeInterests(a.interests);
    const supportNotes = [];

    if (number("pragmatic") <= 1) {
      supportNotes.push("先读具体、可回看的短句，比喻和反话留到后面再试。");
    }
    if (number("change") <= 1) {
      supportNotes.push("每次读前预告：先看哪一页、读几页、什么时候结束。");
    }
    if (number("attention") <= 1) {
      supportNotes.push("每页只放 1-2 句话，读完一页就休息。");
    }
    if (number("support") <= 1) {
      supportNotes.push("试试“指图提问”和“多一词原则”，不急着让孩子认字。");
    }
    if (number("goal") === 3) {
      supportNotes.push("从孩子已经喜欢的主题开始，让他先愿意发出声音。");
    }
    if (!supportNotes.length) {
      supportNotes.push("保持稳定、可预测的共读节奏，逐步加入新的兴趣主题。");
    }

    return {
      level: level,
      bandLabel: band,
      interestTags: interestTags,
      supportNotes: supportNotes,
      savedAt: Date.now()
    };
  }

  function renderAssessmentIntro() {
    return `
      <div class="view assess-view">
        <section class="section assess-intro">
          <div class="container">
            <div class="assess-intro-grid">
              <div class="assess-intro-art" aria-hidden="true">${window.illustrationFor("cover-greet")}</div>
              <div class="assess-intro-copy">
                <p class="eyebrow">分级评估</p>
                <h1>先听懂孩子，再选书</h1>
                <p class="section-lede">9 个问题，约 3 分钟。我们不看“正常或不正常”，只看孩子在语言、理解和兴趣上的现状，帮他找到一条更舒服的阅读路径。</p>
                <ul class="plain-list">
                  <li>${icon("check", 18)}<span>不采集姓名、电话与身份信息</span></li>
                  <li>${icon("check", 18)}<span>结果只保存在这台设备上</span></li>
                  <li>${icon("check", 18)}<span>用于分级阅读体验，不是医学诊断</span></li>
                </ul>
                <button class="button button-primary" type="button" data-action="start-assess">${icon("clipboard", 20)}<span>开始评估</span></button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderAssessmentQuestion() {
    const index = state.assessmentStep - 1;
    const question = window.ASSESSMENT_QUESTIONS[index];
    const total = window.ASSESSMENT_QUESTIONS.length;
    const progress = Math.round((index / total) * 100);
    const answer = state.answers[question.id];
    const isLast = index === total - 1;
    const role = question.type === "multi" ? "checkbox" : "radio";
    const selected = question.type === "multi" ? answer || [] : [answer];

    const options = question.options
      .map(function (option, optionIndex) {
        const value = question.type === "multi" ? option.label : option.value;
        const active = selected.includes(value);
        return `
          <button
            class="option-button ${active ? "is-selected" : ""}"
            type="button"
            data-action="${question.type === "multi" ? "toggle-interest" : "select-option"}"
            data-qid="${question.id}"
            data-value="${esc(value)}"
            role="${role}"
            aria-checked="${active}"
          >
            <span class="option-check">${active ? icon("check", 16) : ""}</span>
            <span>${esc(option.label)}</span>
          </button>
        `;
      })
      .join("");

    return `
      <div class="view assess-view">
        <section class="section assess-question">
          <div class="container narrow">
            <div class="assess-progress" aria-label="评估进度 ${index + 1} / ${total}">
              <span style="width:${progress}%"></span>
            </div>
            <p class="step-count">第 ${index + 1} 题，共 ${total} 题</p>
            <h1>${esc(question.title)}</h1>
            <p class="question-hint">${question.type === "multi" ? "可以多选，选最明显的几个就好。" : "选一个最接近孩子日常表现的答案。"}</p>
            <div class="option-list" role="group" aria-label="${esc(question.title)}">
              ${options}
            </div>
            <div class="assess-actions">
              <button class="button button-ghost" type="button" data-action="prev-question" ${index === 0 ? "disabled" : ""}>${icon("chevron-left", 18)}<span>上一题</span></button>
              <button class="button button-primary" type="button" data-action="next-question" ${!hasAnswer(question) ? "disabled" : ""}>
                <span>${isLast ? "查看结果" : "下一题"}</span>${icon("chevron-right", 18)}
              </button>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderAssessmentResult() {
    const profile = state.profile;
    const levelPercent = ((profile.level - 1) / 4) * 100;
    const matched = window.BOOKS.filter(function (book) {
      if (book.sample) return false;
      const levelClose = Math.abs(book.level - profile.level) <= 1;
      const interestClose = book.interestTags.some(function (tag) {
        return profile.interestTags.includes(tag);
      });
      return levelClose || interestClose;
    });
    const recommended = (matched.length
      ? matched
      : window.BOOKS.filter(function (book) {
          return !book.sample;
        })
    ).slice(0, 3);

    return `
      <div class="view assess-view">
        <section class="section result-view">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">分级评估</p>
              <h1>孩子的阅读画像</h1>
              <p class="section-lede">这是给共读者的提示，不是给孩子贴的标签。</p>
            </div>

            <div class="result-card">
              <div class="result-head">
                <div>
                  <span class="level-pill large">L${profile.level}</span>
                  <span class="band-pill">${profile.bandLabel}</span>
                </div>
                <button class="text-button" type="button" data-action="restart-assess">${icon("rotate", 16)}<span>重新评估</span></button>
              </div>
              <div class="axis-list">
                <div class="axis-row">
                  <span class="axis-label">文本难度</span>
                  <div class="axis-track" aria-label="推荐文本难度 L${profile.level}">
                    <span class="axis-marker" style="left:${levelPercent}%"></span>
                    <span class="axis-labels"><span>L1</span><span>L2</span><span>L3</span><span>L4</span><span>L5</span></span>
                  </div>
                  <strong>L${profile.level}</strong>
                </div>
                <div class="axis-row interests">
                  <span class="axis-label">兴趣入口</span>
                  <div class="tag-row">${profile.interestTags
                    .map(function (tag) {
                      return `<span class="tag">${esc(tag)}</span>`;
                    })
                    .join("")}</div>
                </div>
              </div>
              <div class="support-notes">
                <h2>陪读建议</h2>
                <ul class="plain-list">
                  ${profile.supportNotes
                    .map(function (note) {
                      return `<li>${icon("sparkle", 16)}<span>${esc(note)}</span></li>`;
                    })
                    .join("")}
                </ul>
              </div>
            </div>

            <div class="result-actions">
              <a class="button button-primary" href="#/books">${icon("library", 20)}<span>按此推荐进入书架</span></a>
              <a class="button button-ghost" href="#/guide">${icon("heart", 20)}<span>先看陪读指南</span></a>
            </div>

            <div class="recommend-block">
              <div class="subsection-title">
                <p class="eyebrow">推荐从这三本开始</p>
                <h2>从熟悉的话题进入</h2>
              </div>
              <div class="book-grid">${recommended.map(renderBookCard).join("")}</div>
            </div>

            <p class="disclaimer">${icon("shield-check", 16)}<span>本评估是研究原型，不构成医学或教育诊断；实际干预请结合专业评估。</span></p>
          </div>
        </section>
      </div>
    `;
  }

  RENDER.assess = function () {
    if (state.profile) return renderAssessmentResult();
    if (state.assessmentStep > 0) return renderAssessmentQuestion();
    return renderAssessmentIntro();
  };

  function renderBookCard(book) {
    const favorite = state.favorites.includes(book.id);
    const charStats = book.sample ? "" : charStatsHtml(bookCharProfile(book));
    const mainContent = `
      <div class="book-cover" aria-hidden="true">${getBookCover(book)}</div>
      <div class="book-card-body">
        <div class="book-meta">
          <span class="level-pill">L${book.level}</span>
          <span class="band-pill">${book.band}</span>
          <span class="minutes">${book.minutes} 分钟</span>
        </div>
        <h2>${esc(book.title)}</h2>
        <div class="tag-row">${book.interestTags
          .map(function (tag) {
            return `<span class="tag">${esc(tag)}</span>`;
          })
          .join("")}</div>
        ${dimensionBars(book.complexity)}
        ${charStats}
      </div>
    `;
    const openMarkup = book.sample
      ? `<div class="book-card-main is-disabled">${mainContent}</div>`
      : `<a class="book-card-main" href="#/read/${book.id}" aria-label="打开《${esc(book.title)}》">${mainContent}</a>`;
    return `
      <article class="book-card ${book.sample ? "is-sample" : ""}">
        ${openMarkup}
        <button
          class="favorite-button ${favorite ? "is-favorite" : ""}"
          type="button"
          data-action="toggle-favorite"
          data-id="${book.id}"
          aria-pressed="${favorite}"
          aria-label="${favorite ? "取消收藏" : "收藏"}《${esc(book.title)}》"
        >${icon("heart", 18)}</button>
        ${book.sample ? '<span class="sample-label">样例扩展</span>' : ""}
      </article>
    `;
  }

  RENDER.books = function () {
    const level = state.bookFilters.level;
    const interest = state.bookFilters.interest;
    const levels = ["all", 1, 2, 3, 4, 5];
    const filtered = window.BOOKS.filter(function (book) {
      const levelMatch = level === "all" || book.level === Number(level);
      const interestMatch =
        interest === "all" || book.interestTags.includes(interest);
      return levelMatch && interestMatch;
    });

    const levelChips = levels
      .map(function (value) {
        const label = value === "all" ? "全部等级" : "L" + value;
        const active = String(level) === String(value);
        return `<button class="filter-chip ${active ? "is-active" : ""}" type="button" data-action="filter-level" data-value="${value}" aria-pressed="${active}">${label}</button>`;
      })
      .join("");

    const interestChips = ["all"].concat(window.ALL_INTERESTS).map(function (value) {
      const label = value === "all" ? "全部兴趣" : value;
      const active = interest === value;
      return `<button class="filter-chip ${active ? "is-active" : ""}" type="button" data-action="filter-interest" data-value="${esc(value)}" aria-pressed="${active}">${esc(label)}</button>`;
    }).join("");

    return `
      <div class="view books-view">
        <section class="section books-header">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">分级书架</p>
              <h1>今天读哪一页</h1>
              <p class="section-lede">每本书都标注了词汇、句法、语篇、语用四维难度。先选兴趣，再选节奏。</p>
            </div>
            <div class="filter-block">
              <div class="filter-row">
                <span class="filter-label">难度</span>
                <div class="chip-row">${levelChips}</div>
              </div>
              <div class="filter-row">
                <span class="filter-label">兴趣</span>
                <div class="chip-row scrollable">${interestChips}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="section books-grid-section">
          <div class="container">
            <div class="books-count">${filtered.length} 本适合现在打开</div>
            <div class="book-grid">${filtered.map(renderBookCard).join("") || emptyBooks()}</div>
          </div>
        </section>
      </div>
    `;
  };

  function emptyBooks() {
    return `
      <div class="empty-state">
        ${icon("book-open", 28)}
        <h2>这个组合暂时没有样例</h2>
        <p>换一个等级或兴趣，就会看到新的入口。</p>
        <button class="button button-ghost" type="button" data-action="clear-filters">清除筛选</button>
      </div>
    `;
  }

  function stageLabel(stage) {
    return {
      warm: "先看一看",
      read: "读一读",
      review: "回看"
    }[stage] || "读一读";
  }

  function renderReaderToolbar() {
    const mode = state.accessibility.mode || "soft";
    const favorite = state.favorites.includes(state.currentBookId);
    const fontPercent = Math.round((state.accessibility.fontScale || 1) * 100);
    return `
      <div class="reader-toolbar" role="toolbar" aria-label="阅读工具">
        <div class="toolbar-group" aria-label="字号">
          <button class="icon-button" type="button" data-action="font-down" aria-label="减小字号">${icon("minus", 18)}</button>
          <span class="font-label" data-font-scale>${fontPercent}%</span>
          <button class="icon-button" type="button" data-action="font-up" aria-label="增大字号">${icon("plus", 18)}</button>
        </div>
        <div class="toolbar-group mode-group" aria-label="阅读模式">
          <button class="mode-button ${mode === "soft" ? "is-active" : ""}" type="button" data-action="set-mode" data-value="soft" aria-pressed="${mode === "soft"}">低刺激</button>
          <button class="mode-button ${mode === "standard" ? "is-active" : ""}" type="button" data-action="set-mode" data-value="standard" aria-pressed="${mode === "standard"}">标准</button>
          <button class="mode-button ${mode === "contrast" ? "is-active" : ""}" type="button" data-action="set-mode" data-value="contrast" aria-pressed="${mode === "contrast"}">高对比</button>
        </div>
        <button class="favorite-button ${favorite ? "is-favorite" : ""}" type="button" data-action="toggle-favorite" data-id="${state.currentBookId}" aria-pressed="${favorite}" aria-label="${favorite ? "取消收藏" : "收藏"}">${icon("heart", 18)}</button>
      </div>
    `;
  }

  function renderPromptPanel(page) {
    const currentStage = page.stage;
    const items = [
      { label: "读前", stage: "warm", text: page.promptBefore },
      { label: "读中", stage: "read", text: page.promptDuring },
      { label: "读后", stage: "review", text: page.promptAfter }
    ];
    return `
      <div class="prompt-panel" hidden>
        <div class="prompt-panel-head">
          <span>${icon("sparkle", 16)}<strong>陪读提示</strong></span>
          <span class="prompt-current">当前：${stageLabel(currentStage)}</span>
        </div>
        <div class="prompt-list">
          ${items
            .map(function (item) {
              return `<div class="prompt-item ${item.stage === currentStage ? "is-current" : ""}">
                <span class="prompt-label">${item.label}</span>
                <p>${esc(item.text)}</p>
              </div>`;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  RENDER.read = function () {
    const book = findBook(state.currentBookId);
    if (!book) return "";
    const page = book.pages[state.currentPage];
    const total = book.pages.length;
    const progress = Math.round(((state.currentPage + 1) / total) * 100);
    const currentStage = stageLabel(page.stage);
    const steps = [
      { key: "warm", label: "开始" },
      { key: "read", label: "读一读" },
      { key: "review", label: "回看" }
    ];
    const sentenceHtml = renderSentenceWithHighlights(page.sentences, page.highlights);

    return `
      <div class="view reader-view">
        <div class="reader-top">
          <a class="back-link" href="#/books">${icon("chevron-left", 18)}<span>返回书架</span></a>
          <div class="reader-meta">
            <span class="level-pill">L${book.level}</span>
            <span>${esc(book.title)}</span>
            <span>${state.currentPage + 1} / ${total}</span>
          </div>
        </div>

        <div class="step-strip" aria-label="阅读步骤">
          ${steps
            .map(function (step, index) {
              const active = step.key === page.stage;
              const done = index < steps.findIndex(function (item) { return item.key === page.stage; });
              return `<div class="step-node ${active ? "is-active" : ""} ${done ? "is-done" : ""}">
                <span class="step-dot">${done ? icon("check", 14) : index + 1}</span>
                <span>${step.label}</span>
              </div>`;
            })
            .join("")}
        </div>

        <div class="reader-canvas">
          <div class="reader-art" aria-hidden="true">${window.illustrationFor(page.illustrationKey)}</div>
          <div class="reader-sentence-wrap">
            <p class="reader-stage">${currentStage}</p>
            <p class="reader-sentence">${sentenceHtml}</p>
            ${charStatsHtml(charProfile(page.sentences))}
            <button class="read-button ${state.isReading ? "is-reading" : ""}" type="button" data-action="read-page">
              ${state.isReading ? icon("pause", 20) : icon("volume", 20)}
              <span>${state.isReading ? "停下" : "听这一页"}</span>
            </button>
          </div>
        </div>

        <div class="reader-controls">
          ${renderReaderToolbar()}
          <button class="prompt-toggle" type="button" data-action="toggle-prompt" aria-expanded="false">${icon("info", 17)}<span>显示陪读提示</span></button>
        </div>

        ${renderPromptPanel(page)}

        <div class="reader-pagination">
          <button class="button button-ghost" type="button" data-action="prev-page" ${state.currentPage === 0 ? "disabled" : ""}>${icon("chevron-left", 18)}<span>上一页</span></button>
          <span class="reader-progress">${progress}%</span>
          <button class="button button-primary" type="button" data-action="next-page" ${state.currentPage === total - 1 ? "disabled" : ""}><span>下一页</span>${icon("chevron-right", 18)}</button>
        </div>
      </div>
    `;
  };

  RENDER.guide = function () {
    return `
      <div class="view guide-view">
        <section class="section guide-hero">
          <div class="guide-hero-art" aria-hidden="true">${window.illustrationFor("page-greet-2")}</div>
          <div class="guide-hero-copy">
            <p class="eyebrow">陪读指南</p>
            <h1>陪读不是把字念完，是一起走进一个场景</h1>
            <p>先连接，再共读，后回看。每一步都给孤独症儿童留出可预测、可重复、可回看的空间。</p>
          </div>
        </section>

        <section class="section guide-section">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">三步共读</p>
              <h2>让每一页都有清晰的起点和终点</h2>
            </div>
            <div class="process-grid">
              <div class="process-item">
                <span class="process-number">01</span>
                <h3>先连接</h3>
                <p>蹲下来，先取得眼神，再指图。用“我们马上要看一页”预告接下来发生什么。</p>
              </div>
              <div class="process-item">
                <span class="process-number">02</span>
                <h3>再共读</h3>
                <p>一句一句来，读完关键词就停一下。让孩子指图、接词，而不是催他快一点。</p>
              </div>
              <div class="process-item">
                <span class="process-number">03</span>
                <h3>后回看</h3>
                <p>回看刚才的人物和动作，重复关键词。用“多一词原则”帮他把话说长一点。</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section guide-tips">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">开口之前</p>
              <h2>一蹲、二视、三说话</h2>
              <p class="section-lede">不催促，不暗示，先让孩子知道：这一次对话是安全的。</p>
            </div>
            <div class="tip-grid">
              <div class="tip-item">
                <span class="tip-number">一</span>
                <h3>蹲</h3>
                <p>蹲到孩子面前，让视线在同一高度。</p>
              </div>
              <div class="tip-item">
                <span class="tip-number">二</span>
                <h3>视</h3>
                <p>争取视线对视；如果避开，就用他喜欢的玩具引到眉间。</p>
              </div>
              <div class="tip-item">
                <span class="tip-number">三</span>
                <h3>说</h3>
                <p>用简明直接的话，配夸张一点的儿童语气回应。</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section guide-scripts">
          <div class="container narrow">
            <div class="section-heading compact">
              <p class="eyebrow">把话说清楚</p>
              <h2>少用暗示，多给可见的结构</h2>
            </div>
            <div class="script-list">
              <div class="script-item">
                <h3>多一词原则</h3>
                <p>孩子说“车”，你可以回应“红色的车车”或“车车来啦”。每一次回应，都在帮他把词接长。</p>
              </div>
              <div class="script-item">
                <h3>列表化指令</h3>
                <p>把“我们先看图，再读一句，最后回看”拆成三条，一次只说一件事。</p>
              </div>
              <div class="script-item">
                <h3>预告变化</h3>
                <p>换新书、关掉声音、翻下一页之前，都提前说一句“接下来会……”</p>
              </div>
              <div class="script-item">
                <h3>允许重复</h3>
                <p>同一本书反复读不是退步。熟悉带来的确定感，正是孩子建立语言信心的台阶。</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  };

  RENDER.research = function () {
    return `
      <div class="view research-view">
        <section class="section research-hero">
          <div class="container">
            <div class="research-hero-grid">
              <div>
                <p class="eyebrow">研究背景</p>
                <h1>给“会读字却读不懂”的孩子，建一座桥</h1>
                <p class="section-lede">课题《基于语料库的孤独症儿童分级阅读干预模式研究》希望用真实语料与行为数据，替代“凭感觉选书”。</p>
              </div>
              <div class="research-metric" aria-label="可理解区间 75% 到 85%">
                <strong>75-85%</strong>
                <span>以实测理解率锚定文本难度，而不是专家拍板</span>
              </div>
            </div>
          </div>
        </section>

        <section class="section research-section">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">文本复杂度</p>
              <h2>从二维，走到四维</h2>
            </div>
            <div class="dimension-grid">
              <div class="dimension-item">
                <span class="dimension-index">词</span>
                <h3>词汇</h3>
                <p>字频、词频、覆盖率和抽象度。</p>
              </div>
              <div class="dimension-item">
                <span class="dimension-index">句</span>
                <h3>句法</h3>
                <p>句长、嵌套深度与特殊句式密度。</p>
              </div>
              <div class="dimension-item">
                <span class="dimension-index">篇</span>
                <h3>语篇</h3>
                <p>指代密度、连接词密度与主题转换。</p>
              </div>
              <div class="dimension-item">
                <span class="dimension-index">用</span>
                <h3>语用</h3>
                <p>隐喻、反语、隐含信息与社会情境依赖。</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section research-flow">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">研究闭环</p>
              <h2>语料库、分级标准、干预验证，三阶段递进</h2>
            </div>
            <div class="flow-grid">
              <div class="flow-item">
                <span class="flow-number">阶段一</span>
                <h3>语料库构建</h3>
                <p>文本源、儿童语料源、阅读过程源，三源一标，形成四维标注。</p>
              </div>
              <div class="flow-arrow" aria-hidden="true">${icon("arrow", 22)}</div>
              <div class="flow-item">
                <span class="flow-number">阶段二</span>
                <h3>分级标准研制</h3>
                <p>用 IRT 或逻辑回归建模，以 75%-85% 实测理解率反推等级边界。</p>
              </div>
              <div class="flow-arrow" aria-hidden="true">${icon("arrow", 22)}</div>
              <div class="flow-item">
                <span class="flow-number">阶段三</span>
                <h3>干预模式验证</h3>
                <p>三组随机对照设计，检验个性化分级阅读与语用迁移效应。</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section research-outcomes">
          <div class="container">
            <div class="section-heading compact">
              <p class="eyebrow">预期成果</p>
              <h2>最终落到家长和老师手里</h2>
            </div>
            <div class="outcome-grid">
              <div class="outcome-item">
                <h3>分级语料库</h3>
                <p>开放共享，支持在线检索与分级文本导出。</p>
              </div>
              <div class="outcome-item">
                <h3>自动分级工具</h3>
                <p>Web / 小程序端的个体推荐引擎。</p>
              </div>
              <div class="outcome-item">
                <h3>干预手册</h3>
                <p>含支架脚本库、活动库与教师家长培训课程。</p>
              </div>
              <div class="outcome-item">
                <h3>循证论文</h3>
                <p>覆盖语料库建设、分级建模、RCT 效果与机制。</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  };

  RENDER.agent = function () {
    if (!window.AgentBrain) return "";
    window.setTimeout(function () {
      window.AgentBrain.afterRender();
    }, 0);
    return window.AgentBrain.render();
  };

  let chineseVoice = null;
  let voicesWarmed = false;

  function warmVoices() {
    if (!("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    chineseVoice =
      voices.find(function (voice) {
        return /zh|cmn|yue/i.test(voice.lang);
      }) || null;
    if (!voices.length) {
      window.speechSynthesis.onvoiceschanged = function () {
        warmVoices();
      };
    }
    voicesWarmed = true;
  }

  function speakText(text, rate, onEnd) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      return false;
    }
    warmVoices();
    if (!chineseVoice) return false;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = chineseVoice.lang || "zh-CN";
    utterance.voice = chineseVoice;
    utterance.rate = Math.max(0.55, Math.min(1.35, rate || 0.75));
    utterance.pitch = 1;
    let finished = false;
    const finish = function () {
      if (finished) return;
      finished = true;
      if (onEnd) onEnd();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function stopReading() {
    window.clearInterval(state.readingTimer);
    state.readingTimer = null;
    state.isReading = false;
    state.readingPos = 0;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    document.querySelectorAll(".reader-sentence .char.is-reading").forEach(function (el) {
      el.classList.remove("is-reading");
    });
    updateReadButton();
  }

  function updateReadButton() {
    const button = document.querySelector('[data-action="read-page"]');
    if (!button) return;
    button.classList.toggle("is-reading", state.isReading);
    button.innerHTML = `${
      state.isReading ? icon("pause", 20) : icon("volume", 20)
    }<span>${state.isReading ? "停下" : "听这一页"}</span>`;
  }

  function startReading(text, rate) {
    stopReading();
    const chars = Array.from(text);
    if (!chars.length) return;
    state.isReading = true;
    const nodes = Array.from(document.querySelectorAll(".reader-sentence .char"));
    const interval = Math.max(170, Math.round(440 / (rate || 0.75)));
    const speechStarted = speakText(text, rate, function () {
      if (state.isReading) stopReading();
    });
    state.readingTimer = window.setInterval(function () {
      if (state.readingPos >= chars.length) {
        stopReading();
        return;
      }
      nodes.forEach(function (node, index) {
        node.classList.toggle("is-reading", index === state.readingPos);
      });
      state.readingPos += 1;
    }, interval);
    if (!speechStarted) {
      toast("当前浏览器没有可用的中文语音，已切换为逐字节奏模式。");
    }
    updateReadButton();
  }

  function toggleFavorite(id) {
    const index = state.favorites.indexOf(id);
    if (index >= 0) state.favorites.splice(index, 1);
    else state.favorites.push(id);
    saveFavorites();
    renderRoute();
  }

  function clearFilters() {
    state.bookFilters = { level: "all", interest: "all" };
    renderRoute();
  }

  function handleClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "toggle-nav") {
      const open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
      return;
    }

    if (action === "start-assess") {
      state.assessmentStep = 1;
      state.answers = {};
      saveDraft();
      renderRoute();
      return;
    }

    if (action === "select-option") {
      state.answers[target.dataset.qid] = Number(target.dataset.value);
      saveDraft();
      renderRoute();
      return;
    }

    if (action === "toggle-interest") {
      const id = target.dataset.qid;
      const value = target.dataset.value;
      const list = Array.isArray(state.answers[id]) ? state.answers[id].slice() : [];
      const index = list.indexOf(value);
      if (index >= 0) list.splice(index, 1);
      else list.push(value);
      state.answers[id] = list;
      saveDraft();
      renderRoute();
      return;
    }

    if (action === "prev-question") {
      if (state.assessmentStep > 1) {
        state.assessmentStep -= 1;
        saveDraft();
        renderRoute();
      }
      return;
    }

    if (action === "next-question") {
      const index = state.assessmentStep - 1;
      const question = window.ASSESSMENT_QUESTIONS[index];
      if (!hasAnswer(question)) return;
      if (state.assessmentStep < window.ASSESSMENT_QUESTIONS.length) {
        state.assessmentStep += 1;
        saveDraft();
        renderRoute();
      } else {
        saveProfile(computeProfile());
        renderRoute();
      }
      return;
    }

    if (action === "restart-assess") {
      state.profile = null;
      state.assessmentStep = 0;
      state.answers = {};
      storeSet(STORAGE.assessment, null);
      storeSet(STORAGE.draft, null);
      renderRoute();
      return;
    }

    if (action === "filter-level") {
      state.bookFilters.level = target.dataset.value;
      renderRoute();
      return;
    }

    if (action === "filter-interest") {
      state.bookFilters.interest = target.dataset.value;
      renderRoute();
      return;
    }

    if (action === "clear-filters") {
      clearFilters();
      return;
    }

    if (action === "toggle-favorite") {
      toggleFavorite(target.dataset.id);
      return;
    }

    if (action === "read-page") {
      const book = findBook(state.currentBookId);
      if (!book) return;
      const page = book.pages[state.currentPage];
      if (state.isReading) stopReading();
      else startReading(page.sentences, page.voiceRate);
      return;
    }

    if (action === "prev-page") {
      if (state.currentPage > 0) {
        state.currentPage -= 1;
        renderRoute();
      }
      return;
    }

    if (action === "next-page") {
      const book = findBook(state.currentBookId);
      if (book && state.currentPage < book.pages.length - 1) {
        state.currentPage += 1;
        renderRoute();
      }
      return;
    }

    if (action === "set-mode") {
      setMode(target.dataset.value);
      return;
    }

    if (action === "font-up") {
      changeFont(0.1);
      return;
    }

    if (action === "font-down") {
      changeFont(-0.1);
      return;
    }

    if (action === "toggle-prompt") {
      const panel = document.querySelector(".prompt-panel");
      if (!panel) return;
      const hidden = panel.hidden;
      panel.hidden = !hidden;
      target.setAttribute("aria-expanded", String(!hidden));
      target.querySelector("span").textContent = !hidden ? "收起陪读提示" : "显示陪读提示";
      return;
    }
  }

  window.XingxingBridge = {
    getProfile: function () {
      return state.profile;
    },
    getBooks: function () {
      return window.BOOKS;
    },
    getFavorites: function () {
      return state.favorites;
    },
    getLastRead: function () {
      return state.lastRead;
    },
    getCurrentBook: function () {
      return state.currentBookId ? findBook(state.currentBookId) : null;
    },
    getCurrentPage: function () {
      return state.currentPage;
    },
    getBook: function (id) {
      return findBook(id);
    },
    getIllustration: function (key) {
      return window.illustrationFor(key);
    },
    charProfile: function (text) {
      return charProfile(text);
    },
    bookCharProfile: function (id) {
      const book = findBook(id);
      return book ? bookCharProfile(book) : charProfile("");
    },
    speak: function (text, rate) {
      if (state.agentMuted) return false;
      return speakText(text, rate);
    },
    setMuted: function (muted) {
      state.agentMuted = Boolean(muted);
      if (muted && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    toast: function (message) {
      toast(message);
    },
    navigate: function (hash) {
      location.hash = hash;
    }
  };

  document.addEventListener("click", function (event) {
    if (event.target.closest(".nav-toggle")) {
      event.preventDefault();
    }
  });

  main.addEventListener("click", handleClick);
  document.querySelector(".nav-toggle").addEventListener("click", handleClick);

  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("beforeunload", function () {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  loadState();
  decorateBottomNav();
  warmVoices();
  if (!location.hash) location.hash = "#/home";
  else renderRoute();
})();
