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
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const menuLogin = document.getElementById("menu-login");
  const menuCadastro = document.getElementById("menu-cadastro");
  const menuADM = document.getElementById("menu-adm");
  const menuFAV = document.getElementById("menu-fav");

  if (usuario) {
    if (menuLogin) {
      menuLogin.innerHTML = `
              <a href="perfil.html" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color: #FFA831; padding: 5px 10px; text-decoration: none; display: inline-flex; align-items: center;">
              <img src="/img/usuario.png" alt="Usuário" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;"> ${
                usuario.nome || "Usuário"
              }</a>
          `;
    }
    if (menuCadastro) {
      menuCadastro.innerHTML = `
              <a class="nav-link" href="histpedido.html">Histórico</a>
          `;
    }
    if (menuADM) {
      menuADM.innerHTML = `
              <button onclick="deslogarUsuario()" id="btn-logoff" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color:rgb(252, 44, 29); padding: 5px 10px; border: none; cursor: pointer; display: inline-flex; align-items: center;">
              <img src="/img/logout.png" alt="Sair" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">Sair</button>
          `;
    }
    if (menuFAV) {
      menuFAV.style.display = "list-item";
      menuFAV.innerHTML = `
            <a class="nav-link" href="favoritos.html">Favoritos</a>
        `;
    }
  } else {
    if (menuLogin) {
      menuLogin.innerHTML = `
            <a href="login.html" class="btn me-2" style="border-radius: 30px; color: #FFF; background-color: #FFA831;">
              <img src="/img/perfil.png" style="width: 24px; height: 24px;"> LOGIN
            </a>`;
    }
    if (menuCadastro) {
      menuCadastro.innerHTML =
        '<a class="nav-link" href="cadastro.html">Cadastre-se</a>';
    }
    if (menuADM) {
      menuADM.innerHTML = "";
    }
    if (menuFAV) {
      menuFAV.style.display = "none";
      menuFAV.innerHTML = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  atualizarMenuUsuario();
});

function deslogarUsuario() {
  localStorage.removeItem("usuario");
  atualizarMenuUsuario();
  setTimeout(() => {
    window.location.href = "index.html";
  }, 100);
}

function toggleSenha(campoId) {
  const input = document.getElementById(campoId);
  if (!input) {
    console.warn(`Input field with ID "${campoId}" not found for toggleSenha.`);
    return;
  }
  const button = input
    .closest(".position-relative")
    ?.querySelector(`button[onclick="toggleSenha('${campoId}')"]`);
  const icon = button?.querySelector("span.bi");

  if (icon) {
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    }
  } else {
    console.warn(`Icon for password field "${campoId}" not found.`);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cadastroForm");
  if (!form) {
    return;
  }

  const cepInput = document.getElementById("cep");
  const logradouroInput = document.getElementById("logradouro");
  const cidadeInput = document.getElementById("cidade");
  const ufInput = document.getElementById("UF"); // Note: HTML ID is "UF"
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
              if (ufInput) ufInput.value = data.uf || ""; // Correctly populates UF
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
    // Made the function async
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

    // Collect form data into an object
    const formDataObject = {
      nome: nomeInput.value,
      logradouro: logradouroInput.value,
      cidade: cidadeInput.value,
      UF: ufInput.value, // HTML ID is "UF"
      cep: cepInput.value.replace(/\D/g, ""), // Send only numbers for CEP
      numero_casa: numeroCasaInput.value,
      complemento: complementoInput.value, // Will be empty string if not filled, PHP handles null
      email: emailInput.value,
      telefone: telefoneInput.value,
      senha: senhaInput.value, // Send plain password, PHP will hash it
      cpf: cpfInput.value,
    };

    // Disable submit button to prevent multiple submissions
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch("./api/api_create_hash.php", {
        // Ensure this path is correct
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });

      const result = await response.json(); // Expecting JSON response from PHP

      if (result.success) {
        alert(result.message || "Cadastro realizado com sucesso!");

        // Simulate saving user to localStorage to update menu
        // In a real app, you might get user data back from the API or redirect to login
        if (nomeInput && emailInput) {
          const nomeUsuario = nomeInput.value.split(" ")[0];
          const emailUsuario = emailInput.value;
          localStorage.setItem(
            "usuario",
            JSON.stringify({ nome: nomeUsuario, email: emailUsuario })
          );
          atualizarMenuUsuario();
        }

        form.reset();
        clearAddressFields();

        if (senhaInput) {
          senhaInput.type = "password";
          const senhaIconSpan = document.getElementById("iconeSenha");
          if (senhaIconSpan) {
            senhaIconSpan.classList.remove("bi-eye-slash");
            senhaIconSpan.classList.add("bi-eye");
          }
        }
        if (confirmarSenhaInput) {
          confirmarSenhaInput.type = "password";
          const cSenhaIcon = document.getElementById("iconeConfirmaSenha");
          if (cSenhaIcon) {
            cSenhaIcon.classList.remove("bi-eye-slash");
            cSenhaIcon.classList.add("bi-eye");
          }
        }
        if (nomeInput) nomeInput.focus();
        // Optionally redirect to login page or user dashboard
        // window.location.href = 'login.html';
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
      if (submitButton) submitButton.disabled = false; // Re-enable submit button
    }
  });
});
