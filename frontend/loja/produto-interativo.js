// ==========================================
// PÁGINA DE PRODUTO - INTERATIVIDADES
// ==========================================
// 
// Este arquivo gerencia as interações dinâmicas da página de produto
// 
// NOTA: A lógica de produtos, variações, estoque e quantidade é 
// gerenciada por produto.js. Este arquivo cuida apenas de:
// - Acordeões (abrir/fechar seções)
// - Galeria de imagens (miniaturas e dots)
// - Wishlist
// - Menus mobile

// ============================
// ACORDEÃO
// ============================
document.addEventListener('DOMContentLoaded', () => {
  const setupAccordions = () => {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', function() {
        const item = this.parentElement;
        const content = item.querySelector('.accordion-content');

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
    const firstAccordion = document.querySelector('.accordion-header');
    if (firstAccordion) {
      firstAccordion.click();
    }
  };

  setupAccordions();
});

// ============================
// GALERIA DE IMAGENS (COM EVENT DELEGATION)
// ============================
// 
// As miniaturas são criadas dinamicamente por produto.js
// Usamos event delegation para capturar cliques em elementos criados dinamicamente

const galeryManager = {
  currentSlide: 0,

  // Atualizar imagem principal e indicadores visuais
  showSlide(index) {
    const slider = document.getElementById('miniaturas');
    if (!slider) return;

    const slides = slider.querySelectorAll('img');
    if (!slides.length || index < 0 || index >= slides.length) return;

    // Remover classe active de todas as miniaturas
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    // Atualizar imagem principal
    const mainImage = document.getElementById('imagemPrincipal');
    if (mainImage && slides[index]) {
      mainImage.src = slides[index].src;
    }

    this.currentSlide = index;
  },

  // Inicializar event delegation para miniaturas
  initGalleryEvents() {
    const slider = document.getElementById('miniaturas');
    if (!slider) return;

    slider.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;

      const slides = slider.querySelectorAll('img');
      const index = Array.from(slides).indexOf(img);
      if (index !== -1) {
        this.showSlide(index);
      }
    });
  }
};

// Inicializar galeria quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  galeryManager.initGalleryEvents();
  // Mostrar primeira imagem
  galeryManager.showSlide(0);
});

// ============================
// WISHLIST
// ============================
// Gerenciar favoritos do usuário

const wishlistManager = {
  init() {
    const btnWishlist = document.getElementById('btnAdicionarWishlist');
    if (!btnWishlist) return;

    btnWishlist.addEventListener('click', () => this.toggleWishlist());

    // Verificar se produto já está na lista ao carregar
    window.addEventListener('load', () => this.updateWishlistUI());
  },

  toggleWishlist() {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = parseInt(urlParams.get('id'));

    if (!produtoId) {
      alert('Erro ao identificar produto');
      return;
    }

    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const estava = wishlist.includes(produtoId);

    if (estava) {
      wishlist = wishlist.filter(id => id !== produtoId);
    } else {
      wishlist.push(produtoId);
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    this.updateWishlistUI();
    console.log('✅ Wishlist atualizada:', wishlist);
  },

  updateWishlistUI() {
    const btnWishlist = document.getElementById('btnAdicionarWishlist');
    if (!btnWishlist) return;

    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = parseInt(urlParams.get('id'));
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const estaLista = wishlist.includes(produtoId);

    if (estaLista) {
      btnWishlist.classList.add('ativo');
      btnWishlist.textContent = '❤️ Em minha lista';
    } else {
      btnWishlist.classList.remove('ativo');
      btnWishlist.textContent = '❤️ Adicionar à lista';
    }
  }
};

// Inicializar wishlist
document.addEventListener('DOMContentLoaded', () => {
  wishlistManager.init();
});

// ============================
// MOBILE FOOTER MENU (ACCORDION)
// ============================
// Em dispositivos móveis (≤768px), os menus do footer se comportam como acordeões

const mobileFooterMenu = {
  init() {
    if (!window.matchMedia('(max-width: 768px)').matches) return;

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
};

// Inicializar mobile footer
document.addEventListener('DOMContentLoaded', () => {
  mobileFooterMenu.init();
});

console.log('✅ Página de produto carregada com sucesso!');
