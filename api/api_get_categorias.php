<?php
header('Content-Type: application/json');
require_once 'banco_connect.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT categoria_id, categoria FROM Categoria ORDER BY categoria");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "categorias" => $categorias
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erro ao buscar categorias",
        "error" => $e->getMessage()
    ]);
}
