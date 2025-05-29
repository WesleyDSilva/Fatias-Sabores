// scripts.js

// Função flip do card para mobile (If you have flip cards on other pages)
document.querySelectorAll(".flip-card").forEach((card) => {
  let isFlipped = false;
  card.addEventListener("click", () => {
    if (window.innerWidth < 768 || "ontouchstart" in document.documentElement) {
      isFlipped = !isFlipped;
      const flipCardInner = card.querySelector(".flip-card-inner");
      if (flipCardInner) {
        flipCardInner.style.transform = isFlipped
          ? "rotateY(180deg)"
          : "rotateY(0)";
      }
    }
  });
});

// Função para atualizar o menu baseado no status de login
function atualizarMenuUsuario() {
  const usuarioJSON = localStorage.getItem("usuario");
  let usuario = null;
  if (usuarioJSON) {
    try {
      usuario = JSON.parse(usuarioJSON);
    } catch (e) {
      console.error("Erro ao parsear 'usuario' do localStorage:", e);
      localStorage.removeItem("usuario"); // Remove item inválido
    }
  }

  const menuLogin = document.getElementById("menu-login");
  const menuCadastro = document.getElementById("menu-cadastro");
  const menuADM = document.getElementById("menu-adm"); // Este elemento é usado para o botão de Sair
  const menuFAV = document.getElementById("menu-fav");

  if (usuario && usuario.id) {
    // Verifica se o usuário e o ID existem
    if (menuLogin) {
      // O elemento menuLogin será substituído pelo nome do usuário e link para perfil
      menuLogin.innerHTML = `
        <a href="perfil.php" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color: #FFA831; padding: 5px 10px; text-decoration: none; display: inline-flex; align-items: center;">
          <img src="/img/usuario.png" alt="Usuário" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;"> ${
            usuario.nome ? usuario.nome.split(" ")[0] : "Usuário" // Mostra o primeiro nome
          }
        </a>`;
    }
    if (menuCadastro) {
      // menuCadastro vira link para Histórico de Pedidos
      menuCadastro.innerHTML = `
        <a class="nav-link" href="histpedido.php">Histórico</a>`;
    }
    if (menuADM) {
      // menuADM (que era para admin) agora é usado para o botão de Sair
      menuADM.innerHTML = `
        <button onclick="deslogarUsuario()" id="btn-logoff" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color:rgb(252, 44, 29); padding: 5px 10px; border: none; cursor: pointer; display: inline-flex; align-items: center;">
          <img src="/img/logout.png" alt="Sair" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">Sair
        </button>`;
    }
    if (menuFAV) {
      menuFAV.style.display = "list-item"; // Ou 'block' dependendo do seu CSS
      menuFAV.innerHTML = `
        <a class="nav-link" href="favoritos.php">Favoritos</a>`;
    }
  } else {
    // Usuário não logado
    if (menuLogin) {
      menuLogin.innerHTML = `
        <a href="login.html" class="btn me-2" style="border-radius: 30px; color: #FFF; background-color: #FFA831;">
          <img src="/img/perfil.png" style="width: 24px; height: 24px;"> LOGIN
        </a>`;
    }
    if (menuCadastro) {
      menuCadastro.innerHTML =
        '<a class="nav-link" href="cadastro.html">Cadastre-se</a>'; // Alterado para cadastro.html
    }
    if (menuADM) {
      menuADM.innerHTML = ""; // Limpa o botão de sair
    }
    if (menuFAV) {
      menuFAV.style.display = "none";
      menuFAV.innerHTML = "";
    }
  }
}

// Chamar atualizarMenuUsuario quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function () {
  atualizarMenuUsuario();
});

// ****** FUNÇÃO DESLOGAR ATUALIZADA ******
async function deslogarUsuario() {
  try {
    // 1. Chamar o script logout.php no servidor para destruir a sessão PHP
    // Certifique-se que o caminho para 'logout.php' está correto
    // Se scripts.js está em /javascript/ e logout.php na raiz, o caminho seria '../logout.php'
    // Se ambos estão na raiz, 'logout.php' está ok.
    // Assumindo que logout.php está na raiz do site, acessível por '/logout.php'
    const response = await fetch("logout.php", {
      // Ajuste o caminho se necessário
      method: "GET", // Ou POST, mas GET é comum para logout simples se não houver CSRF token
      // Não é necessário enviar corpo ou headers especiais para este logout.php
    });

    // O logout.php redireciona, então não esperamos um JSON de sucesso aqui necessariamente.
    // O importante é que a requisição seja feita.
    // Podemos verificar se a requisição foi bem-sucedida (status 200),
    // mas o redirecionamento de logout.php vai acontecer de qualquer forma.

    if (response.ok || response.redirected) {
      console.log("Sessão PHP provavelmente encerrada. Limpando dados locais.");
    } else {
      console.warn(
        "Chamada para logout.php pode ter falhado. Status:",
        response.status
      );
      // Mesmo se falhar, prosseguimos com a limpeza local e redirecionamento
      // para garantir que o usuário veja a interface de deslogado.
    }
  } catch (error) {
    console.error("Erro ao tentar chamar logout.php:", error);
    // Mesmo em caso de erro de rede, prosseguir com a limpeza local
  } finally {
    // 2. Limpar o localStorage
    localStorage.removeItem("usuario");

    // 3. Atualizar a interface do menu imediatamente
    atualizarMenuUsuario();

    // 4. Redirecionar o usuário para a página inicial ou de login
    // O próprio logout.php já faz um redirecionamento para login.html.
    // Se você quiser controlar o redirecionamento exclusivamente pelo JS após
    // confirmar que a sessão PHP foi destruída, o logout.php não deveria redirecionar,
    // mas sim retornar um JSON de sucesso.
    // Dado que o logout.php ATUAL redireciona, este redirecionamento do JS pode ser redundante
    // ou pode levar a um "duplo redirecionamento".
    // Para este exemplo, vamos manter o redirecionamento do JS caso o do PHP falhe por algum motivo de rede.
    // Ou, se o logout.php for modificado para não redirecionar:
    window.location.href = "login.html"; // Ou 'index.html' se preferir
  }
}

function toggleSenha(campoId) {
  const input = document.getElementById(campoId);
  if (!input) {
    console.warn(`Input field with ID "${campoId}" not found for toggleSenha.`);
    return;
  }
  // Ajuste no seletor do botão e ícone se necessário, baseado no HTML de login.html
  const buttonContainer = input.closest(".position-relative");
  const icon = buttonContainer ? buttonContainer.querySelector("i.bi") : null; // Supondo que o ícone seja <i>

  if (icon) {
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("bi-eye-fill"); // Ajuste conforme o ícone usado
      icon.classList.add("bi-eye-slash-fill"); // Ajuste conforme o ícone usado
    } else {
      input.type = "password";
      icon.classList.remove("bi-eye-slash-fill"); // Ajuste
      icon.classList.add("bi-eye-fill"); // Ajuste
    }
  } else {
    // Fallback se o ícone específico não for encontrado, tenta uma abordagem mais genérica
    // ou apenas alterna o tipo sem feedback visual do ícone se ele não estiver lá.
    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
    console.warn(
      `Ícone para o campo de senha "${campoId}" não encontrado ou não é um <i> com classes bi.`
    );
  }
}

// Lógica do formulário de CADASTRO
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cadastroForm");
  if (!form) {
    return; // Sai se não estiver na página de cadastro
  }

  const cepInput = document.getElementById("cep");
  const logradouroInput = document.getElementById("logradouro");
  const cidadeInput = document.getElementById("cidade");
  const ufInput = document.getElementById("UF");
  const senhaInput = document.getElementById("senha");
  const confirmarSenhaInput = document.getElementById("confirmaSenha");
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const numeroCasaInput = document.getElementById("numero_casa");
  const cpfInput = document.getElementById("cpf");
  const telefoneInput = document.getElementById("telefone");
  const complementoInput = document.getElementById("complemento");

  function clearAddressFields() {
    if (logradouroInput) logradouroInput.value = "";
    if (cidadeInput) cidadeInput.value = "";
    if (ufInput) ufInput.value = "";
  }

  if (cepInput) {
    cepInput.addEventListener("blur", function () {
      const cepValue = cepInput.value.replace(/\D/g, "");
      if (cepValue.length === 8) {
        cepInput.disabled = true;
        fetch(`https://viacep.com.br/ws/${cepValue}/json/`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            cepInput.disabled = false;
            if (data.erro) {
              alert("CEP não encontrado. Verifique e tente novamente.");
              clearAddressFields();
              cepInput.focus();
            } else {
              if (logradouroInput)
                logradouroInput.value = data.logradouro || "";
              if (cidadeInput) cidadeInput.value = data.localidade || "";
              if (ufInput) ufInput.value = data.uf || "";
              if (numeroCasaInput) numeroCasaInput.focus();
            }
          })
          .catch((error) => {
            cepInput.disabled = false;
            console.error("Erro ao buscar CEP:", error);
            alert(
              "Não foi possível consultar o CEP. Verifique sua conexão ou tente novamente mais tarde."
            );
            clearAddressFields();
          });
      } else if (cepValue.length > 0 && cepValue.length < 8) {
        alert("CEP inválido. Deve conter 8 dígitos numéricos.");
        clearAddressFields();
      } else if (cepValue.length === 0) {
        clearAddressFields();
      }
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (senhaInput.value.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      senhaInput.focus();
      return;
    }

    if (senhaInput.value !== confirmarSenhaInput.value) {
      alert("As senhas não coincidem!");
      confirmarSenhaInput.value = "";
      confirmarSenhaInput.focus();
      return;
    }

    const termosCheckbox = document.getElementById("termos");
    if (termosCheckbox && !termosCheckbox.checked) {
      alert("Você precisa aceitar os Termos e Condições para se cadastrar.");
      termosCheckbox.focus();
      return;
    }

    const formDataObject = {
      nome: nomeInput.value,
      logradouro: logradouroInput.value,
      cidade: cidadeInput.value,
      UF: ufInput.value,
      cep: cepInput.value.replace(/\D/g, ""),
      numero_casa: numeroCasaInput.value,
      complemento: complementoInput.value,
      email: emailInput.value,
      telefone: telefoneInput.value,
      senha: senhaInput.value,
      cpf: cpfInput.value,
    };

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      // Certifique-se que o caminho para sua API de cadastro está correto
      const response = await fetch("api/api_create_hash.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || "Cadastro realizado com sucesso!");

        // Após cadastro bem-sucedido, o usuário normalmente NÃO é logado automaticamente
        // Ele deve ir para a página de login.
        // Apenas limpamos o formulário e talvez redirecionamos para o login.
        // Não setamos 'usuario' no localStorage aqui, pois não temos o ID do usuário ainda.

        form.reset();
        clearAddressFields();

        if (senhaInput) {
          senhaInput.type = "password";
          // Lógica para resetar ícone de senha (se necessário)
        }
        if (confirmarSenhaInput) {
          confirmarSenhaInput.type = "password";
          // Lógica para resetar ícone de confirmação de senha (se necessário)
        }
        // Redirecionar para a página de login após cadastro
        window.location.href = "login.html";
      } else {
        alert(
          "Erro no cadastro: " +
            (result.message || result.error || "Ocorreu um erro desconhecido.")
        );
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      alert("Erro ao conectar com o servidor. Tente novamente mais tarde.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
