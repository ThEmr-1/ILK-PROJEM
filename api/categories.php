<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$categories = [
    [
        'id' => 'statik',
        'name' => 'Statik (Statics)',
        'badge' => 'İzometrik Güç',
        'icon' => 'fa-solid fa-anchor',
        'description' => 'Vücudun yerçekimine karşı belirli bir pozisyonda sabit kilitlendiği, saf izometrik kas ve tendon gücü gerektiren ileri seviye hareketler.'
    ],
    [
        'id' => 'dinamik',
        'name' => 'Dinamik (Dynamics)',
        'badge' => 'Patlayıcı Güç & Kontrol',
        'icon' => 'fa-solid fa-bolt',
        'description' => 'Yüksek patlayıcı kuvvet, geniş hareket açısı ve vücut ağırlığını ivmeyle hareket ettiren dinamik yetenekler.'
    ],
    [
        'id' => 'freestyle',
        'name' => 'Freestyle (Serbest Stil)',
        'badge' => 'Akrobasi & Akış',
        'icon' => 'fa-solid fa-wind',
        'description' => 'Bar üzerinde dönüşler, saltolar, geçişler ve akrobatik kombinasyonların birleşimi.'
    ]
];

echo json_encode([
    'success' => true,
    'categories' => $categories
], JSON_UNESCAPED_UNICODE);
