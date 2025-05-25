document.addEventListener("DOMContentLoaded", async () => {
  // --- URLs ---
  const urlGetCarrinho =
    "https://devweb3.ok.etc.br/api_mobile/api_get_carrinho.php";
  const urlRemoverInstanciaUnica =
    "https://devweb3.ok.etc.br/api_mobile/api_delete_carrinho_item.php";
  const urlRemoverTodasInstancias =
    "https://devweb3.ok.etc.br/api/api_delete_carrinho_web.php";
  const urlRegistrarItem =
    "https://devweb3.ok.etc.br/api_mobile/api_registrar_item_pedido.php";
  const urlFavoritar = "https://devweb3.ok.etc.br/api/api_pedido_favorito.php"; // <-- CORREÇÃO APLICADA
  const urlFinalizarPedido =
    "https://devweb3.ok.etc.br/api_mobile/api_finalizar_pedido.php";

  // --- Elementos do DOM ---
  const carrinhoContainer = document.getElementById("carrinho-items");
  const totalPedidoElement = document.getElementById("total-pedido");
  const cartCountBadge = document.querySelector(
    'a[href="carrinho.html"] span.badge'
  );
  const btnConfirmarPedido = document.querySelector(
    'a[href="pedidoconfirmado.html"]'
  );

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

  function atualizarContadorBadge(totalLinhasItens) {
    if (cartCountBadge) {
      cartCountBadge.textContent = totalLinhasItens || "0";
    }
  }

  // --- Lógica Principal do Carrinho ---
  async function carregarCarrinho() {
    const clienteId = getClienteId();
    if (!clienteId) {
      if (carrinhoContainer)
        carrinhoContainer.innerHTML =
          '<p class="text-center">Você precisa estar logado para ver seu carrinho. <a href="login.html">Faça login</a></p>';
      if (totalPedidoElement) totalPedidoElement.textContent = formatarMoeda(0);
      atualizarContadorBadge(0);
      if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
      return;
    }
    if (btnConfirmarPedido) btnConfirmarPedido.classList.remove("disabled");

    if (!carrinhoContainer || !totalPedidoElement) {
      console.error("Elementos do DOM para o carrinho não encontrados.");
      return;
    }

    carrinhoContainer.innerHTML =
      '<p class="text-center">Carregando itens do carrinho...</p>';
    totalPedidoElement.textContent = formatarMoeda(0);
    atualizarContadorBadge(0);

    try {
      const response = await fetch(`${urlGetCarrinho}?cliente_id=${clienteId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro HTTP ${response.status} ao buscar carrinho: ${errorText}`
        );
      }

      const data = await response.json();

      if (
        data.success === false ||
        (Array.isArray(data) && data.length === 0) ||
        data.error
      ) {
        carrinhoContainer.innerHTML = `<p class="text-center">${
          data.message || "Seu carrinho está vazio."
        }</p>`;
        atualizarTotal([]);
        atualizarContadorBadge(0);
        if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
        return;
      }

      const itensDoPedido = Array.isArray(data) ? data : data.itens || [];

      if (itensDoPedido.length === 0) {
        carrinhoContainer.innerHTML = `<p class="text-center">Seu carrinho está vazio.</p>`;
        atualizarTotal([]);
        atualizarContadorBadge(0);
        if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
        return;
      }

      carrinhoContainer.innerHTML = "";
      renderizarItensCarrinho(itensDoPedido);
      atualizarTotal(itensDoPedido);
      atualizarContadorBadge(itensDoPedido.length);
      if (btnConfirmarPedido) btnConfirmarPedido.classList.remove("disabled");
    } catch (error) {
      console.error("Erro ao carregar o carrinho:", error);
      carrinhoContainer.innerHTML = `<p class="text-center text-danger">Erro ao carregar os dados do carrinho. ${error.message}</p>`;
      atualizarContadorBadge(0);
      if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
    }
  }

  function renderizarItensCarrinho(itens) {
    const itensAgrupados = {};
    itens.forEach((item) => {
      const chaveItem = `${item.produto_id}-${item.tamanho_pedido}-${item.tipo_tamanho_pedido}`;
      if (itensAgrupados[chaveItem]) {
        itensAgrupados[chaveItem].quantidade += 1;
        itensAgrupados[chaveItem].ids_item_pedido.push(item.id_item_pedido);
      } else {
        itensAgrupados[chaveItem] = {
          ...item,
          quantidade: 1,
          ids_item_pedido: [item.id_item_pedido],
        };
      }
    });

    Object.values(itensAgrupados).forEach((itemAgrupado) => {
      const precoUnitario = parseFloat(itemAgrupado.total_item_pedido);

      let imagemProduto = "/img/padrao.jpg";
      if (
        itemAgrupado.caminho_imagem_produto &&
        typeof itemAgrupado.caminho_imagem_produto === "string"
      ) {
        const caminhoLimpo = itemAgrupado.caminho_imagem_produto.trim();
        if (caminhoLimpo !== "" && caminhoLimpo.toLowerCase() !== "undefined") {
          if (
            caminhoLimpo.startsWith("http://") ||
            caminhoLimpo.startsWith("https://")
          ) {
            imagemProduto = caminhoLimpo;
          } else {
            console.warn(
              `API retornou caminho de imagem que não é URL HTTP(S) para produto ID ${itemAgrupado.produto_id}: "${caminhoLimpo}". Usando padrão.`
            );
          }
        }
      }

      const cardItem = document.createElement("div");
      cardItem.classList.add("card", "mb-3", "item-carrinho-agrupado");
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
        itemAgrupado.nome_produto
      }" style="max-height: 100px; width: 100%; object-fit: cover;">
          </div>
          <div class="col-md-6 col-5">
            <div class="card-body py-2 px-3">
              <h6 class="card-title mb-1"><b>${
                itemAgrupado.nome_produto
              }</b></h6>
              <p class="card-text small text-muted mb-1">${
                itemAgrupado.tamanho_pedido
              } ${
        itemAgrupado.tipo_tamanho_pedido !== "unidade" &&
        itemAgrupado.tipo_tamanho_pedido
          ? itemAgrupado.tipo_tamanho_pedido
          : ""
      }</p>
              <p class="card-text fw-bold text-danger mb-2">${formatarMoeda(
                precoUnitario
              )} (unid.)</p>
              <div class="d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-sm btn-diminuir" title="Diminuir quantidade">-</button>
                <span class="quantity mx-2">${itemAgrupado.quantidade}</span>
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
      if (carrinhoContainer) carrinhoContainer.appendChild(cardItem);
    });
    adicionarListenersAcoesCarrinho();
  }

  function atualizarTotal(itensDoPedidoApi) {
    let totalCalculado = 0;
    if (Array.isArray(itensDoPedidoApi)) {
      itensDoPedidoApi.forEach(function (item) {
        const preco = parseFloat(item.total_item_pedido);
        if (!isNaN(preco)) {
          totalCalculado += preco;
        }
      });
    }
    if (totalPedidoElement)
      totalPedidoElement.textContent = formatarMoeda(totalCalculado);
  }

  // --- Funções de Ação do Carrinho ---
  async function removerInstanciaItemDoPedidoAPI(idItemPedidoARemover) {
    const clienteId = getClienteId();
    if (!clienteId || !idItemPedidoARemover) return false;

    try {
      const response = await fetch(
        `${urlRemoverInstanciaUnica}?pedido_id=${idItemPedidoARemover}&cliente_id=${clienteId}`,
        { method: "DELETE" }
      );

      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        console.warn(
          `Resposta de removerInstanciaItemDoPedidoAPI não é JSON (Status: ${
            response.status
          }). Texto: ${textResult.substring(0, 100)}`
        );
        result = {
          success: false,
          message: `Resposta inesperada do servidor (Status: ${response.status})`,
        };
      }

      if (response.ok && result.success) return true;
      else {
        console.error("Falha ao remover instância do item:", result);
        alert(
          "Erro ao diminuir quantidade: " +
            (result.message || "Tente novamente.")
        );
        return false;
      }
    } catch (error) {
      console.error("Erro de comunicação ao remover instância de item:", error);
      alert("Erro de comunicação ao diminuir a quantidade.");
      return false;
    }
  }

  async function removerTodasInstanciasProdutoAPI(produtoId) {
    const clienteId = getClienteId();
    if (!clienteId || !produtoId) return false;
    try {
      const response = await fetch(
        `${urlRemoverTodasInstancias}?produto_id=${produtoId}&cliente_id=${clienteId}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (response.ok && result.success) return true;
      else {
        console.error(
          "Falha ao remover todas as instâncias do produto via API:",
          result
        );
        alert(
          "Erro ao remover itens: " + (result.message || "Tente novamente.")
        );
        return false;
      }
    } catch (error) {
      console.error(
        "Erro de comunicação ao remover todas as instâncias do produto:",
        error
      );
      alert("Erro de comunicação ao remover os itens.");
      return false;
    }
  }

  async function adicionarMaisUmItemAPI(
    produtoId,
    precoUnitario,
    tamanho,
    tipo
  ) {
    const clienteId = getClienteId();
    if (!clienteId) return false;
    const payload = {
      cliente_id: clienteId,
      pizza_id: parseInt(produtoId),
      preco: parseFloat(precoUnitario),
      tamanho_selecionado: tamanho,
      tipo_pizza: tipo,
    };
    try {
      const response = await fetch(urlRegistrarItem, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      console.error("Erro de comunicação ao aumentar quantidade:", error);
      return false;
    }
  }

  async function favoritarItemAPI(produtoId, nomeProduto, precoUnitario) {
    const cliente_id = getClienteId();
    if (!cliente_id) {
      alert("Você precisa estar logado para favoritar itens.");
      return;
    }
    const itemPayload = {
      cliente_id: cliente_id,
      pizza_id: parseInt(produtoId),
      nome_pizza: nomeProduto,
      preco: parseFloat(precoUnitario),
    };
    const finalPayload = { pizzas: [itemPayload] };

    console.log(
      "API: Favoritando item com payload:",
      JSON.stringify(finalPayload, null, 2)
    );
    try {
      const response = await fetch(urlFavoritar, {
        // USA A URL CORRIGIDA
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResult = await response.text();
        console.warn(
          `Resposta da API de Favoritos não é JSON (Status: ${
            response.status
          }). Texto: ${textResult.substring(0, 100)}`
        );
        data = {
          success: false,
          message: `Resposta inesperada do servidor (Status: ${response.status}). Verifique o console para detalhes.`,
        };
      }

      console.log("Resposta da API de Favoritos:", data);

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

  function adicionarListenersAcoesCarrinho() {
    document.querySelectorAll(".btn-diminuir").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", async function () {
        const cardElement = this.closest(".item-carrinho-agrupado");
        const idsItemPedido = JSON.parse(cardElement.dataset.idsItemPedido);
        if (idsItemPedido.length > 0) {
          const idParaRemover = idsItemPedido.pop();
          if (await removerInstanciaItemDoPedidoAPI(idParaRemover)) {
            carregarCarrinho();
          } else {
            // A mensagem de erro já é dada pela função da API
            carregarCarrinho();
          }
        }
      });
    });

    document.querySelectorAll(".btn-aumentar").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", async function () {
        const cardElement = this.closest(".item-carrinho-agrupado");
        const produtoId = cardElement.dataset.produtoId;
        const preco = cardElement.dataset.precoUnitario;
        const tamanho = cardElement.dataset.tamanhoApi;
        const tipo = cardElement.dataset.tipoApi;
        if (await adicionarMaisUmItemAPI(produtoId, preco, tamanho, tipo)) {
          carregarCarrinho();
        } else {
          alert("Não foi possível aumentar a quantidade. Tente novamente.");
        }
      });
    });

    document.querySelectorAll(".btn-remover-grupo").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", async function () {
        const cardElement = this.closest(".item-carrinho-agrupado");
        const produtoId = cardElement.dataset.produtoId;
        const nomeProduto = cardElement.dataset.nomeProduto;

        if (
          confirm(
            `Tem certeza que deseja remover todos os "${nomeProduto}" do carrinho?`
          )
        ) {
          if (await removerTodasInstanciasProdutoAPI(produtoId)) {
            alert(`Todas as unidades de "${nomeProduto}" foram removidas.`);
          } else {
            // Mensagem de erro já é dada pela função da API
          }
          carregarCarrinho();
        }
      });
    });

    document.querySelectorAll(".btn-favoritar").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", function () {
        const cardElement = this.closest(".item-carrinho-agrupado");
        const produtoId = cardElement.dataset.produtoId;
        const nomeProduto = cardElement.dataset.nomeProduto;
        const preco = cardElement.dataset.precoUnitario;
        favoritarItemAPI(produtoId, nomeProduto, preco);
      });
    });
  }

  // --- Lógica de Finalização do Pedido ---
  if (btnConfirmarPedido) {
    btnConfirmarPedido.addEventListener("click", async function (event) {
      event.preventDefault();
      const cliente_id = getClienteId();
      if (!cliente_id) {
        alert("Por favor, faça login para confirmar o pedido.");
        return;
      }
      const itensVisiveis = document.querySelectorAll(
        ".item-carrinho-agrupado"
      );
      if (itensVisiveis.length === 0) {
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
      const metodoPagamento = metodoPagamentoSelecionado.value;
      const valorTrocoInput = document.getElementById("troco");
      let valorTroco = null;
      const totalAtualTexto = totalPedidoElement.textContent
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".");
      const totalAtual = parseFloat(totalAtualTexto);

      if (metodoPagamento === "dinheiro") {
        if (!valorTrocoInput || valorTrocoInput.value.trim() === "") {
          alert(
            "Se o pagamento for em dinheiro, por favor, informe para quanto será o troco (mesmo que não precise de troco, informe o valor pago)."
          );
          valorTrocoInput.focus();
          return;
        }
        valorTroco = parseFloat(valorTrocoInput.value.replace(",", "."));
        if (isNaN(valorTroco) || valorTroco < totalAtual) {
          alert(
            "O valor para troco deve ser um número maior ou igual ao total do pedido."
          );
          valorTrocoInput.focus();
          return;
        }
      }

      const payloadFinalizar = {
        cliente_id: cliente_id,
        metodo_pagamento: metodoPagamento,
        troco_para: metodoPagamento === "dinheiro" ? valorTroco : null,
      };
      console.log("Tentando finalizar pedido com payload:", payloadFinalizar);

      try {
        const response = await fetch(urlFinalizarPedido, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadFinalizar),
        });
        const result = await response.json();

        if (response.ok && result.success) {
          alert("Pedido confirmado com sucesso! " + (result.message || ""));
          window.location.href = "pedidoconfirmado.html";
        } else {
          alert(
            "Erro ao confirmar o pedido: " +
              (result.message || "Tente novamente.")
          );
        }
      } catch (error) {
        console.error("Erro de comunicação ao finalizar pedido:", error);
        alert("Erro de comunicação ao finalizar o pedido.");
      }
    });
  }

  // --- Inicialização ---
  carregarCarrinho();
});
