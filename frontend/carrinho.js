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
      lista.innerHTML = "<p>Carrinho vazio 😢</p>";
      totalElemento.innerText = "Total: R$ 0,00";
      return;
    }

    itens.forEach(item => {
      total += Number(item.preco);

      lista.innerHTML += `
        <div class="item-carrinho">
          <img src="${item.imagem}" />

          <div class="item-info">
            <h3>${item.nome}</h3>
            <p>
              ${Number(item.preco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
              })}
            </p>
          </div>

          <div class="item-actions">
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
    lista.innerHTML = "<p>Erro ao carregar carrinho 😢</p>";
  }
}

// ============================
// REMOVER ITEM
// ============================
async function removerItem(id) {
  try {
    await fetch(`/carrinho/remove/${id}`, {
      method: "DELETE"
    });

    carregarCarrinho();
  } catch (error) {
    console.error("Erro ao remover item:", error);
  }
}

// ============================
// FINALIZAR COMPRA (placeholder)
// ============================
function finalizarCompra() {
  alert("Em breve integração com pagamento 💳");
}

// ============================
// INIT
// ============================
carregarCarrinho();