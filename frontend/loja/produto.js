// ==========================================
// PRODUTO - CARREGAMENTO E RENDERIZAÇÃO
// ==========================================
// Este arquivo gerencia o carregamento dinâmico de dados do produto
// e renderiza variações, estoque e imagens com base na resposta da API

// Estado global do produto
let produtoAtual = null;
let variacoesSelecionadas = {};


function mostrarLoadingProduto() {
  const nome = document.getElementById("nomeProduto");
  const preco = document.getElementById("precoProduto");

  if (nome) nome.innerText = "Carregando produto...";
  if (preco) preco.innerText = "Aguarde...";
  if (imagemPrincipal) imagemPrincipal.src = window.SEM_IMAGEM_FALLBACK;
}

async function carregarProduto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  // 🔥 MOSTRA LOADING ANTES DE BUSCAR
  mostrarLoadingProduto();

  try {
    const res = await api(`/produtos/${id}`);
    const data = await res.json();

    produtoAtual = data.produto || data;

    // 🔥 LIMPA O LOADING
    const container = document.getElementById("produto-container");
    if (container) container.innerHTML = "";

    mostrarProduto(produtoAtual);

  } catch (err) {
    console.error("Erro ao carregar produto:", err);

    const container = document.getElementById("produto-container");
    if (container) {
      container.innerHTML = `<p>❌ Erro ao carregar produto</p>`;
    }
  }
}

function mostrarProduto(produto) {
  if (!produto) return;

  const nomeEl = document.getElementById("nomeProduto");
  const precoEl = document.getElementById("precoProduto");
  const descricaoEl = document.getElementById("descricaoProduto");
  const estoqueEl = document.getElementById("estoqueProduto");

  // NOME
  if (nomeEl) nomeEl.innerText = produto.nome || "";

  // PREÇO
  if (precoEl) {
    precoEl.innerHTML = "";

    const preco = Number(produto.preco) || 0;
    const temPromocao = produto.tem_promocao === true || produto.tem_promocao === 1;
    const precoPromo = Number(produto.preco_promocional) || 0;

    if (temPromocao && precoPromo > 0) {
      precoEl.innerHTML = `
        <span class="preco-antigo">${preco.toLocaleString("pt-BR", {style:"currency",currency:"BRL"})}</span>
        <span class="preco-promocional">${precoPromo.toLocaleString("pt-BR", {style:"currency",currency:"BRL"})}</span>
      `;
    } else {
      precoEl.innerText = preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
    }
  }

  // DESCRIÇÃO
  if (descricaoEl) descricaoEl.innerText = produto.descricao || "Sem descrição";

  // IMAGENS - renderizar miniaturas
  renderizarImagens(produto);

  // VARIAÇÕES - renderizar dinamicamente
  renderizarVariacoes(produto);

  // ESTOQUE INICIAL
  atualizarEstoque(produto);
}

// ==========================================
// IMAGENS
// ==========================================

function renderizarImagens(produto) {
  const miniaturas = document.getElementById("miniaturas");
  const imagemPrincipal = document.getElementById("imagemPrincipal");

  if (!miniaturas || !imagemPrincipal) return;

  miniaturas.innerHTML = "";

  // 🔥 Usar array de imagens da API
  let imagens = produto.imagens || [];
  
  // Fallback para imagem única se não houver array
  if ((!imagens || imagens.length === 0) && produto.imagem) {
    imagens = [{ url: produto.imagem, principal: true }];
  }

  // Se ainda não temos imagens, usar placeholder
  if (!imagens || imagens.length === 0) {
    imagens = [{ url: window.SEM_IMAGEM_FALLBACK, principal: true }];
  }

  imagens.forEach((img, index) => {
    const src = img.url || img || window.SEM_IMAGEM_FALLBACK;
    const imgEl = document.createElement("img");
    imgEl.src = src;
    imgEl.alt = `Miniatura ${index + 1}`;
    imgEl.onerror = function() {
      this.onerror = null;
      this.src = window.SEM_IMAGEM_FALLBACK;
    };
    
    miniaturas.appendChild(imgEl);
  });

  // Mostrar primeira imagem por padrão
  if (imagens.length > 0) {
    // Procurar pela imagem principal se existir
    const imgPrincipal = imagens.find(img => img.principal === true || img.principal === 1);
    const firstImg = imgPrincipal || imagens[0];
    const firstSrc = firstImg?.url || firstImg || window.SEM_IMAGEM_FALLBACK;
    
    imagemPrincipal.src = firstSrc;
    imagemPrincipal.onerror = function() {
      this.onerror = null;
      this.src = window.SEM_IMAGEM_FALLBACK;
    };
  } else {
    imagemPrincipal.src = window.SEM_IMAGEM_FALLBACK;
  }
}

// ==========================================
// VARIAÇÕES DINÂMICAS
// ==========================================
// 
// Agrupa variações por tipo e renderiza botões dinamicamente
// Exemplo: [{ tipo: "tamanho", valor: "P" }, { tipo: "cor", valor: "Vermelho" }]
// Resultado: { tamanho: [...], cor: [...] }

function renderizarVariacoes(produto) {
  const container = document.getElementById("variacoesContainer");
  if (!container) return;

  container.innerHTML = "";

  // Agrupar variações por tipo
  const listaVariacoes = Array.isArray(produto.variacoes)
  ? produto.variacoes
  : [];

const variacoesPorTipo = agruparVariacoesPorTipo(listaVariacoes);

  // Se não há variações, retornar
  if (Object.keys(variacoesPorTipo).length === 0) {
    console.log("Produto sem variações");
    return;
  }

  // Renderizar cada tipo de variação
  Object.keys(variacoesPorTipo).forEach(tipo => {
    const bloco = document.createElement("div");
    bloco.className = "produto-variacao";

    const titulo = document.createElement("h3");
    titulo.innerText = tipo.toUpperCase();
    titulo.className = "variacao-titulo";

    const opcoes = document.createElement("div");
    opcoes.className = "variacao-opcoes";
    opcoes.setAttribute("data-tipo", tipo);

    variacoesPorTipo[tipo].forEach(valor => {
      const btn = document.createElement("button");
      btn.innerText = valor;
      btn.className = "variacao-btn";
      btn.setAttribute("data-tipo", tipo);
      btn.setAttribute("data-valor", valor);

      // Desabilitar se não há estoque
      if (!temEstoque(tipo, valor)) {
        btn.disabled = true;
        btn.classList.add("indisponivel");
      }

      btn.addEventListener("click", () => {
        selecionarVariacao(tipo, valor, opcoes, produto);
      });

      opcoes.appendChild(btn);
    });

    bloco.appendChild(titulo);
    bloco.appendChild(opcoes);
    container.appendChild(bloco);
  });
}

// Agrupar variações por tipo
function agruparVariacoesPorTipo(variacoes) {
  const agrupado = {};

  // 🔥 proteção pra não quebrar
  if (!Array.isArray(variacoes)) {
    console.warn("variacoes inválidas:", variacoes);
    return agrupado;
  }

  variacoes.forEach(v => {
    if (!v) return;

    const tipo = (v.tipo || "").toLowerCase();
    const valor = v.valor;

    if (!tipo || !valor) return;

    if (!agrupado[tipo]) {
      agrupado[tipo] = [];
    }

    if (!agrupado[tipo].includes(valor)) {
      agrupado[tipo].push(valor);
    }
  });

  return agrupado;
}

// Verificar se uma variação tem estoque
function temEstoque(tipo, valor) {
  if (!produtoAtual || !produtoAtual.itens) {
    return true; // Se não há dados de estoque, assumir que tem
  }

  return produtoAtual.itens.some(item => {
    const combinacaoValida = Object.keys(variacoesSelecionadas).every(t => {
      return variacoesSelecionadas[t] === (item[`variacao_${t}`] || item[t]);
    });

    if (!combinacaoValida) return false;

    // Verificar se há estoque para essa combinação
    return item[`variacao_${tipo}`] === valor && item.estoque > 0;
  });
}

// Selecionar uma variação
function selecionarVariacao(tipo, valor, container, produto) {
  // Remover ativo de outros botões do mesmo tipo
  container.querySelectorAll("button").forEach(b => {
    b.classList.remove("ativo");
  });

  // Marcar como ativo
  container.querySelector(`[data-valor="${valor}"]`)?.classList.add("ativo");

  // Atualizar estado
  variacoesSelecionadas[tipo] = valor;

  // Trocar imagem se for "cor"
  if (tipo === "cor" && produto.imagens) {
    const imagemCor = produto.imagens.find(img => img.cor === valor);
    if (imagemCor) {
      document.getElementById("imagemPrincipal").src = imagemCor.url || imagemCor;
    }
  }

  // Atualizar estoque e validações
  atualizarEstoque(produto);
}

// ==========================================
// ESTOQUE E QUANTIDADE
// ==========================================

function atualizarEstoque(produto) {
  const estoqueEl = document.getElementById("estoqueProduto");
  const botao = document.getElementById("btnAdicionarCarrinho");
  const inputQtd = document.getElementById("quantidadeProduto");

  // Calcular estoque disponível para a combinação selecionada
  let estoque = 0;

  if (produto.itens && Object.keys(variacoesSelecionadas).length > 0) {
    // Se há variações selecionadas, usar estoque da combinação
    const item = produto.itens.find(it => {
      return Object.keys(variacoesSelecionadas).every(tipo => {
        return variacoesSelecionadas[tipo] === (it[`variacao_${tipo}`] || it[tipo]);
      });
    });
    estoque = item ? item.estoque : 0;
  } else {
    // Se não há variações, usar estoque geral do produto
    estoque = produto.quantidade || 0;
  }

  // Atualizar elemento de estoque
  if (estoqueEl) {
    if (estoque > 0) {
      estoqueEl.innerText = `${estoque} ${estoque === 1 ? "unidade" : "unidades"} disponível`;
      estoqueEl.classList.remove("estoque-zero");
      estoqueEl.classList.add("estoque-ok");
    } else {
      estoqueEl.innerText = "Produto indisponível";
      estoqueEl.classList.remove("estoque-ok");
      estoqueEl.classList.add("estoque-zero");
    }
  }

  // Atualizar input de quantidade
  if (inputQtd) {
    inputQtd.max = Math.max(estoque, 1);
    inputQtd.value = estoque > 0 ? 1 : 0;
  }

  // Desabilitar botão de compra
  if (botao) {
    botao.disabled = estoque <= 0;
  }
}

// ==========================================
// ADICIONAR AO CARRINHO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const btnAdicionar = document.getElementById("btnAdicionarCarrinho");
  if (btnAdicionar) {
    btnAdicionar.addEventListener("click", () => {
      const id = new URLSearchParams(window.location.search).get("id");
      const qtd = Number(document.getElementById("quantidadeProduto").value) || 1;

      adicionarAoCarrinho(id, null, qtd, variacoesSelecionadas);
    });
  }

  // Botões de quantidade
  const inputQtd = document.getElementById("quantidadeProduto");
  const btnAumentar = document.getElementById("aumentarQtd");
  const btnDiminuir = document.getElementById("diminuirQtd");

  if (btnAumentar) {
    btnAumentar.addEventListener("click", () => {
      if (inputQtd && inputQtd.value < inputQtd.max) {
        inputQtd.value = Number(inputQtd.value) + 1;
      }
    });
  }

  if (btnDiminuir) {
    btnDiminuir.addEventListener("click", () => {
      if (inputQtd && inputQtd.value > 1) {
        inputQtd.value = Number(inputQtd.value) - 1;
      }
    });
  }
});

// Carregar produto ao abrir a página
carregarProduto();