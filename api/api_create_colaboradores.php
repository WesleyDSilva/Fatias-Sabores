<?php
header('Content-Type: application/json');

// Importando conexão com o Banco de Dados
// require_once __DIR__ . '/../db_config/config.php';
require_once 'banco_connect.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            isset($data['nome']) &&
            isset($data['cargo']) &&
            isset($data['telefone']) &&
            isset($data['perfil']) &&
            isset($data['email']) &&
            isset($data['senha'])
        ) {
            $nome = $data['nome'];
            $cargo = $data['cargo'];
            $telefone = $data['telefone'];
            $perfil = $data['perfil'];
            $email = $data['email'];
            $senha = password_hash($data['senha'], PASSWORD_DEFAULT);
            $placa = $data['placa'] ?? null;

            $stmt = $pdo->prepare("INSERT INTO Funcionarios (nome, cargo, telefone, perfil, login, senha, placa)
                                   VALUES (:nome, :cargo, :telefone, :perfil, :login, :senha, :placa)");

            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':cargo', $cargo);
            $stmt->bindParam(':telefone', $telefone);
            $stmt->bindParam(':perfil', $perfil);
            $stmt->bindParam(':login', $email);
            $stmt->bindParam(':senha', $senha);
            $stmt->bindParam(':placa', $placa);

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Funcionário cadastrado com sucesso"]);
            } else {
                echo json_encode(["success" => false, "message" => "Erro ao cadastrar funcionário!"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Todos os campos obrigatórios devem ser preenchidos!"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Método não permitido"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>