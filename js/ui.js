// js/ui.js
import { openModal } from "./modal.js";
import { store } from "./state.js";
import { isToday, yyyyMMddFormat } from "./storage.js";

let els = {};

export function initUI() {
	cacheElements();
	renderAll();

	store.subscribe((state, events) => {
		renderAll(state, events);
	});
}

export function getElement() {
	return els;
}

function cacheElements() {
	els = {
		calendar: document.getElementById("calendar"),
		currentMonth: document.getElementById("current-month"),
		prevMonthBtn: document.getElementById("prev-month"),
		nextMonthBtn: document.getElementById("next-month"),
		todayBtn: document.getElementById("today-btn"),
		modal: document.getElementById("modal"),
		modalDate: document.getElementById("modal-date"),
		eventsList: document.getElementById("events-list"),
		formTitle: document.getElementById("form-title"),
		eventTitle: document.getElementById("event-title"),
		allDayCheck: document.getElementById("all-day-check"),
		eventTime: document.getElementById("event-time"),
		eventMemo: document.getElementById("event-memo"),
		cancelBtn: document.getElementById("cancel-btn"),
		saveBtn: document.getElementById("save-event-btn"),
		closeModalBtn: document.getElementById("close-modal"),
		toast: document.getElementById("toast"),
		toastMsg: document.getElementById("toast-message"),
	};
}

function renderAll(state = store.state, allEvents = store.allEvents) {
	const [y, m] = state.currentDateStr.split("-").map(Number);
	els.currentMonth.textContent = `${m}月`;
	renderCalendar(y, m, els.calendar);
}

function renderCalendar(y, m, calendar) {
	calendar.innerHTML = "";

	const firstDay = new Date(y, m - 1, 1).getDay();
	const lastDate = new Date(y, m, 0).getDate();
	const prevLastDate = new Date(y, m - 2, 0).getDate();

	// 前月（クリック不可）
	for (let i = firstDay - 1; i >= 0; i--) {
		const day = prevLastDate - i;
		const prevDate = new Date(y, m - 2, day);
		const dateStr = yyyyMMddFormat(prevDate);
		calendar.appendChild(createDayElement(day, true, dateStr));
	}

	// 今月
	for (let day = 1; day <= lastDate; day++) {
		const currDate = new Date(y, m - 1, day);
		const dateStr = yyyyMMddFormat(currDate);
		const numEvents = store.getEvents(dateStr).length;
		const dayEl = createDayElement(day, false, dateStr, numEvents);
		calendar.appendChild(dayEl);
	}

	// 次月（クリック不可）
	const totalCells = Math.ceil((firstDay + lastDate) / 7) * 7;
	const remaining = totalCells - firstDay - lastDate;

	for (let day = 1; day <= remaining; day++) {
		const nextDate = new Date(y, m, day);
		const dateStr = yyyyMMddFormat(nextDate);
		calendar.appendChild(createDayElement(day, true, dateStr));
	}
}

// 日付セル作成（予定の有無も表示）
function createDayElement(day, isOtherMonth, dateStr, numEvents) {
	const dayEl = document.createElement("div");
	dayEl.classList.add("day");

	if (isOtherMonth) {
		dayEl.classList.add("other-month");
		// 何もしない（other-monthはクリック不可）
	} else {
		if (isToday(dateStr)) {
			dayEl.classList.add("today");
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
