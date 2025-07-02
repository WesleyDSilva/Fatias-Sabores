<?php
// 1. Inicia ou resume a sessão existente.
session_start();

// 2. Verifica se o usuário está logado.
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    header('Location: login.html');
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/img/logo_pizza.png">
    <title>Fatias&Sabores - Meu Perfil</title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <style>
        /* Estilos adicionais podem ir aqui ou no seu styles.css */
        .form-control:disabled,
        .form-control[readonly] {
            background-color: #e9ecef;
            /* Cor de fundo padrão para campos desabilitados */
            opacity: 1;
        }

        .fw-bold-label {
            /* Para os labels */
            font-weight: 600;
            /* Um pouco mais de destaque */
        }
    </style>
</head>

<body class="d-flex flex-column min-vh-100">
    <!-- Menu (deve ser atualizado pelo scripts.js global) -->
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
                    <li class="nav-item" id="menu-cadastro"><a class="nav-link" href="cadastro.html">Cadastre-se</a>
                    </li>
                    <li class="nav-item" id="menu-fav" style="display: none;"></li>
                    <li class="nav-item" id="menu-login">
                        <a href="login.html" class="btn me-2"
                            style="border-radius: 30px; color: #FFF; background-color: #FFA831;">
                            <img src="/img/perfil.png" style="width: 24px; height: 24px;"> LOGIN
                        </a>
                    </li>
                    <li class="nav-item" id="menu-perfil" style="display: none;"></li>
                    <li class="nav-item">
                        <a href="carrinho.php" class="btn me-2"
                            style="border-radius: 30px; color: #FFF; background-color: #FFA831; width: auto;">
                            <img src="/img/carrinho.png" style="width: 24px; height: 24px;"> CARRINHO
                            <span id="cart-count-badge-nav" class="badge bg-danger ms-1">0</span>
                        </a>
                    </li>
                    <li class="nav-item" id="menu-adm" style="display: none;"></li>
                </ul>
            </div>
        </div>
    </nav>
    <!-- FIM DO MENU -->

    <main class="flex-grow-1">
        <section>
            <div class="d-flex align-items-center justify-content-center mb-3 py-3"
                style="background: #FFA831; color: #ffffff;">
                <img src="/img/perfil.png" alt="Ícone Perfil" style="width: 35px; height: 35px; margin-right: 10px;">
                <h2 class="m-0"><b>Meu Perfil</b></h2>
            </div>

            <div class="container py-4">
                <div class="row justify-content-center">
                    <div class="col-md-10 col-lg-8 col-xl-7">
                        <!-- Foto de Perfil (opcional) -->
                        <div class="text-center mb-4">
                            <img src="/img/usuario.png" alt="Foto do Perfil" class="rounded-circle"
                                style="width: 150px; height: 150px; object-fit: cover; border: 3px solid #FFA831;">
                            <h4 class="mt-3" id="displayNomeUsuario">
                                <?php echo htmlspecialchars($_SESSION['user_nome'] ?? 'Usuário'); ?></h4>
                        </div>

                        <form id="profileForm">
                            <div class="card shadow-sm">
                                <div class="card-header" style="background-color: #fff5e7;">
                                    <h5 class="mb-0" style="color: #FFA831;">Dados Pessoais</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row mb-3 align-items-center">
                                        <label for="nome" class="col-sm-4 col-form-label fw-bold-label">Nome
                                            Completo:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="nome" name="nome" disabled>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="cpf" class="col-sm-4 col-form-label fw-bold-label">CPF:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="cpf" name="cpf" disabled
                                                readonly>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="telefone"
                                            class="col-sm-4 col-form-label fw-bold-label">Telefone:</label>
                                        <div class="col-sm-8">
                                            <input type="tel" class="form-control" id="telefone" name="telefone"
                                                disabled>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="email" class="col-sm-4 col-form-label fw-bold-label">E-mail:</label>
                                        <div class="col-sm-8">
                                            <input type="email" class="form-control" id="email" name="email" disabled>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card shadow-sm mt-4">
                                <div class="card-header" style="background-color: #fff5e7;">
                                    <h5 class="mb-0" style="color: #FFA831;">Endereço</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row mb-3 align-items-center">
                                        <label for="cep" class="col-sm-4 col-form-label fw-bold-label">CEP:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="cep" name="cep" disabled>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="logradouro"
                                            class="col-sm-4 col-form-label fw-bold-label">Logradouro:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="logradouro" name="logradouro"
                                                disabled>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="numero_casa"
                                            class="col-sm-4 col-form-label fw-bold-label">Número:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="numero_casa" name="numero_casa"
                                                disabled>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="complemento"
                                            class="col-sm-4 col-form-label fw-bold-label">Complemento:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="complemento" name="complemento"
                                                disabled>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="cidade"
                                            class="col-sm-4 col-form-label fw-bold-label">Cidade:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="cidade" name="cidade" disabled>
                                        </div>
                                    </div>
                                    <div class="row mb-3 align-items-center">
                                        <label for="uf" class="col-sm-4 col-form-label fw-bold-label">UF:</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" id="uf" name="UF" disabled
                                                maxlength="2">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card shadow-sm mt-4">
                                <div class="card-header" style="background-color: #fff5e7;">
                                    <h5 class="mb-0" style="color: #FFA831;">Segurança</h5>
                                </div>
                                <div class="card-body">
                                    <div class="text-center mb-3">
                                        <button type="button" id="changePasswordBtn" class="btn btn-outline-secondary">
                                            <i class="bi bi-key-fill"></i> Alterar Senha
                                        </button>
                                    </div>
                                    <div id="passwordFields" style="display: none;">
                                        <div class="form-floating mb-3">
                                            <input type="password" class="form-control" id="nova_senha"
                                                placeholder="Nova Senha">
                                            <label for="nova_senha">Nova Senha</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="password" class="form-control" id="confirmar_nova_senha"
                                                placeholder="Confirmar Nova Senha">
                                            <label for="confirmar_nova_senha">Confirmar Nova Senha</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 d-grid gap-2 d-sm-flex justify-content-sm-end">
                                <button type="button" id="editButton" class="btn btn-lg px-4 me-sm-2"
                                    style="background-color: #ffeace; color: #FFA831; border-color: #FFA831;">
                                    <i class="bi bi-pencil-square"></i> Editar Perfil
                                </button>
                                <button type="submit" id="saveButton" class="btn btn-lg px-4"
                                    style="background-color: #FFA831; color: white; display: none;">
                                    <i class="bi bi-check-circle-fill"></i> Salvar Alterações
                                </button>
                            </div>
                            <div id="form-message" class="mt-3"></div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
        <!-- SEÇÃO APP (opcional, pode remover se não quiser aqui) -->
        <section style="background: #FFA831;">
            {/* ... seu conteúdo da seção APP ... */}
        </section>
    </main>

    <!-- RODAPÉ -->
    <footer class="py-3 mt-auto" style="background: #FFA831; color: #FFFF">
        {/* ... seu conteúdo do rodapé ... */}
    </footer>

    <!-- JavaScript -->
    <script src="/javascript/scripts.js"></script> <!-- Script global para menu, etc. -->
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            console.log("Perfil.js: DOMContentLoaded - Iniciando script de perfil.");

            const profileForm = document.getElementById('profileForm');
            const editButton = document.getElementById('editButton');
            const saveButton = document.getElementById('saveButton');
            const changePasswordBtn = document.getElementById('changePasswordBtn');
            const passwordFieldsDiv = document.getElementById('passwordFields');
            const formMessageDiv = document.getElementById('form-message');

            // Campos que podem ser editados (CPF é readonly)
            const editableFields = [
                'nome', 'telefone', 'email', 'logradouro',
                'numero_casa', 'cidade', 'uf', 'cep', 'complemento'
            ];
            const passwordInputs = ['nova_senha', 'confirmar_nova_senha'];

            function getClienteIdFromSession() {
                // O ID do usuário já está na sessão PHP e é usado para carregar os dados.
                // Para o payload do update, podemos pegar da sessão também ou de um campo oculto se necessário.
                // Neste exemplo, vamos assumir que o ID da sessão PHP é a fonte da verdade.
                // Se precisar pegar do JS, seria do localStorage, mas a sessão PHP é mais segura aqui.
                // O `carregarDadosUsuario` já usa a sessão para o GET.
                // Para o POST, a API PHP deveria idealmente usar o ID da SESSÃO para o WHERE da atualização,
                // e o 'id' no payload seria uma confirmação.
                // Por ora, vamos pegar do localStorage como no seu exemplo anterior,
                // mas a API PHP DEVE validar o ID do payload contra o ID da sessão.
                const usuario = JSON.parse(localStorage.getItem('usuario'));
                return usuario ? usuario.id : null;
            }

            async function carregarDadosUsuario() {
                console.log("Perfil.js: carregarDadosUsuario chamado.");
                // O user_id já está validado pela sessão PHP no topo da página.
                // Para o GET, podemos usar o user_id da sessão PHP se a API permitir.
                // Se a API /api/api_get_user.php espera o ID como parâmetro:
                const userId = <?php echo json_encode($_SESSION['user_id']); ?>;
                // Este PHP injeta o user_id diretamente no JS.
                // Certifique-se que $_SESSION['user_id'] está sendo definido corretamente no login.

                if (!userId) {
                    console.error("Perfil.js: user_id da sessão não encontrado no JS.");
                    formMessageDiv.innerHTML = '<div class="alert alert-danger">Erro: ID do usuário não encontrado. Faça login novamente.</div>';
                    window.location.href = 'login.html'; // Redireciona se não houver ID
                    return;
                }
                console.log("Perfil.js: Carregando dados para userId:", userId);

                try {
                    // Ajuste a URL da API se necessário
                    const response = await fetch(`/api/api_get_user.php?id=${userId}`);
                    console.log("Perfil.js: Resposta fetch api_get_user:", response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log("Perfil.js: Dados recebidos de api_get_user:", data);

                    if (data.error || data.success === false) { // Verifica se a API retornou um erro lógico
                        throw new Error(data.message || 'Erro ao buscar dados do usuário da API.');
                    }

                    document.getElementById('nome').value = data.nome || '';
                    document.getElementById('cpf').value = data.cpf || '';
                    document.getElementById('telefone').value = data.telefone || '';
                    document.getElementById('email').value = data.email || '';
                    document.getElementById('logradouro').value = data.logradouro || '';
                    document.getElementById('numero_casa').value = data.numero_casa || ''; // API retorna numero_casa
                    document.getElementById('cidade').value = data.cidade || '';
                    document.getElementById('uf').value = data.UF || data.uf || ''; // Tenta UF e uf
                    document.getElementById('cep').value = data.cep || '';
                    document.getElementById('complemento').value = data.complemento || '';

                    // Atualiza o nome no cabeçalho da foto
                    const displayNomeUsuario = document.getElementById('displayNomeUsuario');
                    if (displayNomeUsuario && data.nome) {
                        displayNomeUsuario.textContent = data.nome;
                    }

                } catch (error) {
                    console.error('Perfil.js: Erro ao carregar dados do usuário:', error);
                    formMessageDiv.innerHTML = `<div class="alert alert-danger">Erro ao carregar seus dados: ${error.message}</div>`;
                }
            }

            function toggleEdit(isEditing) {
                editableFields.forEach(id => {
                    const field = document.getElementById(id);
                    if (field) field.disabled = !isEditing;
                });
                // Campos de senha sempre começam desabilitados e ocultos
                passwordInputs.forEach(id => {
                    const field = document.getElementById(id);
                    if (field) field.disabled = true; // Mantém desabilitado até clicar em "Alterar Senha"
                });
                passwordFieldsDiv.style.display = 'none';


                if (isEditing) {
                    editButton.style.display = 'none';
                    saveButton.style.display = 'block';
                    changePasswordBtn.disabled = false; // Habilita botão de alterar senha
                } else {
                    editButton.style.display = 'block';
                    saveButton.style.display = 'none';
                    changePasswordBtn.disabled = true; // Desabilita quando não está editando
                    // Limpa campos de senha se sair do modo de edição
                    document.getElementById('nova_senha').value = '';
                    document.getElementById('confirmar_nova_senha').value = '';
                }
            }

            if (editButton) {
                editButton.addEventListener('click', () => {
                    console.log("Perfil.js: Botão Editar clicado.");
                    toggleEdit(true);
                });
            }

            if (changePasswordBtn) {
                changePasswordBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!saveButton.style.display || saveButton.style.display === 'none') {
                        alert("Clique em 'Editar Perfil' primeiro para poder alterar a senha.");
                        return;
                    }
                    const currentlyVisible = passwordFieldsDiv.style.display === 'block';
                    passwordFieldsDiv.style.display = currentlyVisible ? 'none' : 'block';
                    passwordInputs.forEach(id => {
                        const field = document.getElementById(id);
                        if (field) field.disabled = currentlyVisible; // Habilita/desabilita os campos de senha
                    });
                    if (!currentlyVisible) document.getElementById('nova_senha').focus();
                });
            }


            if (profileForm) {
                profileForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    console.log("Perfil.js: Formulário enviado (Salvar).");
                    formMessageDiv.innerHTML = ''; // Limpa mensagens anteriores

                    const userIdToUpdate = getClienteIdFromSession(); // Ou <?php echo json_encode($_SESSION['user_id']); ?>;
                    if (!userIdToUpdate) {
                        formMessageDiv.innerHTML = '<div class="alert alert-danger">Erro: Sessão inválida. Faça login novamente.</div>';
                        return;
                    }

                    const novaSenhaInput = document.getElementById('nova_senha');
                    const confirmarNovaSenhaInput = document.getElementById('confirmar_nova_senha');
                    let novaSenhaPayload = null;

                    // Validação de senha apenas se os campos de senha estiverem visíveis e preenchidos
                    if (passwordFieldsDiv.style.display === 'block' && (novaSenhaInput.value || confirmarNovaSenhaInput.value)) {
                        if (novaSenhaInput.value.length > 0 && novaSenhaInput.value.length < 6) {
                            formMessageDiv.innerHTML = '<div class="alert alert-warning">A nova senha deve ter pelo menos 6 caracteres.</div>';
                            novaSenhaInput.focus();
                            return;
                        }
                        if (novaSenhaInput.value !== confirmarNovaSenhaInput.value) {
                            formMessageDiv.innerHTML = '<div class="alert alert-warning">As novas senhas não coincidem.</div>';
                            confirmarNovaSenhaInput.focus();
                            return;
                        }
                        if (novaSenhaInput.value.length >= 6) { // Só envia se a nova senha for válida
                            novaSenhaPayload = novaSenhaInput.value;
                        }
                    }

                    // Monta o payload para a API api_update_user.php
                    const formData = {
                        id: userIdToUpdate, // ID do usuário a ser atualizado
                        nome: document.getElementById('nome').value,
                        logradouro: document.getElementById('logradouro').value,
                        cidade: document.getElementById('cidade').value,
                        uf: document.getElementById('uf').value, // API espera 'uf'
                        cep: document.getElementById('cep').value,
                        complemento: document.getElementById('complemento').value,
                        numeroCasa: document.getElementById('numero_casa').value, // API espera 'numeroCasa'
                        email: document.getElementById('email').value,
                        telefone: document.getElementById('telefone').value,
                        // Envia 'senha' apenas se novaSenhaPayload tiver um valor
                        ...(novaSenhaPayload && { senha: novaSenhaPayload })
                    };
                    console.log("Perfil.js: Payload para api_update_user:", JSON.stringify(formData));

                    saveButton.disabled = true;
                    saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';

                    try {
                        const response = await fetch('/api/api_update_user.php', { // Ajuste o caminho da API se necessário
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                        });

                        const responseText = await response.text(); // Lê como texto primeiro
                        console.log("Perfil.js: Resposta bruta da API de update:", responseText, "Status:", response.status);
                        let result;
                        try {
                            result = JSON.parse(responseText);
                        } catch (jsonError) {
                            console.error("Perfil.js: Erro ao parsear JSON da resposta de update:", jsonError);
                            throw new Error(`Resposta inesperada do servidor: ${responseText.substring(0, 100)}`);
                        }

                        console.log("Perfil.js: Resultado da API de update:", result);

                        if (result.success) {
                            formMessageDiv.innerHTML = '<div class="alert alert-success">Dados atualizados com sucesso! A página será recarregada.</div>';
                            // Se o nome foi alterado, atualiza no localStorage para o menu
                            const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario'));
                            if (usuarioLocalStorage && usuarioLocalStorage.nome !== formData.nome) {
                                usuarioLocalStorage.nome = formData.nome;
                                localStorage.setItem('usuario', JSON.stringify(usuarioLocalStorage));
                                // Chamar a função global de atualização do menu, se existir
                                if (typeof window.atualizarMenuUsuario === 'function') {
                                    window.atualizarMenuUsuario();
                                }
                            }
                            // Atualiza o nome exibido na foto de perfil
                            const displayNomeUsuario = document.getElementById('displayNomeUsuario');
                            if (displayNomeUsuario && formData.nome) {
                                displayNomeUsuario.textContent = formData.nome;
                            }

                            setTimeout(() => {
                                // window.location.reload(); // Recarrega para ver os dados atualizados (ou só desabilita edição)
                                toggleEdit(false); // Volta para o modo de visualização
                                carregarDadosUsuario(); // Recarrega os dados para confirmar
                                formMessageDiv.innerHTML = '<div class="alert alert-success">Dados atualizados com sucesso!</div>';
                            }, 2000);
                        } else {
                            throw new Error(result.message || 'Falha ao atualizar dados.');
                        }
                    } catch (error) {
                        console.error('Perfil.js: Erro na atualização do perfil:', error);
                        formMessageDiv.innerHTML = `<div class="alert alert-danger">Erro ao atualizar: ${error.message}</div>`;
                    } finally {
                        saveButton.disabled = false;
                        saveButton.innerHTML = '<i class="bi bi-check-circle-fill"></i> Salvar Alterações';
                    }
                });
            } else {
                console.error("Perfil.js: Formulário 'profileForm' não encontrado.");
            }

            // Carregar dados do usuário ao iniciar
            carregarDadosUsuario();
            toggleEdit(false); // Garante que começa em modo de visualização e campos de senha ocultos/desabilitados
        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>