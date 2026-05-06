// js/storage.js

/**
 * @typedef {Object} CalendarEvent
 * @property {string} id 一意のID (evt-タイムスタンプ)
 * @property {string} date 日付 (YYYY-MM-DD)
 * @property {string} title タイトル
 * @property {boolean} isAllDay 終日フラグ
 * @property {string|null} time 時間 (HH:mm)
 * @property {string} memo メモ
 */

/**
 * 日付文字列 (YYYY-MM-DD)
 * @typedef {string} DateString
 */

/**
 * @typedef {Object<DateString, CalendarEvent[]>} CalendarAllEvents
 */

const STORAGE_KEY = 'schedule-events';

let allEvents = null;

/**
 * LocalStorageからすべての予定を取得
 * @returns {CalendarAllEvents}
 */
export function getAllEvents() {
  if (!allEvents) {
    const data = localStorage.getItem(STORAGE_KEY);
    allEvents = data ? JSON.parse(data) : {};
  }
  return allEvents;
}

export function saveAllEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allEvents));
}

/**
 * 指定した日付の予定を取得
 * @param {DateString} dateStr
 * @returns {CalendarEvent[]}
 */
export function getEventsByDate(dateStr) {
  if (!allEvents) allEvents = getAllEvents();
  return allEvents[dateStr] || [];
}

/**
 * Dateオブジェクトを YYYY-MM-DD 形式に変換
 * @param {Date} date
 * @returns {DateString}
 */
export function yyyyMMddFormat(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 予定を新規追加保存
 * @param {Omit<CalendarEvent, 'id'>} evt 
 */
export function pushEvent(evt) {
  if (evt.id) {
    throw new Error('saveEvent: evt に id が存在する');
  }

  if (!allEvents) allEvents = getAllEvents();

  const dateStr = evt.date;
  if (!allEvents[dateStr]) {
    allEvents[dateStr] = [];
  }

  const e = {...evt};
  e.id = 'evt-' + Date.now();
  allEvents[dateStr].push(e);

  saveAllEvents();
}

/**
 * 予定を書き換えて保存
 * @param {CalendarEvent} evt
 * @returns {boolean} 成功したかどうか
 */
export function updateEvent(evt) {
  if (!allEvents) allEvents = getAllEvents();
  const dateStr = evt.date;
  if (!allEvents[dateStr]) return false;

  const events = allEvents[dateStr];
  const idx = events.findIndex(e => e.id === evt.id);

  if (idx === -1) return false;

  events[idx] = { ...evt };
  saveAllEvents();
  return true;
}

/**
 * 予定を削除
 * @param {DateString} dateStr
 * @param {string} eventId
 * @returns {boolean} 成功したかどうか
 */
export function deleteEvent(dateStr, eventId) {
  if (!allEvents) allEvents = getAllEvents();
  if (!allEvents[dateStr]) return false;

  allEvents[dateStr] = allEvents[dateStr].filter(evt => evt.id !== eventId);

  // 予定が0件になった日はキー自体を削除
  if (allEvents[dateStr].length === 0) {
    delete allEvents[dateStr];
  }

  saveAllEvents();
  return true;
}

// すべてのデータをクリア（デバッグ用）
export function clearAllEvents() {
  localStorage.removeItem(STORAGE_KEY);
}

export function addMonths(dateStr, months) {
  const [y, m] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return yyyyMMddFormat(d);
}

export function isToday(dateStr) {
  return dateStr === yyyyMMddFormat(new Date());
}

