const form = document.getElementById('bmi-form');
const result = document.getElementById('result');
const valueEl = document.getElementById('bmi-value');
const categoryEl = document.getElementById('bmi-category');

// 日本肥満学会の区分を参考にした判定
function categorize(bmi) {
  if (bmi < 18.5) return { label: '低体重（やせ）', color: 'text-info' };
  if (bmi < 25) return { label: '普通体重', color: 'text-success' };
  if (bmi < 30) return { label: '肥満（1度）', color: 'text-warning' };
  if (bmi < 35) return { label: '肥満（2度）', color: 'text-warning' };
  if (bmi < 40) return { label: '肥満（3度）', color: 'text-danger' };
  return { label: '肥満（4度）', color: 'text-danger' };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const heightCm = Number(data.get('height'));
  const weightKg = Number(data.get('weight'));
  if (!(heightCm > 0) || !(weightKg > 0)) return;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const { label, color } = categorize(bmi);

  valueEl.textContent = bmi.toFixed(1);
  categoryEl.textContent = label;
  categoryEl.className = 'fs-5 mb-0 fw-bold ' + color;
  result.hidden = false;
});
