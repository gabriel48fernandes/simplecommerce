// =============================
// PEGAR ID DO PRODUTO DA URL
// =============================
const params = new URLSearchParams(window.location.search)
const id = params.get("id")

// =============================
// CARREGAR PRODUTO
// =============================
async function carregarProduto() {

  if (!id) {
    alert("Produto não encontrado")
    window.location.href = "/"
    return
  }

  try {

    const res = await fetch(`/produtos/${id}`)

    if (!res.ok) {
      throw new Error("Produto não encontrado")
    }

    const produto = await res.json()

    // NOME
    document.getElementById("nomeProduto").innerText = produto.nome

    // IMAGEM
    document.getElementById("imgProduto").src = produto.imagem

    // DESCRIÇÃO
    document.getElementById("descricaoProduto").innerText =
      produto.descricao || "Sem descrição"

    // PREÇO
    if (produto.preco_promocional) {

      document.getElementById("precoOriginal").innerHTML =
        `<s>R$ ${produto.preco}</s>`

      document.getElementById("precoPromocional").innerText =
        `R$ ${produto.preco_promocional}`

    } else {

      document.getElementById("precoPromocional").innerText =
        `R$ ${produto.preco}`

    }

  } catch (error) {

    console.error(error)
    alert("Erro ao carregar produto")

  }

}

// =============================
// BOTÃO ADICIONAR AO CARRINHO
// =============================
async function adicionarCarrinho() {

  const auth = JSON.parse(localStorage.getItem("auth"))

  if (!auth) {
    window.location.href = "/login.html"
    return
  }

  try {

    const res = await fetch("/carrinho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        produto_id: id,
        quantidade: 1
      })
    })

    if (!res.ok) {
      throw new Error("Erro ao adicionar ao carrinho")
    }

    alert("Produto adicionado ao carrinho")

  } catch (error) {

    console.error(error)
    alert("Erro ao adicionar produto")

  }

}

// =============================
// EVENTO DO BOTÃO
// =============================
document
  .getElementById("btnComprar")
  .addEventListener("click", adicionarCarrinho)


// =============================
// INICIAR PÁGINA
// =============================
carregarProduto()