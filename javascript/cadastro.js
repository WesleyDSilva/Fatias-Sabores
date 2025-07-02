//função revelar senha e alternar ícone
function toggleSenha(campoId, iconeId) {
  var input = document.getElementById(campoId);
  var icone = document.getElementById(iconeId);
  if (input.type === "password") {
    input.type = "text";
    if (icone) {
      icone.classList.remove("bi-eye");
      icone.classList.add("bi-eye-slash");
    }
  } else {
    input.type = "password";
    if (icone) {
      icone.classList.remove("bi-eye-slash");
      icone.classList.add("bi-eye");
    }
  }
}

//envio de formulário de login via API (mantido como no original, não é modificado aqui)
async function autenticar() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  if (!email || !senha) {
    mensagem.innerText = "Preencha todos os campos!";
    mensagem.style.color = "red";
    return;
  }

  const response = await fetch("/api/api_auth_hash.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();

  if (data.success) {
    // Redireciona para a página inicial
    localStorage.setItem("usuario", JSON.stringify(data.user)); // Salva o usuário no Storage local
    window.location.href = "index.php";
  } else {
    mensagem.innerText = data.message;
    mensagem.style.color = "red";
  }
}

//envio de formulário de cadastro via API
document
  .getElementById("cadastroForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const senhaInput = document.getElementById("senha");
    const confirmaSenhaInput = document.getElementById("confirmaSenha");
    const senha = senhaInput.value;
    const confirmaSenha = confirmaSenhaInput.value;
    const mensagem = document.getElementById("mensagem");

    // Limpar mensagens de erro anteriores e estilos de inválido
    mensagem.textContent = "";
    mensagem.style.color = ""; // Resetar cor da mensagem
    senhaInput.classList.remove("is-invalid");
    confirmaSenhaInput.classList.remove("is-invalid");

    // Verificar se as senhas coincidem
    if (senha !== confirmaSenha) {
      mensagem.textContent = "As senhas não coincidem!";
      mensagem.style.color = "red";
      senhaInput.classList.add("is-invalid"); // Adiciona feedback visual de erro
      confirmaSenhaInput.classList.add("is-invalid"); // Adiciona feedback visual de erro
      return; // Para a execução se as senhas não baterem
    }

    // Verificar se a senha tem um comprimento mínimo (exemplo: 6 caracteres)
    if (senha.length < 6) {
      mensagem.textContent = "A senha deve ter pelo menos 6 caracteres.";
      mensagem.style.color = "red";
      senhaInput.classList.add("is-invalid");
      return;
    }

    // Coleta os dados do formulário
    let formData = {
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      logradouro: document.getElementById("logradouro").value,
      cidade: document.getElementById("cidade").value,
      UF: document.getElementById("UF").value,
      cep: document.getElementById("cep").value,
      complemento: document.getElementById("complemento").value,
      numero_casa: document.getElementById("numero_casa").value,
      email: document.getElementById("email").value,
      telefone: document.getElementById("telefone").value,
      senha: senha, // Envia apenas a senha, já que a confirmação foi validada
    };

    // Envia os dados para a API
    fetch("/api/api_create_hash.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        mensagem.textContent = data.message;
        if (
          data.success === true ||
          (data.message && data.message.toLowerCase().includes("sucesso"))
        ) {
          // Adapte conforme a resposta da sua API
          mensagem.style.color = "green";
          document.getElementById("cadastroForm").reset(); // Limpa o formulário em caso de sucesso
          // Opcional: redirecionar ou mostrar outra mensagem
        } else {
          mensagem.style.color = "red";
        }
      })
      .catch((error) => {
        mensagem.textContent =
          "Erro ao enviar os dados. Tente novamente mais tarde.";
        mensagem.style.color = "red";
        console.error("Erro:", error);
      });
  });
