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
        $stmt = $pdo->prepare("SELECT program_json FROM generated_programs WHERE user_id = ? ORDER BY id DESC");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $programs = [];
        foreach ($rows as $json) {
            $decoded = json_decode($json, true);
            if ($decoded) $programs[] = $decoded;
        }

        echo json_encode([
            'success' => true,
            'programs' => $programs
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = (int)($input['userId'] ?? 0);
    $program = $input['program'] ?? null;

    if (!$userId || !$program) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz program verisi.']);
        exit();
    }

    $programCode = $program['id'] ?? ('prog_' . time());
    $splitType = $program['meta']['splitType'] ?? 'Özel Split';
    $daysCount = (int)($program['meta']['daysPerWeek'] ?? 3);
    $selectedDays = implode(', ', $program['meta']['selectedDays'] ?? []);
    $duration = $program['meta']['sessionDuration'] ?? '60 Dakika';
    $jsonContent = json_encode($program, JSON_UNESCAPED_UNICODE);

    try {
        $stmt = $pdo->prepare("INSERT INTO generated_programs (user_id, program_code, split_type, days_per_week, selected_days, session_duration, program_json) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $programCode, $splitType, $daysCount, $selectedDays, $duration, $jsonContent]);

        echo json_encode([
            'success' => true,
            'message' => 'Program başarıyla kaydedildi!',
            'programId' => $pdo->lastInsertId()
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Desteklenmeyen istek yöntemi.']);
}
