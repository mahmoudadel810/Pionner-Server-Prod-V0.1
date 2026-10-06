import { images } from "./images.js";

// The first six names match the categories the client hardcodes on the home and
// shop pages (en locale), so their sections and filters pick these products up.
export const categories = [
	{
		name: "Smartphones",
		description: "أحدث الهواتف الذكية من Apple وSamsung وHuawei وXiaomi بضمان الوكيل في المملكة.",
		image: images.iphone15,
		featured: true,
	},
	{
		name: "Laptops",
		description: "لابتوبات للعمل والدراسة والألعاب من Apple وLenovo وHP وDell وASUS.",
		image: images.macbookDesk,
		featured: true,
	},
	{
		name: "Gaming",
		description: "أجهزة PlayStation وXbox وNintendo، أذرع تحكم، أجهزة ألعاب مكتبية وملحقات احترافية.",
		image: images.gamingSetup,
		featured: true,
	},
	{
		name: "Smart Home",
		description: "مساعدات صوتية تدعم العربية، أقفال ذكية وأجهزة بث لمنزل متصل.",
		image: images.smartHomeDevices,
		featured: false,
	},
	{
		name: "Audio",
		description: "سماعات لاسلكية بعزل الضوضاء، سماعات أذن ومكبرات صوت محمولة من Apple وSony وJBL وAnker.",
		image: images.sonyHeadphones,
		featured: true,
	},
	{
		name: "Tablets",
		description: "أجهزة iPad وGalaxy Tab وMatePad للدراسة والرسم والترفيه.",
		image: images.ipadPair,
		featured: true,
	},
	{
		name: "Monitors",
		description: "شاشات ألعاب بمعدل تحديث عالٍ وشاشات احترافية بدقة 4K وQHD.",
		image: images.monitorSetup,
		featured: false,
	},
	{
		name: "Wearables",
		description: "ساعات ذكية وأساور رياضية لمتابعة الصحة واللياقة والإشعارات.",
		image: images.appleWatchWrist,
		featured: true,
	},
	{
		name: "Accessories",
		description: "شواحن، باور بانك، لوحات مفاتيح، فأرات وطابعات لإكمال مكتبك.",
		image: images.charger,
		featured: false,
	},
	{
		name: "Eyewear",
		description: "نظارات شمسية أصلية من Ray-Ban وOakley بحماية كاملة من الأشعة فوق البنفسجية.",
		image: images.sunglassesRound,
		featured: false,
	},
];
