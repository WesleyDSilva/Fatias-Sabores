// scripts.js

console.log("Global Scripts.js: Carregado.");

// Variável global para a base da URL das APIs (ajuste se suas APIs não estiverem na raiz)
const API_DOMAIN = "https://devweb3.ok.etc.br"; // Ou deixe vazio se for same-origin e quiser caminhos relativos à raiz

document.addEventListener("DOMContentLoaded", function () {
  console.log("Scripts.js: DOMContentLoaded disparado.");

  // Atualização do menu (chamada sempre que o DOM carrega)
  atualizarMenuUsuario();
  console.log("Scripts.js: atualizarMenuUsuario chamado no DOMContentLoaded.");

  // Lógica do formulário de cadastro (só executa se o formulário existir na página)
  const cadastroForm = document.getElementById("cadastroForm");
  if (cadastroForm) {
    console.log(
      "Scripts.js: Formulário de cadastro encontrado, inicializando lógica."
    );
    inicializarFormularioCadastro(cadastroForm);
  } else {
    // console.log("Scripts.js: Formulário de cadastro ('cadastroForm') não encontrado nesta página.");
  }

  // Adicione aqui outras inicializações globais que dependem do DOM
});

// Função flip do card para mobile (mantida como no seu original)
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

/**
 * Atualiza a navegação do menu com base no status de login do usuário.
 * Lê dados do usuário do localStorage.
 */
function atualizarMenuUsuario() {
  console.log("Scripts.js: atualizarMenuUsuario() executada.");
  const usuarioJSON = localStorage.getItem("usuario");
  let usuario = null;
  if (usuarioJSON) {
    try {
      usuario = JSON.parse(usuarioJSON);
    } catch (e) {
      console.error(
        "Scripts.js: Erro ao parsear 'usuario' do localStorage:",
        e
      );
      localStorage.removeItem("usuario"); // Remove item inválido
    }
  }

  const menuLoginLi = document.getElementById("menu-login");
  const menuCadastroLi = document.getElementById("menu-cadastro");
  const menuPerfilLi = document.getElementById("menu-perfil"); // Para "Olá, Nome!" e SAIR
  const menuFavLi = document.getElementById("menu-fav");
  // const menuAdmLi = document.getElementById("menu-adm"); // Se tiver um menu de admin separado

  if (usuario && usuario.id && usuario.nome) {
    // Usuário logado
    console.log("Scripts.js: Usuário logado encontrado:", usuario.nome);
    if (menuLoginLi) menuLoginLi.style.display = "none"; // Oculta o botão de LOGIN

    if (menuPerfilLi) {
      menuPerfilLi.style.display = "list-item"; // Mostra o container do perfil/logout
      menuPerfilLi.innerHTML = `
        <a href="perfil.php" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color: #FFA831; padding: 5px 10px; text-decoration: none; display: inline-flex; align-items: center;">
          <img src="/img/usuario.png" alt="Usuário" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;"> 
          ${usuario.nome.split(" ")[0]}
        </a>
        <button onclick="deslogarUsuario()" class="btn btn-danger ms-2" style="border-radius: 30px; padding: 5px 10px;">
          <img src="/img/logout.png" alt="Sair" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 3px;">Sair
        </button>
      `;
    } else if (menuLoginLi) {
      // Fallback: se menu-perfil não existir, modifica menu-login
      menuLoginLi.style.display = "list-item";
      menuLoginLi.innerHTML = `
            <a href="perfil.php" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color: #FFA831; padding: 5px 10px; text-decoration: none; display: inline-flex; align-items: center;">
              <img src="/img/usuario.png" alt="Usuário" style="width: 24px; height: 24px; margin-right: 5px;"> ${
                usuario.nome.split(" ")[0]
              }
            </a>`;
      // Adiciona botão de logout em menu-adm como antes, se menu-perfil não existir
      const menuAdmLiFallback = document.getElementById("menu-adm");
      if (menuAdmLiFallback) {
        menuAdmLiFallback.style.display = "list-item";
        menuAdmLiFallback.innerHTML = `<button onclick="deslogarUsuario()" class="btn btn-danger ms-2" style="border-radius: 30px; padding: 5px 10px;">Sair</button>`;
      }
    }

    if (menuCadastroLi) {
      menuCadastroLi.innerHTML = `<a class="nav-link" href="historico_pedidos.php">Meus Pedidos</a>`;
    }
    if (menuFavLi) {
      menuFavLi.style.display = "list-item";
      menuFavLi.innerHTML = `<a class="nav-link" href="favoritos.php">Favoritos</a>`;
    }
  } else {
    // Usuário não logado
    console.log("Scripts.js: Nenhum usuário logado.");
    if (menuLoginLi) {
      menuLoginLi.style.display = "list-item";
      menuLoginLi.innerHTML = `
        <a href="login.html" class="btn me-2" style="border-radius: 30px; color: #FFF; background-color: #FFA831;">
          <img src="/img/perfil.png" style="width: 24px; height: 24px;"> LOGIN
        </a>`;
    }
    if (menuCadastroLi) {
      menuCadastroLi.innerHTML =
        '<a class="nav-link" href="cadastro.html">Cadastre-se</a>';
    }
    if (menuPerfilLi) menuPerfilLi.style.display = "none"; // Oculta container de perfil/logout
    if (menuFavLi) menuFavLi.style.display = "none";

    // Limpa o menu-adm se ele foi usado para o botão de sair
    const menuAdmLiFallback = document.getElementById("menu-adm");
    if (
      menuAdmLiFallback &&
      menuAdmLiFallback.querySelector('button[onclick="deslogarUsuario()"]')
    ) {
      menuAdmLiFallback.innerHTML = "";
      menuAdmLiFallback.style.display = "none";
    }
  }
}

/**
 * Desloga o usuário, limpando a sessão no servidor e localmente, e redirecionando.
 */
async function deslogarUsuario() {
  console.log("Scripts.js: deslogarUsuario() chamado.");
  try {
    const response = await fetch(`${API_DOMAIN}/logout.php`, {
      // Usa API_DOMAIN se definido, ou caminho relativo/absoluto
      method: "GET", // logout.php é GET
    });
    if (response.ok || response.redirected) {
      console.log(
        "Scripts.js: Chamada para logout.php bem-sucedida ou redirecionada."
      );
    } else {
      console.warn(
        "Scripts.js: Chamada para logout.php pode ter falhado. Status:",
        response.status
      );
    }
  } catch (error) {
    console.error(
      "Scripts.js: Erro de rede ao tentar chamar logout.php:",
      error
    );
  } finally {
    localStorage.removeItem("usuario");
    console.log("Scripts.js: 'usuario' removido do localStorage.");
    atualizarMenuUsuario(); // Atualiza a interface do menu
    // O logout.php já deve redirecionar para login.html.
    // Se precisar forçar, descomente a linha abaixo, mas pode causar duplo redirect.
    window.location.href = "login.html";
    console.log("Scripts.js: Redirecionando para login.html.");
  }
}

/**
 * Alterna a visibilidade de um campo de senha e o ícone do olho.
 * @param {string} campoId O ID do input de senha.
 * @param {string} [iconeId] O ID opcional do elemento do ícone (se não for um <i> ou <span> genérico).
 */
function toggleSenha(campoId, iconeId) {
  const input = document.getElementById(campoId);
  if (!input) {
    console.warn(
      `Scripts.js: Input field with ID "${campoId}" not found for toggleSenha.`
    );
    return;
  }
  const iconElement = iconeId
    ? document.getElementById(iconeId)
    : input.closest(".position-relative")?.querySelector("i.bi, span.bi");

  if (iconElement) {
    if (input.type === "password") {
      input.type = "text";
      iconElement.classList.remove("bi-eye-fill", "bi-eye");
      iconElement.classList.add("bi-eye-slash-fill");
    } else {
      input.type = "password";
      iconElement.classList.remove("bi-eye-slash-fill", "bi-eye-slash");
      iconElement.classList.add("bi-eye-fill");
    }
  } else {
    input.type = input.type === "password" ? "text" : "password";
    console.warn(
      `Scripts.js: Ícone para campo de senha "${campoId}" (ou com ID "${iconeId}") não encontrado.`
    );
  }
}

/**
 * Inicializa a lógica do formulário de cadastro.
 * @param {HTMLFormElement} formElement O elemento do formulário.
 */
function inicializarFormularioCadastro(formElement) {
  const cepInput = document.getElementById("cep");
  const logradouroInput = document.getElementById("logradouro");
  const cidadeInput = document.getElementById("cidade");
  const ufInput = document.getElementById("UF"); // ID no HTML é "UF"
  const senhaInput = document.getElementById("senha");
  const confirmarSenhaInput = document.getElementById("confirmaSenha"); // ID no HTML é "confirmaSenha"
  // Adicione IDs para os ícones de olho no HTML do cadastro se quiser usar toggleSenha com o segundo parâmetro
  // Ex: <span id="iconeSenhaCadastro" class="bi bi-eye-fill"></span>
  // E chame: onclick="toggleSenha('senha', 'iconeSenhaCadastro')"

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
        logradouroInput.value = "Buscando..."; // Feedback
        cidadeInput.value = "Buscando...";
        ufInput.value = "Buscando...";
        fetch(`https://viacep.com.br/ws/${cepValue}/json/`)
          .then((response) => {
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
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
              document.getElementById("numero_casa")?.focus();
            }
          })
          .catch((error) => {
            cepInput.disabled = false;
            clearAddressFields();
            console.error("Scripts.js: Erro ao buscar CEP:", error);
            alert(
              "Não foi possível consultar o CEP. Tente novamente mais tarde."
            );
          });
      } else if (cepValue.length > 0) {
        // Se não for 8 e não for vazio, é inválido
        alert("CEP inválido. Deve conter 8 dígitos.");
        clearAddressFields();
      } else {
        // Se for vazio
        clearAddressFields();
      }
    });
  }

  formElement.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Scripts.js: Formulário de cadastro submetido.");

    if (!senhaInput || !confirmarSenhaInput) {
      alert("Erro: Campos de senha não encontrados no formulário.");
      return;
    }

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
      alert("Você precisa aceitar os Termos e Condições.");
      termosCheckbox.focus();
      return;
    }

    const formDataObject = {
      nome: document.getElementById("nome")?.value,
      logradouro: logradouroInput?.value,
      cidade: cidadeInput?.value,
      UF: ufInput?.value,
      cep: cepInput?.value.replace(/\D/g, ""),
      numero_casa: document.getElementById("numero_casa")?.value, // API PHP espera numero_casa
      complemento: document.getElementById("complemento")?.value,
      email: document.getElementById("email")?.value,
      telefone: document.getElementById("telefone")?.value,
      senha: senhaInput.value,
      cpf: document.getElementById("cpf")?.value,
    };
    console.log("Scripts.js: Payload para API de cadastro:", formDataObject);

    const submitButton = formElement.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      const response = await fetch(`${API_DOMAIN}/api/api_create_hash.php`, {
        // Ajuste o caminho se /api/ não estiver no API_DOMAIN
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObject),
      });
      const result = await response.json();
      console.log("Scripts.js: Resposta da API de cadastro:", result);

      if (result.success) {
        alert(
          result.message ||
            "Cadastro realizado com sucesso! Você será redirecionado para o login."
        );
        formElement.reset();
        clearAddressFields();
        // Reseta os ícones de senha se implementado com IDs
        // toggleSenha('senha', 'iconeSenhaCadastro'); // Chamaria para resetar o ícone para olho normal
        // toggleSenha('confirmaSenha', 'iconeConfirmaSenhaCadastro');
        window.location.href = "login.html";
      } else {
        alert(
          "Erro no cadastro: " +
            (result.message || result.error || "Ocorreu um erro.")
        );
      }
    } catch (error) {
      console.error(
        "Scripts.js: Erro ao enviar formulário de cadastro:",
        error
      );
      alert("Erro ao conectar com o servidor para cadastro. Tente novamente.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "CADASTRAR";
      }
    }
  });
} // Fim de inicializarFormularioCadastro
