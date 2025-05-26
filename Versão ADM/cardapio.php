<?php
session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['usuario_id'])) {
    // Redireciona para a página de login
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fatias & Sabores</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #fff8f0;
    }

    header {
      background-color: #FFA831;
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .hero {
      text-align: center;
      padding: 30px 0;
      font-size: 2em;
      color: #333;
    }

    .cardapio-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 0 30px 50px;
    }

    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .card img {
      width: 120px;
      height: auto;
    }

    .card h3 {
      margin: 10px 0 5px;
    }

    .card p {
      font-size: 0.9em;
      color: #444;
    }

    .price {
      font-weight: bold;
      margin: 10px 0;
    }

    .btn-add {
      background-color: #FFA831;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }

    footer {
      background-color: #FFA831;
      text-align: center;
      padding: 20px;
      color: #fff;
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

  <section class="hero" id="cardapio">
    <h1>Cardápio</h1>
  </section>

  <section class="cardapio-container">
    <div class="card">
      <img src="pizza1.png" alt="Pepperoni">
      <h3>Pepperoni - R$54,90</h3>
      <p>Molho de tomate, queijo mussarela, rodelas de pepperoni e orégano.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <img src="pizza2.png" alt="Milho">
      <h3>Milho - R$45,90</h3>
      <p>Molho de tomate, queijo, milho verde e orégano.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <img src="pizza3.png" alt="Marguerita">
      <h3>Marguerita - R$49,90</h3>
      <p>Molho de tomate, queijo, tomate em rodelas e manjericão fresco.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <img src="pizza4.png" alt="Mexicana">
      <h3>Mexicana - R$56,90</h3>
      <p>Molho picante, queijo, carne moída, jalapeños e cebola roxa.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <img src="pizza5.png" alt="Toscana">
      <h3>Toscana - R$52,90</h3>
      <p>Molho de tomate, queijo, linguiça toscana, cebola e orégano.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <img src="pizza6.png" alt="Sabores da Casa">
      <h3>Sabores da Casa - R$59,90</h3>
      <p>Receita especial da casa com ingredientes surpresa!</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <img src="pizza7.png" alt="Frango com Catupiry">
      <h3>Frango com Catupiry - R$53,90</h3>
      <p>Molho de tomate, queijo, frango desfiado e catupiry.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <img src="pizza8.png" alt="Vegetariana">
      <h3>Vegetariana - R$51,90</h3>
      <p>Molho de tomate, queijo, abobrinha, berinjela, tomate e orégano.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
  </section>

  <section class="hero">
    <h2>Bebidas</h2>
  </section>

  <section class="cardapio-container">
    <div class="card">
      <h3>Refrigerante - R$6,00</h3>
      <p>Lata 350ml - Escolha entre Coca, Guaraná, Fanta.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <h3>Suco Natural - R$7,00</h3>
      <p>Sabores: Laranja, Limão, Abacaxi. 300ml.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
    <div class="card">
      <h3>Água - R$3,00</h3>
      <p>Com ou sem gás - Garrafa 500ml.</p>
      <button class="btn-add">Adicionar ao Carrinho</button>
    </div>
  </section>

  <footer>
    <p>Contato: (19) 7070-7070 | pizzaria@fatiasesabores.com</p>
    <p>Fatias & Sabores &copy; 2025</p>
  </footer>
</body>

</html>
