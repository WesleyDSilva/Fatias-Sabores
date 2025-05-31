<?php
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
