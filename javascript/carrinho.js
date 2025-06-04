// carrinho.js
document.addEventListener("DOMContentLoaded", async () => {
  // --- URLs ---
  // VERIFIQUE TODOS ESSES CAMINHOS COM ATENÇÃO!
  const urlGetCarrinho =
    "https://devweb3.ok.etc.br/api_mobile/api_get_carrinho.php";
  const urlRemoverInstanciaUnica =
    "https://devweb3.ok.etc.br/api/api_delete_carrinho_item.php"; // Ex: '/api/' ou '/api_mobile/'?
  const urlRemoverTodasInstancias =
    "https://devweb3.ok.etc.br/api/api_delete_carrinho_web.php";
  const urlRegistrarItem =
    "https://devweb3.ok.etc.br/api_mobile/api_registrar_item_pedido.php"; // API para adicionar item
  const urlFavoritar = "https://devweb3.ok.etc.br/api/api_pedido_favorito.php";
  const urlFinalizarPedido =
    "https://devweb3.ok.etc.br/api/api_registrar_pedido.php"; // API para finalizar o pedido

  // --- Elementos do DOM ---
  const carrinhoContainer = document.getElementById("carrinho-items");
  const totalPedidoElement = document.getElementById("total-pedido");
  const cartCountBadge =
    document.getElementById("cart-count-badge-nav") || // Tenta ID primeiro
    document.querySelector('a[href="carrinho.php"] span.badge'); // Fallback
  const btnConfirmarPedido =
    document.getElementById("btn-confirmar-pedido-link") || // Tenta ID primeiro
    document.querySelector('a[href="historico_pedidos.php"]'); // Fallback

  // Variável para manter o estado dos itens agrupados visualmente no carrinho
  let itensAgrupadosNoCarrinho = {};

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
        console.error("Erro ao parsear 'usuario' do localStorage:", e);
        localStorage.removeItem("usuario");
      }
    }
    return null;
  }

  function formatarMoeda(valor) {
    const numero = parseFloat(valor);
    return isNaN(numero)
      ? "R$ --,--"
      : numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function atualizarContadorBadge() {
    if (cartCountBadge) {
      let totalUnidadesNoCarrinho = 0;
      Object.values(itensAgrupadosNoCarrinho).forEach((grupo) => {
        totalUnidadesNoCarrinho += grupo.quantidade; // Soma as quantidades de cada grupo visual
      });
      cartCountBadge.textContent = totalUnidadesNoCarrinho || "0";
    }
  }

  // --- Lógica Principal do Carrinho ---
  async function carregarCarrinho() {
    console.log("carregarCarrinho chamado");
    const clienteId = getClienteId();
    if (!clienteId) {
      console.log("Cliente não logado, exibindo mensagem de login.");
      if (carrinhoContainer)
        carrinhoContainer.innerHTML =
          '<p class="text-center">Você precisa estar logado para ver seu carrinho. <a href="login.html">Faça login</a></p>';
      if (totalPedidoElement) totalPedidoElement.textContent = formatarMoeda(0);
      itensAgrupadosNoCarrinho = {}; // Limpa
      atualizarContadorBadge();
      if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
      return;
    }

    if (!carrinhoContainer || !totalPedidoElement) {
      console.error("Elementos do DOM para o carrinho não encontrados.");
      return;
    }

    carrinhoContainer.innerHTML =
      '<p class="text-center">Carregando itens do carrinho...</p>';
    totalPedidoElement.textContent = formatarMoeda(0);

    try {
      console.log(
        `Buscando carrinho para cliente_id: ${clienteId} em ${urlGetCarrinho}`
      );
      const response = await fetch(`${urlGetCarrinho}?cliente_id=${clienteId}`);
      console.log("Resposta de getCarrinho - Status:", response.status);

      if (!response.ok) {
        let errorMsg = `Erro HTTP ${response.status} ao buscar carrinho.`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || `Erro: ${response.statusText}`;
          console.error("Erro JSON de getCarrinho:", errorData);
        } catch (e) {
          const textError = await response.text();
          errorMsg = textError || errorMsg;
          console.error("Erro TEXTO de getCarrinho:", textError);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log("Dados recebidos de getCarrinho:", data);

      if (
        data.success === false ||
        (data.message && !data.itens && !Array.isArray(data)) ||
        (Array.isArray(data) && data.length === 0)
      ) {
        carrinhoContainer.innerHTML = `<p class="text-center">${
          data.message || "Seu carrinho está vazio."
        }</p>`;
        itensAgrupadosNoCarrinho = {};
        atualizarTotal();
        atualizarContadorBadge();
        if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
        return;
      }

      const itensDoPedidoDaAPI = Array.isArray(data) ? data : data.itens || [];

      if (itensDoPedidoDaAPI.length === 0) {
        carrinhoContainer.innerHTML = `<p class="text-center">${
          data.message || "Seu carrinho está vazio."
        }</p>`;
        itensAgrupadosNoCarrinho = {};
        atualizarTotal();
        atualizarContadorBadge();
        if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
        return;
      }

      renderizarItensCarrinho(itensDoPedidoDaAPI);

      if (btnConfirmarPedido) {
        Object.keys(itensAgrupadosNoCarrinho).length > 0
          ? btnConfirmarPedido.classList.remove("disabled")
          : btnConfirmarPedido.classList.add("disabled");
      }
    } catch (error) {
      console.error("Erro ao carregar o carrinho:", error.message);
      carrinhoContainer.innerHTML = `<p class="text-center text-danger">Erro ao carregar os dados do carrinho. ${error.message}</p>`;
      itensAgrupadosNoCarrinho = {};
      atualizarTotal();
      atualizarContadorBadge();
      if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
    }
  }

  function renderizarItensCarrinho(itensDaAPI) {
    console.log("renderizarItensCarrinho chamado com:", itensDaAPI);
    itensAgrupadosNoCarrinho = {};

    itensDaAPI.forEach((itemAPI) => {
      // Chave de agrupamento visual: produto, tamanho e tipo_tamanho
      // Normaliza para evitar problemas com variação de caixa (ex: 'Inteira' vs 'inteira')
      const tamanhoNormalizado = itemAPI.tamanho_pedido
        ? itemAPI.tamanho_pedido.toLowerCase()
        : "sem_tamanho";
      const tipoTamanhoNormalizado = itemAPI.tipo_tamanho_pedido
        ? itemAPI.tipo_tamanho_pedido.toLowerCase()
        : "sem_tipo";
      const chaveGrupo = `${itemAPI.produto_id}-${tamanhoNormalizado}-${tipoTamanhoNormalizado}`;

      // IMPORTANTE: A quantidade do item da API (itemAPI.quantidade) deve ser a quantidade REAL daquela linha.
      // Se a API sempre retorna 0, a lógica de agrupamento de quantidade será afetada.
      // A API `api_get_historico_pedidos` que fizemos antes retorna `ped.quantidade`.
      // Se esta API `api_get_carrinho` também retorna a quantidade correta por linha, use-a.
      // Se cada linha da API representa UMA unidade, então itemAPI.quantidade seria 1 (ou não existiria).
      const quantidadeEsteItemAPI = parseInt(itemAPI.quantidade) || 1; // Assume 1 se quantidade não vier ou for 0/inválida

      if (itensAgrupadosNoCarrinho[chaveGrupo]) {
        itensAgrupadosNoCarrinho[chaveGrupo].quantidade +=
          quantidadeEsteItemAPI;
        itensAgrupadosNoCarrinho[chaveGrupo].ids_item_pedido.push(
          itemAPI.id_item_pedido
        );
      } else {
        itensAgrupadosNoCarrinho[chaveGrupo] = {
          ...itemAPI,
          quantidade: quantidadeEsteItemAPI,
          ids_item_pedido: [itemAPI.id_item_pedido],
          // 'total_item_pedido' da API deve ser o PREÇO UNITÁRIO.
          preco_unitario_do_grupo: parseFloat(itemAPI.total_item_pedido) || 0,
        };
      }
    });
    console.log("Itens agrupados no carrinho:", itensAgrupadosNoCarrinho);

    carrinhoContainer.innerHTML = "";
    if (Object.keys(itensAgrupadosNoCarrinho).length === 0) {
      carrinhoContainer.innerHTML = `<p class="text-center">Seu carrinho está vazio.</p>`;
      // Não precisa chamar atualizarTotal e atualizarContadorBadge aqui, eles são chamados depois
    } else {
      Object.values(itensAgrupadosNoCarrinho).forEach((itemAgrupado) => {
        const precoUnitario = itemAgrupado.preco_unitario_do_grupo;

        let imagemProduto = "/img/padrao.jpg";
        if (
          itemAgrupado.caminho_imagem_produto &&
          typeof itemAgrupado.caminho_imagem_produto === "string"
        ) {
          const caminhoLimpo = itemAgrupado.caminho_imagem_produto.trim();
          if (
            caminhoLimpo &&
            caminhoLimpo.toLowerCase() !== "undefined" &&
            caminhoLimpo.toLowerCase() !== "null"
          ) {
            if (
              caminhoLimpo.startsWith("http://") ||
              caminhoLimpo.startsWith("https://")
            ) {
              imagemProduto = caminhoLimpo;
            } else if (caminhoLimpo.includes("/")) {
              imagemProduto = caminhoLimpo.startsWith("/")
                ? caminhoLimpo
                : `/${caminhoLimpo}`;
            } else {
              imagemProduto = `/img/produtos/${caminhoLimpo}`;
            }
          }
        }

        const cardItem = document.createElement("div");
        cardItem.className = "card mb-3 item-carrinho-agrupado";
        cardItem.dataset.chaveGrupo = `${
          itemAgrupado.produto_id
        }-${itemAgrupado.tamanho_pedido.toLowerCase()}-${itemAgrupado.tipo_tamanho_pedido.toLowerCase()}`;
        cardItem.dataset.produtoId = itemAgrupado.produto_id;
        cardItem.dataset.precoUnitario = precoUnitario;
        cardItem.dataset.idsItemPedido = JSON.stringify(
          itemAgrupado.ids_item_pedido
        );
        cardItem.dataset.tamanhoApi = itemAgrupado.tamanho_pedido;
        cardItem.dataset.tipoApi = itemAgrupado.tipo_tamanho_pedido;
        cardItem.dataset.nomeProduto = itemAgrupado.nome_produto;

        cardItem.innerHTML = `
                <div class="row g-0 align-items-center">
                <div class="col-md-3 col-4">
                    <img src="${imagemProduto}" class="img-fluid rounded-start" alt="${
          itemAgrupado.nome_produto || "Produto"
        }" 
                        style="max-height: 100px; width: 100%; object-fit: cover;" 
                        onerror="this.onerror=null; this.src='/img/padrao.jpg';">
                </div>
                <div class="col-md-6 col-5">
                    <div class="card-body py-2 px-3">
                    <h6 class="card-title mb-1"><b>${
                      itemAgrupado.nome_produto || "Produto Indisponível"
                    }</b></h6>
                    <p class="card-text small text-muted mb-1">
                        ${itemAgrupado.tamanho_pedido || ""} 
                        ${
                          itemAgrupado.tipo_tamanho_pedido &&
                          itemAgrupado.tipo_tamanho_pedido.toLowerCase() !==
                            "unidade"
                            ? itemAgrupado.tipo_tamanho_pedido
                            : ""
                        }
                    </p>
                    <p class="card-text fw-bold text-danger mb-2">${formatarMoeda(
                      precoUnitario
                    )} (unid.)</p>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-outline-secondary btn-sm btn-diminuir" title="Diminuir quantidade">-</button>
                        <span class="quantity mx-2">${
                          itemAgrupado.quantidade
                        }</span>
                        <button class="btn btn-outline-secondary btn-sm btn-aumentar" title="Aumentar quantidade">+</button>
                    </div>
                    </div>
                </div>
                <div class="col-md-3 col-3 text-center d-flex flex-column justify-content-center align-items-center">
                    <button class="btn btn-sm btn-outline-danger mb-2 btn-remover-grupo" title="Remover todos deste item">
                    <img src="/img/lixeira.png" alt="Excluir" style="width: 18px;">
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-favoritar" title="Favoritar">
                    <img src="/img/heart.png" alt="Favoritar" style="width: 18px;">
                    </button>
                </div>
                </div>`;
        carrinhoContainer.appendChild(cardItem);
      });
    }

    adicionarListenersAcoesCarrinho();
    atualizarTotal();
    atualizarContadorBadge();
  }

  function atualizarTotal() {
    let totalCalculado = 0;
    Object.values(itensAgrupadosNoCarrinho).forEach(function (grupo) {
      const preco = parseFloat(grupo.preco_unitario_do_grupo);
      const quantidade = parseInt(grupo.quantidade);
      if (!isNaN(preco) && !isNaN(quantidade) && quantidade > 0) {
        // Considera apenas se quantidade > 0
        totalCalculado += preco * quantidade;
      }
    });
    if (totalPedidoElement)
      totalPedidoElement.textContent = formatarMoeda(totalCalculado);
  }

  // --- Funções de Ação do Carrinho ---
  async function adicionarMaisUmItemAPI(
    produtoId,
    precoUnitario,
    tamanho,
    tipo
  ) {
    const clienteId = getClienteId();
    if (!clienteId) {
      alert("Erro: ID do cliente não encontrado. Faça login novamente.");
      return { success: false, message: "ID do cliente não encontrado." };
    }
    if (
      produtoId === undefined ||
      precoUnitario === undefined ||
      tamanho === undefined ||
      tipo === undefined
    ) {
      console.error("Dados incompletos para adicionarMaisUmItemAPI:", {
        produtoId,
        precoUnitario,
        tamanho,
        tipo,
      });
      alert("Erro interno: Dados incompletos para adicionar item.");
      return {
        success: false,
        message: "Dados incompletos para adicionar item.",
      };
    }

    const payload = {
      cliente_id: clienteId,
      produto_id: parseInt(produtoId),
      preco: parseFloat(precoUnitario),
      tamanho_selecionado: tamanho,
      tipo_tamanho: tipo,
      quantidade: 1, // A API api_registrar_item_pedido.php espera a quantidade a ser adicionada
    };

    console.log(
      "Payload para urlRegistrarItem (" + urlRegistrarItem + "):",
      JSON.stringify(payload)
    );

    try {
      const response = await fetch(urlRegistrarItem, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let result;
      const responseText = await response.text(); // Lê a resposta como texto primeiro
      console.log(
        "Resposta bruta de urlRegistrarItem (" + response.status + "):",
        responseText
      );
      try {
        result = JSON.parse(responseText); // Tenta parsear como JSON
      } catch (e) {
        console.error(
          "Falha ao parsear resposta JSON de urlRegistrarItem:",
          e,
          "Resposta Texto:",
          responseText
        );
        return {
          success: false,
          message: `Erro no servidor (${
            response.status
          }). Resposta não JSON: ${responseText.substring(0, 150)}`,
        };
      }

      console.log("Resposta JSON parseada de urlRegistrarItem:", result);

      if (!response.ok) {
        alert(
          "Erro ao adicionar item: " +
            (result.message || `Status ${response.status}`)
        );
        return {
          success: false,
          message: result.message || `Erro HTTP ${response.status}`,
          data: result,
        };
      }
      return result;
    } catch (error) {
      console.error("Erro de comunicação em adicionarMaisUmItemAPI:", error);
      alert(
        "Erro de comunicação ao tentar adicionar o item. Verifique sua conexão."
      );
      return {
        success: false,
        message: "Erro de comunicação: " + error.message,
      };
    }
  }

  async function removerInstanciaItemDoPedidoAPI(idItemPedidoARemover) {
    const clienteId = getClienteId();
    if (!clienteId || !idItemPedidoARemover) {
      alert("Erro: ID do cliente ou do item não encontrado para remoção.");
      return {
        success: false,
        message: "ID do cliente ou do item não encontrado.",
      };
    }
    console.log(
      `Tentando remover item_pedido_id: ${idItemPedidoARemover} para cliente_id: ${clienteId}`
    );
    try {
      const response = await fetch(
        `${urlRemoverInstanciaUnica}?pedido_id=${idItemPedidoARemover}&cliente_id=${clienteId}`,
        { method: "DELETE" }
      );
      let result;
      const responseText = await response.text();
      console.log(
        "Resposta bruta de urlRemoverInstanciaUnica (" + response.status + "):",
        responseText
      );
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Falha ao parsear resposta JSON de urlRemoverInstanciaUnica:",
          e,
          "Resposta Texto:",
          responseText
        );
        return {
          success: false,
          message: `Erro no servidor (${
            response.status
          }). Resposta: ${responseText.substring(0, 100)}`,
        };
      }
      console.log(
        "Resposta JSON parseada de urlRemoverInstanciaUnica:",
        result
      );

      if (!response.ok) {
        alert(
          "Erro ao diminuir quantidade: " +
            (result.message || `Status ${response.status}`)
        );
        return {
          success: false,
          message: result.message || `Erro HTTP ${response.status}`,
          data: result,
        };
      }
      return result;
    } catch (error) {
      console.error("Erro de comunicação ao remover instância de item:", error);
      alert("Erro de comunicação ao diminuir a quantidade.");
      return {
        success: false,
        message: "Erro de comunicação: " + error.message,
      };
    }
  }

  async function removerTodasInstanciasProdutoAPI(chaveGrupoParaRemover) {
    const clienteId = getClienteId();
    const produtoId = chaveGrupoParaRemover.split("-")[0]; // Extrai produto_id da chave

    if (!clienteId || !produtoId) {
      alert(
        "Erro: ID do cliente ou do produto não encontrado para remoção total."
      );
      return {
        success: false,
        message: "ID do cliente ou do produto não encontrado.",
      };
    }
    console.log(
      `Tentando remover TODAS instâncias do produto_id: ${produtoId} para cliente_id: ${clienteId}`
    );
    try {
      const response = await fetch(
        `${urlRemoverTodasInstancias}?produto_id=${produtoId}&cliente_id=${clienteId}`,
        { method: "DELETE" }
      );
      const result = await response.json(); // Assumindo que esta API sempre retorna JSON
      console.log("Resposta de urlRemoverTodasInstancias:", result);
      if (!response.ok) {
        alert(
          "Erro ao remover itens: " +
            (result.message || `Status ${response.status}`)
        );
        return {
          success: false,
          message: result.message || `Erro HTTP ${response.status}`,
        };
      }
      return result;
    } catch (error) {
      console.error(
        "Erro de comunicação ao remover todas as instâncias do produto:",
        error
      );
      alert("Erro de comunicação ao remover os itens.");
      return {
        success: false,
        message: "Erro de comunicação: " + error.message,
      };
    }
  }

  // --- Gerenciamento de Event Listeners ---
  function adicionarListenersAcoesCarrinho() {
    const actions = [
      {
        selector: ".btn-diminuir",
        handler: handleDiminuirClick,
        event: "click",
      },
      {
        selector: ".btn-aumentar",
        handler: handleAumentarClick,
        event: "click",
      },
      {
        selector: ".btn-remover-grupo",
        handler: handleRemoverGrupoClick,
        event: "click",
      },
      {
        selector: ".btn-favoritar",
        handler: handleFavoritarClick,
        event: "click",
      },
    ];

    actions.forEach((action) => {
      // Remove listener antigo se existir e estiver marcado
      document
        .querySelectorAll(`${action.selector}.active-listener`)
        .forEach((btn) => {
          const oldHandler = btn[`__${action.event}Handler`];
          if (oldHandler) {
            btn.removeEventListener(action.event, oldHandler);
          }
          btn.classList.remove("active-listener");
          delete btn[`__${action.event}Handler`];
        });
      // Adiciona novo listener
      document.querySelectorAll(action.selector).forEach((btn) => {
        btn.addEventListener(action.event, action.handler);
        btn.classList.add("active-listener");
        btn[`__${action.event}Handler`] = action.handler; // Guarda referência para remoção
      });
    });
  }

  // Funções de Handler separadas
  async function handleDiminuirClick() {
    console.log("Diminuir clicado");
    const cardElement = this.closest(".item-carrinho-agrupado");
    const chaveGrupo = cardElement.dataset.chaveGrupo;
    const grupo = itensAgrupadosNoCarrinho[chaveGrupo];

    if (grupo && grupo.ids_item_pedido && grupo.ids_item_pedido.length > 0) {
      const idParaRemover = grupo.ids_item_pedido.pop(); // Pega e remove o último ID da lista
      console.log("ID para remover:", idParaRemover);

      const apiResponse = await removerInstanciaItemDoPedidoAPI(idParaRemover);

      if (apiResponse && apiResponse.success) {
        console.log("Item removido da API com sucesso");
        grupo.quantidade--;
        if (grupo.quantidade <= 0) {
          delete itensAgrupadosNoCarrinho[chaveGrupo];
          cardElement.remove();
          console.log("Grupo removido do carrinho visual.");
        } else {
          cardElement.querySelector(".quantity").textContent = grupo.quantidade;
          console.log("Quantidade do grupo atualizada para:", grupo.quantidade);
        }
        atualizarTotal();
        atualizarContadorBadge();
        if (btnConfirmarPedido) {
          btnConfirmarPedido.disabled =
            Object.keys(itensAgrupadosNoCarrinho).length === 0;
        }
      } else {
        grupo.ids_item_pedido.push(idParaRemover); // Reverte se a API falhar
        console.warn(
          "Falha ao remover item da API, revertendo ids_item_pedido.",
          apiResponse
        );
      }
    } else {
      console.warn(
        "Não há IDs para remover ou grupo não encontrado para diminuir.",
        grupo
      );
      // Pode ser que o grupo já foi removido ou está em estado inconsistente, recarregar pode ajudar
      if (!grupo && Object.keys(itensAgrupadosNoCarrinho).length > 0) {
        // Se grupo não existe mas há outros
        // Isso não deveria acontecer se a interface está sincronizada.
        // Forçar recarga para evitar estado inconsistente
        // carregarCarrinho();
      }
    }
  }

  async function handleAumentarClick() {
    console.log("Aumentar clicado");
    const cardElement = this.closest(".item-carrinho-agrupado");
    const chaveGrupo = cardElement.dataset.chaveGrupo;
    const grupo = itensAgrupadosNoCarrinho[chaveGrupo];

    const produtoId = cardElement.dataset.produtoId;
    const preco = cardElement.dataset.precoUnitario;
    const tamanho = cardElement.dataset.tamanhoApi;
    const tipo = cardElement.dataset.tipoApi;

    const apiResponse = await adicionarMaisUmItemAPI(
      produtoId,
      preco,
      tamanho,
      tipo
    );

    if (apiResponse && apiResponse.success && apiResponse.item_pedido_id) {
      console.log(
        "Item adicionado via API com sucesso, id:",
        apiResponse.item_pedido_id
      );
      if (grupo) {
        // Se o grupo já existe
        grupo.ids_item_pedido.push(apiResponse.item_pedido_id);
        grupo.quantidade++;
        cardElement.querySelector(".quantity").textContent = grupo.quantidade;
      } else {
        // Se o grupo não existia (ex: último item foi removido e adicionado de novo)
        // Precisamos recarregar o carrinho para criar o novo grupo visualmente
        // ou adicionar a lógica para criar um novo card de grupo aqui.
        // Por simplicidade, recarregar é mais seguro para garantir consistência.
        console.log(
          "Grupo não encontrado após adicionar item, recarregando carrinho."
        );
        await carregarCarrinho(); // `await` para garantir que o carregamento complete
        return; // Sai da função para evitar mais processamento sobre estado antigo
      }

      atualizarTotal();
      atualizarContadorBadge();
    } else {
      console.warn("Falha ao adicionar mais um item ao grupo:", apiResponse);
      // O alerta de erro já foi dado pela API ou pela função adicionarMaisUmItemAPI
    }
  }

  async function handleRemoverGrupoClick() {
    console.log("Remover Grupo clicado");
    const cardElement = this.closest(".item-carrinho-agrupado");
    const chaveGrupo = cardElement.dataset.chaveGrupo;
    const grupo = itensAgrupadosNoCarrinho[chaveGrupo];
    const nomeProduto = cardElement.dataset.nomeProduto;

    if (!grupo) {
      console.warn("Tentativa de remover grupo que não existe:", chaveGrupo);
      cardElement.remove(); // Remove o card se o grupo não existe mais no estado
      atualizarTotal();
      atualizarContadorBadge();
      return;
    }

    if (
      confirm(
        `Tem certeza que deseja remover todos os "${nomeProduto}" (${grupo.tamanho_pedido}) do carrinho?`
      )
    ) {
      let todasRemovidasComSucesso = true;
      // Itera sobre uma cópia do array de IDs, pois vamos modificar o original (grupo.ids_item_pedido)
      const idsParaRemover = [...grupo.ids_item_pedido];
      console.log(
        `Removendo grupo. IDs a serem processados: ${idsParaRemover.join(", ")}`
      );

      for (const idItem of idsParaRemover) {
        const apiResponse = await removerInstanciaItemDoPedidoAPI(idItem);
        if (!apiResponse || !apiResponse.success) {
          todasRemovidasComSucesso = false;
          console.error(`Falha ao remover item_pedido_id ${idItem} do grupo.`);
          // Decide se quer parar ou continuar tentando remover os outros
          // break; // Para na primeira falha
        } else {
          console.log(`Item_pedido_id ${idItem} removido com sucesso da API.`);
          // Remove o ID da lista original do grupo, mesmo que a API tenha sucesso,
          // para que a interface seja atualizada corretamente.
          const index = grupo.ids_item_pedido.indexOf(idItem);
          if (index > -1) {
            grupo.ids_item_pedido.splice(index, 1);
          }
        }
      }

      if (todasRemovidasComSucesso) {
        console.log(
          "Todas as instâncias do grupo removidas com sucesso da API."
        );
        delete itensAgrupadosNoCarrinho[chaveGrupo];
        cardElement.remove();
        alert(
          `Todas as unidades de "${nomeProduto}" (${
            grupo.tamanho_pedido || ""
          }) foram removidas.`
        );
      } else {
        // Se nem todas foram removidas, o estado pode estar inconsistente.
        // Melhor recarregar o carrinho para obter o estado real do servidor.
        alert(
          "Ocorreu um erro ao tentar remover todos os itens do grupo. Alguns itens podem não ter sido removidos. Recarregando o carrinho."
        );
        console.warn(
          "Nem todas as instâncias do grupo foram removidas da API. Recarregando carrinho."
        );
      }
      // Sempre atualiza a interface, mesmo que haja falhas parciais, para refletir o que pôde ser feito
      // ou para forçar a recarga se o estado ficar muito inconsistente.
      // Se você optar por `carregarCarrinho()` em caso de falha parcial, as linhas abaixo são redundantes.
      atualizarTotal();
      atualizarContadorBadge();
      if (Object.keys(itensAgrupadosNoCarrinho).length === 0) {
        carrinhoContainer.innerHTML = `<p class="text-center">Seu carrinho está vazio.</p>`;
        if (btnConfirmarPedido) btnConfirmarPedido.disabled = true;
      } else {
        if (btnConfirmarPedido) btnConfirmarPedido.disabled = false;
      }
      if (!todasRemovidasComSucesso) {
        // Força recarga se houve falha
        await carregarCarrinho();
      }
    }
  }

  async function handleFavoritarClick() {
    console.log("Favoritar clicado");
    const cardElement = this.closest(".item-carrinho-agrupado");
    const produtoId = cardElement.dataset.produtoId;
    const nomeProduto = cardElement.dataset.nomeProduto;
    const preco = cardElement.dataset.precoUnitario;
    // A API de favoritar pode precisar de mais dados do item, como tamanho, etc.
    // ou apenas o ID do produto. Ajuste `favoritarItemAPI` se necessário.
    await favoritarItemAPI(produtoId, nomeProduto, preco); // Adicionado await se favoritarItemAPI for async
  }

  async function favoritarItemAPI(produtoId, nomeProduto, precoUnitario) {
    // Tornada async
    const cliente_id = getClienteId();
    if (!cliente_id) {
      alert("Você precisa estar logado para favoritar itens.");
      return; // Não retorna nada específico, mas poderia retornar {success: false}
    }
    const itemPayload = {
      cliente_id: cliente_id,
      pizza_id: parseInt(produtoId), // API de favoritos espera pizza_id
      nome_pizza: nomeProduto,
      preco: parseFloat(precoUnitario),
      // Adicionar tamanho e tipo se a API de favoritos precisar
      // tamanho: ...,
      // tipo_tamanho: ...,
    };
    const finalPayload = { pizzas: [itemPayload] }; // API espera um array de pizzas
    console.log("Payload para urlFavoritar:", JSON.stringify(finalPayload));
    try {
      const response = await fetch(urlFavoritar, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });
      const data = await response.json();
      console.log("Resposta de urlFavoritar:", data);
      if (response.ok && data.success) {
        alert("Produto adicionado aos favoritos!");
      } else {
        alert("Erro ao favoritar: " + (data.message || "Tente novamente."));
      }
    } catch (error) {
      console.error("Erro de comunicação na API de favoritos:", error);
      alert("Erro de comunicação ao favoritar o produto.");
    }
  }

  // --- Lógica de Finalização do Pedido ---
  if (btnConfirmarPedido) {
    btnConfirmarPedido.addEventListener("click", async function (event) {
      event.preventDefault();
      console.log("Confirmar Pedido clicado");
      const cliente_id = getClienteId();
      if (!cliente_id) {
        alert("Por favor, faça login para confirmar o pedido.");
        window.location.href = "login.html";
        return;
      }
      if (Object.keys(itensAgrupadosNoCarrinho).length === 0) {
        alert("Seu carrinho está vazio. Adicione itens antes de confirmar.");
        return;
      }
      const metodoPagamentoSelecionado = document.querySelector(
        'input[name="pagamento"]:checked'
      );
      if (!metodoPagamentoSelecionado) {
        alert("Por favor, selecione um método de pagamento.");
        return;
      }
      const valorMetodoPagamento = metodoPagamentoSelecionado.value;
      let forma_pagamento_api = "";
      if (valorMetodoPagamento.toLowerCase() === "dinheiro")
        forma_pagamento_api = "Dinheiro";
      else if (valorMetodoPagamento.toLowerCase() === "cartao")
        forma_pagamento_api = "Cartão";
      else if (valorMetodoPagamento.toLowerCase() === "pix")
        forma_pagamento_api = "PIX";
      else {
        alert("Método de pagamento inválido selecionado.");
        return;
      }
      const valorTrocoInput = document.getElementById("troco");
      let troco_para_api = null;
      const totalAtualTexto = totalPedidoElement.textContent
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".");
      const totalAtual = parseFloat(totalAtualTexto);

      if (forma_pagamento_api === "Dinheiro") {
        if (!valorTrocoInput || valorTrocoInput.value.trim() === "") {
          alert("Se o pagamento for em dinheiro, informe o valor para troco.");
          valorTrocoInput.focus();
          return;
        }
        troco_para_api = parseFloat(valorTrocoInput.value.replace(",", "."));
        if (isNaN(troco_para_api) || troco_para_api < totalAtual) {
          alert(
            "O valor para troco deve ser numérico e maior ou igual ao total do pedido."
          );
          valorTrocoInput.focus();
          return;
        }
      }
      const payloadFinalizar = {
        cliente_id: cliente_id,
        forma_pagamento: forma_pagamento_api,
        troco_para: troco_para_api,
      };
      console.log(
        "Finalizando pedido com payload:",
        payloadFinalizar,
        "URL:",
        urlFinalizarPedido
      );
      btnConfirmarPedido.disabled = true; // Desabilitar o botão
      btnConfirmarPedido.innerHTML =
        '<b>Processando...</b> <span class="spinner-border spinner-border-sm"></span>';
      try {
        const response = await fetch(urlFinalizarPedido, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadFinalizar),
        });
        const result = await response.json(); // Assumindo que a API sempre retorna JSON
        console.log("Resposta da API de finalizar pedido:", result);
        if (response.ok && result.success) {
          alert(
            `Pedido confirmado com sucesso! Nº ${result.n_pedido || ""}\n${
              result.message || ""
            }`
          );
          if (result.n_pedido)
            localStorage.setItem("ultimo_pedido_confirmado", result.n_pedido);
          itensAgrupadosNoCarrinho = {}; // Limpa o carrinho visual
          localStorage.removeItem("carrinho"); // Se você guarda o carrinho no localStorage também
          window.location.href = "pedidoconfirmado.php";
        } else {
          alert(
            `Erro ao confirmar o pedido: ${
              result.message || "Tente novamente."
            }`
          );
        }
      } catch (error) {
        console.error("Erro de comunicação ao finalizar pedido:", error);
        alert("Erro de comunicação ao finalizar o pedido.");
      } finally {
        btnConfirmarPedido.disabled = false; // Reabilitar o botão
        btnConfirmarPedido.innerHTML = "<b>Confirmar meu pedido</b>";
      }
    });
  }

  // --- Inicialização ---
  carregarCarrinho();
});
