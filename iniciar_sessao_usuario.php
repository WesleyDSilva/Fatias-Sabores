<?php
session_start();

header("Content-Type: application/json");

$input = file_get_contents("php://input");
$userData = json_decode($input, true);

if ($userData && isset($userData['id'], $userData['nome'], $userData['email'])) {
    $_SESSION['user_id'] = $userData['id'];
    $_SESSION['user_nome'] = $userData['nome'];
    $_SESSION['user_email'] = $userData['email'];

    echo json_encode(array('success' => true, 'message' => 'Sessão PHP iniciada com sucesso.'));
} else {
    $_SESSION['user_id'] = null;
    $_SESSION['user_nome'] = null;
    $_SESSION['user_email'] = null;

    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'Dados do usuário inválidos ou ausentes para iniciar sessão.'));
}
?>