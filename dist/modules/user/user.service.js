"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardSummary = exports.completeRegistration = exports.getProfile = void 0;
const database_1 = __importDefault(require("../../config/database"));
const http_status_codes_1 = require("http-status-codes");
const getProfile = async (userId) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const business = await database_1.default.businesses.findFirst({
        where: { userId: user.id },
        include: {
            store: true
        }
    });
    return {
        user,
        business
    };
};
exports.getProfile = getProfile;
const completeRegistration = async (userId, dto) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const getBusiness = await database_1.default.businesses.findFirst({ where: { userId: user.id } });
    if (getBusiness) {
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "This user already has a business" };
    }
    try {
        const business = await database_1.default.businesses.create({
            data: {
                userId: userId,
                bussinessName: dto.businessName,
                businessType: dto.businessType,
                description: dto.description,
                category: dto.category ?? {},
                address: dto.address,
                contactInfo: dto.contactInfo ?? {},
                status: dto.status ?? 'pending'
            },
        });
        const store = await database_1.default.stores.create({
            data: {
                businessId: business.id,
                storeName: dto.storeName,
                slogan: dto.slogan,
                customDomain: dto.customeDomain,
                paymentMethods: dto.paymentMethods,
                deliveryOptions: dto.deliveryOptions,
                status: dto.status ?? 'pending',
                currency: dto.currency
            },
        });
        return {
            business,
            store,
        };
    }
    catch (error) {
        console.error('Error completing registration:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to register business" };
    }
};
exports.completeRegistration = completeRegistration;
const dashboardSummary = async (userId) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const businesses = await database_1.default.businesses.findMany({
        where: { userId: user.id }
    });
    if (!businesses.length) {
        return {
            totalRevenue: 0,
            noOfOrders: 0,
            noOfProducts: 0,
            noOfCustomers: 0,
            businesses: null,
            orders: []
        };
    }
    const stores = await database_1.default.stores.findMany({
        where: { businessId: businesses[0].id }
    });
    if (!stores.length) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Store not found" };
    }
    const products = await database_1.default.products.findMany({
        where: { storeId: stores[0].id }
    });
    const orders = await database_1.default.orders.findMany({
        where: { storeId: stores[0].id },
        include: {
            customer: {
                select: {
                    fullname: true
                }
            }
        }
    });
    const formattedOrders = orders.map(order => ({
        ...order,
        customerName: order.customer?.fullname,
        customer: undefined // or delete order.customer
    }));
    // 📦 Stock alert logic
    const stockAlert = products
        .filter(product => product.quantity <= 10)
        .map(product => {
        let stockStatus;
        if (product.quantity <= 3) {
            stockStatus = 'critical';
        }
        else if (product.quantity <= 5) {
            stockStatus = 'low';
        }
        else {
            stockStatus = 'medium';
        }
        return {
            ...product,
            stockStatus
        };
    });
    return {
        totalRevenue: orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0),
        noOfOrders: orders.length,
        noOfProducts: products.length,
        noOfCustomers: new Set(orders.map((o) => o.customerId)).size,
        businesses,
        orders: formattedOrders,
        stockAlert
    };
};
exports.dashboardSummary = dashboardSummary;
