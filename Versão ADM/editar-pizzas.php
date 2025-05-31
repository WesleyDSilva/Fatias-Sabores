<?php
// editar_pizzas.php
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Editar Pizzas - Admin</title>
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
        <!-- FUTURAMENTE HOME DEVERÁ SER LISTA DOS PEDIDOS -->
        <li><a href="adminDash.php">Home</a></li> 
        <li><a href="novo-colaborador.php">Colaboradores</a></li>
        <li><a href="editar-pizzas.php">Pizzas</a></li>
        <li><a href="editar-bebidas.php">Bebidas</a></li>
        <li><a href="editar-sobremesas.php">Sobremesas</a></li>
        <!-- <li><a href="#">Pedidos</a></li> -->
      </ul>
    </aside>

    <section class="conteudo">
      <h2>PIZZAS</h2>
      <p class="subtitulo">CADASTRAR NOVA PIZZA</p>
      <form id="formPizza" class="form-edicao-produto" enctype="multipart/form-data">
        <label for="nome">Nome da pizza:</label>
        <input type="text" id="nome" name="nome" required />

        <label for="ingredientes">Ingredientes:</label>
        <input type="text" id="ingredientes" name="ingredientes" placeholder="Ex: mussarela, tomate, orégano" />

        <label for="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao" placeholder="Descrição do Produto" required></textarea>

        <label>Preços:</label>
        <input type="number" step="0.01" name="pequena" placeholder="Preço Pequena (opcional)" />
        <input type="number" step="0.01" name="media" placeholder="Preço Média (opcional)" />
        <input type="number" step="0.01" name="grande" placeholder="Preço Grande (opcional)" />
        <input type="number" step="0.01" name="media_inteira" placeholder="Média Inteira (opcional)" />
        <input type="number" step="0.01" name="grande_inteira" placeholder="Grande Inteira (opcional)" />

        <label for="imagem">Imagem:</label>
        <input type="file" id="imagem" name="imagem" accept="image/*" required />

        <button type="submit" class="botao-principal">SALVAR</button>
      </form>

      <div id="resultado" style="margin-top: 1em; color: green;"></div>
      <hr>
      <h3>PIZZAS CADASTRADAS</h3>
      <div id="listaPizzas" class="lista-produtos"></div>
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
    document.getElementById('formPizza').addEventListener('submit', function (e) {
      e.preventDefault();
      const form = e.target;
      const fileInput = form.imagem;
      const file = fileInput.files[0];

      if (!file) {
        document.getElementById('resultado').textContent = 'Selecione uma imagem.';
        document.getElementById('resultado').style.color = 'red';
        return;
      }

      const formData = new FormData();
      formData.append('imagem', file);

      // 1. Enviar imagem para upload_imagem.php
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

        // 2. Após upload bem-sucedido, envia dados para api_create_pizzas.php
        const payload = {
          nome: form.nome.value,
          ingredientes: form.ingredientes.value,
          detalhes: form.descricao.value,
          pequena: parseFloat(form.pequena.value) || null,
          media: parseFloat(form.media.value) || null,
          grande: parseFloat(form.grande.value) || null,
          media_inteira: parseFloat(form.media_inteira.value) || null,
          grande_inteira: parseFloat(form.grande_inteira.value) || null,
          caminho: uploadResp.caminho, // Agora é o caminho real salvo
          categoria_id: 1 // PIZZA
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
        carregarPizzas();
      })
      .catch(() => {
        document.getElementById('resultado').textContent = 'Erro na requisição';
        document.getElementById('resultado').style.color = 'red';
      });
    });
    </script>
    <script>
document.addEventListener("DOMContentLoaded", () => {
  carregarPizzas(); // carrega pizzas ao abrir a página
});

function carregarPizzas() {
  const lista = document.getElementById("listaPizzas");
  lista.innerHTML = "<p>Carregando pizzas...</p>";

  fetch('../api/api_get_pizzas.php?categoria_id=1')
    .then(res => res.json())
    .then(data => {
      if (!data.success || !data.produtos.length) {
        lista.innerHTML = "<p>Nenhuma pizza cadastrada.</p>";
        return;
      }

      const html = data.produtos.map(pizza => `
        <div class="card-produto" data-id="${pizza.produto_id}">
          <div class="card-header">
            <img src="${pizza.caminho}" alt="${pizza.nome}" />
            <button class="btn-delete" title="Excluir" onclick="deletarProduto(${pizza.produto_id})">🗑️</button>
          </div>
          <h4>${pizza.nome}</h4>
          <p>${pizza.detalhes}</p>
        </div>
      `).join("");

      lista.innerHTML = html;
    })
    .catch(() => {
      lista.innerHTML = "<p style='color:red;'>Erro ao carregar as pizzas.</p>";
    });
}

function deletarProduto(produto_id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  fetch('../api/api_delete_pizzas.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produto_id })
  })
  .then(res => res.text()) // primeiro vê como texto puro
  .then(text => {
    console.log("Resposta bruta:", text); // veja o erro real aqui
    try {
      const data = JSON.parse(text); // tenta converter pra JSON manualmente
      alert(data.message);
      if (data.success) {
        carregarPizzas(); // atualiza lista
      }
    } catch (e) {
      alert("Erro no formato da resposta do servidor.");
      console.error("Erro ao fazer parse do JSON:", e);
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
