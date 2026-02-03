const container = document.getElementById("produtos");

async function carregarProdutos() {
    try {
        const response = await fetch("/produtos");

        if (!response.ok) {
            throw new Error("Erro ao buscar produtos");
        }

        const produtos = await response.json();

        produtos.forEach(produto => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
  <img src="${produto.imagem}" alt="${produto.nome}">
  <h3>${produto.nome}</h3>
  <p class="preco">R$ ${produto.preco}</p>
  <button>Ver produto</button>
`;


            container.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

async function carregarCategorias() {
  const res = await fetch("/categorias");
  const categorias = await res.json();

  const container = document.getElementById("categorias");

  categorias.forEach(cat => {
    const card = document.createElement("div");
    card.className = "categoria-card";

    card.innerHTML = `
      <img src="${cat.imagem_url}" alt="${cat.nome}">
      <span>${cat.nome}</span>
    `;

    container.appendChild(card);
  });
}

carregarCategorias();


carregarProdutos();
