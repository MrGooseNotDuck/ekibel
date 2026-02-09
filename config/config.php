<?php
/**
 * Konfiguracja aplikacji
 */

define('APP_NAME', 'Centrum Zarządzania Toaletami 🏢');
define('DATA_DIR', __DIR__ . '/../data/');
define('DATA_FILE', DATA_DIR . 'toilets.json');

// Lista pracowników
define('EMPLOYEES', [
    'Bartosz Kiedrzyn',
    'Bartosz Pokrzywniak',
    'Dawid Krzyżanowski',
    'Dawid Matuszewski',
    'Dawid Niesmaczny',
    'Dominik Najgebauer',
    'Ewelina Kołodziejczyk-Łuniewska',
    'Filip Wojtyra',
    'Hubert Mistrzyk',
    'Ignacy Gorzelak',
    'Jacek Piotrowski',
    'Jakub Olszewski',
    'Jakub Polak',
    'Jakub Purgal',
    'Kajetan Rębiś',
    'Karol Lisiecki',
    'Krystian Kołodziejczyk',
    'Liliana Zgryza',
    'Maciek Łuniewski',
    'Maja Juszczyk',
    'Marzena Leszczak',
    'Mateusz Dyndał',
    'Mateusz Gąska',
    'Mateusz Waloch',
    'Mikołaj Kaczmarzyk',
    'Norbert Barański',
    'Paweł Wilk',
    'Radek Górniak',
    'Radoslaw Kieliszek',
    'Szymon Górski',
    'Ula Wojtysiak'
]);

// Domyślna konfiguracja toalet
define('DEFAULT_TOILETS', [
    't1' => ['name' => 'Parter - Kuchnia 🍳', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []],
    't2' => ['name' => 'Parter - Schody 🪜', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []],
    't3' => ['name' => 'I Piętro 1️⃣', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []],
    't4' => ['name' => 'II Piętro 2️⃣', 'occupiedBy' => null, 'entryTime' => null, 'warmWater' => true, 'queue' => [], 'reviews' => [], 'reservations' => []]
]);
