<?php
// editar-pizzas.php
require_once 'verifica_sessao.php';
$tipo_usuario = $_SESSION['tipo_usuario'] ?? 'visualizacao';
$modo_visualizacao = !in_array($tipo_usuario, ['admin', 'operacao']);
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Editar Produtos - Admin</title>
  <link rel="stylesheet" href="style.css" />
  <style>
  .lista-produtos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .card-produto {
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
  }

  .card-produto img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  .card-header {
    position: relative;
  }

  .btn-delete {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    background: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #c00;
  }

  .btn-delete:hover {
    color: #f00;
  }
</style>
</head>
<body>
  <header class="topo">
    <div class="logo">
      <img src="logo.png" alt="Fatias & Sabores" />
    </div>
  </header>

  <main class="admin-container">
    <?php include 'menu-lateral.php'; ?>

    <section class="conteudo">
      <h2>Produtos</h2>
      <p class="subtitulo">Cadastrar Novo Produto</p>

      <form id="formProduto" class="form-edicao-produto" enctype="multipart/form-data" <?= $modo_visualizacao ? 'style="pointer-events: none; opacity: 0.6;"' : '' ?>>
        <label for="categoria">Categoria:</label>
        <select id="categoria" name="categoria_id" required></select>

        <label for="nome">Nome do produto:</label>
        <input type="text" id="nome" name="nome" required />

        <label for="ingredientes">Ingredientes (opcional):</label>
        <input type="text" id="ingredientes" name="ingredientes" placeholder="Ex: mussarela, tomate, orégano" />

        <label for="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao" placeholder="Descrição do Produto" required></textarea>

        <label>Preços (opcional):</label>
        <input type="number" step="0.01" name="pequena" placeholder="Preço Pequena" />
        <input type="number" step="0.01" name="media" placeholder="Preço Média" />
        <input type="number" step="0.01" name="grande" placeholder="Preço Grande" />
        <input type="number" step="0.01" name="media_inteira" placeholder="Preço Média Inteira" />
        <input type="number" step="0.01" name="grande_inteira" placeholder="Preço Grande Inteira" />

        <label for="imagem">Imagem:</label>
        <input type="file" id="imagem" name="imagem" accept="image/*" required />

        <button type="submit" class="botao-principal">Salvar</button>
      </form>

      <div id="resultado" style="margin-top: 1em;"></div>
      <hr>
      <h3>Produtos Cadastrados</h3>

      <label for="filtroCategoria">Filtrar por Categoria:</label>
      <select id="filtroCategoria">
        <option value="">Todas</option>
      </select>

      <div id="listaProdutos" class="lista-produtos"></div>
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
    document.addEventListener("DOMContentLoaded", () => {
      carregarCategorias();
      carregarProdutos();

      document.getElementById('formProduto').addEventListener('submit', cadastrarProduto);
      document.getElementById('filtroCategoria').addEventListener('change', () => {
        const catId = document.getElementById('filtroCategoria').value;
        carregarProdutos(catId);
      });
    });

    function carregarCategorias() {
      fetch('../api/api_get_categorias.php')
        .then(res => res.json())
        .then(data => {
          const selects = [document.getElementById('categoria'), document.getElementById('filtroCategoria')];
          selects.forEach(select => {
            select.innerHTML = `<option value="">${select.id === 'filtroCategoria' ? 'Todas' : 'Selecione...'}</option>`;
          });

          if (data.success && data.categorias.length) {
            data.categorias.forEach(cat => {
              const option1 = document.createElement('option');
              const option2 = document.createElement('option');
              option1.value = option2.value = cat.categoria_id;
              option1.textContent = option2.textContent = cat.categoria;

              selects[0].appendChild(option1);
              selects[1].appendChild(option2);
            });
          }
        });
    }

    function cadastrarProduto(e) {
      e.preventDefault();
      const form = e.target;
      const file = form.imagem.files[0];

      if (!file) {
        return mostrarMensagem('Selecione uma imagem.', false);
      }

      const formData = new FormData();
      formData.append('imagem', file);

      fetch('upload_imagem.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(uploadResp => {
        if (!uploadResp.success) return mostrarMensagem(uploadResp.message, false);

        const payload = {
          nome: form.nome.value,
          ingredientes: form.ingredientes.value,
          detalhes: form.descricao.value,
          pequena: parseFloat(form.pequena.value) || null,
          media: parseFloat(form.media.value) || null,
          grande: parseFloat(form.grande.value) || null,
          media_inteira: parseFloat(form.media_inteira.value) || null,
          grande_inteira: parseFloat(form.grande_inteira.value) || null,
          caminho: uploadResp.caminho,
          categoria_id: parseInt(form.categoria.value)
        };

        return fetch('../api/api_create_pizzas.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      })
      .then(res => res.json())
      .then(data => {
        mostrarMensagem(data.message, data.success);
        if (data.success) {
          form.reset();
          carregarProdutos(document.getElementById('filtroCategoria').value);
        }
      })
      .catch(() => mostrarMensagem('Erro na requisição.', false));
    }

    function mostrarMensagem(msg, sucesso) {
      const el = document.getElementById('resultado');
      el.textContent = msg;
      el.style.color = sucesso ? 'green' : 'red';
    }

    function carregarProdutos(categoriaId = '') {
      const lista = document.getElementById("listaProdutos");
      lista.innerHTML = "<p>Carregando produtos...</p>";

      const url = categoriaId ? `../api/api_get_pizzas.php?categoria_id=${categoriaId}` : '../api/api_get_pizzas.php';

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (!data.success || !data.produtos.length) {
            lista.innerHTML = "<p>Nenhum produto cadastrado.</p>";
            return;
          }

          const html = data.produtos.map(produto => `
            <div class="card-produto" data-id="${produto.produto_id}">
              <div class="card-header">
                <img src="${produto.caminho}" alt="${produto.nome}" />
                <button class="btn-delete" title="Excluir" onclick="deletarProduto(${produto.produto_id})">🗑️</button>
              </div>
              <h4>${produto.nome}</h4>
              <p>${produto.detalhes}</p>
            </div>
          `).join("");

          lista.innerHTML = html;
        })
        .catch(() => {
          lista.innerHTML = "<p style='color:red;'>Erro ao carregar os produtos.</p>";
        });
    }

    function deletarProduto(produto_id) {
      if (!confirm("Tem certeza que deseja excluir este produto?")) return;

      fetch('../api/api_delete_pizzas.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto_id })
      })
      .then(res => res.json())
      .then(data => {
        mostrarMensagem(data.message, data.success);
        if (data.success) {
          carregarProdutos(document.getElementById('filtroCategoria').value);
        }
      })
      .catch(() => mostrarMensagem("Erro ao tentar excluir o produto.", false));
    }
  </script>
</body>
</html>
