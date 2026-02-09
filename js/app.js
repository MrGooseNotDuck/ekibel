/**
 * 🚽 EKIBEL - Live Edition z kontrolą uprawnień
 */

let toilets = {};
let currentUser = null;

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
            toilets = result.data;
            renderAll();
            updateStats();
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

// ===== ACTIONS (z kontrolą uprawnień) =====
function quickAdd(id) {
    if (!currentUser) {
        showToast('❌ Najpierw wybierz swoje imię!');
        return;
    }

    // Sprawdź czy już jesteś w kolejce
    const data = toilets[id];
    if (data && data.queue.includes(currentUser)) {
        showToast('⚠️ Już jesteś w tej kolejce!');
        return;
    }

    // Sprawdź czy jesteś już w jakiejś toalecie
    for (const t of Object.values(toilets)) {
        if (t.occupiedBy === currentUser) {
            showToast('⚠️ Najpierw wyjdź z toalety!');
            return;
        }
    }

    api('addToQueue', { id, name: currentUser });
    showToast(`✅ Dodano do kolejki`);
}

function removeFromQueue(id, index) {
    // Tylko siebie można usunąć
    const data = toilets[id];
    if (data && data.queue[index] === currentUser) {
        api('removeFromQueue', { id, index });
    } else {
        showToast('❌ Możesz usunąć tylko siebie!');
    }
}

function enterToilet(id) {
    const data = toilets[id];
    // Tylko pierwsza osoba w kolejce może wejść
    if (data && data.queue[0] === currentUser) {
        api('enter', { id });
        showToast('🚪 Wchodzisz...');
    } else {
        showToast('❌ To nie Twoja kolej!');
    }
}

function leaveToilet(id) {
    const data = toilets[id];
    // Tylko osoba w toalecie może wyjść
    if (data && data.occupiedBy === currentUser) {
        api('leave', { id });
        showToast('👋 Do zobaczenia!');
    } else {
        showToast('❌ Nie jesteś w tej toalecie!');
    }
}

function toggleWater(id) { api('toggleWater', { id }); }

function addReview(id) {
    const input = document.getElementById(`rev-input-${id}`);
    const review = input.value.trim();
    if (review) { api('addReview', { id, review }); input.value = ''; }
}

function removeReview(id, index) { api('removeReview', { id, index }); }

function addReservation(id) {
    const timeInput = document.getElementById(`res-time-${id}`);
    const nameInput = document.getElementById(`res-name-${id}`);
    if (timeInput.value && nameInput.value.trim()) {
        api('addReservation', { id, time: timeInput.value, name: nameInput.value.trim() });
        timeInput.value = '';
        nameInput.value = '';
    }
}

function removeReservation(id, index) { api('removeReservation', { id, index }); }

// ===== TIMER =====
function startGlobalTimer() {
    setInterval(() => {
        for (const [id, data] of Object.entries(toilets)) {
            if (data.occupiedBy && data.entryTime) {
                const diff = Math.floor((Date.now() - data.entryTime) / 1000);
                const minutes = Math.floor(diff / 60);
                const seconds = diff % 60;
                const el = document.getElementById(`timer-${id}`);
                if (el) {
                    el.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                    if (minutes >= 5) el.style.color = '#ef4444';
                }
            }
        }
    }, 1000);
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

    for (const [id, data] of Object.entries(toilets)) {
        const isOccupied = data.occupiedBy !== null;
        const isMe = data.occupiedBy === currentUser;
        const imInQueue = data.queue.includes(currentUser);
        const imFirst = data.queue[0] === currentUser;

        // Kolejka - przycisk X tylko przy swoim imieniu
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

        // Główny przycisk
        let mainBtn = '';
        if (isOccupied && isMe) {
            // Jestem w toalecie - mogę wyjść
            mainBtn = `<button class="btn-main btn-leave" onclick="leaveToilet('${id}')">🚪 Wychodzę</button>`;
        } else if (isOccupied) {
            // Ktoś inny jest w toalecie
            mainBtn = `<div class="info-msg">🔒 Zajęte przez ${escapeHtml(data.occupiedBy)}</div>`;
        } else if (imFirst) {
            // Jestem pierwszy w kolejce - mogę wejść
            mainBtn = `<button class="btn-main btn-enter" onclick="enterToilet('${id}')">✨ Wchodzę</button>`;
        } else if (imInQueue) {
            // Jestem w kolejce, ale nie pierwszy
            const myPos = data.queue.indexOf(currentUser) + 1;
            mainBtn = `<div class="info-msg">⏳ Jesteś ${myPos}. w kolejce</div>`;
        } else {
            // Nie jestem w kolejce - mogę się dopisać
            mainBtn = `<button class="btn-main btn-quick" onclick="quickAdd('${id}')">⚡ Dopisz mnie</button>`;
        }

        const cardHtml = `
        <div class="toilet-card${isMe ? ' my-toilet' : ''}">
            <div class="card-header"><span>${data.name}</span></div>
            <div class="card-body">
                <div class="status-box ${isOccupied ? 'status-occupied' : 'status-free'}">
                    ${isOccupied ? '🔴 ZAJĘTE' : '🟢 WOLNE'}
                </div>

                <div class="info-row">
                    <div class="water-toggle ${data.warmWater ? 'water-hot' : 'water-cold'}" onclick="toggleWater('${id}')">
                        ${data.warmWater ? '🔥 Ciepła' : '❄️ Zimna'}
                    </div>
                    <div>
                        ${isOccupied
                ? `👤 <b>${escapeHtml(data.occupiedBy)}</b>${isMe ? ' (Ty)' : ''} <span class="timer-display" id="timer-${id}">0:00</span>`
                : '<span class="muted">Pusto</span>'}
                    </div>
                </div>

                <div class="queue-section">
                    <div class="section-title">Kolejka (${data.queue.length})</div>
                    <ul class="queue-list">${queueHtml}</ul>
                </div>

                <div class="action-area">${mainBtn}</div>

                <details>
                    <summary>📅 Rezerwacje</summary>
                    <div class="details-content">
                        <div class="mini-form">
                            <input type="time" id="res-time-${id}">
                            <input type="text" id="res-name-${id}" placeholder="Kto?">
                            <button class="btn-add btn-small" onclick="addReservation('${id}')">OK</button>
                        </div>
                        <ul class="mini-list">${renderReservations(data.reservations, id)}</ul>
                    </div>
                </details>

                <details>
                    <summary>⭐ Opinie</summary>
                    <div class="details-content">
                        <ul class="mini-list">${renderReviews(data.reviews, id)}</ul>
                        <div class="mini-form">
                            <input type="text" id="rev-input-${id}" placeholder="Zgłoś problem..." onkeypress="if(event.key==='Enter') addReview('${id}')">
                            <button class="btn-add btn-small" onclick="addReview('${id}')">OK</button>
                        </div>
                    </div>
                </details>
            </div>
        </div>`;
        app.insertAdjacentHTML('beforeend', cardHtml);
    }
}

function renderReservations(reservations, id) {
    if (!reservations || reservations.length === 0) return '<li class="empty-msg">Brak</li>';
    return reservations.map((r, i) => `
        <li class="mini-item">
            <span>🕐 <b>${r.time}</b> — ${escapeHtml(r.name)}</span>
            ${r.name === currentUser ? `<button class="btn-del" onclick="removeReservation('${id}', ${i})">✕</button>` : ''}
        </li>
    `).join('');
}

function renderReviews(reviews, id) {
    if (!reviews || reviews.length === 0) return '<li class="empty-msg">Brak</li>';
    return reviews.map((r, i) => `
        <li class="mini-item"><span>"${escapeHtml(r)}"</span></li>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initUserSelection();
    api('getAll');
    startGlobalTimer();
    setInterval(() => api('getAll'), 2000);
    initMusicPlayer();
});
