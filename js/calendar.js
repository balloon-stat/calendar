// js/calendar.js
import { closeModal, handleSave, initModal, toggleTimeInput } from "./modal.js";
import { store, loadHolidays } from "./state.js";
import { initToast, showToast } from "./toast.js";
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

	// コピー・ペーストボタン
	els.copyBtn.addEventListener("click", async () => {
    const data = store.allEvents || {};
    if (Object.keys(data).length === 0) {
        console.error("no Calender data");
        showToast("カレンダーのデータはありません", "error");
        return;
    }
    const text = JSON.stringify(data);
    try {
        await navigator.clipboard.writeText(text);
        console.log("Calender data is copied to Clipboard");
        showToast("カレンダーのデータをコピーしました");
    } catch (err) {
        console.error("Clipboard error:", err);
        showToast("コピーに失敗しました（HTTPSまたはPWAで試してください）", "error");
    }
	});
	els.pasteBtn.addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        const result = validateCalendarData(text);
        if (!result.valid) {
            console.error(result.message);
            showToast(result.message, "error");
            return;
        }
        store.setAllEvents(result.data);
        console.log("Calender data is read from Clipboard");
        showToast("カレンダーのデータを読み込みました");
    } catch (err) {
        console.error("Paste error:", err);
        showToast("ペーストに失敗しました", "error");
    }
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
function validateCalendarData(text) {
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    return {
      valid: false,
      message: "JSONの形式が正しくありません"
    };
  }

  // ルートオブジェクト確認
  if (typeof data !== "object" || data === null) {
    return {
      valid: false,
      message: "オブジェクト形式ではありません"
    };
  }

  // 各イベント確認
  for (const [dateStr, events] of Object.entries(data)) {
    if (!Array.isArray(events) || events === null) {
      return {
        valid: false,
        message: `${dateStr}のイベント配列がありません`
      };
    }

    if (typeof events[0].id !== "string") {
      return {
        valid: false,
        message: `${dateStr}の最初のイベントにIDがありません`
      };
    }

    if (typeof events[0].title !== "string") {
      return {
        valid: false,
        message: `${dateStr}の最初のイベントにtitleがありません`
      };
    }
  }

  return {
    valid: true,
    data
  };
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
