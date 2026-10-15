/**
 * Supabase Client Configuration & Helper Module
 * PT Azam Tawaqal Berkemajuan (LEZATMU)
 * BUMM PCM Serpong Utara, Kota Tangerang Selatan, Banten
 */

// Storage keys for Supabase credentials
const STORAGE_SUPABASE_URL = "lezatmu_supabase_url";
const STORAGE_SUPABASE_KEY = "lezatmu_supabase_anon_key";

// Default credentials dari proyek Supabase Anda
const DEFAULT_SUPABASE_URL = "https://gmygounnfiedcyrhtduo.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_dYW1bXp1BJI39KcYPlnI9w_2KMwJB2S";

let cachedSupabaseClient = null;

/**
 * Mendapatkan instance Supabase Client
 */
function getSupabaseClient() {
  if (cachedSupabaseClient) return cachedSupabaseClient;

  const url = (localStorage.getItem(STORAGE_SUPABASE_URL) || DEFAULT_SUPABASE_URL || "").trim();
  const key = (localStorage.getItem(STORAGE_SUPABASE_KEY) || DEFAULT_SUPABASE_KEY || "").trim();

  // Validasi format minimal URL dan key
  if (url && key && url.startsWith("https://") && url.includes(".supabase.co") && key.length > 10) {
    try {
      if (window.supabase && typeof window.supabase.createClient === "function") {
        cachedSupabaseClient = window.supabase.createClient(url, key, {
          auth: {
            persistSession: false
          }
        });
        return cachedSupabaseClient;
      }
    } catch (e) {
      console.warn("Gagal inisialisasi Supabase:", e);
      return null;
    }
  }

  return null;
}

/**
 * Cek apakah Supabase sudah dikonfigurasi dengan valid
 */
function isSupabaseConfigured() {
  const url = (localStorage.getItem(STORAGE_SUPABASE_URL) || DEFAULT_SUPABASE_URL || "").trim();
  const key = (localStorage.getItem(STORAGE_SUPABASE_KEY) || DEFAULT_SUPABASE_KEY || "").trim();
  return Boolean(url && key && url.startsWith("https://") && url.includes(".supabase.co") && key.length > 10);
}

/**
 * Menyimpan kredensial Supabase ke browser
 */
function saveSupabaseCredentials(url, key) {
  cachedSupabaseClient = null;
  if (url) localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
  if (key) localStorage.setItem(STORAGE_SUPABASE_KEY, key.trim());
  return getSupabaseClient();
}

/**
 * Menghapus kredensial Supabase dari browser
 */
function clearSupabaseCredentials() {
  cachedSupabaseClient = null;
  localStorage.removeItem(STORAGE_SUPABASE_URL);
  localStorage.removeItem(STORAGE_SUPABASE_KEY);
}

/**
 * Format baris tabel database Supabase menjadi objek produk JavaScript
 */
function formatProductFromDb(row) {
  if (!row) return null;
  return {
    id: row.id || `mie-${Date.now()}`,
    name: row.name || "Menu Mie",
    category: row.category || "utama",
    categoryLabel: row.category_label || row.categoryLabel || (
      row.category === "utama" ? "Menu Mie Utama" :
      row.category === "camilan" ? "Camilan & Pendamping" : "Minuman Penyegar"
    ),
    isBestSeller: Boolean(row.is_best_seller ?? row.isBestSeller ?? false),
    badge: row.badge || (row.is_best_seller || row.isBestSeller ? "Best Seller" : ""),
    portionsSold: row.portions_sold || row.portionsSold || "100+",
    rating: typeof row.rating === "number" ? row.rating : 4.9,
    reviewCount: typeof row.review_count === "number" ? row.review_count : (typeof row.reviewCount === "number" ? row.reviewCount : 10),
    image: row.image || "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop",
    tasteDescription: row.taste_description || row.tasteDescription || "",
    spiceLevel: typeof row.spice_level === "number" ? row.spice_level : (typeof row.spiceLevel === "number" ? row.spiceLevel : 0),
    sweetLevel: typeof row.sweet_level === "number" ? row.sweet_level : (typeof row.sweetLevel === "number" ? row.sweetLevel : 0),
    mainIngredients: Array.isArray(row.main_ingredients) ? row.main_ingredients : (
      Array.isArray(row.mainIngredients) ? row.mainIngredients : []
    ),
    whyFavorite: row.why_favorite || row.whyFavorite || "",
    fullStory: row.full_story || row.fullStory || "",
    servingSuggestion: row.serving_suggestion || row.servingSuggestion || "",
    allergens: row.allergens || "100% Halal Thoyyib, bebas pengawet sintetis.",
    nutritionHighlights: row.nutrition_highlights || row.nutritionHighlights || ""
  };
}

/**
 * Format objek produk JavaScript menjadi baris kolom tabel Supabase
 */
function formatProductForDb(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    category: item.category || "utama",
    category_label: item.categoryLabel || "Menu Mie",
    is_best_seller: Boolean(item.isBestSeller),
    badge: item.badge || (item.isBestSeller ? "Best Seller" : ""),
    portions_sold: item.portionsSold || "100+",
    rating: typeof item.rating === "number" ? item.rating : 4.9,
    review_count: typeof item.reviewCount === "number" ? item.reviewCount : 10,
    image: item.image || "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop",
    taste_description: item.tasteDescription || "",
    spice_level: typeof item.spiceLevel === "number" ? item.spiceLevel : 0,
    sweet_level: typeof item.sweetLevel === "number" ? item.sweetLevel : 0,
    main_ingredients: Array.isArray(item.mainIngredients) ? item.mainIngredients : [],
    why_favorite: item.whyFavorite || "",
    full_story: item.fullStory || "",
    serving_suggestion: item.servingSuggestion || "",
    allergens: item.allergens || "100% Halal Thoyyib, bebas pengawet sintetis.",
    updated_at: new Date().toISOString()
  };
}
