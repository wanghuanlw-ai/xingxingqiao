(function () {
  const palettes = {
    hero: {
      bg: "#F4FBF7",
      wash: "#C6E3D8",
      deep: "#7BA98F",
      wood: "#E4A97E",
      sand: "#F5E4CB",
      paper: "#FFFFFF",
      ink: "#2F4039",
      sun: "#F8D987"
    },
    greet: {
      bg: "#EEF1E8",
      wash: "#A9C4BE",
      deep: "#6F8D78",
      wood: "#C89B72",
      sand: "#E9DCC8",
      paper: "#FBF7EF",
      ink: "#29332F"
    },
    wait: {
      bg: "#EAF0EF",
      wash: "#9DBDBD",
      deep: "#6F8D78",
      wood: "#C89B72",
      sand: "#E9DCC8",
      paper: "#FBF7EF",
      ink: "#29332F"
    },
    train: {
      bg: "#F0EBDD",
      wash: "#D7C3A5",
      deep: "#6F8D78",
      wood: "#C89B72",
      sand: "#E9DCC8",
      paper: "#FBF7EF",
      ink: "#29332F"
    },
    loud: {
      bg: "#E9F0EE",
      wash: "#A9C4BE",
      deep: "#6F8D78",
      wood: "#C89B72",
      sand: "#E9DCC8",
      paper: "#FBF7EF",
      ink: "#29332F"
    },
    star: {
      bg: "#EDF0E8",
      wash: "#A9C4BE",
      deep: "#6F8D78",
      wood: "#C89B72",
      sand: "#E9DCC8",
      paper: "#FBF7EF",
      ink: "#29332F"
    },
    story: {
      bg: "#F0EDE3",
      wash: "#D7C3A5",
      deep: "#6F8D78",
      wood: "#C89B72",
      sand: "#E9DCC8",
      paper: "#FBF7EF",
      ink: "#29332F"
    }
  };

  function blob(cx, cy, rx, ry, fill, opacity, blur) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}" style="filter:blur(${blur}px)" />`;
  }

  function cloud(cx, cy, fill, opacity, scale) {
    const s = scale || 1;
    return `<g fill="${fill}" opacity="${opacity}" transform="translate(${cx} ${cy}) scale(${s})">
      <ellipse cx="0" cy="0" rx="62" ry="26" style="filter:blur(4px)" />
      <ellipse cx="-38" cy="-10" rx="34" ry="24" style="filter:blur(4px)" />
      <ellipse cx="38" cy="-8" rx="34" ry="22" style="filter:blur(4px)" />
    </g>`;
  }

  function ground(p, y) {
    return `<ellipse cx="50%" cy="${y}" rx="58%" ry="19%" fill="${p.sand}" opacity="0.88" style="filter:blur(2px)" />`;
  }

  function figure(x, y, body, head, p) {
    const blush = p.rose || "#E7B8AE";
    return `<g transform="translate(${x} ${y})">
      <ellipse cx="0" cy="44" rx="38" ry="33" fill="${body}" />
      <path d="M-28-4C-24-26 24-26 28-4" fill="${head}" />
      <circle cx="0" cy="-6" r="24" fill="${head}" />
      <circle cx="0" cy="-8" r="19" fill="${p.paper}" opacity="0.52" />
      <path d="M-12 3c5 5 19 5 24 0" fill="none" stroke="${p.ink}" stroke-width="3" stroke-linecap="round" opacity="0.5" />
      <circle cx="-10" cy="-11" r="3.2" fill="${p.ink}" opacity="0.72" />
      <circle cx="10" cy="-11" r="3.2" fill="${p.ink}" opacity="0.72" />
      <circle cx="-18" cy="-2" r="5" fill="${blush}" opacity="0.55" />
      <circle cx="18" cy="-2" r="5" fill="${blush}" opacity="0.55" />
    </g>`;
  }

  function tree(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 0C8 30 8 66 0 96C-8 66-8 30 0 0Z" fill="${p.wood}" />
      <circle cx="-72" cy="-48" r="60" fill="${p.deep}" opacity="0.82" style="filter:blur(5px)" />
      <circle cx="0" cy="-92" r="72" fill="${p.deep}" opacity="0.78" style="filter:blur(5px)" />
      <circle cx="70" cy="-48" r="60" fill="${p.deep}" opacity="0.82" style="filter:blur(5px)" />
      <circle cx="0" cy="-58" r="52" fill="${p.wash}" opacity="0.62" style="filter:blur(4px)" />
    </g>`;
  }

  function train(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-180" y="-42" width="250" height="76" rx="18" fill="${p.deep}" />
      <rect x="30" y="-62" width="130" height="52" rx="14" fill="${p.wood}" />
      <rect x="-154" y="-16" width="76" height="38" rx="9" fill="${p.paper}" opacity="0.78" />
      <rect x="54" y="-30" width="58" height="40" rx="9" fill="${p.paper}" opacity="0.78" />
      <circle cx="-126" cy="42" r="24" fill="${p.ink}" opacity="0.72" />
      <circle cx="126" cy="42" r="24" fill="${p.ink}" opacity="0.72" />
      <circle cx="-126" cy="42" r="10" fill="${p.paper}" opacity="0.8" />
      <circle cx="126" cy="42" r="10" fill="${p.paper}" opacity="0.8" />
      <path d="M-260 72H260" stroke="${p.ink}" stroke-width="8" stroke-linecap="round" opacity="0.35" />
    </g>`;
  }

  function house(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-140" y="-55" width="280" height="130" rx="14" fill="${p.wood}" />
      <path d="M-166-48L0-150L166-48Z" fill="${p.deep}" />
      <rect x="-48" y="10" width="96" height="70" rx="10" fill="${p.paper}" opacity="0.72" />
      <rect x="64" y="-5" width="52" height="52" rx="8" fill="${p.paper}" opacity="0.72" />
      <rect x="-126" y="-5" width="52" height="52" rx="8" fill="${p.paper}" opacity="0.72" />
    </g>`;
  }

  function weather(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <circle cx="-78" cy="-62" r="46" fill="${p.wood}" opacity="0.86" />
      <ellipse cx="72" cy="-38" rx="64" ry="28" fill="${p.paper}" />
      <ellipse cx="42" cy="-52" rx="42" ry="28" fill="${p.paper}" />
      <ellipse cx="96" cy="-55" rx="38" ry="24" fill="${p.paper}" />
      <path d="M-44-14c-24 22-18 48 10 54" fill="none" stroke="${p.deep}" stroke-width="8" stroke-linecap="round" opacity="0.75" />
      <path d="M24-6c-16 18-10 40 10 46" fill="none" stroke="${p.deep}" stroke-width="8" stroke-linecap="round" opacity="0.75" />
      <path d="M82 6c-14 12-8 28 8 32" fill="none" stroke="${p.deep}" stroke-width="8" stroke-linecap="round" opacity="0.75" />
    </g>`;
  }

  function friends(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      ${figure(-92, -10, p.deep, p.sand, p)}
      ${figure(92, -10, p.wood, p.sand, p)}
      <path d="M-48 40C-16 74 18 74 50 42L70 58L30 86L-10 60L-48 40Z" fill="${p.paper}" opacity="0.9" />
      <path d="M-52 38L70 60" stroke="${p.ink}" stroke-width="4" stroke-linecap="round" opacity="0.32" />
    </g>`;
  }

  function openBook(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-145 0C-116 30-92 30-64 0C-92-26-116-26-145 0Z" fill="${p.paper}" stroke="${p.ink}" stroke-width="4" stroke-opacity="0.18" />
      <path d="M64 0C92 30 116 30 145 0C116-26 92-26 64 0Z" fill="${p.paper}" stroke="${p.ink}" stroke-width="4" stroke-opacity="0.18" />
      <path d="M-64 0L64 0" stroke="${p.ink}" stroke-width="4" stroke-opacity="0.25" />
      <path d="M-122-6C-108 10-92 18-78 20M82 20C98 18 116 8 124-8" fill="none" stroke="${p.deep}" stroke-width="7" stroke-linecap="round" opacity="0.65" />
    </g>`;
  }

  function cat(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="24" rx="42" ry="32" fill="${p.wood}" />
      <circle cx="0" cy="-14" r="31" fill="${p.wood}" />
      <path d="M-25-36L-20-58L-5-42Z" fill="${p.wood}" />
      <path d="M5-42L20-58L25-36Z" fill="${p.wood}" />
      <circle cx="-12" cy="-18" r="4" fill="${p.ink}" opacity="0.7" />
      <circle cx="12" cy="-18" r="4" fill="${p.ink}" opacity="0.7" />
      <path d="M-3-10L3-10L0-4Z" fill="${p.rose || p.wood}" opacity="0.85" />
      <path d="M0 0C4 4 4 8 0 12C-4 8-4 4 0 0Z" fill="${p.ink}" opacity="0.35" />
      <path d="M-24 4C-32 5-36 8-40 7M-24 12C-32 14-37 15-42 13M24 4C32 5 36 8 40 7M24 12C32 14 37 15 42 13" stroke="${p.ink}" stroke-width="2" stroke-linecap="round" opacity="0.38" />
      <circle cx="-18" cy="-4" r="6" fill="${p.rose || p.paper}" opacity="0.48" />
      <circle cx="18" cy="-4" r="6" fill="${p.rose || p.paper}" opacity="0.48" />
    </g>`;
  }

  function rainbow(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-linecap="round">
      <path d="M-220 42C-112-86 112-86 220 42" stroke="${p.rose || p.wood}" stroke-width="22" opacity="0.5" />
      <path d="M-176 42C-90-60 90-60 176 42" stroke="${p.sun || p.sand}" stroke-width="22" opacity="0.54" />
      <path d="M-132 42C-66-36 66-36 132 42" stroke="${p.wash || p.deep}" stroke-width="22" opacity="0.58" />
      <path d="M-88 42C-44-12 44-12 88 42" stroke="${p.blue || p.wash}" stroke-width="22" opacity="0.6" />
    </g>`;
  }

  function balloons(p, x, y, scale) {
    const s = scale || 1;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-80 130C-70 90-48 78-30 72M10 130C4 94 16 82 30 74M92 128C86 92 104 80 118 72" fill="none" stroke="${p.ink}" stroke-width="2" stroke-linecap="round" opacity="0.25" />
      <ellipse cx="-92" cy="-18" rx="36" ry="44" fill="${p.wash || "#C6E3D8"}" opacity="0.66" />
      <ellipse cx="18" cy="-62" rx="42" ry="50" fill="${p.sun || "#F8D987"}" opacity="0.58" />
      <ellipse cx="120" cy="2" rx="30" ry="38" fill="${p.sand || "#F5E4CB"}" opacity="0.72" />
      <path d="M-92 26L-95 34M18 2L15 10M120 40L118 48" stroke="${p.ink}" stroke-width="3" stroke-linecap="round" opacity="0.28" />
    </g>`;
  }

  function starField(p, x, y, scale) {
    const s = scale || 1;
    const star = (sx, sy, r) => {
      return `<path d="M${sx} ${sy - r}C${sx + r * 0.2} ${sy - r * 0.2} ${sx + r} ${sy} ${sx} ${sy + r}C${sx - r} ${sy} ${sx - r * 0.2} ${sy - r * 0.2} ${sx} ${sy - r}Z" fill="${p.wood}" opacity="0.82" />`;
    };
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-130 38C-60-6 60-6 130 38" fill="none" stroke="${p.deep}" stroke-width="16" stroke-linecap="round" opacity="0.68" />
      <path d="M-102 26C-45-10 45-10 102 26" fill="none" stroke="${p.paper}" stroke-width="8" stroke-linecap="round" opacity="0.72" />
      ${star(-116, -18, 18)}
      ${star(8, -38, 26)}
      ${star(112, -10, 16)}
      ${star(-42, -76, 12)}
      ${star(70, -80, 13)}
    </g>`;
  }

  function subject(kind, p) {
    if (kind === "hero") {
      return `
        ${blob(220, 178, 172, 128, p.sun, 0.58, 38)}
        ${blob(1188, 158, 120, 98, p.wash, 0.42, 36)}
        ${balloons(p, 850, 330, 1.08)}
        ${ground(p, 760)}
        ${cat(p, 980, 750, 1.42)}
      `;
    }
    if (kind === "tree") return `${ground(p, 506)}${tree(p, 400, 430, 1.12)}`;
    if (kind === "train") return `${ground(p, 520)}${train(p, 400, 430, 1)}`;
    if (kind === "home") return `${ground(p, 526)}${house(p, 400, 430, 1)}`;
    if (kind === "weather") return `${ground(p, 510)}${weather(p, 400, 420, 1.08)}`;
    if (kind === "friends") return `${ground(p, 508)}${friends(p, 400, 440, 1.12)}`;
    if (kind === "book") return `${ground(p, 516)}${openBook(p, 400, 460, 1.08)}`;
    if (kind === "star") return `${ground(p, 526)}${starField(p, 400, 360, 1.02)}`;
    return `${ground(p, 520)}${openBook(p, 400, 460, 1)}`;
  }

  function scene(kind, p, viewBox) {
    const width = viewBox.split(" ")[2] || "800";
    const height = viewBox.split(" ")[3] || "600";
    return `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="100%" height="100%" fill="${p.bg}" />
      ${blob(width * 0.18, height * 0.16, width * 0.25, height * 0.2, p.wash, 0.42, 34)}
      ${blob(width * 0.84, height * 0.22, width * 0.28, height * 0.22, p.sand, 0.42, 36)}
      ${blob(width * 0.64, height * 0.1, width * 0.24, height * 0.16, p.paper, 0.38, 38)}
      ${cloud(width * 0.28, height * 0.16, p.paper, 0.4, 0.8)}
      ${cloud(width * 0.74, height * 0.18, p.paper, 0.32, 0.7)}
      ${subject(kind, p)}
    </svg>`.replace(/\s+/g, " ").trim();
  }

  const coverKinds = {
    "cover-greet": ["friends", "greet"],
    "cover-wait": ["weather", "wait"],
    "cover-train": ["train", "train"],
    "cover-loud": ["weather", "loud"],
    "cover-joke": ["star", "star"],
    "cover-others": ["friends", "story"]
  };

  const pageKinds = {
    "page-greet-1": ["friends", "greet"],
    "page-greet-2": ["book", "greet"],
    "page-greet-3": ["friends", "greet"],
    "page-wait-1": ["weather", "wait"],
    "page-wait-2": ["tree", "wait"],
    "page-wait-3": ["friends", "wait"],
    "page-train-1": ["train", "train"],
    "page-train-2": ["train", "train"],
    "page-train-3": ["star", "train"],
    "page-loud-1": ["weather", "loud"],
    "page-loud-2": ["home", "loud"],
    "page-loud-3": ["tree", "loud"]
  };

  const illustrations = {
    hero: scene("hero", palettes.hero, "0 0 1440 900")
  };

  Object.keys(coverKinds).forEach(function (key) {
    const pair = coverKinds[key];
    illustrations[key] = scene(pair[0], palettes[pair[1]], "0 0 800 600");
  });

  Object.keys(pageKinds).forEach(function (key) {
    const pair = pageKinds[key];
    illustrations[key] = scene(pair[0], palettes[pair[1]], "0 0 1200 760");
  });

  window.ILLUSTRATIONS = illustrations;
  window.illustrationFor = function (key) {
    return illustrations[key] || scene("book", palettes.story, "0 0 1200 760");
  };
})();
