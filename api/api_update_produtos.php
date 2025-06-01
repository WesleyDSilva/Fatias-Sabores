<?php
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
