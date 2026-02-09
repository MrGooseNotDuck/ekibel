<?php
/**
 * Model Toilet - MySQL
 */

require_once __DIR__ . '/../config/config.php';

class Toilet
{

    /**
     * Pobiera wszystkie toalety z pełnymi danymi
     */
    public static function loadAll(): array
    {
        $db = getDB();
        $toilets = [];

        // Pobierz toalety
        $stmt = $db->query("SELECT * FROM toilets ORDER BY id");
        $rows = $stmt->fetchAll();

        foreach ($rows as $row) {
            $id = $row['toilet_id'];
            $toilets[$id] = [
                'name' => $row['name'],
                'occupiedBy' => $row['occupied_by'],
                'entryTime' => $row['entry_time'] ? strtotime($row['entry_time']) * 1000 : null,
                'warmWater' => (bool) $row['warm_water'],
                'queue' => [],
                'reviews' => [],
                'reservations' => []
            ];
        }

        // Pobierz kolejki
        $stmt = $db->query("SELECT * FROM queue ORDER BY toilet_id, position");
        foreach ($stmt->fetchAll() as $row) {
            $toilets[$row['toilet_id']]['queue'][] = $row['person_name'];
        }

        // Pobierz opinie
        $stmt = $db->query("SELECT * FROM reviews ORDER BY toilet_id, id DESC");
        foreach ($stmt->fetchAll() as $row) {
            $toilets[$row['toilet_id']]['reviews'][] = $row['review_text'];
        }

        // Pobierz rezerwacje
        $stmt = $db->query("SELECT * FROM reservations ORDER BY toilet_id, reservation_time");
        foreach ($stmt->fetchAll() as $row) {
            $toilets[$row['toilet_id']]['reservations'][] = [
                'time' => $row['reservation_time'],
                'name' => $row['person_name']
            ];
        }

        return $toilets;
    }

    /**
     * Dodaje osobę do kolejki
     */
    public static function addToQueue(string $toiletId, string $name): bool
    {
        $db = getDB();
        $stmt = $db->prepare("SELECT COALESCE(MAX(position), 0) + 1 as next FROM queue WHERE toilet_id = ?");
        $stmt->execute([$toiletId]);
        $next = $stmt->fetch()['next'];

        $stmt = $db->prepare("INSERT INTO queue (toilet_id, person_name, position) VALUES (?, ?, ?)");
        return $stmt->execute([$toiletId, $name, $next]);
    }

    /**
     * Usuwa osobę z kolejki
     */
    public static function removeFromQueue(string $toiletId, int $index): bool
    {
        $db = getDB();

        // Znajdź osobę na pozycji
        $stmt = $db->prepare("SELECT id FROM queue WHERE toilet_id = ? ORDER BY position LIMIT 1 OFFSET ?");
        $stmt->execute([$toiletId, $index]);
        $row = $stmt->fetch();

        if ($row) {
            $stmt = $db->prepare("DELETE FROM queue WHERE id = ?");
            $stmt->execute([$row['id']]);
            // Przenumeruj
            self::reorderQueue($toiletId);
            return true;
        }
        return false;
    }

    private static function reorderQueue(string $toiletId): void
    {
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM queue WHERE toilet_id = ? ORDER BY position");
        $stmt->execute([$toiletId]);
        $rows = $stmt->fetchAll();

        $pos = 1;
        foreach ($rows as $row) {
            $db->prepare("UPDATE queue SET position = ? WHERE id = ?")->execute([$pos++, $row['id']]);
        }
    }

    /**
     * Osoba wchodzi do toalety
     */
    public static function enter(string $toiletId): bool
    {
        $db = getDB();

        // Pobierz pierwszą osobę z kolejki
        $stmt = $db->prepare("SELECT id, person_name FROM queue WHERE toilet_id = ? ORDER BY position LIMIT 1");
        $stmt->execute([$toiletId]);
        $first = $stmt->fetch();

        if (!$first)
            return false;

        // Ustaw jako zajęte
        $stmt = $db->prepare("UPDATE toilets SET occupied_by = ?, entry_time = NOW() WHERE toilet_id = ?");
        $stmt->execute([$first['person_name'], $toiletId]);

        // Usuń z kolejki
        $stmt = $db->prepare("DELETE FROM queue WHERE id = ?");
        $stmt->execute([$first['id']]);

        self::reorderQueue($toiletId);
        return true;
    }

    /**
     * Osoba wychodzi z toalety
     */
    public static function leave(string $toiletId): bool
    {
        $db = getDB();
        $stmt = $db->prepare("UPDATE toilets SET occupied_by = NULL, entry_time = NULL WHERE toilet_id = ?");
        return $stmt->execute([$toiletId]);
    }

    /**
     * Przełącza stan wody
     */
    public static function toggleWater(string $toiletId): bool
    {
        $db = getDB();
        $stmt = $db->prepare("UPDATE toilets SET warm_water = NOT warm_water WHERE toilet_id = ?");
        return $stmt->execute([$toiletId]);
    }

    /**
     * Dodaje opinię
     */
    public static function addReview(string $toiletId, string $review): bool
    {
        $db = getDB();

        // Dodaj nową
        $stmt = $db->prepare("INSERT INTO reviews (toilet_id, review_text) VALUES (?, ?)");
        $stmt->execute([$toiletId, $review]);

        // Usuń stare (zostaw max 5)
        $stmt = $db->prepare("DELETE FROM reviews WHERE toilet_id = ? AND id NOT IN (SELECT id FROM (SELECT id FROM reviews WHERE toilet_id = ? ORDER BY id DESC LIMIT 5) t)");
        $stmt->execute([$toiletId, $toiletId]);

        return true;
    }

    /**
     * Usuwa opinię
     */
    public static function removeReview(string $toiletId, int $index): bool
    {
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM reviews WHERE toilet_id = ? ORDER BY id DESC LIMIT 1 OFFSET ?");
        $stmt->execute([$toiletId, $index]);
        $row = $stmt->fetch();

        if ($row) {
            $stmt = $db->prepare("DELETE FROM reviews WHERE id = ?");
            return $stmt->execute([$row['id']]);
        }
        return false;
    }

    /**
     * Dodaje rezerwację
     */
    public static function addReservation(string $toiletId, string $time, string $name): bool
    {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO reservations (toilet_id, reservation_time, person_name) VALUES (?, ?, ?)");
        return $stmt->execute([$toiletId, $time, $name]);
    }

    /**
     * Usuwa rezerwację
     */
    public static function removeReservation(string $toiletId, int $index): bool
    {
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM reservations WHERE toilet_id = ? ORDER BY reservation_time LIMIT 1 OFFSET ?");
        $stmt->execute([$toiletId, $index]);
        $row = $stmt->fetch();

        if ($row) {
            $stmt = $db->prepare("DELETE FROM reservations WHERE id = ?");
            return $stmt->execute([$row['id']]);
        }
        return false;
    }
}
