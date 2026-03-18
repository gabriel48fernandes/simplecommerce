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
    window.location.href = "/login.html";
    return;
  }

  try {

    const res = await api(`/carrinho/${auth.usuario.id}`);

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

      const preco = Number(item.preco);
      const quantidade = Number(item.quantidade);
      const subtotal = preco * quantidade;

      total += subtotal;

      lista.innerHTML += `

        <div class="item-carrinho">

          <img class="item-img" src="${item.imagem}" />

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

  const res = await api("/frete/calcular", {
    method: "POST",
    body: JSON.stringify({ cepDestino: cep })
  });

  const opcoes = await res.json();

  const div = document.getElementById("opcoes-frete");

  if (!div) return;

  div.innerHTML = "";

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

}

// ============================
// ALTERAR QUANTIDADE
// ============================
async function alterarQtd(id, delta) {

  try {

    await api(`/carrinho/item/${id}/quantidade`, {
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

    await api(`/carrinho/item/${id}`, {
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
  console.log("iniciarPagamento() chamado");
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

    document.getElementById("toastPedido").classList.add("mostrar");
    setTimeout(() => {
      document.getElementById("toastPedido").classList.remove("mostrar");
    }, 3000);


    pedidoAtual = pedido.pedido_id;

    if (forma === "pix") {
      if (!pedido.total || Number.isNaN(Number(pedido.total))) {
        alert("Não foi possível calcular o valor do pedido para gerar o PIX.");
        return;
      }

      await gerarPix(pedidoAtual, pedido.total);

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

  console.log("pedidoAtual:", pedidoAtual);

  const res = await api(`/pedidos/confirmar-pagamento/${pedidoAtual}`, {
    method: "PUT"
  });

  const text = await res.text();

  console.log("Resposta do servidor:", text);

}
// ============================
// FINALIZAR COMPRA
// ============================

async function finalizarCompra() {

  const auth = JSON.parse(localStorage.getItem("auth"));
  const cep = document.getElementById("cep").value;
  const formaPagamento = document.getElementById("formaPagamento").value;

  if (!auth) {
    window.location.href = "/login.html";
    return;
  }

  const res = await api("/pedidos/finalizar", {
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
    const res = await api("/pagamento/pix", {
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