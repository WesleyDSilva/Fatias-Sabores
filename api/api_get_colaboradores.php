<?php
header('Content-Type: application/json');
require_once 'banco_connect.php';

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão: " . $conn->connect_error]));
}

mysqli_set_charset($conn, "utf8");

$nome = isset($_GET['nome']) ? '%' . $conn->real_escape_string($_GET['nome']) . '%' : '%';

$query = $conn->prepare("SELECT funcionario_id, nome, cargo, placa, telefone, perfil FROM Funcionarios WHERE nome LIKE ?");
$query->bind_param("s", $nome);
$query->execute();
$result = $query->get_result();

$colaboradores = [];
while ($row = $result->fetch_assoc()) {
    $colaboradores[] = $row;
}

echo json_encode(["success" => true, "colaboradores" => $colaboradores]);

$query->close();
$conn->close();
