<?php
/**
 * Konfiguracja aplikacji
 */

define('APP_NAME', 'Centrum Zarządzania Toaletami 🏢');
define('DATA_DIR', __DIR__ . '/../data/');
define('DATA_FILE', DATA_DIR . 'toilets.json');

// Domyślna konfiguracja toalet
define('DEFAULT_TOILETS', [
    't1' => ['name' => 'Parter - Kuchnia 🍳', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []],
    't2' => ['name' => 'Parter - Schody 🪜', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []],
    't3' => ['name' => 'I Piętro 1️⃣', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []],
    't4' => ['name' => 'II Piętro 2️⃣', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []]
]);
