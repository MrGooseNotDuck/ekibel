<?php
/**
 * API Endpoint dla toalet
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../models/Toilet.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$id = $_POST['id'] ?? $_GET['id'] ?? '';

$response = ['success' => false, 'message' => 'Nieznana akcja'];

try {
    switch ($action) {
        case 'getAll':
            $response = ['success' => true, 'data' => Toilet::loadAll()];
            break;

        case 'addToQueue':
            $name = trim($_POST['name'] ?? '');
            if ($name && $id) {
                Toilet::addToQueue($id, $name);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            } else {
                $response = ['success' => false, 'message' => 'Brak danych'];
            }
            break;

        case 'removeFromQueue':
            $index = (int) ($_POST['index'] ?? -1);
            if ($id && $index >= 0) {
                Toilet::removeFromQueue($id, $index);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            }
            break;

        case 'enter':
            if ($id) {
                Toilet::enter($id);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            }
            break;

        case 'leave':
            if ($id) {
                Toilet::leave($id);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            }
            break;

        case 'toggleWater':
            if ($id) {
                Toilet::toggleWater($id);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            }
            break;

        case 'addReview':
            $review = trim($_POST['review'] ?? '');
            $author = trim($_POST['author'] ?? '');
            if ($id && $review) {
                Toilet::addReview($id, $review, $author);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            } else {
                $response = ['success' => false, 'message' => 'Brak treści opinii'];
            }
            break;

        case 'removeReview':
            $index = (int) ($_POST['index'] ?? -1);
            if ($id && $index >= 0) {
                Toilet::removeReview($id, $index);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            }
            break;

        case 'addReservation':
            $date = $_POST['date'] ?? '';
            $time = $_POST['time'] ?? '';
            $name = trim($_POST['name'] ?? '');
            if ($id && $date && $time && $name) {
                Toilet::addReservation($id, $date, $time, $name);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            } else {
                $response = ['success' => false, 'message' => 'Brak danych rezerwacji'];
            }
            break;

        case 'removeReservation':
            $index = (int) ($_POST['index'] ?? -1);
            if ($id && $index >= 0) {
                Toilet::removeReservation($id, $index);
                $response = ['success' => true, 'data' => Toilet::loadAll()];
            }
            break;

        default:
            $response = ['success' => false, 'message' => 'Nieznana akcja: ' . $action];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'message' => 'Błąd: ' . $e->getMessage()];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
