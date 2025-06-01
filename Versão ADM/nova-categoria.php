<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nova Categoria - Admin</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="topo">
    <div class="logo">
      <img src="logo.png" alt="Fatias & Sabores" />
    </div>
    <nav></nav>
  </header>

  <main class="admin-container">
    <?php include 'menu-lateral.php'; ?>

    <section class="conteudo-categoria">
      <h2>Nova Categoria</h2>
      <p class="subtitulo">Cadastrar nova categoria de produtos</p>

      <form id="formCategoria" class="form-edicao-produto">
        <label for="categoria">Nome da Categoria:</label>
        <input type="text" id="categoria" name="categoria" required placeholder="Ex: Pizzas, Bebidas, Sobremesas..." />

        <button type="submit" class="botao-principal">SALVAR CATEGORIA</button>
      </form>

      <div id="resultado" style="margin-top: 1em; color: green;"></div>
    </section>
  </main>

  <footer class="rodape">
    <div>
      <p><strong>Contate-nos</strong></p>
      <p>📞 (19) 7070-7070<br />📧 pizzariafatiasesabores</p>
      <p>📸 @pizzariafatiasesabores</p>
    </div>
  </footer>

  <script>
    document.getElementById('formCategoria').addEventListener('submit', function(e) {
      e.preventDefault();

      const nomeCategoria = document.getElementById('categoria').value.trim();

      if (!nomeCategoria) {
        mostrarMensagem('Informe o nome da categoria.', false);
        return;
      }

      fetch('../api/api_create_categoria.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria: nomeCategoria })
      })
      .then(res => res.json())
      .then(data => {
        mostrarMensagem(data.message, data.success);
        if (data.success) {
          document.getElementById('formCategoria').reset();
        }
      })
      .catch(() => mostrarMensagem("Erro ao tentar cadastrar a categoria.", false));
    });

    function mostrarMensagem(msg, sucesso) {
      const el = document.getElementById('resultado');
      el.textContent = msg;
      el.style.color = sucesso ? 'green' : 'red';
    }
  ript>
</body>
</html>
