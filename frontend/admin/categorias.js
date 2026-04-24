// ============================================
// CATEGORIAS — Módulo Admin
// CRUD completo + upload Supabase + fallback
// ============================================

import { api } from "./utils.js"
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase = createClient(
  "https://fcknvwqerkyujhquugls.supabase.co",
  "sb_publishable_c-_9HXFPIQLd56o_2bixfw_oh-bMdXZ"
)

// ----------------------------------------
//  Estado
// ----------------------------------------
let categoriaEditandoId = null

// ----------------------------------------
//  Refs DOM
// ----------------------------------------
const modalCategoria      = () => document.getElementById("modalCategoria")
const formCategoria       = () => document.getElementById("form-categoria")
const inputNome           = () => document.getElementById("cat-nome")
const inputImagem         = () => document.getElementById("cat-imagem")
const previewArea         = () => document.getElementById("cat-preview-area")
const previewImg          = () => document.getElementById("cat-preview-img")
const previewNome         = () => document.getElementById("cat-preview-nome")
const fallbackArea        = () => document.getElementById("cat-fallback-area")
const fallbackCircle      = () => document.getElementById("cat-fallback-circle")
const gridCategorias      = () => document.getElementById("grid-categorias")

// ----------------------------------------
//  Inicialização
// ----------------------------------------
export function inicializarCategorias() {
  // Fechar modal pelos botões
  document.getElementById("btnFecharCategoria").onclick  = fecharModalCategoria
  document.getElementById("btnCancelarCategoria").onclick = fecharModalCategoria

  // Fechar clicando fora
  modalCategoria().addEventListener("click", (e) => {
    if (e.target === modalCategoria()) fecharModalCategoria()
  })

  // Preview de imagem ao selecionar arquivo
  inputImagem().addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        previewImg().src = ev.target.result
        previewNome().textContent = file.name
        previewArea().style.display  = "block"
        fallbackArea().style.display = "none"
      }
      reader.readAsDataURL(file)
    }
  })

  // Atualiza fallback com a inicial ao digitar o nome
  inputNome().addEventListener("input", () => {
    atualizarFallbackVisual(inputNome().value)
  })

  // Submit do form
  formCategoria().addEventListener("submit", salvarCategoria)

  // Expõe a função de abrir para o admin.js / admin.html
  window.abrirModalCategoria   = () => abrirModal()
  window.editarCategoria       = (cat) => abrirModal(cat)
  window.excluirCategoriaPor   = (id) => excluirCategoria(id)
}

// ----------------------------------------
//  Abrir / Fechar Modal
// ----------------------------------------
function abrirModal(categoria = null) {
  categoriaEditandoId = null
  formCategoria().reset()
  previewArea().style.display  = "none"
  fallbackArea().style.display = "none"

  if (categoria) {
    categoriaEditandoId = categoria.id
    inputNome().value   = categoria.nome

    document.getElementById("tituloModalCategoria").textContent = "Editar Categoria"

    if (categoria.imagem_url) {
      previewImg().src             = categoria.imagem_url
      previewNome().textContent    = "Imagem atual"
      previewArea().style.display  = "block"
    } else {
      atualizarFallbackVisual(categoria.nome)
      fallbackArea().style.display = "block"
    }
  } else {
    document.getElementById("tituloModalCategoria").textContent = "Nova Categoria"
  }

  modalCategoria().classList.add("active")
}

function fecharModalCategoria() {
  modalCategoria().classList.remove("active")
  formCategoria().reset()
  previewArea().style.display  = "none"
  fallbackArea().style.display = "none"
  categoriaEditandoId = null
}

// ----------------------------------------
//  Fallback visual: mostra a inicial do nome
// ----------------------------------------
function atualizarFallbackVisual(nome) {
  const inicial = nome ? nome.trim().charAt(0).toUpperCase() : "?"
  fallbackCircle().textContent = inicial

  if (!inputImagem().files?.length) {
    previewArea().style.display  = "none"
    fallbackArea().style.display = nome.trim() ? "block" : "none"
  }
}

// ----------------------------------------
//  Upload de imagem para Supabase
// ----------------------------------------
async function uploadImagem(file) {
  const ext      = file.name.split(".").pop()
  const fileName = `categorias/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from("produtos").upload(fileName, file)
  if (error) {
    console.error("Erro ao fazer upload:", error)
    return null
  }

  const { data } = supabase.storage.from("produtos").getPublicUrl(fileName)
  return data.publicUrl
}

// ----------------------------------------
//  Salvar (criar ou editar)
// ----------------------------------------
async function salvarCategoria(e) {
  e.preventDefault()

  const nome = inputNome().value.trim()
  if (!nome) return

  const btnSalvar = formCategoria().querySelector(".btn-salvar")
  btnSalvar.disabled    = true
  btnSalvar.textContent = "Salvando..."

  try {
    let imagemUrl = null
    const file = inputImagem().files?.[0]

    if (file) {
      imagemUrl = await uploadImagem(file)
    } else if (categoriaEditandoId) {
      // Mantém a imagem atual se não escolheu nova
      const res  = await api(`/categorias/${categoriaEditandoId}`)
      const data = await res.json()
      imagemUrl  = data.imagem_url || null
    }

    const payload = { nome, imagem_url: imagemUrl }
    const metodo  = categoriaEditandoId ? "PUT"  : "POST"
    const url     = categoriaEditandoId
      ? `/categorias/${categoriaEditandoId}`
      : "/categorias"

    const res = await api(url, {
      method: metodo,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      alert("Erro ao salvar categoria")
      return
    }

    fecharModalCategoria()
    carregarCategorias()

  } catch (err) {
    console.error("Erro:", err)
    alert("Erro inesperado ao salvar categoria")
  } finally {
    btnSalvar.disabled    = false
    btnSalvar.textContent = "Salvar Categoria"
  }
}

// ----------------------------------------
//  Excluir
// ----------------------------------------
async function excluirCategoria(id) {
  if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

  const res = await api(`/categorias/${id}`, { method: "DELETE" })

  if (!res.ok) {
    alert("Erro ao excluir categoria. Verifique se ela não possui produtos vinculados.")
    return
  }

  carregarCategorias()
}

// ----------------------------------------
//  Carregar e renderizar categorias
// ----------------------------------------
export async function carregarCategorias(search = "") {
  const grid = gridCategorias()
  if (!grid) return

  grid.innerHTML = `<p style="padding:20px;color:#999;">Carregando categorias...</p>`

  try {
    const url = search
      ? `/categorias?search=${encodeURIComponent(search)}`
      : "/categorias"

    const res        = await api(url)
    const categorias = await res.json()

    if (!categorias.length) {
      grid.innerHTML = `
        <div style="padding:40px;text-align:center;color:#999;">
          <p style="font-size:32px;margin-bottom:8px;">🏷️</p>
          <p>Nenhuma categoria cadastrada ainda.</p>
        </div>
      `
      return
    }

    grid.innerHTML = categorias.map(cat => renderCardCategoria(cat)).join("")

  } catch (err) {
    console.error("Erro ao carregar categorias:", err)
    grid.innerHTML = `<p style="padding:20px;color:#d32f2f;">Erro ao carregar categorias.</p>`
  }
}

// ----------------------------------------
//  Render de um card de categoria
// ----------------------------------------
function renderCardCategoria(cat) {
  const inicial = cat.nome ? cat.nome.trim().charAt(0).toUpperCase() : "?"

  // Imagem ou fallback com inicial
  const imgHTML = cat.imagem_url
    ? `<img
        src="${cat.imagem_url}"
        alt="${cat.nome}"
        class="cat-card-img"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      />
      <div class="cat-card-fallback" style="display:none;">${inicial}</div>`
    : `<div class="cat-card-fallback">${inicial}</div>`

  return `
    <div class="cat-card">
      <div class="cat-card-thumb">
        ${imgHTML}
      </div>
      <div class="cat-card-info">
        <strong class="cat-card-nome">${cat.nome}</strong>
        <span class="cat-card-id">ID: ${cat.id}</span>
      </div>
      <div class="cat-card-acoes">
        <button class="cat-btn-editar" onclick='window.editarCategoria(${JSON.stringify(cat)})'>✏️ Editar</button>
        <button class="cat-btn-excluir" onclick="window.excluirCategoriaPor(${cat.id})">🗑️ Excluir</button>
      </div>
    </div>
  `
}