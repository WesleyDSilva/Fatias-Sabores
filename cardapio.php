<?php
// 1. Inicia ou resume a sessão existente.
session_start();

// 2. Verifica se o usuário está logado.
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    header('Location: login.html'); // Redireciona para login se não estiver logado
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/img/logo_pizza.png">
    <title>Fatias&Sabores - Cardápio</title>
    <!-- CSS Personalizado -->
    <link rel="stylesheet" href="/css/styles.css"> <!-- Caminho absoluto para CSS -->
    <!-- Fonte Poppins -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet">
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <!-- Ícones Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <style>
        /* Estilos adicionais para garantir visibilidade e espaçamento */
        .product-section {
            padding-top: 2rem;
            padding-bottom: 2rem;
        }

        .section-title {
            margin-bottom: 2rem;
            font-weight: bold;
        }

        /* Para garantir que os cards tenham uma altura mínima e o conteúdo não empurre o botão para fora */
        .card-body {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .card-text {
            flex-grow: 1;
            /* Permite que o texto do card cresça */
        }
    </style>
</head>

<body class="d-flex flex-column min-vh-100">

    <!-- Menu (Scripts.js deve estar atualizando este menu dinamicamente) -->
    <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.php">
                <img src="/img/logo_pizza.png" class="img-fluid" alt="Logo" width="72px">
                <b>Fatias &</b> Sabores
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMenu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarMenu">
                <ul class="navbar-nav align-items-center">
                    <li class="nav-item"><a class="nav-link" href="index.php">Início</a></li>
                    <li class="nav-item"><a class="nav-link" href="cardapio.php">Cardápio</a></li>
                    <!-- Itens de menu dinâmicos (scripts.js irá popular com base no login) -->
                    <li class="nav-item" id="menu-cadastro"><a class="nav-link" href="cadastro.html">Cadastre-se</a>
                    </li>
                    <li class="nav-item" id="menu-fav" style="display: none;"></li>
                    <!-- Oculto por padrão, JS mostra se logado -->
                    <li class="nav-item" id="menu-login">
                        <a href="login.html" class="btn me-2"
                            style="border-radius: 30px; color: #FFF; background-color: #FFA831;">
                            <img src="/img/perfil.png" style="width: 24px; height: 24px;"> LOGIN
                        </a>
                    </li>
                    <li class="nav-item" id="menu-perfil" style="display: none;"></li>
                    <!-- Para "Olá, Nome!" e botão Sair -->
                    <li class="nav-item">
                        <a href="carrinho.php" class="btn me-2"
                            style="border-radius: 30px; color: #FFF; background-color: #FFA831; width: auto;">
                            <img src="/img/carrinho.png" style="width: 24px; height: 24px;"> CARRINHO
                            <span id="cart-count-badge-nav" class="badge bg-danger ms-1">0</span> <!-- ID CORRIGIDO -->
                        </a>
                    </li>
                    <li class="nav-item" id="menu-adm" style="display: none;"></li>
                    <!-- Para botão Sair se 'menu-perfil' não for usado para isso -->
                </ul>
            </div>
        </div>
    </nav>
    <!-- FIM DO MENU -->

    <main class="flex-grow-1">
        <!-- SEÇÃO 1: Título do Cardápio e Filtro -->
        <section style="background: #FFA831; color: #ffffff;">
            <div class="container py-4">
                <h1 class="text-center m-0"><b>NOSSO CARDÁPIO</b></h1>
                <p class="text-center mb-3">Escolha suas delícias favoritas!</p>
                <div class="row justify-content-center">
                    <div class="col-md-8 col-lg-6 col-xl-4">
                        <label for="category-filter-select" class="form-label text-white small">Filtrar por
                            Categoria:</label>
                        <select id="category-filter-select" class="form-select form-select-sm">
                            <option value="all">Todas as Categorias</option>
                            <!-- Opções de categoria serão inseridas aqui pelo JavaScript -->
                        </select>
                    </div>
                </div>
            </div>
        </section>

        <!-- As seções de produto devem estar inicialmente visíveis ou controladas pelo JS.
             Se o JS as oculta e depois mostra, elas precisam existir. -->

        <!-- SEÇÃO Pizzas -->
        <section id="pizzas-section" class="product-section" style="display: none;">
            <div class="container">
                <h2 class="text-center section-title" style="color: #FFA831;">Pizzas</h2>
                <div id="pizzas-container">
                    <div class="row">

                    </div>
                </div>
            </div>
        </section>

        <!-- SEÇÃO Hambúrgueres -->
        <section id="hamburguer-section" class="product-section bg-light" style="display: none;">
            <div class="container">
                <h2 class="text-center section-title" style="color: #FFA831;">Hambúrgueres & Wraps</h2>
                <div id="hamburguer-container">
                    <div class="row">

                    </div>
                </div>
            </div>
        </section>

        <!-- SEÇÃO Bebidas -->
        <section id="bebidas-section" class="product-section" style="display: none;">
            <div class="container">
                <h2 class="text-center section-title" style="color: #FFA831;">Bebidas & Sucos</h2>
                <div id="bebidas-container">
                    <div class="row">

                    </div>
                </div>
            </div>
        </section>

        <!-- SEÇÃO Sobremesas -->
        <section id="sobremesa-section" class="product-section bg-light" style="display: none;">
            <div class="container">
                <h2 class="text-center section-title" style="color: #FFA831;">Sobremesas</h2>
                <div id="sobremesa-container">
                    <div class="row">

                    </div>
                </div>
            </div>
        </section>


        <!--
        <section id="outros-section" class="product-section" style="display: none;">
            <div class="container">
                <h2 class="text-center section-title" style="color: #FFA831;">Outros</h2>
                <div id="outros-container">
                    <div class="row">
                    </div>
                </div>
            </div>
        </section>
        -->


        <!-- SEÇÃO APP (mantida como no seu original) -->
        <section style="background: #FFA831;">

        </section>
    </main>

    <!-- RODAPÉ (mantido como no seu original) -->
    <footer class="py-3 mt-auto" style="background: #FFA831; color: #FFFF">

    </footer>

    <!-- JavaScript -->
    <script src="/javascript/scripts.js"></script> <!-- Seu script global para menu, etc. -->
    <script src="/javascript/cardapio.js"></script> <!-- ESTE ARQUIVO -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>