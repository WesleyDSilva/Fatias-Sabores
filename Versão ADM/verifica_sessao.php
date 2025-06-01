<?php
session_start();

// Se não estiver logado, redireciona para o formulário de login
if (!isset($_SESSION['funcionario_id']) || !isset($_SESSION['tipo_usuario'])) {
    header('Location: admin.html'); 
    exit;
}
?>