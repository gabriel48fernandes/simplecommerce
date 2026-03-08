async function carregarProduto() {

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  try {

    const res = await fetch(`/produtos/${id}`);
    const produto = await res.json();

    mostrarProduto(produto);

  } catch (err) {

    console.error("Erro ao carregar produto:", err);

  }

}


function mostrarProduto(produto) {

  const nomeEl = document.getElementById("nomeProduto");
  const precoEl = document.getElementById("precoProduto");
  const descricaoEl = document.getElementById("descricaoProduto");
  const estoqueEl = document.getElementById("estoqueProduto");

  if (nomeEl) {
    nomeEl.innerText = produto.nome;
  }

  if (precoEl) {
    precoEl.innerText = Number(produto.preco).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  if (descricaoEl) {
    descricaoEl.innerText = produto.descricao || "Sem descrição";
  }

  if (estoqueEl) {

    const estoque = Number(produto.quantidade) || 0;

    if (estoque > 0) {

      estoqueEl.innerText = estoque + " unidades disponíveis";
      estoqueEl.classList.add("estoque-ok");

    } else {

      estoqueEl.innerText = "Produto indisponível";
      estoqueEl.classList.add("estoque-zero");

    }

  }

  /* IMAGEM PRINCIPAL */

  const imagemPrincipal = document.getElementById("imagemPrincipal");

  if (imagemPrincipal) {
    imagemPrincipal.src = produto.imagem || "https://via.placeholder.com/400";
  }

  /* MINIATURAS */

  const miniaturas = document.getElementById("miniaturas");

  if (!miniaturas) return;

  miniaturas.innerHTML = "";

  const imagens = produto.imagens || [produto.imagem];

  imagens.forEach((src, index) => {

    const img = document.createElement("img");

    img.src = src || "https://via.placeholder.com/100";

    img.addEventListener("click", () => {
      imagemPrincipal.src = img.src;
    });

    miniaturas.appendChild(img);

    if (index === 0 && imagemPrincipal) {
      imagemPrincipal.src = img.src;
    }

  });

}

  carregarProduto();