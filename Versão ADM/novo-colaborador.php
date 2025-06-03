<?php
// novo_colaborador.php
require_once 'verifica_sessao.php';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Novo Colaborador - Fatias & Sabores</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="topo">
    <div class="logo">
      <img src="logo.png" alt="Logo Fatias & Sabores" />
    </div>
    <nav>
      <a href="#">Início</a>
      <a href="#">Cardápio</a>
      <a href="#">Cadastre-se</a>
      <a href="#">Login</a>
      <a href="#">Carrinho</a>
    </nav>
  </header>

  <main class="admin-container">
    <?php include 'menu-lateral.php'; ?>
    <!-- <aside class="menu-lateral">
      <h3>MENU</h3>
      <ul>
        <li><a href="adminDash.php">Home</a></li> 
        <li><a href="novo-colaborador.php">Colaboradores</a></li>
        <li><a href="editar-pizzas.php">Pizzas</a></li>
        <li><a href="editar-bebidas.php">Bebidas</a></li>
        <li><a href="editar-sobremesas.php">Sobremesas</a></li>
      </ul>
    </aside> -->

    <section class="conteudo">
      <h2>NOVO COLABORADOR</h2>
      <h4 class="subtitulo">PERFIL</h4>
      <form class="formulario" id="formNovoColaborador">
        <label>Nome<br/><input type="text" name="nome" required /></label><br/>
        <label>Função<br/><input type="text" name="cargo" required /></label><br/>
        <label>Telefone<br/><input type="text" name="telefone" required /></label><br/>
        <label>Perfil<br/>
          <select name="perfil" required>
            <option value="colaborador">Colaborador</option>
            <option value="admin">Administrador</option>
          </select>
        </label><br/>
        <label id="nivelAdminLabel" style="display:none;">
        Nível do Administrador<br/>
        <select name="nivel_admin">
          <option value="1">1 - Master</option>
          <option value="2">2 - Operacional</option>
          <option value="3" selected>3 - Visualização</option>
        </select>
      </label><br/>
        <label>Placa<br/><input type="text" name="placa" /></label><br/>
        <label>E-mail Login<br/><input type="email" name="email" required /></label><br/>
        <label>Senha<br/><input type="password" name="senha" required /></label><br/>
        <label>Confirmação de Senha<br/><input type="password" name="confirma_senha" required /></label><br/>
        <button type="submit">INSERIR</button>
      </form>
      <hr><br>
      <h3>COLABORADORES CADASTRADOS</h3>
      <input type="text" id="buscaNome" placeholder="🔍 Buscar por nome..." style="width: 100%; padding: 6px; margin-bottom: 10px;" />
      <table border="1" width="100%" cellpadding="8">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Telefone</th>
            <th>Placa</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody id="tabelaColaboradores"></tbody>
      </table>
      <div id="msgDelete" style="margin-top: 10px;"></div>
  </main>
      <div id="mensagem" style="margin-top:20px;"></div>
    </section>
  <footer class="rodape">
    <div>
      <p><strong>Contate-nos</strong></p>
      <p>📞 (19) 7070-7070<br/>📧 pizzariafatiasesabores</p>
      <p>📸 @pizzariafatiasesabores</p>
    </div>
  </footer>
  <script>
    document.getElementById("formNovoColaborador").addEventListener("submit", async function (e) {
      e.preventDefault();
      const form = e.target;
      const mensagem = document.getElementById("mensagem");

      const senha = form.senha.value;
      const confirma = form.confirma_senha.value;

      if (senha !== confirma) {
        mensagem.innerHTML = '<span style="color:red;">❌ As senhas não coincidem.</span>';
        return;
      }

      const colaborador = {
        nome: form.nome.value,
        cargo: form.cargo.value,
        telefone: form.telefone.value,
        perfil: form.perfil.value,
        email: form.email.value,
        senha: senha,
        placa: form.placa.value || null,
      };

      if (form.perfil.value === "admin") {
        colaborador.nivel_admin = parseInt(form.nivel_admin.value);
      }

      try {
        const res = await fetch('../api/api_create_colaboradores.php', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(colaborador)
        });

        const json = await res.json();

        if (json.success) {
          mensagem.innerHTML = '<span style="color:green;">✅ ' + json.message + '</span>';
          form.reset();
        } else {
          mensagem.innerHTML = '<span style="color:red;">❌ ' + json.message + '</span>';
        }
      } catch (err) {
        mensagem.innerHTML = '<span style="color:red;">❌ Erro na requisição: ' + err.message + '</span>';
      }
    });
    </script>
    <script>
      async function carregarColaboradores(filtro = "") {
        try {
          const res = await fetch("../api/api_get_colaboradores.php?nome=" + encodeURIComponent(filtro));
          const json = await res.json();
          const tabela = document.getElementById("tabelaColaboradores");
          tabela.innerHTML = "";

          if (!json.success || !Array.isArray(json.colaboradores)) {
            tabela.innerHTML = "<tr><td colspan='7'>Erro ao carregar colaboradores.</td></tr>";
            return;
          }

          if (json.colaboradores.length === 0) {
            tabela.innerHTML = "<tr><td colspan='7'>Nenhum colaborador encontrado.</td></tr>";
            return;
          }

          json.colaboradores.forEach(colab => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${colab.nome}</td>
              <td>${colab.cargo}</td>
              <td>${colab.telefone}</td>
              <td>${colab.placa || ''}</td>
              <td><button onclick="deletarColaborador(${colab.funcionario_id})" style="color: red;">🗑️</button></td>
            `;
            tabela.appendChild(tr);
          });
        } catch (err) {
          console.error(err);
          document.getElementById("tabelaColaboradores").innerHTML = "<tr><td colspan='7'>Erro ao carregar dados.</td></tr>";
        }
      }

      document.getElementById("buscaNome").addEventListener("input", function () {
        carregarColaboradores(this.value);
      });

      async function deletarColaborador(id) {
        if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;

        try {
          const res = await fetch("../api/api_delete_colaboradores.php", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ funcionario_id: id })
          });

          const json = await res.json();
          document.getElementById("msgDelete").innerHTML = json.success
            ? `<span style="color:green;">✅ ${json.message}</span>`
            : `<span style="color:red;">❌ ${json.message}</span>`;

          carregarColaboradores(); // recarrega a tabela
        } catch (err) {
          document.getElementById("msgDelete").innerHTML = `<span style="color:red;">❌ Erro ao deletar: ${err.message}</span>`;
        }
      }

      // Carrega ao abrir a página
      window.addEventListener("DOMContentLoaded", () => carregarColaboradores());
    </script>
    <script>
    document.querySelector('select[name="perfil"]').addEventListener('change', function () {
      const nivelAdminField = document.getElementById("nivelAdminLabel");
      if (this.value === "admin") {
        nivelAdminField.style.display = "block";
      } else {
        nivelAdminField.style.display = "none";
      }
    });
    </script>
</body>
</html>
