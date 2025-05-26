<?php
session_start();
$erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  include 'conexao.php'; // arquivo que contém conexão com o banco

  $email = $_POST['email'] ?? '';
  $senha = $_POST['senha'] ?? '';

  if ($email && $senha) {
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($senha, $admin['senha'])) {
      $_SESSION['admin_logado'] = true;
      $_SESSION['admin_email'] = $admin['email'];
      header('Location: admin-dashboard.php');
      exit;
    } else {
      $erro = "E-mail ou senha inválidos!";
    }
  } else {
    $erro = "Preencha todos os campos.";
  }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Admin | Fatias & Sabores</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #fff;
      color: #333;
    }

    header {
      background-color: #FFA831;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 30px;
    }

    .logo img { height: 60px; }

    nav a {
      margin-left: 20px;
      text-decoration: none;
      color: #333;
      font-weight: bold;
    }

    .container {
      max-width: 400px;
      margin: 60px auto;
      padding: 20px;
      text-align: center;
    }

    .container h2 { margin-bottom: 10px; }

    .slogan {
      font-size: 1.1em;
      color: #E85A00;
      font-weight: bold;
      margin: 20px 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    input[type="email"],
    input[type="password"] {
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
    }

    button {
      background-color: #FFA831;
      color: #fff;
      padding: 12px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }

    .erro {
      color: red;
      font-size: 0.9em;
      margin-top: 10px;
    }

    .forgot { text-align: right; font-size: 0.9em; }

    .forgot a { text-decoration: none; color: #E85A00; }

    .register-link {
      margin-top: 10px;
      font-size: 0.9em;
    }

    .register-link a {
      color: #E85A00;
      text-decoration: none;
    }

    footer {
      background-color: #FFA831;
      text-align: center;
      padding: 20px;
      color: white;
      margin-top: 60px;
    }

    .app-download img {
      height: 40px;
      margin: 0 10px;
    }
  </style>
</head>

<body>
  <header>
    <div class="logo">
      <img src="logo.png" alt="Fatias & Sabores">
    </div>
    <nav>
      <a href="#inicio">Início</a>
      <a href="#cardapio">Cardápio</a>
      <a href="#cadastro">Cadastre-se</a>
      <a href="#login">Login</a>
      <a href="#carrinho">Carrinho</a>
      <a href="#admin">Admin</a>
    </nav>
  </header>

  <div class="container">
    <div class="slogan">A felicidade começa com uma fatia: descubra o sabor que conquista a cada mordida!</div>
    <h2>LOGIN ADMINISTRADOR</h2>
    <p>Realize seu login para acessar o painel administrativo.</p>
    
    <?php if ($erro): ?>
      <div class="erro"><?= htmlspecialchars($erro) ?></div>
    <?php endif; ?>

    <form method="post">
      <input type="email" name="email" placeholder="E-mail" required>
      <input type="password" name="senha" placeholder="Senha" required>
      <div class="forgot"><a href="#">Esqueceu a senha?</a></div>
      <button type="submit">ENTRAR</button>
    </form>
    
    <div class="register-link">
      Não tem acesso? <a href="#">Solicite ao suporte</a>
    </div>
  </div>

  <footer>
    <p>Baixe o app da Fatias & Sabores e acompanhe seu pedido na palma da mão!</p>
    <div class="app-download">
      <img src="google-play.png" alt="Google Play">
      <img src="app-store.png" alt="App Store">
    </div>
    <p>Contato: (19) 7070-7070 | pizzaria@fatiasesabores.com</p>
    <p>Fatias & Sabores &copy; 2025</p>
  </footer>
</body>
</html>
