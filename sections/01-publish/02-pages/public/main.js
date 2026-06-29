const STORAGE_KEY = 'hitokoto-board';
const form = document.getElementById('post-form');
const list = document.getElementById('message-list');
const empty = document.getElementById('empty');

// 初期サンプル（一度も投稿がないときだけ表示）
const SAMPLES = [
  { name: 'たなか', body: 'はじめての投稿です！' },
  { name: 'さとう', body: 'Cloudflare で公開してみた' },
];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (_) { }
  return SAMPLES.slice();
}

function save(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function escape(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function render(messages) {
  list.innerHTML = messages
    .map(
      (m) =>
        '<li class="list-group-item border-start">' +
        '<div class="me-4">' + escape(m.name) + '</div>' +
        '<div class="fs-5">' + escape(m.body) + '</div>' +
        '</li>'
    )
    .join('');
  empty.hidden = messages.length > 0;
}

let messages = load();
render(messages);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get('name').trim();
  const body = data.get('body').trim();
  if (!name || !body) return;

  // 新しい投稿を先頭に追加
  messages = [{ name, body }, ...messages];
  save(messages);
  render(messages);
  form.reset();
  form.querySelector('input[name="name"]').focus();
});
