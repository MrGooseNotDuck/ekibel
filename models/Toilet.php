<?php
/**
 * Model Toilet - Uproszczony (bez rezerwacji/opinii)
 */

require_once __DIR__ . '/../config/config.php';

class Toilet
{

    public static function loadAll(): array
    {
        $db = getDB();
        $toilets = [];

        $stmt = $db->query("SELECT * FROM toilets ORDER BY id");
        foreach ($stmt->fetchAll() as $row) {
            $id = $row['toilet_id'];
            $toilets[$id] = [
                'name' => $row['name'],
                'occupiedBy' => $row['occupied_by'],
                'warmWater' => (bool) $row['warm_water'],
                'queue' => []
            ];
        }

        $stmt = $db->query("SELECT * FROM queue ORDER BY toilet_id, position");
        foreach ($stmt->fetchAll() as $row) {
            if (isset($toilets[$row['toilet_id']])) {
                $toilets[$row['toilet_id']]['queue'][] = $row['person_name'];
            }
        }

        return $toilets;
    }

    public static function addToQueue(string $toiletId, string $name): bool
    {
        $db = getDB();

        // Sprawdź czy już jest w jakiejś kolejce lub toalecie
        $stmt = $db->prepare("SELECT COUNT(*) FROM queue WHERE person_name = ?");
        $stmt->execute([$name]);
        if ($stmt->fetchColumn() > 0)
            return false;

        $stmt = $db->prepare("SELECT COUNT(*) FROM toilets WHERE occupied_by = ?");
        $stmt->execute([$name]);
        if ($stmt->fetchColumn() > 0)
            return false;

        $stmt = $db->prepare("SELECT COALESCE(MAX(position), 0) + 1 as next FROM queue WHERE toilet_id = ?");
        $stmt->execute([$toiletId]);
        $next = $stmt->fetch()['next'];

        $stmt = $db->prepare("INSERT INTO queue (toilet_id, person_name, position) VALUES (?, ?, ?)");
        return $stmt->execute([$toiletId, $name, $next]);
    }

    public static function removeFromQueue(string $toiletId, int $index): bool
    {
        $db = getDB();

        $stmt = $db->prepare("SELECT id FROM queue WHERE toilet_id = ? ORDER BY position LIMIT 1 OFFSET ?");
        $stmt->execute([$toiletId, $index]);
        $row = $stmt->fetch();

        if ($row) {
            $stmt = $db->prepare("DELETE FROM queue WHERE id = ?");
            $stmt->execute([$row['id']]);
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

    public static function enter(string $toiletId): bool
    {
        $db = getDB();

        $stmt = $db->prepare("SELECT id, person_name FROM queue WHERE toilet_id = ? ORDER BY position LIMIT 1");
        $stmt->execute([$toiletId]);
        $first = $stmt->fetch();

        if (!$first)
            return false;

        $stmt = $db->prepare("UPDATE toilets SET occupied_by = ? WHERE toilet_id = ?");
        $stmt->execute([$first['person_name'], $toiletId]);

        $stmt = $db->prepare("DELETE FROM queue WHERE id = ?");
        $stmt->execute([$first['id']]);

        self::reorderQueue($toiletId);
        return true;
    }

    public static function leave(string $toiletId): bool
    {
        $db = getDB();

        // Pobierz nazwę toalety
        $stmt = $db->prepare("SELECT name FROM toilets WHERE toilet_id = ?");
        $stmt->execute([$toiletId]);
        $toilet = $stmt->fetch();

        // Zwolnij toaletę
        $stmt = $db->prepare("UPDATE toilets SET occupied_by = NULL WHERE toilet_id = ?");
        $result = $stmt->execute([$toiletId]);

        // Powiadom pierwszą osobę w kolejce
        if ($result && $toilet) {
            self::notifyFirstInQueue($toiletId, $toilet['name']);
        }

        return $result;
    }

    /**
     * Wysyła powiadomienie do pierwszej osoby w kolejce gdy toaleta jest wolna
     */
    private static function notifyFirstInQueue(string $toiletId, string $toiletName): void
    {
        $db = getDB();

        // Sprawdź czy toaleta jest wolna
        $stmt = $db->prepare("SELECT occupied_by FROM toilets WHERE toilet_id = ?");
        $stmt->execute([$toiletId]);
        $toilet = $stmt->fetch();

        if ($toilet && $toilet['occupied_by']) {
            return; // Toaleta zajęta, nie powiadamiaj
        }

        // Pobierz pierwszą osobę w kolejce
        $stmt = $db->prepare("SELECT person_name FROM queue WHERE toilet_id = ? ORDER BY position LIMIT 1");
        $stmt->execute([$toiletId]);
        $first = $stmt->fetch();

        if ($first) {
            // Utwórz tabelę jeśli nie istnieje
            $db->exec("CREATE TABLE IF NOT EXISTS pending_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_name VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sent TINYINT(1) DEFAULT 0,
                INDEX idx_user (user_name)
            )");

            // Dodaj powiadomienie
            $stmt = $db->prepare("INSERT INTO pending_notifications (user_name, title, body) VALUES (?, ?, ?)");
            $stmt->execute([
                $first['person_name'],
                '🚀 TOALETA WOLNA!',
                $toiletName . ' - Wchodź teraz!'
            ]);
        }
    }

    public static function toggleWater(string $toiletId): bool
    {
        $db = getDB();
        $stmt = $db->prepare("UPDATE toilets SET warm_water = NOT warm_water WHERE toilet_id = ?");
        return $stmt->execute([$toiletId]);
    }
}
