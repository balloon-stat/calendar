// js/modal.js
import { store } from "./state.js";
import { deleteEvent, pushEvent, updateEvent } from "./storage.js";
import { showToast } from "./toast.js";

let els = null;

export function initModal(elements) {
	els = elements;
}

export function openModal(dateStr) {
	store.state.selectedDateStr = dateStr;
	els.modalDate.textContent = dateStr.replace(/-/g, "/"); // 2026/01/01 表示
	els.modal.style.display = "flex";
	resetForm();
	renderEventsList();
}

export function closeModal() {
	els.modal.style.display = "none";
	resetForm();
}

// フォームを新規追加モードに戻す
export function resetForm() {
	store.state.editingEventId = null;
	els.formTitle.textContent = "予定を追加";
	els.saveBtn.textContent = "予定を追加";
	els.eventTitle.value = "";
	els.allDayCheck.checked = false;
	els.eventTime.value = "";
	els.eventMemo.value = "";
	toggleTimeInput(false);
}

// その日の予定一覧を表示
export function renderEventsList() {
	els.eventsList.innerHTML = "";
	const events = store.getSelectedDateEvents();

	if (events.length === 0) {
		els.eventsList.innerHTML =
			'<p style="text-align:center; color:#888;">予定はありません</p>';
		return;
	}

	events.forEach((evt) => {
		const eventDiv = document.createElement("div");
		eventDiv.classList.add("event-item");

		const timeDisplay = evt.isAllDay
			? '<span style="color:#d32f2f; font-weight:bold;">終日</span>'
			: evt.time || "";

		const timeEl = document.createElement("div");
		timeEl.className = "time";
		timeEl.innerHTML = timeDisplay;
		eventDiv.appendChild(timeEl);

		const titleEl = document.createElement("div");
		const strong = document.createElement("strong");
		strong.textContent = evt.title;
		titleEl.appendChild(strong);
		eventDiv.appendChild(titleEl);

		if (evt.memo) {
			const memoEl = document.createElement("div");
			memoEl.style.fontSize = "0.9rem";
			memoEl.style.color = "#555";
			memoEl.textContent = evt.memo;
			eventDiv.appendChild(memoEl);
		}

		const deletebtn = document.createElement("button");
		deletebtn.className = "delete-btn";
		deletebtn.setAttribute("data-id", evt.id);
		deletebtn.innerHTML = "×";
		eventDiv.appendChild(deletebtn);

		// 予定全体をクリックで編集
		eventDiv.style.cursor = "pointer";
		eventDiv.addEventListener("click", (e) => {
			// 削除ボタンクリック時は編集しない
			if (e.target.classList.contains("delete-btn")) return;
			startEditing(evt);
		});

		// 削除ボタン
		eventDiv.querySelector(".delete-btn").addEventListener("click", (e) => {
			e.stopPropagation();
			if (confirm("この予定を削除しますか？")) {
				deleteEvent(store.allEvents, store.state.selectedDateStr, evt.id);
				resetForm();
				renderEventsList();
				store.notify(); // カレンダーのドットも更新
				showToast("予定を削除しました", "success");
			}
		});

		els.eventsList.appendChild(eventDiv);
	});
}

// 編集モード開始
export function startEditing(evt) {
	store.state.editingEventId = evt.id;
	els.formTitle.textContent = "予定を編集";
	els.saveBtn.textContent = "更新する";
	els.eventTitle.value = evt.title || "";
	els.eventMemo.value = evt.memo || "";

	const isAllDay = !!evt.isAllDay;
	els.allDayCheck.checked = isAllDay;
	toggleTimeInput(isAllDay);

	if (!isAllDay) {
		els.eventTime.value = evt.time || "";
	}
}

export function toggleTimeInput(isAllDay) {
	els.eventTime.classList.toggle("disabled", isAllDay);
	if (isAllDay) {
		els.eventTime.value = "";
	}
}

export function handleSave() {
	try {
		const title = els.eventTitle.value.trim();
		if (!title) {
			showToast("予定のタイトルを入力してください", "error");
			els.eventTitle.focus();
			return;
		}

		if (title.length > 100) {
			showToast("タイトルは100文字以内で入力してください", "error");
			return;
		}

		const memo = els.eventMemo.value.trim();
		if (memo.length > 100) {
			showToast("メモは100文字以内で入力してください", "error");
			return;
		}

		const isAllDay = els.allDayCheck.checked;
		const newEvent = {
			id: null,
			date: store.state.selectedDateStr,
			title: title,
			isAllDay: isAllDay,
			time: isAllDay ? null : els.eventTime.value || null,
			memo: memo,
		};

		// 保存処理 更新あるいは新規追加
		if (store.state.editingEventId) {
			newEvent.id = store.state.editingEventId;
			const res = updateEvent(store.allEvents, newEvent);
			if (!res) {
				throw new Error("対象の日付データが見つかりません");
			}
			console.log(`予定を更新しました: ${title}`);
			showToast("予定を更新しました", "success");
		} else {
			pushEvent(store.allEvents, newEvent);

			console.log(`予定を追加しました: ${title}`);
			showToast("予定を追加しました", "success");
		}

		// 成功時
		resetForm();
		renderEventsList();
		store.notify();
	} catch (error) {
		console.error("予定の保存中にエラーが発生しました:", error);
		showToast(
			"保存に失敗しました。ブラウザのストレージ容量を確認してください。",
			"error",
		);
	}
}
