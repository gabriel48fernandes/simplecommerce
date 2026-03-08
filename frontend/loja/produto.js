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


function mostrarProduto(produto){

document.getElementById("nomeProduto").innerText = produto.nome;

document.getElementById("precoProduto").innerText =
Number(produto.preco).toLocaleString("pt-BR", {
style: "currency",
currency: "BRL"
});

document.getElementById("descricaoProduto").innerText =
produto.descricao || "Sem descrição";

document.getElementById("estoqueProduto").innerText =
produto.estoque;


/* IMAGEM PRINCIPAL */

const imagemPrincipal =
document.getElementById("imagemPrincipal");

imagemPrincipal.src =
produto.imagem || "https://via.placeholder.com/400";


/* MINIATURA */

const miniaturas =
document.getElementById("miniaturas");

miniaturas.innerHTML = "";

const img = document.createElement("img");

img.src =
produto.imagem || "https://via.placeholder.com/100";

img.onclick = () => {

imagemPrincipal.src = img.src;

};

miniaturas.appendChild(img);

}

carregarProduto();