// Demo customers. Emails use a reserved, non-deliverable domain so no real
// person is ever contacted.
export const EMAIL_DOMAIN = "demo.pionner.sa";

export const customers = [
	{ name: "عبدالله القحطاني", handle: "abdullah.alqahtani", city: "Riyadh" },
	{ name: "نورة العتيبي", handle: "noura.alotaibi", city: "Riyadh" },
	{ name: "محمد الشهري", handle: "mohammed.alshehri", city: "Riyadh" },
	{ name: "سارة الدوسري", handle: "sara.aldosari", city: "Riyadh" },
	{ name: "فهد السبيعي", handle: "fahad.alsubaie", city: "Riyadh" },
	{ name: "ريم المطيري", handle: "reem.almutairi", city: "Riyadh" },
	{ name: "خالد الحربي", handle: "khalid.alharbi", city: "Riyadh" },
	{ name: "لمى الزهراني", handle: "lama.alzahrani", city: "Riyadh" },
	{ name: "تركي العنزي", handle: "turki.alanazi", city: "Riyadh" },
	{ name: "أحمد الغامدي", handle: "ahmed.alghamdi", city: "Jeddah" },
	{ name: "هيا باعشن", handle: "haya.baeshen", city: "Jeddah" },
	{ name: "ياسر بخش", handle: "yasser.bakhsh", city: "Jeddah" },
	{ name: "جود الحازمي", handle: "jood.alhazmi", city: "Jeddah" },
	{ name: "عمر باناجه", handle: "omar.banaja", city: "Jeddah" },
	{ name: "شهد المالكي", handle: "shahad.almalki", city: "Jeddah" },
	{ name: "سلطان الدوسري", handle: "sultan.aldossary", city: "Dammam" },
	{ name: "منيرة الخالدي", handle: "munira.alkhalidi", city: "Dammam" },
	{ name: "ماجد الهاجري", handle: "majed.alhajri", city: "Dammam" },
	{ name: "دانة القحطاني", handle: "dana.alqahtani", city: "Khobar" },
	{ name: "بندر الشمري", handle: "bandar.alshammari", city: "Khobar" },
	{ name: "رهف اللحياني", handle: "rahaf.allihyani", city: "Makkah" },
	{ name: "عبدالرحمن الثقفي", handle: "abdulrahman.althaqafi", city: "Taif" },
	{ name: "أسماء الجهني", handle: "asma.aljuhani", city: "Madinah" },
	{ name: "إبراهيم الأحمدي", handle: "ibrahim.alahmadi", city: "Madinah" },
	{ name: "عبدالعزيز عسيري", handle: "abdulaziz.asiri", city: "Abha" },
	{ name: "غادة الشهراني", handle: "ghada.alshahrani", city: "Abha" },
	{ name: "نايف البلوي", handle: "naif.albalawi", city: "Tabuk" },
	{ name: "وعد الرشيدي", handle: "waad.alrashidi", city: "Hail" },
	{ name: "صالح الحربي", handle: "saleh.alharbi", city: "Buraidah" },
	{ name: "هند المطرفي", handle: "hind.almutrafi", city: "Buraidah" },
	{ name: "علي مدخلي", handle: "ali.madkhali", city: "Jazan" },
	{ name: "مشاعل آل منصور", handle: "mashael.almansour", city: "Najran" },
];

// Districts, streets and postal codes per city, in Saudi National Address style.
export const cities = {
	Riyadh: {
		region: "Riyadh Region",
		districts: [
			{ name: "Al Olaya", street: "Olaya Street", zip: "12211" },
			{ name: "Al Malqa", street: "Anas Ibn Malik Road", zip: "13521" },
			{ name: "Al Nakheel", street: "Imam Saud bin Faisal Road", zip: "12382" },
			{ name: "Hittin", street: "Prince Turki bin Abdulaziz Al Awwal Road", zip: "13512" },
			{ name: "Al Yasmin", street: "Al Thumamah Road", zip: "13325" },
			{ name: "Al Sulimaniyah", street: "Prince Mohammed bin Abdulaziz Road", zip: "12245" },
			{ name: "Qurtubah", street: "Al Imam Abdullah bin Saud Road", zip: "13248" },
		],
	},
	Jeddah: {
		region: "Makkah Region",
		districts: [
			{ name: "Al Rawdah", street: "Prince Sultan Road", zip: "23432" },
			{ name: "Al Hamra", street: "Palestine Street", zip: "23212" },
			{ name: "Obhur Al Shamaliyah", street: "Prince Abdullah Al Faisal Road", zip: "23816" },
			{ name: "Al Zahra", street: "Tahlia Street", zip: "23425" },
			{ name: "Al Salamah", street: "Al Andalus Road", zip: "23436" },
		],
	},
	Dammam: {
		region: "Eastern Province",
		districts: [
			{ name: "Al Faisaliyah", street: "King Saud Street", zip: "32272" },
			{ name: "Al Shati Al Gharbi", street: "Prince Mohammed bin Fahd Road", zip: "32413" },
			{ name: "Al Mazruiyah", street: "King Faisal Road", zip: "32415" },
		],
	},
	Khobar: {
		region: "Eastern Province",
		districts: [
			{ name: "Al Ulaya", street: "King Khalid Street", zip: "34447" },
			{ name: "Al Aqrabiyah", street: "Prince Turki Street", zip: "34441" },
			{ name: "Al Khobar Al Shamaliyah", street: "Dhahran Street", zip: "34428" },
		],
	},
	Makkah: {
		region: "Makkah Region",
		districts: [
			{ name: "Al Aziziyah", street: "King Abdullah Road", zip: "24243" },
			{ name: "Al Awali", street: "Ibrahim Al Khalil Street", zip: "24372" },
		],
	},
	Madinah: {
		region: "Madinah Region",
		districts: [
			{ name: "Quba", street: "Quba Road", zip: "42318" },
			{ name: "Al Aqiq", street: "King Abdullah Road", zip: "42351" },
		],
	},
	Taif: {
		region: "Makkah Region",
		districts: [
			{ name: "Shihar", street: "Shihar Road", zip: "26523" },
			{ name: "Al Hawiyah", street: "Airport Road", zip: "26571" },
		],
	},
	Abha: {
		region: "Asir Region",
		districts: [
			{ name: "Al Mansak", street: "King Faisal Road", zip: "62521" },
			{ name: "Al Khalidiyah", street: "Prince Sultan Road", zip: "62461" },
		],
	},
	Tabuk: {
		region: "Tabuk Region",
		districts: [
			{ name: "Al Muruj", street: "Prince Fahd bin Sultan Road", zip: "47913" },
			{ name: "Al Faisaliyah", street: "King Abdulaziz Road", zip: "47512" },
		],
	},
	Buraidah: {
		region: "Al-Qassim Region",
		districts: [
			{ name: "Al Rayyan", street: "King Abdulaziz Road", zip: "52367" },
			{ name: "Al Safra", street: "Omar Ibn Al Khattab Road", zip: "51452" },
		],
	},
	Hail: {
		region: "Hail Region",
		districts: [
			{ name: "Al Nugrah", street: "King Khalid Road", zip: "55431" },
			{ name: "Al Aziziyah", street: "King Abdulaziz Road", zip: "55476" },
		],
	},
	Jazan: {
		region: "Jazan Region",
		districts: [
			{ name: "Al Shati", street: "Corniche Road", zip: "45142" },
			{ name: "Al Rawdah", street: "King Fahd Road", zip: "45951" },
		],
	},
	Najran: {
		region: "Najran Region",
		districts: [
			{ name: "Al Faisaliyah", street: "King Abdulaziz Road", zip: "66262" },
			{ name: "Al Fahd", street: "Prince Sultan Road", zip: "66251" },
		],
	},
};
