/**
 * Database Data for PT Azzam Tawaqal Berkemajuan (LEZATMU)
 * BUMM PCM Serpong Utara, Kota Tangerang Selatan, Banten
 * Spesialis Kuliner Mie Sehat Mocaf & Artisan Noodles
 */

const culinaryData = {
  products: [
    {
      id: "mie-ayam-jamur-spesial",
      name: "Mie Ayam Jamur Spesial LEZATMU",
      category: "utama",
      categoryLabel: "Menu Mie Utama",
      isBestSeller: true,
      badge: "The Most Wanted #1",
      portionsSold: "28.500+",
      rating: 4.9,
      reviewCount: 2150,
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Tekstur mie kenyal pipih inovasi mocaf-gandum segar harian, topping tumisan ayam jamur kancing manis gurih sedap, minyak bawang putih aromatik, dan kuah kaldu ayam kampung bening.",
      spiceLevel: 1,
      sweetLevel: 2,
      mainIngredients: ["Mie Segar Mocaf & Gandum Pilihan", "Daging Ayam Cincang Segar", "Jamur Kancing Pilihan", "Minyak Bawang Putih & Jahe", "Sawi Hijau Manis", "Pangsit Rebus Lembut & Kuah Kaldu"],
      whyFavorite: "Inovasi mie sehat produksi PT Azzam Tawaqal Berkemajuan Serpong Utara tanpa pengawet sintetis maupun air abu berlebih, dipadu bumbu ayam jamur yang gurih meresap sempurna.",
      fullStory: "Menu legendaris karya BUMM PCM Serpong Utara. Adonan mie diproduksi secara higienis setiap hari di sentra produksi Tangerang Selatan. Disajikan dengan pangsit rebus lembut isi ayam serta kuah kaldu ayam kampung beraroma daun bawang segar.",
      servingSuggestion: "Aduk mie saat masih mengepul panas bersama sambal rawit hijau dan acar mentimun segar buatan sendiri.",
      allergens: "Mengandung gandum, telur ayam, dan kedelai.",
      nutritionHighlights: "Kaya serat pangan mocaf, protein ayam murni, bebas pewarna sintetis."
    },
    {
      id: "mie-bakar-rempah-pedas",
      name: "Mie Bakar Rempah Pedas Juara",
      category: "utama",
      categoryLabel: "Menu Mie Utama",
      isBestSeller: true,
      badge: "Best Seller #2",
      portionsSold: "22.800+",
      rating: 4.9,
      reviewCount: 1620,
      image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Mie kenyal dibalut bumbu rempah pedas cabai bakar, dibungkus daun pisang lalu dipanggang di atas bara api arang hingga menghasilkan aroma smokey yang harum memikat.",
      spiceLevel: 4,
      sweetLevel: 2,
      mainIngredients: ["Mie Keriting Sehat LEZATMU", "Suwiran Daging Sapi & Ayam Bumbu Pedas", "Sambal Rempah Bakar Cabai Rawit", "Daun Pisang Batu Segar", "Kemangi Aromatik", "Bawang Goreng Brebes"],
      whyFavorite: "Sensasi aroma daun pisang bakar khas Serpong Utara yang menyatu dengan bumbu pedas rempah meresap sampai ke setiap helai mie.",
      fullStory: "Inovasi kuliner khas PT Azzam Tawaqal Berkemajuan yang memadukan teknik memanggang tradisional menggunakan daun pisang. Suhu pembakaran mengunci kelembapan mie sehingga tetap kenyal dan tidak kering.",
      servingSuggestion: "Buka bungkusan daun pisang selagi panas dan nikmati bersama kerupuk pangsit renyah dan es jeruk kasturi.",
      allergens: "Mengandung gluten gandum, cabai rawit pedas.",
      nutritionHighlights: "Tinggi energi, capsaicin alami pemacu metabolisme, rempah alami kaya antioksidan."
    },
    {
      id: "mie-aceh-kuah-daging",
      name: "Mie Aceh Kuah Rempah Kari Daging Sapi",
      category: "utama",
      categoryLabel: "Menu Mie Utama",
      isBestSeller: true,
      badge: "Best Seller #3",
      portionsSold: "18.300+",
      rating: 4.8,
      reviewCount: 1280,
      image: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Mie kuning tebal khas Serambi Mekkah dalam siraman kuah kari kental berempah pekat, potongan daging sapi empuk, tauge segar, dan aroma kapulaga yang menggoda selera.",
      spiceLevel: 3,
      sweetLevel: 1,
      mainIngredients: ["Mie Kuning Basah Sehat Halal", "Potongan Daging Sapi Pilihan", "Rempah Kari Tradisional (Kapulaga, Jintan, Adas)", "Tauge Renyah & Kol", "Kacang Tanah Goreng", "Emping Melinjo & Acar Bawang"],
      whyFavorite: "Racikan bumbu rempah kari kaya rempah yang dimasak dengan kaldu sapi pekat tanpa santan berlebih, gurih mantap dan berkhasiat menghangatkan tubuh.",
      fullStory: "Resep otentik yang dihadirkan secara profesional oleh tim dapur PT Azzam Tawaqal Berkemajuan di Serpong Utara dengan standar bumbu kari murni tanpa penyedap berlebihan.",
      servingSuggestion: "Santap hangat bersama perasan jeruk nipis segar, acar bawang merah, dan emping melinjo renyah.",
      allergens: "Mengandung gandum, emping melinjo.",
      nutritionHighlights: "Kaya zat besi dari kaldu sapi murni, rempah penghangat tubuh alami."
    },
    {
      id: "bakmi-karet-ayam-matah",
      name: "Bakmi Karet Ayam Kampung Sambal Matah",
      category: "utama",
      categoryLabel: "Menu Mie Utama",
      isBestSeller: false,
      badge: "Artisan Chewy Noodle",
      portionsSold: "12.400+",
      rating: 4.9,
      reviewCount: 950,
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Mie jenis karet yang super kenyal dan elastis, potongan ayam kampung rebus empuk gurih, disiram sambal matah Bali segar dengan wangi serai dan minyak kelapa murni.",
      spiceLevel: 3,
      sweetLevel: 1,
      mainIngredients: ["Mie Karet Gandum Tepung Premium", "Potongan Paha Ayam Kampung Rebus", "Serai & Bawang Merah Iris", "Cabai Rawit Merah Segar", "Minyak Kelapa Murni (VCO)", "Jeruk Limau Segar"],
      whyFavorite: "Kekenyalan mie karet yang memuaskan saat dikunyah berpadu dengan kesegaran asam pedas sambal matah serai.",
      fullStory: "Dibuat dengan teknik pengulenan presisi tanpa zat pengenyal kimia. Menghasilkan kekenyalan alami yang khas dan aman bagi lambung.",
      servingSuggestion: "Aduk rata dengan sambal matah dan kuah kaldu terpisah.",
      allergens: "Mengandung gandum dan telur.",
      nutritionHighlights: "Protein tinggi dari ayam kampung murni, vitamin C dari jeruk limau."
    },
    {
      id: "mie-godog-jawa-kampung",
      name: "Mie Godog Jawa Telur Bebek Nyemek",
      category: "utama",
      categoryLabel: "Menu Mie Utama",
      isBestSeller: false,
      badge: "Menu Tradisi Klasik",
      portionsSold: "14.600+",
      rating: 4.8,
      reviewCount: 1020,
      image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Kuah kaldu gurih kental hasil kocokan telur bebek segar, sayuran kubis dan tomat segar, serta suwiran ayam gurih dengan aroma ebi harum.",
      spiceLevel: 2,
      sweetLevel: 1,
      mainIngredients: ["Mie Kuning Basah Segar", "Telur Bebek Masir Segar", "Suwiran Ayam Kampung", "Ebi Kering Sangrai Halus", "Kol & Tomat Sayur", "Bawang Goreng Renyah"],
      whyFavorite: "Dimasak satu per satu menghasilkan kuah berkaldu 'nyemek' yang gurih alami tanpa MSG berlebihan.",
      fullStory: "Cita rasa kuliner khas pedesaan Jawa yang diadaptasi secara higienis oleh dapur LEZATMU Serpong Utara.",
      servingSuggestion: "Paling nikmat dinikmati malam hari atau saat cuaca hujan bersama cabai rawit utuh.",
      allergens: "Mengandung telur bebek, udang ebi, gandum.",
      nutritionHighlights: "Kaya protein telur bebek, vitamin A dan C dari sayuran segar."
    },
    {
      id: "mie-celor-udang-palembang",
      name: "Mie Celor Udang Kuah Kaldu Gurih",
      category: "utama",
      categoryLabel: "Menu Mie Utama",
      isBestSeller: false,
      badge: "Khas Nusantara",
      portionsSold: "9.500+",
      rating: 4.8,
      reviewCount: 710,
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Mie tebal lembut disiram kuah kaldu udang dan santan kental gurih beraroma laut manis, diberi topping udang cincang, tauge, dan telur rebus.",
      spiceLevel: 1,
      sweetLevel: 2,
      mainIngredients: ["Mie Basah Lurus", "Udang Segar Cincang", "Kuah Kaldu Kepala Udang & Santan", "Tauge Pendek Seduh", "Telur Rebus Iris", "Bawang Kucai"],
      whyFavorite: "Kuah kaldu udang yang diekstrak berjam-jam menghasilkan rasa manis alami gurih khas kuliner pesisir nusantara.",
      fullStory: "Menjaga keaslian rasa mie celor dengan menggunakan udang segar berkualitas tanpa perasa buatan.",
      servingSuggestion: "Beri sedikit perasan jeruk kunci dan sambal cabai rawit ulek.",
      allergens: "Mengandung udang, telur, gandum.",
      nutritionHighlights: "Kaya mineral seng, kalsium udang, dan protein seimbang."
    },
    {
      id: "pangsit-goreng-krispi",
      name: "Pangsit Goreng Emas Isi Ayam Udang (5 Pcs)",
      category: "camilan",
      categoryLabel: "Camilan & Pendamping Mie",
      isBestSeller: false,
      badge: "Camilan Renyah Favorit",
      portionsSold: "23.800+",
      rating: 4.9,
      reviewCount: 1820,
      image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Kulit pangsit renyah garing berwarna keemasan, diisi daging ayam dan udang cincang gurih, dicocol saus asam manis pedas khas LEZATMU.",
      spiceLevel: 1,
      sweetLevel: 3,
      mainIngredients: ["Kulit Pangsit Artisan Tipis", "Daging Ayam Cincang Halus", "Udang Segar Giling", "Minyak Wijen & Bawang Putih", "Saus Asam Manis Homemade"],
      whyFavorite: "Kulit pangsit super renyah dan tidak berminyak, dengan isian daging gurih yang padat berisi.",
      fullStory: "Pendamping sempurna untuk semangkuk mie. Dibuat langsung di dapur Serpong Utara menggunakan minyak goreng berkualitas yang selalu diganti berkala.",
      servingSuggestion: "Cocol ke saus asam manis atau celupkan ke dalam kuah kaldu mie hangat.",
      allergens: "Mengandung gandum, udang, minyak wijen.",
      nutritionHighlights: "Bebas kolesterol trans berbahaya, kaya protein hewani."
    },
    {
      id: "bakso-goreng-mekar",
      name: "Bakso Goreng Mekar Sapi Ayam Halal",
      category: "camilan",
      categoryLabel: "Camilan & Pendamping Mie",
      isBestSeller: false,
      badge: "Kriuk Gurih",
      portionsSold: "15.900+",
      rating: 4.8,
      reviewCount: 1080,
      image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Bakso goreng mekar dengan tekstur luar sangat renyah dan bagian dalam lembut kenyal berserat daging gurih beraroma bawang putih.",
      spiceLevel: 1,
      sweetLevel: 1,
      mainIngredients: ["Daging Sapi Segar Cincang", "Daging Ayam Fillet", "Tepung Tapioka Halus", "Bawang Putih Goreng", "Minyak Nabati Higienis"],
      whyFavorite: "Tingkat kerenyahan yang tahan lama serta komposisi daging asli tanpa bahan pengawet boraks/formalin.",
      fullStory: "Diolah dengan standar kebersihan halal penuh di bawah naungan BUMM PT Azzam Tawaqal Berkemajuan.",
      servingSuggestion: "Nikmati hangat dengan cocolan sambal cabai rawit pedas manis.",
      allergens: "Mengandung gandum, kedelai.",
      nutritionHighlights: "Protein murni hewani penambah stamina."
    },
    {
      id: "siomay-kukus-dimsum",
      name: "Siomay Kukus Dimsum Ayam Udang Lembut",
      category: "camilan",
      categoryLabel: "Camilan & Pendamping Mie",
      isBestSeller: false,
      badge: "Kukus Sehat",
      portionsSold: "13.900+",
      rating: 4.9,
      reviewCount: 940,
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Siomay kukus hangat bertekstur lembut kenyal, rasa gurih manis udang dan ayam alami, disajikan dengan chili oil racikan rempah khas.",
      spiceLevel: 2,
      sweetLevel: 1,
      mainIngredients: ["Daging Ayam Fillet Giling", "Udang Laut Segar", "Kulit Siomay Kuning Tipis", "Chili Oil Rempah Spesial", "Minyak Wijen Murni"],
      whyFavorite: "Proses kukus sehat tanpa minyak tambahan, dipadu chili oil beraroma rempah harum.",
      fullStory: "Dimsum siomay khas LEZATMU yang dibuat dengan resep higienis bernutrisi tinggi untuk camilan sehat pendamping santapan mie.",
      servingSuggestion: "Cocol dengan chili oil pedas gurih atau kecap asin wijen.",
      allergens: "Mengandung udang, gandum, minyak wijen.",
      nutritionHighlights: "Rendah kalori minyak, tinggi protein dan asam amino."
    },
    {
      id: "es-jeruk-kasturi-selasih",
      name: "Es Jeruk Kasturi Selasih Segar Dingin",
      category: "minuman",
      categoryLabel: "Minuman Penyegar Pendamping",
      isBestSeller: false,
      badge: "Paling Segar",
      portionsSold: "19.500+",
      rating: 4.9,
      reviewCount: 1480,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Perasan jeruk kasturi/kalamansi alami yang asam manis segar, biji selasih kenyal, potongan plum asam (kiamboy), dan es batu kristal higienis.",
      spiceLevel: 0,
      sweetLevel: 3,
      mainIngredients: ["Jeruk Kasturi Segar Peras Langsung", "Biji Selasih Organik", "Sirup Gula Tebu Alami", "Plum Kering Kiamboy", "Es Kristal Bersertifikat Halal"],
      whyFavorite: "Kesegaran asam manis yang seketika melunturkan rasa gurih dan pedas setelah menyantap mie rempah.",
      fullStory: "Minuman andalan pelepas dahaga yang diracik dari buah jeruk kasturi segar tanpa konsentrat atau perisa kimia buatan.",
      servingSuggestion: "Aduk hingga biji selasih tersebar merata dan minum selagi es batu masih dingin.",
      allergens: "Bebas bahan alergen umum.",
      nutritionHighlights: "Tinggi vitamin C alami penangkal radikal bebas dan serat selasih."
    },
    {
      id: "es-teh-tarik-kayumanis",
      name: "Es Teh Tarik Rempah Kayu Manis",
      category: "minuman",
      categoryLabel: "Minuman Penyegar Pendamping",
      isBestSeller: false,
      badge: "Harum Creamy",
      portionsSold: "12.800+",
      rating: 4.8,
      reviewCount: 840,
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Seduhan teh hitam pekat nusantara ditarik hingga berbusa lembut bersama susu kental manis dan aroma kayu manis alami yang menenangkan.",
      spiceLevel: 1,
      sweetLevel: 3,
      mainIngredients: ["Daun Teh Hitam Grade Satu", "Susu Evaporasi & Kental Manis", "Batang Kayu Manis Ekstrak", "Kapulaga Halus", "Es Batu Kristal"],
      whyFavorite: "Tekstur creamy berbusa lembut dengan sentuhan wangi rempah kayu manis yang otentik.",
      fullStory: "Tradisi teh tarik khas Melayu Nusantara yang diolah secara higienis untuk melengkapi hidangan mie berkuah kaya rempah.",
      servingSuggestion: "Nikmati dingin untuk sensasi manis segar, atau pesan versi hangat di saat santap malam.",
      allergens: "Mengandung susu sapi/laktosa.",
      nutritionHighlights: "Antioksidan theaflavin dari teh hitam dan kalsium susu."
    },
    {
      id: "es-kopi-susu-aren-lezatmu",
      name: "Es Kopi Susu Aren LEZATMU Signature",
      category: "minuman",
      categoryLabel: "Minuman Penyegar Pendamping",
      isBestSeller: false,
      badge: "Signature Coffee",
      portionsSold: "13.600+",
      rating: 4.9,
      reviewCount: 930,
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=1000&auto=format&fit=crop",
      tasteDescription: "Espresso robusta-arabika nusantara yang mantap, dipadu susu segar creamy dan legitnya gula aren organik murni.",
      spiceLevel: 0,
      sweetLevel: 3,
      mainIngredients: ["House Blend Robusta & Arabika Lokal", "Fresh Milk Creamy", "Gula Aren Kawung Asli", "Es Kristal Higienis"],
      whyFavorite: "Rasa kopi yang kuat seimbang dengan manis gula aren dan gurihnya susu segar.",
      fullStory: "Diseduh dari biji kopi petani lokal Indonesia untuk mendukung ekosistem kemandirian pangan nasional.",
      servingSuggestion: "Kocok perlahan sebelum diminum agar sirup aren menyatu sempurna.",
      allergens: "Mengandung laktosa susu.",
      nutritionHighlights: "Kafein alami pemacu fokus dan energi."
    }
  ],

  testimonials: [
    {
      name: "Ibu Hj. Siti Masruroh",
      role: "Warga Serpong Utara & Tokoh Aisyiyah",
      city: "Serpong Utara, Tangerang Selatan",
      comment: "Kebanggaan warga Serpong Utara memiliki produk BUMM seperti Mie LEZATMU dari PT Azzam Tawaqal Berkemajuan. Mienya lembut, kenyal dari tepung mocaf sehat, dan sangat aman untuk lambung anak-anak serta lansia.",
      rating: 5,
      menuEnjoyed: "Mie Ayam Jamur Spesial & Pangsit Goreng"
    },
    {
      name: "Bpk. Ir. Hendro Prabowo",
      role: "Pengurus Koperasi & Jamaah PCM Serpong Utara",
      city: "Alam Sutera, Tangerang Selatan",
      comment: "Inovasi Mie Bakar Rempah Pedasnya luar biasa harum! Pesanan katering 150 porsi untuk rapat kerja cabang kami di Alam Sutera sampai tepat waktu dan semua peserta memuji kelezatan mienya.",
      rating: 5,
      menuEnjoyed: "Mie Bakar Rempah Pedas & Es Jeruk Kasturi"
    },
    {
      name: "dr. Nurul Aini",
      role: "Praktisi Kesehatan & Pemerhati Makanan Halal",
      city: "Graha Raya, Tangerang Selatan",
      comment: "Sebagai dokter, saya sangat mendukung mie berbahan mocaf tanpa pewarna sintetis dan tanpa MSG berlebih seperti Mie LEZATMU. Rasanya tetap sangat gurih dan nikmat dengan standar Halal BPJPH yang terjamin.",
      rating: 5,
      menuEnjoyed: "Mie Aceh Kuah Daging & Siomay Dimsum"
    }
  ],

  articles: {
    "article-1": {
      title: "Mengenal Ciri Mie Sehat Alami: Keunggulan Tepung Mocaf Tanpa Pengawet Sintetis",
      category: "Tips Pangan Sehat",
      date: "5 Oktober 2026",
      readTime: "4 Menit",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000&auto=format&fit=crop",
      content: `
        <p class="mb-4">Mie adalah salah satu makanan favorit masyarakat Indonesia. Namun, produk mie instan konvensional sering kali dikhawatirkan karena kandungan natrium tinggi dan bahan pengawet sintetis.</p>
        
        <h4 class="font-serif font-bold text-lg text-brand-brown-dark mb-2">1. Inovasi Tepung Mocaf (Modified Cassava Flour)</h4>
        <p class="mb-4">PT Azzam Tawaqal Berkemajuan (LEZATMU) di Serpong Utara menghadirkan terobosan dengan memadukan tepung mocaf singkong terfermentasi. Tepung mocaf memiliki serat larut yang lebih tinggi, indeks glikemik lebih ramah, dan bebas gluten berbahaya.</p>
        
        <h4 class="font-serif font-bold text-lg text-brand-brown-dark mb-2">2. Warna Alami Tanpa Tartrazin Sintetis</h4>
        <p class="mb-4">Warna kuning keemasan pada Mie LEZATMU murni berasal dari telur ayam segar dan rempah alami, bukan dari pewarna sintetis kimiawi.</p>

        <h4 class="font-serif font-bold text-lg text-brand-brown-dark mb-2">3. Ramah bagi Lambung</h4>
        <p class="mb-4">Kandungan air abu (alkali) yang ditekan seminimal mungkin membuat mie ini tidak menimbulkan rasa begah atau mual di lambung setelah disantap.</p>
      `
    },
    "article-2": {
      title: "Di Balik Dapur LEZATMU: Inovasi Bisnis BUMM PCM Serpong Utara Menembus Pasar Nasional",
      category: "Behind The Scene",
      date: "28 September 2026",
      readTime: "5 Menit",
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1000&auto=format&fit=crop",
      content: `
        <p class="mb-4">Pimpinan Cabang Muhammadiyah (PCM) Serpong Utara, Kota Tangerang Selatan membuktikan bahwa kemandirian ekonomi persyarikatan dapat diwujudkan melalui unit usaha riil berbasis kebutuhan pokok masyarakat.</p>
        
        <h4 class="font-serif font-bold text-lg text-brand-brown-dark mb-2">Kapasitas Produksi Jutaan Bungkus</h4>
        <p class="mb-4">Melalui PT Azzam Tawaqal Berkemajuan (PT ATB), kapasitas produksi pabrikasi mi sehat LEZATMU kini mampu mencapai 2 juta bungkus per bulan. Penyerapan pasar terus meluas baik melalui toko ritel Sunmartmu, komunitas ranting, maupun marketplace daring.</p>
        
        <h4 class="font-serif font-bold text-lg text-brand-brown-dark mb-2">Dari Serpong Utara Menginspirasi Nusantara</h4>
        <p class="mb-4">Model bisnis BUMM ini menjadi percontohan nasional dalam forum-forum LPCR (Lembaga Pengembangan Cabang dan Ranting) Muhammadiyah sebagai bukti nyata dakwah ekonomi yang berkemajuan.</p>
      `
    },
    "article-3": {
      title: "PT Azzam Tawaqal Berkemajuan Hadir di Expo Produk Unggulan Tangerang Selatan",
      category: "Event & Agenda",
      date: "15 Oktober 2026",
      readTime: "3 Menit",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop",
      content: `
        <p class="mb-4">PT Azzam Tawaqal Berkemajuan mengundang seluruh warga Tangerang Selatan dan sekitarnya untuk mengunjungi booth <strong>Mie LEZATMU</strong> dalam pameran <strong>Gelar Produk Unggulan BUMM & UMKM Tangerang Selatan 2026</strong>.</p>
        
        <h4 class="font-serif font-bold text-lg text-brand-brown-dark mb-2">Agenda Spesial di Booth Serpong Utara:</h4>
        <ul class="list-disc list-inside mb-4 space-y-2 text-sm">
          <li><strong>Free Tasting Mie Sehat Mocaf:</strong> Cicipi varian Mie Goreng, Mie Kuah Soto, dan Mie Ayam Bawang sehat tanpa MSG berlebih.</li>
          <li><strong>Live Demo Mie Bakar Daun Pisang:</strong> Saksikan aroma sedap pemanggangan mie rempah oleh juru masak kami.</li>
          <li><strong>Peluang Reseller & Kemitraan:</strong> Dapatkan paket kemitraan agen resmi toko sembako / Sunmartmu untuk wilayah Jabodetabek dan Banten.</li>
        </ul>

        <p class="mb-4">Dukung produk lokal karya warga Serpong Utara demi kemajuan ekonomi umat yang mandiri dan berdaya saing!</p>
      `
    }
  }
};
