// javascript/admin_login.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("adminLoginForm");
  const errorMessageElement = document.getElementById("errorMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (errorMessageElement) {
        errorMessageElement.textContent = "";
        errorMessageElement.style.display = "none";
      }

      const loginInputFromHtml = loginForm.querySelector('input[name="login"]');
      const passwordInputFromHtml = loginForm.querySelector(
        'input[name="senha"]'
      );

      if (!loginInputFromHtml || !passwordInputFromHtml) {
        console.error("Campos de input não encontrados no formulário!");
        displayError("Erro no formulário. Tente recarregar a página.");
        return;
      }

      const loginValue = loginInputFromHtml.value.trim();
      const senhaValue = passwordInputFromHtml.value;

      if (!loginValue || !senhaValue) {
        displayError("Por favor, preencha o login e a senha.");
        return;
      }

      // Certifique-se de que este é o caminho CORRETO onde api_auth_funcionario.php está no servidor
      const apiUrl =
        "https://devweb3.ok.etc.br/adm/api/api_auth_funcionario.php";

      const payload = {
        login: loginValue,
        senha: senhaValue,
      };

      console.log("Enviando para API de login de funcionário:", payload);

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Mesmo se response.ok for false (ex: 500), tentamos ler o corpo
        // para ver se há uma mensagem de erro útil.
        const contentType = response.headers.get("content-type");
        let result;
        let errorTextForDisplay = `Erro no servidor (Status: ${response.status}).`; // Mensagem padrão

        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
          if (result && result.message) {
            errorTextForDisplay = result.message; // Usa a mensagem da API se for JSON
          }
        } else {
          const textResult = await response.text(); // Lê como texto se não for JSON
          console.warn(
            `Resposta da API de login não é JSON (Status: ${
              response.status
            }). Texto: ${textResult.substring(0, 500)}` // Loga mais texto
          );
          // Se textResult for HTML de erro, não é útil para o usuário,
          // então errorTextForDisplay permanece a mensagem padrão.
          // Se textResult for uma mensagem de erro simples, você pode tentar exibi-la.
          if (
            textResult &&
            textResult.length < 200 &&
            !textResult.trim().startsWith("<")
          ) {
            // Evita exibir HTML de erro grande
            errorTextForDisplay = textResult;
          }
        }

        console.log(
          "Resposta da API de login:",
          result || "Resposta não JSON/Vazia"
        );

        if (response.ok && result && result.success && result.user) {
          localStorage.setItem("funcionarioUser", JSON.stringify(result.user));
          if (result.token) {
            localStorage.setItem("funcionarioToken", result.token);
          }

          if (
            result.user.tipo_usuario === "admin" ||
            result.user.perfil === 1
          ) {
            alert("Login de administrador realizado com sucesso!");
            window.location.href = "adminDash.php";
          } else {
            displayError(
              `Acesso permitido como ${
                result.user.cargo || "funcionário"
              }, mas esta área é apenas para administradores.`
            );
          }
        } else {
          // Usa a errorTextForDisplay que foi preparada
          displayError(
            result && result.message ? result.message : errorTextForDisplay
          );
        }
      } catch (error) {
        // Captura erros de rede ou falhas no fetch
        console.error("Erro ao tentar fazer login (catch):", error);
        displayError(
          "Erro de comunicação com o servidor. Tente novamente mais tarde."
        );
      }
    });
  }

  function displayError(message) {
    if (errorMessageElement) {
      errorMessageElement.textContent = message;
      errorMessageElement.style.display = "block";
    } else {
      alert(message);
    }
  }
});
