const lista = document.getElementById("lista-carrinho");
const totalElemento = document.getElementById("total-carrinho");

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

    totalElemento.innerText =
      "Total: " +
      total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });

  } catch (error) {

    console.error("Erro ao carregar carrinho:", error);

    lista.innerHTML = `
      <p>Erro ao carregar carrinho 😢</p>
    `;
  }

}
let frete = 0;

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
  div.innerHTML = "";

  opcoes.forEach(opcao => {

    div.innerHTML += `
      <div class="frete-opcao">

        <strong>${opcao.transportadora}</strong>
        <br>

        ${opcao.servico}
        <br>

        R$ ${opcao.preco}
        <br>

        ${opcao.prazo} dias

      </div>
    `;

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
function atualizarTotal() {

  const totalTexto = totalElemento.innerText
    .replace("Total: R$", "")
    .replace(".", "")
    .replace(",", ".");

  const totalCarrinho = parseFloat(totalTexto);

  const totalFinal = totalCarrinho + frete;

  totalElemento.innerText =
    "Total: " +
    totalFinal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

}

// ============================
// FINALIZAR COMPRA
// ============================
async function finalizarCompra() {

  const auth = JSON.parse(localStorage.getItem("auth"));

  try {

    const res = await fetch("/pedidos/finalizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario_id: auth.usuario.id
      })
    });

    const data = await res.json();

    if (res.ok) {

      alert("Pedido realizado com sucesso 🎉");

      window.location.reload();

    } else {

      alert(data.erro);

    }

  } catch (error) {

    console.error("Erro ao finalizar pedido:", error);

  }

}

// ============================
// INIT
// ============================
carregarCarrinho();