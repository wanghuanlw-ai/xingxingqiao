(function () {
  window.BOOKS = [
    {
      id: "greet",
      title: "第一次打招呼",
      level: 1,
      band: "星芽",
      interestTags: ["日常生活", "朋友"],
      minutes: 4,
      coverKey: "cover-greet",
      sample: false,
      complexity: { lexical: 1, syntactic: 1, discourse: 1, pragmatic: 2 },
      pages: [
        {
          illustrationKey: "page-greet-1",
          stage: "warm",
          sentences: "小朋友，你好。",
          highlights: ["你好"],
          promptBefore: "先看图画：这里有两个小朋友吗？",
          promptDuring: "孩子说出“好”时，可以回应“你好”。",
          promptAfter: "我们挥手说“再见”。",
          voiceRate: 0.78
        },
        {
          illustrationKey: "page-greet-2",
          stage: "read",
          sentences: "我叫安安。我们一起看。",
          highlights: ["安安", "一起"],
          promptBefore: "指一指：哪个是安安？",
          promptDuring: "把“看”说成“一起看”，帮孩子接上下一句。",
          promptAfter: "让孩子试着说自己的名字。",
          voiceRate: 0.78
        },
        {
          illustrationKey: "page-greet-3",
          stage: "review",
          sentences: "再见，明天见。",
          highlights: ["再见", "明天见"],
          promptBefore: "先挥手，再念“再见”。",
          promptDuring: "孩子说“见”，你可以接“明天见”。",
          promptAfter: "多一词原则：把“车”接成“红色的车车”。",
          voiceRate: 0.78
        }
      ]
    },
    {
      id: "wait",
      title: "等一等也没关系",
      level: 2,
      band: "星芽",
      interestTags: ["日常生活", "情绪"],
      minutes: 5,
      coverKey: "cover-wait",
      sample: false,
      complexity: { lexical: 2, syntactic: 2, discourse: 2, pragmatic: 2 },
      pages: [
        {
          illustrationKey: "page-wait-1",
          stage: "warm",
          sentences: "积木倒了。",
          highlights: ["积木", "倒"],
          promptBefore: "先看积木在哪里，再开始读。",
          promptDuring: "指着倒下的积木，说出“倒了”。",
          promptAfter: "问孩子：倒了以后，可以做什么？",
          voiceRate: 0.76
        },
        {
          illustrationKey: "page-wait-2",
          stage: "read",
          sentences: "没关系，我们可以等一等。再搭一次。",
          highlights: ["没关系", "等一等", "再"],
          promptBefore: "把句子拆成两小句，一句一句读。",
          promptDuring: "读到“等一等”时，一起停两秒。",
          promptAfter: "让孩子按顺序指出“等一等”和“再搭一次”。",
          voiceRate: 0.74
        },
        {
          illustrationKey: "page-wait-3",
          stage: "review",
          sentences: "慢慢来，也很好。",
          highlights: ["慢慢来", "很好"],
          promptBefore: "一起做个慢下来的动作。",
          promptDuring: "把“好”接成“很好”。",
          promptAfter: "告诉孩子：不用一次做完，也很好。",
          voiceRate: 0.72
        }
      ]
    },
    {
      id: "train",
      title: "我的喜欢不一样",
      level: 2,
      band: "星叶",
      interestTags: ["交通工具", "数字字母"],
      minutes: 5,
      coverKey: "cover-train",
      sample: false,
      complexity: { lexical: 2, syntactic: 3, discourse: 2, pragmatic: 3 },
      pages: [
        {
          illustrationKey: "page-train-1",
          stage: "warm",
          sentences: "我喜欢红色的火车。",
          highlights: ["喜欢", "红色", "火车"],
          promptBefore: "先问：这里有几节车厢？",
          promptDuring: "说到“红色”时，一起指红色。",
          promptAfter: "让孩子选一个颜色，说出“我喜欢……”。",
          voiceRate: 0.76
        },
        {
          illustrationKey: "page-train-2",
          stage: "read",
          sentences: "一、二、三，火车来了。车灯亮了。",
          highlights: ["一", "二", "三", "车灯"],
          promptBefore: "先数一、二、三，再看车灯。",
          promptDuring: "每数一个数，拍一次手。",
          promptAfter: "问孩子：火车来的时候，先亮什么？",
          voiceRate: 0.75
        },
        {
          illustrationKey: "page-train-3",
          stage: "review",
          sentences: "你的喜欢，很特别。",
          highlights: ["喜欢", "特别"],
          promptBefore: "看着孩子，说出“你的喜欢”。",
          promptDuring: "把“特别”说得慢一点。",
          promptAfter: "让孩子知道你听懂了他的特别。",
          voiceRate: 0.72
        }
      ]
    },
    {
      id: "loud",
      title: "声音很大怎么办",
      level: 3,
      band: "星叶",
      interestTags: ["自然天气", "情绪"],
      minutes: 6,
      coverKey: "cover-loud",
      sample: false,
      complexity: { lexical: 3, syntactic: 3, discourse: 3, pragmatic: 3 },
      pages: [
        {
          illustrationKey: "page-loud-1",
          stage: "warm",
          sentences: "打雷了，声音好大。",
          highlights: ["打雷", "声音", "大"],
          promptBefore: "先看天空，再一起听一听“轰”。",
          promptDuring: "读到“大”时，用手捂住耳朵。",
          promptAfter: "问孩子：声音很大的时候，你想做什么？",
          voiceRate: 0.75
        },
        {
          illustrationKey: "page-loud-2",
          stage: "read",
          sentences: "捂住耳朵，深呼吸。雨点落在窗上。",
          highlights: ["捂住耳朵", "深呼吸", "雨点"],
          promptBefore: "先把动作拆开：捂耳朵、吸一口气。",
          promptDuring: "和孩子一起做一次深呼吸。",
          promptAfter: "让孩子指出雨点在哪里。",
          voiceRate: 0.72
        },
        {
          illustrationKey: "page-loud-3",
          stage: "review",
          sentences: "声音大，也可以很安全。",
          highlights: ["声音大", "安全"],
          promptBefore: "用平静的声音预告：下一页是安静的树。",
          promptDuring: "读到“安全”时，轻拍孩子的手。",
          promptAfter: "告诉孩子：我们在屋里，很安全。",
          voiceRate: 0.7
        }
      ]
    },
    {
      id: "joke",
      title: "别人为什么笑",
      level: 4,
      band: "星桥",
      interestTags: ["社会情境", "隐喻"],
      minutes: 7,
      coverKey: "cover-joke",
      sample: true,
      complexity: { lexical: 4, syntactic: 4, discourse: 4, pragmatic: 5 },
      pages: []
    },
    {
      id: "phrase",
      title: "一句玩笑话",
      level: 5,
      band: "星桥",
      interestTags: ["朋友", "隐喻"],
      minutes: 8,
      coverKey: "cover-others",
      sample: true,
      complexity: { lexical: 5, syntactic: 5, discourse: 5, pragmatic: 5 },
      pages: []
    }
  ];

  window.ALL_INTERESTS = ["日常生活", "朋友", "情绪", "交通工具", "数字字母", "自然天气", "社会情境", "隐喻"];

  window.ASSESSMENT_QUESTIONS = [
    {
      id: "expression",
      title: "孩子现在主要怎样表达？",
      type: "single",
      dimension: "language",
      options: [
        { label: "以手势、图片或短音为主", value: 0 },
        { label: "能说单词或短句", value: 1 },
        { label: "能说完整句，但较少主动说", value: 2 },
        { label: "能主动交谈", value: 3 }
      ]
    },
    {
      id: "attention",
      title: "孩子能安静地听一本绘本吗？",
      type: "single",
      dimension: "attention",
      options: [
        { label: "很难超过一页", value: 0 },
        { label: "能一起看两三页", value: 1 },
        { label: "能听完一本熟悉的书", value: 2 },
        { label: "能连续听多本", value: 3 }
      ]
    },
    {
      id: "familiar",
      title: "孩子面对熟悉的故事通常会怎样？",
      type: "single",
      dimension: "support",
      options: [
        { label: "反复听同一本，不喜欢换", value: 0 },
        { label: "愿意换新故事，但需要提前预告", value: 1 },
        { label: "会自己挑故事", value: 2 },
        { label: "会翻页并复述", value: 3 }
      ]
    },
    {
      id: "interests",
      title: "孩子最容易被哪些内容吸引？",
      type: "multi",
      dimension: "interest",
      options: [
        { label: "交通工具" },
        { label: "动物" },
        { label: "数字字母" },
        { label: "日常生活" },
        { label: "自然天气" },
        { label: "家人朋友" },
        { label: "社会情境" }
      ]
    },
    {
      id: "syntax",
      title: "孩子遇到长句子时通常怎样？",
      type: "single",
      dimension: "syntax",
      options: [
        { label: "容易分心，需要拆成短句", value: 0 },
        { label: "能跟读短句", value: 1 },
        { label: "能理解复句，但需要停顿", value: 2 },
        { label: "能较顺畅地理解", value: 3 }
      ]
    },
    {
      id: "pragmatic",
      title: "孩子怎样理解玩笑、反话或比喻？",
      type: "single",
      dimension: "pragmatic",
      options: [
        { label: "常常按字面意思理解", value: 0 },
        { label: "有时需要大人解释", value: 1 },
        { label: "能理解常见比喻", value: 2 },
        { label: "能主动使用比喻", value: 3 }
      ]
    },
    {
      id: "change",
      title: "遇到陌生情境或计划变化时，孩子通常怎样？",
      type: "single",
      dimension: "change",
      options: [
        { label: "会非常不安", value: 0 },
        { label: "需要提前预告", value: 1 },
        { label: "能适应，但需要陪伴", value: 2 },
        { label: "能较快适应", value: 3 }
      ]
    },
    {
      id: "support",
      title: "你现在陪读主要用什么方式？",
      type: "single",
      dimension: "support",
      options: [
        { label: "照着文字念", value: 0 },
        { label: "会指图提问", value: 1 },
        { label: "会简化句子", value: 2 },
        { label: "会结合孩子的兴趣演出来", value: 3 }
      ]
    },
    {
      id: "goal",
      title: "你最希望先解决哪件事？",
      type: "single",
      dimension: "goal",
      options: [
        { label: "不知道选什么难度", value: 0 },
        { label: "不知道怎么开口陪读", value: 1 },
        { label: "希望每天稳定读一点", value: 2 },
        { label: "希望孩子愿意开口", value: 3 }
      ]
    }
  ];
})();
