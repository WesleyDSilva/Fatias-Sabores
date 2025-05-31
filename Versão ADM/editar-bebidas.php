<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Editar Bebidas - Admin</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="topo">
    <div class="logo">
      <img src="logo.png" alt="Fatias & Sabores" />
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
    <aside class="menu-lateral">
      <h3>MENU</h3>
      <ul>
        <li><a href="adminDash.php">Home</a></li> 
        <li><a href="novo-colaborador.php">Colaboradores</a></li>
        <li><a href="editar-pizzas.php">Pizzas</a></li>
        <li><a href="editar-bebidas.php">Bebidas</a></li>
        <li><a href="editar-sobremesas.php">Sobremesas</a></li>
      </ul>
    </aside>

    <section class="conteudo">
      <h2>BEBIDAS</h2>
      <p class="subtitulo">MANUTENÇÃO DE CAMPOS</p>
      <p class="descricao-pequena">Utilize os filtros para realizar as edições necessárias.</p>

      <form id="formBebida" class="form-edicao-produto">
        <label for="bebida">Selecione a bebida:</label>
        <select id="bebida" name="bebida" required>
          <option value="">Bebida</option>
          <option value="Coca-Cola" data-categoria="4">Coca-Cola</option>
          <option value="Suco Natural" data-categoria="6">Suco Natural</option>
        </select>

        <label for="media">Preço:</label>
        <input type="text" id="media" name="media" placeholder="Preço" required />

        <label for="imagem">Upload da imagem:</label>
        <input type="file" id="imagem" name="imagem" accept="image/*" required />

        <label for="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao" placeholder="Descrição do Produto" required></textarea>

        <button type="submit" class="botao-principal">SALVAR</button>
        <p id="resultado" style="margin-top: 10px;"></p>
      </form>
      <hr />
      <h3>LISTA DE BEBIDAS</h3>
      <div id="listaBebidas" class="lista-produtos"></div>
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
    document.getElementById('formBebida').addEventListener('submit', function (e) {
      e.preventDefault();
      const form = e.target;
      const fileInput = form.imagem;
      const file = fileInput.files[0];

      if (!file) {
        document.getElementById('resultado').textContent = 'Selecione uma imagem.';
        document.getElementById('resultado').style.color = 'red';
        return;
      }

      const selected = form.bebida.options[form.bebida.selectedIndex];
      const nome = selected.value;
      const categoria_id = parseInt(selected.dataset.categoria);

      const formData = new FormData();
      formData.append('imagem', file);

      // 1. Envia a imagem
      fetch('upload_imagem.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(uploadResp => {
        if (!uploadResp.success) {
          document.getElementById('resultado').textContent = uploadResp.message;
          document.getElementById('resultado').style.color = 'red';
          return;
        }

        // 2. Envia os dados da bebida
        const payload = {
          nome: nome,
          ingredientes: null,
          detalhes: form.descricao.value,
          pequena: null,
          media: parseFloat(form.media.value) || null,
          grande: null,
          media_inteira: null,
          grande_inteira: null,
          caminho: uploadResp.caminho,
          categoria_id: categoria_id
        };

        return fetch('../api/api_create_pizzas.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      })
      .then(res => res?.json())
      .then(data => {
        if (!data) return;
        document.getElementById('resultado').textContent = data.message;
        document.getElementById('resultado').style.color = data.success ? 'green' : 'red';
        if (data.success) form.reset();
        if (categoria_id) carregarBebidas(categoria_id);
      })
      .catch(() => {
        document.getElementById('resultado').textContent = 'Erro na requisição';
        document.getElementById('resultado').style.color = 'red';
      });
    });
    // Carrega bebidas ao abrir a página
  document.addEventListener('DOMContentLoaded', () => {
    const categoriaInicial = document.getElementById('bebida').selectedOptions[0].dataset.categoria;
    if (categoriaInicial) carregarBebidas(categoriaInicial);
  });

  // Atualiza bebidas ao trocar o select
  document.getElementById('bebida').addEventListener('change', (e) => {
    const categoria = e.target.selectedOptions[0].dataset.categoria;
    if (categoria) carregarBebidas(categoria);
  });

  function carregarBebidas() {
    const lista = document.getElementById("listaBebidas");
    lista.innerHTML = "<p>Carregando bebidas...</p>";

    fetch(`../api/api_get_pizzas.php?categorias=4,6`)
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.produtos || !data.produtos.length) {
          lista.innerHTML = "<p>Nenhuma bebida cadastrada.</p>";
          return;
        }

      const html = data.produtos.map(item => `
        <div class="card-produto" data-id="${item.produto_id}">
          <div class="card-header">
            <img src="${item.caminho}" alt="${item.nome}" />
            <button class="btn-delete" title="Excluir" onclick="deletarProduto(${item.produto_id})">🗑️</button>
          </div>
          <h4>${item.nome}</h4>
          <p>${item.detalhes}</p>
          <p><strong>Preço:</strong> R$ ${parseFloat(item.media).toFixed(2)}</p>
        </div>
      `).join("");

        lista.innerHTML = html;
      })
      .catch(() => {
        lista.innerHTML = "<p style='color:red;'>Erro ao carregar bebidas.</p>";
      });
  }
  document.addEventListener("DOMContentLoaded", function () {
  carregarBebidas();
});

function deletarProduto(produto_id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  fetch('../api/api_delete_pizzas.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produto_id })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    if (data.success) {
      carregarBebidas?.();
    }
  })
  .catch(() => {
    alert("Erro ao tentar excluir o produto.");
  });
}
</script>
</body>
</html>
