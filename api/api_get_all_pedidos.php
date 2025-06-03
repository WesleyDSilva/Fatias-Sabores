<?php
/**
 * @api {get} /api_get_all_pedidos.php Listar todos os pedidos
 * @apiName GetAllPedidos
 * @apiGroup Pedidos
 *
 * @apiSuccess {Object[]} pedidos Lista de pedidos
 * @apiSuccess {Number} pedidos.pedido_id ID do pedido
 * @apiSuccess {String} pedidos.n_pedido Número único do pedido
 * @apiSuccess {Number} pedidos.cliente_id ID do cliente que fez o pedido
 * @apiSuccess {String} pedidos.data_pedido Data e hora do pedido
 * @apiSuccess {Number} pedidos.total Valor total do pedido
 * @apiSuccess {Number} pedidos.funcionario_id ID do funcionário responsável
 * @apiSuccess {Number} pedidos.produto_id ID do produto pedido
 * @apiSuccess {Number} pedidos.quantidade Quantidade do produto no pedido
 * @apiSuccess {String} pedidos.obs Observações do pedido
 * @apiSuccess {String} pedidos.forma_pagamento Forma de pagamento usada
 * @apiSuccess {Number} pedidos.troco_para Valor para troco, se houver
 * @apiSuccess {String} pedidos.status Status do pedido
 * @apiSuccess {String} pedidos.tamanho Tamanho do produto
 * @apiSuccess {String} pedidos.tipo_tamanho Tipo do tamanho
 *
 * @apiError {Boolean} error true
 * @apiError {String} message Mensagem de erro (ex: erro de conexão, método não permitido)
 *
 * @apiMethod GET
 */

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
