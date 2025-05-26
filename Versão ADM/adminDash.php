<?php
/*
session_start();
if (!isset($_SESSION['admin_logado'])) {
header('Location: adminDash.php');
exit;
}

include 'conexao.php';

$mensagem = '';
$erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
$nome = $_POST['nome'] ?? '';
$funcao = $_POST['funcao'] ?? '';
$email = $_POST['email'] ?? '';
$senha_atual = $_POST['senha_atual'] ?? '';
$nova_senha = $_POST['nova_senha'] ?? '';
$confirmar_senha = $_POST['confirmar_senha'] ?? '';

if ($nome && $funcao && $email && $nova_senha && $confirmar_senha) {
if ($nova_senha !== $confirmar_senha) {
$erro = "A nova senha e a confirmação não coincidem.";
} else {
// Verifica se o e-mail já existe
$stmt = $pdo->prepare("SELECT * FROM colaboradores WHERE email = ?");
$stmt->execute([$email]);
$existe = $stmt->fetch();

if ($existe && !password_verify($senha_atual, $existe['senha'])) {
$erro = "Senha atual incorreta.";
} else {
$senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);

if ($existe) {
  // Atualiza colaborador
  $stmt = $pdo->prepare("UPDATE colaboradores SET nome = ?, funcao = ?, senha = ? WHERE email = ?");
  $stmt->execute([$nome, $funcao, $senha_hash, $email]);
  $mensagem = "Colaborador atualizado com sucesso!";
} else {
  // Insere novo colaborador
  $stmt = $pdo->prepare("INSERT INTO colaboradores (nome, funcao, email, senha) VALUES (?, ?, ?, ?)");
  $stmt->execute([$nome, $funcao, $email, $senha_hash]);
  $mensagem = "Novo colaborador inserido!";
}
}
}
} else {
$erro = "Preencha todos os campos obrigatórios.";
}
}*/
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin | Painel de Colaboradores</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #FFA831;
      padding: 10px 30px;
    }

    .logo img {
      height: 60px;
    }

    nav a {
      margin-left: 20px;
      text-decoration: none;
      color: #333;
      font-weight: bold;
    }

    .admin-title {
      background-color: #FFA831;
      text-align: center;
      font-size: 1.5em;
      font-weight: bold;
      padding: 10px;
    }

    .main {
      display: flex;
    }

    .sidebar {
      width: 200px;
      background-color: #FFA831;
      padding: 20px;
      min-height: 100vh;
    }

    .sidebar a {
      display: block;
      padding: 10px 0;
      color: #000;
      text-decoration: none;
      font-weight: bold;
    }

    .content {
      flex: 1;
      padding: 40px;
    }

    .content h2 {
      margin-bottom: 10px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    .button-orange {
      background-color: #FFA831;
      border: none;
      padding: 12px 20px;
      border-radius: 5px;
      color: #fff;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
    }

    .top-action {
      text-align: right;
      margin-bottom: 20px;
    }

    .mensagem {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 5px;
      font-weight: bold;
    }

    .mensagem.sucesso {
      background: #d4edda;
      color: #155724;
    }

    .mensagem.erro {
      background: #f8d7da;
      color: #721c24;
    }

    footer {
      background-color: #FFA831;
      text-align: center;
      padding: 20px;
      color: white;
    }
  </style>
</head>

<body>
  <header>
    <div class="logo">
      <img src="logo.png" alt="Fatias & Sabores">
    </div>

  </header>

  <div class="admin-title">Administrador</div>

  <div class="main">
    <div class="sidebar">
      <a href="#home">HOME</a>
      <a href="#colaboradores">COLABORADORES</a>
      <a href="#produtos">PRODUTOS</a>
      <a href="#pedidos">PEDIDOS</a>
    </div>

    <div class="content">
      <div class="top-action">
        <button class="button-orange">INSERIR NOVO COLABORADOR</button>
      </div>

      <h2>COLABORADORES</h2>
      <!--
      <?php //if ($mensagem): ?>
        <div class="mensagem sucesso"><?= htmlspecialchars($mensagem) ?></div>
      <?php //elseif ($erro): ?>
        <div class="mensagem erro"><?= htmlspecialchars($erro) ?></div>
      <?php //endif; ?>
      -->
      <form method="post">
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" name="nome" placeholder="Nome completo do colaborador" required>
        </div>
        <div class="form-group">
          <label for="funcao">Função</label>
          <input type="text" id="funcao" name="funcao" placeholder="Cargo ou função" required>
        </div>
        <div class="form-group">
          <label for="email">E-mail Login</label>
          <input type="email" id="email" name="email" placeholder="email@exemplo.com" required>
        </div>
        <div class="form-group">
          <label for="senha_atual">Senha Atual</label>
          <input type="password" id="senha_atual" name="senha_atual"
            placeholder="Senha atual (ou deixe em branco se for novo)">
        </div>
        <div class="form-group">
          <label for="nova_senha">Nova Senha</label>
          <input type="password" id="nova_senha" name="nova_senha" placeholder="Nova senha" required>
        </div>
        <div class="form-group">
          <label for="confirmar_senha">Confirmação de Senha</label>
          <input type="password" id="confirmar_senha" name="confirmar_senha" placeholder="Confirme a nova senha"
            required>
        </div>
        <button class="button-orange" type="submit">SALVAR</button>
      </form>
    </div>
  </div>

  <footer>
    <p>Contato: (19) 7070-7070 | pizzaria@fatiasesabores.com</p>
    <p>Fatias & Sabores &copy; 2025</p>
  </footer>
</body>

</html>