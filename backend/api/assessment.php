<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['userId'] ?? null;
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'userId parametresi zorunludur.']);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT pullups, pushups, dips, hollow_hold, lsit_hold, handstand_wall FROM user_assessments WHERE user_id = ?");
        $stmt->execute([(int)$userId]);
        $row = $stmt->fetch();

        if ($row) {
            echo json_encode([
                'success' => true,
                'stats' => [
                    'pullups' => (int)$row['pullups'],
                    'pushups' => (int)$row['pushups'],
                    'dips' => (int)$row['dips'],
                    'hollowHold' => (int)$row['hollow_hold'],
                    'lsitHold' => (int)$row['lsit_hold'],
                    'handstandWall' => (int)$row['handstand_wall']
                ]
            ]);
        } else {
            echo json_encode(['success' => true, 'stats' => null]);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['userId'] ?? 0);
    $stats = $input['stats'] ?? [];

    if (!$userId || empty($stats)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz veri gönderildi.']);
        exit();
    }

    $pullups = (int)($stats['pullups'] ?? 0);
    $pushups = (int)($stats['pushups'] ?? 0);
    $dips = (int)($stats['dips'] ?? 0);
    $hollow = (int)($stats['hollowHold'] ?? 0);
    $lsit = (int)($stats['lsitHold'] ?? 0);
    $handstand = (int)($stats['handstandWall'] ?? 0);

    try {
        // Upsert (INSERT ON DUPLICATE KEY UPDATE)
        $sql = "INSERT INTO user_assessments (user_id, pullups, pushups, dips, hollow_hold, lsit_hold, handstand_wall) 
                VALUES (?, ?, ?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                pullups = VALUES(pullups), 
                pushups = VALUES(pushups), 
                dips = VALUES(dips), 
                hollow_hold = VALUES(hollow_hold), 
                lsit_hold = VALUES(lsit_hold), 
                handstand_wall = VALUES(handstand_wall)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $pullups, $pushups, $dips, $hollow, $lsit, $handstand]);

        echo json_encode([
            'success' => true,
            'message' => 'Temel hareket değerlendirmesi başarıyla kaydedildi!',
            'stats' => $stats
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Kayıt hatası: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Desteklenmeyen istek yöntemi.']);
}
