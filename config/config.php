<?php
/**
 * Konfiguracja aplikacji - MySQL
 */

define('APP_NAME', 'Centrum Zarządzania Toaletami 🏢');

// === KONFIGURACJA BAZY DANYCH ===
define('DB_HOST', 'localhost');
define('DB_NAME', 'ekibel');
define('DB_USER', 'root');        // Zmień na swojego użytkownika
define('DB_PASS', '');            // Zmień na swoje hasło

// Połączenie z bazą
function getDB(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'message' => 'Błąd połączenia z bazą: ' . $e->getMessage()]));
        }
    }
    return $pdo;
}

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
    't1' => ['name' => 'Parter - Kuchnia 🍳', 'warm_water' => true],
    't2' => ['name' => 'Parter - Schody 🪜', 'warm_water' => true],
    't3' => ['name' => 'I Piętro 1️⃣', 'warm_water' => true],
    't4' => ['name' => 'II Piętro 2️⃣', 'warm_water' => true]
]);
