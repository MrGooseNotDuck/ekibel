<?php
/**
 * Model Toilet - obsługa danych toalet
 */

require_once __DIR__ . '/../config/config.php';

class Toilet
{
    private static $data = [];

    /**
     * Ładuje dane z pliku JSON
     */
    public static function loadAll(): array
    {
        if (!file_exists(DATA_FILE)) {
            self::$data = DEFAULT_TOILETS;
            self::saveAll();
        } else {
            $json = file_get_contents(DATA_FILE);
            self::$data = json_decode($json, true) ?: DEFAULT_TOILETS;
        }

        // Migracja danych
        foreach (DEFAULT_TOILETS as $key => $default) {
            if (!isset(self::$data[$key])) {
                self::$data[$key] = $default;
            }
            if (!isset(self::$data[$key]['reviews'])) {
                self::$data[$key]['reviews'] = [];
            }
            if (!isset(self::$data[$key]['reservations'])) {
                self::$data[$key]['reservations'] = [];
            }
        }

        return self::$data;
    }

    /**
     * Zapisuje dane do pliku JSON
     */
    public static function saveAll(): bool
    {
        if (!is_dir(DATA_DIR)) {
            mkdir(DATA_DIR, 0755, true);
        }
        return file_put_contents(DATA_FILE, json_encode(self::$data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
    }

    /**
     * Pobiera pojedynczą toaletę
     */
    public static function get(string $id): ?array
    {
        self::loadAll();
        return self::$data[$id] ?? null;
    }

    /**
     * Aktualizuje toaletę
     */
    public static function update(string $id, array $data): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        self::$data[$id] = array_merge(self::$data[$id], $data);
        return self::saveAll();
    }

    /**
     * Dodaje osobę do kolejki
     */
    public static function addToQueue(string $id, string $name): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        self::$data[$id]['queue'][] = $name;
        return self::saveAll();
    }

    /**
     * Usuwa osobę z kolejki
     */
    public static function removeFromQueue(string $id, int $index): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        array_splice(self::$data[$id]['queue'], $index, 1);
        return self::saveAll();
    }

    /**
     * Osoba wchodzi do toalety
     */
    public static function enter(string $id): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]) || empty(self::$data[$id]['queue']))
            return false;
        self::$data[$id]['occupiedBy'] = array_shift(self::$data[$id]['queue']);
        self::$data[$id]['entryTime'] = time() * 1000; // milisekundy dla JS
        return self::saveAll();
    }

    /**
     * Osoba wychodzi z toalety
     */
    public static function leave(string $id): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        self::$data[$id]['occupiedBy'] = null;
        self::$data[$id]['entryTime'] = null;
        return self::saveAll();
    }

    /**
     * Przełącza stan wody
     */
    public static function toggleWater(string $id): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        self::$data[$id]['warmWater'] = !self::$data[$id]['warmWater'];
        return self::saveAll();
    }

    /**
     * Dodaje opinię
     */
    public static function addReview(string $id, string $review): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        array_unshift(self::$data[$id]['reviews'], $review);
        if (count(self::$data[$id]['reviews']) > 5) {
            array_pop(self::$data[$id]['reviews']);
        }
        return self::saveAll();
    }

    /**
     * Usuwa opinię
     */
    public static function removeReview(string $id, int $index): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        array_splice(self::$data[$id]['reviews'], $index, 1);
        return self::saveAll();
    }

    /**
     * Dodaje rezerwację
     */
    public static function addReservation(string $id, string $time, string $name): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        self::$data[$id]['reservations'][] = ['time' => $time, 'name' => $name];
        usort(self::$data[$id]['reservations'], fn($a, $b) => strcmp($a['time'], $b['time']));
        return self::saveAll();
    }

    /**
     * Usuwa rezerwację
     */
    public static function removeReservation(string $id, int $index): bool
    {
        self::loadAll();
        if (!isset(self::$data[$id]))
            return false;
        array_splice(self::$data[$id]['reservations'], $index, 1);
        return self::saveAll();
    }
}
