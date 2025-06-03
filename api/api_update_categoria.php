<?php
/**
 * @api {put} /api_update_categoria.php Atualizar categoria
 * @apiName AtualizarCategoria
 * @apiGroup Categoria
 *
 * @apiDescription Atualiza o nome de uma categoria pelo seu ID.
 *
 * @apiHeader {String} Content-Type application/json
 *
 * @apiParam {Number} categoria_id ID da categoria a ser atualizada (obrigatório)
 * @apiParam {String} nova_categoria Novo nome da categoria (obrigatório)
 *
 * @apiSuccess {Boolean} success Indica se a atualização foi bem-sucedida
 * @apiSuccess {String} message Mensagem explicativa
 *
 * @apiSuccessExample {json} Sucesso
 *  {
 *    "success": true,
 *    "message": "Categoria atualizada com sucesso."
 *  }
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem explicando o erro
 *
 * @apiErrorExample {json} Dados inválidos
 *  {
 *    "success": false,
 *    "message": "Dados inválidos."
 *  }
 */

/**
 * @api {delete} /api_update_categoria.php Excluir categoria
 * @apiName ExcluirCategoria
 * @apiGroup Categoria
 *
 * @apiDescription Exclui uma categoria pelo seu ID, desde que não haja produtos vinculados.
 *
 * @apiHeader {String} Content-Type application/json
 *
 * @apiParam {Number} categoria_id ID da categoria a ser excluída (obrigatório)
 *
 * @apiSuccess {Boolean} success Indica se a exclusão foi bem-sucedida
 * @apiSuccess {String} message Mensagem explicativa
 *
 * @apiSuccessExample {json} Sucesso
 *  {
 *    "success": true,
 *    "message": "Categoria excluída com sucesso."
 *  }
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem explicando o erro
 *
 * @apiErrorExample {json} Categoria vinculada a produtos
 *  {
 *    "success": false,
 *    "message": "Categoria possui produtos vinculados e não pode ser excluída."
 *  }
 *
 * @apiErrorExample {json} ID inválido
 *  {
 *    "success": false,
 *    "message": "ID inválido."
 *  }
 */

header('Content-Type: application/json');
require_once 'banco_connect.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $method = $_SERVER['REQUEST_METHOD'];

    // ATUALIZAR CATEGORIA
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['categoria_id'], $data['nova_categoria']) || empty(trim($data['nova_categoria']))) {
            echo json_encode(["success" => false, "message" => "Dados inválidos."]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE Categoria SET categoria = :categoria WHERE categoria_id = :id");
        $stmt->execute([
            ':categoria' => trim($data['nova_categoria']),
            ':id' => $data['categoria_id']
        ]);

        echo json_encode(["success" => true, "message" => "Categoria atualizada com sucesso."]);
        exit;
    }

    // DELETAR CATEGORIA
    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['categoria_id']) || !is_numeric($data['categoria_id'])) {
            echo json_encode(["success" => false, "message" => "ID inválido."]);
            exit;
        }

        // Verifica se há produtos vinculados à categoria
        $check = $pdo->prepare("SELECT COUNT(*) FROM Produtos WHERE categoria_id = :id");
        $check->execute([':id' => $data['categoria_id']]);
        $qtd = $check->fetchColumn();

        if ($qtd > 0) {
            echo json_encode(["success" => false, "message" => "Categoria possui produtos vinculados e não pode ser excluída."]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM Categoria WHERE categoria_id = :id");
        $stmt->execute([':id' => $data['categoria_id']]);

        echo json_encode(["success" => true, "message" => "Categoria excluída com sucesso."]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Método não permitido."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro: " . $e->getMessage()]);
}
