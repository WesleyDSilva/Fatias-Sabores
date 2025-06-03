<?php
session_start();
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['user'])) {
    $_SESSION['funcionario_id'] = $data['user']['id'] ?? null;
    $_SESSION['tipo_usuario'] = $data['user']['tipo_usuario'] ?? null;
    $_SESSION['nivel_admin'] = $data['user']['nivel_admin'] ?? null;
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Dados inválidos"]);
}

?>
