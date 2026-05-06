//js/state.js
import { yyyyMMddFormat } from './storage.js';

export const state = {
   currentDateStr: yyyyMMddFormat(new Date()), // 表示されるカレンダーを示す日付
   selectedDateStr: null,   // 現在モーダルで開いている日付
   editingEventId: null     // 編集モード時に使用
};

let elements = null;

export function initElements() {
  elements = {
    calendar: document.getElementById('calendar'),
    currentMonth: document.getElementById('current-month'),
    modal: document.getElementById('modal'),
    modalDate: document.getElementById('modal-date'),
    eventsList: document.getElementById('events-list'),
    formTitle: document.getElementById('form-title'),
    eventTitle: document.getElementById('event-title'),
    allDayCheck: document.getElementById('all-day-check'),
    eventTime: document.getElementById('event-time'),
    eventMemo: document.getElementById('event-memo'),
    saveBtn: document.getElementById('save-event-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    closeModalBtn: document.getElementById('close-modal'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-message')
  };
}

export function getElements() {
  if (!elements) {
    throw new Error('DOMが初期化されていません');
  }
  return elements;
}

