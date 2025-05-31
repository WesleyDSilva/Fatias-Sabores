<?php
session_start();
require_once '../api/banco_connect.php';

$mensagem = '';
$erro = '';

// Verifica se é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $nome = $_POST['nome'] ?? '';
  $funcao = $_POST['funcao'] ?? '';
  $email = $_POST['email'] ?? '';
  $senha = $_POST['senha'] ?? '';
  $confirmar_senha = $_POST['confirma_senha'] ?? '';

  // Verifica se todos os campos foram preenchidos
  if ($nome && $funcao && $email && $senha && $confirmar_senha) {
    if ($senha !== $confirmar_senha) {
      $erro = "A senha e a confirmação não coincidem.";
    } else {
      // Verifica se o colaborador já existe
      $stmt = $pdo->prepare("SELECT * FROM colaboradores WHERE email = ?");
      $stmt->execute([$email]);
      $existe = $stmt->fetch();

      $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

      if ($existe) {
        // Atualiza colaborador existente
        $stmt = $pdo->prepare("UPDATE colaboradores SET nome = ?, funcao = ?, senha = ? WHERE email = ?");
        $stmt->execute([$nome, $funcao, $senha_hash, $email]);
        $mensagem = "Colaborador atualizado com sucesso!";
      } else {
        // Insere novo colaborador
        $stmt = $pdo->prepare("INSERT INTO colaboradores (nome, funcao, email, senha) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nome, $funcao, $email, $senha_hash]);
        $mensagem = "Novo colaborador inserido com sucesso!";
      }
    }
  } else {
    $erro = "Preencha todos os campos obrigatórios.";
  }
}

if ($erro) {
  header("Location: novo-colaborador.php?erro=" . urlencode($erro));
  exit;
} else {
  header("Location: novo-colaborador.php?sucesso=" . urlencode($mensagem));
  exit;
}
?>
