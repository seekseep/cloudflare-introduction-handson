// ローカルの Worker。公開後はデプロイで表示された Worker の URL に書き換える。
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
    const name = document.createElement('div');
    name.className = 'fw-bold';
    name.textContent = m.name;
    const body = document.createElement('div');
    body.className = 'fs-5';
    body.textContent = m.body;
    li.append(name, body);

    // image_key があれば、Worker 経由で R2 の画像を表示する。
    if (m.image_key) {
      const img = document.createElement('img');
      img.src = `${API_BASE}/api/images/${m.image_key}`;
      img.alt = '';
      img.className = 'img-fluid rounded mt-2';
      img.style.maxHeight = '240px';
      li.appendChild(img);
    }

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
  // 画像ファイルを送るので、JSON ではなく FormData（multipart/form-data）で送る。
  const data = new FormData();
  data.append('name', form.name.value.trim());
  data.append('body', form.body.value.trim());
  if (form.image.files[0]) {
    data.append('image', form.image.files[0]);
  }

  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    body: data, // Content-Type はブラウザが自動で付ける（境界付き multipart）
  });
  if (!res.ok) {
    showNote('投稿に失敗しました。');
    return;
  }
  form.reset();
  note.hidden = true;
  // 保存されたので、サーバーから取り直して最新の一覧を表示する。
  await loadMessages();
});

loadMessages();
