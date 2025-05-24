document.addEventListener("DOMContentLoaded", async () => {
  // CORREÇÃO DAS URLs
  const urlGet = "https://devweb3.ok.etc.br/api_mobile/api_get_produtos.php";
  const urlPost =
    "https://devweb3.ok.etc.br/api_mobile/api_registrar_item_pedido.php";

  const pizzasContainer = document.getElementById("pizzas-container");
  const hamburguerContainer = document.getElementById("hamburguer-container");
  const bebidasContainer = document.getElementById("bebidas-container");
  const sobremesaContainer = document.getElementById("sobremesa-container");
  const categoryFilter = document.getElementById("category-filter-select");
  const cartCountElement = document.getElementById("cart-count"); // Para o contador do carrinho

  // Função para obter o ID do cliente (adapte conforme sua autenticação)
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

  // Função para atualizar contador do carrinho (placeholder, idealmente buscaria da API)
  function updateCartCount() {
    // Para um contador real, você chamaria uma API para buscar os itens do pedido do cliente_id
    // Por agora, vamos apenas simular ou deixar em 0 se não houver lógica local.
    if (cartCountElement) {
      // Exemplo: se você tivesse uma API para buscar o total de itens no carrinho
      // const clienteId = getClienteId();
      // if (clienteId) {
      //   fetch(`/api/get_cart_total.php?cliente_id=${clienteId}`)
      //     .then(res => res.json())
      //     .then(data => {
      //       cartCountElement.textContent = data.totalItems || 0;
      //     })
      //     .catch(() => cartCountElement.textContent = '0');
      // } else {
      //   cartCountElement.textContent = '0';
      // }
      cartCountElement.textContent = "0"; // Placeholder
    }
  }

  try {
    const response = await fetch(urlGet);
    if (!response.ok) {
      // Se a resposta não for OK (ex: 404, 500), tenta ler como texto para ver a mensagem de erro
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }
    const produtos = await response.json();

    // Popula o filtro de categorias
    const categorias = new Set(
      produtos.map((p) => p.categoria).filter(Boolean) // Filtra nulos/undefined
    );
    // Limpa opções antigas do filtro, exceto a primeira ("Todas as Categorias")
    while (categoryFilter.options.length > 1) {
      categoryFilter.remove(1);
    }
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria; // Usar o nome original da categoria para o valor do filtro
      option.textContent = categoria;
      categoryFilter.appendChild(option);
    });

    function criarCard(produto) {
      const imagem =
        produto.caminho &&
        produto.caminho.toLowerCase() !== "undefined" &&
        produto.caminho.trim() !== ""
          ? produto.caminho
          : "img/padrao.jpg"; // Imagem padrão

      const card = document.createElement("div");
      card.className = "col-md-4 mb-4"; // Bootstrap column

      // Lógica para criar o select de opções (tamanho/tipo)
      const sizeOptions = [];
      const categoriaLowerCard = produto.categoria?.toLowerCase() || "";

      if (categoriaLowerCard === "pizza") {
        if (produto.pequena && parseFloat(produto.pequena) > 0)
          sizeOptions.push({
            displayText: `Pequena (Fatia) - R$ ${parseFloat(
              produto.pequena
            ).toFixed(2)}`,
            price: produto.pequena,
            tamanhoApi: "pequena",
            tipoApi: "meia",
          });
        if (produto.media && parseFloat(produto.media) > 0)
          sizeOptions.push({
            displayText: `Média (Fatia) - R$ ${parseFloat(
              produto.media
            ).toFixed(2)}`,
            price: produto.media,
            tamanhoApi: "media",
            tipoApi: "meia",
          });
        if (produto.grande && parseFloat(produto.grande) > 0)
          sizeOptions.push({
            displayText: `Grande (Fatia) - R$ ${parseFloat(
              produto.grande
            ).toFixed(2)}`,
            price: produto.grande,
            tamanhoApi: "grande",
            tipoApi: "meia",
          });
        if (produto.media_inteira && parseFloat(produto.media_inteira) > 0)
          sizeOptions.push({
            displayText: `Média Inteira - R$ ${parseFloat(
              produto.media_inteira
            ).toFixed(2)}`,
            price: produto.media_inteira,
            tamanhoApi: "media",
            tipoApi: "inteira",
          });
        if (produto.grande_inteira && parseFloat(produto.grande_inteira) > 0)
          sizeOptions.push({
            displayText: `Grande Inteira - R$ ${parseFloat(
              produto.grande_inteira
            ).toFixed(2)}`,
            price: produto.grande_inteira,
            tamanhoApi: "grande",
            tipoApi: "inteira",
          });
      } else {
        // Não-pizzas
        if (produto.pequena && parseFloat(produto.pequena) > 0) {
          // Assumindo 'pequena' é o preço unitário/único
          sizeOptions.push({
            displayText: `Unidade - R$ ${parseFloat(produto.pequena).toFixed(
              2
            )}`,
            price: produto.pequena,
            tamanhoApi: "pequena",
            tipoApi: "inteira",
          }); // Placeholders para API
        } else if (produto.media && parseFloat(produto.media) > 0) {
          // Adicionando fallback se 'pequena' não existir mas 'media' sim
          sizeOptions.push({
            displayText: `Unidade - R$ ${parseFloat(produto.media).toFixed(2)}`,
            price: produto.media,
            tamanhoApi: "media",
            tipoApi: "inteira",
          });
        } else if (produto.grande && parseFloat(produto.grande) > 0) {
          // Fallback para 'grande'
          sizeOptions.push({
            displayText: `Unidade - R$ ${parseFloat(produto.grande).toFixed(
              2
            )}`,
            price: produto.grande,
            tamanhoApi: "grande",
            tipoApi: "inteira",
          });
        }
      }

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
        // Se não houver opções, talvez o produto não tenha preço ou esteja indisponível
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

    function renderizarProdutos(produtosFiltrados) {
      // Limpa containers
      if (pizzasContainer) pizzasContainer.innerHTML = "";
      if (hamburguerContainer) hamburguerContainer.innerHTML = "";
      if (bebidasContainer) bebidasContainer.innerHTML = "";
      if (sobremesaContainer) sobremesaContainer.innerHTML = "";

      if (produtosFiltrados.length === 0) {
        // Opcional: Mostrar mensagem se nenhum produto corresponder ao filtro
        const algumContainerVisivel = document.querySelector(
          '.product-section[style*="display: block"] .row'
        );
        if (algumContainerVisivel)
          algumContainerVisivel.innerHTML =
            '<p class="text-center col-12">Nenhum produto encontrado para esta categoria.</p>';
      }

      produtosFiltrados.forEach((produto) => {
        const categoria = produto?.categoria?.toLowerCase() || "";
        const card = criarCard(produto);

        if (categoria.includes("pizza") && pizzasContainer) {
          pizzasContainer.appendChild(card);
        } else if (categoria.includes("hambúrguer") && hamburguerContainer) {
          // Corrigido para 'hambúrguer'
          hamburguerContainer.appendChild(card);
        } else if (
          (categoria.includes("bebida") ||
            categoria.includes("suco") ||
            categoria.includes("refrigerante") ||
            categoria.includes("cerveja")) &&
          bebidasContainer
        ) {
          bebidasContainer.appendChild(card);
        } else if (categoria.includes("sobremesa") && sobremesaContainer) {
          sobremesaContainer.appendChild(card);
        } else {
          // Fallback para categorias não mapeadas explicitamente, ou se um container não existir
          // Poderia adicionar a um container "Outros" ou logar
          // console.warn(`Produto "${produto.nome}" com categoria "${produto.categoria}" não classificado.`);
        }
      });
      adicionarEventosBotoes();
    }

    function adicionarEventosBotoes() {
      document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
        // Remove listener antigo para evitar duplicidade se renderizarProdutos for chamada múltiplas vezes
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", async () => {
          console.log("Botão Adicionar clicado:", newBtn.dataset.id);
          const id_produto_str = newBtn.dataset.id;
          const nome_produto = newBtn.dataset.nome;

          const cliente_id = getClienteId();
          if (!cliente_id) {
            alert("Por favor, faça login para adicionar itens ao pedido.");
            console.log("Cliente não logado, abortando adição ao carrinho.");
            return;
          }

          const qtdInput = document.getElementById(`qtd-${id_produto_str}`);
          const quantidade = qtdInput ? parseInt(qtdInput.value) : 1;
          if (isNaN(quantidade) || quantidade < 1) {
            alert("Quantidade inválida.");
            console.log("Quantidade inválida: ", quantidade);
            return;
          }

          const sizeSelect = document.getElementById(
            `size-select-${id_produto_str}`
          );
          if (!sizeSelect || !sizeSelect.value) {
            // Este caso não deveria ocorrer se o botão não estiver desabilitado.
            alert("Por favor, selecione uma opção para o produto.");
            console.log("Select de tamanho não encontrado ou sem valor.");
            return;
          }

          let selectedOptionData;
          try {
            selectedOptionData = JSON.parse(sizeSelect.value);
          } catch (e) {
            alert("Erro ao processar a opção selecionada.");
            console.error(
              "Erro ao parsear JSON do select:",
              e,
              "Valor:",
              sizeSelect.value
            );
            return;
          }

          const preco_unitario_selecionado = parseFloat(
            selectedOptionData.price
          );
          const tamanho_api_selecionado = selectedOptionData.tamanhoApi;
          const tipo_api_selecionado = selectedOptionData.tipoApi;

          if (
            isNaN(preco_unitario_selecionado) ||
            preco_unitario_selecionado <= 0 ||
            !tamanho_api_selecionado ||
            !tipo_api_selecionado
          ) {
            alert("A opção selecionada para o produto é inválida.");
            console.log("Dados da opção inválidos:", selectedOptionData);
            return;
          }

          console.log(
            `Iniciando ${quantidade} chamadas à API para o produto ${nome_produto}`
          );
          let todosAdicionadosComSucesso = true;

          for (let i = 0; i < quantidade; i++) {
            const payload = {
              cliente_id: cliente_id,
              pizza_id: parseInt(id_produto_str), // API espera 'pizza_id'
              preco: preco_unitario_selecionado, // API espera 'preco' (unitário)
              tamanho_selecionado: tamanho_api_selecionado,
              tipo_pizza: tipo_api_selecionado,
            };
            console.log(
              `Payload para item ${i + 1}/${quantidade}:`,
              JSON.stringify(payload)
            );

            try {
              const respostaPost = await fetch(urlPost, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              // Tenta ler a resposta como JSON, mesmo se não for OK
              let resultadoPost;
              const contentType = respostaPost.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                resultadoPost = await respostaPost.json();
              } else {
                const textResult = await respostaPost.text();
                console.warn("Resposta da API não é JSON. Texto:", textResult);
                // Tenta criar um objeto de erro padronizado
                resultadoPost = {
                  success: false,
                  message: `Resposta inesperada do servidor (Status: ${
                    respostaPost.status
                  }). Conteúdo: ${textResult.substring(0, 100)}...`,
                };
              }

              console.log(`Resposta da API para item ${i + 1}:`, resultadoPost);

              if (!respostaPost.ok || !resultadoPost.success) {
                alert(
                  `Erro ao adicionar item ${
                    i + 1
                  } (${nome_produto}) ao pedido: ${
                    resultadoPost.message || `Erro HTTP ${respostaPost.status}`
                  }`
                );
                todosAdicionadosComSucesso = false;
                break;
              }
            } catch (erroComunicacao) {
              console.error(
                `Erro de comunicação ao adicionar item ${i + 1}:`,
                erroComunicacao
              );
              alert(
                `Erro de comunicação ao adicionar item ${
                  i + 1
                } (${nome_produto}). Verifique sua conexão.`
              );
              todosAdicionadosComSucesso = false;
              break;
            }
          } // Fim do loop FOR

          if (todosAdicionadosComSucesso) {
            alert(
              `${quantidade}x "${nome_produto}" adicionado(s) com sucesso ao pedido!`
            );
            if (qtdInput) qtdInput.value = 1; // Reseta quantidade no input
            // updateCartCount(); // Chamar aqui se tiver API para buscar o total do carrinho
          }
        });
      });
    }

    // Renderização inicial e filtro
    renderizarProdutos(produtos);
    updateCartCount(); // Atualiza contador no início

    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => {
        const categoriaSelecionada = categoryFilter.value;
        // Mostra/oculta seções de produtos
        document.querySelectorAll(".product-section").forEach((section) => {
          section.style.display = "none";
        });

        if (categoriaSelecionada === "all") {
          renderizarProdutos(produtos); // Re-renderiza todos os produtos
          // Mostra todas as seções que podem ter produtos
          if (
            pizzasContainer &&
            produtos.some((p) => p.categoria?.toLowerCase().includes("pizza"))
          )
            document.getElementById("pizzas-section").style.display = "block";
          if (
            hamburguerContainer &&
            produtos.some((p) =>
              p.categoria?.toLowerCase().includes("hambúrguer")
            )
          )
            document.getElementById("hamburguer-section").style.display =
              "block";
          if (
            bebidasContainer &&
            produtos.some((p) =>
              p.categoria
                ?.toLowerCase()
                .match(/bebida|suco|refrigerante|cerveja/)
            )
          )
            document.getElementById("bebidas-section").style.display = "block";
          if (
            sobremesaContainer &&
            produtos.some((p) =>
              p.categoria?.toLowerCase().includes("sobremesa")
            )
          )
            document.getElementById("sobremesa-section").style.display =
              "block";
        } else {
          const filtrados = produtos.filter(
            (p) => p.categoria === categoriaSelecionada
          );
          renderizarProdutos(filtrados); // Re-renderiza apenas os filtrados
          // Mostra apenas a seção da categoria selecionada, se ela tiver produtos
          const categoriaNorm = categoriaSelecionada
            .toLowerCase()
            .replace(/\s+/g, "-");
          if (
            categoriaNorm.includes("pizza") &&
            pizzasContainer &&
            filtrados.length > 0
          )
            document.getElementById("pizzas-section").style.display = "block";
          else if (
            categoriaNorm.includes("hambúrguer") &&
            hamburguerContainer &&
            filtrados.length > 0
          )
            document.getElementById("hamburguer-section").style.display =
              "block";
          else if (
            categoriaNorm.match(/bebida|suco|refrigerante|cerveja/) &&
            bebidasContainer &&
            filtrados.length > 0
          )
            document.getElementById("bebidas-section").style.display = "block";
          else if (
            categoriaNorm.includes("sobremesa") &&
            sobremesaContainer &&
            filtrados.length > 0
          )
            document.getElementById("sobremesa-section").style.display =
              "block";
        }
      });
    }
  } catch (erro) {
    console.error("Erro fatal ao carregar ou processar produtos:", erro);
    // Tenta exibir uma mensagem de erro mais amigável na página
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.innerHTML = `<div class="container text-center py-5"><p class="text-danger h3">Desculpe, o cardápio está indisponível no momento.</p><p class="text-muted">Por favor, tente novamente mais tarde.</p><p><small>Detalhe do erro: ${erro.message}</small></p></div>`;
    } else {
      alert("Erro ao carregar o cardápio. Tente novamente mais tarde.");
    }
  }
});
