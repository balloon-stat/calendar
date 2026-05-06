// js/modal.js
import { state, getElements } from './state.js';
import { renderCalendar, refreshCalendar } from './ui.js';
import { getEventsByDate, pushEvent, updateEvent, deleteEvent } from './storage.js';

let els = null;
export function setupModal() { els = getElements(); }

export function openModal(dateStr) {
  state.selectedDateStr = dateStr;
  els.modalDate.textContent = dateStr.replace(/-/g, '/'); // 2026/01/01 表示
  els.modal.style.display = 'flex';
  resetForm();
  renderEventsList();
}

export function closeModal() {
  els.modal.style.display = 'none';
  resetForm();
}

// フォームを新規追加モードに戻す
export function resetForm() {
  state.editingEventId = null;
  els.formTitle.textContent = '予定を追加';
  els.saveBtn.textContent = '予定を追加';
  els.eventTitle.value = '';
  els.allDayCheck.checked = false;
  els.eventMemo.value = '';
  toggleTimeInput(false);
}

// その日の予定一覧を表示
export function renderEventsList() {
  els.eventsList.innerHTML = '';
  let events = getEventsByDate(state.selectedDateStr);

  if (events.length === 0) {
    els.eventsList.innerHTML = '<p style="text-align:center; color:#888;">予定はありません</p>';
    return;
  }

  // 終日予定を先頭に、時間指定予定をその後にソート
  events = [...events].sort((a, b) => {
    if (a.isAllDay !== b.isAllDay) {
      return a.isAllDay ? -1 : 1;
    }
    if (a.isAllDay) return 0;

    const timeA = a.time || '23:59';
    const timeB = b.time || '23:59';
    return timeA.localeCompare(timeB);
  });

  events.forEach(evt => {
    const eventDiv = document.createElement('div');
    eventDiv.classList.add('event-item');

    const timeDisplay = evt.isAllDay 
      ? '<span style="color:#d32f2f; font-weight:bold;">終日</span>' 
      : (evt.time || '');

    const timeEl = document.createElement('div');
    timeEl.className = 'time';
    timeEl.innerHTML = timeDisplay;
    eventDiv.appendChild(timeEl);

    const titleEl = document.createElement('div');
    titleEl.innerHTML = `<strong>${escapeHtml(evt.title)}</strong>`;
    eventDiv.appendChild(titleEl);

    if (evt.memo) {
      const memoEl = document.createElement('div');
      memoEl.style.fontSize = '0.9rem';
      memoEl.style.color = '#555';
      memoEl.textContent = evt.memo;
      eventDiv.appendChild(memoEl);
    }
  
    const deletebtn = document.createElement('button');
    deletebtn.className = 'delete-btn';
    deletebtn.setAttribute('data-id', evt.id);
    deletebtn.innerHTML = '×';
    eventDiv.appendChild(deletebtn);

    // 予定全体をクリックで編集
    eventDiv.style.cursor = 'pointer';
    eventDiv.addEventListener('click', (e) => {
      // 削除ボタンクリック時は編集しない
      if (e.target.classList.contains('delete-btn')) return;
      startEditing(evt);
    });

    // 削除ボタン
    eventDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('この予定を削除しますか？')) {
        deleteEvent(state.selectedDateStr, evt.id);
        renderEventsList();
        renderCalendar();   // カレンダーのドットも更新
        showToast('予定を削除しました', 'success');
      }
    });

    els.eventsList.appendChild(eventDiv);
  });
}

// 編集モード開始
export function startEditing(evt) {
  state.editingEventId = evt.id;
  els.formTitle.textContent = '予定を編集';
  els.saveBtn.textContent = '更新する';
  els.eventTitle.value = evt.title || '';
  els.eventMemo.value = evt.memo || '';

  const isAllDay = !!evt.isAllDay;
  els.allDayCheck.checked = isAllDay;
  toggleTimeInput(isAllDay);
  
  if (!isAllDay) {
    els.eventTime.value = evt.time || '';
  }
}

export function toggleTimeInput(isAllDay) {
  els.eventTime.disabled = isAllDay;
  els.eventTime.classList.toggle('disabled', isAllDay);
  if (isAllDay) {
    els.eventTime.value = '';
  }
}
  
export function handleSave() {
  try {
    const title = els.eventTitle.value.trim();
    if (!title) {
      showToast('予定のタイトルを入力してください', 'error');
      els.eventTitle.focus();
      return;
    }

    if (title.length > 100) {
      showToast('タイトルは100文字以内で入力してください', 'error');
      return;
    }

    const memo = els.eventMemo.value.trim();
    if (memo.length > 100) {
      showToast('メモは100文字以内で入力してください', 'error');
      return;
    }

    const isAllDay = els.allDayCheck.checked;
    const newEvent = {
      id: null,
      date: state.selectedDateStr,
      title: title,
      isAllDay: isAllDay,
      time: isAllDay ? null : (els.eventTime.value || null),
      memo: memo
    };

    // 保存処理 更新あるいは新規追加
    if (state.editingEventId) {
      newEvent.id = state.editingEventId;
      const res = updateEvent(newEvent);
      if (!res) {
        throw new Error('対象の日付データが見つかりません');
      }
      console.log(`予定を更新しました: ${title}`);
      showToast('予定を更新しました', 'success');
    } else {
      pushEvent(newEvent);

      console.log(`予定を追加しました: ${title}`);
      showToast('予定を追加しました', 'success');
    }

    // 成功時
    resetForm();
    renderEventsList();
    renderCalendar();

  } catch (error) {
    console.error('予定の保存中にエラーが発生しました:', error);
    showToast('保存に失敗しました。ブラウザのストレージ容量を確認してください。', 'error');
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function showToast(message, type = 'success') {
  els.toastMsg.textContent = message;
  els.toast.className = `toast ${type}`;
  els.toast.classList.add('show');

  // 3秒後に自動で消える
  setTimeout(() => {
    els.toast.classList.remove('show');
  }, 3000);
}

