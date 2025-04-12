document.addEventListener("DOMContentLoaded", function(){
  fetch("/api/api_get_pizzas.php")
    .then(response => response.json())
    .then(data => {
      const pizzasContainer = document.getElementById("pizzas-container");
      const bebidasContainer = document.getElementById("bebidas-container");

      data.forEach(item => {
        // Cria um card para cada produto
        let card = document.createElement("div");
        card.className = "col-sm-4 col-md-4 mb-4";

        // Se o produto for uma pizza, cria o campo de seleção de tamanho
        let tamanhoHTML = "";
        if(item.categoria.toLowerCase() === "pizza") {
          tamanhoHTML = `
            <div class="form-group text-center mt-2">
              <label for="tamanho-${item.produto_id}" style="font-size: 0.9rem;">Tamanho:</label>
              <select id="tamanho-${item.produto_id}" class="form-select form-select-sm" style="max-width: 120px; margin: 0 auto;">
                <option value="1">Inteira</option>
                <option value="0">Meia</option>
              </select>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="card align-items-center">
            <!-- Link para a página de detalhes passando o id como query string -->
            <a href="pizza.html?id=${item.produto_id}" style="text-decoration: none;">
              <img src="${item.caminho}" class="card-img-top" style="max-width: 200px;" alt="${item.nome}">
            </a>
            <div class="card-body">
              <h5 class="card-title text-center" style="color: #FFA831;">
                <a href="pizza.html?id=${item.produto_id}" style="color: inherit; text-decoration: none;">
                  <b>${item.nome}</b>
                </a>
              </h5>
              <p class="card-text text-center">R$ ${parseFloat(item.preco).toFixed(2)}</p>
              ${tamanhoHTML}
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div class="btn-group rounded-pill" style="background: #FFEACE;">
                  <button class="btn btn-sm btn-minus" onclick="alterarQuantidade(${item.produto_id}, -1)">-</button>
                  <span class="quantity px-2" id="qtd-${item.produto_id}">0</span>
                  <button class="btn btn-sm btn-plus" onclick="alterarQuantidade(${item.produto_id}, 1)">+</button>
                </div>
                <button class="btn btn-dark rounded-pill" 
                        style="background-color: #FFA831; border: none;"
                        onclick="adicionarAoCarrinho(${item.produto_id}, ${item.preco}, '${item.nome}', '${item.categoria}')">
                  Adicionar ao carrinho
                </button>
              </div>
            </div>
          </div>
        `;

        // Insere o card na seção apropriada com base na categoria
        if(item.categoria.toLowerCase() === "pizza") {
          pizzasContainer.appendChild(card);
        } else if(item.categoria.toLowerCase() === "suco" || item.categoria.toLowerCase() === "bebida") {
          bebidasContainer.appendChild(card);
        }
      });
    })
    .catch(error => {
      console.error("Erro ao carregar os produtos: ", error);
    });
});

// Função para alterar a quantidade exibida (soma ou subtrai)
function alterarQuantidade(produtoId, delta) {
  const qtdElem = document.getElementById("qtd-" + produtoId);
  let current = parseInt(qtdElem.textContent);
  current += delta;
  if (current < 0) current = 0;
  qtdElem.textContent = current;
}

// Função para adicionar ao carrinho (chama a api_registrar_carrinho.php)
function adicionarAoCarrinho(produtoId, preco, nome, categoria) {
  // Obtem a quantidade selecionada:
  const qtd = parseInt(document.getElementById("qtd-" + produtoId).textContent);
  if(qtd <= 0) {
    alert("Selecione uma quantidade maior que 0 para adicionar.");
    return;
  }
  
  // Se o produto for uma pizza, captura o tamanho (inteira ou meia)
  let tamanho = null;
  if(categoria.toLowerCase() === "pizza") {
    const tamanhoElem = document.getElementById("tamanho-" + produtoId);
    if(tamanhoElem) {
      tamanho = tamanhoElem.value;
    }
  }

    // Converte o valor do select para o campo "tipo_pizza" (a API espera "inteira" ou "meia") REVISAR
    let tipo_pizza = 'inteira'; // valor padrão
    if(tamanho !== null) {
      tipo_pizza = (tamanho === '1') ? 'inteira' : 'meia';
    }
  
      // Monta os dados a serem enviados com os nomes de campos conforme a API - REVISAR
    const dados = {
    cliente_id: getClienteId(),     // Obtém o ID do cliente
    pizza_id: produtoId,            // Alinha com o campo esperado na API
    preco: preco,
    nome_pizza: nome,               // Alinha com o campo esperado na API
    tipo_pizza: tipo_pizza
  };

  /* Monta os dados a serem enviados:
  const dados = {
    cliente_id: getClienteId(), // Função para obter o ID do cliente (pode ser do localStorage ou sessão)
    produto_id: produtoId,
    preco: preco,
    nome: nome,
    quantidade: qtd,
    tamanho: tamanho
  }; */
  
  fetch("/api/api_registrar_carrinho.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      alert("Produto adicionado ao carrinho com sucesso!");
      // Opcional: reseta a quantidade para 0
      document.getElementById("qtd-" + produtoId).textContent = "0";
    } else {
      alert("Erro ao adicionar ao carrinho: " + data.message);
    }
  })
  .catch(error => {
    console.error("Erro na API registrar carrinho: ", error);
  });
}

// Exemplo de função para obter o ID do cliente (do localStorage, por exemplo)
function getClienteId() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  return usuario ? usuario.id : 0;
}
