/**
 * 🚽 EKIBEL - Aplikacja frontendowa
 * Modern Dark Glass UI
 */

let toilets = {};

// ===== API CALLS =====
async function api(action, data = {}) {
    const formData = new FormData();
    formData.append('action', action);
    for (const [key, value] of Object.entries(data)) {
        formData.append(key, value);
    }

    try {
        const response = await fetch('api/toilets.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success && result.data) {
            toilets = result.data;
            renderAll();
            updateStats();
        }
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showToast('❌ Błąd połączenia');
        return { success: false, message: error.message };
    }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// ===== STATS UPDATE =====
function updateStats() {
    let free = 0, occupied = 0, queue = 0;

    for (const data of Object.values(toilets)) {
        if (data.occupiedBy) occupied++;
        else free++;
        queue += data.queue.length;
    }

    animateNumber('stat-free', free);
    animateNumber('stat-occupied', occupied);
    animateNumber('stat-queue', queue);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    el.style.transform = 'scale(1.2)';
    el.textContent = target;
    setTimeout(() => el.style.transform = 'scale(1)', 200);
}

// ===== ACTIONS =====
function addToQueue(id) {
    const input = document.getElementById(`q-input-${id}`);
    const name = input.value.trim();
    if (name) {
        api('addToQueue', { id, name });
        input.value = '';
        showToast(`✅ ${name} dodano do kolejki`);
    }
}

function removeFromQueue(id, index) {
    api('removeFromQueue', { id, index });
}

function enterToilet(id) {
    api('enter', { id });
    showToast('🚪 Wchodzisz...');
}

function leaveToilet(id) {
    api('leave', { id });
    showToast('👋 Do zobaczenia!');
}

function toggleWater(id) {
    api('toggleWater', { id });
}

function addReview(id) {
    const input = document.getElementById(`rev-input-${id}`);
    const review = input.value.trim();
    if (review) {
        api('addReview', { id, review });
        input.value = '';
        showToast('⭐ Opinia dodana');
    }
}

function removeReview(id, index) {
    api('removeReview', { id, index });
}

function addReservation(id) {
    const timeInput = document.getElementById(`res-time-${id}`);
    const nameInput = document.getElementById(`res-name-${id}`);

    if (timeInput.value && nameInput.value.trim()) {
        api('addReservation', { id, time: timeInput.value, name: nameInput.value.trim() });
        showToast(`📅 Zarezerwowano na ${timeInput.value}`);
        timeInput.value = '';
        nameInput.value = '';
    }
}

function removeReservation(id, index) {
    api('removeReservation', { id, index });
}

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
                    // Warning color if over 5 minutes
                    if (minutes >= 5) {
                        el.style.color = '#ef4444';
                    }
                }
            }
        }
    }, 1000);
}

// ===== MUSIC PLAYER =====
function initMusicPlayer() {
    const btn = document.getElementById('music-btn');
    const audio = document.getElementById('relaxing-music');
    const visualizer = document.getElementById('visualizer');

    if (!btn || !audio) return;

    let isPlaying = false;

    btn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            btn.textContent = '🎵';
            btn.classList.remove('playing');
            visualizer.classList.remove('active');
            showToast('⏸️ Muzyka zatrzymana');
        } else {
            audio.play().then(() => {
                btn.textContent = '⏸️';
                btn.classList.add('playing');
                visualizer.classList.add('active');
                showToast('🎶 Relaksuj się...');
            }).catch(err => {
                console.error('Audio error:', err);
                showToast('❌ Nie można odtworzyć muzyki');
            });
        }
        isPlaying = !isPlaying;
    });

    // Volume control
    audio.volume = 0.3;
}

// ===== PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (8 + Math.random() * 4) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.2;

        // Random colors
        const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        container.appendChild(particle);
    }
}

// ===== RENDERING =====
function renderAll() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    for (const [id, data] of Object.entries(toilets)) {
        const isOccupied = data.occupiedBy !== null;

        // Queue HTML
        let queueHtml = data.queue.length === 0
            ? '<li style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:15px;">🕐 Kolejka pusta</li>'
            : '';
        data.queue.forEach((p, i) => {
            queueHtml += `
                <li class="queue-item">
                    <span>${i + 1}. ${escapeHtml(p)}</span>
                    <button class="btn-del" onclick="removeFromQueue('${id}', ${i})">✕</button>
                </li>`;
        });

        // Reviews HTML
        let reviewsHtml = data.reviews.length === 0
            ? '<li style="color:var(--text-muted); font-size:0.85rem; padding:10px;">Brak opinii</li>'
            : '';
        data.reviews.forEach((r, i) => {
            reviewsHtml += `
                <li class="mini-item">
                    <span class="review-text">"${escapeHtml(r)}"</span>
                    <button class="btn-del" onclick="removeReview('${id}', ${i})">✕</button>
                </li>`;
        });

        // Reservations HTML
        let resHtml = data.reservations.length === 0
            ? '<li style="color:var(--text-muted); font-size:0.85rem; padding:10px;">Brak rezerwacji</li>'
            : '';
        data.reservations.forEach((r, i) => {
            resHtml += `
                <li class="mini-item">
                    <span>🕐 <strong>${r.time}</strong> — ${escapeHtml(r.name)}</span>
                    <button class="btn-del" onclick="removeReservation('${id}', ${i})">✕</button>
                </li>`;
        });

        // Main button
        let mainBtn = '';
        if (isOccupied) {
            mainBtn = `<button class="btn-main btn-leave" onclick="leaveToilet('${id}')">
                🚪 Zwalniam (Wychodzę)
            </button>`;
        } else if (data.queue.length > 0) {
            mainBtn = `<button class="btn-main btn-enter" onclick="enterToilet('${id}')">
                ✨ Wchodzę — ${escapeHtml(data.queue[0])}
            </button>`;
        } else {
            mainBtn = `<div style="text-align:center; color:var(--text-muted); padding:15px; font-size:0.9rem;">
                📝 Dopisz się do kolejki, aby wejść
            </div>`;
        }

        const cardHtml = `
        <div class="toilet-card">
            <div class="card-header">
                <span>${data.name}</span>
            </div>
            
            <div class="card-body">
                <div class="status-box ${isOccupied ? 'status-occupied' : 'status-free'}">
                    ${isOccupied ? '🔴 ZAJĘTE' : '🟢 WOLNE'}
                </div>

                <div class="info-row">
                    <div class="water-toggle ${data.warmWater ? 'water-hot' : 'water-cold'}" onclick="toggleWater('${id}')">
                        ${data.warmWater ? '🔥 Ciepła woda' : '❄️ Zimna woda'}
                    </div>
                    <div>
                        ${isOccupied
                ? `👤 <strong>${escapeHtml(data.occupiedBy)}</strong> 
                               <span class="timer-display" id="timer-${id}">0:00</span>`
                : '<span style="color:var(--text-muted)">Pusto</span>'}
                    </div>
                </div>

                <div class="queue-section">
                    <div class="section-title">Kolejka oczekujących</div>
                    <ul class="queue-list" id="q-list-${id}">${queueHtml}</ul>
                    <div class="mini-form" style="margin-top:15px;">
                        <input type="text" id="q-input-${id}" placeholder="Wpisz swoje imię..." 
                               onkeypress="if(event.key==='Enter') addToQueue('${id}')">
                        <button class="btn-add btn-small" onclick="addToQueue('${id}')">
                            Dodaj
                        </button>
                    </div>
                </div>

                <div class="action-area">${mainBtn}</div>

                <details>
                    <summary>📅 Rezerwacje czasowe</summary>
                    <div class="details-content">
                        <div class="mini-form">
                            <input type="time" id="res-time-${id}">
                            <input type="text" id="res-name-${id}" placeholder="Kto rezerwuje?">
                            <button class="btn-add btn-small" onclick="addReservation('${id}')">OK</button>
                        </div>
                        <ul class="mini-list">${resHtml}</ul>
                    </div>
                </details>

                <details>
                    <summary>⭐ Opinie i zgłoszenia</summary>
                    <div class="details-content">
                        <ul class="mini-list" style="margin-bottom:15px;">${reviewsHtml}</ul>
                        <div class="mini-form">
                            <input type="text" id="rev-input-${id}" placeholder="Np. brak papieru, usterka..." 
                                   onkeypress="if(event.key==='Enter') addReview('${id}')">
                            <button class="btn-add btn-small" onclick="addReview('${id}')">Wyślij</button>
                        </div>
                    </div>
                </details>

            </div>
        </div>`;
        app.insertAdjacentHTML('beforeend', cardHtml);
    }
}

// ===== HELPERS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Load data
    api('getAll');

    // Start timers
    startGlobalTimer();

    // Auto-refresh every 5 seconds
    setInterval(() => api('getAll'), 5000);

    // Init features
    initMusicPlayer();
    createParticles();

    console.log('🚽 EKIBEL v2.0 - Modern Edition loaded!');
});
