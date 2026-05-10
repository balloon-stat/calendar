// js/ui.js
import { state, getElements } from './state.js';
import { getEventsByDate, yyyyMMddFormat, isToday } from './storage.js';
import { openModal } from './modal.js';

let els = null;
export function setupUI() { els = getElements(); }

export function renderCalendar() {
  els.calendar.innerHTML = '';
  const [y, m] = state.currentDateStr.split('-').map(Number);

  els.currentMonth.textContent = `${y}年${m}月`;

  const firstDay = new Date(y, m - 1, 1).getDay();
  const lastDate = new Date(y, m, 0).getDate();
  const prevLastDate = new Date(y, m - 2, 0).getDate();

  // 前月（クリック不可）
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevLastDate - i;
    const prevDate = new Date(y, m - 2, day);
    const dateStr = yyyyMMddFormat(prevDate);
    els.calendar.appendChild(createDayElement(day, true, dateStr));
  }

  // 今月
  for (let day = 1; day <= lastDate; day++) {
    const currDate = new Date(y, m - 1, day);
    const dateStr = yyyyMMddFormat(currDate);
    const numEvents = getEventsByDate(dateStr).length;
    const dayEl = createDayElement(day, false, dateStr, numEvents);
    els.calendar.appendChild(dayEl);
  }

  // 次月（クリック不可）
  const totalCells = Math.ceil((firstDay + lastDate) / 7) * 7;
  const remaining = totalCells - firstDay - lastDate;

  for (let day = 1; day <= remaining; day++) {
    const nextDate = new Date(y, m, day);
    const dateStr = yyyyMMddFormat(nextDate);
    els.calendar.appendChild(createDayElement(day, true, dateStr));
  }
}

// 日付セル作成（予定の有無も表示）
function createDayElement(day, isOtherMonth, dateStr, numEvents) {
  const dayEl = document.createElement('div');
  dayEl.classList.add('day');

  if (isOtherMonth) {
    dayEl.classList.add('other-month');
    // 何もしない（other-monthはクリック不可）
  } else {
    if (isToday(dateStr)) { dayEl.classList.add('today'); }

    drawDots(numEvents, dayEl);
    dayEl.addEventListener('click', () => { openModal(dateStr); });
  }

  const numberEl = document.createElement('div');
  numberEl.classList.add('day-number');
  numberEl.textContent = day;
  dayEl.appendChild(numberEl);

  return dayEl;
}

function drawDots(numEvents, dayEl) {
  const dotContainer = document.createElement('div');
  dotContainer.classList.add('event-dots');

  // 青いドットを最大3つ表示
  for (let i = 0; i < Math.min(3, numEvents); i++) {
    const dot = document.createElement('span');
    dot.classList.add('event-dot');
    dotContainer.appendChild(dot);
  }
  dayEl.appendChild(dotContainer);
}

export function refreshCalendar() {
  renderCalendar();
}
