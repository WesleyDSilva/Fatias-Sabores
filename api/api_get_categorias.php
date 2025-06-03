<?php
/**
 * @api {get} /api_get_categorias.php Listar todas as categorias de pizzas
 * @apiName GetCategorias
 * @apiGroup Categorias
 *
 * @apiSuccess {Boolean} success Indica sucesso da operação
 * @apiSuccess {Object[]} categorias Lista de categorias
 * @apiSuccess {Number} categorias.categoria_id ID da categoria
 * @apiSuccess {String} categorias.categoria Nome da categoria
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem informando o erro
 * @apiError {String} error Detalhes técnicos do erro (quando disponível)
 *
 * @apiMethod GET
 */

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
