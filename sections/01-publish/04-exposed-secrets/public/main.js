// ⚠️ これは「やってはいけない例」のデモです。まねしないでください。
//
// 顧客の個人情報をこの JavaScript ファイルの中に直接書いています。
// 画面（表）にはマスクした形でしか表示していませんが、この main.js は
// ブラウザにそのまま送られているので、F12（開発者ツール）を開けば
// 下の customers の中身は誰でも丸ごと読めてしまいます。
//
// ↓ ためしにコンソールで  customers  と打ってみてください。全部出ます。

const customers = [
  {
    id: 1,
    name: '山田 太郎',
    email: 'taro.yamada@example.com',
    phone: '090-1234-5678',
    birthday: '1988-04-02',
    address: '東京都新宿区西新宿0-0-0',
    note: 'VIP会員。前回の問い合わせでクレーム対応中。取り扱い注意。',
  },
  {
    id: 2,
    name: '佐藤 花子',
    email: 'hanako.sato@example.com',
    phone: '080-2345-6789',
    birthday: '1995-11-23',
    address: '大阪府大阪市北区梅田0-0-0',
    note: '支払い遅延あり。督促メモ参照。',
  },
  {
    id: 3,
    name: '鈴木 一郎',
    email: 'ichiro.suzuki@example.com',
    phone: '070-3456-7890',
    birthday: '1979-06-15',
    address: '愛知県名古屋市中区栄0-0-0',
    note: '社長の紹介。特別対応枠。',
  },
  {
    id: 4,
    name: '高橋 美咲',
    email: 'misaki.takahashi@example.com',
    phone: '090-4567-8901',
    birthday: '2001-02-28',
    address: '福岡県福岡市博多区博多駅前0-0-0',
    note: '未成年時に契約。保護者連絡先あり。',
  },
];

// 画面には「マスクした」情報だけを出す……つもりのコード。
// でも上の customers は素のままブラウザに届いているので、隠せてはいない。
function maskEmail(email) {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 1)}●●●@${domain}`;
}

function maskPhone(phone) {
  return phone.replace(/\d(?=\d{2})/g, '●');
}

function render() {
  const tbody = document.getElementById('member-rows');
  tbody.innerHTML = customers
    .map(
      (c) => `
        <tr>
          <td>${c.id}</td>
          <td>${c.name}</td>
          <td class="text-secondary">${maskEmail(c.email)}</td>
          <td class="text-secondary">${maskPhone(c.phone)}</td>
        </tr>`,
    )
    .join('');
}

render();
