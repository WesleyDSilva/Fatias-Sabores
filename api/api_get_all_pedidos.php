<?php
header('Content-Type: application/json');

require_once 'banco_connect.php';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro de conexão: ' . $conn->connect_error
    ]);
    exit;
}

mysqli_set_charset($conn, "utf8");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "
        SELECT
            pedido_id,
            n_pedido,
            cliente_id,
            data_pedido,
            total,
            funcionario_id,
            produto_id,
            quantidade,
            obs,
            forma_pagamento,
            troco_para,
            status,
            tamanho,
            tipo_tamanho
        FROM Pedidos
        ORDER BY data_pedido DESC
    ";

    $result = $conn->query($query);

    if ($result) {
        $pedidos = [];

        while ($row = $result->fetch_assoc()) {
            $pedidos[] = $row;
        }

        echo json_encode($pedidos);
    } else {
        echo json_encode([
            'error' => true,
            'message' => 'Erro ao buscar pedidos: ' . $conn->error
        ]);
    }
} else {
    echo json_encode([
        'error' => true,
        'message' => 'Método não permitido. Use GET.'
    ]);
}

$conn->close();
?>
