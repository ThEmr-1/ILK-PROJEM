<?php
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Yalnızca POST istekleri kabul edilir.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Lütfen tüm alanları doldurun.']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Geçerli bir e-posta adresi girin.']);
    exit();
}

try {
    // E-posta kontrolü
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Bu e-posta adresi zaten kayıtlı!']);
        exit();
    }

    // Şifreyi güvenli hashle
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $insert = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    $insert->execute([$name, $email, $passwordHash]);
    $userId = $pdo->lastInsertId();

    // Varsayılan boş değerlendirme kaydı oluştur
    $assessmentInsert = $pdo->prepare("INSERT INTO user_assessments (user_id, pullups, pushups, dips, hollow_hold, lsit_hold, handstand_wall) VALUES (?, 8, 20, 12, 30, 10, 15)");
    $assessmentInsert->execute([$userId]);

    echo json_encode([
        'success' => true,
        'message' => 'Kayıt başarıyla tamamlandı!',
        'user' => [
            'id' => (int)$userId,
            'name' => $name,
            'email' => $email,
            'assessmentCompleted' => false
        ]
    ]);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
}
