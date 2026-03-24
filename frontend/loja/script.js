const container = document.getElementById("produtos");
const areaUsuario = document.getElementById("area-usuario");

// ============================
// USUÁRIO LOGADO
// ============================
let auth = null;

try {
  auth = JSON.parse(localStorage.getItem("auth"));
} catch {
  auth = null;
}

if (areaUsuario) {

  if (!auth) {

    areaUsuario.innerHTML = `
      <a href="/login.html" class="icon-link">👤</a>

      <button class="icon-link" onclick="abrirCarrinho()">
        🛒
      </button>
    `;

  } else {

    const primeiroNome = auth.usuario.nome
      ? auth.usuario.nome.split(" ")[0]
      : auth.usuario.email;

    areaUsuario.innerHTML = `
      <span>Olá, ${primeiroNome} 👋</span>

      <button class="icon-link" id="iconeCarrinho" onclick="abrirCarrinho()">
        🛒 <span id="contadorCarrinho">0</span>
      </button>

      ${auth.usuario.role === "admin"
        ? `<a href="/admin/admin.html" class="btn-admin">⚙ ADM</a>`
        : ""
      }

      <button id="logout">Sair</button>
    `;

    atualizarContadorCarrinho();

    document.getElementById("logout").onclick = () => {
      localStorage.removeItem("auth");
      window.location.reload();
    };

  }

}

function animarProdutoCarrinho(imagemProduto) {

  const carrinho = document.getElementById("iconeCarrinho");
  const img = imagemProduto.cloneNode(true);

  const rect = imagemProduto.getBoundingClientRect();
  const carrinhoRect = carrinho.getBoundingClientRect();

  img.style.position = "fixed";
  img.style.left = rect.left + "px";
  img.style.top = rect.top + "px";
  img.style.width = "80px";
  img.style.zIndex = "9999";
  img.style.transition = "all 0.8s ease";

  document.body.appendChild(img);

  setTimeout(() => {

    img.style.left = carrinhoRect.left + "px";
    img.style.top = carrinhoRect.top + "px";
    img.style.width = "20px";
    img.style.opacity = "0.5";

  }, 50);

  setTimeout(() => {
    img.remove();
  }, 800);

}

async function atualizarContadorCarrinho() {

  const auth = JSON.parse(localStorage.getItem("auth"));
  if (!auth) return;

  try {

    const res = await api(`/carrinho/count/${auth.usuario.id}`);
    const data = await res.json();

    const contador = document.getElementById("contadorCarrinho");

    if (contador) {
      contador.innerText = data.total;
    }

  } catch (err) {
    console.error("Erro ao atualizar carrinho", err);
  }

}
let currentIndex = 0
let slides = []
let dots = []
let intervalo = null

// Cache de cores
const coresCache = new Map()

async function carregarBannersHome() {
  const container = document.getElementById("carouselHome")
  const dotsContainer = document.getElementById("dots")

  try {
    const res = await fetch("/banners")
    const banners = await res.json()

    if (!banners.length) {
      container.innerHTML = "<p>Sem banners</p>"
      return
    }

    // Filtrar banners com imagens válidas
    const bannersValidos = await Promise.all(banners.map(async (b) => {
      const valido = await verificarImagem(b.imagem_url)
      return valido ? b : null
    }))
    
    const bannersFiltrados = bannersValidos.filter(b => b !== null)
    
    if (bannersFiltrados.length === 0) {
      container.innerHTML = "<p>Nenhum banner válido encontrado</p>"
      return
    }

    console.log(`📦 ${bannersFiltrados.length} banners válidos de ${banners.length} total`)

    // CRIA SLIDES COM CROSSORIGIN E TRATAMENTO DE ERRO
    container.innerHTML = bannersFiltrados.map((b, index) => `
      <div class="slide ${index === 0 ? "active" : ""}">
        <img 
          src="${b.imagem_url}" 
          alt="${b.titulo || 'Banner'}"
          crossorigin="anonymous"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23cccccc\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23666666\'%3EImagem indisponível%3C/text%3E%3C/svg%3E'"
        >
        <button class="banner-btn">Ver ofertas</button>
      </div>
    `).join("")

    // CRIA DOTS
    dotsContainer.innerHTML = bannersFiltrados.map((_, index) => `
      <span class="dot ${index === 0 ? "active" : ""}" data-index="${index}"></span>
    `).join("")

    slides = document.querySelectorAll(".slide")
    dots = document.querySelectorAll(".dot")

    // clique nos dots
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.index)
        mostrarSlide(index)
        resetIntervalo()
      })
    })

    // Pré-carregar cores
    await preCarregarCores()
    
    iniciarCarrossel()

  } catch (err) {
    console.error("Erro ao carregar banners:", err)
    container.innerHTML = "<p>Erro ao carregar banners</p>"
  }
}

// Função para verificar se a imagem existe
async function verificarImagem(url) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn(`Imagem não acessível: ${url}`, error.message)
    return false
  }
}

// Pré-carregar cores
async function preCarregarCores() {
  const imagens = document.querySelectorAll('.slide img')
  console.log(`🎨 Pré-carregando ${imagens.length} imagens...`)
  
  for (let i = 0; i < imagens.length; i++) {
    const img = imagens[i]
    
    // Pular imagens que são placeholders
    if (img.src.includes('data:image/svg')) {
      console.log(`⚠️ Banner ${i + 1} é placeholder, pulando...`)
      continue
    }
    
    if (img.complete && img.naturalWidth > 0) {
      const cor = await getCorDominanteSeguro(img)
      coresCache.set(img.src, cor)
    } else {
      img.addEventListener('load', async () => {
        if (img.naturalWidth > 0) {
          const cor = await getCorDominanteSeguro(img)
          coresCache.set(img.src, cor)
          console.log(`✅ Cor do banner ${i + 1} carregada:`, cor)
        }
      }, { once: true })
      
      img.addEventListener('error', () => {
        console.warn(`⚠️ Banner ${i + 1} falhou ao carregar`)
      })
    }
  }
}

// Versão segura do getCorDominante
async function getCorDominanteSeguro(img) {
  // Verificar cache
  if (coresCache.has(img.src)) {
    return coresCache.get(img.src)
  }

  return new Promise((resolve) => {
    try {
      // Verificar se a imagem é válida
      if (!img.complete || img.naturalWidth === 0) {
        resolve('rgb(100, 100, 100)')
        return
      }
      
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      const maxSize = 100
      let width = img.naturalWidth
      let height = img.naturalHeight
      
      if (width === 0 || height === 0) {
        resolve('rgb(100, 100, 100)')
        return
      }
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx.drawImage(img, 0, 0, width, height)
      
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      
      let r = 0, g = 0, b = 0
      let total = 0
      
      const step = Math.max(1, Math.floor((width * height) / 800))
      
      for (let i = 0; i < data.length; i += step * 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        if (brightness < 40 || brightness > 220) continue
        
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        total++
      }
      
      if (total === 0) {
        const centerX = Math.floor(width / 2)
        const centerY = Math.floor(height / 2)
        const centerPixel = ctx.getImageData(centerX, centerY, 1, 1).data
        r = centerPixel[0]
        g = centerPixel[1]
        b = centerPixel[2]
      } else {
        r = Math.floor(r / total)
        g = Math.floor(g / total)
        b = Math.floor(b / total)
      }
      
      const cor = `rgb(${r}, ${g}, ${b})`
      resolve(cor)
      
    } catch (error) {
      console.warn('Erro ao extrair cor:', error)
      resolve('rgb(52, 131, 250)')
    }
  })
}

async function mostrarSlide(index) {
  if (!slides.length) return
  
  slides.forEach(s => s.classList.remove("active"))
  dots.forEach(d => d.classList.remove("active"))

  const slideAtivo = slides[index]
  if (!slideAtivo) return
  
  slideAtivo.classList.add("active")
  if (dots[index]) dots[index].classList.add("active")

  currentIndex = index
  console.log(`📺 Slide ${index + 1}/${slides.length}`)

  const img = slideAtivo.querySelector("img")
  
  if (img && !img.src.includes('data:image/svg')) {
    if (img.complete && img.naturalWidth > 0) {
      await aplicarSombraAsync(img)
    } else {
      img.onload = async () => {
        if (img.naturalWidth > 0) {
          await aplicarSombraAsync(img)
        }
      }
    }
  } else {
    // Usar cor padrão se a imagem for placeholder
    const banner = document.querySelector(".banner-container")
    if (banner) {
      banner.style.boxShadow = '0 30px 40px -20px rgba(52, 131, 250, 0.5)'
    }
  }
}

async function aplicarSombraAsync(img) {
  try {
    const cor = await getCorDominanteSeguro(img)
    const banner = document.querySelector(".banner-container")
    
    if (banner) {
      banner.style.transition = 'box-shadow 0.5s ease'
      banner.style.boxShadow = `0 30px 40px -20px ${cor}`
      console.log('✅ Sombra aplicada:', cor)
    }
  } catch (error) {
    console.error('Erro ao aplicar sombra:', error)
    const banner = document.querySelector(".banner-container")
    if (banner) {
      banner.style.boxShadow = '0 30px 40px -20px rgba(52, 131, 250, 0.5)'
    }
  }
}

function proximoSlide() {
  if (!slides.length) return
  let next = currentIndex + 1
  if (next >= slides.length) next = 0
  mostrarSlide(next)
}

function iniciarCarrossel() {
  if (intervalo) clearInterval(intervalo)
  if (slides.length > 1) {
    intervalo = setInterval(proximoSlide, 4000)
    console.log('🔄 Carrossel iniciado')
  }
}

function resetIntervalo() {
  clearInterval(intervalo)
  iniciarCarrossel()
}

document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 Inicializando...')
  carregarBannersHome()
})

// ============================
// PRODUTOS
// ============================
async function carregarProdutos(search = "") {
  try {
    const res = await api(`/produtos?search=${search}`)
    const produtos = await res.json();

    if (!container) return;
    container.innerHTML = "";

    produtos.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      const temPromocao = p.tem_promocao;

      let precoHTML = "";
      let badgeHTML = "";

      if (temPromocao) {
        badgeHTML = `<span class="badge">${p.percentual_desconto}% OFF</span>`;

        precoHTML = `
          <p class="preco-antigo">
            ${Number(p.preco).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
          </p>
          <p class="preco-promocional">
            ${Number(p.preco_promocional).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
          </p>
        `;
      } else {
        precoHTML = `
          <p class="preco">
            ${Number(p.preco).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
          </p>
        `;
      }

      card.innerHTML = `
       <a class="card-link" href="produto.html?id=${p.id}">

        ${badgeHTML}

       <img src="${p.imagem || window.SEM_IMAGEM_FALLBACK}"
       alt="${p.nome}"
       onerror="this.onerror=null; this.src=window.SEM_IMAGEM_FALLBACK" />

       <h3>${p.nome}</h3>

       ${precoHTML}

      </a>

      <button onclick="adicionarAoCarrinho(${p.id} , this)">
      🛒 Adicionar
      </button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}
const inputBusca = document.getElementById("buscaProduto");

if (inputBusca) {
  inputBusca.addEventListener("input", function () {
    carregarProdutos(inputBusca.value);
  });
}

// ============================
// ADICIONAR AO CARRINHO (BACKEND)
// ============================
async function adicionarAoCarrinho(produto_id, botao, quantidade = 1) {

  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth) {
    window.location.href = "login.html";
    return;
  }

  try {

    const res = await api("/carrinho/add", {
      method: "POST",
      body: JSON.stringify({
        usuario_id: auth.usuario.id,
        produto_id,
        quantidade   // ✅ agora envia quantidade
      })
    });

    if (!res.ok) {
      throw new Error("Erro ao adicionar no carrinho");
    }

    /* animação apenas se existir botão/card */
    let imagem = null;

    if (botao) {

      const card = botao.closest(".card");

      if (card) {
        imagem = card.querySelector("img");
      }

    }

    if (!imagem) {
      imagem = document.getElementById("imagemPrincipal");
    }

    if (imagem) {
      animarProdutoCarrinho(imagem);
    }

    atualizarContadorCarrinho();
    mostrarToastCarrinho();

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao adicionar ao carrinho");
  }
}
function mostrarToastCarrinho() {

  const toast = document.getElementById("toastCarrinho");

  if (!toast) return;

  toast.classList.add("mostrar");

  setTimeout(() => {

    toast.classList.remove("mostrar");

  }, 2500);

}

// ============================
// CATEGORIAS
// ============================
async function carregarCategorias() {
  try {
    const res = await api("/categorias");
    const categorias = await res.json();

    const categoriasContainer = document.getElementById("categorias");
    if (!categoriasContainer) return;

    categoriasContainer.innerHTML = "";

    categorias.forEach(cat => {
      const card = document.createElement("div");
      card.className = "categoria-card";

      card.innerHTML = `
        <img src="${cat.imagem_url}">
        <span>${cat.nome}</span>
      `;

      categoriasContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

// ============================
// INIT
// ============================
carregarCategorias();
carregarProdutos();