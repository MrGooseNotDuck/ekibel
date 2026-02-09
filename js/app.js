/**
 * Aplikacja frontendowa - komunikacja z API PHP
 */

let toilets = {};

// --- API CALLS ---
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
        }
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message };
    }
}

// --- AKCJE ---
function addToQueue(id) {
    const input = document.getElementById(`q-input-${id}`);
    const name = input.value.trim();
    if (name) {
        api('addToQueue', { id, name });
        input.value = '';
    }
}

function removeFromQueue(id, index) {
    api('removeFromQueue', { id, index });
}

function enterToilet(id) {
    api('enter', { id });
}

function leaveToilet(id) {
    api('leave', { id });
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
        timeInput.value = '';
        nameInput.value = '';
    }
}

function removeReservation(id, index) {
    api('removeReservation', { id, index });
}

// --- TIMER ---
function startGlobalTimer() {
    setInterval(() => {
        for (const [id, data] of Object.entries(toilets)) {
            if (data.occupiedBy && data.entryTime) {
                const diff = Math.floor((Date.now() - data.entryTime) / 1000);
                const minutes = Math.floor(diff / 60);
                const seconds = diff % 60;
                const el = document.getElementById(`timer-${id}`);
                if (el) el.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
        }
    }, 1000);
}

// --- RENDEROWANIE ---
function renderAll() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    for (const [id, data] of Object.entries(toilets)) {
        const isOccupied = data.occupiedBy !== null;

        // HTML: Kolejka
        let queueHtml = data.queue.length === 0 ? '<li style="color:#aaa; font-size:0.8rem; text-align:center;">Brak kolejki</li>' : '';
        data.queue.forEach((p, i) => {
            queueHtml += `<li class="queue-item"><span>${i + 1}. ${p}</span> <button class="btn-del" onclick="removeFromQueue('${id}', ${i})">X</button></li>`;
        });

        // HTML: Opinie
        let reviewsHtml = data.reviews.length === 0 ? '<li style="color:#aaa; font-size:0.8rem;">Brak opinii</li>' : '';
        data.reviews.forEach((r, i) => {
            reviewsHtml += `<li class="mini-item"><span class="review-text">"${r}"</span> <button class="btn-del" onclick="removeReview('${id}', ${i})">X</button></li>`;
        });

        // HTML: Rezerwacje
        let resHtml = data.reservations.length === 0 ? '<li style="color:#aaa; font-size:0.8rem;">Brak rezerwacji</li>' : '';
        data.reservations.forEach((r, i) => {
            resHtml += `<li class="mini-item"><span><b>${r.time}</b> - ${r.name}</span> <button class="btn-del" onclick="removeReservation('${id}', ${i})">X</button></li>`;
        });

        // HTML: Przycisk główny
        let mainBtn = '';
        if (isOccupied) {
            mainBtn = `<button class="btn-main btn-leave" onclick="leaveToilet('${id}')">Zwalniam (Wychodzę)</button>`;
        } else if (data.queue.length > 0) {
            mainBtn = `<button class="btn-main btn-enter" onclick="enterToilet('${id}')">Wchodzę (Jesteś: ${data.queue[0]})</button>`;
        } else {
            mainBtn = `<div style="text-align:center; color:#aaa; padding:10px;">Dopisz się, aby wejść</div>`;
        }

        const cardHtml = `
        <div class="toilet-card">
            <div class="card-header">
                <span>${data.name}</span>
            </div>
            
            <div class="card-body">
                <div class="status-box ${isOccupied ? 'status-occupied' : 'status-free'}">
                    ${isOccupied ? 'ZAJĘTE' : 'WOLNE'}
                </div>

                <div class="info-row">
                    <div class="water-toggle ${data.warmWater ? 'water-hot' : 'water-cold'}" onclick="toggleWater('${id}')">
                        ${data.warmWater ? '🔥 Ciepła' : '❄️ Zimna'}
                    </div>
                    <div>
                        ${isOccupied ? `👤 <b>${data.occupiedBy}</b> (<span id="timer-${id}">0:00</span>)` : 'Pusto'}
                    </div>
                </div>

                <div class="queue-section">
                    <div class="section-title">Kolejka</div>
                    <ul class="queue-list" id="q-list-${id}">${queueHtml}</ul>
                    <div class="mini-form" style="margin-top:10px;">
                        <input type="text" id="q-input-${id}" placeholder="Imię..." onkeypress="if(event.key==='Enter') addToQueue('${id}')">
                        <button class="btn-add btn-small" onclick="addToQueue('${id}')">+</button>
                    </div>
                </div>

                <div class="action-area">${mainBtn}</div>

                <details>
                    <summary>📅 Rezerwacje</summary>
                    <div class="details-content">
                        <div class="mini-form">
                            <input type="time" id="res-time-${id}" style="width:40%;">
                            <input type="text" id="res-name-${id}" placeholder="Kto?" style="width:60%;">
                            <button class="btn-add btn-small" onclick="addReservation('${id}')">OK</button>
                        </div>
                        <ul class="mini-list">${resHtml}</ul>
                    </div>
                </details>

                <details>
                    <summary>⭐ Opinie / Zgłoszenia</summary>
                    <div class="details-content">
                        <ul class="mini-list" style="margin-bottom:10px;">${reviewsHtml}</ul>
                        <div class="mini-form">
                            <input type="text" id="rev-input-${id}" placeholder="Np. brak papieru..." onkeypress="if(event.key==='Enter') addReview('${id}')">
                            <button class="btn-add btn-small" onclick="addReview('${id}')">Send</button>
                        </div>
                    </div>
                </details>

            </div>
        </div>`;
        app.insertAdjacentHTML('beforeend', cardHtml);
    }
}

// --- INICJALIZACJA ---
document.addEventListener('DOMContentLoaded', () => {
    api('getAll');
    startGlobalTimer();
    
    // Auto-refresh co 5 sekund
    setInterval(() => api('getAll'), 5000);
});
