<?php
/**
 * API Endpoint - Uproszczony
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../models/Toilet.php';

$action = $_POST['action'] ?? '';
$id = $_POST['id'] ?? '';

$response = ['success' => false, 'message' => 'Nieznana akcja'];

try {
    switch ($action) {
        case 'getAll':
            $response = ['success' => true, 'data' => Toilet::loadAll()];
            break;

        case 'addToQueue':
            $name = trim($_POST['name'] ?? '');
            if ($name && $id) {
                if (Toilet::addToQueue($id, $name)) {
                    $response = ['success' => true, 'data' => Toilet::loadAll()];
                } else {
                    $response = ['success' => false, 'message' => 'Już jesteś w kolejce lub toalecie!'];
                }
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

        default:
            $response = ['success' => false, 'message' => 'Nieznana akcja'];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'message' => 'Błąd: ' . $e->getMessage()];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
