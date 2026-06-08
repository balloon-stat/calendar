// js/ui.js
import { openModal } from "./modal.js";
import { store, isHoliday } from "./state.js";
import { isToday, yyyyMMddFormat } from "./storage.js";

export const domCache = new Proxy(
	{},
	{
		get(target, prop) {
			if (!(prop in target)) {
				const id = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
				target[prop] = document.getElementById(id);
			}
			return target[prop];
		},
	},
);

export function initUI() {
	renderAll();

	store.subscribe((state, events) => {
		renderAll(state, events);
	});
}

function renderAll(state = store.state) {
	const [y, m] = state.currentDateStr.split("-").map(Number).map(String);
	domCache.currentMonth.textContent = `${y}年${m.padStart(2, " ")}月`;
	renderCalendar(y, m, domCache.calendar);
}

function renderCalendar(y, m, calendar) {
	calendar.innerHTML = "";

	const firstDay = new Date(y, m - 1, 1).getDay();
	const lastDate = new Date(y, m, 0).getDate();
	const prevLastDate = new Date(y, m - 2, 0).getDate();

	// 前月（クリック不可）
	for (let i = firstDay - 1; i >= 0; i--) {
		const day = prevLastDate - i;
		const date = new Date(y, m - 2, day);
		calendar.appendChild(createDayElement(day, true, date));
	}

	// 今月
	for (let day = 1; day <= lastDate; day++) {
		const currDate = new Date(y, m - 1, day);
		const dateStr = yyyyMMddFormat(currDate);
		const numEvents = store.getEvents(dateStr).length;
		const dayEl = createDayElement(day, false, currDate, numEvents);
		calendar.appendChild(dayEl);
	}

	// 次月（クリック不可）
	const totalCells = Math.ceil((firstDay + lastDate) / 7) * 7;
	const remaining = totalCells - firstDay - lastDate;

	for (let day = 1; day <= remaining; day++) {
		const date = new Date(y, m, day);
		calendar.appendChild(createDayElement(day, true, date));
	}
}

// 日付セル作成（予定の有無も表示）
function createDayElement(day, isOtherMonth, date, numEvents) {
  const dateStr = yyyyMMddFormat(date);
  const dayOfWeek = date.getDay();
	const dayEl = document.createElement("div");
	dayEl.classList.add("day");

	if (isOtherMonth) {
		dayEl.classList.add("other-month");
		// 何もしない（other-monthはクリック不可）
	} else {
		if (isToday(dateStr)) {
			dayEl.classList.add("today");
		}
    if (isHoliday(dateStr)) {
      dayEl.classList.add('holiday');
    } else if (dayOfWeek === 0) {
      dayEl.classList.add('sunday');
    } else if (dayOfWeek === 6) {
      dayEl.classList.add('saturday');
    }
    
		drawDots(numEvents, dayEl);
		dayEl.addEventListener("click", () => {
			openModal(dateStr);
		});
	}

	const numberEl = document.createElement("div");
	numberEl.classList.add("day-number");
	numberEl.textContent = day;
	dayEl.appendChild(numberEl);

	return dayEl;
}

function drawDots(numEvents, dayEl) {
	const dotContainer = document.createElement("div");
	dotContainer.classList.add("event-dots");

	// 青いドットを最大3つ表示
	for (let i = 0; i < Math.min(3, numEvents); i++) {
		const dot = document.createElement("span");
		dot.classList.add("event-dot");
		dotContainer.appendChild(dot);
	}
	dayEl.appendChild(dotContainer);
}

