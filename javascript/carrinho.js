document.addEventListener("DOMContentLoaded", function () {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.id) {
      console.error("Usuário não logado; não é possível carregar o carrinho.");
      return;
    }
    const clienteId = usuario.id;
    const carrinhoContainer = document.getElementById("carrinho-items");
  
    // Buscar os itens do carrinho via API
    fetch(`/api/api_get_carrinho.php?cliente_id=${clienteId}`)
      .then(response => response.json())
      .then(data => {
        carrinhoContainer.innerHTML = "";
        
        // Se a API retornar um erro ou nenhum item
        if (data.error || !Array.isArray(data) || data.length === 0) {
          carrinhoContainer.innerHTML = `<p class="text-center">${data.message || 'Nenhum item encontrado no carrinho.'}</p>`;
          atualizarTotal(); // zera o total
          return;
        }
        
        // Para cada item retornado, crie um card
        data.forEach(item => {
          // Verifica se o item possui a propriedade quantidade; se não, define 1
          if (!item.quantidade) {
            item.quantidade = 1;
          }
          
          const cardItem = document.createElement("div");
          cardItem.classList.add("card", "mb-3");
          cardItem.innerHTML = `
            <div class="row justify-content-between align-items-center g-0 item-carrinho"
                 data-pizza-id="${item.pizza_id}"
                 data-preco="${item.preco}"
                 data-tipo-pizza="${item.tipo_pizza ? item.tipo_pizza.toLowerCase() : 'inteira'}"
                 data-nome-pizza="${item.nome_pizza}">
              <div class="col-5">
                <img src="${item.caminho_imagem}" class="img-fluid" alt="${item.nome_pizza}" style="object-fit: cover; max-width: 150px;">
              </div>
              <div class="col-5">
                <div class="card-body p-2">
                  <h4 class="mb-1"><b>${item.nome_pizza}</b></h4>
                  <h5 class="text-danger mb-2">
                    R$ ${ (item.tipo_pizza && item.tipo_pizza.toLowerCase() === "meia") ? (item.preco/2).toFixed(2) : parseFloat(item.preco).toFixed(2) } (unidade)
                  </h5>
                  <div class="btn-group rounded-pill" style="background: #FFEACE;">
                    <button class="btn btn-sm btn-minus" onclick="diminuirQuantidade(${item.pizza_id})">-</button>
                    <span class="quantity px-2">${item.quantidade}</span>
                    <button class="btn btn-sm btn-plus" onclick="aumentarQuantidade(${item.pizza_id}, '${item.nome_pizza}', '${item.tipo_pizza}', ${item.preco})">+</button>
                  </div>
                </div>
              </div>
              <div class="col-2 d-flex flex-column justify-content-center align-items-center">
                <!-- Botão de Favoritar (ícone de coração) -->
                <button class="btn btn-outline-danger mb-2" style="border-radius: 30px;" onclick="favoritarItem(${item.pizza_id}, '${item.nome_pizza}', ${item.preco}, '${item.tipo_pizza}')">
                  <img src="/img/heart.png" class="img-fluid" alt="Favoritar" style="max-width: 24px;">
                </button>
                <!-- Botão de Excluir -->
                <a href="#" class="btn" style="border-radius: 30px; background-color: #FFEACE; border: 1px solid #FFA831;" onclick="excluirItem(${item.pizza_id})">
                  <img src="/img/lixeira.png" class="img-fluid" alt="Excluir">
                </a>
              </div>
            </div>
          `;
          carrinhoContainer.appendChild(cardItem);
        });
        atualizarTotal();
      })
      .catch(error => {
        console.error("Erro ao carregar o carrinho:", error);
        carrinhoContainer.innerHTML = `<p class="text-center">Erro ao carregar os dados.</p>`;
      });
  });
  
  // Função para atualizar o total do pedido
  function atualizarTotal() {
    let total = 0;
    document.querySelectorAll('.item-carrinho').forEach(function(item) {
      const preco = parseFloat(item.dataset.preco);
      const quantidade = parseInt(item.querySelector('.quantity').textContent);
      const tipo = item.dataset.tipoPizza; // "inteira" ou "meia"
      const finalPreco = (tipo === "meia") ? preco / 2 : preco;
      total += finalPreco * quantidade;
    });
    document.getElementById('total-pedido').textContent = 'R$ ' + total.toFixed(2);
  }
  
  // Função para obter o ID do cliente do localStorage
  function getClienteId() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return usuario ? usuario.id : 0;
  }
  
  // Função para aumentar a quantidade (chama a API de registrar/atualizar o carrinho)
  function aumentarQuantidade(pizzaId, nomePizza, tipoPizza, preco) {
    const cliente_id = getClienteId();
    // Chamamos a API para adicionar mais um item ao carrinho
    fetch("/api/api_registrar_carrinho.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviamos os dados que a API espera: cliente_id, pizza_id, preco, nome_pizza, tipo_pizza
        body: JSON.stringify({ 
          cliente_id: cliente_id, 
          pizza_id: pizzaId, 
          preco: preco, 
          nome_pizza: nomePizza, 
          tipo_pizza: tipoPizza 
        })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Se a API confirma sucesso, atualizamos o display da quantidade
        const item = document.querySelector(`.item-carrinho[data-pizza-id="${pizzaId}"]`);
        const quantidadeElem = item.querySelector('.quantity');
        let novaQuantidade = parseInt(quantidadeElem.textContent) + 1;
        quantidadeElem.textContent = novaQuantidade;
        atualizarTotal();
      } else {
        alert("Erro ao aumentar quantidade: " + data.message);
      }
    })
    .catch(error => console.error("Erro na API registrar carrinho:", error));
  }
  
  // Função para diminuir a quantidade do item
  function diminuirQuantidade(pizzaId) {
    const cliente_id = getClienteId();
    const item = document.querySelector(`.item-carrinho[data-pizza-id="${pizzaId}"]`);
    const quantidadeElem = item.querySelector('.quantity');
    let quantidade = parseInt(quantidadeElem.textContent);
    
    if (quantidade > 1) {
      // Se a quantidade for maior que 1, chama a API para diminuir (ex: deletar uma unidade)
      fetch(`/api/api_delete_carrinho.php?pizza_id=${pizzaId}&cliente_id=${cliente_id}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            quantidadeElem.textContent = quantidade - 1;
            atualizarTotal();
          } else {
            alert("Erro ao diminuir quantidade: " + data.message);
          }
        })
        .catch(error => console.error("Erro ao diminuir quantidade:", error));
    } else {
      // Se a quantidade for 1, remove o item completamente
      excluirItem(pizzaId);
    }
  }
  
  // Função para excluir o item do carrinho
  function excluirItem(pizzaId) {
    const cliente_id = getClienteId();
    fetch(`/api/api_delete_carrinho.php?pizza_id=${pizzaId}&cliente_id=${cliente_id}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const item = document.querySelector(`.item-carrinho[data-pizza-id="${pizzaId}"]`);
          if (item) {
            item.remove();
          }
          atualizarTotal();
        } else {
          alert("Erro ao excluir item: " + data.message);
        }
      })
      .catch(error => console.error("Erro ao excluir item:", error));
  }
  
  // Função para favoritar o item
  function favoritarItem(pizzaId, nomePizza, preco, tipoPizza) {
    const cliente_id = getClienteId();
    // Se for do tipo "meia", ajusta o preço (divide por 2)
    const finalPreco = (tipoPizza && tipoPizza.toLowerCase() === "meia") ? preco / 2 : preco;
  
    // Constrói os dados conforme a API de favoritos espera (por exemplo, o campo "pizzas" como array de itens)
    const dados = {
      pizzas: [
        {
          cliente_id: cliente_id,
          pizza_id: pizzaId,
          nome_pizza: nomePizza,
          preco: finalPreco
        }
      ]
    };
  
    fetch("/api/api_pedido_favorito.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Produto adicionado aos favoritos com sucesso!");
      } else {
        alert("Erro ao favoritar o produto: " + data.message);
      }
    })
    .catch(error => {
      console.error("Erro na API de favoritos:", error);
      alert("Erro ao favoritar o produto.");
    });
  }
  