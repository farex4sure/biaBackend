"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = exports.customerSummary = void 0;
const database_1 = __importDefault(require("../../config/database"));
const http_status_codes_1 = require("http-status-codes");
// import { CreateOrderDto, addCategoryDto, editCategoryDto, addProductDto, editProductDto } from './inventory.dto';
const dayjs_1 = __importDefault(require("dayjs"));
const customerSummary = async (userId) => {
    const user = await database_1.default.users.findUnique({ where: { id: userId } });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const businesses = await database_1.default.businesses.findMany({
        where: { userId: user.id },
    });
    if (!businesses.length) {
        return {
            totalCustomer: 0,
            newCustomer: 0,
            retentionRate: "0%",
            topSpenders: [],
        };
    }
    const stores = await database_1.default.stores.findMany({
        where: { businessId: { in: businesses.map((b) => b.id) } },
    });
    if (!stores.length) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Store not found" };
    }
    const storeIds = stores.map((store) => store.id);
    const orders = await database_1.default.orders.findMany({
        where: { storeId: { in: storeIds } },
        orderBy: { createdAt: "asc" },
    });
    if (!orders.length) {
        return {
            totalCustomer: 0,
            newCustomer: 0,
            retentionRate: "0%",
            topSpenders: [],
        };
    }
    const customerOrderMap = {};
    const customerIds = new Set();
    for (const order of orders) {
        if (!customerOrderMap[order.customerId]) {
            customerOrderMap[order.customerId] = [];
        }
        customerOrderMap[order.customerId].push(order);
        customerIds.add(order.customerId);
    }
    const allCustomers = await database_1.default.customers.findMany({
        where: { id: { in: [...customerIds] } },
    });
    const now = (0, dayjs_1.default)();
    const newCustomerCount = Object.entries(customerOrderMap).filter(([, orderList]) => {
        const firstOrderDate = (0, dayjs_1.default)(orderList[0].createdAt);
        return now.diff(firstOrderDate, "day") <= 30;
    }).length;
    const returningCustomers = Object.values(customerOrderMap).filter((orders) => orders.length > 1).length;
    const retentionRate = ((returningCustomers / customerIds.size) *
        100).toFixed(1);
    const customerSpendingMap = {};
    for (const order of orders) {
        customerSpendingMap[order.customerId] =
            (customerSpendingMap[order.customerId] || 0) + Number(order.totalAmount);
    }
    const topSpenderData = allCustomers
        .map((customer) => ({
        name: customer.fullname,
        totalSpent: customerSpendingMap[customer.id] || 0,
    }))
        .sort((a, b) => b.totalSpent - a.totalSpent)[0] || { name: "", totalSpent: 0 };
    return {
        totalCustomer: customerIds.size,
        newCustomer: newCustomerCount,
        retentionRate: `${retentionRate}%`,
        topSpenders: topSpenderData,
    };
};
exports.customerSummary = customerSummary;
const listCustomers = async (userId, page = 1, limit = 10) => {
    const user = await database_1.default.users.findUnique({ where: { id: userId } });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const businesses = await database_1.default.businesses.findMany({
        where: { userId: user.id },
    });
    if (!businesses.length) {
        return {
            customers: [],
            meta: { total: 0, page, limit, totalPages: 0 },
        };
    }
    const stores = await database_1.default.stores.findMany({
        where: { businessId: { in: businesses.map((b) => b.id) } },
    });
    if (!stores.length) {
        return {
            customers: [],
            meta: { total: 0, page, limit, totalPages: 0 },
        };
    }
    const storeIds = stores.map((s) => s.id);
    const orders = await database_1.default.orders.findMany({
        where: { storeId: { in: storeIds } },
        select: { customerId: true, totalAmount: true },
    });
    const customerStats = {};
    for (const order of orders) {
        const customerId = order.customerId;
        if (!customerId)
            continue;
        if (!customerStats[customerId]) {
            customerStats[customerId] = { totalOrders: 0, totalSpent: 0 };
        }
        customerStats[customerId].totalOrders += 1;
        customerStats[customerId].totalSpent += Number(order.totalAmount);
    }
    const customerIds = Object.keys(customerStats).map((id) => Number(id));
    const total = customerIds.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedCustomerIds = customerIds.slice(skip, skip + limit);
    const customers = await database_1.default.customers.findMany({
        where: { id: { in: paginatedCustomerIds } },
    });
    const enrichedCustomers = customers.map((customer) => ({
        ...customer,
        totalOrders: customerStats[customer.id]?.totalOrders || 0,
        totalSpent: customerStats[customer.id]?.totalSpent || 0,
    }));
    return {
        customers: enrichedCustomers,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
    };
};
exports.listCustomers = listCustomers;
