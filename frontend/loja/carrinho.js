let pedidoAtual = null;
let freteSelecionado = 0;
let subtotalCarrinho = 0;
let transportadoraSelecionada = "";
let prazoSelecionado = 0;

function abrirCarrinho() {
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");

  if (overlay) overlay.classList.add("open");
  if (drawer) drawer.classList.add("open");

  carregarCarrinho();
}

function fecharCarrinho() {
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");

  if (overlay) overlay.classList.remove("open");
  if (drawer) drawer.classList.remove("open");
}

// ============================
// CARREGAR CARRINHO
// ============================
async function carregarCarrinho() {

  const lista = document.getElementById("lista-carrinho");
  const totalElemento = document.getElementById("total-carrinho");
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!lista || !totalElemento) {
    console.log("carrinho ainda nao existe na pagina")
    return;
  }

  if (!auth) {
    // Se não logado, mostra carrinho vazio
    lista.innerHTML = `
      <div class="carrinho-vazio">
        <p>Seu carrinho está vazio 😢</p>
        <p>Faça login para ver seus itens salvos.</p>
      </div>
    `;
    totalElemento.innerText = "Total: R$ 0,00";
    return;
  }

  try {

    const res = await api(`${API_URL}/carrinho/${auth.usuario.id}`);

    if (!res.ok) {
      throw new Error("Erro ao buscar carrinho");
    }

    const itens = await res.json();

    lista.innerHTML = "";

    let total = 0;

    if (!itens || itens.length === 0) {

      lista.innerHTML = `
        <div class="carrinho-vazio">
          <p>Seu carrinho está vazio 😢</p>
        </div>
      `;

      totalElemento.innerText = "Total: R$ 0,00";
      return;
    }

    itens.forEach(item => {

      const preco = Number(item.preco_final || item.preco);
      const quantidade = Number(item.quantidade);
      const subtotal = preco * quantidade;

      total += subtotal;

      // 🔥 Garantir que imagem tem fallback
      const imagemUrl = item.imagem || window.SEM_IMAGEM_FALLBACK;

      lista.innerHTML += `

        <div class="item-carrinho">

          <img class="item-img" src="${imagemUrl}" onerror="this.onerror=null; this.src=window.SEM_IMAGEM_FALLBACK" />

          <div class="item-info">

            <h3>${item.nome}</h3>

            <p class="item-preco">
              ${preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}
            </p>

            <div class="item-quantidade">

              <button onclick="alterarQtd(${item.id}, -1)">-</button>

              <span>${quantidade}</span>

              <button onclick="alterarQtd(${item.id}, 1)">+</button>

            </div>

          </div>

          <div class="item-right">

            <p class="item-subtotal">
              ${subtotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}
            </p>

            <button 
              class="btn-remover"
              onclick="removerItem(${item.id})">
              Remover
            </button>

          </div>

        </div>

      `;

    });

    // salva subtotal
    subtotalCarrinho = total;

    atualizarTotal();

  } catch (error) {

    console.error("Erro ao carregar carrinho:", error);

    lista.innerHTML = `
      <p>Erro ao carregar carrinho 😢</p>
    `;
  }

}

// ============================
// CALCULAR FRETE
// ============================
async function calcularFrete() {

  const cep = document.getElementById("cep").value;

  try {

    const res = await api(`${API_URL}/frete/calcular`, {
      method: "POST",
      body: JSON.stringify({ cepDestino: cep })
    });

    const opcoes = await res.json();

    console.log("FRETE RETORNO:", opcoes);

    const div = document.getElementById("opcoes-frete");

    if (!div) return;

    div.innerHTML = "";

    // 🔥 VALIDA ARRAY
    if (!Array.isArray(opcoes)) {

      div.innerHTML = `
        <p>Erro ao calcular frete</p>
      `;

      console.error("Frete inválido:", opcoes);

      return;
    }

    opcoes.forEach(opcao => {

      const preco = parseFloat(opcao.preco);

      const elemento = document.createElement("div");

      elemento.classList.add("frete-opcao");

      elemento.innerHTML = `
        <strong>${opcao.transportadora}</strong><br>
        ${opcao.servico}<br>
        ${preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}<br>
        ${opcao.prazo} dias
      `;

      elemento.onclick = () => {

        freteSelecionado = preco;
        transportadoraSelecionada = opcao.transportadora;
        prazoSelecionado = opcao.prazo;

        atualizarTotal();

        document.querySelectorAll(".frete-opcao")
          .forEach(el => el.classList.remove("frete-ativo"));

        elemento.classList.add("frete-ativo");

      };

      div.appendChild(elemento);

    });

  } catch (error) {

    console.error("Erro no frete:", error);

  }

}

// ============================
// ALTERAR QUANTIDADE
// ============================
async function alterarQtd(id, delta) {

  try {

    await api(`${API_URL}/carrinho/item/${id}/quantidade`, {
      method: "PUT",
      body: JSON.stringify({
        delta: delta
      })
    });

    carregarCarrinho();

  } catch (error) {

    console.error("Erro ao alterar quantidade:", error);

  }

}

// ============================
// REMOVER ITEM
// ============================
async function removerItem(id) {

  try {

    await api(`${API_URL}/carrinho/item/${id}`, {
      method: "DELETE"
    });

    carregarCarrinho();

  } catch (error) {

    console.error("Erro ao remover item:", error);

  }

}

// ============================
// ATUALIZAR TOTAL
// ============================
function atualizarTotal() {

  const total = subtotalCarrinho + freteSelecionado;

  const totalElement = document.getElementById("total-carrinho");

  totalElement.innerText =
    `Total: ${total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })}`;
}

// ============================
// INICIAR PAGAMENTO
// ============================
async function iniciarPagamento() {
  try {
    if (freteSelecionado === 0) {
      const continuar = confirm(
        "Você não selecionou frete. Deseja continuar sem frete?"
      );
      if (!continuar) return;
    }

    const formaEl = document.getElementById("formaPagamento");
    const forma = formaEl ? formaEl.value : "pix";

    const pedido = await finalizarCompra();

    if (!pedido) return;

    const toastPedido = document.getElementById("toastPedido");
    if (toastPedido) toastPedido.classList.add("mostrar");
    setTimeout(() => {
      if (toastPedido) toastPedido.classList.remove("mostrar");
    }, 3000);


    pedidoAtual = pedido.pedido_id;

    if (forma === "pix") {

  const valorFinal = Number(
    (subtotalCarrinho + freteSelecionado).toFixed(2)
  );

  console.log("VALOR PIX:", valorFinal);

  if (!valorFinal || Number.isNaN(valorFinal)) {
    alert("Valor inválido para gerar PIX");
    return;
  }

  await gerarPix(pedidoAtual, valorFinal);

    } else {
      alert("Pedido realizado com sucesso!");
      window.location.href = "/meus-pedidos.html";
    }
  } catch (error) {
    console.error("Erro ao iniciar pagamento:", error);
    alert("Erro ao iniciar pagamento. Veja o console para mais detalhes.");
  }
}

function initCarrinhoDrawer() {
  const formaEl = document.getElementById("formaPagamento");
  const pixArea = document.getElementById("pagamento-pix");

  if (!formaEl || !pixArea) return;

  formaEl.addEventListener("change", () => {
    pixArea.style.display = formaEl.value === "pix" ? "flex" : "none";
  });
}

// ============================
// INIT
// ============================

initCarrinhoDrawer();
// ============================
// CONFIRMAR PAGAMENTO PIX
// ============================


async function confirmarPagamentoPix() {

  const res = await api(`${API_URL}/pedidos/confirmar-pagamento/${pedidoAtual}`, {
    method: "PUT"
  });

  const data = await res.json();

  if (!res.ok) {
    alert("Erro ao confirmar pagamento: " + data.erro);
    return;
  }

  alert("Pagamento confirmado com sucesso!");
  window.location.href = "/meus-pedidos.html";

}
// ============================
// FINALIZAR COMPRA
// ============================

async function finalizarCompra() {

  const auth = JSON.parse(localStorage.getItem("auth"));
  const cep = document.getElementById("cep").value.trim();
  const formaPagamento = document.getElementById("formaPagamento").value;

  if (!auth) {
    window.location.href = "/login.html";
    return;
  }

  if (!cep) {
    alert("⚠️ Por favor, preencha o CEP");
    return null;
  }

  const res = await api(`${API_URL}/pedidos/finalizar`, {
    method: "POST",
    body: JSON.stringify({
      usuario_id: auth.usuario.id,
      frete: freteSelecionado,
      transportadora: transportadoraSelecionada,
      prazo: prazoSelecionado,
      cep: cep,
      forma_pagamento: formaPagamento,
      status_pagamento: "pendente"
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro);
    return null;
  }

  return data;

}


// ============================
// GERAR PIX
// ============================


async function gerarPix(pedidoId, valor) {
  try {
    const res = await api(`${API_URL}/pagamento/pix`, {
      method: "POST",
      body: JSON.stringify({
        pedido_id: pedidoId,
        valor: valor,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const erro = data?.erro || "Não foi possível gerar o PIX";
      throw new Error(erro);
    }

    const data = await res.json();

    const pixArea = document.getElementById("pagamento-pix");
    const qrImg = document.getElementById("pix-qrcode");
    const copiaCola = document.getElementById("pix-copia-cola");

    if (pixArea) pixArea.style.display = "flex";
    if (qrImg) qrImg.src = `data:image/png;base64,${data.qr_code_base64}`;
    if (copiaCola) copiaCola.value = data.qr_code;

    document.querySelectorAll(".frete-box").forEach(el => (el.style.display = "none"));
    const cartFooter = document.querySelector(".cart-footer");
    if (cartFooter) cartFooter.style.display = "none";
    const lista = document.getElementById("lista-carrinho");
    if (lista) lista.style.display = "none";

  } catch (error) {
    console.error("Erro ao gerar PIX:", error);
    alert("Não foi possível gerar o PIX. Veja o console para mais detalhes.");
  }
}

// ============================
// INIT
// ============================