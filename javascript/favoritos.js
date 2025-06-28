// javascript/favoritos.js
document.addEventListener("DOMContentLoaded", async function () {
  // Tornada async para await no carregamento inicial
  // URLs das APIs
  const urlGetFavoritos =
    "https://devweb3.ok.etc.br/api_mobile/api_get_pedidos_favoritos.php";
  const urlDeleteFavorito =
    "https://devweb3.ok.etc.br/api/api_delete_favorito.php"; // API para deletar favorito
  const urlGetProdutosGeral =
    "https://devweb3.ok.etc.br/api_mobile/api_get_produtos.php"; // API para obter todos os produtos
  const urlAdicionarItemAoPedido =
    "https://devweb3.ok.etc.br/api_mobile/api_registrar_item_pedido.php"; // API para adicionar ao carrinho/pedido

  // Elementos do DOM
  const favoritosContainer = document.getElementById("favoritos-container");
  const cartCountBadgeElement = document.getElementById("cart-count-badge-nav"); // ID do badge no menu

  let todosOsProdutosDoCardapio = []; // Armazena a lista completa de produtos
  let itemCountInCartLocal = 0; // Contador local simples para o badge do carrinho

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
          "Favoritos.js: Erro ao parsear 'usuario' do localStorage:",
          e
        );
        localStorage.removeItem("usuario"); // Limpa item inválido
      }
    }
    return null;
  }

  function updateCartBadgeDisplay() {
    // Tenta buscar a contagem de um script global se existir, senão usa a local
    if (typeof window.atualizarContadorCarrinhoGlobal === "function") {
      // Se você tiver uma função global em scripts.js que busca o total real do carrinho
      // window.atualizarContadorCarrinhoGlobal();
    } else if (cartCountBadgeElement) {
      // Fallback para contador local
      cartCountBadgeElement.textContent =
        itemCountInCartLocal > 0 ? itemCountInCartLocal : "0";
    }
  }
  // Tenta carregar contagem inicial (ex: se salva no localStorage de outras páginas ou API)
  // itemCountInCartLocal = parseInt(localStorage.getItem('appTotalItensCarrinho')) || 0;
  // updateCartBadgeDisplay();

  function formatarMoeda(valor) {
    const numero = parseFloat(valor);
    return isNaN(numero)
      ? "R$ --,--"
      : numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  // --- Lógica Principal ---

  /**
   * Carrega a lista completa de produtos do cardápio.
   * Essencial para obter preços e detalhes ao adicionar favoritos ao carrinho.
   */
  async function carregarProdutosDoCardapio() {
    // Evita recarregar se já tiver os dados
    if (todosOsProdutosDoCardapio.length > 0) {
      console.log(
        "Favoritos.js: Detalhes dos produtos do cardápio já carregados."
      );
      return Promise.resolve();
    }
    try {
      console.log(
        "Favoritos.js: Carregando detalhes de todos os produtos do cardápio..."
      );
      const response = await fetch(urlGetProdutosGeral);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro HTTP ${response.status} ao buscar lista geral de produtos: ${errorText}`
        );
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        todosOsProdutosDoCardapio = data;
        console.log(
          "Favoritos.js: Lista geral de produtos carregada:",
          todosOsProdutosDoCardapio.length,
          "itens."
        );
      } else {
        console.error(
          "Favoritos.js: API de produtos (geral) retornou formato inesperado:",
          data
        );
        todosOsProdutosDoCardapio = [];
      }
    } catch (error) {
      console.error(
        "Favoritos.js: Erro crítico ao carregar lista geral de produtos:",
        error
      );
      todosOsProdutosDoCardapio = []; // Garante que é um array
      alert(
        "Atenção: Não foi possível carregar todos os detalhes dos produtos. A funcionalidade 'Comprar Novamente' pode estar limitada."
      );
    }
  }

  /**
   * Cria o HTML para um card de item favorito.
   */
  function criarCardFavorito(favorito) {
    // A API de favoritos retorna 'imagem'. A API de produtos retorna 'caminho'.
    let imagemSrc = favorito.imagem || favorito.caminho; // Tenta ambos os campos
    if (
      imagemSrc &&
      typeof imagemSrc === "string" &&
      imagemSrc.trim() !== "" &&
      imagemSrc.toLowerCase() !== "undefined" &&
      imagemSrc.toLowerCase() !== "null"
    ) {
      imagemSrc = imagemSrc.startsWith("http")
        ? imagemSrc
        : imagemSrc.startsWith("/")
        ? imagemSrc
        : `/${imagemSrc}`;
    } else {
      imagemSrc = "/img/padrao.jpg"; // Imagem padrão
    }

    const card = document.createElement("div");
    card.classList.add("card", "mb-3", "item-favorito", "shadow-sm");
    card.dataset.idPizza = favorito.id_pizza; // ID do produto (usado para ações)
    card.dataset.nomePizza = favorito.nome_pizza;

    card.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-3 col-4 text-center">
          <img src="${imagemSrc}" class="img-fluid rounded-start p-2" alt="${
      favorito.nome_pizza || "Favorito"
    }" 
               style="max-height: 120px; max-width:120px; width:auto; height:auto; object-fit: contain;" 
               onerror="this.onerror=null;this.src='/img/padrao.jpg';">
        </div>
        <div class="col-md-7 col-5">
          <div class="card-body py-2 px-3">
            <h6 class="card-title mb-1"><b>${
              favorito.nome_pizza || "Nome Indisponível"
            }</b></h6>
            ${
              favorito.ingredientes
                ? `<p class="card-text small text-muted mb-1" style="font-size: 0.8rem;">${favorito.ingredientes}</p>`
                : ""
            }
            
          </div>
        </div>
        <div class="col-md-2 col-3 text-center d-flex flex-column justify-content-center align-items-center gap-2 p-2"> 
          <button class="btn btn-sm btn-primary btn-comprar-novamente w-100" title="Adicionar ao Carrinho">
            <i class="bi bi-cart-plus-fill"></i> <span class="d-none d-md-inline">Comprar</span> 
          </button>
          <button class="btn btn-sm btn-outline-danger btn-excluir-favorito w-100" title="Remover dos Favoritos">
            <i class="bi bi-trash-fill"></i> <span class="d-none d-md-inline">Remover</span>
          </button>
        </div>
      </div>
    `;
    return card;
  }

  /**
   * Carrega e renderiza os itens favoritos do usuário.
   */
  async function carregarErenderizarFavoritos() {
    const clienteId = getClienteId();
    if (!clienteId) {
      if (favoritosContainer)
        favoritosContainer.innerHTML =
          '<p class="text-center alert alert-warning">Você precisa estar logado para ver seus favoritos. <a href="login.html" class="alert-link">Faça login</a></p>';
      return;
    }

    if (!favoritosContainer) {
      console.error(
        "Favoritos.js: Container de favoritos ('favoritos-container') não encontrado no DOM."
      );
      return;
    }

    favoritosContainer.innerHTML =
      "<p class='text-center'>Carregando seus produtos favoritos...</p>";

    try {
      console.log(
        `Favoritos.js: Buscando favoritos para cliente_id: ${clienteId} em ${urlGetFavoritos}`
      );
      const response = await fetch(
        `${urlGetFavoritos}?cliente_id=${clienteId}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro HTTP ${response.status} ao buscar favoritos: ${errorText}`
        );
      }
      const favoritos = await response.json();
      console.log("Favoritos.js: Favoritos recebidos:", favoritos);

      favoritosContainer.innerHTML = "";

      if (!Array.isArray(favoritos) || favoritos.length === 0) {
        favoritosContainer.innerHTML = `<p class='text-center alert alert-info'>Você ainda não adicionou nenhum item aos seus favoritos.</p>`;
        return;
      }

      favoritos.forEach((favorito) => {
        if (
          typeof favorito.id_pizza === "undefined" ||
          favorito.id_pizza === null
        ) {
          console.warn(
            "Favoritos.js: Item favorito recebido sem id_pizza, pulando:",
            favorito
          );
          return;
        }
        const card = criarCardFavorito(favorito);
        favoritosContainer.appendChild(card);
      });

      adicionarListenersBotoesFavoritos();
    } catch (error) {
      console.error("Favoritos.js: Erro ao carregar favoritos:", error);
      favoritosContainer.innerHTML = `<p class='text-center text-danger'>Erro ao carregar os favoritos. ${error.message}</p>`;
    }
  }

  /**
   * Adiciona um item ao pedido/carrinho usando a API api_registrar_item_pedido.php.
   * @param {number} clienteId
   * @param {number} produtoId (ID do produto, na API de registro é 'produto_id')
   * @param {number} preco (preço unitário)
   * @param {string} tamanho (ex: "grande", "media", "pequena", "unidade")
   * @param {string} tipo (ex: "inteira", "meia")
   * @param {number} quantidade (default 1)
   */
  async function adicionarItemAoPedido(
    clienteId,
    produtoId,
    preco,
    tamanho,
    tipo,
    quantidade = 1
  ) {
    const payload = {
      cliente_id: clienteId,
      produto_id: parseInt(produtoId), // API de registro espera 'produto_id'
      preco: parseFloat(preco), // API de registro espera 'preco'
      tamanho_selecionado: tamanho, // API de registro espera 'tamanho_selecionado'
      tipo_tamanho: tipo, // API de registro espera 'tipo_tamanho'
      quantidade: parseInt(quantidade), // API de registro espera 'quantidade'
    };
    console.log(
      "Favoritos.js: Payload para adicionar ao pedido:",
      JSON.stringify(payload),
      "URL:",
      urlAdicionarItemAoPedido
    );

    try {
      const response = await fetch(urlAdicionarItemAoPedido, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let result;
      const responseText = await response.text();
      console.log(
        `Favoritos.js: Resposta bruta da API de adicionar item (Status ${response.status}):`,
        responseText
      );
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Favoritos.js: Falha ao parsear JSON (adicionarItem):",
          e,
          "Texto:",
          responseText
        );
        result = {
          success: false,
          message: `Resposta inesperada do servidor: ${responseText.substring(
            0,
            100
          )}`,
        };
      }

      if (response.ok && result.success) {
        alert("Produto adicionado ao carrinho com sucesso!");
        itemCountInCartLocal += parseInt(quantidade);
        updateCartBadgeDisplay();
        // localStorage.setItem('appTotalItensCarrinho', itemCountInCartLocal); // Opcional: persistir localmente
        return true;
      } else {
        alert(
          "Erro ao adicionar produto ao carrinho: " +
            (result.message || "Resposta inválida da API.")
        );
        return false;
      }
    } catch (error) {
      console.error(
        "Favoritos.js: Erro de comunicação ao adicionar ao carrinho:",
        error
      );
      alert("Erro de comunicação ao adicionar produto ao carrinho.");
      return false;
    }
  }

  /**
   * Lida com o clique no botão "Comprar Novamente" de um item favorito.
   */
  async function handleComprarNovamenteClick() {
    const card = this.closest(".item-favorito");
    const idPizzaOriginal = card.dataset.idPizza; // Vem da API de favoritos como id_pizza
    const nomePizzaOriginal = card.dataset.nomePizza;
    console.log(
      `Favoritos.js: 'Comprar Novamente' clicado para: ${nomePizzaOriginal} (ID Favorito: ${idPizzaOriginal})`
    );

    const clienteId = getClienteId();
    if (!clienteId) {
      alert("Você precisa estar logado para adicionar itens ao carrinho.");
      window.location.href = "login.html";
      return;
    }

    if (todosOsProdutosDoCardapio.length === 0) {
      alert(
        "Os detalhes dos produtos ainda não foram carregados. Por favor, aguarde ou recarregue a página."
      );
      await carregarProdutosDoCardapio(); // Tenta carregar se ainda não tiver
      if (todosOsProdutosDoCardapio.length === 0) return; // Aborta se falhar
    }

    // A API de favoritos retorna id_pizza. A API de produtos retorna produto_id.
    // Assumimos que id_pizza (do favorito) é o mesmo que produto_id (da lista geral de produtos).
    const produtoDetalhado = todosOsProdutosDoCardapio.find(
      (p) => String(p.produto_id) === String(idPizzaOriginal)
    );

    if (!produtoDetalhado) {
      alert(
        `Detalhes do produto "${nomePizzaOriginal}" não encontrados. Não é possível adicionar ao carrinho.`
      );
      console.warn(
        `Favoritos.js: Produto com ID ${idPizzaOriginal} não encontrado na lista 'todosOsProdutosDoCardapio'.`
      );
      return;
    }
    console.log(
      "Favoritos.js: Detalhes do produto do cardápio encontrados:",
      produtoDetalhado
    );

    // Lógica para escolher o preço/tamanho/tipo (SIMPLIFICADA - pega um padrão)
    // A API api_registrar_item_pedido.php espera 'tamanho_selecionado' e 'tipo_tamanho'
    let precoEscolhido, tamanhoEscolhidoApi, tipoEscolhidoApi;

    if (produtoDetalhado.categoria?.toLowerCase() === "pizza") {
      if (
        produtoDetalhado.grande_inteira &&
        parseFloat(produtoDetalhado.grande_inteira) > 0
      ) {
        precoEscolhido = produtoDetalhado.grande_inteira;
        tamanhoEscolhidoApi = "grande";
        tipoEscolhidoApi = "inteira";
      } else if (
        produtoDetalhado.media_inteira &&
        parseFloat(produtoDetalhado.media_inteira) > 0
      ) {
        precoEscolhido = produtoDetalhado.media_inteira;
        tamanhoEscolhidoApi = "media";
        tipoEscolhidoApi = "inteira";
      } else if (
        produtoDetalhado.pequena_inteira &&
        parseFloat(produtoDetalhado.pequena_inteira) > 0
      ) {
        precoEscolhido = produtoDetalhado.pequena_inteira;
        tamanhoEscolhidoApi = "pequena";
        tipoEscolhidoApi = "inteira";
      } else if (
        produtoDetalhado.grande &&
        parseFloat(produtoDetalhado.grande) > 0
      ) {
        precoEscolhido = produtoDetalhado.grande;
        tamanhoEscolhidoApi = "grande";
        tipoEscolhidoApi = "meia";
      } else if (
        produtoDetalhado.media &&
        parseFloat(produtoDetalhado.media) > 0
      ) {
        precoEscolhido = produtoDetalhado.media;
        tamanhoEscolhidoApi = "media";
        tipoEscolhidoApi = "meia";
      } else if (
        produtoDetalhado.pequena &&
        parseFloat(produtoDetalhado.pequena) > 0
      ) {
        precoEscolhido = produtoDetalhado.pequena;
        tamanhoEscolhidoApi = "pequena";
        tipoEscolhidoApi = "meia";
      }
    } else {
      // Para não-pizzas
      if (
        produtoDetalhado.pequena &&
        parseFloat(produtoDetalhado.pequena) > 0
      ) {
        precoEscolhido = produtoDetalhado.pequena;
        tamanhoEscolhidoApi = "pequena";
      } else if (
        produtoDetalhado.media &&
        parseFloat(produtoDetalhado.media) > 0
      ) {
        precoEscolhido = produtoDetalhado.media;
        tamanhoEscolhidoApi = "media";
      } else if (
        produtoDetalhado.grande &&
        parseFloat(produtoDetalhado.grande) > 0
      ) {
        precoEscolhido = produtoDetalhado.grande;
        tamanhoEscolhidoApi = "grande";
      } else if (
        produtoDetalhado.preco_unitario &&
        parseFloat(produtoDetalhado.preco_unitario) > 0
      ) {
        // Campo genérico
        precoEscolhido = produtoDetalhado.preco_unitario;
        tamanhoEscolhidoApi = "unidade";
      }
      tipoEscolhidoApi = "inteira"; // tipo_tamanho para não-pizzas
    }

    if (!precoEscolhido || parseFloat(precoEscolhido) <= 0) {
      alert(
        `Produto "${nomePizzaOriginal}" está sem preço definido ou indisponível. Não foi possível adicionar ao carrinho.`
      );
      console.error(
        `Favoritos.js: Preço não encontrado ou inválido para produto ID ${idPizzaOriginal}`,
        produtoDetalhado
      );
      return;
    }
    if (!tamanhoEscolhidoApi || !tipoEscolhidoApi) {
      alert(
        `Não foi possível determinar o tamanho/tipo para "${nomePizzaOriginal}". Não foi possível adicionar ao carrinho.`
      );
      console.error(
        `Favoritos.js: Tamanho/Tipo não determinado para produto ID ${idPizzaOriginal}`,
        produtoDetalhado
      );
      return;
    }

    // Adiciona 1 unidade do item favorito ao carrinho
    // O idPizzaOriginal (de favorito.id_pizza) é o produto_id para a API de adicionar item
    await adicionarItemAoPedido(
      clienteId,
      idPizzaOriginal,
      parseFloat(precoEscolhido),
      tamanhoEscolhidoApi,
      tipoEscolhidoApi,
      1
    );
  }

  /**
   * Exclui um item favorito via API.
   */
  async function excluirFavoritoAPI(idPizzaParaDeletar) {
    const clienteId = getClienteId();
    if (!clienteId || !idPizzaParaDeletar) {
      alert(
        "Não foi possível remover o favorito (dados do cliente ou do item ausentes)."
      );
      return false;
    }
    console.log(
      `Favoritos.js: Tentando excluir favorito: cliente_id=${clienteId}, pizza_id=${idPizzaParaDeletar} via ${urlDeleteFavorito}`
    );
    try {
      // A API de delete espera GET com parâmetros na URL
      const response = await fetch(
        `${urlDeleteFavorito}?cliente_id=${clienteId}&pizza_id=${idPizzaParaDeletar}`,
        {
          method: "GET", // Ou DELETE, dependendo da sua API. Você mencionou GET.
        }
      );
      let data;
      const responseText = await response.text();
      console.log(
        `Favoritos.js: Resposta bruta da API de Delete Favorito (Status ${response.status}):`,
        responseText
      );
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Favoritos.js: Falha ao parsear JSON (Delete Favorito):",
          e,
          responseText
        );
        data = {
          success: false,
          message: `Resposta inesperada do servidor: ${responseText.substring(
            0,
            100
          )}`,
        };
      }

      if (response.ok && data.success) {
        alert("Favorito removido com sucesso!");
        return true;
      } else {
        alert(
          "Erro ao remover favorito: " + (data.message || "Tente novamente.")
        );
        return false;
      }
    } catch (error) {
      console.error(
        "Favoritos.js: Erro de comunicação ao excluir favorito:",
        error
      );
      alert("Erro de comunicação ao excluir favorito.");
      return false;
    }
  }

  /**
   * Adiciona listeners aos botões "Comprar Novamente" e "Excluir" dos cards de favoritos.
   * Usa a técnica de clonar e substituir para evitar múltiplos listeners.
   */
  function adicionarListenersBotoesFavoritos() {
    document
      .querySelectorAll(".item-favorito .btn-comprar-novamente")
      .forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", handleComprarNovamenteClick);
      });

    document
      .querySelectorAll(".item-favorito .btn-excluir-favorito")
      .forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", async function () {
          // Adicionado async para await
          const card = this.closest(".item-favorito");
          const idPizza = card.dataset.idPizza;
          if (
            confirm("Tem certeza que deseja remover este item dos favoritos?")
          ) {
            if (await excluirFavoritoAPI(idPizza)) {
              // Recarrega a lista para refletir a remoção
              // Idealmente, apenas removeria o card do DOM, mas recarregar é mais simples
              // card.remove(); // Se quiser remover só do DOM sem recarregar tudo
              await carregarErenderizarFavoritos(); // Recarrega após exclusão
            }
          }
        });
      });
  }

  // --- Inicialização ---
  console.log("Favoritos.js: Iniciando carregamento...");
  // 1. Carrega a lista completa de produtos do cardápio (para ter os preços e detalhes)
  // 2. Depois, carrega e renderiza os favoritos do usuário.
  await carregarProdutosDoCardapio(); // Espera carregar os produtos antes de carregar favoritos
  await carregarErenderizarFavoritos();
  updateCartBadgeDisplay(); // Atualiza o badge no final
}); // Fim do DOMContentLoaded
