async function carregarProduto() {

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  try {

    const res = await api(`/produtos/${id}`);
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
  const botao = document.getElementById("btnAdicionarCarrinho");
  const inputQtd = document.getElementById("quantidadeProduto");

  const estoque = Number(produto.quantidade) || 0;

  /* BOTÃO DISPONIBILIDADE */

  if (botao && estoque <= 0) {

    botao.disabled = true;
    botao.innerText = "Produto indisponível";

  }

  /* LIMITAR QUANTIDADE */

  if (inputQtd) {
    inputQtd.max = estoque;
  }

  /* NOME */

  if (nomeEl) {
    nomeEl.innerText = produto.nome;
  }

  /* PREÇO */

  if (precoEl) {

    const preco = Number(produto.preco);

    precoEl.innerText = preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    /* PARCELAMENTO */

    const parcelas = document.createElement("p");

    const valorParcela = preco / 12;

    parcelas.innerHTML =
      `ou 12x de <strong>${valorParcela.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}</strong> <span class="sem-juros">sem juros</span>`;

    precoEl.after(parcelas);

  }

  /* DESCRIÇÃO */

  if (descricaoEl) {
    descricaoEl.innerText = produto.descricao || "Sem descrição";
  }

  /* ESTOQUE */

  if (estoqueEl) {

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
    imagemPrincipal.src = produto.imagem || window.SEM_IMAGEM_FALLBACK;
    imagemPrincipal.onerror = function () {
      this.onerror = null;
      this.src = window.SEM_IMAGEM_FALLBACK;
    };
  }

  /* MINIATURAS */

  const miniaturas = document.getElementById("miniaturas");

  if (!miniaturas) return;

  miniaturas.innerHTML = "";

  const imagens = produto.imagens || [produto.imagem];

  imagens.forEach((src, index) => {

    const img = document.createElement("img");

    img.src = src || window.SEM_IMAGEM_FALLBACK;
    img.onerror = function () {
      this.onerror = null;
      this.src = window.SEM_IMAGEM_FALLBACK;
    };

    img.addEventListener("click", () => {
      imagemPrincipal.src = img.src;
    });

    miniaturas.appendChild(img);

    if (index === 0 && imagemPrincipal) {
      imagemPrincipal.src = img.src;
    }

  });

}


/* BOTÃO ADICIONAR CARRINHO */

const btnAdicionarCarrinho = document.getElementById("btnAdicionarCarrinho");

if (btnAdicionarCarrinho) {

  btnAdicionarCarrinho.addEventListener("click", () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const qtd = Number(document.getElementById("quantidadeProduto").value) || 1;

    adicionarAoCarrinho(id, btnAdicionarCarrinho, qtd);

  });

}


/* CONTROLE DE QUANTIDADE */

const inputQtd = document.getElementById("quantidadeProduto");
const btnMais = document.getElementById("aumentarQtd");
const btnMenos = document.getElementById("diminuirQtd");

if (btnMais) {

  btnMais.onclick = () => {

    const max = Number(inputQtd.max) || 1;
    const atual = Number(inputQtd.value);

    if (atual < max) {
      inputQtd.value = atual + 1;
    }

  };

}

if (btnMenos) {

  btnMenos.onclick = () => {

    if (inputQtd.value > 1) {
      inputQtd.value = Number(inputQtd.value) - 1;
    }

  };

}


carregarProduto();