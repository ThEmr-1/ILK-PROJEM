<?php
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Yalnızca POST istekleri kabul edilir.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'E-posta ve şifre zorunludur.']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'E-posta veya şifre hatalı!']);
        exit();
    }

    // Kullanıcının güç analizi verilerini kontrol et
    $stmtAssess = $pdo->prepare("SELECT pullups, pushups, dips, hollow_hold, lsit_hold, handstand_wall FROM user_assessments WHERE user_id = ?");
    $stmtAssess->execute([$user['id']]);
    $assessment = $stmtAssess->fetch();

    $stats = null;
    if ($assessment) {
        $stats = [
            'pullups' => (int)$assessment['pullups'],
            'pushups' => (int)$assessment['pushups'],
            'dips' => (int)$assessment['dips'],
            'hollowHold' => (int)$assessment['hollow_hold'],
            'lsitHold' => (int)$assessment['lsit_hold'],
            'handstandWall' => (int)$assessment['handstand_wall']
        ];
    }

    echo json_encode([
        'success' => true,
        'message' => 'Giriş başarılı!',
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'assessmentCompleted' => ($assessment !== false),
            'stats' => $stats
        ]
    ]);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
}
