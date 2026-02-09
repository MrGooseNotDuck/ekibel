/**
 * 🚽 EKIBEL - Z powiadomieniami push
 */

let toilets = {};
let currentUser = null;
let previousState = null; // Do porównywania zmian

// ===== NOTIFICATIONS =====
async function initNotifications() {
    if (!('Notification' in window)) {
        console.log('Przeglądarka nie wspiera powiadomień');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

function sendNotification(title, body, icon = '🚽') {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' + icon + '</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚽</text></svg>',
            vibrate: [200, 100, 200],
            tag: 'ekibel-notification',
            renotify: true
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto-close after 5s
        setTimeout(() => notification.close(), 5000);
    }
}

function checkForChanges(newData) {
    if (!currentUser || !previousState) return;

    for (const [id, data] of Object.entries(newData)) {
        const prev = previousState[id];
        if (!prev) continue;

        const prevQueue = prev.queue || [];
        const newQueue = data.queue || [];

        const wasInQueue = prevQueue.includes(currentUser);
        const isInQueue = newQueue.includes(currentUser);
        const prevPos = prevQueue.indexOf(currentUser);
        const newPos = newQueue.indexOf(currentUser);

        // Byłem w kolejce
        if (wasInQueue && isInQueue) {
            // Awansowałem na pierwsze miejsce!
            if (prevPos > 0 && newPos === 0) {
                sendNotification(
                    '🎉 Twoja kolej!',
                    `${data.name} - Jesteś pierwszy w kolejce!`,
                    '👑'
                );
            }
            // Awansowałem (ale nie na pierwsze)
            else if (newPos < prevPos && newPos > 0) {
                sendNotification(
                    '⬆️ Awans w kolejce!',
                    `${data.name} - Jesteś teraz ${newPos + 1}. w kolejce`,
                    '📊'
                );
            }
        }

        // Jestem pierwszy i toaleta się zwolniła!
        if (isInQueue && newPos === 0 && prev.occupiedBy && !data.occupiedBy) {
            sendNotification(
                '🚀 TOALETA WOLNA!',
                `${data.name} - Możesz wchodzić!`,
                '🟢'
            );
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
        initNotifications(); // Poproś o uprawnienia
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
    initNotifications(); // Poproś o uprawnienia po wyborze
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
            // Sprawdź zmiany przed aktualizacją
            checkForChanges(result.data);

            previousState = JSON.parse(JSON.stringify(toilets)); // Deep copy
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
    setTimeout(() => toast.remove(), 2500);
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
            btn.classList.remove('playing');
        } else {
            audio.play().then(() => {
                btn.textContent = '⏸️';
                btn.classList.add('playing');
            }).catch(() => { });
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
            ? `<div class="water-toggle ${data.warmWater ? 'water-hot' : 'water-cold'}" onclick="toggleWater('${id}')">
                ${data.warmWater ? '🔥 Ciepła' : '❄️ Zimna'}
               </div>`
            : `<div class="water-info ${data.warmWater ? 'water-hot' : 'water-cold'}">
                ${data.warmWater ? '🔥 Ciepła' : '❄️ Zimna'}
               </div>`;

        const cardHtml = `
        <div class="toilet-card${isMe ? ' my-toilet' : ''}${imInQueue ? ' my-queue' : ''}">
            <div class="card-header"><span>${data.name}</span></div>
            <div class="card-body">
                <div class="status-box ${isOccupied ? 'status-occupied' : 'status-free'}">
                    ${isOccupied ? '🔴 ZAJĘTE' : '🟢 WOLNE'}
                </div>

                <div class="info-row">
                    ${waterHtml}
                    <div>
                        ${isOccupied
                ? `👤 <b>${escapeHtml(data.occupiedBy)}</b>${isMe ? ' (Ty)' : ''}`
                : '<span class="muted">Pusto</span>'}
                    </div>
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initUserSelection();
    api('getAll').then(() => {
        previousState = JSON.parse(JSON.stringify(toilets));
    });
    setInterval(() => api('getAll'), 2000);
    initMusicPlayer();
});
