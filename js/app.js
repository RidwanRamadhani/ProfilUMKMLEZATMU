/**
 * Application Logic for PT Azzam Tawaqal Berkemajuan (LEZATMU) Website
 * UMKM Spesialis Kuliner Mie Nusantara & Artisan Noodles
 * Including Full Dynamic Product Management (Add, Edit, Image Upload, Delete, LocalStorage)
 */

// Global State
let productsList = [];
let currentCategory = "all";
let currentSearchQuery = "";
let isAdminMode = false;
let pendingDeleteProductId = null;
let currentFormImageBase64 = "";

document.addEventListener("DOMContentLoaded", () => {
  initProductData();
  initLucide();
  initMobileMenu();
  renderBestSellers();
  renderTestimonials();
  initCatalog();
  initProductFormManagement();
  initModals();
  initConsultationForm();
  initScrollSpy();
});

// Helper: Initialize Lucide Icons
function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 0. Data Initialization with LocalStorage Persistence
function initProductData() {
  const stored = localStorage.getItem("lezatmu_products_data");
  if (stored) {
    try {
      productsList = JSON.parse(stored);
    } catch (e) {
      console.error("Gagal memuat data dari localStorage, menggunakan default:", e);
      productsList = [...culinaryData.products];
    }
  } else {
    productsList = [...culinaryData.products];
    saveProductsToStorage();
  }
}

function saveProductsToStorage() {
  localStorage.setItem("lezatmu_products_data", JSON.stringify(productsList));
}

// Helper: Toast Notifications
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-semibold text-white pointer-events-auto transition-all transform translate-y-2 opacity-0 duration-300 ${
    type === "success" ? "bg-emerald-700 border border-emerald-500" :
    type === "warning" ? "bg-amber-700 border border-amber-500" :
    type === "error" ? "bg-red-700 border border-red-500" : "bg-brand-brown-dark border border-brand-gold"
  }`;

  const iconName = type === "success" ? "check-circle" : type === "error" ? "alert-triangle" : "info";
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 shrink-0"></i>
    <div class="flex-1">${message}</div>
    <button class="text-white/80 hover:text-white" onclick="this.parentElement.remove()">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  initLucide();

  // Animation in
  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 50);

  // Auto dismiss
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 1. Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuIconOpen = document.getElementById("menuIconOpen");
  const menuIconClose = document.getElementById("menuIconClose");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  if (!mobileMenuBtn || !mobileMenu) return;

  mobileMenuBtn.addEventListener("click", () => {
    const isHidden = mobileMenu.classList.contains("hidden");
    if (isHidden) {
      mobileMenu.classList.remove("hidden");
      menuIconOpen.classList.add("hidden");
      menuIconClose.classList.remove("hidden");
    } else {
      mobileMenu.classList.add("hidden");
      menuIconOpen.classList.remove("hidden");
      menuIconClose.classList.add("hidden");
    }
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      menuIconOpen.classList.remove("hidden");
      menuIconClose.classList.add("hidden");
    });
  });
}

// 2. Render Best Sellers Grid
function renderBestSellers() {
  const container = document.getElementById("bestSellerGrid");
  if (!container) return;

  const bestSellers = productsList.filter(item => item.isBestSeller);

  if (bestSellers.length === 0) {
    container.innerHTML = `
      <div class="col-span-3 text-center py-12 bg-brand-cream-soft rounded-3xl border border-brand-gold-light/80 p-6">
        <i data-lucide="sparkles" class="w-8 h-8 text-brand-gold mx-auto mb-2"></i>
        <p class="text-sm font-semibold text-brand-brown">Belum ada menu yang ditandai Best Seller.</p>
        <p class="text-xs text-brand-brown-light mt-1">Anda dapat menandai menu sebagai Best Seller saat menambah atau mengedit produk.</p>
      </div>
    `;
    initLucide();
    return;
  }

  container.innerHTML = bestSellers.slice(0, 3).map((item, index) => {
    const medals = ["🥇 #1 Terlaris", "🥈 #2 Terlaris", "🥉 #3 Terlaris"];
    const medalLabel = item.badge || medals[index] || "Menu Favorit";

    return `
      <div class="bg-brand-cream-soft rounded-3xl overflow-hidden border border-brand-gold-light hover:border-brand-gold hover:shadow-warm-lg transition-all duration-300 flex flex-col group relative">
        
        <!-- Top Badge -->
        <div class="absolute top-4 left-4 z-10">
          <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-accent text-white shadow-md flex items-center gap-1.5">
            <i data-lucide="award" class="w-3.5 h-3.5"></i>
            <span>${medalLabel}</span>
          </span>
        </div>

        <div class="absolute top-4 right-4 z-10 flex items-center gap-1">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-sm text-brand-brown-dark shadow-sm border border-brand-gold/30 flex items-center gap-1">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-amber-500 fill-amber-500"></i>
            <span>${item.portionsSold || "1.000+"} Mangkok</span>
          </span>
          ${isAdminMode ? `
            <button 
              onclick="openEditProductModal('${item.id}')" 
              class="w-7 h-7 rounded-full bg-white/95 text-brand-brown shadow-sm border border-brand-gold/40 flex items-center justify-center hover:bg-brand-accent hover:text-white transition"
              title="Edit Menu Ini"
            >
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>

        <!-- Product Image -->
        <div class="relative h-60 overflow-hidden bg-brand-cream">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop'"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        <!-- Product Content -->
        <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-brand-brown-light">
              <span class="font-semibold uppercase tracking-wider text-brand-accent">${item.categoryLabel}</span>
              <div class="flex items-center gap-1 text-amber-600 font-bold">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-500 text-amber-500"></i>
                <span>${item.rating || 4.9} (${item.reviewCount || 100}+ Ulasan)</span>
              </div>
            </div>

            <h3 class="font-serif font-bold text-xl text-brand-brown-dark group-hover:text-brand-accent transition">
              ${item.name}
            </h3>

            <p class="text-xs sm:text-sm text-brand-brown-light line-clamp-2 leading-relaxed">
              ${item.tasteDescription}
            </p>

            <!-- Alasan Menjadi Favorit (PRD Requirement) -->
            <div class="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs text-amber-950 mt-2">
              <strong class="font-bold block text-amber-900 mb-0.5 flex items-center gap-1">
                <i data-lucide="sparkles" class="w-3 h-3 text-amber-700"></i>
                Rahasia Kelezatan Mie Kami:
              </strong>
              <span class="line-clamp-2">${item.whyFavorite || "Resep istimewa bumbu rempah alami pilihan yang diolah secara higienis."}</span>
            </div>
          </div>

          <!-- Action Buttons: NO Add to Cart, ONLY Detail & WA Consult -->
          <div class="pt-3 border-t border-brand-gold-light/60 flex items-center gap-2">
            <button 
              onclick="openProductModal('${item.id}')" 
              class="flex-1 py-2.5 px-3 rounded-xl bg-brand-brown-dark hover:bg-brand-brown text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>Lihat Detail Menu</span>
            </button>
            <a 
              href="https://wa.me/6289668251739?text=${encodeURIComponent(`Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara, saya ingin bertanya tentang menu mie terlaris: ${item.name}`)}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center shrink-0"
              title="Tanya Menu via WhatsApp"
            >
              <i data-lucide="message-circle" class="w-4 h-4"></i>
            </a>
          </div>

        </div>

      </div>
    `;
  }).join("");

  initLucide();
}

// 3. Render Testimonials
function renderTestimonials() {
  const container = document.getElementById("testimonialsContainer");
  if (!container) return;

  container.innerHTML = culinaryData.testimonials.map(t => {
    return `
      <div class="bg-white p-6 rounded-2xl border border-brand-gold-light shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-gold transition-all duration-300">
        <div class="space-y-3">
          <div class="flex items-center gap-1 text-amber-500">
            ${Array(t.rating).fill('<i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>').join("")}
          </div>
          <p class="text-xs sm:text-sm text-brand-brown-light italic leading-relaxed">
            &ldquo;${t.comment}&rdquo;
          </p>
        </div>

        <div class="pt-3 border-t border-brand-gold-light/50">
          <div class="font-bold text-sm text-brand-brown-dark">${t.name}</div>
          <div class="text-xs text-brand-brown-light">${t.role} &bull; <span class="text-brand-accent">${t.city}</span></div>
          <div class="text-[11px] text-brand-gold-dark mt-1 font-medium">Menu Favorit: ${t.menuEnjoyed}</div>
        </div>
      </div>
    `;
  }).join("");

  initLucide();
}

// 4. Interactive Catalog (Filter, Search, Render)
function initCatalog() {
  const catButtons = document.querySelectorAll(".cat-btn");
  const searchInput = document.getElementById("menuSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const resetSearchBtn = document.getElementById("resetSearchBtn");
  const toggleAdminBtn = document.getElementById("toggleAdminModeBtn");
  const resetDefaultDataBtn = document.getElementById("resetDefaultDataBtn");

  // Category Tab Click
  catButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      catButtons.forEach(b => {
        b.classList.remove("active", "bg-brand-brown-dark", "text-white");
        b.classList.add("bg-brand-cream-soft", "text-brand-brown-dark");
      });
      btn.classList.add("active", "bg-brand-brown-dark", "text-white");
      btn.classList.remove("bg-brand-cream-soft", "text-brand-brown-dark");

      currentCategory = btn.getAttribute("data-category");
      renderCatalogGrid();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        if (currentSearchQuery.length > 0) {
          clearSearchBtn.classList.remove("hidden");
        } else {
          clearSearchBtn.classList.add("hidden");
        }
      }
      renderCatalogGrid();
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchQuery = "";
      clearSearchBtn.classList.add("hidden");
      renderCatalogGrid();
      searchInput.focus();
    });
  }

  if (resetSearchBtn && searchInput) {
    resetSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchQuery = "";
      if (clearSearchBtn) clearSearchBtn.classList.add("hidden");
      
      // Reset category to all
      catButtons.forEach(b => {
        if (b.getAttribute("data-category") === "all") {
          b.click();
        }
      });
      renderCatalogGrid();
    });
  }

  // Admin Mode Toggle
  if (toggleAdminBtn) {
    toggleAdminBtn.addEventListener("click", () => {
      isAdminMode = !isAdminMode;
      const label = document.getElementById("adminToggleLabel");
      const badge = document.getElementById("adminModeActiveBadge");

      if (isAdminMode) {
        toggleAdminBtn.classList.add("bg-amber-100", "border-amber-400", "text-amber-900");
        toggleAdminBtn.classList.remove("bg-brand-cream-soft");
        if (label) label.textContent = "Matikan Mode Edit";
        if (badge) badge.classList.remove("hidden");
        showToast("Mode Edit Aktif: Tombol Edit & Hapus muncul di setiap kartu menu.", "info");
      } else {
        toggleAdminBtn.classList.remove("bg-amber-100", "border-amber-400", "text-amber-900");
        toggleAdminBtn.classList.add("bg-brand-cream-soft");
        if (label) label.textContent = "Aktifkan Mode Edit";
        if (badge) badge.classList.add("hidden");
        showToast("Mode Edit Dinonaktifkan.", "info");
      }

      renderCatalogGrid();
      renderBestSellers();
    });
  }

  // Reset to Default Products Data
  if (resetDefaultDataBtn) {
    resetDefaultDataBtn.addEventListener("click", () => {
      if (confirm("Kembalikan seluruh daftar menu ke data awal bawaan PT Azzam Tawaqal Berkemajuan?")) {
        productsList = [...culinaryData.products];
        saveProductsToStorage();
        renderCatalogGrid();
        renderBestSellers();
        showToast("Daftar menu berhasil dikembalikan ke versi bawaan.", "success");
      }
    });
  }

  renderCatalogGrid();
}

function renderCatalogGrid() {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("itemCount");
  const noResults = document.getElementById("noResults");
  if (!grid) return;

  const filtered = productsList.filter(item => {
    const matchCategory = currentCategory === "all" || item.category === currentCategory;
    const ingredientsArr = Array.isArray(item.mainIngredients) ? item.mainIngredients : [];
    const matchQuery = currentSearchQuery === "" || 
      item.name.toLowerCase().includes(currentSearchQuery) ||
      (item.tasteDescription && item.tasteDescription.toLowerCase().includes(currentSearchQuery)) ||
      ingredientsArr.some(ing => ing.toLowerCase().includes(currentSearchQuery));
    return matchCategory && matchQuery;
  });

  if (countEl) {
    countEl.textContent = filtered.length;
  }

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (noResults) noResults.classList.remove("hidden");
    return;
  }

  if (noResults) noResults.classList.add("hidden");

  grid.innerHTML = filtered.map(item => {
    // Generate Spice meter
    const spiceFlames = Array(5).fill(0).map((_, i) => {
      const active = i < (item.spiceLevel || 0);
      return `<i data-lucide="flame" class="w-3.5 h-3.5 ${active ? 'spicy-flame-active' : 'spicy-flame-inactive'}"></i>`;
    }).join("");

    // Generate Sweet meter (if applicable)
    const sweetDrops = Array(5).fill(0).map((_, i) => {
      const active = i < (item.sweetLevel || 0);
      return `<i data-lucide="droplet" class="w-3.5 h-3.5 ${active ? 'sweet-drop-active' : 'sweet-drop-inactive'}"></i>`;
    }).join("");

    const ingredientsArr = Array.isArray(item.mainIngredients) ? item.mainIngredients : [];

    return `
      <div class="bg-white rounded-3xl overflow-hidden border border-brand-gold-light/80 hover:border-brand-gold hover:shadow-warm transition-all duration-300 flex flex-col group relative">
        
        <!-- Image & Tags -->
        <div class="relative h-52 overflow-hidden bg-brand-cream-soft">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop'"
          >
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-brown-dark/80 backdrop-blur-sm text-brand-gold-light">
              ${item.categoryLabel || "Menu Mie"}
            </span>
            ${item.isBestSeller ? `
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-brand-accent text-white shadow-sm flex items-center gap-1">
                <i data-lucide="star" class="w-3 h-3 fill-white"></i>
                Best Seller
              </span>
            ` : ''}
          </div>

          <!-- Quick Edit & Delete Actions (Visible in Admin Mode) -->
          ${isAdminMode ? `
            <div class="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-brand-gold/40">
              <button 
                onclick="openEditProductModal('${item.id}')" 
                class="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 flex items-center justify-center transition"
                title="Edit Menu Ini"
              >
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
              </button>
              <button 
                onclick="triggerDeleteProduct('${item.id}')" 
                class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-700 flex items-center justify-center transition"
                title="Hapus Menu"
              >
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Body -->
        <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div>
              <h3 class="font-serif font-bold text-lg text-brand-brown-dark group-hover:text-brand-accent transition">
                ${item.name}
              </h3>
              <p class="text-xs sm:text-sm text-brand-brown-light mt-1 line-clamp-2">
                ${item.tasteDescription || "Sajian kuliner mie lezat berkualitas dari PT Azzam Tawaqal Berkemajuan."}
              </p>
            </div>

            <!-- Taste Metrics: Spicy & Sweet Levels -->
            <div class="p-2.5 bg-brand-cream-soft rounded-xl border border-brand-gold-light/60 space-y-1.5 text-xs">
              <div class="flex items-center justify-between text-brand-brown">
                <span class="text-[11px] font-medium flex items-center gap-1">
                  <i data-lucide="flame" class="w-3 h-3 text-red-500"></i> Tingkat Pedas:
                </span>
                <div class="flex items-center gap-0.5">
                  ${spiceFlames}
                </div>
              </div>

              ${item.sweetLevel > 0 ? `
                <div class="flex items-center justify-between text-brand-brown">
                  <span class="text-[11px] font-medium flex items-center gap-1">
                    <i data-lucide="droplet" class="w-3 h-3 text-amber-500"></i> Tingkat Manis:
                  </span>
                  <div class="flex items-center gap-0.5">
                    ${sweetDrops}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Main Ingredients Preview -->
            <div>
              <div class="text-[11px] uppercase font-bold text-brand-brown-light mb-1 tracking-wider">
                Bahan &amp; Racikan Alami:
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${ingredientsArr.slice(0, 3).map(ing => `
                  <span class="px-2 py-0.5 rounded-lg bg-gray-100 text-brand-brown-dark text-[11px] font-medium border border-gray-200">
                    ${ing}
                  </span>
                `).join("")}
                ${ingredientsArr.length > 3 ? `
                  <span class="px-1.5 py-0.5 rounded-lg bg-brand-gold-light/60 text-brand-brown text-[11px] font-bold">
                    +${ingredientsArr.length - 3} lainnya
                  </span>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Action: Lihat Detail (NO CART BUTTON) & Admin Quick Edit -->
          <div class="pt-3 border-t border-brand-gold-light/60 flex items-center gap-2">
            <button 
              onclick="openProductModal('${item.id}')" 
              class="flex-1 py-2.5 px-4 rounded-xl bg-brand-gold-light hover:bg-brand-gold text-brand-brown-dark font-bold text-xs transition flex items-center justify-center gap-2 border border-brand-gold/40 hover:shadow-sm"
            >
              <i data-lucide="info" class="w-3.5 h-3.5 text-brand-accent"></i>
              <span>Lihat Detail Menu</span>
            </button>

            ${isAdminMode ? `
              <button 
                onclick="openEditProductModal('${item.id}')" 
                class="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center gap-1 shrink-0"
                title="Edit Produk"
              >
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                <span>Edit</span>
              </button>
            ` : ''}
          </div>

        </div>

      </div>
    `;
  }).join("");

  initLucide();
}

// 5. Product Form Modal Logic (Tambah Produk & Edit Produk)
function initProductFormManagement() {
  const openAddBtn = document.getElementById("openAddProductBtn");
  const formModal = document.getElementById("productFormModal");
  const closeFormBtn = document.getElementById("closeFormModalBtn");
  const cancelFormBtn = document.getElementById("cancelFormBtn");
  const productForm = document.getElementById("productForm");

  const imageFileInput = document.getElementById("formImageFile");
  const imageUrlInput = document.getElementById("formImageUrl");
  const applyUrlBtn = document.getElementById("applyUrlBtn");
  const imagePreview = document.getElementById("formImagePreview");
  const removeImageBtn = document.getElementById("removeImageBtn");

  const spiceRange = document.getElementById("formSpiceLevel");
  const spiceDisplay = document.getElementById("spiceLevelDisplay");
  const sweetRange = document.getElementById("formSweetLevel");
  const sweetDisplay = document.getElementById("sweetLevelDisplay");

  const isBestSellerCheckbox = document.getElementById("formIsBestSeller");
  const whyFavoriteContainer = document.getElementById("whyFavoriteContainer");

  // Open Add Product
  if (openAddBtn) {
    openAddBtn.addEventListener("click", () => {
      openAddProductModal();
    });
  }

  // Close Form
  const closeForm = () => {
    if (formModal) {
      formModal.classList.add("hidden");
      formModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  };

  if (closeFormBtn) closeFormBtn.addEventListener("click", closeForm);
  if (cancelFormBtn) cancelFormBtn.addEventListener("click", closeForm);
  if (formModal) {
    formModal.addEventListener("click", (e) => {
      if (e.target === formModal) closeForm();
    });
  }

  // Sliders
  if (spiceRange && spiceDisplay) {
    spiceRange.addEventListener("input", (e) => {
      spiceDisplay.textContent = `${e.target.value} / 5`;
    });
  }

  if (sweetRange && sweetDisplay) {
    sweetRange.addEventListener("input", (e) => {
      sweetDisplay.textContent = `${e.target.value} / 5`;
    });
  }

  // Best seller toggle
  if (isBestSellerCheckbox && whyFavoriteContainer) {
    isBestSellerCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        whyFavoriteContainer.classList.remove("hidden");
      } else {
        whyFavoriteContainer.classList.add("hidden");
      }
    });
  }

  // File Upload to Base64
  if (imageFileInput && imagePreview) {
    imageFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 3.5 * 1024 * 1024) {
        showToast("Ukuran foto maksimal 3MB", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        currentFormImageBase64 = event.target.result;
        imagePreview.src = currentFormImageBase64;
        const statusEl = document.getElementById("imagePreviewStatus");
        if (statusEl) statusEl.textContent = `File dipilih: ${file.name}`;
      };
      reader.readAsDataURL(file);
    });
  }

  // Apply URL
  if (applyUrlBtn && imageUrlInput && imagePreview) {
    applyUrlBtn.addEventListener("click", () => {
      const url = imageUrlInput.value.trim();
      if (!url) {
        showToast("Silakan masukkan URL gambar yang valid", "warning");
        return;
      }
      currentFormImageBase64 = url;
      imagePreview.src = url;
      const statusEl = document.getElementById("imagePreviewStatus");
      if (statusEl) statusEl.textContent = "URL gambar berhasil diterapkan";
      showToast("URL gambar berhasil diterapkan ke pratinjau", "success");
    });
  }

  // Reset/Remove Image preview to default
  if (removeImageBtn && imagePreview) {
    removeImageBtn.addEventListener("click", () => {
      currentFormImageBase64 = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop";
      imagePreview.src = currentFormImageBase64;
      if (imageFileInput) imageFileInput.value = "";
      if (imageUrlInput) imageUrlInput.value = "";
      const statusEl = document.getElementById("imagePreviewStatus");
      if (statusEl) statusEl.textContent = "Menggunakan gambar default";
    });
  }

  // Form Submit (Save Product)
  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const editId = document.getElementById("editProductId").value;
      const name = document.getElementById("formProductName").value.trim();
      const category = document.getElementById("formCategory").value;
      const tasteDesc = document.getElementById("formTasteDesc").value.trim();
      const fullStory = document.getElementById("formFullStory").value.trim();
      const ingredientsRaw = document.getElementById("formIngredients").value.trim();
      const spiceLevel = parseInt(document.getElementById("formSpiceLevel").value) || 0;
      const sweetLevel = parseInt(document.getElementById("formSweetLevel").value) || 0;
      const serving = document.getElementById("formServing").value.trim();
      const allergens = document.getElementById("formAllergens").value.trim();
      const isBestSeller = document.getElementById("formIsBestSeller").checked;
      const whyFavorite = document.getElementById("formWhyFavorite").value.trim();

      const categoryLabels = {
        utama: "Menu Mie Utama",
        camilan: "Camilan & Pendamping Mie",
        minuman: "Minuman Penyegar"
      };

      const ingredientsArray = ingredientsRaw
        ? ingredientsRaw.split(",").map(s => s.trim()).filter(Boolean)
        : ["Tepung Mocaf Pilihan", "Bumbu Rempah Segar", "Minyak Bawang Aromatik"];

      const imageToSave = currentFormImageBase64 || "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop";

      if (editId) {
        // Edit Mode
        const index = productsList.findIndex(p => p.id === editId);
        if (index !== -1) {
          productsList[index] = {
            ...productsList[index],
            name,
            category,
            categoryLabel: categoryLabels[category] || "Menu Mie",
            image: imageToSave,
            tasteDescription: tasteDesc,
            fullStory: fullStory || `Menu lezat ${name} diracik secara higienis oleh PT Azzam Tawaqal Berkemajuan Serpong Utara.`,
            mainIngredients: ingredientsArray,
            spiceLevel,
            sweetLevel,
            servingSuggestion: serving || "Nikmati selagi hangat bersama kuah kaldu dan sambal khas.",
            allergens: allergens || "100% Halal Thoyyib, bebas pengawet sintetis.",
            isBestSeller,
            whyFavorite: isBestSeller ? (whyFavorite || "Racikan bumbu rempah otentik dan mie mocaf yang kenyal sempurna.") : ""
          };
          showToast(`Menu "${name}" berhasil diperbarui!`, "success");
        }
      } else {
        // Create New Product Mode
        const newId = `mie-${Date.now()}`;
        const newProduct = {
          id: newId,
          name,
          category,
          categoryLabel: categoryLabels[category] || "Menu Mie",
          image: imageToSave,
          tasteDescription: tasteDesc,
          fullStory: fullStory || `Menu lezat ${name} diracik dengan dedikasi penuh di sentra kuliner BUMM PCM Serpong Utara.`,
          mainIngredients: ingredientsArray,
          spiceLevel,
          sweetLevel,
          servingSuggestion: serving || "Nikmati selagi hangat bersama pelengkap favorit Anda.",
          allergens: allergens || "100% Halal Thoyyib, bebas pengawet sintetis.",
          isBestSeller,
          badge: isBestSeller ? "Menu Baru Favorit" : "",
          portionsSold: "100+",
          rating: 4.9,
          reviewCount: 15,
          whyFavorite: isBestSeller ? (whyFavorite || "Resep istimewa bumbu rempah pilihan khas LEZATMU Serpong Utara.") : ""
        };

        productsList.unshift(newProduct);
        showToast(`Menu baru "${name}" berhasil ditambahkan ke katalog!`, "success");
      }

      saveProductsToStorage();
      renderCatalogGrid();
      renderBestSellers();
      closeForm();
    });
  }

  // Delete Confirm Dialog Handlers
  const deleteModal = document.getElementById("deleteConfirmModal");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  if (cancelDeleteBtn && deleteModal) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteModal.classList.add("hidden");
      deleteModal.classList.remove("flex");
      pendingDeleteProductId = null;
    });
  }

  if (confirmDeleteBtn && deleteModal) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (pendingDeleteProductId) {
        const item = productsList.find(p => p.id === pendingDeleteProductId);
        const name = item ? item.name : "Menu";
        productsList = productsList.filter(p => p.id !== pendingDeleteProductId);
        saveProductsToStorage();
        renderCatalogGrid();
        renderBestSellers();
        showToast(`Menu "${name}" berhasil dihapus dari katalog.`, "warning");
      }
      deleteModal.classList.add("hidden");
      deleteModal.classList.remove("flex");
      pendingDeleteProductId = null;
    });
  }
}

// Open Add Product Modal Function
window.openAddProductModal = function() {
  const formModal = document.getElementById("productFormModal");
  const title = document.getElementById("productFormTitle");
  const subtitle = document.getElementById("productFormSubtitle");
  const submitLabel = document.getElementById("submitBtnLabel");
  const editId = document.getElementById("editProductId");
  const productForm = document.getElementById("productForm");
  const imagePreview = document.getElementById("formImagePreview");

  if (!formModal || !productForm) return;

  productForm.reset();
  if (editId) editId.value = "";
  if (title) title.textContent = "Tambah Menu Mie Baru";
  if (subtitle) subtitle.textContent = "Lengkapi informasi produk, foto barang, dan deskripsi rasa untuk ditambahkan ke katalog.";
  if (submitLabel) submitLabel.textContent = "Simpan Menu Baru";

  currentFormImageBase64 = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop";
  if (imagePreview) imagePreview.src = currentFormImageBase64;

  const spiceDisplay = document.getElementById("spiceLevelDisplay");
  const sweetDisplay = document.getElementById("sweetLevelDisplay");
  if (spiceDisplay) spiceDisplay.textContent = "1 / 5";
  if (sweetDisplay) sweetDisplay.textContent = "2 / 5";

  const whyFavContainer = document.getElementById("whyFavoriteContainer");
  if (whyFavContainer) whyFavContainer.classList.add("hidden");

  formModal.classList.remove("hidden");
  formModal.classList.add("flex");
  document.body.style.overflow = "hidden";
  initLucide();
};

// Open Edit Product Modal Function
window.openEditProductModal = function(productId) {
  const item = productsList.find(p => p.id === productId);
  if (!item) return;

  const formModal = document.getElementById("productFormModal");
  const title = document.getElementById("productFormTitle");
  const subtitle = document.getElementById("productFormSubtitle");
  const submitLabel = document.getElementById("submitBtnLabel");
  const editId = document.getElementById("editProductId");
  const imagePreview = document.getElementById("formImagePreview");

  if (!formModal) return;

  if (editId) editId.value = item.id;
  if (title) title.textContent = `Edit Menu: ${item.name}`;
  if (subtitle) subtitle.textContent = "Perbarui nama barang, ganti foto, ubah rasa, atau sesuaikan komposisi bahan.";
  if (submitLabel) submitLabel.textContent = "Simpan Perubahan";

  document.getElementById("formProductName").value = item.name || "";
  document.getElementById("formCategory").value = item.category || "utama";
  document.getElementById("formTasteDesc").value = item.tasteDescription || "";
  document.getElementById("formFullStory").value = item.fullStory || "";
  document.getElementById("formIngredients").value = Array.isArray(item.mainIngredients) ? item.mainIngredients.join(", ") : "";
  document.getElementById("formSpiceLevel").value = item.spiceLevel || 0;
  document.getElementById("formSweetLevel").value = item.sweetLevel || 0;
  document.getElementById("formServing").value = item.servingSuggestion || "";
  document.getElementById("formAllergens").value = item.allergens || "";
  
  const isBestSellerCheckbox = document.getElementById("formIsBestSeller");
  const whyFavContainer = document.getElementById("whyFavoriteContainer");
  const whyFavInput = document.getElementById("formWhyFavorite");

  if (isBestSellerCheckbox) {
    isBestSellerCheckbox.checked = !!item.isBestSeller;
    if (item.isBestSeller && whyFavContainer) {
      whyFavContainer.classList.remove("hidden");
      if (whyFavInput) whyFavInput.value = item.whyFavorite || "";
    } else if (whyFavContainer) {
      whyFavContainer.classList.add("hidden");
    }
  }

  currentFormImageBase64 = item.image || "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop";
  if (imagePreview) imagePreview.src = currentFormImageBase64;

  const spiceDisplay = document.getElementById("spiceLevelDisplay");
  const sweetDisplay = document.getElementById("sweetLevelDisplay");
  if (spiceDisplay) spiceDisplay.textContent = `${item.spiceLevel || 0} / 5`;
  if (sweetDisplay) sweetDisplay.textContent = `${item.sweetLevel || 0} / 5`;

  // Close Product Detail Modal if open
  const productModal = document.getElementById("productModal");
  if (productModal && !productModal.classList.contains("hidden")) {
    productModal.classList.add("hidden");
    productModal.classList.remove("flex");
  }

  formModal.classList.remove("hidden");
  formModal.classList.add("flex");
  document.body.style.overflow = "hidden";
  initLucide();
};

// Trigger Delete Confirmation Modal
window.triggerDeleteProduct = function(productId) {
  const item = productsList.find(p => p.id === productId);
  if (!item) return;

  pendingDeleteProductId = productId;
  const deleteModal = document.getElementById("deleteConfirmModal");
  const deleteTargetName = document.getElementById("deleteTargetName");

  if (deleteTargetName) deleteTargetName.textContent = item.name;
  if (deleteModal) {
    deleteModal.classList.remove("hidden");
    deleteModal.classList.add("flex");
  }
  initLucide();
};

// 6. Product Detail Modal & Article Modal
function initModals() {
  const productModal = document.getElementById("productModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const articleModal = document.getElementById("articleModal");
  const closeArticleModalBtn = document.getElementById("closeArticleModalBtn");

  // Close handlers
  if (closeModalBtn && productModal) {
    closeModalBtn.addEventListener("click", () => {
      productModal.classList.add("hidden");
      productModal.classList.remove("flex");
      document.body.style.overflow = "";
    });

    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) {
        productModal.classList.add("hidden");
        productModal.classList.remove("flex");
        document.body.style.overflow = "";
      }
    });
  }

  if (closeArticleModalBtn && articleModal) {
    closeArticleModalBtn.addEventListener("click", () => {
      articleModal.classList.add("hidden");
      articleModal.classList.remove("flex");
      document.body.style.overflow = "";
    });

    articleModal.addEventListener("click", (e) => {
      if (e.target === articleModal) {
        articleModal.classList.add("hidden");
        articleModal.classList.remove("flex");
        document.body.style.overflow = "";
      }
    });
  }

  // Escape key support
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const formModal = document.getElementById("productFormModal");
      const deleteModal = document.getElementById("deleteConfirmModal");

      if (formModal && !formModal.classList.contains("hidden")) {
        formModal.classList.add("hidden");
        formModal.classList.remove("flex");
        document.body.style.overflow = "";
      }
      if (deleteModal && !deleteModal.classList.contains("hidden")) {
        deleteModal.classList.add("hidden");
        deleteModal.classList.remove("flex");
      }
      if (productModal && !productModal.classList.contains("hidden")) {
        productModal.classList.add("hidden");
        productModal.classList.remove("flex");
        document.body.style.overflow = "";
      }
      if (articleModal && !articleModal.classList.contains("hidden")) {
        articleModal.classList.add("hidden");
        articleModal.classList.remove("flex");
        document.body.style.overflow = "";
      }
    }
  });
}

// Open Product Detail Modal
window.openProductModal = function(productId) {
  const item = productsList.find(p => p.id === productId);
  if (!item) return;

  const modal = document.getElementById("productModal");
  const content = document.getElementById("modalContent");
  if (!modal || !content) return;

  // Generate Spice meter
  const spiceFlames = Array(5).fill(0).map((_, i) => {
    const active = i < (item.spiceLevel || 0);
    return `<i data-lucide="flame" class="w-4 h-4 ${active ? 'spicy-flame-active' : 'spicy-flame-inactive'}"></i>`;
  }).join("");

  // Generate Sweet meter
  const sweetDrops = Array(5).fill(0).map((_, i) => {
    const active = i < (item.sweetLevel || 0);
    return `<i data-lucide="droplet" class="w-4 h-4 ${active ? 'sweet-drop-active' : 'sweet-drop-inactive'}"></i>`;
  }).join("");

  const ingredientsArr = Array.isArray(item.mainIngredients) ? item.mainIngredients : [];
  const waMessage = `Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara, saya tertarik dengan menu: *${item.name}* (${item.categoryLabel || "Menu Mie"}). Mohon informasi rekomendasi porsi dan pemesanan.`;
  const waUrl = `https://wa.me/6289668251739?text=${encodeURIComponent(waMessage)}`;

  content.innerHTML = `
    <div class="relative h-64 sm:h-72 overflow-hidden rounded-t-3xl bg-brand-cream-soft">
      <img 
        src="${item.image}" 
        alt="${item.name}" 
        class="w-full h-full object-cover"
        onerror="this.src='https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop'"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/90 via-black/30 to-transparent"></div>
      
      <div class="absolute top-4 left-6 z-10 flex items-center gap-2">
        <button 
          onclick="openEditProductModal('${item.id}')" 
          class="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-brand-brown-dark text-xs font-bold shadow-md flex items-center gap-1.5 transition"
          title="Edit Data Menu Ini"
        >
          <i data-lucide="edit-2" class="w-3.5 h-3.5 text-brand-accent"></i>
          <span>Edit Menu</span>
        </button>
      </div>

      <div class="absolute bottom-4 left-6 right-6 text-white">
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-accent uppercase tracking-wider">${item.categoryLabel || "Menu Mie"}</span>
          ${item.isBestSeller ? '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-brand-brown-dark">★ Best Seller UMKM</span>' : ''}
        </div>
        <h3 class="font-serif text-2xl sm:text-3xl font-bold leading-snug">${item.name}</h3>
      </div>
    </div>

    <div class="px-6 sm:px-8 pb-8 space-y-6">
      
      <!-- Deskripsi Rasa & Cerita -->
      <div class="space-y-3">
        <h4 class="font-bold text-sm text-brand-brown-dark uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-4 h-4 text-brand-accent"></i>
          Profil Cita Rasa &amp; Karakteristik Olahan
        </h4>
        <p class="text-sm text-brand-brown-light leading-relaxed">
          ${item.tasteDescription || "Sajian kuliner mie bermutu tinggi dari PT Azzam Tawaqal Berkemajuan."}
        </p>
        <p class="text-xs sm:text-sm text-brand-brown-light leading-relaxed bg-brand-cream-soft p-3.5 rounded-xl border border-brand-gold-light">
          ${item.fullStory || `Menu lezat ${item.name} diproses secara higienis di sentra produksi BUMM PCM Serpong Utara, Tangerang Selatan.`}
        </p>
      </div>

      <!-- Meter Tingkat Kepedasan & Kemanisan -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-3.5 bg-brand-cream-soft rounded-2xl border border-brand-gold-light">
          <div class="text-xs font-bold text-brand-brown-dark mb-1.5 flex items-center justify-between">
            <span>Tingkat Kepedasan:</span>
            <span class="text-brand-accent font-bold">${item.spiceLevel || 0} / 5</span>
          </div>
          <div class="flex items-center gap-1">${spiceFlames}</div>
        </div>

        <div class="p-3.5 bg-brand-cream-soft rounded-2xl border border-brand-gold-light">
          <div class="text-xs font-bold text-brand-brown-dark mb-1.5 flex items-center justify-between">
            <span>Tingkat Kemanisan:</span>
            <span class="text-amber-600 font-bold">${item.sweetLevel || 0} / 5</span>
          </div>
          <div class="flex items-center gap-1">${sweetDrops}</div>
        </div>
      </div>

      <!-- Komposisi Bahan Utama -->
      <div class="space-y-2">
        <h4 class="font-bold text-sm text-brand-brown-dark uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="utensils" class="w-4 h-4 text-brand-gold-dark"></i>
          Bahan Baku Alami Dapur UMKM
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${ingredientsArr.map(ing => `
            <div class="flex items-center gap-2 text-xs text-brand-brown-dark bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
              <span>${ing}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Saran Penyajian & Info Tambahan -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div class="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/60">
          <strong class="text-amber-900 block font-bold mb-1 flex items-center gap-1">
            <i data-lucide="chef-hat" class="w-3.5 h-3.5"></i> Saran Cara Menikmati:
          </strong>
          <p class="text-amber-950">${item.servingSuggestion || "Santap hangat selagi mengepul nikmat."}</p>
        </div>

        <div class="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/60">
          <strong class="text-emerald-900 block font-bold mb-1 flex items-center gap-1">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Standar Higienis &amp; Halal:
          </strong>
          <p class="text-emerald-950">${item.allergens || "100% Halal Thoyyib, bebas bahan pengawet sintetis berbahaya."}</p>
        </div>
      </div>

      <!-- Notice & Direct WhatsApp Call-to-Action (Strict Rule: No checkout) -->
      <div class="pt-4 border-t border-brand-gold-light space-y-3">
        <div class="p-3 rounded-xl bg-brand-cream text-[11px] text-brand-brown-light flex items-center gap-2">
          <i data-lucide="info" class="w-4 h-4 text-brand-accent shrink-0"></i>
          <span>Pemesanan porsi harian, takeaway, dan katering mie dilayani langsung melalui WhatsApp resmi PT Azzam Tawaqal Berkemajuan Serpong Utara.</span>
        </div>

        <a 
          href="${waUrl}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition"
        >
          <i data-lucide="message-circle" class="w-5 h-5"></i>
          <span>Tanya Menu Ini via WhatsApp Admin Serpong Utara</span>
        </a>
      </div>

    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  initLucide();
};

// Open Article Modal
window.openArticleModal = function(articleId) {
  const article = culinaryData.articles[articleId];
  if (!article) return;

  const modal = document.getElementById("articleModal");
  const content = document.getElementById("articleModalContent");
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center gap-2 text-xs text-brand-accent font-bold">
        <span>${article.category}</span>
        <span>&bull;</span>
        <span class="text-brand-brown-light font-normal">${article.date}</span>
      </div>

      <h3 class="font-serif font-bold text-2xl text-brand-brown-dark">
        ${article.title}
      </h3>

      <div class="rounded-2xl overflow-hidden h-56 bg-brand-cream my-4">
        <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover">
      </div>

      <div class="text-xs sm:text-sm text-brand-brown-light leading-relaxed space-y-3">
        ${article.content}
      </div>

      <div class="pt-6 border-t border-brand-gold-light flex items-center justify-between">
        <span class="text-xs text-brand-brown-light">PT Azzam Tawaqal Berkemajuan &bull; Serpong Utara</span>
        <a 
          href="https://wa.me/6289668251739?text=${encodeURIComponent(`Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara, saya baru membaca artikel '${article.title}' dan ingin berdiskusi lebih lanjut.`)}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <i data-lucide="message-circle" class="w-4 h-4"></i>
          <span>Diskusikan dengan Kami</span>
        </a>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  initLucide();
};

// 7. Fast Consultation Form
function initConsultationForm() {
  const form = document.getElementById("waConsultationForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("consultName").value.trim();
    const topic = document.getElementById("consultTopic").value;
    const message = document.getElementById("consultMessage").value.trim();

    const formattedMessage = `Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara,\n\nPerkenalkan saya *${name}*.\n*Topik Keperluan:* ${topic}\n*Pesan / Detail:* ${message || 'Saya ingin berkonsultasi mengenai menu mie dan layanan katering LEZATMU di Tangerang Selatan.'}\n\nTerima kasih.`;
    const waUrl = `https://wa.me/6289668251739?text=${encodeURIComponent(formattedMessage)}`;

    window.open(waUrl, "_blank");
  });
}

// 8. ScrollSpy & Navigation Active Link Indicator
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active-link");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active-link");
      }
    });
  });
}
