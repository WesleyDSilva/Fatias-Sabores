<?php
// 1. Inicia ou resume a sessão existente.
// Deve ser a PRIMEIRA coisa no script, antes de QUALQUER saída HTML.
session_start();

// 2. Verifica se o usuário está logado.
// A variável $_SESSION['user_id'] deve ter sido definida por 'iniciar_sessao_usuario.php'
// após um login bem-sucedido através da sua página login.html.
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    // Usuário não está logado. Redireciona para a página de login.
    // Certifique-se que 'login.html' é o nome correto e está no mesmo diretório
    // ou ajuste o caminho.
    header('Location: login.html');
    exit(); // Importante: Impede que o restante do HTML da página seja processado.
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/img/logo_pizza.png">
    <title>Fatias&Sabores - Histórico de Pedidos</title>
    <!-- Adicione seus links CSS (Bootstrap, seu styles.css) -->
    <link rel="stylesheet" href="css/styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet">
    <style>
        .pedido-card {
            margin-bottom: 1.5rem;
        }

        .pedido-header {
            background-color: #FFA831;
            color: white;
            padding: 0.75rem 1.25rem;
        }

        .pedido-status {
            font-weight: bold;
        }

        .item-pedido img {
            max-width: 80px;
            height: auto;
            margin-right: 10px;
        }

        .item-pedido {
            border-bottom: 1px solid #eee;
            padding-bottom: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .item-pedido:last-child {
            border-bottom: none;
        }
    </style>
</head>

<body class="d-flex flex-column min-vh-100">

    <!-- Seu Menu (copie do carrinho.php ou de outra página, certificando-se que os links estejam corretos) -->
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
                    <!-- O menu será atualizado pelo scripts.js se o usuário estiver logado -->
                    <li class="nav-item" id="menu-cadastro"><a class="nav-link" href="cadastro.html">Cadastre-se</a>
                    </li>
                    <li class="nav-item" id="menu-fav" style="display: none;"></li>
                    <li class="nav-item" id="menu-login">
                        <a href="login.html" class="btn me-2"
                            style="border-radius: 30px; color: #FFF; background-color: #FFA831;">
                            <img src="/img/perfil.png" style="width: 24px; height: 24px;"> LOGIN
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="carrinho.php" class="btn me-2"
                            style="border-radius: 30px; color: #FFF; background-color: #FFA831; width: auto;">
                            <img src="/img/carrinho.png" style="width: 24px; height: 24px;"> CARRINHO
                            <span class="badge bg-danger ms-1" id="cart-count-badge-nav">0</span>
                        </a>
                    </li>
                    <li class="nav-item" id="menu-adm"></li>
                </ul>
            </div>
        </div>
    </nav>
    <!-- FIM DO MENU -->

    <main class="container mt-4 flex-grow-1">
        <div class="d-flex align-items-center justify-content-center mb-3" style="background: #FFA831; color: #ffffff;">
            <h1 class="m-0 py-3"><b>Histórico de Pedidos</b></h1>
        </div>

        <div id="historico-pedidos-container">
            <p class="text-center">Carregando histórico de pedidos...</p>
            <!-- Os pedidos serão inseridos aqui pelo JavaScript -->
        </div>
    </main>

    <!-- Seu Rodapé (copie de outra página) -->
    <footer class="py-3 mt-auto" style="background: #FFA831; color: #FFFF">
        <div class="container">
            <div class="row">
                <div class="col-md-4 text-center">
                    <b>Dúvidas? Entre em contato:</b>
                    <p class="m-0"><img src="/img/Social_Direct.png" width="30" height="30"> fatiasesabores@pizzaria.com
                    </p>
                    <p class="m-0"><img src="/img/Social_Whats.png" width="30" height="30"> (11) 91234-5678</p>
                </div>
                <div class="col-md-4 text-center">
                    <b>Localização:</b>
                    <p><img src="/img/local.png" width="30" height="30">Rua das Pizzas Saborosas, 123<br>Osasco, São
                        Paulo</p>
                </div>
                <div class="col-md-4 text-center">
                    <b>Nossas redes sociais:</b>
                    <p>
                        <a href="https://www.facebook.com/"><img src="/img/Social_Facebook.png" width="65"
                                height="65"></a>
                        <a href="https://www.instagram.com/"><img src="/img/Social_Insta.png" width="65"
                                height="65"></a>
                        <a href="https://x.com/"><img src="/img/Social_X.png" width="65" height="65"></a>
                    </p>
                    <p>Siga-nos e compartilhe a felicidade em formato de pizza!</p>
                </div>
            </div>
        </div>
    </footer>
    <!-- FIM do RODAPÉ -->

    <script src="/javascript/scripts.js"></script> <!-- Seu scripts.js global com atualizarMenuUsuario() -->
    <script src="/javascript/pedidos.js"></script> <!-- Nosso novo script -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>