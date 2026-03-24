import { api } from "./utils.js"
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase = createClient(
  "https://fcknvwqerkyujhquugls.supabase.co",
  "sb_publishable_c-_9HXFPIQLd56o_2bixfw_oh-bMdXZ"
)

export function renderBanners() {
  const container = document.getElementById("secBanners")

  container.innerHTML = `
    <h1>Banners</h1>

    <form id="formBanner" class="form-banner">
      <input type="text" id="titulo" placeholder="Título (opcional)" />

      <input type="file" id="imagem" accept="image/*" required />

      <img id="preview" style="display:none; max-width:200px; margin-top:10px;" />

      <button type="submit">Salvar</button>
    </form>

    <hr>

    <div id="listaBanners">Carregando...</div>
  `

  configurarPreview()
  configurarForm()
  carregarBanners()
}

function configurarPreview() {
  const input = document.getElementById("imagem")
  const preview = document.getElementById("preview")

  input.addEventListener("change", () => {
    const file = input.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    preview.src = url
    preview.style.display = "block"
  })
}

async function carregarBanners() {
  try {
    const res = await fetch("/banners")

    if (!res.ok) throw new Error("Erro ao buscar banners")

    const banners = await res.json()

    const lista = document.getElementById("listaBanners")

    if (!banners.length) {
      lista.innerHTML = "<p>Nenhum banner cadastrado</p>"
      return
    }

    lista.innerHTML = banners.map(b => `
      <div class="banner-item">
        <img src="${b.imagem_url}" crossorigin="anonymous" />
        <div class="banner-info">
          <strong>${b.titulo || "Sem título"}</strong>
          <small>${b.link || ""}</small>
        </div>
        <button onclick="deletarBanner(${b.id})">Excluir</button>
      </div>
    `).join("")

  } catch (err) {
    console.error(err)
    document.getElementById("listaBanners").innerHTML =
      "<p>Erro ao carregar banners</p>"
  }
}

function configurarForm() {
  document.getElementById("formBanner").addEventListener("submit", async (e) => {
    e.preventDefault()

    try {
      const file = document.getElementById("imagem").files[0]
      const titulo = document.getElementById("titulo").value.trim()
      if (!file) {
        alert("Selecione uma imagem")
        return
      }

      const btn = e.target.querySelector("button")
      btn.disabled = true
      btn.innerText = "Enviando..."

      const imagem_url = await uploadImagem(file)

      const res = await fetch("/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + JSON.parse(localStorage.getItem("auth")).token
        },
        body: JSON.stringify({
          titulo,
          imagem_url
        })
      })

      if (!res.ok) {
        const text = await res.text()
        console.error(text)
        throw new Error("Erro ao salvar banner")
      }

      e.target.reset()
      document.getElementById("preview").style.display = "none"
      carregarBanners()

    } catch (err) {
      console.error(err)
      alert("Erro ao salvar banner")
    } finally {
      const btn = document.querySelector("#formBanner button")
      btn.disabled = false
      btn.innerText = "Salvar"
    }
  })
}

async function uploadImagem(file) {
  // Validar tipo de arquivo
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
  
  if (!tiposPermitidos.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WEBP.')
  }
  
  // Validar tamanho (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Arquivo muito grande. Máximo 5MB.')
  }
  
  // Gerar nome sem caracteres especiais
  const extensao = file.name.split('.').pop()
  const nomeLimpo = Date.now() + '-' + Math.random().toString(36).substring(7) + '.' + extensao
  
  const { error } = await supabase.storage
    .from("banners")
    .upload(nomeLimpo, file)

  if (error) {
    console.error(error)
    throw error
  }

  const { data } = supabase
    .storage
    .from("banners")
    .getPublicUrl(nomeLimpo)

  return data.publicUrl
}

window.deletarBanner = async function (id) {
  if (!confirm("Excluir banner?")) return

  try {
    const res = await fetch(`/banners/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + JSON.parse(localStorage.getItem("auth")).token
      }
    })

    if (!res.ok) throw new Error()

    carregarBanners()

  } catch (err) {
    console.error(err)
    alert("Erro ao deletar")
  }
}