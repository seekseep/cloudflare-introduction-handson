// API（Worker）のURL。
// ローカルでは `npm run dev` で起動する Worker（http://localhost:8787）を指す。
// Cloudflare に公開したら、デプロイ時に表示された Worker の URL に書き換える。
// 例: const API_BASE = 'https://hitokoto-api-tanaka.あなた.workers.dev';
const API_BASE = 'http://localhost:8787';

const list = document.getElementById('message-list');
const form = document.getElementById('post-form');
const note = document.getElementById('note');

function showNote(text) {
  note.textContent = text;
  note.hidden = false;
}

function renderMessages(messages) {
  list.innerHTML = '';
  for (const m of messages) {
    const li = document.createElement('li');
    li.className = 'list-group-item border-start border-primary border-3';
    // textContent を使ってエスケープする（HTML文字列を組み立てない）。
    const name = document.createElement('div');
    name.className = 'fw-bold';
    name.textContent = m.name;
    const body = document.createElement('div');
    body.className = 'fs-5';
    body.textContent = m.body;
    li.append(name, body);
    list.appendChild(li);
  }
}

async function loadMessages() {
  try {
    const res = await fetch(`${API_BASE}/api/messages`);
    renderMessages(await res.json());
  } catch (e) {
    showNote('API に接続できませんでした。Worker（npm run dev）が起動しているか確認してください。');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const body = form.body.value.trim();
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, body }),
  });
  const created = await res.json();
  // この章ではサーバーが保存しない（saved: false）。画面だけに反映して案内を出す。
  if (created.saved === false) {
    showNote('投稿を受け取りました（が、この章ではまだ保存されません。次章の D1 で保存します）。');
  }
  renderMessages([{ name, body }, ...await fetchCurrent()]);
  form.reset();
});

async function fetchCurrent() {
  try {
    const res = await fetch(`${API_BASE}/api/messages`);
    return await res.json();
  } catch {
    return [];
  }
}

loadMessages();
