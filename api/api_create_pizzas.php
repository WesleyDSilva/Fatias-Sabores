<?php
/**
 * @api {post} /api_create_pizzas.php Criar nova pizza/produto
 * @apiName CriarPizza
 * @apiGroup Produto
 *
 * @apiBody {String} nome Nome da pizza/produto (obrigatório)
 * @apiBody {Number} categoria_id ID da categoria da pizza/produto (obrigatório)
 * @apiBody {String} [ingredientes] Ingredientes da pizza/produto (opcional)
 * @apiBody {String} [detalhes] Detalhes adicionais do produto (opcional)
 * @apiBody {String} [caminho] Caminho da imagem do produto (opcional)
 * @apiBody {Number} [pequena] Preço da pizza tamanho pequena (opcional)
 * @apiBody {Number} [media] Preço da pizza tamanho média (opcional)
 * @apiBody {Number} [grande] Preço da pizza tamanho grande (opcional)
 * @apiBody {Number} [media_inteira] Preço da pizza média inteira (opcional)
 * @apiBody {Number} [grande_inteira] Preço da pizza grande inteira (opcional)
 *
 * @apiSuccess {Boolean} success Indica sucesso na criação do produto
 * @apiSuccess {String} message Mensagem explicativa
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Descrição do erro (ex: campos obrigatórios ausentes, erro na inserção)
 * @apiError {String} [error] Mensagem de erro do PDO (quando aplicável)
 */

header('Content-Type: application/json');

require_once 'banco_connect.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validação mínima obrigatória
        if (
            isset($data['nome']) &&
            isset($data['categoria_id'])
        ) {
            $nome         = $data['nome'];
            $categoria_id = $data['categoria_id'];

            // Campos opcionais (com fallback null)
            $ingredientes    = $data['ingredientes']    ?? null;
            $detalhes        = $data['detalhes']        ?? null;
            $caminho         = $data['caminho']         ?? null;

            // Preços opcionais (por tipo)
            $pequena         = isset($data['pequena'])         ? floatval($data['pequena']) : null;
            $media           = isset($data['media'])           ? floatval($data['media'])   : null;
            $grande          = isset($data['grande'])          ? floatval($data['grande'])  : null;
            $media_inteira   = isset($data['media_inteira'])   ? floatval($data['media_inteira']) : null;
            $grande_inteira  = isset($data['grande_inteira'])  ? floatval($data['grande_inteira']) : null;

            // Inserção
            $stmt = $pdo->prepare("
                INSERT INTO Produtos (
                    nome, ingredientes, detalhes, caminho, categoria_id,
                    pequena, media, grande, media_inteira, grande_inteira
                ) VALUES (
                    :nome, :ingredientes, :detalhes, :caminho, :categoria_id,
                    :pequena, :media, :grande, :media_inteira, :grande_inteira
                )
            ");

            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':ingredientes', $ingredientes);
            $stmt->bindParam(':detalhes', $detalhes);
            $stmt->bindParam(':caminho', $caminho);
            $stmt->bindParam(':categoria_id', $categoria_id);
            $stmt->bindParam(':pequena', $pequena);
            $stmt->bindParam(':media', $media);
            $stmt->bindParam(':grande', $grande);
            $stmt->bindParam(':media_inteira', $media_inteira);
            $stmt->bindParam(':grande_inteira', $grande_inteira);

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!"]);
            } else {
                echo json_encode(["success" => false, "message" => "Erro ao cadastrar produto."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Campos obrigatórios 'nome' e 'categoria_id' são necessários."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Método não permitido. Use POST."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
