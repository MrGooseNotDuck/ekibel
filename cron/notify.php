<?php
/**
 * CRON: Sprawdza zmiany w kolejkach i wysyła powiadomienia
 * Uruchom co minutę: * * * * * php /path/to/cron/notify.php
 */

require_once __DIR__ . '/../config/config.php';

// Plik do śledzenia poprzedniego stanu
$stateFile = __DIR__ . '/state.json';

try {
    $db = getDB();

    // Pobierz aktualny stan
    $currentState = [];

    $stmt = $db->query("SELECT toilet_id, name, occupied_by FROM toilets");
    foreach ($stmt->fetchAll() as $row) {
        $currentState[$row['toilet_id']] = [
            'name' => $row['name'],
            'occupied_by' => $row['occupied_by'],
            'queue' => []
        ];
    }

    $stmt = $db->query("SELECT toilet_id, person_name FROM queue ORDER BY toilet_id, position");
    foreach ($stmt->fetchAll() as $row) {
        if (isset($currentState[$row['toilet_id']])) {
            $currentState[$row['toilet_id']]['queue'][] = $row['person_name'];
        }
    }

    // Załaduj poprzedni stan
    $previousState = [];
    if (file_exists($stateFile)) {
        $previousState = json_decode(file_get_contents($stateFile), true) ?: [];
    }

    // Porównaj i wyślij powiadomienia
    $notifications = [];

    foreach ($currentState as $toiletId => $data) {
        $prev = $previousState[$toiletId] ?? null;
        if (!$prev)
            continue;

        $prevQueue = $prev['queue'] ?? [];
        $newQueue = $data['queue'] ?? [];

        // Sprawdź każdą osobę w nowej kolejce
        foreach ($newQueue as $pos => $person) {
            $prevPos = array_search($person, $prevQueue);

            // Awans na pierwsze miejsce
            if ($pos === 0 && $prevPos !== false && $prevPos > 0) {
                $notifications[] = [
                    'user' => $person,
                    'title' => '🎉 Twoja kolej!',
                    'body' => $data['name'] . ' - Jesteś pierwszy w kolejce!'
                ];
            }

            // Toaleta się zwolniła i osoba jest pierwsza
            if ($pos === 0 && $prev['occupied_by'] && !$data['occupied_by']) {
                $notifications[] = [
                    'user' => $person,
                    'title' => '🚀 TOALETA WOLNA!',
                    'body' => $data['name'] . ' - Wchodź teraz!'
                ];
            }
        }
    }

    // Wyślij powiadomienia (do tabeli pending_notifications)
    if (!empty($notifications)) {
        // Sprawdź czy tabela istnieje, jeśli nie - stwórz
        $db->exec("CREATE TABLE IF NOT EXISTS pending_notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_name VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sent TINYINT(1) DEFAULT 0
        )");

        $stmt = $db->prepare("INSERT INTO pending_notifications (user_name, title, body) VALUES (?, ?, ?)");
        foreach ($notifications as $notif) {
            $stmt->execute([$notif['user'], $notif['title'], $notif['body']]);
        }

        echo "Wysłano " . count($notifications) . " powiadomień\n";
    }

    // Zapisz aktualny stan
    file_put_contents($stateFile, json_encode($currentState, JSON_PRETTY_PRINT));

} catch (Exception $e) {
    echo "Błąd: " . $e->getMessage() . "\n";
    exit(1);
}
