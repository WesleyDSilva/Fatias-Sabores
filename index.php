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
    <link rel="icon" type="image/png" href="/img/logo_pizza.png"> <!--Ícone do site-->
    <title>Fatias&Sabores - Pizzaria</title>
    <!-- CSS Personalizado -->
    <link rel="stylesheet" href="css/styles.css">
    <!-- Fonte personalizada via google fonts (Poppins)-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet">
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>

<body class="d-flex flex-column min-vh-100">
    <!-- Menu com Bootstrap -->
    <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container-fluid">
            <!-- Logo -->
            <a class="navbar-brand" href="index.html">
                <img src="/img/logo_pizza.png" class="img-fluid" alt="Logo" width="72px">
                <b>Fatias &</b> Sabores
            </a>
            <!-- Toggle para mobile -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMenu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <!-- Itens do Menu -->
            <div class="collapse navbar-collapse justify-content-end" id="navbarMenu">
                <ul class="navbar-nav align-items-center">
                    <li class="nav-item"><a class="nav-link" href="index.html">Início</a></li>
                    <li class="nav-item"><a class="nav-link" href="cardapio.html">Cardápio</a></li>
                    <li class="nav-item" id="menu-cadastro">
                        <a class="nav-link" href="cadastro.html">Cadastre-se</a>
                    </li>
                    <li class="nav-item" id="menu-fav"></li>
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
                        </a>
                    </li>
                    <li class="nav-item" id="menu-adm"></li>
                </ul>
            </div>
        </div>
    </nav>
    <!-- FIM DO MENU -->

    <main class="flex-grow-1">
        <!-- SEÇÃO 1: NOVO SABOR -->
        <section>
            <div class="container" style="background: #FFA831; border-radius: 15px;">
                <div class="row align-items-center new-pizza-card">
                    <div class="col-md-5">
                        <h1><b>NOVIDADE:</b></h1>
                        <h2>SABOROSA DE OZ: A pizza que tem o sabor da nossa cidade! 🍕🌆</h2>
                        <button class="btn m-1" data-bs-toggle="modal" data-bs-target="#NovaPizza"
                            style="border-radius: 30px; color: #000000; background-color: #fafafa;">Ver mais 😋</button>
                    </div>
                    <div class="col-md-7">
                        <img src="/img/Pizza_OZ.png" alt="Nova Pizza" class="img-fluid">
                    </div>
                </div>
            </div>
        </section>

        <!-- Modal de novo sabor -->
        <div class="modal fade" id="NovaPizza" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">SABOROSA DE OZ 🍕</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Para os verdadeiros Osasquenses de coração, chegou a pizza que une tradição e ousadia! Com
                            ingredientes frescos e combinações feitas sob medida para o seu paladar, cada fatia é uma
                            viagem gastronômica pela essência de Osasco. Queijo derretido, toppings surpreendentes e um
                            toque especial que só quem ama esta cidade entenderá. É mais que pizza: é orgulho em forma
                            de massa! 🧀✨
                        </p>
                        <p>
                            Venha provar a Saborosa de Oz e descubra por que Osasco tem um novo motivo para sorrir (e se
                            deliciar)! 🔥</p>
                    </div>
                    <div class="modal-footer">
                        <p>
                        <h5>Faça login e peça já!</h5>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <!-- FIM Modal de novo sabor -->
        <!-- FIM da SEÇÃO 1 -->

        <!-- SEÇÃO 2: Promoções ativas -->
        <section class="py-4 promo-section">
            <div class="container">
                <div class="row text-center mb-4">
                    <div class="col-12">
                        <h1 class="promo-title"><b>🔥 Promoções Quentes!</b></h1>
                        <p class="promo-subtitle">Aproveite nossas ofertas antes que derretam! 🕒</p>
                    </div>
                </div>
                <div class="row justify-content-center g-4">
                    <div class="col-12 col-md-3">
                        <div class="promo-card">
                            <img src="/img/promo1.png" alt="Promo 1" class="promo-img">
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="promo-card">
                            <img src="/img/promo2.jpg" alt="Promo 2" class="promo-img">
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="promo-card">
                            <img src="/img/promo3.jpg" alt="Promo 3" class="promo-img">
                        </div>
                    </div>
                    <div class="col-12 col-md-3">
                        <div class="promo-card">
                            <img src="/img/promo4.jpg" alt="Promo 4" class="promo-img">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SEÇÃO 3: Historia -->
        <section>
            <div class="container" style="border-radius: 30px;">
                <div>
                    <div id="titsec2">
                        <b>Conheça-nos um pouco mais</b>
                    </div>
                    <div class="row g-md-4 py-3">
                        <!-- Card 1: O Começo -->
                        <div class="col-md-3 col-12 mb-4">
                            <div class="flip-card">
                                <div class="flip-card-inner">
                                    <div class="flip-card-front">
                                        <div class="overlay">
                                            <p>🏡</p>
                                            <h5>O Começo</h5>
                                        </div>
                                    </div>
                                    <div class="flip-card-back">
                                        <p>Fundada em 2024, o projeto começou como uma pequena loja de massa artesanal,
                                            conquistando a vizinhança com receitas autênticas. Com o tempo, a pizzaria
                                            cresceu, mantendo a essência caseira enquanto abraçava a modernidade.</p>
                                        <p>💬 Como diz Ana: 'Aqui, cada pizza conta uma história real — e todas têm o
                                            gosto de casa.'</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card 2: Atualidade -->
                        <div class="col-md-3 col-12 mb-4">
                            <div class="flip-card">
                                <div class="flip-card-inner">
                                    <div class="flip-card-front">
                                        <div class="overlay">
                                            <p>🚀</p>
                                            <h5>Atualidade</h5>
                                        </div>
                                    </div>
                                    <div class="flip-card-back">
                                        <p>Hoje, somos duas lojas físicas. Mas nosso orgulho vai além:</p>
                                        <p>🏆 App premiado<br>🏆 15 ex-alunos FATEC empregados</p>
                                        <p>💬 Como diz Eric: 'Tecnologia a serviço da tradição'.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card 3: Planos Futuros -->
                        <div class="col-md-3 col-12 mb-4">
                            <div class="flip-card">
                                <div class="flip-card-inner">
                                    <div class="flip-card-front">
                                        <div class="overlay">
                                            <p>🌍</p>
                                            <h5>Planos Futuros</h5>
                                        </div>
                                    </div>
                                    <div class="flip-card-back">
                                        <ul class="text-start">
                                            <p>Até 2026, queremos:</p>
                                            <p>✅ Pizza School Online: cursos gratuitos sobre empreendedorismo
                                                gastronômico<br>✅ Expansão consciente: Novos sabores sugeridos por você!
                                                (em teste)</p>
                                            <p>💬 Como diz Marcos: 'Crescer sim, perder a alma jamais'</p>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card 4: Legado Sustentável -->
                        <div class="col-md-3 col-12 mb-4">
                            <div class="flip-card">
                                <div class="flip-card-inner">
                                    <div class="flip-card-front">
                                        <div class="overlay">
                                            <p>🤝</p>
                                            <h5>Legado Sustentável</h5>
                                        </div>
                                    </div>
                                    <div class="flip-card-back">
                                        <p>Desde 2024, 3% do lucro é reinvestido em:</p>
                                        <p>🍅 Horta comunitária 'Saberes da Terra'<br>📚 Biblioteca gastronômica<br>🍴
                                            Programa 'Pizza do Bem'</p>
                                        <p>💬 Como diz Wesley: 'Tecnologia é ponte, não destino'."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </section>
        <!-- FIM da SEÇÃO 3 -->


        <!-- SEÇÃO 4: APP -->
        <section style="background: #FFA831;">
            <div class="container text-center py-2">
                <div class="row align-items-center">
                    <div class="col-md-10 text-center">
                        <p style="font-size: x-large; color: #FFFF;">Baixe o app da <b style="color: #000000;">Fatias &
                                Sabores</b> e acompanhe seu pedido na palma da mão!</p>
                        <div class="align-items-center">
                            <a href="#"><img src="/img/Googleplay.png" alt="Google Play" class="me-2" width="150"></a>
                            <a href="#"><img src="/img/Applestore.png" alt="App Store" width="150"></a>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <img src="/img/app_celular.webp" alt="App no Celular" class="img-fluid" width="160">
                    </div>
                </div>
            </div>
            <div>
                <p></p>
                <p></p>
            </div>
        </section>
        <!-- FIM da SEÇÃO 4 -->
    </main>

    <!-- RODAPÉ -->
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
    </footer>
    <!-- FIM do RODAPÉ -->

    <!-- JavaScript próprio -->
    <script src="/javascript/scripts.js"></script>
    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>