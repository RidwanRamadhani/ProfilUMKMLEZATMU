/**
 * Application Logic for PT Azzam Tawaqal Berkemajuan (LEZATMU) Website
 * UMKM Spesialis Kuliner Mie Nusantara & Artisan Noodles
 * Including Full Dynamic Product Management (Add, Edit, Image Upload, Delete, LocalStorage)
 */

// Global State
let productsList = [];
let testimonialsList = [];
let currentCategory = "all";
let currentSearchQuery = "";
let isAdminMode = false;
let pendingDeleteProductId = null;
let currentFormImageBase64 = "";

document.addEventListener("DOMContentLoaded", () => {
  initAOS();
  initProductData();
  initTestimonialsData();
  initLucide();
  initMobileMenu();
  renderBestSellers();
  renderTestimonials();
  renderArticles();
  initCatalog();
  initProductFormManagement();
  initTestimonialsManagement();
  initRealtimeTestimonials();
  initAutoSyncListeners();
  initSupabaseManagement();
  initSyncManagement();
  initModals();
  initConsultationForm();
  initScrollSpy();
});

// Helper: Initialize AOS (Animate On Scroll)
function initAOS() {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
      offset: 50,
      mirror: true
    });
  }
}

function refreshAOS() {
  if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
    setTimeout(() => {
      AOS.refresh();
    }, 60);
  }
}

// Helper: Initialize Lucide Icons
function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 0. Data Initialization with Supabase Realtime Fetch & LocalStorage Fallback
const CURRENT_CATALOG_VERSION = "lezatmu_v3_official";
const CLOUD_DB_KEY = "lezatmu_cloud_db_url_v1";

async function initProductData() {
  const version = localStorage.getItem("lezatmu_catalog_ver");
  const stored = localStorage.getItem("lezatmu_products_data_v3");
  
  // 1. Tampilkan dulu data dari cache / baseline agar halaman tidak menunggu layar kosong
  if (version === CURRENT_CATALOG_VERSION && stored) {
    try {
      productsList = JSON.parse(stored);
    } catch (e) {
      console.error("Gagal memuat data dari localStorage, menggunakan default:", e);
      productsList = [...culinaryData.products];
    }
  } else {
    localStorage.removeItem("lezatmu_products_data");
    productsList = [...culinaryData.products];
    localStorage.setItem("lezatmu_catalog_ver", CURRENT_CATALOG_VERSION);
    saveProductsToStorage(false);
  }

  // Render tampilan awal
  renderCatalogGrid();
  renderBestSellers();

  // 2. Fetch data realtime dari Supabase Cloud Database (HP A, HP B, dan semua perangkat)
  await fetchProductsFromSupabase(false);

  // 3. Fallback sync sekunder jika ada REST endpoint cloud lain terpasang
  checkAndSyncFromCloud(true);
}

// Fetch produk langsung dari tabel Supabase
async function fetchProductsFromSupabase(showToastOnSuccess = false) {
  if (typeof getSupabaseClient !== "function") return;
  const sb = getSupabaseClient();
  if (!sb) return;

  try {
    const { data, error } = await sb
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch warning:", error.message);
      if (showToastOnSuccess) showToast("Koneksi Supabase: " + error.message, "error");
      return;
    }

    if (data && data.length > 0) {
      // Petakan baris Supabase menjadi objek produk
      productsList = data.map(formatProductFromDb);
      // Simpan ke local cache untuk performa offline
      localStorage.setItem("lezatmu_products_data_v3", JSON.stringify(productsList));
      renderCatalogGrid();
      renderBestSellers();
      if (showToastOnSuccess) {
        showToast(`Berhasil mengambil ${data.length} menu langsung dari Supabase Cloud!`, "success");
      }
    } else if (data && data.length === 0) {
      console.log("Tabel products di Supabase masih kosong.");
      if (showToastOnSuccess) {
        showToast("Tabel Supabase masih kosong. Anda dapat mengklik tombol 'Isi Menu Awal (Seed)'.", "info");
      }
    }
  } catch (err) {
    console.warn("Koneksi Supabase error:", err);
    if (showToastOnSuccess) showToast("Koneksi Supabase gagal: " + err.message, "error");
  }
}

function saveProductsToStorage(syncCloud = true) {
  localStorage.setItem("lezatmu_products_data_v3", JSON.stringify(productsList));
  if (syncCloud) {
    syncToCloudDb(productsList);
  }
}

// Helper: Sync from Cloud Database
async function checkAndSyncFromCloud(silent = true) {
  const cloudUrl = localStorage.getItem(CLOUD_DB_KEY);
  if (!cloudUrl) return;

  try {
    const resp = await fetch(cloudUrl, { cache: "no-store" });
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const data = await resp.json();
    let remoteProducts = null;

    if (Array.isArray(data)) {
      remoteProducts = data;
    } else if (data && Array.isArray(data.products)) {
      remoteProducts = data.products;
    } else if (data && typeof data === "object") {
      const vals = Object.values(data).filter(item => item && item.id && item.name);
      if (vals.length > 0) remoteProducts = vals;
    }

    if (remoteProducts && remoteProducts.length > 0) {
      productsList = remoteProducts;
      localStorage.setItem("lezatmu_products_data_v3", JSON.stringify(productsList));
      renderCatalogGrid();
      renderBestSellers();
      if (!silent) showToast("Katalog menu berhasil disinkronkan dari Cloud Database!", "success");
    }
  } catch (e) {
    console.warn("Cloud sync check failed:", e);
    if (!silent) showToast("Gagal menyinkronkan dari Cloud: " + e.message, "error");
  }
}

// Helper: Sync to Cloud Database
async function syncToCloudDb(products) {
  const cloudUrl = localStorage.getItem(CLOUD_DB_KEY);
  if (!cloudUrl) return;

  try {
    const resp = await fetch(cloudUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products)
    });
    if (resp.ok) {
      showToast("Data menu berhasil disinkronkan ke Cloud Database!", "success");
    }
  } catch (e) {
    console.warn("Gagal simpan ke Cloud Database:", e);
  }
}

// Testimonials Data Initialization with Supabase Realtime Fetch & LocalStorage Fallback
const TESTIMONIALS_STORAGE_KEY = "lezatmu_testimonials_v2";

function getBaselineTestimonials() {
  if (typeof culinaryData !== "undefined" && Array.isArray(culinaryData.testimonials)) {
    return culinaryData.testimonials.map((t, idx) => ({
      id: "testi-default-" + (idx + 1),
      name: t.name || "Pelanggan",
      role: t.role || "Pelanggan Setia LezatMU",
      city: t.city || "Tangerang Selatan",
      rating: Number(t.rating) || 5,
      comment: t.comment || "",
      menuEnjoyed: t.menuEnjoyed || "Mi Instan LezatMU",
      createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString()
    }));
  }
  return [];
}

async function initTestimonialsData() {
  const stored = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
  if (stored) {
    try {
      testimonialsList = JSON.parse(stored);
    } catch (e) {
      console.error("Gagal memuat testimoni dari localStorage, menggunakan baseline:", e);
      testimonialsList = getBaselineTestimonials();
    }
  } else {
    testimonialsList = getBaselineTestimonials();
    localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonialsList));
  }

  // Render tampilan awal dari cache
  renderTestimonials();

  // Fetch data terbaru dari Supabase Cloud (jika tabel sudah dibuat)
  await fetchTestimonialsFromSupabase(false);
}

// Fetch ulasan testimoni langsung dari tabel Supabase dengan sinkronisasi multi-perangkat
async function fetchTestimonialsFromSupabase(showToastOnSuccess = false) {
  if (typeof getSupabaseClient !== "function") return;
  const sb = getSupabaseClient();
  if (!sb) return;

  try {
    const { data, error } = await sb
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch testimonials notice:", error.message);
      if (showToastOnSuccess) showToast("Info Testimoni: " + error.message, "info");
      return;
    }

    const baseline = getBaselineTestimonials();

    if (data && data.length > 0) {
      const remoteItems = data.map(item => ({
        id: String(item.id),
        name: item.name || "Pelanggan",
        role: item.role || "Pelanggan Setia LezatMU",
        city: item.city || "Tangerang Selatan",
        rating: Number(item.rating) || 5,
        comment: item.comment || "",
        menuEnjoyed: item.menu_enjoyed || item.menuEnjoyed || "Mi Instan LezatMU",
        createdAt: item.created_at || item.createdAt || new Date().toISOString()
      }));

      // Cek apakah data dari database sudah mencakup ulasan resmi awal
      const hasBaselineInRemote = remoteItems.some(r => r.id.startsWith("testi-default-"));
      
      if (hasBaselineInRemote) {
        testimonialsList = remoteItems;
      } else {
        // Gabungkan ulasan baru dari pengunjung dengan testimoni resmi bawaan
        testimonialsList = [...remoteItems, ...baseline];
      }

      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonialsList));
      renderTestimonials();

      if (showToastOnSuccess) {
        showToast(`Berhasil menyinkronkan ${testimonialsList.length} ulasan dari database cloud!`, "success");
      }
    } else if (data && data.length === 0) {
      // PENTING UNTUK HP B: Jika ulasan di database telah dihapus admin,
      // bersihkan cache lokal dan kembalikan ke testimoni resmi bawaan LezatMU!
      testimonialsList = baseline;
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonialsList));
      renderTestimonials();
    }
  } catch (err) {
    console.warn("Koneksi Supabase error saat mengambil testimoni:", err);
  }
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
      <div data-aos="fade-up" data-aos-duration="750" data-aos-delay="${index * 150}" class="bg-brand-cream-soft rounded-3xl overflow-hidden border border-brand-gold-light hover:border-brand-gold hover:shadow-warm-lg hover-lift transition-all duration-300 flex flex-col group relative">
        
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
            <button 
              onclick="openWaChooser('Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara, saya ingin bertanya tentang menu mie terlaris: ${item.name}.')" 
              class="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center shrink-0"
              title="Tanya Menu via WhatsApp Pilihan"
            >
              <svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </button>
          </div>

        </div>

      </div>
    `;
  }).join("");

  initLucide();
  refreshAOS();
}

// 3. Render Testimonials & Rating Statistics
function renderTestimonials() {
  const container = document.getElementById("testimonialsContainer");
  const avgRatingEl = document.getElementById("testimonialAverageRating");
  const totalReviewsEl = document.getElementById("testimonialTotalReviews");
  if (!container) return;

  const totalCount = testimonialsList.length;
  if (totalCount > 0) {
    const sum = testimonialsList.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
    const avg = (sum / totalCount).toFixed(1);
    if (avgRatingEl) avgRatingEl.textContent = avg;
    if (totalReviewsEl) totalReviewsEl.textContent = `(${totalCount} Ulasan)`;
  } else {
    if (avgRatingEl) avgRatingEl.textContent = "5.0";
    if (totalReviewsEl) totalReviewsEl.textContent = "(0 Ulasan)";
  }

  if (totalCount === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white p-8 rounded-3xl border border-brand-gold-light text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
          <i data-lucide="message-square" class="w-8 h-8"></i>
        </div>
        <div class="space-y-1">
          <h4 class="font-bold text-lg text-brand-brown-dark">Belum Ada Ulasan</h4>
          <p class="text-xs sm:text-sm text-brand-brown-light max-w-md mx-auto">
            Jadilah yang pertama memberikan ulasan dan rating rasa untuk Mi Instan LezatMU!
          </p>
        </div>
        <button 
          type="button" 
          onclick="document.getElementById('openAddTestimonialBtn')?.click()"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition shadow-md"
        >
          <i data-lucide="star" class="w-4 h-4 fill-white"></i>
          <span>Tulis Ulasan Pertama</span>
        </button>
      </div>
    `;
    initLucide();
    return;
  }

  container.innerHTML = testimonialsList.map((t, idx) => {
    const ratingNum = Math.min(5, Math.max(1, Number(t.rating) || 5));
    const filledStars = Array(ratingNum)
      .fill('<i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>')
      .join("");
    const emptyStars = Array(5 - ratingNum)
      .fill('<i data-lucide="star" class="w-4 h-4 text-gray-300"></i>')
      .join("");

    let dateStr = "";
    if (t.createdAt) {
      try {
        const d = new Date(t.createdAt);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
        }
      } catch (e) {}
    }

    return `
      <div data-aos="fade-up" data-aos-duration="750" data-aos-delay="${idx * 80}" class="bg-white p-6 rounded-2xl border border-brand-gold-light shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-gold hover-lift transition-all duration-300 relative group">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1 text-amber-500">
              ${filledStars}
              ${emptyStars}
            </div>

            <div class="flex items-center gap-2">
              ${dateStr ? `<span class="text-[11px] text-brand-brown-light/70 font-medium">${dateStr}</span>` : ""}
              ${isAdminMode ? `
                <button 
                  type="button" 
                  onclick="triggerDeleteTestimonial('${t.id}')" 
                  title="Hapus Ulasan (Khusus Mode Admin)"
                  class="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  <span>Hapus</span>
                </button>
              ` : ""}
            </div>
          </div>

          <p class="text-xs sm:text-sm text-brand-brown-light italic leading-relaxed">
            &ldquo;${escapeHtml(t.comment || "")}&rdquo;
          </p>
        </div>

        <div class="pt-3 border-t border-brand-gold-light/50">
          <div class="font-bold text-sm text-brand-brown-dark">${escapeHtml(t.name || "")}</div>
          <div class="text-xs text-brand-brown-light">${escapeHtml(t.role || "Pelanggan")} &bull; <span class="text-brand-accent">${escapeHtml(t.city || "")}</span></div>
          <div class="text-[11px] text-brand-gold-dark mt-1 font-medium">Menu Dinikmati: ${escapeHtml(t.menuEnjoyed || "Mi Instan LezatMU")}</div>
        </div>
      </div>
    `;
  }).join("");

  initLucide();
  refreshAOS();
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

  // Admin Mode Toggle with PIN 2026 Protection
  const adminPinModal = document.getElementById("adminPinModal");
  const adminPinForm = document.getElementById("adminPinForm");
  const adminPinInput = document.getElementById("adminPinInput");
  const adminPinError = document.getElementById("adminPinError");
  const closeAdminPinBtn = document.getElementById("closeAdminPinBtn");
  const cancelAdminPinBtn = document.getElementById("cancelAdminPinBtn");
  const openAddBtn = document.getElementById("openAddProductBtn");
  const adminDedicatedPanel = document.getElementById("adminDedicatedPanel");
  const exitAdminPanelBtn = document.getElementById("exitAdminPanelBtn");

  const navAdminBtn = document.getElementById("navAdminBtn");
  const navAdminLabel = document.getElementById("navAdminLabel");
  const navAdminLockIcon = document.getElementById("navAdminLockIcon");

  const mobileAdminBtn = document.getElementById("mobileAdminBtn");
  const mobileAdminLabel = document.getElementById("mobileAdminLabel");
  const mobileAdminLockIcon = document.getElementById("mobileAdminLockIcon");

  function closeAdminPinModal() {
    if (adminPinModal) {
      adminPinModal.classList.add("hidden");
      adminPinModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
    if (adminPinInput) adminPinInput.value = "";
    if (adminPinError) adminPinError.classList.add("hidden");
  }

  function openAdminPinModal() {
    if (adminPinModal) {
      adminPinModal.classList.remove("hidden");
      adminPinModal.classList.add("flex");
      document.body.style.overflow = "hidden";
      if (adminPinError) adminPinError.classList.add("hidden");
      if (adminPinInput) {
        adminPinInput.value = "";
        setTimeout(() => adminPinInput.focus(), 100);
      }
    }
  }

  function updateAdminModeUI() {
    if (isAdminMode) {
      // 1. Tampilkan Panel Khusus Admin di dalam katalog
      if (adminDedicatedPanel) {
        adminDedicatedPanel.classList.remove("hidden");
      }

      // 2. Ubah Status Tombol di Navbar Desktop
      if (navAdminBtn) {
        navAdminBtn.classList.add("bg-emerald-100", "border-emerald-400", "text-emerald-900");
        navAdminBtn.classList.remove("bg-brand-cream-soft", "text-brand-brown");
      }
      if (navAdminLabel) navAdminLabel.textContent = "Keluar Admin";
      if (navAdminLockIcon) navAdminLockIcon.setAttribute("data-lucide", "lock-open");

      // 3. Ubah Status Tombol di Mobile Menu
      if (mobileAdminBtn) {
        mobileAdminBtn.classList.add("bg-emerald-100", "border-emerald-400", "text-emerald-900");
        mobileAdminBtn.classList.remove("bg-brand-cream-soft", "text-brand-brown");
      }
      if (mobileAdminLabel) mobileAdminLabel.textContent = "Keluar Mode Admin";
      if (mobileAdminLockIcon) mobileAdminLockIcon.setAttribute("data-lucide", "lock-open");

    } else {
      // 1. Sembunyikan Panel Khusus Admin di katalog untuk pengunjung umum
      if (adminDedicatedPanel) {
        adminDedicatedPanel.classList.add("hidden");
      }

      // 2. Kembalikan Status Tombol di Navbar Desktop
      if (navAdminBtn) {
        navAdminBtn.classList.remove("bg-emerald-100", "border-emerald-400", "text-emerald-900");
        navAdminBtn.classList.add("bg-brand-cream-soft", "text-brand-brown");
      }
      if (navAdminLabel) navAdminLabel.textContent = "Mode Admin";
      if (navAdminLockIcon) navAdminLockIcon.setAttribute("data-lucide", "lock");

      // 3. Kembalikan Status Tombol di Mobile Menu
      if (mobileAdminBtn) {
        mobileAdminBtn.classList.remove("bg-emerald-100", "border-emerald-400", "text-emerald-900");
        mobileAdminBtn.classList.add("bg-brand-cream-soft", "text-brand-brown");
      }
      if (mobileAdminLabel) mobileAdminLabel.textContent = "Mode Admin (Pengelola)";
      if (mobileAdminLockIcon) mobileAdminLockIcon.setAttribute("data-lucide", "lock");
    }

    initLucide();
    renderCatalogGrid();
    renderBestSellers();
    renderTestimonials();
  }

  // Handler Klik Tombol Mode Admin (Navbar Desktop & Mobile)
  const handleAdminToggleClick = () => {
    if (isAdminMode) {
      isAdminMode = false;
      updateAdminModeUI();
      showToast("Mode Admin telah dinonaktifkan.", "info");
    } else {
      openAdminPinModal();
    }
  };

  if (navAdminBtn) navAdminBtn.addEventListener("click", handleAdminToggleClick);
  if (mobileAdminBtn) mobileAdminBtn.addEventListener("click", handleAdminToggleClick);
  if (exitAdminPanelBtn) exitAdminPanelBtn.addEventListener("click", () => {
    isAdminMode = false;
    updateAdminModeUI();
    showToast("Mode Admin dinonaktifkan. Katalog kembali ke tampilan umum.", "info");
  });

  if (closeAdminPinBtn) closeAdminPinBtn.addEventListener("click", closeAdminPinModal);
  if (cancelAdminPinBtn) cancelAdminPinBtn.addEventListener("click", closeAdminPinModal);
  if (adminPinModal) {
    adminPinModal.addEventListener("click", (e) => {
      if (e.target === adminPinModal) closeAdminPinModal();
    });
  }

  if (adminPinForm) {
    adminPinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredPin = (adminPinInput ? adminPinInput.value : "").trim();
      
      // Validasi PIN 2026
      if (enteredPin === "2026") {
        isAdminMode = true;
        closeAdminPinModal();
        updateAdminModeUI();
        showToast("Mode Admin aktif. Anda dapat menambah dan mengedit menu produk.", "success");
      } else {
        if (adminPinError) adminPinError.classList.remove("hidden");
        if (adminPinInput) {
          adminPinInput.value = "";
          adminPinInput.focus();
        }
      }
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

  grid.innerHTML = filtered.map((item, index) => {
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
      <div data-aos="fade-up" data-aos-duration="700" data-aos-delay="${Math.min((index % 6) * 100, 500)}" class="bg-white rounded-3xl overflow-hidden border border-brand-gold-light/80 hover:border-brand-gold hover:shadow-warm hover-lift transition-all duration-300 flex flex-col group relative">
        
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
  refreshAOS();
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
          const updatedProduct = {
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

          productsList[index] = updatedProduct;
          showToast(`Menu "${name}" berhasil diperbarui!`, "success");

          // PERBARUI DI SUPABASE (Update)
          if (typeof getSupabaseClient === "function") {
            const sb = getSupabaseClient();
            if (sb) {
              sb.from("products").update(formatProductForDb(updatedProduct)).eq("id", editId).then(({ error }) => {
                if (error) {
                  console.error("Supabase update error:", error);
                  showToast(`Update lokal sukses, gagal sync Supabase: ${error.message}`, "warning");
                } else {
                  showToast(`Menu "${name}" berhasil diperbarui di Supabase & otomatis tersinkron ke semua HP!`, "success");
                }
              }).catch(err => {
                console.error("Gagal update ke Supabase:", err);
              });
            }
          }
        }
      } else {
        // Create New Product Mode (Insert)
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

        // SIMPAN KE SUPABASE (Insert)
        if (typeof getSupabaseClient === "function") {
          const sb = getSupabaseClient();
          if (sb) {
            sb.from("products").insert([formatProductForDb(newProduct)]).then(({ error }) => {
              if (error) {
                console.error("Supabase insert error:", error);
                showToast(`Menu tersimpan lokal, namun gagal sync Supabase: ${error.message}`, "warning");
              } else {
                showToast(`Menu "${name}" berhasil disimpan di Supabase & otomatis tampil di semua HP!`, "success");
              }
            }).catch(err => {
              console.error("Gagal koneksi Supabase:", err);
              showToast(`Gagal kirim ke Supabase: ${err.message}`, "warning");
            });
          }
        }
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
        const deleteId = pendingDeleteProductId;
        productsList = productsList.filter(p => p.id !== pendingDeleteProductId);
        saveProductsToStorage();
        renderCatalogGrid();
        renderBestSellers();
        showToast(`Menu "${name}" berhasil dihapus dari katalog.`, "warning");

        // HAPUS DARI SUPABASE (Delete)
        if (typeof getSupabaseClient === "function") {
          const sb = getSupabaseClient();
          if (sb) {
            sb.from("products").delete().eq("id", deleteId).then(({ error }) => {
              if (error) {
                console.error("Supabase delete error:", error);
              } else {
                showToast(`Menu "${name}" berhasil dihapus dari database online Supabase.`, "warning");
              }
            }).catch(err => {
              console.error("Gagal delete Supabase:", err);
            });
          }
        }
      }
      deleteModal.classList.add("hidden");
      deleteModal.classList.remove("flex");
      pendingDeleteProductId = null;
    });
  }
}

// Open Add Product Modal Function
window.openAddProductModal = function() {
  if (!isAdminMode) {
    showToast("Akses ditolak: Silakan masuk ke Mode Admin dengan PIN terlebih dahulu.", "warning");
    return;
  }

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
  if (!isAdminMode) {
    showToast("Akses ditolak: Hanya admin yang dapat mengedit menu.", "warning");
    return;
  }

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
  if (!isAdminMode) {
    showToast("Akses ditolak: Hanya admin yang dapat menghapus menu.", "warning");
    return;
  }

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

// 5b. Interactive Testimonials & Customer Rating Management
function initTestimonialsManagement() {
  const openBtn = document.getElementById("openAddTestimonialBtn");
  const modal = document.getElementById("testimonialModal");
  const closeBtn = document.getElementById("closeTestimonialModalBtn");
  const cancelBtn = document.getElementById("cancelTestimonialBtn");
  const form = document.getElementById("testimonialForm");
  const starBtns = document.querySelectorAll("#starPicker .star-btn");
  const ratingInput = document.getElementById("selectedRatingInput");
  const ratingLabel = document.getElementById("starRatingLabel");
  const authorNameInput = document.getElementById("reviewAuthorName");
  const authorCityInput = document.getElementById("reviewCity");
  const authorRoleInput = document.getElementById("reviewRole");
  const menuSelect = document.getElementById("reviewMenuEnjoyed");
  const commentInput = document.getElementById("reviewComment");
  const submitBtn = document.getElementById("submitTestimonialBtn");

  const ratingDescriptions = {
    1: "⭐ 1 / 5 - Kecewa / Perlu Ditingkatkan",
    2: "⭐⭐ 2 / 5 - Kurang Memuaskan",
    3: "⭐⭐⭐ 3 / 5 - Cukup Enak & Standar",
    4: "⭐⭐⭐⭐ 4 / 5 - Puas & Enak Sekali",
    5: "⭐⭐⭐⭐⭐ 5 / 5 - Sangat Puas & Sangat Lezat!"
  };

  const updateStarPickerUI = (val) => {
    const rating = Math.min(5, Math.max(1, parseInt(val, 10) || 5));
    if (ratingInput) ratingInput.value = rating;
    if (ratingLabel) ratingLabel.textContent = ratingDescriptions[rating] || `${rating} / 5 Bintang`;

    starBtns.forEach(btn => {
      const star = parseInt(btn.getAttribute("data-star"), 10);
      const icon = btn.querySelector("i");
      if (icon) {
        if (star <= rating) {
          icon.setAttribute("class", "w-7 h-7 fill-amber-400 text-amber-400");
        } else {
          icon.setAttribute("class", "w-7 h-7 fill-none text-gray-300");
        }
      }
    });
    initLucide();
  };

  // Bind klik tombol rating bintang
  starBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const star = parseInt(btn.getAttribute("data-star"), 10);
      updateStarPickerUI(star);
    });
  });

  // Isi dropdown pilihan menu secara dinamis dari produk katalog
  const populateMenuDropdown = () => {
    if (!menuSelect) return;
    const currentVal = menuSelect.value;
    const defaultMenus = [
      "Mi Instan LezatMU Rasa Ayam Bawang",
      "Mi Instan LezatMU Mi Goreng",
      "Mi Instan LezatMU Kuah Rasa Soto",
      "Semua Varian Mi LezatMU"
    ];

    const uniqueMenus = new Set(defaultMenus);
    if (Array.isArray(productsList)) {
      productsList.forEach(p => {
        if (p && p.name) uniqueMenus.add(p.name);
      });
    }

    menuSelect.innerHTML = Array.from(uniqueMenus).map(m => `
      <option value="${escapeHtml(m)}">${escapeHtml(m)}</option>
    `).join("");

    if (currentVal && uniqueMenus.has(currentVal)) {
      menuSelect.value = currentVal;
    }
  };

  const openModal = () => {
    if (form) form.reset();
    updateStarPickerUI(5);
    populateMenuDropdown();
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
      if (authorNameInput) setTimeout(() => authorNameInput.focus(), 120);
    }
    initLucide();
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  };

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Submit Testimoni Baru
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = authorNameInput ? authorNameInput.value.trim() : "";
      const city = authorCityInput ? authorCityInput.value.trim() : "";
      const role = authorRoleInput ? authorRoleInput.value.trim() : "";
      const menu = menuSelect ? menuSelect.value.trim() : "Mi Instan LezatMU";
      const comment = commentInput ? commentInput.value.trim() : "";
      const rating = ratingInput ? (parseInt(ratingInput.value, 10) || 5) : 5;

      if (!name || !city || !comment) {
        showToast("Mohon isi Nama, Domisili, dan Komentar ulasan Anda.", "warning");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Mengirim Ulasan...</span>
        `;
      }

      const newTestimonial = {
        id: "testi-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        name: name,
        role: role || "Pelanggan Setia LezatMU",
        city: city,
        rating: rating,
        comment: comment,
        menuEnjoyed: menu,
        createdAt: new Date().toISOString()
      };

      // 1. Simpan ke local state & LocalStorage agar langsung tampil
      testimonialsList.unshift(newTestimonial);
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonialsList));
      renderTestimonials();

      // 2. Kirim ke Supabase Cloud Database (async)
      try {
        if (typeof getSupabaseClient === "function") {
          const sb = getSupabaseClient();
          if (sb) {
            const { error } = await sb.from("testimonials").insert([{
              id: newTestimonial.id,
              name: newTestimonial.name,
              role: newTestimonial.role,
              city: newTestimonial.city,
              rating: newTestimonial.rating,
              comment: newTestimonial.comment,
              menu_enjoyed: newTestimonial.menuEnjoyed,
              created_at: newTestimonial.createdAt
            }]);

            if (error) {
              console.warn("Gagal simpan testimoni ke Supabase:", error.message);
            } else {
              console.log("Testimoni berhasil tersimpan ke Supabase Cloud!");
            }
          }
        }
      } catch (err) {
        console.warn("Koneksi Supabase error saat kirim ulasan:", err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Kirim Ulasan &amp; Rating</span>
          `;
          initLucide();
        }
      }

      closeModal();
      showToast("Terima kasih! Ulasan & rating bintang Anda berhasil dipublikasikan.", "success");

      const testimonialsSection = document.getElementById("testimonialsContainer");
      if (testimonialsSection) {
        testimonialsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }
}

// Global Trigger Delete Testimonial (Admin Mode Only)
async function triggerDeleteTestimonial(id) {
  if (!isAdminMode) {
    showToast("Akses ditolak: Masuk Mode Admin dengan PIN 2026 terlebih dahulu.", "warning");
    return;
  }

  const item = testimonialsList.find(t => t.id === id);
  const authorName = item ? item.name : "ulasan ini";

  if (!confirm(`Hapus ulasan testimoni dari "${authorName}"? Tindakan ini akan menghapus ulasan di semua perangkat (HP A & HP B).`)) {
    return;
  }

  showToast(`Sedang menghapus ulasan "${authorName}" dari database cloud...`, "info");

  // 1. Hapus dari database cloud Supabase
  let cloudDeleted = false;
  if (typeof getSupabaseClient === "function") {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { error } = await sb.from("testimonials").delete().eq("id", id);
        if (error) {
          console.error("Gagal menghapus testimoni di Supabase:", error);
          showToast(`Peringatan cloud: ${error.message}`, "warning");
        } else {
          cloudDeleted = true;
        }
      } catch (err) {
        console.error("Koneksi Supabase error saat hapus:", err);
      }
    }
  }

  // 2. Hapus dari state lokal & LocalStorage
  testimonialsList = testimonialsList.filter(t => t.id !== id);
  if (testimonialsList.length === 0) {
    testimonialsList = getBaselineTestimonials();
  }
  localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonialsList));
  renderTestimonials();

  if (cloudDeleted) {
    showToast(`Ulasan dari "${authorName}" berhasil dihapus dari cloud & semua HP!`, "success");
  } else {
    showToast(`Ulasan dari "${authorName}" telah dihapus.`, "info");
  }
}
window.triggerDeleteTestimonial = triggerDeleteTestimonial;

// Realtime Listener untuk Sinkronisasi Lintas Perangkat (HP A & HP B)
function initRealtimeTestimonials() {
  if (typeof getSupabaseClient !== "function") return;
  const sb = getSupabaseClient();
  if (!sb || typeof sb.channel !== "function") return;

  try {
    sb.channel("lezatmu_live_sync_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "testimonials" },
        (payload) => {
          console.log("Realtime event testimonials:", payload.eventType);
          fetchTestimonialsFromSupabase(false);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Realtime event products:", payload.eventType);
          fetchProductsFromSupabase(false);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Supabase Realtime Channel aktif: perubahan di HP A langsung tampil di HP B.");
        }
      });
  } catch (err) {
    console.warn("Realtime Supabase subscription error:", err);
  }
}

// Auto-sync saat layar HP dibuka kembali / window fokus / interval berkala
function initAutoSyncListeners() {
  // 1. Saat pengguna beralih atau membuka kembali tab browser di HP
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      fetchTestimonialsFromSupabase(false);
      fetchProductsFromSupabase(false);
    }
  });

  window.addEventListener("focus", () => {
    fetchTestimonialsFromSupabase(false);
    fetchProductsFromSupabase(false);
  });

  // 2. Polling otomatis berkala setiap 8 detik agar HP lain yang diletakkan tetap sinkron tanpa perlu refresh
  setInterval(() => {
    if (!document.hidden) {
      fetchTestimonialsFromSupabase(false);
    }
  }, 8000);
}

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
      const testimonialModal = document.getElementById("testimonialModal");
      if (testimonialModal && !testimonialModal.classList.contains("hidden")) {
        testimonialModal.classList.add("hidden");
        testimonialModal.classList.remove("flex");
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

  content.innerHTML = `
    <div class="relative h-64 sm:h-72 overflow-hidden rounded-t-3xl bg-brand-cream-soft">
      <img 
        src="${item.image}" 
        alt="${item.name}" 
        class="w-full h-full object-cover"
        onerror="this.src='https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop'"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/90 via-black/30 to-transparent"></div>
      
      ${isAdminMode ? `
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
      ` : ''}

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

        <button 
          onclick="openWaChooser('Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara, saya tertarik dengan menu: *${item.name}* (${item.categoryLabel || 'Menu Mie'}). Mohon informasi rekomendasi porsi dan pemesanan.')" 
          class="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition"
        >
          <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          <span>Tanya Menu Ini via WhatsApp Admin Serpong Utara</span>
        </button>
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
        <button 
          onclick="openWaChooser('Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara, saya baru membaca artikel \\'${article.title}\\' dan ingin berdiskusi lebih lanjut.')" 
          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          <span>Diskusikan dengan Kami</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  initLucide();
};

// Render Articles Grid dynamically from culinaryData.articles
window.renderArticles = function() {
  const grid = document.getElementById("articlesGrid");
  if (!grid || !window.culinaryData || !window.culinaryData.articles) return;

  const entries = Object.entries(window.culinaryData.articles);
  if (entries.length === 0) return;

  grid.innerHTML = entries.map(([id, article], idx) => {
    const badgeColor = id === "article-1" 
      ? "bg-brand-brown-dark/80 backdrop-blur-sm text-brand-gold-light" 
      : id === "article-2" 
        ? "bg-brand-accent text-white" 
        : "bg-emerald-700 text-white";
    const badgeText = article.badge || (article.category ? article.category.replace("Varian ", "") : "LezatMU");
    const excerpt = article.excerpt || "Nikmati inovasi mie instan sehat berbahan mocaf dan kunyit alami dari PT Azam Tawaqal Berkemajuan.";

    return `
      <article data-aos="fade-up" data-aos-duration="750" data-aos-delay="${idx * 150}" class="bg-brand-cream-soft rounded-3xl overflow-hidden border border-brand-gold-light hover:shadow-warm hover-lift transition-all duration-300 flex flex-col group">
        <div class="relative h-48 overflow-hidden bg-brand-cream">
          <img 
            src="${article.image}?v=2" 
            alt="${article.title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.src='${article.image}'"
          >
          <span class="absolute top-3 left-3 ${badgeColor} text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            ${badgeText}
          </span>
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="text-xs text-brand-brown-light mb-2 flex items-center gap-2">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>${article.date || '12 Oktober 2026'}</span>
              <span>&bull;</span>
              <span>Baca ${article.readTime || '4 Menit'}</span>
            </div>
            <h3 class="font-serif font-bold text-lg text-brand-brown-dark group-hover:text-brand-accent transition mb-2">
              ${article.title}
            </h3>
            <p class="text-xs sm:text-sm text-brand-brown-light leading-relaxed line-clamp-3">
              ${excerpt}
            </p>
          </div>
          <button onclick="openArticleModal('${id}')" class="mt-4 text-xs font-bold text-brand-accent inline-flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
            <span>Baca Selengkapnya</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </article>
    `;
  }).join("");

  initLucide();
  refreshAOS();
};

// 7. Fast Consultation Form
function initConsultationForm() {
  const form = document.getElementById("waConsultationForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const adminTarget = document.getElementById("consultAdminTarget") ? document.getElementById("consultAdminTarget").value : "rahmat";
    const name = document.getElementById("consultName").value.trim();
    const topic = document.getElementById("consultTopic").value;
    const message = document.getElementById("consultMessage").value.trim();

    const targetName = adminTarget === "meiva" ? "Kak Meiva" : "Pak Rahmat";
    const targetPhone = adminTarget === "meiva" ? "6289528870832" : "6281314505175";

    const formattedMessage = `Halo ${targetName} (Admin PT Azzam Tawaqal Berkemajuan - LEZATMU Serpong Utara),\n\nPerkenalkan saya *${name}*.\n*Topik Keperluan:* ${topic}\n*Pesan / Detail:* ${message || 'Saya ingin berkonsultasi mengenai menu mie dan pemesanan LEZATMU di Tangerang Selatan.'}\n\nTerima kasih.`;
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(formattedMessage)}`;

    window.open(waUrl, "_blank");
  });
}

// 8. WhatsApp Dual-Admin Contact Chooser System (Pak Rahmat & Kak Meiva)
let currentWaPendingMessage = "Halo Admin PT Azzam Tawaqal Berkemajuan (LEZATMU) Serpong Utara, saya ingin tanya informasi produk.";

const WA_CONTACTS = {
  rahmat: {
    name: "Pak Rahmat",
    phone: "6281314505175",
    role: "Admin Pengelola & Kemitraan"
  },
  meiva: {
    name: "Kak Meiva",
    phone: "6289528870832",
    role: "Customer Care & Info Produk"
  }
};

function openWaChooser(customMessage, preselectedAdmin = null) {
  if (customMessage) {
    currentWaPendingMessage = customMessage;
  }
  
  if (preselectedAdmin && WA_CONTACTS[preselectedAdmin]) {
    proceedToWa(preselectedAdmin);
    return;
  }

  const modal = document.getElementById("waChooserModal");
  const preview = document.getElementById("waChooserMessagePreview");
  if (preview) {
    preview.textContent = `"${currentWaPendingMessage}"`;
  }
  
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
  initLucide();
}

function closeWaChooser() {
  const modal = document.getElementById("waChooserModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function proceedToWa(adminKey) {
  const contact = WA_CONTACTS[adminKey] || WA_CONTACTS.rahmat;
  let finalMessage = currentWaPendingMessage;
  
  // Format message jika belum memiliki greeting admin spesifik
  if (!finalMessage.includes("Pak Rahmat") && !finalMessage.includes("Kak Meiva")) {
    finalMessage = finalMessage.replace(/Halo Admin PT Azzam Tawaqal Berkemajuan/g, `Halo ${contact.name} (Admin PT Azzam Tawaqal Berkemajuan)`);
  }

  const waUrl = `https://wa.me/${contact.phone}?text=${encodeURIComponent(finalMessage)}`;
  window.open(waUrl, "_blank");
  closeWaChooser();
}

// 9. ScrollSpy & Navigation Active Link Indicator
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

// 10. Cross-Device Synchronization & Server Export Management
function initSyncManagement() {
  const openSyncBtn = document.getElementById("openSyncModalBtn");
  const syncModal = document.getElementById("syncModal");
  const closeSyncBtn = document.getElementById("closeSyncModalBtn");

  const tabExportBtn = document.getElementById("syncTabExportBtn");
  const tabImportBtn = document.getElementById("syncTabImportBtn");
  const tabCloudBtn = document.getElementById("syncTabCloudBtn");

  const tabExport = document.getElementById("syncTabExport");
  const tabImport = document.getElementById("syncTabImport");
  const tabCloud = document.getElementById("syncTabCloud");

  const syncExportCode = document.getElementById("syncExportCode");
  const syncExportCount = document.getElementById("syncExportCount");
  const copySyncCodeBtn = document.getElementById("copySyncCodeBtn");
  const shareSyncWaBtn = document.getElementById("shareSyncWaBtn");

  const syncImportInput = document.getElementById("syncImportInput");
  const applySyncImportBtn = document.getElementById("applySyncImportBtn");

  const cloudDbUrlInput = document.getElementById("cloudDbUrlInput");
  const cloudDbStatusText = document.getElementById("cloudDbStatusText");
  const saveCloudDbBtn = document.getElementById("saveCloudDbBtn");
  const testCloudDbBtn = document.getElementById("testCloudDbBtn");
  const resetCloudDbBtn = document.getElementById("resetCloudDbBtn");

  // Export Data Modal Elements
  const openExportBtn = document.getElementById("openExportDataBtn");
  const exportDataModal = document.getElementById("exportDataModal");
  const closeExportBtn = document.getElementById("closeExportDataModalBtn");
  const exportDataJsCode = document.getElementById("exportDataJsCode");
  const copyDataJsBtn = document.getElementById("copyDataJsBtn");
  const downloadDataJsBtn = document.getElementById("downloadDataJsBtn");

  // Helper to switch tabs
  const setTab = (activeTab) => {
    [tabExport, tabImport, tabCloud].forEach(el => {
      if (el) el.classList.add("hidden");
    });
    [tabExportBtn, tabImportBtn, tabCloudBtn].forEach(btn => {
      if (btn) {
        btn.classList.remove("border-blue-600", "text-blue-700", "font-bold");
        btn.classList.add("border-transparent", "text-gray-500", "font-semibold");
      }
    });

    if (activeTab === "export" && tabExport && tabExportBtn) {
      tabExport.classList.remove("hidden");
      tabExportBtn.classList.add("border-blue-600", "text-blue-700", "font-bold");
      tabExportBtn.classList.remove("border-transparent", "text-gray-500");
    } else if (activeTab === "import" && tabImport && tabImportBtn) {
      tabImport.classList.remove("hidden");
      tabImportBtn.classList.add("border-blue-600", "text-blue-700", "font-bold");
      tabImportBtn.classList.remove("border-transparent", "text-gray-500");
    } else if (activeTab === "cloud" && tabCloud && tabCloudBtn) {
      tabCloud.classList.remove("hidden");
      tabCloudBtn.classList.add("border-blue-600", "text-blue-700", "font-bold");
      tabCloudBtn.classList.remove("border-transparent", "text-gray-500");
    }
  };

  if (tabExportBtn) tabExportBtn.addEventListener("click", () => setTab("export"));
  if (tabImportBtn) tabImportBtn.addEventListener("click", () => setTab("import"));
  if (tabCloudBtn) tabCloudBtn.addEventListener("click", () => setTab("cloud"));

  // Helper to generate sync payload
  const generateSyncPayload = () => {
    try {
      const jsonStr = JSON.stringify(productsList);
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      return `lezatmu_sync_v1:${b64}`;
    } catch (e) {
      return JSON.stringify(productsList);
    }
  };

  // Helper to update sync export text
  const refreshSyncExportText = () => {
    if (syncExportCount) syncExportCount.textContent = productsList.length;
    if (syncExportCode) syncExportCode.value = generateSyncPayload();
  };

  // Open & Close Sync Modal
  if (openSyncBtn) {
    openSyncBtn.addEventListener("click", () => {
      if (!isAdminMode) {
        showToast("Akses ditolak: Silakan masuk Mode Admin dengan PIN 2026 terlebih dahulu.", "warning");
        return;
      }
      refreshSyncExportText();
      const currentUrl = localStorage.getItem(CLOUD_DB_KEY) || "";
      if (cloudDbUrlInput) cloudDbUrlInput.value = currentUrl;
      if (cloudDbStatusText) {
        if (currentUrl) {
          cloudDbStatusText.textContent = `Terhubung: ${currentUrl.substring(0, 35)}...`;
          cloudDbStatusText.className = "font-bold text-emerald-700";
        } else {
          cloudDbStatusText.textContent = "Mode Lokal (Memori Browser)";
          cloudDbStatusText.className = "font-bold text-amber-700";
        }
      }
      setTab("export");
      if (syncModal) {
        syncModal.classList.remove("hidden");
        syncModal.classList.add("flex");
        document.body.style.overflow = "hidden";
      }
      initLucide();
    });
  }

  const closeSync = () => {
    if (syncModal) {
      syncModal.classList.add("hidden");
      syncModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  };

  if (closeSyncBtn) closeSyncBtn.addEventListener("click", closeSync);
  if (syncModal) {
    syncModal.addEventListener("click", (e) => {
      if (e.target === syncModal) closeSync();
    });
  }

  // Copy Sync Code
  if (copySyncCodeBtn && syncExportCode) {
    copySyncCodeBtn.addEventListener("click", () => {
      syncExportCode.select();
      navigator.clipboard.writeText(syncExportCode.value).then(() => {
        showToast("Kode sinkronisasi berhasil disalin ke clipboard! Kirimkan ke HP B.", "success");
      }).catch(() => {
        document.execCommand("copy");
        showToast("Kode sinkronisasi berhasil disalin!", "success");
      });
    });
  }

  // Share via WhatsApp
  if (shareSyncWaBtn && syncExportCode) {
    shareSyncWaBtn.addEventListener("click", () => {
      const code = syncExportCode.value;
      const count = productsList.length;
      const waMsg = `*KODE SINKRONISASI MENU LEZATMU (${count} MENU)*\n\nSalin kode di bawah ini, buka web LezatMU di HP B, masuk Mode Admin (PIN 2026), lalu pilih *Sinkronisasi Antar HP* -> *2. Pasang di HP B*:\n\n${code}`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, "_blank");
    });
  }

  // Apply Imported Code on HP B
  if (applySyncImportBtn && syncImportInput) {
    applySyncImportBtn.addEventListener("click", () => {
      const raw = syncImportInput.value.trim();
      if (!raw) {
        showToast("Silakan tempelkan kode sinkronisasi terlebih dahulu.", "warning");
        return;
      }

      let parsed = null;
      try {
        if (raw.startsWith("lezatmu_sync_v1:")) {
          const b64 = raw.replace("lezatmu_sync_v1:", "");
          const decoded = decodeURIComponent(escape(atob(b64)));
          parsed = JSON.parse(decoded);
        } else {
          parsed = JSON.parse(raw);
        }
      } catch (e) {
        showToast("Kode sinkronisasi tidak valid. Mohon salin ulang dari HP A.", "error");
        return;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        showToast("Format data menu tidak sesuai.", "error");
        return;
      }

      // Update product list
      productsList = parsed;
      saveProductsToStorage(true);
      renderCatalogGrid();
      renderBestSellers();
      showToast(`Berhasil! ${parsed.length} menu berhasil dipasang dan tersimpan di HP ini.`, "success");
      syncImportInput.value = "";
      closeSync();
    });
  }

  // Cloud DB handlers
  if (saveCloudDbBtn && cloudDbUrlInput) {
    saveCloudDbBtn.addEventListener("click", () => {
      const url = cloudDbUrlInput.value.trim();
      if (!url) {
        showToast("Masukkan URL Cloud Database yang valid.", "warning");
        return;
      }
      localStorage.setItem(CLOUD_DB_KEY, url);
      if (cloudDbStatusText) {
        cloudDbStatusText.textContent = `Terhubung: ${url.substring(0, 35)}...`;
        cloudDbStatusText.className = "font-bold text-emerald-700";
      }
      showToast("URL Cloud Database berhasil disimpan!", "success");
      syncToCloudDb(productsList);
    });
  }

  if (testCloudDbBtn) {
    testCloudDbBtn.addEventListener("click", async () => {
      showToast("Sedang mencoba menyinkronkan dengan Cloud...", "info");
      await checkAndSyncFromCloud(false);
    });
  }

  if (resetCloudDbBtn && cloudDbUrlInput) {
    resetCloudDbBtn.addEventListener("click", () => {
      localStorage.removeItem(CLOUD_DB_KEY);
      cloudDbUrlInput.value = "";
      if (cloudDbStatusText) {
        cloudDbStatusText.textContent = "Mode Lokal (Memori Browser)";
        cloudDbStatusText.className = "font-bold text-amber-700";
      }
      showToast("URL Cloud Database telah dihapus. Kembali ke Mode Lokal.", "info");
    });
  }

  // Export data.js handlers
  const generateDataJsContent = () => {
    const productsJson = JSON.stringify(productsList, null, 2);
    const testimonialsJson = JSON.stringify(culinaryData.testimonials, null, 2);
    const articlesJson = JSON.stringify(culinaryData.articles, null, 2);

    return `/**
 * Database Data for PT Azzam Tawaqal Berkemajuan (LEZATMU)
 * BUMM PCM Serpong Utara, Kota Tangerang Selatan, Banten
 * Produk Resmi: Mi Instan LezatMU Sehat Berbahan Mocaf & Kunyit Alami
 * Terakhir Diperbarui: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
 */

const culinaryData = {
  products: ${productsJson},

  testimonials: ${testimonialsJson},

  articles: ${articlesJson}
};
`;
  };

  if (openExportBtn) {
    openExportBtn.addEventListener("click", () => {
      if (!isAdminMode) {
        showToast("Akses ditolak: Silakan masuk Mode Admin dengan PIN 2026 terlebih dahulu.", "warning");
        return;
      }
      if (exportDataJsCode) {
        exportDataJsCode.value = generateDataJsContent();
      }
      if (exportDataModal) {
        exportDataModal.classList.remove("hidden");
        exportDataModal.classList.add("flex");
        document.body.style.overflow = "hidden";
      }
      initLucide();
    });
  }

  const closeExport = () => {
    if (exportDataModal) {
      exportDataModal.classList.add("hidden");
      exportDataModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  };

  if (closeExportBtn) closeExportBtn.addEventListener("click", closeExport);
  if (exportDataModal) {
    exportDataModal.addEventListener("click", (e) => {
      if (e.target === exportDataModal) closeExport();
    });
  }

  // Copy data.js
  if (copyDataJsBtn && exportDataJsCode) {
    copyDataJsBtn.addEventListener("click", () => {
      exportDataJsCode.select();
      navigator.clipboard.writeText(exportDataJsCode.value).then(() => {
        showToast("Kode berkas data.js berhasil disalin! Tinggal ditempel ke file js/data.js.", "success");
      }).catch(() => {
        document.execCommand("copy");
        showToast("Kode berkas data.js berhasil disalin!", "success");
      });
    });
  }

  // Download data.js
  if (downloadDataJsBtn && exportDataJsCode) {
    downloadDataJsBtn.addEventListener("click", () => {
      const content = exportDataJsCode.value;
      const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.js";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Berkas data.js berhasil diunduh!", "success");
    });
  }
}

// 11. Supabase Cloud Database Management & Helper Handlers
function initSupabaseManagement() {
  const openBtn = document.getElementById("openSupabaseModalBtn");
  const modal = document.getElementById("supabaseModal");
  const closeBtn = document.getElementById("closeSupabaseModalBtn");

  const urlInput = document.getElementById("sbUrlInput");
  const keyInput = document.getElementById("sbKeyInput");
  const saveBtn = document.getElementById("saveSupabaseCredentialsBtn");
  const fetchBtn = document.getElementById("fetchFromSupabaseBtn");
  const seedBtn = document.getElementById("seedSupabaseBtn");
  const quickTestBtn = document.getElementById("quickTestSupabaseBtn");
  const copySqlBtn = document.getElementById("copySqlScriptBtn");
  const sqlScriptText = document.getElementById("sqlScriptText");

  const statusCard = document.getElementById("supabaseStatusCard");
  const statusDot = document.getElementById("supabaseStatusDot");
  const statusTitle = document.getElementById("supabaseStatusTitle");
  const statusDesc = document.getElementById("supabaseStatusDesc");

  const SQL_SCRIPT = `-- 1. Buat Tabel products untuk Mi Instan LezatMU
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'utama',
  category_label TEXT,
  image TEXT,
  taste_description TEXT,
  full_story TEXT,
  main_ingredients JSONB DEFAULT '[]'::JSONB,
  spice_level INT DEFAULT 0,
  sweet_level INT DEFAULT 0,
  serving_suggestion TEXT,
  allergens TEXT,
  is_best_seller BOOLEAN DEFAULT FALSE,
  badge TEXT,
  portions_sold TEXT DEFAULT '100+',
  rating NUMERIC DEFAULT 4.9,
  review_count INT DEFAULT 10,
  why_favorite TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan: Semua orang / HP B bisa melihat menu (SELECT)
CREATE POLICY "Public Read Access" 
ON products FOR SELECT 
USING (true);

-- 4. Kebijakan: Mode Admin bisa menambah menu (INSERT)
CREATE POLICY "Public Insert Access" 
ON products FOR INSERT 
WITH CHECK (true);

-- 5. Kebijakan: Mode Admin bisa mengedit menu (UPDATE)
CREATE POLICY "Public Update Access" 
ON products FOR UPDATE 
USING (true);

-- 6. Kebijakan: Mode Admin bisa menghapus menu (DELETE)
CREATE POLICY "Public Delete Access" 
ON products FOR DELETE 
USING (true);

-- 7. Buat Tabel testimonials untuk Rating & Ulasan Konsumen
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Pelanggan Setia LezatMU',
  city TEXT DEFAULT 'Tangerang Selatan',
  rating INT DEFAULT 5,
  comment TEXT NOT NULL,
  menu_enjoyed TEXT DEFAULT 'Mi Instan LezatMU',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- 8. Aktifkan Row Level Security (RLS) Testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 9. Kebijakan Akses Testimonials
CREATE POLICY "Public Read Testimonials" 
ON testimonials FOR SELECT 
USING (true);

CREATE POLICY "Public Insert Testimonials" 
ON testimonials FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public Delete Testimonials" 
ON testimonials FOR DELETE 
USING (true);`;

  if (sqlScriptText) {
    sqlScriptText.value = SQL_SCRIPT;
  }

  const updateStatusUI = () => {
    const configured = typeof isSupabaseConfigured === "function" && isSupabaseConfigured();
    const currentUrl = localStorage.getItem("lezatmu_supabase_url") || "";

    if (configured) {
      if (statusCard) {
        statusCard.className = "p-4 rounded-2xl border flex items-center justify-between text-xs transition bg-emerald-50 border-emerald-300 text-emerald-950";
      }
      if (statusDot) {
        statusDot.className = "w-3 h-3 rounded-full bg-emerald-500";
      }
      if (statusTitle) statusTitle.textContent = "Status: Terhubung ke Supabase Cloud";
      if (statusDesc) statusDesc.textContent = `Project URL: ${currentUrl.substring(0, 32)}... (Data tersinkron otomatis ke semua HP)`;
    } else {
      if (statusCard) {
        statusCard.className = "p-4 rounded-2xl border flex items-center justify-between text-xs transition bg-amber-50 border-amber-200 text-amber-950";
      }
      if (statusDot) {
        statusDot.className = "w-3 h-3 rounded-full bg-amber-500 animate-pulse";
      }
      if (statusTitle) statusTitle.textContent = "Status: Belum Terhubung (Mode Lokal)";
      if (statusDesc) statusDesc.textContent = "Masukkan Project URL & Anon Key di bawah ini agar tersinkron ke semua perangkat.";
    }
  };

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      if (!isAdminMode) {
        showToast("Akses ditolak: Masuk Mode Admin dengan PIN 2026 terlebih dahulu.", "warning");
        return;
      }
      if (urlInput) urlInput.value = localStorage.getItem("lezatmu_supabase_url") || "";
      if (keyInput) keyInput.value = localStorage.getItem("lezatmu_supabase_anon_key") || "";
      updateStatusUI();
      if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        document.body.style.overflow = "hidden";
      }
      initLucide();
    });
  }

  const closeModal = () => {
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const url = urlInput ? urlInput.value.trim() : "";
      const key = keyInput ? keyInput.value.trim() : "";

      if (!url || !key) {
        showToast("Mohon masukkan Project URL dan Anon Key Supabase yang lengkap.", "warning");
        return;
      }

      if (typeof saveSupabaseCredentials === "function") {
        saveSupabaseCredentials(url, key);
      }
      updateStatusUI();
      showToast("Kredensial Supabase berhasil disimpan! Sedang menguji koneksi...", "info");
      await fetchProductsFromSupabase(true);
      await fetchTestimonialsFromSupabase(false);
    });
  }

  if (fetchBtn) {
    fetchBtn.addEventListener("click", async () => {
      await fetchProductsFromSupabase(true);
      await fetchTestimonialsFromSupabase(true);
    });
  }

  if (quickTestBtn) {
    quickTestBtn.addEventListener("click", async () => {
      await fetchProductsFromSupabase(true);
      await fetchTestimonialsFromSupabase(false);
      updateStatusUI();
    });
  }

  if (seedBtn) {
    seedBtn.addEventListener("click", () => {
      if (confirm("Unggah 3 varian menu resmi & ulasan awal LezatMU ke tabel database Supabase sekarang?")) {
        seedDefaultProductsToSupabase();
      }
    });
  }

  if (copySqlBtn && sqlScriptText) {
    copySqlBtn.addEventListener("click", () => {
      sqlScriptText.select();
      navigator.clipboard.writeText(SQL_SCRIPT).then(() => {
        showToast("Skrip SQL berhasil disalin! Buka menu SQL Editor di Supabase lalu klik Run.", "success");
      }).catch(() => {
        document.execCommand("copy");
        showToast("Skrip SQL berhasil disalin!", "success");
      });
    });
  }
}

// Helper: Seed Default Products & Testimonials to Supabase
async function seedDefaultProductsToSupabase() {
  if (typeof getSupabaseClient !== "function") return;
  const sb = getSupabaseClient();
  if (!sb) {
    showToast("Supabase belum terhubung. Simpan Project URL dan Anon Key terlebih dahulu.", "warning");
    return;
  }

  showToast("Sedang mengunggah 3 menu resmi & ulasan awal LezatMU ke Supabase...", "info");
  try {
    const payloads = culinaryData.products.map(formatProductForDb);
    const { error: prodError } = await sb.from("products").upsert(payloads, { onConflict: "id" });
    if (prodError) throw prodError;

    // Unggah ulasan bawaan jika tabel testimonials sudah dibuat
    try {
      const defaultTestimonials = getBaselineTestimonials().map(t => ({
        id: t.id,
        name: t.name,
        role: t.role,
        city: t.city,
        rating: t.rating,
        comment: t.comment,
        menu_enjoyed: t.menuEnjoyed,
        created_at: t.createdAt
      }));
      await sb.from("testimonials").upsert(defaultTestimonials, { onConflict: "id" });
    } catch (testiErr) {
      console.warn("Notice: Unggah testimoni awal ke Supabase:", testiErr);
    }

    showToast("3 menu resmi & testimoni berhasil diunggah ke database online Supabase!", "success");
    await fetchProductsFromSupabase(true);
    await fetchTestimonialsFromSupabase(false);
  } catch (err) {
    console.error("Gagal seed Supabase:", err);
    showToast("Gagal mengunggah menu awal: " + err.message, "error");
  }
}
