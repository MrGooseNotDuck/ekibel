<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Centrum Zarządzania Toaletami 🏢</title>
    <style>
        :root {
            --primary: #2563eb;
            --success: #16a34a;
            --danger: #dc2626;
            --warning: #ca8a04;
            --bg: #f1f5f9;
            --card: #ffffff;
            --text: #1e293b;
            --border: #cbd5e1;
        }

        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 20px;
        }

        h1 {
            text-align: center;
            color: #334155;
            margin-bottom: 30px;
        }

        /* Grid Layout */
        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            max-width: 1600px;
            margin: 0 auto;
        }

        /* Karta toalety */
        .toilet-card {
            background-color: var(--card);
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--border);
        }

        .card-header {
            background-color: #f8fafc;
            padding: 15px;
            text-align: center;
            font-weight: 700;
            font-size: 1.1rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        /* Status Box */
        .status-box {
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            color: white;
            font-weight: 800;
            font-size: 1.4rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .status-free {
            background-color: var(--success);
        }

        .status-occupied {
            background-color: var(--danger);
        }

        /* Woda i Timer */
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f1f5f9;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.9rem;
        }

        .water-toggle {
            cursor: pointer;
            user-select: none;
            font-weight: bold;
        }

        .water-hot {
            color: var(--danger);
        }

        .water-cold {
            color: var(--primary);
        }

        /* Kolejka */
        .queue-section {
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px;
        }

        .section-title {
            font-size: 0.85rem;
            font-weight: bold;
            color: #64748b;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .queue-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .queue-item {
            padding: 6px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
        }

        .queue-item:last-child {
            border-bottom: none;
        }

        .queue-item:first-child {
            background-color: #e0f2fe;
            font-weight: 600;
            border-radius: 4px;
        }

        /* Collapsible Sections (Opinie, Rezerwacje) */
        details {
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
            background-color: #fff;
        }

        details summary {
            padding: 10px;
            background-color: #f8fafc;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        details summary::after {
            content: '+';
            font-size: 1.2rem;
        }

        details[open] summary::after {
            content: '-';
        }

        .details-content {
            padding: 10px;
            background-color: white;
            border-top: 1px solid var(--border);
        }

        /* Formularze wewnątrz details */
        .mini-form {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
        }

        .mini-list {
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 150px;
            overflow-y: auto;
        }

        .mini-item {
            font-size: 0.85rem;
            padding: 5px;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
        }

        .review-text {
            font-style: italic;
            color: #555;
        }

        /* Inputy i Przyciski */
        input[type="text"],
        input[type="time"] {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
            box-sizing: border-box;
        }

        button {
            cursor: pointer;
            border: none;
            border-radius: 4px;
            transition: 0.2s;
        }

        .btn-small {
            padding: 5px 10px;
            font-size: 0.8rem;
        }

        .btn-add {
            background-color: var(--primary);
            color: white;
            font-weight: bold;
        }

        .btn-del {
            background-color: #ef4444;
            color: white;
            padding: 2px 6px;
            font-size: 0.7rem;
            margin-left: 5px;
        }

        .action-area {
            margin-top: 10px;
        }

        .btn-main {
            width: 100%;
            padding: 12px;
            font-size: 1rem;
            color: white;
            font-weight: bold;
            border-radius: 6px;
        }

        .btn-enter {
            background-color: var(--primary);
        }

        .btn-leave {
            background-color: var(--danger);
        }
    </style>
</head>

<body>

    <h1>Centrum Zarządzania Toaletami 🏢</h1>

    <div id="app" class="grid-container">
    </div>

    <script>
        // --- KONFIGURACJA ---
        const defaultConfig = {
            't1': { name: 'Parter - Kuchnia 🍳', occupiedBy: null, entryTime: null, warmWater: true, queue: [], reviews: [], reservations: [] },
            't2': { name: 'Parter - Schody 🪜', occupiedBy: null, entryTime: null, warmWater: true, queue: [], reviews: [], reservations: [] },
            't3': { name: 'I Piętro 1️⃣', occupiedBy: null, entryTime: null, warmWater: true, queue: [], reviews: [], reservations: [] },
            't4': { name: 'II Piętro 2️⃣', occupiedBy: null, entryTime: null, warmWater: true, queue: [], reviews: [], reservations: [] }
        };

        let toilets = {};

        // --- LOGIKA DANYCH ---
        function loadState() {
            const saved = localStorage.getItem('officeToilets_v3');
            if (saved) {
                toilets = JSON.parse(saved);
                // Migracja danych (gdyby brakowało nowych pól w starej wersji)
                for (let key in defaultConfig) {
                    if (!toilets[key]) toilets[key] = defaultConfig[key];
                    if (!toilets[key].reviews) toilets[key].reviews = [];
                    if (!toilets[key].reservations) toilets[key].reservations = [];
                }
            } else {
                toilets = JSON.parse(JSON.stringify(defaultConfig));
            }
            renderAll();
            startGlobalTimer();
        }

        function saveState() {
            localStorage.setItem('officeToilets_v3', JSON.stringify(toilets));
            renderAll();
        }

        // --- AKCJE PODSTAWOWE ---
        function addToQueue(id) {
            const input = document.getElementById(`q-input-${id}`);
            const name = input.value.trim();
            if (name) {
                toilets[id].queue.push(name);
                input.value = '';
                saveState();
            }
        }

        function removeFromQueue(id, index) {
            toilets[id].queue.splice(index, 1);
            saveState();
        }

        function enterToilet(id) {
            if (toilets[id].queue.length > 0) {
                toilets[id].occupiedBy = toilets[id].queue.shift();
                toilets[id].entryTime = Date.now();
                saveState();
            }
        }

        function leaveToilet(id) {
            toilets[id].occupiedBy = null;
            toilets[id].entryTime = null;
            saveState();
        }

        function toggleWater(id) {
            toilets[id].warmWater = !toilets[id].warmWater;
            saveState();
        }

        // --- NOWE FUNKCJE: OPINIE I REZERWACJE ---

        function addReview(id) {
            const input = document.getElementById(`rev-input-${id}`);
            const text = input.value.trim();
            if (text) {
                // Dodajemy na początek listy
                toilets[id].reviews.unshift(text);
                // Limit do ostatnich 5 opinii
                if (toilets[id].reviews.length > 5) toilets[id].reviews.pop();
                input.value = '';
                saveState();
            }
        }

        function removeReview(id, index) {
            toilets[id].reviews.splice(index, 1);
            saveState();
        }

        function addReservation(id) {
            const timeInput = document.getElementById(`res-time-${id}`);
            const nameInput = document.getElementById(`res-name-${id}`);

            if (timeInput.value && nameInput.value) {
                toilets[id].reservations.push({
                    time: timeInput.value,
                    name: nameInput.value
                });
                // Sortowanie po godzinie
                toilets[id].reservations.sort((a, b) => a.time.localeCompare(b.time));

                timeInput.value = '';
                nameInput.value = '';
                saveState();
            }
        }

        function removeReservation(id, index) {
            toilets[id].reservations.splice(index, 1);
            saveState();
        }

        // --- ZEGAR ---
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

        loadState();
    </script>
</body>

</html>