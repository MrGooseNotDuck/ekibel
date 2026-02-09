<?php
/**
 * API endpoint do pobierania powiadomień dla użytkownika
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$userName = $_POST['user_name'] ?? $_GET['user_name'] ?? '';

$response = ['success' => false];

try {
    $db = getDB();

    // Sprawdź czy tabela istnieje
    $db->exec("CREATE TABLE IF NOT EXISTS pending_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent TINYINT(1) DEFAULT 0,
        INDEX idx_user (user_name),
        INDEX idx_sent (sent)
    )");

    switch ($action) {
        case 'check':
            if (!$userName) {
                $response = ['success' => false, 'message' => 'Brak nazwy użytkownika'];
                break;
            }

            // Pobierz niewysłane powiadomienia
            $stmt = $db->prepare("
                SELECT id, title, body 
                FROM pending_notifications 
                WHERE user_name = ? AND sent = 0 
                ORDER BY created_at ASC
                LIMIT 5
            ");
            $stmt->execute([$userName]);
            $notifications = $stmt->fetchAll();

            if (!empty($notifications)) {
                // Oznacz jako wysłane
                $ids = array_column($notifications, 'id');
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $db->prepare("UPDATE pending_notifications SET sent = 1 WHERE id IN ($placeholders)")->execute($ids);
            }

            $response = ['success' => true, 'notifications' => $notifications];
            break;

        case 'clear':
            if ($userName) {
                $stmt = $db->prepare("DELETE FROM pending_notifications WHERE user_name = ? AND sent = 1");
                $stmt->execute([$userName]);
            }
            $response = ['success' => true];
            break;

        default:
            $response = ['success' => false, 'message' => 'Nieznana akcja'];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
