(function () {
  "use strict";

  const STORAGE_KEY = "xingxingqiao.agent";
  let messages = loadMessages();
  let draft = "";
  let muted = false;
  let recognition = null;

  function bridge() {
    return window.XingxingBridge || {};
  }

  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(-40) : [];
    } catch (error) {
      return [];
    }
  }

  function saveMessages() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch (error) {
      bridge().toast && bridge().toast("当前浏览器无法保存对话记录。");
    }
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

  function textToHtml(value) {
    return esc(value)
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function addMessage(message) {
    messages.push(message);
    messages = messages.slice(-40);
    saveMessages();
  }

  function ensureGreeting() {
    if (messages.length) return;
    const profile = bridge().getProfile && bridge().getProfile();
    addMessage({
      role: "agent",
      text: profile
        ? "我是星星伴读。已经看到孩子的阅读画像了。你可以问我“今天读什么”，也可以打开一本书，让我结合这一页给你陪读提示。"
        : "我是星星伴读。我可以按孩子的兴趣和阅读水平选书，也能在你打开一本书后，给出这一页怎么读、怎么回应。先告诉我：孩子今天想读什么？"
    });
  }

  function hasAny(text, words) {
    return words.some(function (word) {
      return text.includes(word);
    });
  }

  function normalizeText(value) {
    return value.toLowerCase().replace(/\s+/g, "");
  }

  function extractInterest(text) {
    if (hasAny(text, ["车", "火车", "交通工具", "飞机", "船"])) return "交通工具";
    if (hasAny(text, ["动物", "猫", "狗", "鸟", "兔子", "恐龙"])) return "自然天气";
    if (hasAny(text, ["数字", "字母", "数数", "字"])) return "数字字母";
    if (hasAny(text, ["天气", "雨", "雷", "风", "太阳", "声音"])) return "自然天气";
    if (hasAny(text, ["朋友", "打招呼", "一起", "同伴", "同学"])) return "朋友";
    if (hasAny(text, ["情绪", "害怕", "生气", "哭", "安静", "等"])) return "情绪";
    if (hasAny(text, ["社会", "学校", "教室", "规则"])) return "社会情境";
    if (hasAny(text, ["比喻", "玩笑", "反话", "笑话"])) return "隐喻";
    return null;
  }

  function clampLevel(value) {
    return Math.max(1, Math.min(5, value));
  }

  function charDifficultyLine(profile) {
    if (!profile || !profile.total) return "";
    const rare = profile.rare.length
      ? "。建议先教：" + profile.rare.map(function (item) { return item.char; }).join("、")
      : "，暂时没有明显低频字";
    return (
      "这句共有 " +
      profile.total +
      " 个不同汉字：高频字 " +
      profile.high +
      " 个，中频字 " +
      profile.mid +
      " 个，待学字 " +
      profile.low +
      " 个" +
      rare
    );
  }

  function rankBooks(books, targetLevel, interests, favorites) {
    return books
      .filter(function (book) {
        return !book.sample;
      })
      .map(function (book) {
        const interestScore = (interests || []).reduce(function (score, tag) {
          return score + (book.interestTags.includes(tag) ? 3 : 0);
        }, 0);
        const levelPenalty = Math.abs(book.level - targetLevel) * 2.4;
        const favoriteBonus = favorites.includes(book.id) ? 2 : 0;
        const charProfile = bridge().bookCharProfile
          ? bridge().bookCharProfile(book.id)
          : null;
        const charBonus = charProfile ? charProfile.highRatio * 0.35 : 0;
        return {
          book: book,
          score: interestScore - levelPenalty + favoriteBonus + charBonus + (5 - book.level) * 0.25
        };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
  }

  function miniBookRow(book) {
    const illustration = bridge().getIllustration
      ? bridge().getIllustration(book.coverKey)
      : "";
    return `
      <div class="agent-book-row">
        <div class="agent-book-cover" aria-hidden="true">${illustration}</div>
        <div class="agent-book-info">
          <div class="agent-book-meta">
            <span class="level-pill">L${book.level}</span>
            <span class="band-pill">${book.band}</span>
            <span>${book.minutes} 分钟</span>
          </div>
          <strong>${esc(book.title)}</strong>
          <div class="tag-row">${book.interestTags
            .map(function (tag) {
              return `<span class="tag">${esc(tag)}</span>`;
            })
            .join("")}</div>
        </div>
        <button class="agent-book-open" type="button" data-agent-action="open-book" data-id="${book.id}">打开</button>
      </div>
    `;
  }

  function actionButtons(actions) {
    if (!actions || !actions.length) return "";
    return `<div class="agent-actions">${actions
      .map(function (action) {
        return `<button class="agent-action" type="button" data-agent-action="${action.action}" ${action.data ? `data-${action.data}` : ""}>${esc(action.label)}</button>`;
      })
      .join("")}</div>`;
  }

  function renderMessage(message) {
    if (message.role === "user") {
      return `<div class="agent-message user"><div class="agent-bubble">${textToHtml(message.text)}</div></div>`;
    }

    const books = (message.bookIds || [])
      .map(function (id) {
        return bridge().getBook ? bridge().getBook(id) : null;
      })
      .filter(Boolean);

    return `
      <div class="agent-message agent">
        <div class="agent-avatar" aria-hidden="true">${iconMark()}</div>
        <div class="agent-content">
          <div class="agent-bubble">${textToHtml(message.text)}</div>
          ${books.length ? `<div class="agent-book-list">${books.map(miniBookRow).join("")}</div>` : ""}
          ${actionButtons(message.actions)}
        </div>
      </div>
    `;
  }

  function iconMark() {
    return `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 24c3-5 6-7 11-7s8 2 11 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 17c2-3 4-4 8-4s6 1 8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M11 11c2-2 4-3 5-3s3 1 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 5v3M7 13l2 2M25 13l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }

  function currentContext() {
    const b = bridge();
    return {
      profile: b.getProfile ? b.getProfile() : null,
      books: b.getBooks ? b.getBooks() : [],
      favorites: b.getFavorites ? b.getFavorites() : [],
      lastRead: b.getLastRead ? b.getLastRead() : null,
      currentBook: b.getCurrentBook ? b.getCurrentBook() : null,
      currentPage: b.getCurrentPage ? b.getCurrentPage() : 0
    };
  }

  function contextStrip() {
    const context = currentContext();
    const profileLine = context.profile
      ? `L${context.profile.level} · ${context.profile.bandLabel} · ${context.profile.interestTags.slice(0, 2).join(" / ")}`
      : "还没有阅读画像";
    const bookLine = context.currentBook
      ? `正在读《${context.currentBook.title}》第 ${context.currentPage + 1} 页`
      : "还没有打开具体书目";
    return `
      <div class="agent-context">
        <span class="agent-context-item">${profileLine}</span>
        <span class="agent-context-dot">·</span>
        <span class="agent-context-item">${esc(bookLine)}</span>
      </div>
    `;
  }

  function quickChips() {
    const context = currentContext();
    const chips = context.profile
      ? ["今天读什么", "换个更简单的", "这页怎么陪读", "读给我听"]
      : ["先做 3 分钟评估", "今天读什么", "这页怎么陪读", "你能做什么"];
    if (context.currentBook) {
      chips.push("解释这句话");
      chips.push("这句话难吗");
    }
    return `<div class="agent-quick-chips">${chips
      .map(function (label) {
        return `<button class="agent-chip" type="button" data-agent-action="quick" data-text="${esc(label)}">${esc(label)}</button>`;
      })
      .join("")}</div>`;
  }

  function render() {
    ensureGreeting();
    return `
      <div class="view agent-view">
        <section class="agent-shell" aria-label="星星伴读智能体">
          <header class="agent-header">
            <div class="agent-title">
              <span class="agent-title-avatar">${iconMark()}</span>
              <div>
                <h1>星星伴读</h1>
                <p>分级阅读智能体 · 本地运行</p>
              </div>
            </div>
            <div class="agent-header-actions">
              <button class="agent-mini-button" type="button" data-agent-action="mute" aria-pressed="${muted}">${muted ? "开启语音" : "关闭语音"}</button>
              <button class="agent-mini-button" type="button" data-agent-action="clear">清空对话</button>
            </div>
          </header>
          ${contextStrip()}
          <div class="agent-thread" id="agent-thread" aria-live="polite">
            ${messages.map(renderMessage).join("")}
          </div>
          ${quickChips()}
          <form class="agent-composer" id="agent-composer">
            <label class="sr-only" for="agent-input">输入给星星伴读的消息</label>
            <textarea id="agent-input" rows="1" placeholder="例如：孩子喜欢火车，今天读什么？"></textarea>
            <button class="agent-voice-button" type="button" data-agent-action="voice" aria-label="语音输入">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/></svg>
            </button>
            <button class="agent-send-button" type="submit" data-agent-action="send">发送</button>
          </form>
        </section>
      </div>
    `;
  }

  function afterRender() {
    const thread = document.getElementById("agent-thread");
    if (thread) thread.scrollTop = thread.scrollHeight;
    const input = document.getElementById("agent-input");
    if (input && draft) input.value = draft;
  }

  function refresh() {
    const main = document.getElementById("main");
    if (!main || document.body.dataset.route !== "agent") return;
    main.innerHTML = render();
    afterRender();
  }

  function send(text) {
    const value = text || "";
    if (!value.trim()) return;
    addMessage({ role: "user", text: value.trim() });
    draft = "";
    respond(value.trim());
    refresh();
  }

  function respond(input) {
    const text = normalizeText(input);
    const context = currentContext();
    const profile = context.profile;

    if (hasAny(text, ["你是谁", "你能做什么", "怎么用", "帮助", "功能"])) {
      addMessage({
        role: "agent",
        text: "我可以做三件事：\n\n**1. 选书**：根据孩子的阅读画像或兴趣，推荐合适的等级和主题。\n**2. 陪读**：打开一本书后，我会给出这一页怎么读、怎么回应。\n**3. 朗读与解释**：读当前句子，或把关键词拆开讲清楚。",
        actions: [
          { label: "去分级评估", action: "go-assess" },
          { label: "去书架", action: "go-books" }
        ]
      });
      return;
    }

    if (hasAny(text, ["谢谢", "感谢", "很好", "真棒"])) {
      addMessage({
        role: "agent",
        text: "不客气。阅读不用一次做完，今天能一起看一页，就已经很好。"
      });
      return;
    }

    if (hasAny(text, ["读给我听", "朗读", "念一下", "读一下"])) {
      readCurrentPage();
      return;
    }

    if (hasAny(text, ["这页怎么陪读", "怎么陪读", "陪读提示", "怎么读这页", "这页怎么读"])) {
      giveCurrentPagePrompt();
      return;
    }

    if (hasAny(text, ["这句话难吗", "哪些字难", "字难不难", "难不难", "字频", "汉字难度"])) {
      analyzeCurrentDifficulty();
      return;
    }

    if (hasAny(text, ["解释这句话", "这句话什么意思", "什么意思", "解释一下"])) {
      explainCurrentSentence();
      return;
    }

    if (hasAny(text, ["换", "简单", "难一点", "更简单", "容易", "太难"])) {
      const easier = hasAny(text, ["简单", "容易"]);
      const harder = hasAny(text, ["难一点", "更难", "太难"]);
      const delta = easier ? -1 : harder ? 1 : 0;
      recommend(delta, extractInterest(input), "好，我按这个方向重新挑一下。");
      return;
    }

    const interest = extractInterest(input);
    if (hasAny(text, ["喜欢", "爱看", "感兴趣", "迷"])) {
      if (interest) {
        recommend(0, [interest], "收到，我优先找和孩子兴趣匹配的书。");
      } else {
        addMessage({
          role: "agent",
          text: "孩子喜欢什么？比如火车、动物、数字、天气、朋友，告诉我一个主题，我就能更准地选。"
        });
      }
      return;
    }

    if (hasAny(text, ["今天读什么", "选书", "推荐", "读什么", "不知道读什么", "挑一本"])) {
      if (!profile) {
        addMessage({
          role: "agent",
          text: "我还没有孩子的阅读画像。可以先做一次 3 分钟评估，或者直接告诉我孩子喜欢什么，我先按兴趣推荐。",
          actions: [
            { label: "开始评估", action: "go-assess" },
            { label: "按兴趣推荐", action: "go-books" }
          ]
        });
      } else {
        recommend(0, profile.interestTags, "根据孩子的画像，我建议从这三本里选一本。");
      }
      return;
    }

    if (interest) {
      recommend(0, [interest], "我按这个兴趣找了几本更合适的。");
      return;
    }

    if (profile) {
      recommend(0, profile.interestTags, "我先按孩子的画像给出一个更稳的选择。");
      return;
    }

    addMessage({
      role: "agent",
      text: "我还需要一点信息。你可以告诉我孩子喜欢什么，或者先做一次评估。也可以直接打开书架，我帮你一起看。",
      actions: [
        { label: "开始评估", action: "go-assess" },
        { label: "去书架", action: "go-books" }
      ]
    });
  }

  function recommend(delta, interests, lead) {
    const context = currentContext();
    const profile = context.profile;
    const baseLevel = profile ? profile.level : 2;
    const targetLevel = clampLevel(baseLevel + (delta || 0));
    const tags = (interests && interests.length ? interests : profile ? profile.interestTags : ["日常生活"]).slice(0, 3);
    const ranked = rankBooks(context.books, targetLevel, tags, context.favorites);
    const picks = ranked.slice(0, 3);
    if (!picks.length) {
      addMessage({ role: "agent", text: "书架里暂时没有完全匹配的样例。你可以去书架按兴趣和等级筛选。" });
      return;
    }
    addMessage({
      role: "agent",
      text: lead + "\n\n推荐目标：**L" + targetLevel + "**，兴趣入口：**" + tags.join(" / ") + "**。",
      bookIds: picks.map(function (item) {
        return item.book.id;
      })
    });
  }

  function giveCurrentPagePrompt() {
    const context = currentContext();
    const book = context.currentBook;
    if (!book) {
      addMessage({
        role: "agent",
        text: "先打开一本书，我就能结合具体页面给你提示。",
        actions: [{ label: "去书架", action: "go-books" }]
      });
      return;
    }
    const page = book.pages[context.currentPage];
    addMessage({
      role: "agent",
      text:
        "这一页《" +
        book.title +
        "》可以这样读：\n\n**读前** " +
        page.promptBefore +
        "\n\n**读中** " +
        page.promptDuring +
        "\n\n**读后** " +
        page.promptAfter,
      actions: [{ label: "回到当前阅读页", action: "open-reader", data: "id=" + book.id }]
    });
  }

  function analyzeCurrentDifficulty() {
    const context = currentContext();
    const book = context.currentBook;
    if (!book) {
      addMessage({
        role: "agent",
        text: "打开一本书后，我可以按字频和分级标准判断当前句子难不难。",
        actions: [{ label: "去书架", action: "go-books" }]
      });
      return;
    }
    const page = book.pages[context.currentPage];
    const profile = bridge().charProfile
      ? bridge().charProfile(page.sentences)
      : null;
    const line = charDifficultyLine(profile);
    addMessage({
      role: "agent",
      text:
        "当前句子是：**" +
        page.sentences +
        "**\n\n" +
        line +
        "\n\n我的建议：先把待学字单独指出来，看图说一遍，再回到句子整体读。"
    });
  }

  function explainCurrentSentence() {
    const context = currentContext();
    const book = context.currentBook;
    if (!book) {
      addMessage({
        role: "agent",
        text: "打开一本书后，我会把当前句子拆开，解释关键词和怎么帮孩子接话。",
        actions: [{ label: "去书架", action: "go-books" }]
      });
      return;
    }
    const page = book.pages[context.currentPage];
    const keywords = page.highlights.slice(0, 3).join("、");
    const profile = bridge().charProfile
      ? bridge().charProfile(page.sentences)
      : null;
    const charLine = charDifficultyLine(profile);
    addMessage({
      role: "agent",
      text:
        "当前句子是：**" +
        page.sentences +
        "**\n\n重点词是：" +
        keywords +
        "。读的时候在这些词上停一下，让孩子指图或跟读。\n\n" +
        charLine +
        "\n\n如果孩子说出“车”，你可以用多一词原则接成“红色的车车”。"
    });
  }

  function readCurrentPage() {
    const context = currentContext();
    const book = context.currentBook;
    if (!book) {
      addMessage({
        role: "agent",
        text: "先打开一本书，我就能读出当前页。",
        actions: [{ label: "去书架", action: "go-books" }]
      });
      return;
    }
    const page = book.pages[context.currentPage];
    const started = bridge().speak
      ? bridge().speak(page.sentences, page.voiceRate)
      : false;
    addMessage({
      role: "agent",
      text: started
        ? "我正在读这一页。你可以在阅读页随时按“停下”。"
        : "当前浏览器没有可用的中文语音，我先把句子放出来，你可以和孩子一起慢慢读。"
    });
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      bridge().toast && bridge().toast("当前浏览器不支持语音输入，请使用文字。");
      return;
    }
    if (recognition) return;
    recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = function (event) {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      const input = document.getElementById("agent-input");
      if (input) input.value = transcript;
    };
    recognition.onend = function () {
      recognition = null;
      const input = document.getElementById("agent-input");
      if (input && input.value.trim()) {
        send(input.value.trim());
      }
    };
    recognition.onerror = function () {
      recognition = null;
      bridge().toast && bridge().toast("没有听清，请再说一次或用文字输入。");
    };
    recognition.start();
  }

  function clearChat() {
    messages = [];
    saveMessages();
    refresh();
    ensureGreeting();
    refresh();
  }

  function openAgent() {
    if (location.hash !== "#/agent") location.hash = "#/agent";
    else refresh();
  }

  function handleClick(event) {
    const target = event.target.closest("[data-agent-action]");
    if (!target) return;
    const action = target.dataset.agentAction;
    if (action === "open-agent") {
      openAgent();
      return;
    }
    if (action === "quick") {
      send(target.dataset.text);
      return;
    }
    if (action === "send") {
      event.preventDefault();
      const input = document.getElementById("agent-input");
      send(input ? input.value : "");
      return;
    }
    if (action === "voice") {
      event.preventDefault();
      startVoice();
      return;
    }
    if (action === "mute") {
      muted = !muted;
      bridge().setMuted && bridge().setMuted(muted);
      refresh();
      return;
    }
    if (action === "clear") {
      clearChat();
      return;
    }
    if (action === "go-assess") {
      location.hash = "#/assess";
      return;
    }
    if (action === "go-books") {
      location.hash = "#/books";
      return;
    }
    if (action === "open-book") {
      location.hash = "#/read/" + target.dataset.id;
      return;
    }
    if (action === "open-reader") {
      const context = currentContext();
      if (context.currentBook) location.hash = "#/read/" + context.currentBook.id;
      else location.hash = "#/books";
      return;
    }
  }

  function handleInput(event) {
    if (event.target && event.target.id === "agent-input") {
      draft = event.target.value;
      event.target.style.height = "auto";
      event.target.style.height = Math.min(120, event.target.scrollHeight) + "px";
    }
  }

  function handleKeydown(event) {
    if (event.target && event.target.id === "agent-input" && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(event.target.value);
    }
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);
  document.addEventListener("keydown", handleKeydown);

  window.AgentBrain = {
    render: render,
    refresh: refresh,
    open: openAgent,
    afterRender: afterRender
  };
})();
