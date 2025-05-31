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
      <ul>
        <!-- FUTURAMENTE HOME DEVERÁ SER LISTA DOS PEDIDOS -->
        <li><a href="adminDash.php">Home</a></li> 
        <li><a href="novo-colaborador.php">Colaboradores</a></li>
        <li><a href="editar-pizzas.php">Pizzas</a></li>
        <li><a href="editar-bebidas.php">Bebidas</a></li>
        <li><a href="editar-sobremesas.php">Sobremesas</a></li>
        <!-- <li><a href="#">Pedidos</a></li> -->
      </ul>
    </div>

    <div class="content">
      <h2>Todos os Pedidos</h2>
      <p>Visualize abaixo todos os pedidos cadastrados no sistema.</p>

      <div id="tabelaPedidos">🔄 Carregando pedidos...</div>
    </div>
  </div>

  <footer>
    <p>Contato: (19) 7070-7070 | pizzaria@fatiasesabores.com</p>
    <p>Fatias & Sabores &copy; 2025</p>
  </footer>

<script>
  async function carregarTodosPedidos() {
    const div = document.getElementById("tabelaPedidos");
    div.innerHTML = "🔄 Carregando...";

    try {
      const res = await fetch("../api/api_get_all_pedidos.php");
      const pedidos = await res.json();

      if (pedidos.error) {
        div.innerHTML = `<p style="color:red;">❌ ${pedidos.message}</p>`;
        return;
      }

      if (pedidos.length === 0) {
        div.innerHTML = "<p style='color:gray;'>Nenhum pedido encontrado.</p>";
        return;
      }

      let html = `
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <thead style="background-color: #FFA831; color: #fff;">
            <tr>
              <th>ID</th>
              <th>Nº Pedido</th>
              <th>Data</th>
              <th>Total (R$)</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Tam.</th>
              <th>Tipo Tam.</th>
              <th>Troco</th>
              <th>Obs</th>
            </tr>
          </thead>
          <tbody>
      `;

      pedidos.forEach(p => {
        html += `
          <tr>
            <td>${p.pedido_id}</td>
            <td>${p.n_pedido}</td>
            <td>${new Date(p.data_pedido).toLocaleString('pt-BR')}</td>
            <td>${parseFloat(p.total).toFixed(2)}</td>
            <td>${p.status}</td>
            <td>${p.forma_pagamento}</td>
            <td>${p.produto_id}</td>
            <td>${p.quantidade}</td>
            <td>${p.tamanho || '-'}</td>
            <td>${p.tipo_tamanho || '-'}</td>
            <td>${p.troco_para ? parseFloat(p.troco_para).toFixed(2) : '-'}</td>
            <td>${p.obs || '-'}</td>
          </tr>
        `;
      });

      html += "</tbody></table>";
      div.innerHTML = html;
    } catch (err) {
      div.innerHTML = `<p style="color:red;">❌ Erro ao carregar pedidos: ${err.message}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", carregarTodosPedidos);
</script>


</body>

</html>