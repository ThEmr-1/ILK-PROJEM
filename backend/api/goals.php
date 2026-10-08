<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = (int)($_GET['userId'] ?? 0);
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'userId parametresi zorunludur.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT skill_id FROM user_goals WHERE user_id = ? ORDER BY id DESC");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            'success' => true,
            'goals' => $rows
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['userId'] ?? 0);
    $skillId = trim($input['skillId'] ?? '');

    if (!$userId || empty($skillId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'userId ve skillId zorunludur.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT IGNORE INTO user_goals (user_id, skill_id) VALUES (?, ?)");
        $stmt->execute([$userId, $skillId]);

        // Güncel listeyi döndür
        $listStmt = $pdo->prepare("SELECT skill_id FROM user_goals WHERE user_id = ? ORDER BY id DESC");
        $listStmt->execute([$userId]);
        $all = $listStmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            'success' => true,
            'message' => 'Hedef başarıyla eklendi!',
            'goals' => $all
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $userId = (int)($_GET['userId'] ?? 0);
    $skillId = trim($_GET['skillId'] ?? '');

    if (!$userId || empty($skillId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'userId ve skillId zorunludur.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM user_goals WHERE user_id = ? AND skill_id = ?");
        $stmt->execute([$userId, $skillId]);

        $listStmt = $pdo->prepare("SELECT skill_id FROM user_goals WHERE user_id = ? ORDER BY id DESC");
        $listStmt->execute([$userId]);
        $all = $listStmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            'success' => true,
            'message' => 'Hedef silindi.',
            'goals' => $all
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Desteklenmeyen HTTP yöntemi.']);
}
