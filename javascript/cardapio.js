document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://devweb3.ok.etc.br/api_mobile/api_get_produtos.php";
  const categoryFilterSelect = document.getElementById(
    "category-filter-select"
  );
  const cartCountElement = document.getElementById("cart-count");

  // Mapeamento de categorias para containers e títulos de seção
  // As chaves devem ser o nome da categoria da API (convertido para minúsculas)
  const categoryContainersMap = {
    pizza: { containerId: "pizzas-container", sectionId: "pizzas-section" },
    hambúrguer: {
      containerId: "hamburguer-container",
      sectionId: "hamburguer-section",
    }, // Categoria da API é "Hambúrguer"
    bebida: { containerId: "bebidas-container", sectionId: "bebidas-section" },
    suco: { containerId: "bebidas-container", sectionId: "bebidas-section" },
    refrigerante: {
      containerId: "bebidas-container",
      sectionId: "bebidas-section",
    },
    cerveja: { containerId: "bebidas-container", sectionId: "bebidas-section" },
    sobremesa: {
      containerId: "sobremesa-container",
      sectionId: "sobremesa-section",
    }, // Categoria da API é "Sobremesa"
  };

  let allProductsData = [];

  function formatPrice(price) {
    const number = parseFloat(price);
    return isNaN(number) ? "N/D" : number.toFixed(2).replace(".", ",");
  }

  function cleanSizeName(sizeName) {
    return sizeName.replace(/Pizza |Fatia /gi, "").trim();
  }

  function renderProducts(productsToRender) {
    Object.values(categoryContainersMap).forEach((mapInfo) => {
      const container = document.getElementById(mapInfo.containerId);
      if (container) container.innerHTML = "";
    });

    if (!productsToRender || productsToRender.length === 0) {
      // Poderia adicionar uma mensagem "Nenhum produto encontrado para esta categoria"
      // nos containers visíveis se productsToRender estiver vazio após um filtro.
      return;
    }

    productsToRender.forEach((item) => {
      const categoriaLower = item.categoria.toLowerCase();
      const mapInfo = categoryContainersMap[categoriaLower]; // Chave do map é a categoria da API em minúsculas

      const productContainer = mapInfo
        ? document.getElementById(mapInfo.containerId)
        : null;

      if (!productContainer) {
        console.warn(
          `Container para categoria '${item.categoria}' (lower: ${categoriaLower}) não encontrado no map. Produto '${item.nome}' não será renderizado.`
        );
        return;
      }

      let card = document.createElement("div");
      card.className = "col-md-6 col-lg-4 mb-4 product-card-item";

      const sizeOptions = [];
      // Verifica se os campos de preço existem e são maiores que 0 ou não nulos antes de adicionar
      if (item.pequena && parseFloat(item.pequena) > 0)
        sizeOptions.push({
          text: `Pequena - R$ ${formatPrice(item.pequena)}`,
          value: item.pequena,
          name: "Pequena",
        });
      if (item.media && parseFloat(item.media) > 0)
        sizeOptions.push({
          text: `Média - R$ ${formatPrice(item.media)}`,
          value: item.media,
          name: "Média",
        });
      if (item.grande && parseFloat(item.grande) > 0)
        sizeOptions.push({
          text: `Grande - R$ ${formatPrice(item.grande)}`,
          value: item.grande,
          name: "Grande",
        });
      if (item.media_inteira && parseFloat(item.media_inteira) > 0)
        sizeOptions.push({
          text: `Média Inteira - R$ ${formatPrice(item.media_inteira)}`,
          value: item.media_inteira,
          name: "Média Inteira",
        });
      if (item.grande_inteira && parseFloat(item.grande_inteira) > 0)
        sizeOptions.push({
          text: `Grande Inteira - R$ ${formatPrice(item.grande_inteira)}`,
          value: item.grande_inteira,
          name: "Grande Inteira",
        });

      sizeOptions.forEach((option) => {
        option.text = cleanSizeName(option.text.replace(/Pizza |Fatia /gi, ""));
        option.name = cleanSizeName(option.name);
      });

      let selectHTML = "";
      let defaultPriceForButton = "0";
      let defaultSizeNameForButton = "Item";

      if (sizeOptions.length > 0) {
        defaultPriceForButton = sizeOptions[0].value;
        defaultSizeNameForButton = sizeOptions[0].name;

        selectHTML = `<div class="form-group mt-2 mb-2">
                            <label for="size-select-${item.produto_id}" class="form-label small">Escolha o tamanho:</label>
                            <select id="size-select-${item.produto_id}" class="form-select form-select-sm">`;
        sizeOptions.forEach((opt) => {
          selectHTML += `<option value='${JSON.stringify({
            price: opt.value,
            sizeName: opt.name,
          })}'>${opt.text}</option>`;
        });
        selectHTML += `</select></div>`;
      } else if (item.preco_unico && parseFloat(item.preco_unico) > 0) {
        // Se sua API tivesse um campo assim para itens de preço único
        defaultPriceForButton = item.preco_unico;
        defaultSizeNameForButton = item.categoria;
        selectHTML = `<p class="card-text price-item mt-2 mb-2">Preço: R$ ${formatPrice(
          item.preco_unico
        )}</p>`;
      } else {
        // Se não houver sizeOptions e nem preco_unico, pode ser um item sem preço definido ou com estrutura diferente
        // No caso do "Wrap de Frango" e "Bolo de Cenoura", eles têm item.pequena.
        // Se item.pequena for o único preço, ele será pego pelo sizeOptions.
        // Se não houver nenhum preço (todos 0 ou null), o select ficará vazio.
        selectHTML = `<p class="text-muted small mt-2 mb-2">Opções de tamanho indisponíveis.</p>`;
      }

      card.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${item.caminho}" class="card-img-top" alt="${
        item.nome
      }" style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-center" style="color: #FFA831;"><b>${
                item.nome
              }</b></h5>
              ${
                item.ingredientes
                  ? `<p class="card-text ingredients"><small><strong>Ingredientes:</strong> ${item.ingredientes}</small></p>`
                  : ""
              }
              ${
                item.detalhes
                  ? `<p class="card-text details"><small><strong>Detalhes:</strong> ${item.detalhes}</small></p>`
                  : ""
              }
              ${selectHTML} 
              <div class="mt-auto">
                <div class="d-flex justify-content-center align-items-center mt-3">
                  <div class="btn-group rounded-pill me-2" style="background: #FFEACE;">
                    <button class="btn btn-sm btn-minus" data-product-id="${
                      item.produto_id
                    }">-</button>
                    <span class="quantity px-2" id="qtd-${
                      item.produto_id
                    }">1</span>
                    <button class="btn btn-sm btn-plus" data-product-id="${
                      item.produto_id
                    }">+</button>
                  </div>
                </div>
                <div class="text-center mt-2">
                    <button class="btn btn-dark rounded-pill add-to-cart-btn" 
                            style="background-color: #FFA831; border: none;"
                            data-id="${item.produto_id}"
                            data-name="${item.nome}"
                            data-image="${item.caminho}"
                            data-default-price="${defaultPriceForButton}" 
                            data-default-size-name="${defaultSizeNameForButton}"
                            ${
                              sizeOptions.length === 0 &&
                              (!item.preco_unico ||
                                parseFloat(item.preco_unico) <= 0)
                                ? "disabled"
                                : ""
                            }> 
                      <i class="bi bi-cart-plus-fill me-1"></i> Adicionar
                    </button>
                </div>
              </div>
            </div>
          </div>
        `;
      productContainer.appendChild(card);
    });

    addQuantityButtonListeners();
    addCartButtonListeners();
  }

  function populateCategoryFilter(products) {
    // Pega categorias únicas, removendo espaços em branco extras e convertendo para um formato consistente para o value do option
    const categoriesData = [
      ...new Set(products.map((p) => p.categoria.trim())),
    ].map((cat) => ({
      text: cat, // Texto original para exibição
      value: cat.toLowerCase().replace(/\s+/g, "-"), // Valor para o option (ex: "hambúrguer")
    }));

    categoryFilterSelect.innerHTML = "";

    // Adiciona "Todas as Categorias"
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Todas as Categorias";
    categoryFilterSelect.appendChild(allOption);

    // Adiciona as categorias da API
    categoriesData.forEach((catData) => {
      const option = document.createElement("option");
      option.value = catData.value; // usa o valor normalizado
      option.textContent = catData.text; // usa o texto original
      categoryFilterSelect.appendChild(option);
    });
  }

  function filterAndDisplayProducts() {
    const selectedCategoryValue = categoryFilterSelect.value; // Este será o valor normalizado (ex: "hambúrguer")

    document.querySelectorAll(".product-section").forEach((section) => {
      section.style.display = "none";
    });

    Object.values(categoryContainersMap).forEach((mapInfo) => {
      const container = document.getElementById(mapInfo.containerId);
      if (container) container.innerHTML = "";
    });

    if (selectedCategoryValue === "all") {
      renderProducts(allProductsData);
      Object.values(categoryContainersMap).forEach((mapInfo) => {
        const sectionElement = document.getElementById(mapInfo.sectionId);
        // Mostra a seção apenas se ela contiver produtos após a renderização
        const containerElement = document.getElementById(mapInfo.containerId);
        if (
          sectionElement &&
          containerElement &&
          containerElement.children.length > 0
        ) {
          sectionElement.style.display = "block";
        } else if (sectionElement) {
          sectionElement.style.display = "none"; // Garante que seções vazias fiquem ocultas
        }
      });
    } else {
      // Filtra usando a categoria original da API, comparando com o texto da opção selecionada
      // ou, melhor, usando o 'value' do select que corresponde à chave do map
      const filtered = allProductsData.filter(
        (p) =>
          p.categoria.toLowerCase().replace(/\s+/g, "-") ===
          selectedCategoryValue
      );
      renderProducts(filtered);

      // A chave para categoryContainersMap deve ser a categoria da API em minúsculas
      // O selectedCategoryValue já é a categoria da API em minúsculas (e com hífen se houver espaço)
      const mapInfo = categoryContainersMap[selectedCategoryValue];
      if (mapInfo && mapInfo.sectionId) {
        const sectionElement = document.getElementById(mapInfo.sectionId);
        const containerElement = document.getElementById(mapInfo.containerId);
        if (
          sectionElement &&
          containerElement &&
          containerElement.children.length > 0
        ) {
          // Mostra a seção apenas se tiver produtos
          sectionElement.style.display = "block";
        }
      } else {
        console.warn(
          `Nenhuma seção mapeada para a categoria selecionada: ${selectedCategoryValue}`
        );
      }
    }
  }

  // Fetch inicial dos produtos
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      allProductsData = data;
      populateCategoryFilter(allProductsData);
      filterAndDisplayProducts();

      if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener(
          "change",
          filterAndDisplayProducts
        );
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar produtos: ", error);
      const mainContent = document.querySelector("main");
      if (mainContent)
        mainContent.innerHTML =
          '<div class="container text-center py-5"><p class="text-danger h3">Desculpe, não foi possível carregar o cardápio. Tente novamente mais tarde.</p></div>';
    });

  // --- Funções do Carrinho e Quantidade (mantidas como antes, com pequenas melhorias nos listeners) ---
  function addQuantityButtonListeners() {
    document.querySelectorAll(".btn-minus, .btn-plus").forEach((button) => {
      button.removeEventListener("click", handleQuantityChange); // Remove listener antigo se houver
      button.addEventListener("click", handleQuantityChange);
    });
  }

  function handleQuantityChange() {
    // Definida fora para ser reutilizável
    const productId = this.dataset.productId;
    const delta = this.classList.contains("btn-plus") ? 1 : -1;
    alterarQuantidade(productId, delta);
  }

  function addCartButtonListeners() {
    document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
      button.removeEventListener("click", handleAddToCart); // Remove listener antigo
      button.addEventListener("click", handleAddToCart);
    });
  }

  function handleAddToCart() {
    // Definida fora para ser reutilizável
    if (this.disabled) return; // Não faz nada se o botão estiver desabilitado

    const id = this.dataset.id;
    const name = this.dataset.name;
    const image = this.dataset.image;
    const quantity = parseInt(document.getElementById(`qtd-${id}`).textContent);

    const sizeSelect = document.getElementById(`size-select-${id}`);
    let productPrice;
    let productSizeName;

    if (sizeSelect && sizeSelect.value) {
      try {
        const selectedOptionData = JSON.parse(sizeSelect.value);
        productPrice = selectedOptionData.price;
        productSizeName = selectedOptionData.sizeName;
      } catch (e) {
        productPrice = this.dataset.defaultPrice; // Usa o fallback se o parse falhar
        productSizeName = this.dataset.defaultSizeName;
      }
    } else {
      productPrice = this.dataset.defaultPrice;
      productSizeName = this.dataset.defaultSizeName;
    }

    if (!productPrice || parseFloat(productPrice) <= 0) {
      // Verifica se o preço é válido
      alert("Opção de tamanho/preço inválida ou indisponível.");
      return;
    }

    if (quantity > 0) {
      adicionarAoCarrinhoLocalStorage(
        id,
        name,
        productPrice,
        quantity,
        image,
        productSizeName
      );
    } else {
      alert("Selecione uma quantidade maior que 0.");
    }
  }

  window.alterarQuantidade = function (produtoId, delta) {
    const qtdElem = document.getElementById("qtd-" + productId);
    if (!qtdElem) return;
    let current = parseInt(qtdElem.textContent);
    current += delta;
    if (current < 1) current = 1;
    qtdElem.textContent = current;
  };

  function adicionarAoCarrinhoLocalStorage(
    productId,
    productName,
    productPrice,
    quantity,
    productImage,
    productSizeName
  ) {
    let cart = JSON.parse(localStorage.getItem("fatiasSaboresCart")) || [];
    const price = parseFloat(productPrice);

    if (isNaN(price) || price <= 0) {
      // Validação mais robusta do preço
      alert("Não foi possível adicionar o item. Preço inválido.");
      return;
    }
    const cartItemId = `${productId}-${productSizeName.replace(/\s+/g, "-")}`;
    const existingItemIndex = cart.findIndex(
      (item) => item.cartId === cartItemId
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        cartId: cartItemId,
        id: productId,
        name: productName,
        sizeName: productSizeName,
        price: price,
        quantity: quantity,
        image: productImage,
      });
    }
    localStorage.setItem("fatiasSaboresCart", JSON.stringify(cart));
    updateCartCount();
    alert(`"${productName} (${productSizeName})" adicionado ao carrinho!`);
    // Reseta a quantidade para 1 no display do produto específico
    const qtdElem = document.getElementById(`qtd-${productId}`);
    if (qtdElem) qtdElem.textContent = "1";
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("fatiasSaboresCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
  }

  updateCartCount();
});

function getClienteId() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  return usuario ? usuario.id : null;
}
