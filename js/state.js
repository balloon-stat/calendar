//js/state.js
import { getEventsByDate, loadFromStorage, yyyyMMddFormat } from "./storage.js";

export class Store {
	constructor() {
		this.state = {
			currentDateStr: yyyyMMddFormat(new Date()), // 表示されるカレンダーを示す日付
			selectedDateStr: null, // 現在モーダルで開いている日付
			editingEventId: null, // 編集モード時に使用
		};

		this.allEvents = {}; // { "YYYY-MM-DD": [event, ...] }
		this.listeners = new Set(); // 簡易Pub/Sub
	}

	init() {
		this.allEvents = loadFromStorage();
		this.notify();
	}

	setCurrentDate(dateStr) {
		if (dateStr) {
			this.state.currentDateStr = dateStr;
		} else {
			this.state.currentDateStr = yyyyMMddFormat(new Date());
		}
		this.notify();
	}

	moveCurrentDate(deltaMonth) {
		const [y, m] = this.state.currentDateStr.split("-").map(Number);
		const d = new Date(y, m - 1 + deltaMonth, 1);
		this.state.currentDateStr = yyyyMMddFormat(d);
		this.notify();
	}

	setSelectedDate(dateStr) {
		this.state.selectedDateStr = dateStr;
		this.notify();
	}

	getEvents(dateStr) {
		return getEventsByDate(this.allEvents, dateStr);
	}
	getSelectedDateEvents() {
		return getEventsByDate(this.allEvents, this.state.selectedDateStr);
	}

	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	notify() {
		this.listeners.forEach((listener) => {
			listener(this.state, this.allEvents);
		});
	}
}

// シングルトンとしてexport
export const store = new Store();

/////////////////////////////////////////////////////////////////////

let holidays = new Set(); // "YYYY-MM-DD" 形式で格納

export async function loadHolidays(year) {
  const cacheKey = `holidays-${year}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const data = JSON.parse(cached);
    const hasYear = [...holidays].some(date => date.startsWith(`${year}-`));
    if (hasYear) {
      console.log(`${year}年の祝日は既にロード済み`);
      return;
    }
    data.forEach(holiday => {
      holidays.add(holiday.date); // "2026-01-01" 形式
    });
    console.log(`${year}年の祝日をキャッシュから ${holidays.size}件 ロードしました`);
    return;
  }

  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/JP`);
    if (!res.ok) throw new Error('祝日取得失敗');
    
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    
    data.forEach(holiday => {
      holidays.add(holiday.date); // "2026-01-01" 形式
    });
    
    console.log(`${year}年の祝日を ${holidays.size}件 ロードしました`);
  } catch (err) {
    console.error('祝日ロードエラー:', err);
  }
}

export function isHoliday(dateStr) {
  return holidays.has(dateStr);
}

