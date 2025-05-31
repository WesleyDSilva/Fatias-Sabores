<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Editar Sobremesas - Admin</title>
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
      <h2>SOBREMESAS</h2>
      <p class="subtitulo">MANUTENÇÃO DE CAMPOS</p>
      <p class="descricao-pequena">Utilize o formulário para adicionar novas sobremesas.</p>

      <form id="formSobremesa" class="form-edicao-produto">
        <label for="nome">Nome da sobremesa:</label>
        <input type="text" id="nome" name="nome" placeholder="Ex: Pudim" required />

        <label for="preco">Preço:</label>
        <input type="text" id="media" name="media" placeholder="Preço" required />

        <label for="imagem">Upload da imagem:</label>
        <input type="file" id="imagem" name="imagem" accept="image/*" required />

        <label for="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao" placeholder="Descrição da sobremesa" required></textarea>

        <button type="submit" class="botao-principal">SALVAR</button>
        <p id="resultado" style="margin-top: 10px;"></p>
      </form>
      <hr />
      <h3>SOBREMESAS CADASTRADAS</h3>
      <div id="listaSobremesas" class="lista-produtos"></div>
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
  document.getElementById('formSobremesa').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const fileInput = document.getElementById('imagem');
    const file = fileInput.files[0];

    if (!file) {
      alert('Selecione uma imagem para a sobremesa.');
      return;
    }

    const formData = new FormData();
    formData.append('imagem', file);

    // 1. Envia a imagem primeiro
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

      // 2. Envia os dados do produto com o caminho da imagem
      const payload = {
        nome: form.nome.value,
        ingredientes: null,
        detalhes: form.descricao.value,
        pequena: null,
        media: parseFloat(form.media.value) || null,
        grande: null,
        media_inteira: null,
        grande_inteira: null,
        caminho: uploadResp.caminho,
        categoria_id: 5 // categoria para sobremesas
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
      carregarSobremesas();
    })
    .catch(() => {
      document.getElementById('resultado').textContent = 'Erro na requisição';
      document.getElementById('resultado').style.color = 'red';
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
  carregarSobremesas(); // carrega a lista ao entrar na página
});

function carregarSobremesas() {
  const lista = document.getElementById("listaSobremesas");
  lista.innerHTML = "<p>Carregando sobremesas...</p>";

  fetch("../api/api_get_pizzas.php?categoria_id=5")
    .then(res => res.json())
    .then(data => {
      if (!data.success || !data.produtos.length) {
        lista.innerHTML = "<p>Nenhuma sobremesa cadastrada.</p>";
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
        </div>
      `).join("");

      lista.innerHTML = html;
    })
    .catch(() => {
      lista.innerHTML = "<p style='color:red;'>Erro ao carregar as sobremesas.</p>";
    });
}

function deletarProduto(produto_id) {
  if (!confirm("Tem certeza que deseja excluir esta sobremesa?")) return;

  fetch('../api/api_delete_pizzas.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produto_id })
  })
  .then(res => res.text())
  .then(text => {
    try {
      const data = JSON.parse(text);
      alert(data.message);
      if (data.success) carregarSobremesas();
    } catch (e) {
      console.error("Resposta inválida do servidor:", text);
      alert("Erro ao excluir. Resposta inesperada.");
    }
  })
  .catch((err) => {
    console.error("Erro na requisição:", err);
    alert("Erro ao tentar excluir o produto.");
  });
}
  </script>
</body>
</html>
