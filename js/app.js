/**
 * 🚽 EKIBEL - Z alternatywnymi powiadomieniami dla Safari
 */

let toilets = {};
let currentUser = null;
let previousState = null;
let swRegistration = null;
let notificationsEnabled = false;
let alertSound = null;

// ===== ALTERNATIVE NOTIFICATIONS (Safari/iOS) =====
function initAlertSound() {
    // Krótki dźwięk alertu
    alertSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleBoAHIjeli4dBid9sOW5azMsVIy32bN5OBAfYKnpxH1FHRJLhcjWuYJOFAM1c7/lp3sqDwpAnM/bm2wnDABRqujJfiMIADiKzseoawsHJ3W/5KhxIAcGPpbZyogyAwEjf73bm1sQABRusMSZXBwCDmmx0qVrDQAOZKvMomUfBhFnrsmibxEADxFmrcaecRsCD2GnvpRqHQMSZ6jAloYeCgBfocKZeisLAFylx5d4');
    alertSound.volume = 0.5;
}

function playAlertSound() {
    if (alertSound && notificationsEnabled) {
        alertSound.currentTime = 0;
        alertSound.play().catch(() => { });
    }
}

// Wibracja (działa na niektórych urządzeniach mobilnych)
function vibrate() {
    if ('vibrate' in navigator && notificationsEnabled) {
        navigator.vibrate([200, 100, 200]);
    }
}

// Baner powiadomienia w aplikacji
function showInAppNotification(title, body, type = 'info') {
    // Usuń stary baner
    const existing = document.querySelector('.in-app-notification');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = `in-app-notification ${type}`;
    banner.innerHTML = `
        <div class="notif-content">
            <strong>${title}</strong>
            <span>${body}</span>
        </div>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(banner);

    // Dźwięk i wibracja
    playAlertSound();
    vibrate();

    // Zmień tytuł strony
    const originalTitle = document.title;
    document.title = `🔔 ${title}`;

    // Auto-ukryj po 8 sekundach
    setTimeout(() => {
        banner.classList.add('hiding');
        setTimeout(() => {
            banner.remove();
            document.title = originalTitle;
        }, 300);
    }, 8000);
}

// ===== SERVICE WORKER =====
async function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('/sw.js');
            return true;
        } catch (error) {
            console.log('SW:', error);
            return false;
        }
    }
    return false;
}

// ===== NOTIFICATIONS =====
function supportsNativeNotifications() {
    return 'Notification' in window && Notification.permission !== 'denied';
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        // Safari/iOS - użyj alternatywnych powiadomień
        return true; // Zawsze "granted" bo używamy in-app notifications
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        showToast('⚠️ Użyję powiadomień w aplikacji');
        return true; // Fallback do in-app
    }

    const permission = await Notification.requestPermission();
    return true; // Zawsze true bo mamy fallback
}

async function toggleNotifications() {
    if (notificationsEnabled) {
        notificationsEnabled = false;
        localStorage.setItem('ekibel_notifications', 'false');
        showToast('🔕 Powiadomienia wyłączone');
    } else {
        await requestNotificationPermission();
        notificationsEnabled = true;
        localStorage.setItem('ekibel_notifications', 'true');
        showToast('🔔 Powiadomienia włączone!');

        // Testowe powiadomienie
        sendNotification('✅ Powiadomienia aktywne!', 'Otrzymasz alert gdy nadejdzie Twoja kolej.', 'success');
    }
    updateNotificationButton();
}

function updateNotificationButton() {
    const btn = document.getElementById('notif-btn');
    if (btn) {
        if (notificationsEnabled) {
            btn.textContent = '🔔';
            btn.classList.add('active');
            btn.title = 'Powiadomienia włączone';
        } else {
            btn.textContent = '🔕';
            btn.classList.remove('active');
            btn.title = 'Włącz powiadomienia';
        }
    }
}

function sendNotification(title, body, type = 'info') {
    if (!notificationsEnabled) return;

    // Zawsze graj dźwięk i wibruj
    playAlertSound();
    vibrate();

    // Próbuj natywne powiadomienie przez Service Worker
    if (swRegistration && swRegistration.active) {
        swRegistration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: title,
            body: body,
            icon: '🚽'
        });
    }

    // Próbuj też przez Notification API bezpośrednio
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚽</text></svg>',
                tag: 'ekibel-' + Date.now(),
                requireInteraction: true
            });
        } catch (e) {
            // Ignore - mobile może nie wspierać
        }
    }

    // Zawsze pokaż też baner w aplikacji
    showInAppNotification(title, body, type);
}

function checkForChanges(newData) {
    if (!currentUser || !previousState || !notificationsEnabled) return;

    for (const [id, data] of Object.entries(newData)) {
        const prev = previousState[id];
        if (!prev) continue;

        const prevQueue = prev.queue || [];
        const newQueue = data.queue || [];

        const wasInQueue = prevQueue.includes(currentUser);
        const isInQueue = newQueue.includes(currentUser);
        const prevPos = prevQueue.indexOf(currentUser);
        const newPos = newQueue.indexOf(currentUser);

        if (wasInQueue && isInQueue) {
            if (prevPos > 0 && newPos === 0) {
                sendNotification('🎉 Twoja kolej!', `${data.name} - Jesteś pierwszy!`, 'success');
            } else if (newPos < prevPos && newPos > 0) {
                sendNotification('⬆️ Awans w kolejce!', `${data.name} - Pozycja ${newPos + 1}`, 'info');
            }
        }

        if (isInQueue && newPos === 0 && prev.occupiedBy && !data.occupiedBy) {
            sendNotification('🚀 TOALETA WOLNA!', `${data.name} - Wchodź teraz!`, 'success');
        }
    }
}

// ===== USER SELECTION =====
function initUserSelection() {
    const modal = document.getElementById('user-modal');
    const userList = document.getElementById('user-list');
    const searchInput = document.getElementById('user-search-input');

    const saved = localStorage.getItem('ekibel_user');
    if (saved) {
        currentUser = saved;
        modal.style.display = 'none';
        updateCurrentUserDisplay();
        return;
    }

    modal.style.display = 'flex';

    function renderUsers(filter = '') {
        const filtered = EMPLOYEES.filter(name =>
            name.toLowerCase().includes(filter.toLowerCase())
        );
        userList.innerHTML = filtered.map(name => `
            <button class="user-btn" onclick="selectUser('${escapeHtml(name)}')">${name}</button>
        `).join('');
    }

    renderUsers();
    searchInput.addEventListener('input', (e) => renderUsers(e.target.value));
    searchInput.focus();
}

function selectUser(name) {
    currentUser = name;
    localStorage.setItem('ekibel_user', name);
    document.getElementById('user-modal').style.display = 'none';
    updateCurrentUserDisplay();
    showToast(`👋 Cześć, ${name}!`);
}

function updateCurrentUserDisplay() {
    const el = document.getElementById('current-user');
    if (el && currentUser) {
        el.innerHTML = `<span onclick="changeUser()" style="cursor:pointer">👤 ${escapeHtml(currentUser)} <small style="opacity:0.6">(zmień)</small></span>`;
    }
}

function changeUser() {
    localStorage.removeItem('ekibel_user');
    location.reload();
}

// ===== API =====
async function api(action, data = {}) {
    const formData = new FormData();
    formData.append('action', action);
    for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
    }

    try {
        const response = await fetch('api/toilets.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success && result.data) {
            checkForChanges(result.data);
            previousState = JSON.parse(JSON.stringify(toilets));
            toilets = result.data;
            renderAll();
            updateStats();
        } else if (result.message) {
            showToast('❌ ' + result.message);
        }
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false };
    }
}

// ===== TOAST =====
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== STATS =====
function updateStats() {
    let free = 0, occupied = 0, queue = 0;
    for (const data of Object.values(toilets)) {
        if (data.occupiedBy) occupied++;
        else free++;
        queue += data.queue.length;
    }
    document.getElementById('stat-free').textContent = free;
    document.getElementById('stat-occupied').textContent = occupied;
    document.getElementById('stat-queue').textContent = queue;
}

// ===== HELPERS =====
function getMyStatus() {
    for (const [id, data] of Object.entries(toilets)) {
        if (data.occupiedBy === currentUser) return { status: 'in_toilet', toiletId: id };
        const idx = data.queue.indexOf(currentUser);
        if (idx >= 0) return { status: 'in_queue', toiletId: id, position: idx };
    }
    return { status: 'free' };
}

// ===== ACTIONS =====
function quickAdd(id) {
    if (!currentUser) {
        showToast('❌ Najpierw wybierz swoje imię!');
        return;
    }

    const myStatus = getMyStatus();
    if (myStatus.status === 'in_toilet') {
        showToast('⚠️ Najpierw wyjdź z toalety!');
        return;
    }
    if (myStatus.status === 'in_queue') {
        showToast('⚠️ Już jesteś w kolejce!');
        return;
    }

    api('addToQueue', { id, name: currentUser });
    showToast(`✅ Dodano do kolejki`);
}

function removeFromQueue(id, index) {
    const data = toilets[id];
    if (data && data.queue[index] === currentUser) {
        api('removeFromQueue', { id, index });
        showToast('👋 Usunięto z kolejki');
    } else {
        showToast('❌ Możesz usunąć tylko siebie!');
    }
}

function enterToilet(id) {
    const data = toilets[id];
    if (data && data.queue[0] === currentUser) {
        api('enter', { id });
        showToast('🚪 Wchodzisz...');
    } else {
        showToast('❌ To nie Twoja kolej!');
    }
}

function leaveToilet(id) {
    const data = toilets[id];
    if (data && data.occupiedBy === currentUser) {
        api('leave', { id });
        showToast('👋 Do zobaczenia!');
    } else {
        showToast('❌ Nie jesteś w tej toalecie!');
    }
}

function toggleWater(id) {
    const data = toilets[id];
    if (data && data.occupiedBy === currentUser) {
        api('toggleWater', { id });
    } else {
        showToast('❌ Tylko osoba w toalecie może zmieniać wodę!');
    }
}

// ===== MUSIC =====
function initMusicPlayer() {
    const btn = document.getElementById('music-btn');
    const audio = document.getElementById('relaxing-music');
    if (!btn || !audio) return;

    let isPlaying = false;
    btn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            btn.textContent = '🎵';
        } else {
            audio.play().then(() => btn.textContent = '⏸️').catch(() => { });
        }
        isPlaying = !isPlaying;
    });
    audio.volume = 0.3;
}

// ===== RENDERING =====
function renderAll() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const myStatus = getMyStatus();

    for (const [id, data] of Object.entries(toilets)) {
        const isOccupied = data.occupiedBy !== null;
        const isMe = data.occupiedBy === currentUser;
        const imFirst = data.queue[0] === currentUser;
        const imInQueue = data.queue.includes(currentUser);

        let queueHtml = data.queue.length === 0
            ? '<li class="empty-msg">Kolejka pusta</li>'
            : '';
        data.queue.forEach((p, i) => {
            const isFirst = i === 0;
            const canRemove = p === currentUser;
            queueHtml += `<li class="queue-item${isFirst ? ' first' : ''}${p === currentUser ? ' me' : ''}">
                <span>${isFirst ? '👑 ' : ''}${i + 1}. ${escapeHtml(p)}${p === currentUser ? ' (Ty)' : ''}</span>
                ${canRemove ? `<button class="btn-del" onclick="removeFromQueue('${id}', ${i})">✕</button>` : ''}
            </li>`;
        });

        let mainBtn = '';
        if (isMe) {
            mainBtn = `<button class="btn-main btn-leave" onclick="leaveToilet('${id}')">🚪 Wychodzę</button>`;
        } else if (imFirst && !isOccupied) {
            mainBtn = `<button class="btn-main btn-enter" onclick="enterToilet('${id}')">✨ Wchodzę</button>`;
        } else if (imInQueue) {
            const myPos = data.queue.indexOf(currentUser) + 1;
            mainBtn = `<div class="info-msg">⏳ Jesteś ${myPos}. w kolejce</div>`;
        } else if (myStatus.status === 'free') {
            mainBtn = `<button class="btn-main btn-quick" onclick="quickAdd('${id}')">⚡ Dopisz mnie</button>`;
        } else {
            mainBtn = `<div class="info-msg muted">Jesteś w innej kolejce</div>`;
        }

        const waterHtml = isMe
            ? `<div class="water-toggle ${data.warmWater ? 'water-hot' : 'water-cold'}" onclick="toggleWater('${id}')">${data.warmWater ? '🔥 Ciepła' : '❄️ Zimna'}</div>`
            : `<div class="water-info ${data.warmWater ? 'water-hot' : 'water-cold'}">${data.warmWater ? '🔥 Ciepła' : '❄️ Zimna'}</div>`;

        const cardHtml = `
        <div class="toilet-card${isMe ? ' my-toilet' : ''}${imInQueue ? ' my-queue' : ''}">
            <div class="card-header"><span>${data.name}</span></div>
            <div class="card-body">
                <div class="status-box ${isOccupied ? 'status-occupied' : 'status-free'}">${isOccupied ? '🔴 ZAJĘTE' : '🟢 WOLNE'}</div>
                <div class="info-row">
                    ${waterHtml}
                    <div>${isOccupied ? `👤 <b>${escapeHtml(data.occupiedBy)}</b>${isMe ? ' (Ty)' : ''}` : '<span class="muted">Pusto</span>'}</div>
                </div>
                <div class="queue-section">
                    <div class="section-title">Kolejka (${data.queue.length})</div>
                    <ul class="queue-list">${queueHtml}</ul>
                </div>
                <div class="action-area">${mainBtn}</div>
            </div>
        </div>`;
        app.insertAdjacentHTML('beforeend', cardHtml);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ===== SERVER NOTIFICATIONS (from cron) =====
async function checkServerNotifications() {
    if (!currentUser || !notificationsEnabled) return;

    try {
        const response = await fetch('api/notifications.php?action=check&user_name=' + encodeURIComponent(currentUser));
        const result = await response.json();

        if (result.success && result.notifications && result.notifications.length > 0) {
            for (const notif of result.notifications) {
                sendNotification(notif.title, notif.body, 'success');
            }
        }
    } catch (e) {
        // Ignore errors
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    initAlertSound();
    await initServiceWorker();

    notificationsEnabled = localStorage.getItem('ekibel_notifications') === 'true';
    updateNotificationButton();

    initUserSelection();

    await api('getAll');
    previousState = JSON.parse(JSON.stringify(toilets));

    // Polling co 5 sekund (zmniejszone z 2s)
    setInterval(() => {
        api('getAll');
        checkServerNotifications();
    }, 5000);

    initMusicPlayer();
});
