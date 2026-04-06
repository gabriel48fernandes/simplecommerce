// ==========================================
// PÁGINA DE PRODUTO - INTERATIVIDADES
// ==========================================

// ============================
// ACORDEÃO
// ============================
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', function() {
    const item = this.parentElement;
    const content = item.querySelector('.accordion-content');
    const icon = this.querySelector('.accordion-icon');

    // Fechar outros accordeões
    document.querySelectorAll('.accordion-item').forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.querySelector('.accordion-header').classList.remove('active');
        otherItem.querySelector('.accordion-content').classList.remove('active');
      }
    });

    // Toggle do atual
    this.classList.toggle('active');
    content.classList.toggle('active');
  });
});

// Abrir o primeiro acordeão por padrão
document.addEventListener('DOMContentLoaded', () => {
  const firstAccordion = document.querySelector('.accordion-header');
  if (firstAccordion) {
    firstAccordion.click();
  }
});

// ============================
// SELEÇÃO DE TAMANHO
// ============================
document.querySelectorAll('.tamanho-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove classe active de todos
    document.querySelectorAll('.tamanho-btn').forEach(b => {
      b.classList.remove('active');
    });
    
    // Adiciona ao clicado
    this.classList.add('active');
    
    // Salva no localStorage
    const tamanho = this.dataset.tamanho;
    localStorage.setItem('tamanhoSelecionado', tamanho);
    console.log('✅ Tamanho selecionado:', tamanho);
  });
});

// Restaurar tamanho selecionado ao carregar
window.addEventListener('load', () => {
  const tamanhoSalvo = localStorage.getItem('tamanhoSelecionado');
  if (tamanhoSalvo) {
    document.querySelector(`[data-tamanho="${tamanhoSalvo}"]`)?.classList.add('active');
  }
});

// ============================
// QUANTIDADE
// ============================
const btnDiminuir = document.getElementById('diminuirQtd');
const btnAumentar = document.getElementById('aumentarQtd');
const inputQtd = document.getElementById('quantidadeProduto');

if (btnDiminuir && btnAumentar && inputQtd) {
  btnDiminuir.addEventListener('click', () => {
    let qtd = parseInt(inputQtd.value) || 1;
    if (qtd > 1) {
      inputQtd.value = qtd - 1;
    }
  });

  btnAumentar.addEventListener('click', () => {
    let qtd = parseInt(inputQtd.value) || 1;
    inputQtd.value = qtd + 1;
  });
}

// ============================
// GALERIA DE IMAGENS
// ============================
let slideAtualGaleria = 0;

function mostrarSlideGaleria(index) {
  const slides = document.querySelectorAll('.galeria-miniaturas img');
  const dots = document.querySelectorAll('.galeria-dots span');
  
  if (!slides.length) return;

  // Atualizar miniaturas
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) {
      slide.classList.add('active');
    }
  });

  // Atualizar dots
  if (dots.length > 0) {
    dots.forEach((dot, i) => {
      dot.classList.remove('active');
      if (i === index) {
        dot.classList.add('active');
      }
    });
  }

  // Atualizar imagem principal
  const imagemlPrincipal = document.getElementById('imagemPrincipal');
  if (imagemlPrincipal && slides[index]) {
    imagemPrincipal.src = slides[index].src;
  }

  slideAtualGaleria = index;
}

// Cliques nas miniaturas
document.querySelectorAll('.galeria-miniaturas img').forEach((img, index) => {
  img.addEventListener('click', () => {
    mostrarSlideGaleria(index);
  });
});

// Cliques nos dots
document.querySelectorAll('.galeria-dots span').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    mostrarSlideGaleria(index);
  });
});

// Inicializar galeria no carregamento
window.addEventListener('load', () => {
  mostrarSlideGaleria(0);
});

// ============================
// ADICIONAR À LISTA (WISHLIST)
// ============================
const btnWishlist = document.getElementById('btnAdicionarWishlist');
if (btnWishlist) {
  btnWishlist.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');
    
    if (!produtoId) {
      alert('Erro ao identificar produto');
      return;
    }

    // Salvar na lista de desejos (localStorage)
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (wishlist.includes(parseInt(produtoId))) {
      wishlist = wishlist.filter(id => id !== parseInt(produtoId));
      btnWishlist.classList.remove('ativo');
      btnWishlist.textContent = '❤️ Adicionar à lista';
    } else {
      wishlist.push(parseInt(produtoId));
      btnWishlist.classList.add('ativo');
      btnWishlist.textContent = '❤️ Em minha lista';
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    console.log('✅ Wishlist atualizada:', wishlist);
  });

  // Verificar se produto já está na lista
  window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    if (wishlist.includes(parseInt(produtoId))) {
      btnWishlist.classList.add('ativo');
      btnWishlist.textContent = '❤️ Em minha lista';
    }
  });
}

// ============================
// MOBILE MENU ACORDEÃO DO FOOTER
// ============================
if (window.matchMedia('(max-width: 768px)').matches) {
  document.querySelectorAll('.footer-column h4').forEach(h4 => {
    h4.style.cursor = 'pointer';
    h4.addEventListener('click', () => {
      const ul = h4.nextElementSibling;
      if (ul && ul.tagName === 'UL') {
        ul.style.display = ul.style.display === 'none' ? 'flex' : 'none';
      }
    });
  });
}

console.log('✅ Página de produto carregada com sucesso!');
