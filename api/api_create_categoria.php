<?php
header('Content-Type: application/json');
require_once 'banco_connect.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['categoria']) || empty(trim($data['categoria']))) {
            echo json_encode(["success" => false, "message" => "Categoria é obrigatória."]);
            exit;
        }

        $categoria = trim($data['categoria']);

        // Verifica se já existe
        $check = $pdo->prepare("SELECT COUNT(*) FROM Categoria WHERE categoria = :categoria");
        $check->bindParam(':categoria', $categoria);
        $check->execute();
        $existe = $check->fetchColumn();

        if ($existe > 0) {
            echo json_encode(["success" => false, "message" => "Categoria já existe."]);
            exit;
        }

        // Inserir nova categoria
        $stmt = $pdo->prepare("INSERT INTO Categoria (categoria) VALUES (:categoria)");
        $stmt->bindParam(':categoria', $categoria);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Categoria cadastrada com sucesso!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro ao cadastrar categoria."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Método não permitido. Use POST."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
