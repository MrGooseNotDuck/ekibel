<?php
/**
 * Centrum Zarządzania Toaletami - Główny plik
 */
require_once __DIR__ . '/config/config.php';
?>
<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0f0f1a">
    <title><?= APP_NAME ?></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚽</text></svg>">
</head>

<body>
    <!-- Floating Particles -->
    <div id="particles"></div>

    <!-- Header -->
    <header class="header">
        <h1><?= APP_NAME ?></h1>
        <p class="subtitle">System zarządzania w czasie rzeczywistym</p>
    </header>

    <!-- Stats Bar -->
    <div class="stats-bar" id="stats-bar">
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

    <!-- Main Content -->
    <div id="app" class="grid-container">
        <div class="loading">Ładowanie danych...</div>
    </div>

    <!-- Music Player -->
    <div class="music-player">
        <div class="music-visualizer" id="visualizer">
            <span></span><span></span><span></span><span></span><span></span>
        </div>
        <button class="music-btn" id="music-btn" title="Włącz relaksującą muzykę">
            🎵
        </button>
    </div>

    <!-- Hidden Audio -->
    <audio id="relaxing-music" loop>
        <source src="https://cdn.pixabay.com/audio/2022/02/23/audio_ea70ad08e3.mp3" type="audio/mpeg">
        <source src="https://cdn.pixabay.com/audio/2024/11/15/audio_6045205f3a.mp3" type="audio/mpeg">
    </audio>

    <script src="js/app.js"></script>
</body>

</html>