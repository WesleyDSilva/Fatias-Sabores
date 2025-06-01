document.addEventListener("DOMContentLoaded", async () => {
  // Correção das URLs
  const urlGet = "https://devweb3.ok.etc.br/api_mobile/api_get_produtos.php";
  const urlPost =
    "https://devweb3.ok.etc.br/api_mobile/api_registrar_item_pedido.php";

  // Seletores
  const pizzasContainer = document.getElementById("pizzas-container");
  const hamburguerContainer = document.getElementById("hamburguer-container");
  const bebidasContainer = document.getElementById("bebidas-container");
  const sobremesaContainer = document.getElementById("sobremesa-container");
  const categoryFilter = document.getElementById("category-filter-select");
  const cartCountElement = document.getElementById("cart-count");

  function getClienteId() {
    const usuarioString = localStorage.getItem("usuario");
    if (usuarioString) {
      try {
        const usuario = JSON.parse(usuarioString);
        if (
          usuario &&
          typeof usuario.id !== "undefined" &&
          !isNaN(parseInt(usuario.id))
        ) {
          return parseInt(usuario.id);
        }
      } catch (e) {
        console.error("Erro ao parsear 'usuario' do localStorage:", e);
      }
    }
    console.warn(
      "getClienteId: Nenhum usuário logado encontrado ou ID inválido."
    );
    return null;
  }

  function updateCartCount() {
    cartCountElement.textContent = "0"; // Placeholder
  }

  try {
    const response = await fetch(urlGet);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }
    const produtos = await response.json();

    // Popula o filtro de categorias
    const categorias = new Set(
      produtos.map((p) => p.categoria).filter(Boolean)
    );
    while (categoryFilter.options.length > 1) {
      categoryFilter.remove(1);
    }
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      categoryFilter.appendChild(option);
    });

    function criarCard(produto) {
      const imagem =
        produto.caminho && produto.caminho.trim() !== ""
          ? produto.caminho
          : "img/padrao.jpg";
      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";

      const sizeOptions = getSizeOptions(produto);

      let selectHTML = "";
      if (sizeOptions.length > 0) {
        selectHTML = `
          <div class="form-group mt-2 mb-2">
            <label for="size-select-${produto.produto_id}" class="form-label small fw-bold">Opção:</label>
            <select id="size-select-${produto.produto_id}" class="form-select form-select-sm">`;
        sizeOptions.forEach((opt) => {
          selectHTML += `<option value='${JSON.stringify({
            price: opt.price,
            tamanhoApi: opt.tamanhoApi,
            tipoApi: opt.tipoApi,
          })}'>${opt.displayText}</option>`;
        });
        selectHTML += `</select>
          </div>`;
      } else {
        selectHTML = `<p class="text-danger small mt-2 mb-2">Produto indisponível.</p>`;
      }

      card.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${imagem}" class="card-img-top" alt="${
        produto.nome
      }" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${produto.nome}</h5>
            <p class="card-text small text-muted">${
              produto.ingredientes || ""
            }</p>
            <p class="card-text small">${produto.detalhes || ""}</p>
            ${selectHTML}
            <div class="d-flex align-items-center mt-auto pt-2">
              <label for="qtd-${
                produto.produto_id
              }" class="small me-2 fw-bold">Qtd:</label>
              <input type="number" id="qtd-${
                produto.produto_id
              }" value="1" min="1" class="form-control form-control-sm me-2" style="width: 70px;">
              <button class="btn btn-sm text-white add-to-cart-btn flex-grow-1" style="background-color: #FFA831;"
                data-id="${produto.produto_id}"
                data-nome="${produto.nome}"
                ${sizeOptions.length === 0 ? "disabled" : ""}>
                <i class="bi bi-cart-plus"></i> Adicionar
              </button>
            </div>
          </div>
        </div>
      `;
      return card;
    }

    function getSizeOptions(produto) {
      const options = [];
      if (produto.pequena) {
        options.push({
          displayText: `Pequena - R$ ${parseFloat(produto.pequena).toFixed(2)}`,
          price: produto.pequena,
          tamanhoApi: "pequena",
          tipoApi: "inteira",
        });
      }
      if (produto.media) {
        options.push({
          displayText: `Média - R$ ${parseFloat(produto.media).toFixed(2)}`,
          price: produto.media,
          tamanhoApi: "media",
          tipoApi: "inteira",
        });
      }
      if (produto.grande) {
        options.push({
          displayText: `Grande - R$ ${parseFloat(produto.grande).toFixed(2)}`,
          price: produto.grande,
          tamanhoApi: "grande",
          tipoApi: "inteira",
        });
      }
      return options;
    }

    function renderizarProdutos(produtosFiltrados) {
      if (pizzasContainer) pizzasContainer.innerHTML = "";
      if (hamburguerContainer) hamburguerContainer.innerHTML = "";
      if (bebidasContainer) bebidasContainer.innerHTML = "";
      if (sobremesaContainer) sobremesaContainer.innerHTML = "";

      produtosFiltrados.forEach((produto) => {
        const card = criarCard(produto);
        const categoria = produto?.categoria?.toLowerCase() || "";
        if (categoria.includes("pizza")) {
          pizzasContainer.appendChild(card);
        } else if (categoria.includes("hambúrguer")) {
          hamburguerContainer.appendChild(card);
        } else if (categoria.match(/bebida|suco|refrigerante|cerveja/)) {
          bebidasContainer.appendChild(card);
        } else if (categoria.includes("sobremesa")) {
          sobremesaContainer.appendChild(card);
        }
      });
      adicionarEventosBotoes();
    }

    function adicionarEventosBotoes() {
      document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id_produto_str = btn.dataset.id;
          const nome_produto = btn.dataset.nome;
          const cliente_id = getClienteId();

          if (!cliente_id) {
            alert("Por favor, faça login para adicionar itens ao pedido.");
            return;
          }

          const qtdInput = document.getElementById(`qtd-${id_produto_str}`);
          const quantidade = parseInt(qtdInput.value) || 1;

          const sizeSelect = document.getElementById(
            `size-select-${id_produto_str}`
          );
          let selectedOptionData = JSON.parse(sizeSelect.value);

          const payload = {
            cliente_id,
            produto_id: parseInt(id_produto_str),
            preco: parseFloat(selectedOptionData.price),
            tamanho_selecionado: selectedOptionData.tamanhoApi,
            tipo_tamanho: selectedOptionData.tipoApi,
            quantidade, // Adiciona a quantidade
          };

          try {
            const respostaPost = await fetch(urlPost, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const resultadoPost = await respostaPost.json();
            if (respostaPost.ok && resultadoPost.success) {
              alert(
                `${quantidade}x "${nome_produto}" adicionado(s) com sucesso ao pedido!`
              );
              qtdInput.value = 1; // Resetar quantidade
              updateCartCount(); // Atualiza o contador do carrinho
            } else {
              alert(`Erro ao adicionar item: ${resultadoPost.message}`);
            }
          } catch (erro) {
            console.error("Erro de comunicação ao adicionar item:", erro);
            alert("Erro de comunicação. Tente mais tarde.");
          }
        });
      });
    }

    renderizarProdutos(produtos);
    updateCartCount();

    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => {
        const categoriaSelecionada = categoryFilter.value;
        const filtrados = produtos.filter(
          (p) => p.categoria === categoriaSelecionada
        );
        renderizarProdutos(filtrados);
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    alert("Erro ao carregar o cardápio. Tente novamente mais tarde.");
  }
});
