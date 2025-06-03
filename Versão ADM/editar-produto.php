<?php
require_once 'verifica_sessao.php';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Editar Produto - Admin</title>
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

    <section class="conteudo">
      <h2>Editar Produto</h2>
      <p class="subtitulo">Selecione uma categoria para editar um produto</p>

      <label for="filtroCategoria">Filtrar por Categoria:</label>
      <select id="filtroCategoria" onchange="carregarProdutosPorCategoria()"></select>

      <label for="filtroProduto">Escolha o Produto:</label>
      <select id="filtroProduto" onchange="carregarProdutoParaEdicao()"></select>

      <form id="formEditarProduto" class="form-edicao-produto" enctype="multipart/form-data" style="display: none;">
        <input type="hidden" id="produto_id" />

        <label for="nome">Nome:</label>
        <input type="text" id="nome" required />

        <label for="ingredientes">Ingredientes:</label>
        <input type="text" id="ingredientes" placeholder="Ex: mussarela, tomate..." />

        <label for="descricao">Descrição:</label>
        <textarea id="descricao" required></textarea>

        <label>Preços:</label>
        <input type="number" step="0.01" id="pequena" placeholder="Preço Pequena" />
        <input type="number" step="0.01" id="media" placeholder="Preço Média" />
        <input type="number" step="0.01" id="grande" placeholder="Preço Grande" />
        <input type="number" step="0.01" id="media_inteira" placeholder="Média Inteira" />
        <input type="number" step="0.01" id="grande_inteira" placeholder="Grande Inteira" />

        <label for="imagem">Imagem (opcional):</label>
        <input type="file" id="imagem" accept="image/*" />

        <button type="submit" class="botao-principal">SALVAR ALTERAÇÕES</button>
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
    let produtos = [];

    document.addEventListener("DOMContentLoaded", () => {
      fetch('../api/api_get_categorias.php')
        .then(res => res.json())
        .then(data => {
          const select = document.getElementById('filtroCategoria');
          select.innerHTML = `<option value="">Selecione...</option>`;
          data.categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.categoria_id;
            opt.textContent = cat.categoria;
            select.appendChild(opt);
          });
        });
    });

    function carregarProdutosPorCategoria() {
      const categoriaId = document.getElementById('filtroCategoria').value;
      fetch(`../api/api_get_pizzas.php?categoria_id=${categoriaId}`)
        .then(res => res.json())
        .then(data => {
          produtos = data.produtos || [];
          const selectProduto = document.getElementById('filtroProduto');
          selectProduto.innerHTML = `<option value="">Selecione um produto</option>`;
          produtos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.produto_id;
            opt.textContent = p.nome;
            selectProduto.appendChild(opt);
          });
        });
    }

    function carregarProdutoParaEdicao() {
      const id = document.getElementById('filtroProduto').value;
      const produto = produtos.find(p => p.produto_id == id);
      if (!produto) return;

      document.getElementById('formEditarProduto').style.display = 'block';
      document.getElementById('produto_id').value = produto.produto_id;
      document.getElementById('nome').value = produto.nome;
      document.getElementById('ingredientes').value = produto.ingredientes;
      document.getElementById('descricao').value = produto.detalhes;
      document.getElementById('pequena').value = produto.pequena || '';
      document.getElementById('media').value = produto.media || '';
      document.getElementById('grande').value = produto.grande || '';
      document.getElementById('media_inteira').value = produto.media_inteira || '';
      document.getElementById('grande_inteira').value = produto.grande_inteira || '';
    }

    document.getElementById('formEditarProduto').addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('produto_id').value;
      const categoriaId = document.getElementById('filtroCategoria').value;
      const file = document.getElementById('imagem').files[0];
      let caminhoImagem = '';

      if (file) {
        const formData = new FormData();
        formData.append('imagem', file);

        const upload = await fetch('upload_imagem.php', { method: 'POST', body: formData }).then(res => res.json());
        if (!upload.success) return mostrarMensagem(upload.message, false);
        caminhoImagem = upload.caminho;
      }

      const payload = {
        produto_id: parseInt(id),
        nome: document.getElementById('nome').value,
        ingredientes: document.getElementById('ingredientes').value,
        detalhes: document.getElementById('descricao').value,
        pequena: parseFloat(document.getElementById('pequena').value) || null,
        media: parseFloat(document.getElementById('media').value) || null,
        grande: parseFloat(document.getElementById('grande').value) || null,
        media_inteira: parseFloat(document.getElementById('media_inteira').value) || null,
        grande_inteira: parseFloat(document.getElementById('grande_inteira').value) || null,
        caminho: caminhoImagem,
        categoria_id: parseInt(categoriaId)
      };

      fetch('../api/api_update_produtos.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => mostrarMensagem(data.message, data.success))
      .catch(() => mostrarMensagem('Erro ao atualizar produto.', false));
    });

    function mostrarMensagem(msg, sucesso) {
      const el = document.getElementById('resultado');
      el.textContent = msg;
      el.style.color = sucesso ? 'green' : 'red';
    }
  </script>
</body>
</html>
