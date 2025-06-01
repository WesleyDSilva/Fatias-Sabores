// carrinho.js
document.addEventListener("DOMContentLoaded", async () => {
  // --- URLs ---
  const urlGetCarrinho =
    "https://devweb3.ok.etc.br/api_mobile/api_get_carrinho.php"; // Mantenha como está
  const urlRemoverInstanciaUnica =
    "https://devweb3.ok.etc.br/api_mobile/api_delete_carrinho_item.php"; // Mantenha
  const urlRemoverTodasInstancias =
    "https://devweb3.ok.etc.br/api/api_delete_carrinho_web.php"; // Mantenha
  const urlRegistrarItem =
    "https://devweb3.ok.etc.br/api_mobile/api_registrar_item_pedido.php"; // Mantenha
  const urlFavoritar = "https://devweb3.ok.etc.br/api/api_pedido_favorito.php"; // Mantenha

  // ****** ALTERAÇÃO AQUI ******
  // Mude para o caminho correto da sua API api_registrar_pedido.php
  // Se estiver na raiz do site:
  const urlApiRegistrarPedido = "api_registrar_pedido.php";
  // Se estiver em uma subpasta como /api/:
  // const urlApiRegistrarPedido = "api/api_registrar_pedido.php";

  // --- Elementos do DOM ---
  const carrinhoContainer = document.getElementById("carrinho-items");
  const totalPedidoElement = document.getElementById("total-pedido");

  // Ajuste no seletor do badge, caso o href no menu tenha mudado para carrinho.php
  const cartCountBadge =
    document.getElementById("cart-count-badge-nav") || // Se você adicionou o ID no menu
    document.querySelector('a[href="carrinho.php"] span.badge'); // Fallback

  // Ajuste no seletor do botão de confirmar pedido para usar o ID que definimos no HTML de carrinho.php
  const btnConfirmarPedido = document.getElementById(
    "btn-confirmar-pedido-link"
  );

  // --- Funções Auxiliares (sem alterações) ---
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
        localStorage.removeItem("usuario"); // Limpa item inválido
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
    } else {
      // console.warn("Elemento cartCountBadge não encontrado para atualizar contador.");
    }
  }

  // --- Lógica Principal do Carrinho (sem alterações, exceto talvez o tratamento de erro da API de carrinho se ela mudar) ---
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
        let errorMsg = `Erro HTTP ${response.status} ao buscar carrinho.`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || `Erro: ${response.statusText}`;
        } catch (e) {
          /* Não conseguiu parsear JSON de erro */
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Ajuste na verificação de sucesso e dados da API de carrinho
      // Assumindo que a API de carrinho retorna um array de itens diretamente em caso de sucesso,
      // ou um objeto com {success: false, message: "..."} ou {message: "..."} em caso de erro/vazio
      if (
        data.success === false ||
        (data.message && data.itens && data.itens.length === 0) ||
        (Array.isArray(data) && data.length === 0)
      ) {
        carrinhoContainer.innerHTML = `<p class="text-center">${
          data.message || "Seu carrinho está vazio."
        }</p>`;
        atualizarTotal([]);
        atualizarContadorBadge(0);
        if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
        return;
      }

      const itensDoPedido = Array.isArray(data) ? data : data.itens || []; // Garante que é um array

      if (itensDoPedido.length === 0) {
        carrinhoContainer.innerHTML = `<p class="text-center">${
          data.message || "Seu carrinho está vazio."
        }</p>`;
        atualizarTotal([]);
        atualizarContadorBadge(0);
        if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
        return;
      }

      carrinhoContainer.innerHTML = "";
      renderizarItensCarrinho(itensDoPedido);
      atualizarTotal(itensDoPedido);
      atualizarContadorBadge(itensDoPedido.length); // Usa o número de linhas/grupos de itens
      if (btnConfirmarPedido) btnConfirmarPedido.classList.remove("disabled");
    } catch (error) {
      console.error("Erro ao carregar o carrinho:", error);
      carrinhoContainer.innerHTML = `<p class="text-center text-danger">Erro ao carregar os dados do carrinho. ${error.message}</p>`;
      atualizarContadorBadge(0);
      if (btnConfirmarPedido) btnConfirmarPedido.classList.add("disabled");
    }
  }

  // --- renderizarItensCarrinho (sem alterações) ---
  function renderizarItensCarrinho(itens) {
    const itensAgrupados = {};
    itens.forEach((item) => {
      const chaveItem = `${item.produto_id}-${item.tamanho_pedido}-${item.tipo_tamanho_pedido}`;
      if (itensAgrupados[chaveItem]) {
        itensAgrupados[chaveItem].quantidade += parseInt(item.quantidade) || 1; // Se a API já agrupa, use item.quantidade
        itensAgrupados[chaveItem].ids_item_pedido.push(item.id_item_pedido);
      } else {
        itensAgrupados[chaveItem] = {
          ...item,
          quantidade: parseInt(item.quantidade) || 1, // Se a API já agrupa, use item.quantidade
          ids_item_pedido: [item.id_item_pedido],
        };
      }
    });

    Object.values(itensAgrupados).forEach((itemAgrupado) => {
      const precoUnitario = parseFloat(
        itemAgrupado.total_item_pedido || itemAgrupado.preco_unitario
      ); // Ajuste conforme o nome do campo

      let imagemProduto = "/img/padrao.jpg"; // Caminho padrão
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
          // Se for uma URL completa, usa direto. Se for só o nome do arquivo, você precisa prefixar.
          // Exemplo: se caminho_imagem_produto for 'pizza.jpg' e as imagens estão em '/img/produtos/'
          // imagemProduto = `/img/produtos/${caminhoLimpo}`;
          // Se for URL completa:
          if (
            caminhoLimpo.startsWith("http://") ||
            caminhoLimpo.startsWith("https://")
          ) {
            imagemProduto = caminhoLimpo;
          } else if (caminhoLimpo.includes("/")) {
            // Se já inclui um caminho parcial
            imagemProduto = caminhoLimpo; // Ou ajuste o prefixo se necessário
          } else {
            imagemProduto = `/img/produtos/${caminhoLimpo}`; // Assumindo que está em /img/produtos/
            console.warn(
              `Caminho da imagem não é URL completa: ${caminhoLimpo}. Usando: ${imagemProduto}`
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
      }" style="max-height: 100px; width: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='/img/padrao.jpg';">
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

  // --- atualizarTotal (sem alterações) ---
  function atualizarTotal(itensDoPedidoApi) {
    let totalCalculado = 0;
    if (Array.isArray(itensDoPedidoApi)) {
      itensDoPedidoApi.forEach(function (item) {
        const preco = parseFloat(item.total_item_pedido || item.preco_unitario); // Ajuste conforme o nome do campo
        if (!isNaN(preco)) {
          totalCalculado += preco * (parseInt(item.quantidade) || 1); // Multiplica pelo quantidade se a API não agrupar o total
        }
      });
    }
    if (totalPedidoElement)
      totalPedidoElement.textContent = formatarMoeda(totalCalculado);
  }

  // --- Funções de Ação do Carrinho (sem alterações, a menos que as APIs mudem) ---
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
          success: response.ok, // Assumir sucesso se status for ok e não for JSON
          message: response.ok
            ? "Item removido"
            : `Resposta inesperada do servidor (Status: ${response.status})`,
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
      pizza_id: parseInt(produtoId), // Ajuste o nome do campo se sua API de registro de item espera 'produto_id'
      preco: parseFloat(precoUnitario),
      tamanho_selecionado: tamanho,
      tipo_pizza: tipo, // Ajuste o nome do campo se sua API espera 'tipo_tamanho'
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
    const finalPayload = { pizzas: [itemPayload] }; // API de favoritos espera um array de pizzas

    try {
      const response = await fetch(urlFavoritar, {
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
          success: response.ok,
          message: response.ok
            ? "Favoritado com sucesso (resposta não JSON)"
            : `Resposta inesperada do servidor (Status: ${response.status}).`,
        };
      }

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

  // --- adicionarListenersAcoesCarrinho (sem alterações) ---
  function adicionarListenersAcoesCarrinho() {
    document.querySelectorAll(".btn-diminuir").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", async function () {
        const cardElement = this.closest(".item-carrinho-agrupado");
        const idsItemPedido = JSON.parse(cardElement.dataset.idsItemPedido);
        if (idsItemPedido.length > 0) {
          const idParaRemover = idsItemPedido.pop(); // Remove o último ID para diminuir
          if (await removerInstanciaItemDoPedidoAPI(idParaRemover)) {
            carregarCarrinho(); // Recarrega o carrinho para refletir a mudança
          } else {
            // Se falhar, a API já deve ter dado um alerta. Recarregamos mesmo assim para reverter visualmente.
            idsItemPedido.push(idParaRemover); // Adiciona de volta se falhou (opcional)
            cardElement.dataset.idsItemPedido = JSON.stringify(idsItemPedido); // Atualiza o dataset (opcional)
            // carregarCarrinho(); // Ou apenas atualiza a quantidade visualmente sem recarregar tudo
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
            // Não precisa de alerta aqui se a API já der feedback ou se o recarregamento for suficiente
          }
          carregarCarrinho(); // Recarrega para mostrar o carrinho atualizado
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
      event.preventDefault(); // Previne a navegação padrão do link
      const cliente_id = getClienteId();
      if (!cliente_id) {
        alert("Por favor, faça login para confirmar o pedido.");
        window.location.href = "login.html"; // Redireciona para login se não estiver logado
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
      // Na sua API api_registrar_pedido.php, você espera 'PIX', 'Cartão', 'Dinheiro'
      // O 'value' dos seus radio buttons deve corresponder a isso
      const forma_pagamento = metodoPagamentoSelecionado.value; // Ex: "dinheiro", "cartao", "pix"

      // Ajuste para corresponder aos valores esperados pela API PHP
      let formaPagamentoApi = "";
      if (forma_pagamento.toLowerCase() === "dinheiro")
        formaPagamentoApi = "Dinheiro";
      else if (forma_pagamento.toLowerCase() === "cartao")
        formaPagamentoApi = "Cartão";
      else if (forma_pagamento.toLowerCase() === "pix")
        formaPagamentoApi = "PIX";
      else {
        alert("Método de pagamento inválido selecionado internamente.");
        return;
      }

      const valorTrocoInput = document.getElementById("troco");
      let troco_para = null; // enviado como null se não for dinheiro
      const totalAtualTexto = totalPedidoElement.textContent
        .replace("R$", "")
        .replace(/\./g, "") // Remove separador de milhar
        .replace(",", "."); // Substitui vírgula por ponto para decimal
      const totalAtual = parseFloat(totalAtualTexto);

      if (formaPagamentoApi === "Dinheiro") {
        if (!valorTrocoInput || valorTrocoInput.value.trim() === "") {
          alert(
            "Se o pagamento for em dinheiro, por favor, informe para quanto será o troco (mesmo que não precise de troco, informe o valor pago)."
          );
          valorTrocoInput.focus();
          return;
        }
        troco_para = parseFloat(valorTrocoInput.value.replace(",", "."));
        if (isNaN(troco_para) || troco_para < totalAtual) {
          alert(
            "O valor para troco deve ser um número válido e maior ou igual ao total do pedido."
          );
          valorTrocoInput.focus();
          return;
        }
      }

      // Monta o payload para api_registrar_pedido.php
      const payloadFinalizar = {
        cliente_id: cliente_id,
        forma_pagamento: formaPagamentoApi, // Usa o valor ajustado para a API
        troco_para: troco_para, // Será null se não for dinheiro
      };

      console.log(
        "Tentando finalizar pedido com payload:",
        payloadFinalizar,
        "para URL:",
        urlApiRegistrarPedido
      );
      btnConfirmarPedido.classList.add("disabled"); // Desabilita o botão
      btnConfirmarPedido.innerHTML =
        '<b>Processando...</b> <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

      try {
        // ****** ALTERAÇÃO AQUI: USA A NOVA URL ******
        const response = await fetch(urlApiRegistrarPedido, {
          method: "POST", // Sua API espera POST ou PUT
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadFinalizar),
        });

        const result = await response.json();
        console.log("Resposta da API de registro de pedido:", result);

        if (response.ok && result.success) {
          alert(
            "Pedido confirmado com sucesso! Nº do Pedido: " +
              (result.n_pedido || "N/A") +
              "\n" +
              (result.message || "")
          );
          // Opcional: Salvar o número do pedido no localStorage para exibir na página de confirmação
          if (result.n_pedido) {
            localStorage.setItem("ultimo_pedido_confirmado", result.n_pedido);
          }
          // Redireciona para a página de confirmação
          window.location.href = "pedidoconfirmado.php"; // Certifique-se que esta página existe
        } else {
          alert(
            "Erro ao confirmar o pedido: " +
              (result.message ||
                "Tente novamente. Verifique o console para mais detalhes.")
          );
          console.error("Erro da API ao registrar pedido:", result);
        }
      } catch (error) {
        console.error("Erro de comunicação ao finalizar pedido:", error);
        alert(
          "Erro de comunicação ao finalizar o pedido. Verifique sua conexão e tente novamente."
        );
      } finally {
        btnConfirmarPedido.classList.remove("disabled");
        btnConfirmarPedido.innerHTML = "<b>Confirmar meu pedido</b>"; // Restaura o texto do botão
      }
    });
  }

  // --- Inicialização ---
  carregarCarrinho();
});
