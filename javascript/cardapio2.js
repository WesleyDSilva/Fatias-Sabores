document.addEventListener("DOMContentLoaded", async () => {
  console.log("Cardapio.js: DOMContentLoaded - Iniciando script.");

  // --- URLs das APIs ---
  // VERIFIQUE CUIDADOSAMENTE SE ESTES CAMINHOS ESTÃO CORRETOS PARA O SEU SERVIDOR
  const urlGetProdutos =
    "https://devweb3.ok.etc.br/api_mobile/api_get_produtos.php";
  const urlRegistrarItemPedido =
    "https://devweb3.ok.etc.br/api_mobile/api_registrar_item_pedido.php";

  // --- Seleção de Elementos do DOM ---
  const getContainerRowById = (id) => {
    const parentContainer = document.getElementById(id);
    if (!parentContainer) return null; // Não é um erro, a seção pode não existir
    const rowElement = parentContainer.querySelector(".row");
    if (!rowElement)
      console.error(
        `Cardapio.js: <div class="row"> NÃO ENCONTRADO dentro de '#${id}'.`
      );
    return rowElement;
  };
  const containers = {
    pizza: getContainerRowById("pizzas-container"),
    hambúrguer: getContainerRowById("hamburguer-container"), // com acento
    bebida: getContainerRowById("bebidas-container"),
    sobremesa: getContainerRowById("sobremesa-container"),
  };

  const categoryFilterSelect = document.getElementById(
    "category-filter-select"
  );
  const cartCountBadgeElement = document.getElementById("cart-count-badge-nav");
  let itemCountInCartLocal = 0;

  // --- Funções Auxiliares ---
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
        console.error(
          "Cardapio.js: Erro ao parsear 'usuario' do localStorage:",
          e
        );
        localStorage.removeItem("usuario");
      }
    }
    return null;
  }

  function updateCartBadgeDisplay() {
    if (cartCountBadgeElement) {
      cartCountBadgeElement.textContent =
        itemCountInCartLocal > 0 ? itemCountInCartLocal : "0";
    }
  }

  // --- Lógica Principal ---
  try {
    const response = await fetch(urlGetProdutos);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro HTTP ${response.status} ao buscar produtos: ${errorText}`
      );
    }
    const produtosMasterList = await response.json();
    if (!Array.isArray(produtosMasterList)) {
      throw new Error("Formato de dados de produtos da API é inválido.");
    }
    console.log(
      "Cardapio.js: Produtos recebidos com sucesso:",
      produtosMasterList.length,
      "itens."
    );

    if (produtosMasterList.length === 0) {
      const mainEl = document.querySelector("main");
      if (mainEl)
        mainEl.innerHTML = `<div class="container text-center py-5"><p class="h4">Nosso cardápio está sendo atualizado!</p></div>`;
      return;
    }

    if (categoryFilterSelect) {
      const categorias = [
        ...new Set(produtosMasterList.map((p) => p.categoria).filter(Boolean)),
      ].sort();
      while (categoryFilterSelect.options.length > 1)
        categoryFilterSelect.remove(categoryFilterSelect.options.length - 1);
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilterSelect.appendChild(option);
      });
      categoryFilterSelect.addEventListener("change", () =>
        aplicarFiltro(produtosMasterList)
      );
    }

    aplicarFiltro(produtosMasterList);
    updateCartBadgeDisplay();
  } catch (erro) {
    console.error("Cardapio.js: Erro fatal ao carregar o cardápio:", erro);
    const mainEl = document.querySelector("main") || document.body;
    mainEl.innerHTML = `<div class="container text-center py-5"><p class="text-danger h3">Ops! Cardápio Indisponível</p><p class="text-muted">${erro.message}</p></div>`;
  }

  function criarCard(produto) {
    let imagem = "/img/padrao.jpg"; // Caminho padrão
    if (produto.caminho && typeof produto.caminho === "string") {
      const cL = produto.caminho.trim();
      if (
        cL &&
        cL.toLowerCase() !== "undefined" &&
        cL.toLowerCase() !== "null"
      ) {
        if (cL.startsWith("http")) imagem = cL;
        else if (cL.startsWith("/")) imagem = cL;
        else imagem = `/img/${cL}`; // Assume que está na pasta /img/ do seu domínio
      }
    }

    const card = document.createElement("div");
    card.className =
      "col-lg-3 col-md-4 col-sm-6 mb-4 d-flex align-items-stretch";
    const sizeOptions = [];
    const catLower = produto.categoria?.toLowerCase() || "outros";

    const precosPizzaMap = [
      {
        campo: "pequena",
        texto: "Pequena (Meia)",
        tApi: "pequena",
        tipoApi: "meia",
      },
      { campo: "media", texto: "Média (Meia)", tApi: "media", tipoApi: "meia" },
      {
        campo: "grande",
        texto: "Grande (Meia)",
        tApi: "grande",
        tipoApi: "meia",
      },
      {
        campo: "pequena_inteira",
        texto: "Pequena Inteira",
        tApi: "pequena",
        tipoApi: "inteira",
      },
      {
        campo: "media_inteira",
        texto: "Média Inteira",
        tApi: "media",
        tipoApi: "inteira",
      },
      {
        campo: "grande_inteira",
        texto: "Grande Inteira",
        tApi: "grande",
        tipoApi: "inteira",
      },
    ];

    if (catLower === "pizza") {
      precosPizzaMap.forEach((opt) => {
        const precoValor = parseFloat(produto[opt.campo]);
        if (produto.hasOwnProperty(opt.campo) && precoValor > 0) {
          sizeOptions.push({
            displayText: `${opt.texto} - R$ ${precoValor.toFixed(2)}`,
            price: precoValor,
            tamanhoApi: opt.tApi,
            tipoApi: opt.tipoApi,
          });
        }
      });
    } else {
      let pVal,
        tApi = "unidade";
      if (produto.pequena && parseFloat(produto.pequena) > 0) {
        pVal = produto.pequena;
        tApi = "pequena";
      } else if (produto.media && parseFloat(produto.media) > 0) {
        pVal = produto.media;
        tApi = "media";
      } else if (produto.grande && parseFloat(produto.grande) > 0) {
        pVal = produto.grande;
        tApi = "grande";
      }

      if (pVal) {
        sizeOptions.push({
          displayText: `Unidade - R$ ${parseFloat(pVal).toFixed(2)}`,
          price: pVal,
          tamanhoApi: tApi,
          tipoApi: "inteira",
        });
      }
    }

    let opcoesHTML = "";
    if (sizeOptions.length > 1) {
      // Múltiplas opções -> Cria <select>
      opcoesHTML = `
        <div class="form-group mt-2 mb-2">
          <label for="size-select-${
            produto.produto_id
          }" class="form-label small fw-bold">Opção:</label>
          <select id="size-select-${
            produto.produto_id
          }" class="form-select form-select-sm">
            ${sizeOptions
              .map(
                (opt, i) =>
                  `<option value='${JSON.stringify({
                    price: opt.price,
                    tamanhoApi: opt.tamanhoApi,
                    tipoApi: opt.tipoApi,
                  })}' ${i === 0 ? "selected" : ""}>${opt.displayText}</option>`
              )
              .join("")}
          </select>
        </div>`;
    } else if (sizeOptions.length === 1) {
      // Apenas uma opção -> Mostra só o preço
      const unicaOpcao = sizeOptions[0];
      opcoesHTML = `
        <div class="mt-2 mb-2">
          <h5 class="card-price text-danger fw-bold">${unicaOpcao.price.toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
          )}</h5>
          <input type="hidden" id="size-select-${
            produto.produto_id
          }" value='${JSON.stringify({
        price: unicaOpcao.price,
        tamanhoApi: unicaOpcao.tamanhoApi,
        tipoApi: unicaOpcao.tipoApi,
      })}'>
        </div>`;
    } else {
      // Nenhuma opção
      opcoesHTML = `<p class="text-danger small mt-2 mb-2">Produto indisponível.</p>`;
    }

    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${imagem}" class="card-img-top" alt="${
      produto.nome || "Produto"
    }" style="height: 200px; object-fit: cover;" onerror="this.onerror=null;this.src='img/padrao.jpg';">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${produto.nome || "Nome Indisponível"}</h5>
          <p class="card-text small text-muted mb-1" style="min-height: 40px; max-height:80px; overflow-y: auto;">${
            produto.ingredientes || "<i>-</i>"
          }</p>
          ${opcoesHTML}
          <div class="d-flex align-items-center mt-auto pt-2">
            <label for="qtd-${
              produto.produto_id
            }" class="small me-2 fw-bold">Qtd:</label>
            <input type="number" id="qtd-${
              produto.produto_id
            }" value="1" min="1" class="form-control form-control-sm me-2" style="width: 70px;" ${
      sizeOptions.length === 0 ? "disabled" : ""
    }>
            <button class="btn btn-sm text-white add-to-cart-btn flex-grow-1" style="background-color: #FFA831;" 
                    data-produto-id="${produto.produto_id}" 
                    data-nome-produto="${produto.nome || "Produto"}" 
                    ${sizeOptions.length === 0 ? "disabled" : ""}>
              <i class="bi bi-cart-plus"></i> Adicionar
            </button>
          </div>
        </div>
      </div>`;
    return card;
  }

  function renderizarProdutos(produtosParaRenderizar) {
    Object.values(containers).forEach((c) => {
      if (c) c.innerHTML = "";
    });

    if (!produtosParaRenderizar || produtosParaRenderizar.length === 0) {
      return;
    }

    produtosParaRenderizar.forEach((produto) => {
      const categoriaNorm = produto.categoria?.toLowerCase() || "outros";
      const card = criarCard(produto);
      let containerAlvo = null;

      if (categoriaNorm.includes("pizza")) containerAlvo = containers.pizza;
      else if (categoriaNorm.includes("hambúrguer"))
        containerAlvo = containers.hambúrguer;
      else if (categoriaNorm.match(/bebida|suco|refrigerante|cerveja/))
        containerAlvo = containers.bebida;
      else if (categoriaNorm.includes("sobremesa"))
        containerAlvo = containers.sobremesa;

      if (containerAlvo) {
        containerAlvo.appendChild(card);
      } else {
        console.warn(
          `Cardapio.js: Sem container para categoria "${categoriaNorm}" do produto "${produto.nome}".`
        );
      }
    });
    adicionarEventosBotoes();
  }

  function adicionarEventosBotoes() {
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", handleAdicionarAoCarrinho);
    });
  }

  async function handleAdicionarAoCarrinho() {
    const produtoId = this.dataset.produtoId;
    const clienteId = getClienteId();
    if (!clienteId) {
      alert("Por favor, faça login para adicionar itens ao pedido.");
      window.location.href = "login.html";
      return;
    }

    const nomeProdutoDisplay = this.dataset.nomeProduto;
    const qtdInput = document.getElementById(`qtd-${produtoId}`);
    const quantidadeSolicitada = qtdInput ? parseInt(qtdInput.value) : 1;

    if (isNaN(quantidadeSolicitada) || quantidadeSolicitada < 1) {
      alert("Quantidade inválida.");
      if (qtdInput) qtdInput.value = 1;
      return;
    }

    const optionSourceElement = document.getElementById(
      `size-select-${produtoId}`
    );
    if (!optionSourceElement || !optionSourceElement.value) {
      alert("Não foi possível obter os detalhes do produto para adicionar.");
      return;
    }
    let selectedOptionData;
    try {
      selectedOptionData = JSON.parse(optionSourceElement.value);
    } catch (e) {
      alert("Erro ao processar opção.");
      console.error("JSON parse select:", e, optionSourceElement.value);
      return;
    }

    const precoUnitarioSelecionado = parseFloat(selectedOptionData.price);
    const tamanhoApiSelecionado = selectedOptionData.tamanhoApi;
    const tipoApiSelecionado = selectedOptionData.tipoApi;

    if (
      isNaN(precoUnitarioSelecionado) ||
      precoUnitarioSelecionado <= 0 ||
      !tamanhoApiSelecionado ||
      !tipoApiSelecionado
    ) {
      alert("Opção selecionada inválida.");
      console.log("Dados da opção inválidos:", selectedOptionData);
      return;
    }

    let itensAdicionadosCount = 0;
    const originalButtonHTML = this.innerHTML;
    this.disabled = true;
    this.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Add...';

    for (let i = 0; i < quantidadeSolicitada; i++) {
      const payload = {
        cliente_id: clienteId,
        pizza_id: parseInt(produtoId), // API espera 'pizza_id'
        preco: precoUnitarioSelecionado,
        tamanho_selecionado: tamanhoApiSelecionado, // API espera 'tamanho_selecionado'
        tipo_pizza: tipoApiSelecionado, // API espera 'tipo_pizza'
      };

      try {
        const respPost = await fetch(urlRegistrarItemPedido, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        let resPostJson;
        try {
          resPostJson = await respPost.json();
        } catch (e) {
          const respText = await respPost.text();
          console.error("API resp não-JSON:", respText);
          resPostJson = {
            success: false,
            message: `Erro no servidor: ${respText.substring(0, 100)}`,
          };
        }

        if (!respPost.ok || !resPostJson.success) {
          alert(
            `Erro ao adicionar unidade ${i + 1} de "${nomeProdutoDisplay}": ${
              resPostJson.message
            }`
          );
        } else {
          itensAdicionadosCount++;
        }
      } catch (errCom) {
        alert(
          `Erro de comunicação ao adicionar "${nomeProdutoDisplay}". Verifique sua conexão.`
        );
        break; // Para o loop em caso de erro de rede
      }
    }
    this.disabled = false;
    this.innerHTML = originalButtonHTML;

    if (itensAdicionadosCount > 0) {
      alert(
        `${itensAdicionadosCount}x "${nomeProdutoDisplay}" adicionado(s) com sucesso!`
      );
      if (qtdInput) qtdInput.value = 1; // Reseta a quantidade no input para 1
      itemCountInCartLocal += itensAdicionadosCount;
      updateCartBadgeDisplay();
    }
  }

  function aplicarFiltro(todosOsProdutos) {
    document
      .querySelectorAll(".product-section")
      .forEach((section) => (section.style.display = "none"));
    const categoriaSelecionada = categoryFilterSelect
      ? categoryFilterSelect.value
      : "all";

    const produtosFiltrados =
      categoriaSelecionada === "all"
        ? todosOsProdutos
        : todosOsProdutos.filter((p) => p.categoria === categoriaSelecionada);

    renderizarProdutos(produtosFiltrados);

    if (produtosFiltrados.length > 0) {
      const secoesComConteudo = new Set();
      produtosFiltrados.forEach((p) => {
        const catNorm = p.categoria?.toLowerCase() || "outros";
        if (catNorm.includes("pizza")) secoesComConteudo.add("pizzas-section");
        else if (catNorm.includes("hambúrguer"))
          secoesComConteudo.add("hamburguer-section");
        else if (catNorm.match(/bebida|suco|refrigerante|cerveja/))
          secoesComConteudo.add("bebidas-section");
        else if (catNorm.includes("sobremesa"))
          secoesComConteudo.add("sobremesa-section");
      });
      secoesComConteudo.forEach((sectionId) => {
        const el = document.getElementById(sectionId);
        if (el) el.style.display = "block";
      });
    } else if (categoriaSelecionada !== "all") {
      let sectionIdParaMensagem = null;
      const catLower = categoriaSelecionada.toLowerCase();
      if (catLower.includes("pizza")) sectionIdParaMensagem = "pizzas-section";
      else if (catLower.includes("hambúrguer"))
        sectionIdParaMensagem = "hamburguer-section";
      else if (catLower.match(/bebida|suco|refrigerante|cerveja/))
        sectionIdParaMensagem = "bebidas-section";
      else if (catLower.includes("sobremesa"))
        sectionIdParaMensagem = "sobremesa-section";

      if (sectionIdParaMensagem) {
        const sectionElement = document.getElementById(sectionIdParaMensagem);
        if (sectionElement) {
          const rowElement = sectionElement.querySelector(".row");
          if (rowElement)
            rowElement.innerHTML = `<p class="text-center col-12 mt-3">Nenhum produto encontrado para "${categoriaSelecionada}".</p>`;
          sectionElement.style.display = "block";
        }
      }
    }
  }
});
