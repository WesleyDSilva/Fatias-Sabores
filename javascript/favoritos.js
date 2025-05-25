// javascript/favoritos.js

document.addEventListener("DOMContentLoaded", function () {
  // URLs das APIs
  const urlGetFavoritos =
    "https://devweb3.ok.etc.br/api_mobile/api_get_pedidos_favoritos.php";
  const urlDeleteFavorito =
    "https://devweb3.ok.etc.br/api/api_delete_favorito.php"; // <-- URL CORRIGIDA AQUI
  // A API api_get_pizzas.php não é mais necessária aqui, pois a api_get_pedidos_favoritos já traz os detalhes do produto.

  // Elementos do DOM
  const favoritosContainer = document.getElementById("favoritos-container");

  // Função para obter o ID do cliente (do localStorage)
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
      "getClienteId (favoritos): Nenhum usuário logado ou ID inválido."
    );
    return null;
  }

  // Função para formatar moeda (se precisar exibir preço, embora a API de favoritos não o traga diretamente)
  function formatarMoeda(valor) {
    const numero = parseFloat(valor);
    return isNaN(numero)
      ? "R$ --,--"
      : numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  // Função para criar o card de um item favorito
  function criarCardFavorito(favorito) {
    const imagemSrc =
      favorito.imagem &&
      typeof favorito.imagem === "string" &&
      favorito.imagem.trim() !== "" &&
      favorito.imagem.toLowerCase() !== "undefined"
        ? favorito.imagem
        : "/img/padrao.jpg";

    const card = document.createElement("div");
    card.classList.add("card", "mb-3", "item-favorito");
    // card.dataset.idFavorito = favorito.id_favorito; // A API de delete usa pizza_id, não id_favorito
    card.dataset.idPizza = favorito.id_pizza; // ID do produto (pizza/item) que será usado para deletar

    card.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-3 col-4">
          <img src="${imagemSrc}" class="img-fluid rounded-start" alt="${
      favorito.nome_pizza
    }" style="max-height: 100px; width: 100%; object-fit: cover;">
        </div>
        <div class="col-md-7 col-5">
          <div class="card-body py-2 px-3">
            <h6 class="card-title mb-1"><b>${favorito.nome_pizza}</b></h6>
            ${
              favorito.ingredientes
                ? `<p class="card-text small text-muted mb-1">${favorito.ingredientes}</p>`
                : ""
            }
          </div>
        </div>
        <div class="col-md-2 col-3 text-center d-flex flex-column justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-primary mb-2 btn-comprar-novamente" title="Adicionar ao Carrinho">
            <img src="/img/comprardenovo.png" alt="Comprar" style="width: 20px;">
          </button>
          <button class="btn btn-sm btn-outline-danger btn-excluir-favorito" title="Remover dos Favoritos">
            <img src="/img/lixeira.png" alt="Excluir" style="width: 20px;">
          </button>
        </div>
      </div>
    `;
    return card;
  }

  // Função para carregar e renderizar os itens favoritos
  async function carregarErenderizarFavoritos() {
    const clienteId = getClienteId();
    if (!clienteId) {
      if (favoritosContainer)
        favoritosContainer.innerHTML =
          '<p class="text-center">Você precisa estar logado para ver seus favoritos. <a href="login.html">Faça login</a></p>';
      return;
    }

    if (!favoritosContainer) {
      console.error("Container de favoritos não encontrado no DOM.");
      return;
    }
    favoritosContainer.innerHTML =
      "<p class='text-center'>Carregando favoritos...</p>";

    try {
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

      favoritosContainer.innerHTML = "";

      if (
        favoritos.success === false ||
        !Array.isArray(favoritos) ||
        favoritos.length === 0 ||
        favoritos.error
      ) {
        favoritosContainer.innerHTML = `<p class='text-center'>${
          favoritos.message || "Nenhum item favorito encontrado."
        }</p>`;
        return;
      }

      favoritos.forEach((favorito) => {
        // Verifica se o favorito tem id_pizza, pois é crucial para a deleção
        if (
          typeof favorito.id_pizza === "undefined" ||
          favorito.id_pizza === null
        ) {
          console.warn("Item favorito recebido sem id_pizza:", favorito);
          return; // Pula este item
        }
        const card = criarCardFavorito(favorito);
        favoritosContainer.appendChild(card);
      });

      adicionarListenersBotoesFavoritos();
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      favoritosContainer.innerHTML = `<p class='text-center text-danger'>Erro ao carregar os favoritos. ${error.message}</p>`;
    }
  }

  // Função para excluir um favorito
  async function excluirFavoritoAPI(idPizza) {
    // Recebe id_pizza (ID do produto)
    const clienteId = getClienteId();
    if (!clienteId || !idPizza) {
      alert("Não foi possível remover o favorito. Dados incompletos.");
      return false;
    }

    console.log(
      `API: Tentando excluir favorito: cliente_id=${clienteId}, pizza_id=${idPizza} via ${urlDeleteFavorito}`
    );
    try {
      const response = await fetch(
        `${urlDeleteFavorito}?cliente_id=${clienteId}&pizza_id=${idPizza}`,
        {
          method: "GET", // API espera GET
        }
      );

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResult = await response.text();
        console.warn(
          `Resposta da API de Delete Favorito não é JSON (Status: ${
            response.status
          }). Texto: ${textResult.substring(0, 100)}`
        );
        data = {
          success: false,
          message: `Resposta inesperada do servidor (Status: ${response.status}). Verifique o console para detalhes.`,
        };
      }

      console.log("Resposta da API de Delete Favorito:", data);

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
      console.error("Erro de comunicação ao excluir favorito:", error);
      alert("Erro de comunicação ao excluir favorito.");
      return false;
    }
  }

  // Função para adicionar item favorito ao carrinho (placeholder)
  async function adicionarFavoritoAoCarrinho(idPizza, nomePizza) {
    alert(
      `Funcionalidade "Comprar Novamente" para "${nomePizza}" (ID Produto: ${idPizza}) precisa ser implementada com mais detalhes (seleção de tamanho/preço e chamada à API de registro de item no pedido).`
    );
  }

  // Adiciona listeners aos botões dos cards de favoritos
  function adicionarListenersBotoesFavoritos() {
    document
      .querySelectorAll(".item-favorito .btn-comprar-novamente")
      .forEach((btn) => {
        const card = btn.closest(".item-favorito");
        const idPizza = card.dataset.idPizza;
        const nomePizzaElement = card.querySelector(".card-title b"); // Encontra o elemento do nome
        const nomePizza = nomePizzaElement
          ? nomePizzaElement.textContent
          : "Produto Favorito"; // Fallback se não encontrar

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () =>
          adicionarFavoritoAoCarrinho(idPizza, nomePizza)
        );
      });

    document
      .querySelectorAll(".item-favorito .btn-excluir-favorito")
      .forEach((btn) => {
        const card = btn.closest(".item-favorito");
        const idPizza = card.dataset.idPizza; // A API de delete espera o ID do produto/pizza

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", async () => {
          if (
            confirm("Tem certeza que deseja remover este item dos favoritos?")
          ) {
            if (await excluirFavoritoAPI(idPizza)) {
              // Passa idPizza
              carregarErenderizarFavoritos(); // Recarrega a lista
            }
          }
        });
      });
  }

  // --- Inicialização ---
  carregarErenderizarFavoritos();
});
