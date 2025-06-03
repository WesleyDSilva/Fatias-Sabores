<?php
/**
 * @api {put} /api_update_produtos.php Atualizar produto
 * @apiName AtualizarProduto
 * @apiGroup Produto
 *
 * @apiDescription Atualiza os dados de um produto existente pelo seu ID.
 *
 * @apiHeader {String} Content-Type application/json
 *
 * @apiParam {Number} produto_id ID do produto a ser atualizado (obrigatório)
 * @apiParam {String} nome Nome do produto (obrigatório)
 * @apiParam {String} detalhes Detalhes do produto (obrigatório)
 * @apiParam {Number} categoria_id ID da categoria do produto (obrigatório)
 * @apiParam {String} [ingredientes] Ingredientes do produto (opcional)
 * @apiParam {Decimal} [pequena] Preço tamanho pequena (opcional)
 * @apiParam {Decimal} [media] Preço tamanho média (opcional)
 * @apiParam {Decimal} [grande] Preço tamanho grande (opcional)
 * @apiParam {Decimal} [media_inteira] Preço média inteira (opcional)
 * @apiParam {Decimal} [grande_inteira] Preço grande inteira (opcional)
 * @apiParam {String} [caminho] Caminho da imagem do produto (opcional)
 *
 * @apiSuccess {Boolean} success Indica se a atualização foi bem-sucedida
 * @apiSuccess {String} message Mensagem explicativa
 *
 * @apiSuccessExample {json} Sucesso
 *  {
 *    "success": true,
 *    "message": "Produto atualizado com sucesso."
 *  }
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem explicando o erro
 *
 * @apiErrorExample {json} Dados obrigatórios ausentes
 *  {
 *    "success": false,
 *    "message": "Dados obrigatórios ausentes."
 *  }
 *
 * @apiErrorExample {json} Método inválido
 *  {
 *    "success": false,
 *    "message": "Método inválido. Use PUT."
 *  }
 */

header('Content-Type: application/json');
require_once 'banco_connect.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !isset($data['produto_id']) || !is_numeric($data['produto_id']) ||
            empty(trim($data['nome'])) || empty(trim($data['detalhes'])) || !isset($data['categoria_id'])
        ) {
            echo json_encode(["success" => false, "message" => "Dados obrigatórios ausentes."]);
            exit;
        }

        $sql = "UPDATE Produtos SET 
                    nome = :nome,
                    ingredientes = :ingredientes,
                    detalhes = :detalhes,
                    pequena = :pequena,
                    media = :media,
                    grande = :grande,
                    media_inteira = :media_inteira,
                    grande_inteira = :grande_inteira,
                    caminho = :caminho,
                    categoria_id = :categoria_id
                WHERE produto_id = :produto_id";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':nome' => $data['nome'],
            ':ingredientes' => $data['ingredientes'] ?? '',
            ':detalhes' => $data['detalhes'],
            ':pequena' => $data['pequena'] ?? null,
            ':media' => $data['media'] ?? null,
            ':grande' => $data['grande'] ?? null,
            ':media_inteira' => $data['media_inteira'] ?? null,
            ':grande_inteira' => $data['grande_inteira'] ?? null,
            ':caminho' => $data['caminho'] ?? '',
            ':categoria_id' => $data['categoria_id'],
            ':produto_id' => $data['produto_id']
        ]);

        echo json_encode(["success" => true, "message" => "Produto atualizado com sucesso."]);
    } else {
        echo json_encode(["success" => false, "message" => "Método inválido. Use PUT."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro: " . $e->getMessage()]);
}
