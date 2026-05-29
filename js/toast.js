
let els = null;

export function initToast(elements) {
  els = elements;
}

export function showToast(message, type = 'success') {
  els.toastMsg.textContent = message;
  els.toast.className = `toast ${type}`;
  els.toast.classList.add('show');

  // 3秒後に自動で消える
  setTimeout(() => {
    els.toast.classList.remove('show');
  }, 3000);
}
