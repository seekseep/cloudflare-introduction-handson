// 難易度は 3 段階。それぞれに単語（term=言葉 / meaning=意味）のリストを持つ。
// 出題は「1 問 = term を見て、4 つの意味から正解を選ぶ」形式。
// 誤答の選択肢（ダミー）は、同じ難易度の他の単語の意味から選ぶ。
const LEVELS = [
  {
    id: 'beginner',
    label: '初級',
    description: 'まずはここから。身近な基本の英単語',
    color: 'text-bg-success',
    words: [
      { term: 'apple', meaning: 'りんご' },
      { term: 'dog', meaning: '犬' },
      { term: 'book', meaning: '本' },
      { term: 'water', meaning: '水' },
      { term: 'red', meaning: '赤い' },
      { term: 'run', meaning: '走る' },
      { term: 'happy', meaning: '幸せな' },
      { term: 'school', meaning: '学校' },
      { term: 'big', meaning: '大きい' },
      { term: 'friend', meaning: '友だち' },
    ],
  },
  {
    id: 'intermediate',
    label: '中級',
    description: '日常でよく使う少し難しめの単語',
    color: 'text-bg-warning',
    words: [
      { term: 'borrow', meaning: '借りる' },
      { term: 'weather', meaning: '天気' },
      { term: 'decide', meaning: '決める' },
      { term: 'kitchen', meaning: '台所' },
      { term: 'dangerous', meaning: '危険な' },
      { term: 'introduce', meaning: '紹介する' },
      { term: 'machine', meaning: '機械' },
      { term: 'comfortable', meaning: '快適な' },
      { term: 'reason', meaning: '理由' },
      { term: 'experience', meaning: '経験' },
    ],
  },
  {
    id: 'advanced',
    label: '上級',
    description: '手ごわい単語で腕試し',
    color: 'text-bg-danger',
    words: [
      { term: 'accomplish', meaning: '成し遂げる' },
      { term: 'ambiguous', meaning: 'あいまいな' },
      { term: 'deliberate', meaning: '意図的な' },
      { term: 'inevitable', meaning: '避けられない' },
      { term: 'notion', meaning: '概念' },
      { term: 'persuade', meaning: '説得する' },
      { term: 'reluctant', meaning: '気が進まない' },
      { term: 'sufficient', meaning: '十分な' },
      { term: 'tremendous', meaning: 'とてつもない' },
      { term: 'vague', meaning: 'ぼんやりした' },
    ],
  },
];

const CHOICE_COUNT = 4;
const BEST_KEY = 'word-list-best';

// --- 画面要素 ---
const screenSelect = document.getElementById('screen-select');
const screenQuiz = document.getElementById('screen-quiz');
const screenResult = document.getElementById('screen-result');
const levelList = document.getElementById('level-list');
const levelBadge = document.getElementById('level-badge');
const progressEl = document.getElementById('progress');
const progressBar = document.getElementById('progress-bar');
const questionTerm = document.getElementById('question-term');
const choicesEl = document.getElementById('choices');
const feedback = document.getElementById('feedback');
const feedbackText = document.getElementById('feedback-text');
const nextButton = document.getElementById('next-button');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const resultComment = document.getElementById('result-comment');
const bestText = document.getElementById('best-text');
const bestEl = document.getElementById('best');
const retryButton = document.getElementById('retry-button');
const backButton = document.getElementById('back-button');

// --- 状態 ---
let currentLevel = null;
let questions = []; // 出題順に並べた単語の配列
let index = 0;
let score = 0;

// 配列をシャッフルして新しい配列を返す（Fisher-Yates）
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(screen) {
  for (const s of [screenSelect, screenQuiz, screenResult]) {
    s.hidden = s !== screen;
  }
}

// --- ベストスコア（localStorage） ---
function loadBest() {
  try {
    const saved = JSON.parse(localStorage.getItem(BEST_KEY));
    if (saved && typeof saved === 'object') return saved;
  } catch (_) { }
  return {};
}

function saveBest(best) {
  localStorage.setItem(BEST_KEY, JSON.stringify(best));
}

// --- 難易度の選択画面を作る ---
function renderLevelList() {
  const best = loadBest();
  levelList.innerHTML = '';
  for (const level of LEVELS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'list-group-item list-group-item-action py-3';
    const bestValue = best[level.id];
    const bestLabel = bestValue != null
      ? '<span class="text-secondary small">ベスト ' + bestValue + '/' + level.words.length + '</span>'
      : '';
    button.innerHTML =
      '<div class="d-flex justify-content-between align-items-center">' +
      '<span><span class="badge ' + level.color + ' me-2">' + level.label + '</span>' +
      '<span class="text-secondary small">' + level.description + '</span></span>' +
      bestLabel +
      '</div>';
    button.addEventListener('click', () => startQuiz(level));
    levelList.appendChild(button);
  }
}

// --- クイズ開始 ---
function startQuiz(level) {
  currentLevel = level;
  questions = shuffle(level.words);
  index = 0;
  score = 0;
  levelBadge.textContent = level.label;
  levelBadge.className = 'badge ' + level.color;
  showScreen(screenQuiz);
  renderQuestion();
}

// --- 1 問を表示 ---
function renderQuestion() {
  const total = questions.length;
  const word = questions[index];

  progressEl.textContent = (index + 1) + ' / ' + total;
  progressBar.style.width = ((index) / total * 100) + '%';
  questionTerm.textContent = word.term;

  // 誤答の候補（同じ難易度の他の単語の意味）から 3 つ選ぶ
  const distractors = shuffle(
    currentLevel.words.filter((w) => w.meaning !== word.meaning).map((w) => w.meaning)
  ).slice(0, CHOICE_COUNT - 1);
  const options = shuffle([word.meaning, ...distractors]);

  feedback.hidden = true;
  choicesEl.innerHTML = '';
  for (const option of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-primary btn-lg';
    button.textContent = option;
    button.addEventListener('click', () => answer(button, option, word.meaning));
    choicesEl.appendChild(button);
  }
}

// --- 回答 ---
function answer(clicked, chosen, correct) {
  const isCorrect = chosen === correct;
  if (isCorrect) score++;

  // すべてのボタンを無効化し、正解・不正解を色で示す
  for (const button of choicesEl.querySelectorAll('button')) {
    button.disabled = true;
    if (button.textContent === correct) {
      button.className = 'btn btn-success btn-lg';
    } else if (button === clicked) {
      button.className = 'btn btn-danger btn-lg';
    } else {
      button.className = 'btn btn-outline-secondary btn-lg';
    }
  }

  feedbackText.textContent = isCorrect ? '⭕ 正解！' : '❌ 正解は「' + correct + '」';
  feedbackText.className = 'fs-5 fw-bold mb-3 ' + (isCorrect ? 'text-success' : 'text-danger');
  nextButton.textContent = index + 1 < questions.length ? '次へ' : '結果を見る';
  feedback.hidden = false;
  progressBar.style.width = ((index + 1) / questions.length * 100) + '%';
}

// --- 次の問題へ / 結果へ ---
nextButton.addEventListener('click', () => {
  index++;
  if (index < questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

// --- 結果画面 ---
function showResult() {
  const total = questions.length;
  scoreEl.textContent = score;
  totalEl.textContent = total;

  const ratio = score / total;
  resultComment.textContent =
    ratio === 1 ? '全問正解！お見事です 🎉'
      : ratio >= 0.7 ? 'あと少し！この調子 👍'
        : 'くり返して覚えていきましょう 💪';

  // ベストスコアを更新
  const best = loadBest();
  const prev = best[currentLevel.id];
  if (prev == null || score > prev) {
    best[currentLevel.id] = score;
    saveBest(best);
  }
  bestEl.textContent = best[currentLevel.id] + ' / ' + total;
  bestText.hidden = false;

  showScreen(screenResult);
}

retryButton.addEventListener('click', () => startQuiz(currentLevel));
backButton.addEventListener('click', () => {
  renderLevelList();
  showScreen(screenSelect);
});

// --- 初期表示 ---
renderLevelList();
showScreen(screenSelect);
