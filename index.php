<?php
require_once __DIR__ . '/config/config.php';
$employeesJson = json_encode(EMPLOYEES, JSON_UNESCAPED_UNICODE);
?>
<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#6366f1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="EKIBEL">
    <title><?= APP_NAME ?></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="manifest" href="manifest.json">
    <link rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚽</text></svg>">
</head>

<body>
    <div id="user-modal" class="modal">
        <div class="modal-content">
            <h2>👋 Witaj!</h2>
            <p>Wybierz swoje imię:</p>
            <div class="user-search">
                <input type="text" id="user-search-input" placeholder="🔍 Szukaj..." autocomplete="off">
            </div>
            <div class="user-list" id="user-list"></div>
        </div>
    </div>

    <header class="header">
        <h1><?= APP_NAME ?></h1>
        <div class="header-right">
            <button class="notif-btn" id="notif-btn" onclick="toggleNotifications()" title="Powiadomienia">🔕</button>
            <div class="current-user" id="current-user"></div>
        </div>
    </header>

    <div class="stats-bar">
        <div class="stat-item">
            <div class="stat-value" id="stat-free">-</div>
            <div class="stat-label">Wolne</div>
        </div>
        <div class="stat-item">
            <div class="stat-value" id="stat-occupied">-</div>
            <div class="stat-label">Zajęte</div>
        </div>
        <div class="stat-item">
            <div class="stat-value" id="stat-queue">-</div>
            <div class="stat-label">W kolejce</div>
        </div>
    </div>

    <div id="app" class="grid-container">
        <div class="loading">Ładowanie...</div>
    </div>

    <div class="music-player">
        <button class="music-btn" id="music-btn" title="Muzyka">🎵</button>
    </div>

    <audio id="relaxing-music" loop preload="none">
        <source src="https://cdn.pixabay.com/audio/2022/02/23/audio_ea70ad08e3.mp3" type="audio/mpeg">
    </audio>

    <script>const EMPLOYEES = <?= $employeesJson ?>;</script>
    <script src="js/app.js"></script>
</body>

</html>