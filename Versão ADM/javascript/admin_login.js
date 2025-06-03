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
        "api/api_auth_funcionario.php";
      

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

        const contentType = response.headers.get("content-type");
        let result;
        let errorTextForDisplay = `Erro no servidor (Status: ${response.status}).`;

        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
          if (result && result.message) {
            errorTextForDisplay = result.message;
          }
        } else {
          const textResult = await response.text();
          if (
            textResult &&
            textResult.length < 200 &&
            !textResult.trim().startsWith("<")
          ) {
            errorTextForDisplay = textResult;
          }
        }

        console.log("Resposta da API de login:", result || "Resposta não JSON/Vazia");

        if (response.ok && result && result.success && result.user) {
          // ✅ Só aqui você pode usar result.user!
          // Grava no localStorage
          localStorage.setItem("funcionarioUser", JSON.stringify(result.user));
          if (result.token) {
            localStorage.setItem("funcionarioToken", result.token);
          }

          // ✅ Agora sim, chama criar_sessao.php
          await fetch("criar_sessao.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: result.user }),
          });

          const perfil = result.user.perfil_id; // Certifique-se que é 'perfil_id' e não 'perfil'
          const tipo = result.user.tipo_usuario;

          if (
            perfil === 1 &&
            (tipo === "admin" || tipo === "operacao" || tipo === "visualizacao")
          ) {
            alert("Login de administrador realizado com sucesso!");
            window.location.href = "adminDash.php";
          } else {
            displayError(
              `Acesso permitido como ${result.user.cargo || "funcionário"}, mas esta área é apenas para administradores.`
            );
          }

        } else {
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
