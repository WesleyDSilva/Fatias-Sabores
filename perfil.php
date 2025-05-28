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
    <link rel="icon" type="image/png" href="/img/logo_pizza.png"> <!--Ícone do site-->
    <title>Fatias&Sabores - Perfil</title>
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
                        <a href="carrinho.html" class="btn me-2"
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
        <!-- SEÇÃO 1 -->
        <section>
            <div class="d-flex align-items-center justify-content-center mb-3"
                style="background: #FFA831; color: #ffffff;">
                <img src="/img/perfil.png" style="width: 35px; height: 35px;">
                <h2 class="m-0 mb-2"><b>Meu perfil</b></h2>
            </div>

            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-md-8 col-lg-6">
                        <!-- Foto de Perfil -->
                        <div class="row mb-4">
                            <div class="col-12 text-center">
                                <img src="/img/usuario.png" alt="Foto do Perfil" class="rounded-circle"
                                    style="width: 150px; height: 150px; object-fit: cover;">
                            </div>
                        </div>

                        <!-- Formulário de Dados -->
                        <form id="profileForm">
                            <div class="card">
                                <div class="card-body">
                                    <!-- Campos do formulário -->
                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">Nome:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="nome" name="nome" disabled>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">CPF:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="cpf" disabled readonly>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">Telefone:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="telefone" name="telefone"
                                                disabled>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">E-mail:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="email" class="form-control" id="email" name="email" disabled>
                                        </div>
                                    </div>

                                    <!-- Campos de Endereço -->
                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">Logradouro:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="logradouro" name="logradouro"
                                                disabled>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">Número:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="numero_casa" name="numero_casa"
                                                disabled>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">Cidade:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="cidade" name="cidade" disabled>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">UF:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="uf" name="uf" disabled
                                                maxlength="2">
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">CEP:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="cep" name="cep" disabled>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <label class="col-5 col-sm-4 fw-bold">Complemento:</label>
                                        <div class="col-7 col-sm-8">
                                            <input type="text" class="form-control" id="complemento" name="complemento"
                                                disabled>
                                        </div>
                                    </div>

                                    <!-- Alteração de Senha -->
                                    <div class="row mb-4">
                                        <div class="col-12 text-center">
                                            <a href="#" id="changePassword" class="btn btn-link">Alterar Senha</a>
                                            <div id="passwordFields" style="display: none;">
                                                <input type="password" class="form-control mt-2" id="senha"
                                                    placeholder="Nova Senha">
                                                <input type="password" class="form-control mt-2" id="confirmar_senha"
                                                    placeholder="Confirmar Nova Senha">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Botões -->
                                    <div class="row">
                                        <div class="col-6">
                                            <button type="button" id="editButton" class="btn w-100"
                                                style="border-radius: 30px; background-color: #FFEACE;">
                                                <b>Editar Perfil</b>
                                            </button>
                                        </div>
                                        <div class="col-6">
                                            <button type="submit" id="saveButton" class="btn w-100"
                                                style="border-radius: 30px; background-color: #FFA831; display: none;">
                                                <b>Salvar</b>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>


        <!-- SEÇÃO 3: APP -->
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
        <!-- FIM da SEÇÃO 3 -->
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
    <script>
        // Obter ID do cliente do localStorage
        function getClienteId() {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            return usuario ? usuario.id : null;
        }

        // Carregar dados do usuário
        async function carregarDadosUsuario() {
            const userId = getClienteId();
            if (!userId) window.location.href = 'login.html';

            try {
                const response = await fetch(`/api/api_get_user.php?id=${userId}`);
                const data = await response.json();

                if (data.error) throw new Error(data.message);

                // Preencher campos
                document.getElementById('nome').value = data.nome;
                document.getElementById('cpf').value = data.cpf;
                document.getElementById('telefone').value = data.telefone;
                document.getElementById('email').value = data.email;
                document.getElementById('logradouro').value = data.logradouro;
                document.getElementById('numero_casa').value = data.numero_casa;
                document.getElementById('cidade').value = data.cidade;
                document.getElementById('uf').value = data.UF;
                document.getElementById('cep').value = data.cep;
                document.getElementById('complemento').value = data.complemento || '';
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                alert('Erro ao carregar dados do usuário!');
            }
        }

        // Habilitar edição
        document.getElementById('editButton').addEventListener('click', () => {
            const campos = document.querySelectorAll('#profileForm input:not([readonly])');
            campos.forEach(campo => campo.disabled = false);
            document.getElementById('editButton').style.display = 'none';
            document.getElementById('saveButton').style.display = 'block';
        });

        // Enviar atualização
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                id: getClienteId(),
                nome: document.getElementById('nome').value,
                telefone: document.getElementById('telefone').value,
                email: document.getElementById('email').value,
                logradouro: document.getElementById('logradouro').value,
                numeroCasa: document.getElementById('numero_casa').value,
                cidade: document.getElementById('cidade').value,
                UF: document.getElementById('uf').value,
                cep: document.getElementById('cep').value,
                complemento: document.getElementById('complemento').value,
                senha: document.getElementById('senha').value || null
            };

            try {
                const response = await fetch('/api/api_update_user.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Dados atualizados com sucesso!');
                    window.location.reload();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Erro na atualização:', error);
                alert(`Erro ao atualizar: ${error.message}`);
            }
        });

        // Alternar campos de senha
        document.getElementById('changePassword').addEventListener('click', (e) => {
            e.preventDefault();
            const passwordFields = document.getElementById('passwordFields');
            passwordFields.style.display = passwordFields.style.display === 'none' ? 'block' : 'none';
        });

        // Carregar dados ao iniciar
        document.addEventListener('DOMContentLoaded', carregarDadosUsuario);
    </script>
    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>