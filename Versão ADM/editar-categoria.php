<?php
require_once 'verifica_sessao.php';
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <title>Editar Categoria</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="topo">
    <div class="logo"><img src="logo.png" alt="Fatias & Sabores" /></div>
    <nav></nav>
  </header>

  <main class="admin-container">
    <?php include 'menu-lateral.php'; ?>

    <section class="conteudo">
      <h2>Editar/Excluir Categoria</h2>
      <p class="subtitulo">Escolha uma categoria para editar ou excluir</p>

      <label for="categoriaSelect">Categoria:</label>
      <select id="categoriaSelect" onchange="preencherInputCategoria()"></select>

      <form id="formCategoria" style="margin-top: 1em;">
        <label for="novaCategoria">Novo nome:</label>
        <input type="text" id="novaCategoria" required />
        <button type="submit" class="botao-principal">SALVAR ALTERAÇÕES</button>
        <button type="button" onclick="deletarCategoria()" style="margin-left: 1em;" class="botao-vermelho">EXCLUIR CATEGORIA</button>
      </form>

      <div id="resultado" style="margin-top: 1em;"></div>
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
    let categorias = [];

    document.addEventListener('DOMContentLoaded', () => {
      fetch('../api/api_get_categorias.php')
        .then(res => res.json())
        .then(data => {
          categorias = data.categorias;
          const select = document.getElementById('categoriaSelect');
          select.innerHTML = '<option value="">Selecione...</option>';
          categorias.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.categoria_id;
            opt.textContent = c.categoria;
            select.appendChild(opt);
          });
        });
    });

    function preencherInputCategoria() {
      const id = document.getElementById('categoriaSelect').value;
      const cat = categorias.find(c => c.categoria_id == id);
      if (cat) document.getElementById('novaCategoria').value = cat.categoria;
    }

    document.getElementById('formCategoria').addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('categoriaSelect').value;
      const nova = document.getElementById('novaCategoria').value.trim();

      fetch('../api/api_update_categoria.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria_id: id, nova_categoria: nova })
      })
      .then(res => res.json())
      .then(data => mostrarMensagem(data.message, data.success))
      .catch(() => mostrarMensagem('Erro ao atualizar categoria.', false));
    });

    function deletarCategoria() {
      const id = document.getElementById('categoriaSelect').value;
      if (!id || !confirm('Tem certeza que deseja excluir esta categoria?')) return;

      fetch('../api/api_update_categoria.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria_id: id })
      })
      .then(res => res.json())
      .then(data => {
        mostrarMensagem(data.message, data.success);
        if (data.success) location.reload();
      })
      .catch(() => mostrarMensagem('Erro ao excluir categoria.', false));
    }

    function mostrarMensagem(msg, sucesso) {
      const div = document.getElementById('resultado');
      div.textContent = msg;
      div.style.color = sucesso ? 'green' : 'red';
    }
  </script>
</body>
</html>
