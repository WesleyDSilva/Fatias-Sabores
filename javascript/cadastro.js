//função revelar senha
function toggleSenha(campoId) {
    var input = document.getElementById(campoId);
    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  }

//envio de formulário de login via API
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
localStorage.setItem('usuario', JSON.stringify(data.user)); // Salva o usuário no Storage local
window.location.href = 'index.html';
} else {
mensagem.innerText = data.message;
mensagem.style.color = "red";
}
}

//envio de formulário de cadastro via API
document
.getElementById("cadastroForm")
.addEventListener("submit", function (event) {
event.preventDefault();

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
senha: document.getElementById("senha").value,
};

fetch("/api/api_create_hash.php", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(formData),
})
.then((response) => response.json())
.then((data) => {
document.getElementById("mensagem").textContent = data.message;
})
.catch((error) => {
document.getElementById("mensagem").textContent =
"Erro ao enviar os dados.";
console.error("Erro:", error);
});
});