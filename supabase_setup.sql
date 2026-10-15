-- ====================================================================
-- SKRIP SETUP DATABASE SUPABASE UNTUK PT Azam TAWAQAL BERKEMAJUAN (LEZATMU)
-- BUMM PCM Serpong Utara, Kota Tangerang Selatan, Banten
-- ====================================================================
-- Panduan Menjalankan:
-- 1. Buka dashboard proyek Supabase Anda di https://supabase.com
-- 2. Klik menu "SQL Editor" di bilah samping kiri.
-- 3. Klik "New Query", tempelkan seluruh isi file ini, lalu klik tombol "Run" (atau Ctrl+Enter).
-- ====================================================================

-- 1. Buat Tabel "products"
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

-- 3. Kebijakan Akses: Semua Pengunjung & HP B bisa membaca menu (SELECT)
DROP POLICY IF EXISTS "Public Read Access" ON products;
CREATE POLICY "Public Read Access" 
ON products FOR SELECT 
USING (true);

-- 4. Kebijakan Akses: Mode Admin bisa menambah menu baru (INSERT)
DROP POLICY IF EXISTS "Public Insert Access" ON products;
CREATE POLICY "Public Insert Access" 
ON products FOR INSERT 
WITH CHECK (true);

-- 5. Kebijakan Akses: Mode Admin bisa memperbarui menu (UPDATE)
DROP POLICY IF EXISTS "Public Update Access" ON products;
CREATE POLICY "Public Update Access" 
ON products FOR UPDATE 
USING (true);

-- 6. Kebijakan Akses: Mode Admin bisa menghapus menu (DELETE)
DROP POLICY IF EXISTS "Public Delete Access" ON products;
CREATE POLICY "Public Delete Access" 
ON products FOR DELETE 
USING (true);

-- ====================================================================
-- SEED DATA AWAL (Opsional: 3 Menu Resmi Mi Instan LezatMU)
-- ====================================================================
INSERT INTO products (
  id, name, category, category_label, is_best_seller, badge, portions_sold, rating, review_count, image, taste_description, spice_level, sweet_level, main_ingredients, why_favorite, full_story, serving_suggestion, allergens
) VALUES 
(
  'mi-instan-lezatmu-ayam-bawang',
  'Mi Instan LezatMU Rasa Ayam Bawang',
  'utama',
  'Mi Kuah Alami',
  true,
  'Best Seller #1',
  '35.200+',
  4.9,
  2480,
  'images/mi-ayam-bawang.jpg',
  'Nikmati kelezatan klasik yang menghangatkan dalam setiap mangkuk Mi Instan LezatMU Rasa Ayam Bawang. Diolah menggunakan campuran tepung terigu pilihan dan tepung mocaf berkualitas tinggi yang kaya serat serta diperkaya dengan ekstrak kunyit alami tanpa pewarna sintetis.',
  1,
  1,
  '["Tepung Terigu Pilihan", "Tepung Mocaf Berkualitas Tinggi", "Ekstrak Kunyit Alami", "Minyak Bawang Gurih", "Kaldu Ayam Alami", "Bawang Goreng Renyah"]'::JSONB,
  'Diolah dengan tepung mocaf kaya serat dan kunyit alami tanpa pewarna sintetis, menghadirkan kuah kaldu ayam bawang gurih yang ramah bagi lambung.',
  'Mi Instan LezatMU Rasa Ayam Bawang merupakan inovasi mi sehat kebanggaan PT Azam Tawaqal Berkemajuan (BUMM PCM Serpong Utara).',
  'Rebus mi dalam 400ml air mendidih selama 3 menit. Siapkan bumbu kaldu dan minyak bawang di mangkuk, tuang mi beserta kuah panasnya.',
  'Mengandung gluten terigu.'
),
(
  'mi-instan-lezatmu-mi-goreng',
  'Mi Instan LezatMU Mi Goreng',
  'utama',
  'Mi Goreng Spesial',
  true,
  'Best Seller #2',
  '42.800+',
  5.0,
  3120,
  'images/mi-goreng.jpg',
  'Pilihan istimewa bagi pencinta mi goreng tanpa rasa bersalah. Mi Instan LezatMU Mi Goreng memadukan tekstur mi yang kenyal dengan bumbu gurih kaya rempah khas nusantara.',
  2,
  2,
  '["Tepung Mocaf Pilihan", "Tepung Terigu Premium", "Kunyit Alami", "Minyak Bumbu Rempah Spesial", "Kecap Manis Gurih", "Bawang Goreng Brebes"]'::JSONB,
  'Tekstur mi kenyal alami berpadu bumbu rempah nusantara yang harum sedap, bebas rasa bersalah karena diolah tanpa proses penggorengan berlebih dan tanpa pewarna sintetis.',
  'Karya kuliner sehat persembahan PT Azam Tawaqal Berkemajuan di Serpong Utara.',
  'Rebus mi selama 3 menit lalu tiriskan airnya. Campurkan dengan bumbu, kecap, dan minyak rempah di piring. Aduk merata.',
  'Mengandung gluten terigu dan kedelai.'
),
(
  'mi-instan-lezatmu-kuah-soto',
  'Mi Instan LezatMU Kuah Rasa Soto',
  'utama',
  'Mi Kuah Segar',
  true,
  'Best Seller #3',
  '29.400+',
  4.9,
  1950,
  'images/mi-kuah-soto.jpg',
  'Rasakan kesegaran kuah soto tradisional yang kaya rempah dalam Mi Instan LezatMU Kuah Rasa Soto. Dibuat dari formulasi mi sehat bermocaf dan berkunyit alami yang kaya serat serta bebas pewarna buatan.',
  2,
  1,
  '["Tepung Mocaf Segar", "Tepung Terigu Pilihan", "Kunyit Murni & Daun Jeruk", "Bumbu Soto Rempah Tradisional", "Minyak Sayur Aromatik", "Bawang Goreng Renyah"]'::JSONB,
  'Sensasi kuah soto yang segar beraroma rempah dan jeruk nipis, dibuat dari mi sehat bermocaf dan kunyit alami yang menghangatkan tubuh.',
  'Perpaduan kekayaan kuliner soto nusantara dengan teknologi pengolahan mi sehat modern oleh PT Azam Tawaqal Berkemajuan di Tangerang Selatan.',
  'Rebus mi hingga tingkat kematangan pas. Tuang bersama kuah kaldu soto mengepul ke dalam mangkuk, beri perasan jeruk nipis segar.',
  'Mengandung gluten terigu.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  taste_description = EXCLUDED.taste_description,
  updated_at = NOW();
