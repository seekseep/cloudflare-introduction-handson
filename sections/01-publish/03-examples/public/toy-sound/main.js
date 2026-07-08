// 白鍵（はっけん）＝ドレミ…（C4〜C5）。周波数(Hz)とキーボードの割り当て。
const WHITE_NOTES = [
  { label: 'ド', key: 'a', freq: 261.63 },
  { label: 'レ', key: 's', freq: 293.66 },
  { label: 'ミ', key: 'd', freq: 329.63 },
  { label: 'ファ', key: 'f', freq: 349.23 },
  { label: 'ソ', key: 'g', freq: 392.0 },
  { label: 'ラ', key: 'h', freq: 440.0 },
  { label: 'シ', key: 'j', freq: 493.88 },
  { label: 'ド↑', key: 'k', freq: 523.25 },
];

// 黒鍵（こっけん）＝シャープ音。afterIndex は「何番目の白鍵の右肩に載せるか」（0始まり）。
// ミ→ファ、シ→ド の間には黒鍵が無いので飛ばしている。
const BLACK_NOTES = [
  { label: 'ド♯', key: 'w', freq: 277.18, afterIndex: 0 },
  { label: 'レ♯', key: 'e', freq: 311.13, afterIndex: 1 },
  { label: 'ファ♯', key: 't', freq: 369.99, afterIndex: 3 },
  { label: 'ソ♯', key: 'y', freq: 415.3, afterIndex: 4 },
  { label: 'ラ♯', key: 'u', freq: 466.16, afterIndex: 5 },
];

// AudioContext は最初のユーザー操作まで作れない（自動再生ポリシー）ので遅延生成する。
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// 指定の周波数で短い音を鳴らす。オシレーター + ゲインで軽い減衰をつける。
function playTone(freq) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01); // 立ち上がり
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6); // 減衰

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

// 鍵盤を組み立てる
const keyboard = document.getElementById('keyboard');
const keyByChar = new Map();

// 押した見た目を一瞬つけて音を鳴らす共通処理
function pressKey(el, freq) {
  playTone(freq);
  el.classList.add('is-active');
  setTimeout(() => el.classList.remove('is-active'), 150);
}

// 白鍵をまず並べる。あとで黒鍵を載せる位置を測るために要素を覚えておく。
const whiteEls = [];
for (const note of WHITE_NOTES) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'key-white';
  el.innerHTML =
    '<span class="note">' + note.label + '</span>' +
    '<span class="kbd">' + note.key + '</span>';
  el.addEventListener('click', () => pressKey(el, note.freq));

  keyboard.appendChild(el);
  keyByChar.set(note.key, { el, freq: note.freq });
  whiteEls.push(el);
}

// 黒鍵を白鍵の境目（右端）に絶対配置で重ねる。
for (const note of BLACK_NOTES) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'key-black';
  el.innerHTML = '<span class="kbd">' + note.key + '</span>';
  el.addEventListener('click', () => pressKey(el, note.freq));

  // 隣り合う白鍵の境目に中央がくるよう、左端からの位置を計算して置く。
  const base = whiteEls[note.afterIndex];
  el.style.left = base.offsetLeft + base.offsetWidth + 'px';

  keyboard.appendChild(el);
  keyByChar.set(note.key, { el, freq: note.freq });
}

// キーボードでも鳴らせるようにする
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const entry = keyByChar.get(e.key.toLowerCase());
  if (entry) pressKey(entry.el, entry.freq);
});
