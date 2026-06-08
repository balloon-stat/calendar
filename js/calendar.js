// js/calendar.js
import { closeModal, handleSave, initModal, toggleTimeInput } from "./modal.js";
import { store, loadHolidays } from "./state.js";
import { initToast } from "./toast.js";
import { domCache, initUI } from "./ui.js";

const currentYear = new Date().getFullYear();
await loadHolidays(currentYear);
await loadHolidays(currentYear + 1);

document.addEventListener("DOMContentLoaded", () => {
	store.init();
	initUI();
	initModal(domCache);
	initToast(domCache);
	setupEventListeners(domCache);
});

function setupEventListeners(els) {
	// 月移動
	els.prevMonthBtn.addEventListener("click", () => {
		store.moveCurrentDate(-1);
	});
	els.nextMonthBtn.addEventListener("click", () => {
		store.moveCurrentDate(1);
	});
	els.todayBtn.addEventListener("click", () => {
		store.setCurrentDate();
	});

	// 終日チェック
	els.allDayCheck.addEventListener("change", () => {
		toggleTimeInput(els.allDayCheck.checked);
	});

	// 保存処理（新規追加 または 更新）
	els.saveBtn.addEventListener("click", handleSave);
	els.closeBtn.addEventListener("click", closeModal);
	els.closeModalBtn.addEventListener("click", closeModal);

	// モーダルの外側をクリックしても閉じる
	els.modal.addEventListener("click", (e) => {
		if (e.target === els.modal) {
			closeModal();
		}
	});
}

// Service Worker登録
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js")
			.then((registration) => {
				console.log(
					"Service Worker registered with scope:",
					registration.scope,
				);
			})
			.catch((error) => {
				console.error("Service Worker registration failed:", error);
			});
	});
}
