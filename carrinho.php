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

// Se o script chegou até aqui, o usuário está logado e pode acessar o conteúdo do carrinho.
// Você pode usar $_SESSION['user_nome'] para personalizar a página, por exemplo.
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/img/logo_pizza.png">
    <title>Fatias&Sabores - Carrinho</title>
    <!-- Seus links CSS -->
    <link rel="stylesheet" href="css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>

<body class="d-flex flex-column min-vh-100">
    <!-- 
    NÃO DEVE HAVER UM require_once "login.php"; AQUI EMBAIXO TAMBÉM.
    A lógica de sessão já está no topo.
    -->

    <!-- Menu com Bootstrap -->
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

                    <?php if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])): ?>


                        <li class="nav-item" id="menu-fav">
                            <!-- Link para Favoritos, se houver -->
                        </li>

                        <li class="nav-item" id="menu-cadastro">
                            <a class="nav-link" href="cadastro.html">Cadastre-se</a>
                        </li>
                        <li class="nav-item" id="menu-login">
                            <a href="login.php" class="btn me-2"
                                style="border-radius: 30px; color: #FFF; background-color: #FFA831;">
                                <img src="/img/perfil.png" style="width: 24px; height: 24px;"> LOGIN
                            </a>
                        </li>
                    <?php endif; ?>

                    <li class="nav-item">
                        <a href="carrinho.php" class="btn me-2"
                            style="border-radius: 30px; color: #FFF; background-color: #FFA831; width: auto;">
                            <img src="/img/carrinho.png" style="width: 24px; height: 24px;"> CARRINHO
                            <span class="badge bg-danger ms-1" id="cart-count-badge-nav">0</span>
                            <!-- Badge para contador -->
                        </a>
                    </li>
                    <li class="nav-item" id="menu-adm"></li>
                </ul>
            </div>
        </div>
    </nav>
    <!-- FIM DO MENU -->

    <!-- Restante do seu HTML do carrinho.php continua aqui -->
    <main class="flex-grow-1">
        <section>
            <div class="d-flex align-items-center justify-content-center mb-3"
                style="background: #FFA831; color: #ffffff;">
                <img src="/img/cart.png" class="img-fluid" style="max-height: 40px;">
                <h2 class="m-0 ms-2 mb-2"><b>Meu carrinho</b></h2>
            </div>
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-6">
                        <div id="carrinho-items">
                            <p class="text-center">Carregando itens do carrinho...</p>
                        </div>
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row justify-content-between align-items-center">
                                    <div class="col-9" id="resumo">
                                        <h4>Total do pedido:</h4>
                                    </div>
                                    <div class="col-3">
                                        <h4 id="total-pedido" class="text-danger">R$ 0,00</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="text-center mb-3">
                                    <h5 style="color: #FFA831;"><b>Falta pouco para se deliciar com nossos sabores!</b>
                                    </h5>
                                    <h1>Método de pagamento:</h1>
                                </div>
                                <div class="row text-center">
                                    <div class="col-4">
                                        <input type="radio" id="dinheiro" name="pagamento" value="dinheiro">
                                        <label for="dinheiro">Dinheiro</label>
                                    </div>
                                    <div class="col-4">
                                        <input type="radio" id="cartao" name="pagamento" value="cartao">
                                        <label for="cartao">Cartão</label>
                                    </div>
                                    <div class="col-4">
                                        <input type="radio" id="pix" name="pagamento" value="pix">
                                        <label for="pix">PIX</label>
                                    </div>
                                </div>
                                <div class="mt-3 d-flex align-items-center">
                                    <label for="troco" class="me-2">Troco para quanto?</label>
                                    <input type="number" id="troco" name="troco" min="0" step="0.01"
                                        class="form-control text-center"
                                        style="max-width: 200px; border-radius: 30px; border-style: solid; border-color: #000000;">
                                </div>
                                <div class="text-center mt-4">
                                    <a href="historico_pedidos.php" class="btn" id="btn-confirmar-pedido-link"
                                        style="border-radius: 30px; color: #fff; background-color: #FFA831;">
                                        <b>Confirmar meu pedido</b>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="py-3 mt-auto" style="background: #FFA831; color: #FFFF">
        <div class="container">
            <div class="row">
                <div class="col-md-4 text-center">
                    <b style="font-size: x-large">Dúvidas? Entre em contato:</b>
                    <p class="m-0"><img src="/img/Social_Direct.png" width="30" height="30"> fatiasesabores@pizzaria.com
                    </p>
                    <p class="m-0"><img src="/img/Social_Whats.png" width="30" height="30"> (11) 91234-5678</p>
                </div>
                <div class="col-md-4 text-center">
                    <b style="font-size: x-large">Localização:</b>
                    <p><img src="/img/local.png" width="30" height="30">Rua das Pizzas Saborosas, 123<br>Osasco, São
                        Paulo</p>
                </div>
                <div class="col-md-4 text-center">
                    <b style="font-size: x-large">Nossas redes sociais:</b>
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

    <script src="/javascript/scripts.js"></script>
    <script src="/javascript/carrinho.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>