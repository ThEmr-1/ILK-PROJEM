<?php
/**
 * PHP Geliştirme Sunucusu Yönlendiricisi (Built-in Server Router)
 * 
 * Kullanım (Proje kök dizininde):
 * php -S localhost:8000 backend/router.php
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// API İstekleri
if (strpos($uri, '/api/') === 0 || strpos($uri, '/backend/api/') === 0) {
    $script = basename($uri);
    $target = __DIR__ . '/api/' . $script;
    if (file_exists($target)) {
        require $target;
        return true;
    }
}

// Frontend Statik Dosyaları
$frontendDir = realpath(__DIR__ . '/../frontend');
$cleanUri = preg_replace('#^/frontend#', '', $uri);
$filePath = $frontendDir . ($cleanUri === '' || $cleanUri === '/' ? '/index.html' : $cleanUri);

if (file_exists($filePath) && !is_dir($filePath)) {
    // MIME type belirleme
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimes = [
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'html' => 'text/html',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'svg'  => 'image/svg+xml'
    ];
    if (isset($mimes[$ext])) {
        header("Content-Type: {$mimes[$ext]}");
    }
    readfile($filePath);
    return true;
}

// Varsayılan: index.html
if (file_exists($frontendDir . '/index.html')) {
    header("Content-Type: text/html");
    readfile($frontendDir . '/index.html');
    return true;
}

return false;
