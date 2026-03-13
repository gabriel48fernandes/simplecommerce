const lista = document.getElementById("lista-carrinho");
const totalElemento = document.getElementById("total-carrinho");
let pedidoAtual = null;
let freteSelecionado = 0;
let subtotalCarrinho = 0;
let transportadoraSelecionada = "";
let prazoSelecionado = 0;
// ============================
// CARREGAR CARRINHO
// ============================
async function carregarCarrinho() {

  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth) {
    window.location.href = "/login.html";
    return;
  }

  try {

    const res = await fetch(`/carrinho/${auth.usuario.id}`);

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

  const res = await fetch("/frete/calcular", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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

    await fetch(`/carrinho/item/${id}/quantidade`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
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

    await fetch(`/carrinho/item/${id}`, {
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

  if (freteSelecionado === 0) {

  alert("Calcule e selecione um frete primeiro.");

  return;

}

  const forma = document.getElementById("formaPagamento").value;

  const pedido = await finalizarCompra();

  if (!pedido) return;

  pedidoAtual = pedido.pedido_id;

  if (forma === "pix") {

    await gerarPix(pedidoAtual, pedido.total);

  } else {

    alert("Pedido realizado com sucesso!");
    window.location.href = "/meus-pedidos.html";

  }

}
// ============================
// CONFIRMAR PAGAMENTO PIX
// ============================


async function confirmarPagamentoPix() {

  console.log("pedidoAtual:", pedidoAtual);

  const res = await fetch(`/pedidos/confirmar-pagamento/${pedidoAtual}`, {
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

  const res = await fetch("/pedidos/finalizar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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

  const res = await fetch("/pagamento/pix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pedido_id: pedidoId,
      valor: valor,
    }),
  });

  const data = await res.json();

  document.getElementById("pagamento-pix").style.display = "flex";

  document.getElementById("pix-qrcode").src =
    `data:image/png;base64,${data.qr_code_base64}`;

  document.getElementById("pix-copia-cola").value = data.qr_code;

  document.querySelector(".frete-box").style.display = "none";
  document.querySelector(".carrinho-footer").style.display = "none";
  document.getElementById("lista-carrinho").style.display = "none";

}

// ============================
// INIT
// ============================
carregarCarrinho();