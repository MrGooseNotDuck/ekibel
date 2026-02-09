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
    <title><?= APP_NAME ?></title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>

    <h1><?= APP_NAME ?></h1>

    <div id="app" class="grid-container">
        <div class="loading">Ładowanie...</div>
    </div>

    <script src="js/app.js"></script>
</body>

</html>