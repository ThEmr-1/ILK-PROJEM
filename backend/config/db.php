<?php
/**
 * Veritabanı Bağlantı Yapılandırması (PDO)
 * MySQL / MariaDB (XAMPP, WAMP, Docker veya PHP CLI ile uyumlu)
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Pre-flight OPTIONS isteğini karşıla
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$db   = 'calisthenics_db';
$user = 'root';
$pass = ''; // XAMPP / varsayılan MySQL şifresi
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Veritabanı henüz oluşturulmamışsa veya bağlantı yoksa
    // JSON hata mesajı dön
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı bağlantı hatası: ' . $e->getMessage(),
        'tip' => 'Lütfen MySQL servisinizin çalıştığından ve schema.sql dosyasının içe aktarıldığından emin olun.'
    ]);
    exit();
}
