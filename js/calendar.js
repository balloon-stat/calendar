// js/calendar.js
import { yyyyMMddFormat, addMonths } from './storage.js';
import { state, initElements, getElements } from './state.js';
import { setupUI, renderCalendar, refreshCalendar } from './ui.js';
import { setupModal, openModal, closeModal, handleSave, toggleTimeInput } from './modal.js';

// export { refreshCalendar }

let els = null;
document.addEventListener('DOMContentLoaded', () => {
  initElements();
  els = getElements();

  setupUI();
  setupModal();

  renderCalendar();
  setupEventListeners();
});

function setupEventListeners() {
  // 月移動
  document.getElementById('prev-month').addEventListener('click', () => {
    state.currentDateStr = addMonths(state.currentDateStr, -1);
    renderCalendar();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    state.currentDateStr = addMonths(state.currentDateStr, 1);
    renderCalendar();
  });
  document.getElementById('today-btn').addEventListener('click', () => {
    state.currentDateStr = yyyyMMddFormat(new Date());
    renderCalendar();
  });

  // 終日チェック
  els.allDayCheck.addEventListener('change', () => {
    toggleTimeInput(els.allDayCheck.checked);
  });

  // 保存処理（新規追加 または 更新）
  els.saveBtn.addEventListener('click', handleSave);

  els.cancelBtn.addEventListener('click', closeModal);
  els.closeModalBtn.addEventListener('click', closeModal);

  // モーダルの外側をクリックしても閉じる
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) { closeModal(); }
  });
}

// Service Worker登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

