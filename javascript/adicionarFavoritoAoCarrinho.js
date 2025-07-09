async function adicionarFavoritoAoCarrinho({
  cliente_id,
  produto_id,
  nome_pizza,
  tipo_pizza = "inteira",
  tamanho = "media", // 'pequena', 'media', 'grande', 'media_inteira', etc.
}) {
  try {
    // Obtem todos os produtos
    const response = await fetch("/api_mobile/api_get_produtos.php");
    const produtos = await response.json();

    // Localiza o produto correspondente
    const produto = produtos.find((p) => p.produto_id === String(produto_id));
    if (!produto) {
      alert("Produto favorito não encontrado.");
      return;
    }

    // Captura o preço conforme o tamanho escolhido
    const preco = produto[tamanho];
    if (!preco) {
      alert("Tamanho selecionado não está disponível para esse produto.");
      return;
    }

    // Prepara os dados para envio
    const payload = {
      cliente_id: parseInt(cliente_id),
      pizza_id: parseInt(produto_id),
      preco: parseFloat(preco),
      nome_pizza: nome_pizza,
      tipo_pizza: tipo_pizza,
    };

    // Envia os dados para a API que registra no carrinho
    const resposta = await fetch("/api_mobile/api_registrar_carrinho.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resultado = await resposta.json();

    if (resultado.success) {
      alert("Pizza adicionada ao carrinho com sucesso!");
    } else {
      alert("Erro: " + resultado.message);
    }
  } catch (erro) {
    console.error("Erro ao adicionar ao carrinho:", erro);
    alert("Erro ao tentar adicionar a pizza ao carrinho.");
  }
}
