import "../config/env.js";
import crypto from "crypto";
import mongoose from "mongoose";
import categoryModel from "../DB/models/categoryModel.js";
import productModel from "../DB/models/productModel.js";
import userModel from "../DB/models/userModel.js";
import orderModel from "../DB/models/orderModel.js";
import couponModel from "../DB/models/couponModel.js";
import contactUsModel from "../DB/models/contactUs.js";
import wishlistModel from "../DB/models/wishlistModel.js";
import { categories } from "./seed-data/categories.js";
import { products } from "./seed-data/products.js";
import { customers, cities, EMAIL_DOMAIN } from "./seed-data/customers.js";
import { contactMessages } from "./seed-data/messages.js";

const DAY = 24 * 60 * 60 * 1000;
const ORDER_WINDOW_DAYS = 182;
const SAUDI_UTC_OFFSET_HOURS = 3;

const models = [categoryModel, productModel, userModel, orderModel, couponModel, contactUsModel, wishlistModel];

// Deterministic generator so every run produces the same catalogue and order history.
const createRandom = (seed) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const random = createRandom(20260923);

const between = (min, max) => min + random() * (max - min);
const intBetween = (min, max) => Math.floor(between(min, max + 1));
const pick = (items) => items[Math.floor(random() * items.length)];
const chance = (probability) => random() < probability;
const round2 = (value) => Math.round(value * 100) / 100;

const pickWeighted = (items, weightOf) => {
	const total = items.reduce((sum, item) => sum + weightOf(item), 0);
	let threshold = random() * total;
	for (const item of items) {
		threshold -= weightOf(item);
		if (threshold <= 0) return item;
	}
	return items[items.length - 1];
};

const pickByShare = (shares) => pickWeighted(Object.keys(shares), (key) => shares[key]);

const poisson = (lambda) => {
	const limit = Math.exp(-lambda);
	let count = 0;
	let product = random();
	while (product > limit) {
		count++;
		product *= random();
	}
	return count;
};

const startOfDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const inRange = (date, from, to) => date >= new Date(from) && date < new Date(to);

const userCollections = async () => {
	const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
	return collections.map(({ name }) => name).filter((name) => !name.startsWith("system."));
};

const ensureEmpty = async () => {
	for (const name of await userCollections()) {
		if (await mongoose.connection.db.collection(name).estimatedDocumentCount()) {
			throw new Error(`Collection "${name}" is not empty. Run "npm run seed -- --reset" to clear every collection first.`);
		}
	}
};

const clearDatabase = async () => {
	console.log("Clearing all collections");
	for (const name of await userCollections()) {
		const { deletedCount } = await mongoose.connection.db.collection(name).deleteMany({});
		console.log(`  ${name}: removed ${deletedCount}`);
	}
	await Promise.all(models.map((model) => model.createIndexes()));
};

const seedCategories = async (now) => {
	const created = [];
	for (const [index, category] of categories.entries()) {
		const createdAt = new Date(now - 320 * DAY + index * DAY);
		created.push(
			await categoryModel.create([{ ...category, order: index + 1, createdAt, updatedAt: createdAt }], { timestamps: false }).then(([doc]) => doc)
		);
	}
	return new Map(created.map((category) => [category.name, category]));
};

// Newest first, round-robin across categories, so the client's first page of 50
// products (sorted by createdAt) shows every category.
const releaseOrder = () => {
	const byCategory = new Map(categories.map((category) => [category.name, []]));
	for (const product of products) byCategory.get(product.category).push(product);
	const ordered = [];
	for (let round = 0; ordered.length < products.length; round++) {
		for (const list of byCategory.values()) {
			if (list[round]) ordered.push(list[round]);
		}
	}
	return ordered;
};

const seedProducts = async (now, categoryByName) => {
	const docs = releaseOrder().map((product, rank) => {
		const createdAt = new Date(now - 190 * DAY - rank * 6 * 60 * 60 * 1000);
		const popularity = Math.max(0.2, 1 - Math.log10(product.price) / 4.5);
		return {
			name: product.name,
			description: product.description,
			price: product.price,
			stockQuantity: product.stock,
			image: product.image,
			images: [product.image, ...(product.images || [])],
			category: product.category,
			categoryId: categoryByName.get(product.category)._id,
			isFeatured: Boolean(product.featured),
			averageRating: round2(Math.min(4.9, between(3.9, 4.6) + (product.featured ? 0.3 : 0))),
			reviewCount: Math.round(between(15, 420) * popularity),
			tags: product.tags,
			createdAt,
			updatedAt: createdAt,
		};
	});
	return productModel.create(docs, { timestamps: false });
};

const buildAddress = (cityName) => {
	const city = cities[cityName];
	const district = pick(city.districts);
	return {
		street: `${intBetween(2100, 8900)} ${district.street}, ${district.name} District, Unit ${intBetween(1, 24)}`,
		city: cityName,
		state: city.region,
		zipCode: district.zip,
		country: "Saudi Arabia",
	};
};

const uniquePhone = (taken) => {
	let phone;
	do {
		phone = `+9665${pick(["0", "3", "4", "5", "6", "8", "9"])}${String(intBetween(0, 9999999)).padStart(7, "0")}`;
	} while (taken.has(phone));
	taken.add(phone);
	return phone;
};

const seedCustomers = async (now) => {
	const phones = new Set();
	const docs = customers.map((customer, index) => {
		const createdAt = new Date(now - (240 - index * 6.5) * DAY - intBetween(0, 20) * 60 * 60 * 1000);
		return {
			name: customer.name,
			email: `${customer.handle}@${EMAIL_DOMAIN}`,
			phone: uniquePhone(phones),
			password: crypto.randomBytes(24).toString("base64url"),
			role: "customer",
			isConfirmed: true,
			status: "active",
			createdAt,
			updatedAt: createdAt,
		};
	});
	const users = await userModel.create(docs, { timestamps: false });
	return users.map((user, index) => ({
		user,
		address: buildAddress(customers[index].city),
		loyalty: between(0.3, 2.2),
	}));
};

const seedAdmin = async () => {
	const email = process.env.SEED_ADMIN_EMAIL;
	const password = process.env.SEED_ADMIN_PASSWORD;
	if (!email || !password) {
		console.log("No admin created: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one");
		return null;
	}
	const admin = await userModel.create({
		name: "Pionner Admin",
		email,
		phone: "+966500000000",
		password,
		role: "admin",
		isConfirmed: true,
		status: "active",
	});
	console.log(`Admin created: ${admin.email}`);
	return admin;
};

const dailyOrderRate = (day, progress) => {
	let rate = 0.5 + 0.9 * progress;
	const weekday = day.getUTCDay();
	if (weekday === 4) rate *= 1.2;
	if (weekday === 5) rate *= 1.4;
	if (weekday === 6) rate *= 1.3;
	if (inRange(day, "2026-05-18", "2026-05-27")) rate *= 1.6; // Eid al-Adha
	if (inRange(day, "2026-08-16", "2026-08-31")) rate *= 1.3; // back to school
	if (inRange(day, "2026-09-15", "2026-09-25")) rate *= 2; // National Day
	return rate;
};

const orderTime = (day) => {
	const localHour = pickWeighted([10, 12, 14, 16, 18, 20, 21, 22, 23], (hour) => (hour >= 20 ? 3 : hour >= 16 ? 2 : 1));
	return new Date(day.getTime() + (localHour - SAUDI_UTC_OFFSET_HOURS) * 60 * 60 * 1000 + intBetween(0, 59) * 60 * 1000);
};

const orderStatus = (ageDays) => {
	if (ageDays < 2) return pickByShare({ pending: 40, processing: 50, cancelled: 10 });
	if (ageDays < 5) return pickByShare({ processing: 30, shipped: 55, delivered: 10, cancelled: 5 });
	if (ageDays < 11) return pickByShare({ shipped: 30, delivered: 62, cancelled: 8 });
	return pickByShare({ delivered: 91, cancelled: 9 });
};

const paymentStatusFor = (status) => {
	if (status === "pending") return "pending";
	if (status === "cancelled") return chance(0.5) ? "refunded" : "failed";
	return "paid";
};

const statusLagDays = { pending: 0, processing: 1, shipped: 2, delivered: 4, cancelled: 1 };

const productWeight = (product) => (1 / Math.sqrt(product.price)) * (product.isFeatured ? 1.6 : 1);

const buildLineItems = (catalogue) => {
	const count = pickByShare({ 1: 60, 2: 30, 3: 10 });
	const chosen = new Set();
	while (chosen.size < Number(count)) chosen.add(pickWeighted(catalogue, productWeight));
	return [...chosen].map((product) => ({
		product: product._id,
		quantity: product.price < 300 ? intBetween(1, 3) : chance(0.05) ? 2 : 1,
		price: product.price,
		category: product.category,
		categoryId: product.categoryId,
		productName: product.name,
		productImage: product.image,
	}));
};

const orderDiscount = (createdAt, isFirstOrder) => {
	if (inRange(createdAt, "2026-09-15", "2026-10-01") && chance(0.35)) return 20;
	if (isFirstOrder && chance(0.4)) return 10;
	if (chance(0.06)) return 10;
	return 0;
};

const seedOrders = async (now, catalogue, customerProfiles) => {
	const firstDay = startOfDay(new Date(now - ORDER_WINDOW_DAYS * DAY));
	const ordersPlaced = new Map();
	const docs = [];

	for (let offset = 0; offset <= ORDER_WINDOW_DAYS; offset++) {
		const day = new Date(firstDay.getTime() + offset * DAY);
		const orderCount = poisson(dailyOrderRate(day, offset / ORDER_WINDOW_DAYS));

		for (let i = 0; i < orderCount; i++) {
			const createdAt = orderTime(day);
			if (createdAt > now) continue;

			const eligible = customerProfiles.filter((profile) => profile.user.createdAt < createdAt);
			if (!eligible.length) continue;
			const customer = pickWeighted(eligible, (profile) => profile.loyalty);
			const userId = customer.user._id.toString();

			const items = buildLineItems(catalogue);
			const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
			const discount = orderDiscount(createdAt, !ordersPlaced.has(userId));
			const ageDays = (now - createdAt) / DAY;
			const status = orderStatus(ageDays);
			const updatedAt = new Date(Math.min(now, createdAt.getTime() + statusLagDays[status] * DAY));

			ordersPlaced.set(userId, (ordersPlaced.get(userId) || 0) + 1);
			docs.push({
				user: customer.user._id,
				products: items,
				totalAmount: round2(subtotal * (1 - discount / 100)),
				status,
				paymentStatus: paymentStatusFor(status),
				shippingAddress: customer.address,
				stripeSessionId: `cs_seed_${String(docs.length + 1).padStart(4, "0")}`,
				createdAt,
				updatedAt,
			});
		}
	}

	return orderModel.create(docs, { timestamps: false });
};

const updateProductSales = async (orders) => {
	const stats = new Map();
	for (const order of orders) {
		if (order.status === "cancelled") continue;
		for (const item of order.products) {
			const id = item.product.toString();
			const entry = stats.get(id) || { totalSold: 0, totalOrders: 0, totalRevenue: 0 };
			entry.totalSold += item.quantity;
			entry.totalOrders += 1;
			entry.totalRevenue = round2(entry.totalRevenue + item.price * item.quantity);
			stats.set(id, entry);
		}
	}
	await productModel.bulkWrite(
		[...stats].map(([id, entry]) => ({ updateOne: { filter: { _id: id }, update: { $set: entry }, timestamps: false } }))
	);
};

const updateCategoryProducts = async (catalogue, categoryByName) => {
	await categoryModel.bulkWrite(
		[...categoryByName.values()].map((category) => {
			const ids = catalogue.filter((product) => product.category === category.name).map((product) => product._id);
			return {
				updateOne: { filter: { _id: category._id }, update: { $set: { products: ids, productCount: ids.length } }, timestamps: false },
			};
		})
	);
};

const seedCoupons = async (now, customerProfiles, orders) => {
	const orderCount = new Map();
	for (const order of orders) orderCount.set(order.user.toString(), (orderCount.get(order.user.toString()) || 0) + 1);
	const byOrders = [...customerProfiles].sort(
		(a, b) => (orderCount.get(a.user._id.toString()) || 0) - (orderCount.get(b.user._id.toString()) || 0)
	);
	const holder = (index) => byOrders[index].user._id;
	const giftCode = () => "GIFT" + Array.from({ length: 6 }, () => pick([..."ABCDEFGHJKLMNPQRSTUVWXYZ23456789"])).join("");

	const coupons = [
		{ code: "WELCOME10", discountPercentage: 10, expiryDate: new Date(now + 75 * DAY), userId: holder(0) },
		{ code: "WHITEFRIDAY15", discountPercentage: 15, expiryDate: new Date("2026-11-30T20:59:59Z"), userId: holder(1) },
		{ code: "NATIONALDAY96", discountPercentage: 20, expiryDate: new Date("2026-09-30T20:59:59Z"), userId: holder(byOrders.length - 1) },
		{ code: "RAMADAN15", discountPercentage: 15, expiryDate: new Date("2026-03-19T20:59:59Z"), userId: holder(byOrders.length - 2) },
		...[3, 5, 8, 12].map((index, i) => ({
			code: giftCode(),
			discountPercentage: 10,
			expiryDate: new Date(now + (12 + i * 5) * DAY),
			userId: holder(byOrders.length - index),
		})),
	].map((coupon) => ({ ...coupon, isActive: coupon.expiryDate > now }));

	return couponModel.create(coupons);
};

const seedContactMessages = async (now, customerProfiles) =>
	contactUsModel.create(
		contactMessages.map(({ from, daysAgo, ...message }) => ({
			...message,
			name: customerProfiles[from].user.name,
			email: customerProfiles[from].user.email,
			createdAt: new Date(now - daysAgo * DAY - intBetween(1, 10) * 60 * 60 * 1000),
		}))
	);

const sampleProducts = (catalogue, count) => {
	const chosen = new Set();
	while (chosen.size < count) chosen.add(pickWeighted(catalogue, productWeight));
	return [...chosen];
};

const seedWishlistsAndCarts = async (now, catalogue, customerProfiles) => {
	const inStock = catalogue.filter((product) => product.stockQuantity > 0);
	const wishlists = customerProfiles.filter((_, index) => index % 3 === 0).map(({ user }) => ({
		user: user._id,
		products: sampleProducts(catalogue, intBetween(2, 5)).map((product) => ({
			product: product._id,
			addedAt: new Date(now - between(1, 60) * DAY),
		})),
	}));
	await wishlistModel.create(wishlists);

	const carts = customerProfiles.filter((_, index) => index % 4 === 1);
	await userModel.bulkWrite(
		carts.map(({ user }) => ({
			updateOne: {
				filter: { _id: user._id },
				update: { $set: { cartItems: sampleProducts(inStock, intBetween(1, 2)).map((product) => ({ product: product._id, quantity: 1 })) } },
				timestamps: false,
			},
		}))
	);
	return { wishlists: wishlists.length, carts: carts.length };
};

const printSummary = async (orders) => {
	console.log("\nCollection counts");
	for (const model of models) {
		console.log(`  ${model.collection.collectionName}: ${await model.countDocuments()}`);
	}
	const statuses = orders.reduce((acc, order) => ({ ...acc, [order.status]: (acc[order.status] || 0) + 1 }), {});
	const revenue = round2(orders.reduce((sum, order) => sum + order.totalAmount, 0));
	const dates = orders.map((order) => order.createdAt.getTime());
	console.log(`\nOrders: ${orders.length}, ${new Date(Math.min(...dates)).toISOString().slice(0, 10)} to ${new Date(Math.max(...dates)).toISOString().slice(0, 10)}`);
	console.log(`  statuses: ${JSON.stringify(statuses)}`);
	console.log(`  total amount: ${revenue} SAR`);
};

const run = async () => {
	if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
	if (!Number(process.env.SALT_ROUNDS)) throw new Error("SALT_ROUNDS must be set to hash user passwords");

	await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
	console.log(`Connected to database "${mongoose.connection.db.databaseName}"`);

	const now = Date.now();
	if (process.argv.includes("--reset")) await clearDatabase();
	else await ensureEmpty();

	const categoryByName = await seedCategories(now);
	const catalogue = await seedProducts(now, categoryByName);
	const customerProfiles = await seedCustomers(now);
	await seedAdmin();
	const orders = await seedOrders(now, catalogue, customerProfiles);
	await updateProductSales(orders);
	await updateCategoryProducts(catalogue, categoryByName);
	await seedCoupons(now, customerProfiles, orders);
	await seedContactMessages(now, customerProfiles);
	const extras = await seedWishlistsAndCarts(now, catalogue, customerProfiles);

	console.log(`Seeded ${categoryByName.size} categories, ${catalogue.length} products, ${customerProfiles.length} customers, ${orders.length} orders, ${extras.wishlists} wishlists and ${extras.carts} carts`);
	await printSummary(orders);
};

run()
	.catch((error) => {
		console.error(`Seed failed: ${error.message}`);
		process.exitCode = 1;
	})
	.finally(() => mongoose.disconnect());
