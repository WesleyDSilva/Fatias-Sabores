document.addEventListener("DOMContentLoaded", async () => {
  const historicoContainer = document.getElementById(
    "historico-pedidos-container"
  );
  const urlApiHistorico = "api/api_get_historico_pedidos.php"; // AJUSTE O CAMINHO SE NECESSÁRIO

  function getClienteIdFromLocalStorage() {
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

  async function carregarHistoricoPedidos() {
    if (!historicoContainer) {
      console.error(
        "Elemento 'historico-pedidos-container' não encontrado no DOM."
      );
      return;
    }
    const clienteId = getClienteIdFromLocalStorage();
    if (!clienteId) {
      historicoContainer.innerHTML = `
                <div class="alert alert-warning text-center" role="alert">
                    Você precisa estar logado para ver seu histórico de pedidos. 
                    <a href="login.html" class="alert-link">Faça login</a>.
                </div>`;
      return;
    }
    historicoContainer.innerHTML =
      '<p class="text-center">Carregando histórico de pedidos...</p>';
    try {
      const response = await fetch(
        `${urlApiHistorico}?cliente_id=${clienteId}`
      );
      if (!response.ok) {
        let errorData = {
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
        };
        try {
          errorData = await response.json();
        } catch (e) {
          /* Mantém msg HTTP */
        }
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }
      const pedidos = await response.json();
      if (Array.isArray(pedidos) && pedidos.length > 0) {
        renderizarPedidos(pedidos);
      } else if (Array.isArray(pedidos) && pedidos.length === 0) {
        historicoContainer.innerHTML =
          '<p class="text-center alert alert-info">Você ainda não possui pedidos concluídos em seu histórico.</p>';
      } else {
        console.error(
          "Resposta inesperada da API de histórico (não é um array):",
          pedidos
        );
        historicoContainer.innerHTML =
          '<p class="text-center text-danger">Erro ao carregar histórico: formato de dados inesperado recebido da API.</p>';
      }
    } catch (error) {
      console.error("Falha ao buscar histórico de pedidos:", error);
      historicoContainer.innerHTML = `<p class="text-center text-danger">Não foi possível carregar o histórico de pedidos: ${error.message}</p>`;
    }
  }

  /**
   * Renderiza a lista de pedidos.
   * A quantidade de cada item agrupado é determinada pela CONTAGEM de ocorrências
   * de (produto_id + preco_unitario_no_pedido) dentro do mesmo n_pedido,
   * IGNORANDO o campo 'quantidade' vindo da API para essa contagem.
   * @param {Array<Object>} pedidos Array de objetos de pedido (vindos da API).
   */
  function renderizarPedidos(pedidos) {
    historicoContainer.innerHTML = "";

    pedidos.forEach((pedido) => {
      const pedidoCard = document.createElement("div");
      pedidoCard.className = "card pedido-card shadow-sm mb-4";

      const itensVisuaisAgrupados = {};
      let somaPrecosUnitariosDoPedidoParaTotal = 0; // Para o "Total Pago" especial

      // Primeira passagem: Agrupar itens e calcular a soma dos preços unitários e quantidades
      pedido.itens.forEach((itemOriginalDaAPI) => {
        const precoUnitarioOriginal = parseFloat(
          itemOriginalDaAPI.preco_unitario_no_pedido
        );
        if (!isNaN(precoUnitarioOriginal)) {
          somaPrecosUnitariosDoPedidoParaTotal += precoUnitarioOriginal;
        }

        // ****** INÍCIO DA NOVA LÓGICA DE AGRUPAMENTO E CONTAGEM ******
        // Chave de agrupamento: combinando produto_id e preco_unitario_no_pedido
        // O tamanho_item ainda pode ser usado para exibição, mas não para agrupar para contagem de quantidade.
        // Se você quiser que o tamanho também seja parte da chave de agrupamento para contagem,
        // adicione itemOriginalDaAPI.tamanho_item à chave.
        const chaveAgrupamento = `${
          itemOriginalDaAPI.produto_id
        }-${precoUnitarioOriginal.toFixed(2)}`;
        // ****** FIM DA NOVA LÓGICA DE AGRUPAMENTO E CONTAGEM ******

        if (itensVisuaisAgrupados[chaveAgrupamento]) {
          // Item já existe no grupo:
          // Incrementa a quantidade CONTADA (ignora itemOriginalDaAPI.quantidade)
          itensVisuaisAgrupados[chaveAgrupamento].quantidade_contada += 1;
          // Soma o subtotal do item atual ao subtotal do grupo
          // O subtotal do item original ainda pode ser útil se a API o calcular corretamente
          // Mas se a quantidade da API é 0, o subtotal_item da API também será 0.
          // Então, recalculamos o subtotal do item com base no preço unitário.
          itensVisuaisAgrupados[chaveAgrupamento].subtotal_agrupado +=
            precoUnitarioOriginal; // Adiciona o preço unitário

          // Concatena observações (opcional)
          if (
            itemOriginalDaAPI.observacao_item &&
            itensVisuaisAgrupados[chaveAgrupamento].observacao_item !==
              itemOriginalDaAPI.observacao_item &&
            !itensVisuaisAgrupados[chaveAgrupamento].observacao_item.includes(
              itemOriginalDaAPI.observacao_item
            )
          ) {
            itensVisuaisAgrupados[
              chaveAgrupamento
            ].observacao_item += `; ${itemOriginalDaAPI.observacao_item}`;
          } else if (
            itemOriginalDaAPI.observacao_item &&
            !itensVisuaisAgrupados[chaveAgrupamento].observacao_item
          ) {
            itensVisuaisAgrupados[chaveAgrupamento].observacao_item =
              itemOriginalDaAPI.observacao_item;
          }
        } else {
          // Novo item (ou grupo):
          itensVisuaisAgrupados[chaveAgrupamento] = {
            ...itemOriginalDaAPI, // Copia propriedades do primeiro item que forma o grupo
            quantidade_contada: 1, // Quantidade inicial contada é 1
            subtotal_agrupado: precoUnitarioOriginal, // Subtotal inicial é o preço unitário
          };
        }
      });

      let itensHtml = '<ul class="list-group list-group-flush">';
      Object.values(itensVisuaisAgrupados).forEach((itemAgrupado) => {
        let imagemSrc =
          itemAgrupado.caminho_imagem_produto || "/img/padrao.jpg";
        if (
          imagemSrc &&
          !imagemSrc.startsWith("http") &&
          !imagemSrc.startsWith("/")
        ) {
          imagemSrc = `/${imagemSrc}`;
        }
        if (
          !imagemSrc ||
          imagemSrc.toLowerCase() === "/undefined" ||
          imagemSrc.toLowerCase() === "/null"
        ) {
          imagemSrc = "/img/padrao.jpg";
        }

        itensHtml += `
                    <li class="list-group-item item-pedido d-flex align-items-start">
                        <img src="${imagemSrc}" alt="${
          itemAgrupado.nome_produto || "Imagem do produto"
        }" 
                             class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;" 
                             onerror="this.onerror=null;this.src='/img/padrao.jpg';">
                        <div class="flex-grow-1">
                            <h6 class="mb-1"><strong>${
                              itemAgrupado.nome_produto ||
                              "Produto Indisponível"
                            }</strong></h6>
                            
                            <small class="d-block text-muted">Quantidade: ${
                              itemAgrupado.quantidade_contada
                            }</small>
                            <small class="d-block text-muted">Tamanho: ${
                              itemAgrupado.tamanho_item || "N/A"
                            } ${itemAgrupado.tipo_tamanho_item || ""}</small>
                            ${
                              itemAgrupado.observacao_item
                                ? `<small class="d-block text-muted"><em>Obs: ${itemAgrupado.observacao_item}</em></small>`
                                : ""
                            }
                        </div>
                        <div class="ms-3 text-end">
                            
                            <span class="fw-bold">${formatarMoeda(
                              itemAgrupado.subtotal_agrupado
                            )}</span>
                        </div>
                    </li>`;
      });
      itensHtml += "</ul>";

      pedidoCard.innerHTML = `
                <div class="pedido-header card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-0">Pedido #${
                          pedido.n_pedido || "N/A"
                        }</h5>
                        <small class="text-white-50">Data: ${
                          pedido.data_pedido || "N/A"
                        }</small>
                    </div>
                    <span class="pedido-status badge bg-light text-dark p-2 fs-6">${
                      pedido.status || "N/A"
                    }</span>
                </div>
                <div class="card-body p-0">
                    ${itensHtml}
                </div>
                <div class="card-footer text-muted text-end"> 
                    <span>Total Pago: <strong class="text-danger fs-5">${formatarMoeda(
                      somaPrecosUnitariosDoPedidoParaTotal
                    )}</strong></span>
                </div>
            `;
      historicoContainer.appendChild(pedidoCard);
    });
  }

  carregarHistoricoPedidos();
});
