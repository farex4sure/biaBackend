"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrder = exports.deleteOrder = exports.listOrders = exports.addOrder = exports.orderSummary = exports.listProducts = exports.deleteProduct = exports.editProduct = exports.addProduct = exports.listCategories = exports.deleteCategory = exports.editCategory = exports.addCategory = exports.inventorySummary = void 0;
const database_1 = __importDefault(require("../../config/database"));
const http_status_codes_1 = require("http-status-codes");
const inventorySummary = async (userId) => {
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
            noOfProducts: 0,
            noOfLowStocksItems: 0,
            totalValueOfProducts: 0,
            noOfCategories: 0,
            products: []
        };
    }
    const stores = await database_1.default.stores.findMany({
        where: { businessId: businesses[0].id }
    });
    if (!stores.length) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Store not found" };
    }
    // Get all categories for the store
    const categories = await database_1.default.categories.findMany({
        where: { storeId: stores[0].id }
    });
    const products = await database_1.default.products.findMany({
        where: { storeId: stores[0].id },
        include: {
            category: {
                select: {
                    name: true
                }
            }
        }
    });
    // Add stockStatus and calculate metrics
    let totalValue = 0;
    const lowStockItems = [];
    const enrichedProducts = products.map(product => {
        const quantity = product.quantity || 0;
        const price = parseFloat(product.price.toString() || "0");
        const value = price * quantity;
        totalValue += value;
        if (quantity < 10) {
            lowStockItems.push(product);
        }
        let stockStatus;
        if (quantity < 3) {
            stockStatus = 'critical';
        }
        else if (quantity < 5) {
            stockStatus = 'low';
        }
        else if (quantity < 10) {
            stockStatus = 'medium';
        }
        else {
            stockStatus = 'great';
        }
        const { category, ...rest } = product;
        return {
            ...rest,
            categoryName: category?.name,
            stockStatus
        };
    });
    return {
        noOfProducts: products.length,
        noOfLowStocksItems: lowStockItems.length,
        totalValueOfProducts: totalValue,
        noOfCategories: categories.length,
        products: enrichedProducts
    };
};
exports.inventorySummary = inventorySummary;
const addCategory = async (userId, dto) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const getBusiness = await database_1.default.businesses.findFirst({
        where: { userId: user.id }
    });
    if (!getBusiness) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Business not found" };
    }
    const getStore = await database_1.default.stores.findFirst({
        where: { businessId: getBusiness.id }
    });
    if (!getStore) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Store not found" };
    }
    try {
        const category = await database_1.default.categories.create({
            data: {
                storeId: getStore.id,
                name: dto.name,
                description: dto.description,
            },
        });
        return {
            category
        };
    }
    catch (error) {
        console.error('Error completing registration:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to add category" };
    }
};
exports.addCategory = addCategory;
const editCategory = async (userId, categoryId, dto) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        const category = await database_1.default.categories.update({
            where: { id: categoryId },
            data: {
                name: dto.name,
                description: dto.description,
            },
        });
        return {
            category
        };
    }
    catch (error) {
        console.error('Error updating category:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to update category" };
    }
};
exports.editCategory = editCategory;
const deleteCategory = async (userId, categoryId) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        // First check if category exists
        const category = await database_1.default.categories.findUnique({
            where: { id: categoryId }
        });
        if (!category) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Category not found" };
        }
        // Check if category has any products
        const products = await database_1.default.products.findMany({
            where: { categoryId: categoryId }
        });
        if (products.length > 0) {
            throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Cannot delete category with associated products" };
        }
        await database_1.default.categories.delete({
            where: { id: categoryId }
        });
        return {
            message: "Category successfully deleted"
        };
    }
    catch (error) {
        console.error('Error deleting category:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to delete category" };
    }
};
exports.deleteCategory = deleteCategory;
const listCategories = async (userId) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        const getBusiness = await database_1.default.businesses.findFirst({
            where: { userId: user.id }
        });
        if (!getBusiness) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Business not found" };
        }
        const getStore = await database_1.default.stores.findFirst({
            where: { businessId: getBusiness.id }
        });
        if (!getStore) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Store not found" };
        }
        const categories = await database_1.default.categories.findMany({
            where: { storeId: getStore.id },
            orderBy: { id: 'desc' }
        });
        return {
            categories
        };
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to fetch categories" };
    }
};
exports.listCategories = listCategories;
const addProduct = async (userId, dto) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        // Verify store exists and belongs to user's business
        const store = await database_1.default.stores.findFirst({
            where: {
                id: dto.storeId,
                business: {
                    userId: user.id
                }
            }
        });
        if (!store) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Store not found or unauthorized" };
        }
        // Verify category exists
        const category = await database_1.default.categories.findUnique({
            where: { id: dto.categoryId }
        });
        if (!category) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Category not found" };
        }
        const product = await database_1.default.products.create({
            data: {
                storeId: dto.storeId,
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                quantity: dto.quantity,
                images: dto.images
            },
            // include: {
            //     category: true
            // }
        });
        return {
            product
        };
    }
    catch (error) {
        console.error('Error adding product:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to add product" };
    }
};
exports.addProduct = addProduct;
const editProduct = async (userId, productId, dto) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        // Verify product exists and belongs to user's store
        const product = await database_1.default.products.findFirst({
            where: {
                id: productId,
                store: {
                    business: {
                        userId: user.id
                    }
                }
            }
        });
        if (!product) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Product not found or unauthorized" };
        }
        // If categoryId is provided, verify it exists
        if (dto.categoryId) {
            const category = await database_1.default.categories.findUnique({
                where: { id: dto.categoryId }
            });
            if (!category) {
                throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Category not found" };
            }
        }
        const updatedProduct = await database_1.default.products.update({
            where: { id: productId },
            data: {
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                quantity: dto.quantity,
                images: dto.images
            },
            // include: {
            //     category: true
            // }
        });
        return {
            product: updatedProduct
        };
    }
    catch (error) {
        console.error('Error updating product:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to update product" };
    }
};
exports.editProduct = editProduct;
const deleteProduct = async (userId, productId) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        // Verify product exists and belongs to user's store
        const product = await database_1.default.products.findFirst({
            where: {
                id: productId,
                store: {
                    business: {
                        userId: user.id
                    }
                }
            }
        });
        if (!product) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Product not found or unauthorized" };
        }
        // Check if product is part of any orders
        const orderItems = await database_1.default.orderItems.findMany({
            where: { productId: productId }
        });
        if (orderItems.length > 0) {
            throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Cannot delete product that is part of existing orders" };
        }
        await database_1.default.products.delete({
            where: { id: productId }
        });
        return {
            message: "Product successfully deleted"
        };
    }
    catch (error) {
        console.error('Error deleting product:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to delete product" };
    }
};
exports.deleteProduct = deleteProduct;
const listProducts = async (userId, storeId) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        const whereClause = {
            store: {
                business: {
                    userId: user.id
                }
            }
        };
        if (storeId) {
            whereClause.storeId = storeId;
        }
        const products = await database_1.default.products.findMany({
            where: whereClause,
            // include: {
            //     category: true
            // },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return {
            products
        };
    }
    catch (error) {
        console.error('Error fetching products:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "failed to fetch products" };
    }
};
exports.listProducts = listProducts;
const orderSummary = async (userId) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        // Get all businesses for the user
        const businesses = await database_1.default.businesses.findMany({
            where: { userId: user.id }
        });
        if (!businesses.length) {
            return {
                totalNumberOfOrders: 0,
                totalNumberOfPendingOrders: 0,
                totalSales: 0,
                totalNumberOfLowStockItems: 0,
                recentOrders: []
            };
        }
        // Get all stores for all businesses
        const businessIds = businesses.map(b => b.id);
        const stores = await database_1.default.stores.findMany({
            where: { businessId: { in: businessIds } }
        });
        if (!stores.length) {
            return {
                totalNumberOfOrders: 0,
                totalNumberOfPendingOrders: 0,
                totalSales: 0,
                totalNumberOfLowStockItems: 0,
                recentOrders: []
            };
        }
        const storeIds = stores.map(s => s.id);
        // Get all orders for all stores
        const orders = await database_1.default.orders.findMany({
            where: { storeId: { in: storeIds } },
            include: { orderItems: true, customer: true },
            orderBy: { createdAt: 'desc' }
        });
        // Get all products for all stores
        const products = await database_1.default.products.findMany({
            where: { storeId: { in: storeIds } }
        });
        // Calculate low stock items (quantity < 10)
        const lowStockItems = products.filter(p => (p.quantity || 0) < 10);
        // Calculate total sales (sum of totalAmount for all orders)
        const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        // Calculate total number of pending orders
        const totalNumberOfPendingOrders = orders.filter(order => order.status === 'pending').length;
        // Prepare recentOrders (limit to 10 most recent)
        const recentOrders = orders.slice(0, 10).map(order => ({
            customer: order.customer?.fullname || '',
            date: order.createdAt,
            numberOfItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: order.totalAmount,
            status: order.status
        }));
        return {
            totalNumberOfOrders: orders.length,
            totalNumberOfPendingOrders,
            totalSales,
            totalNumberOfLowStockItems: lowStockItems.length,
            recentOrders
        };
    }
    catch (error) {
        console.error('Error fetching order summary:', error);
        throw { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Failed to fetch order summary" };
    }
};
exports.orderSummary = orderSummary;
const addOrder = async (userId, dto) => {
    const user = await database_1.default.users.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    }
    try {
        const getBusiness = await database_1.default.businesses.findFirst({
            where: { userId: user.id },
        });
        if (!getBusiness) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Business not found" };
        }
        const getStore = await database_1.default.stores.findFirst({
            where: { businessId: getBusiness.id },
        });
        if (!getStore) {
            throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Store not found" };
        }
        // Check if customer exists by phone
        let customer = await database_1.default.customers.findFirst({
            where: { phone: dto.phone },
        });
        if (!customer) {
            // Create customer
            customer = await database_1.default.customers.create({
                data: {
                    fullname: dto.customerName ?? "",
                    phone: dto.phone ?? "",
                    email: `${dto.phone ?? "unknown"}@generated.com`, // Generate or modify as necessary
                },
            });
        }
        // Calculate total amount
        let totalAmount = 0;
        const orderItemsData = [];
        if (!Array.isArray(dto.orderItems) || dto.orderItems.length === 0) {
            throw {
                status: http_status_codes_1.StatusCodes.BAD_REQUEST,
                message: "Order items are required and must be a non-empty array",
            };
        }
        for (const item of dto.orderItems) {
            const product = await database_1.default.products.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                throw {
                    status: http_status_codes_1.StatusCodes.BAD_REQUEST,
                    message: `Product with ID ${item.productId} not found`,
                };
            }
            // Ensure item.quantity is defined and is a number
            if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
                throw {
                    status: http_status_codes_1.StatusCodes.BAD_REQUEST,
                    message: `Invalid quantity for product with ID ${item.productId}`,
                };
            }
            const subTotal = Number(product.price) * item.quantity;
            totalAmount += subTotal;
            orderItemsData.push({
                productId: item.productId,
                price: product.price,
                quantity: item.quantity,
                subTotal,
            });
        }
        // Create order and items in a transaction
        const createdOrder = await database_1.default.orders.create({
            data: {
                storeId: getStore.id,
                customerId: customer.id,
                totalAmount,
                status: 'pending',
                orderItems: {
                    create: orderItemsData.map(item => ({
                        product: { connect: { id: item.productId } },
                        price: item.price,
                        quantity: item.quantity,
                        subTotal: item.subTotal,
                    })),
                },
            },
            include: {
                orderItems: true,
            },
        });
        return createdOrder;
    }
    catch (error) {
        console.error('Error creating order:', error);
        throw {
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: (error && typeof error === 'object' && 'message' in error) ? error.message : "Failed to add order",
        };
    }
};
exports.addOrder = addOrder;
const listOrders = async (userId, storeId) => {
    const user = await database_1.default.users.findUnique({ where: { id: userId } });
    if (!user)
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    const whereClause = {
        store: { business: { userId: user.id } }
    };
    // const checkStore = await prisma.stores.findFirst({ where: { businessId: whereClause.id } })
    if (storeId)
        whereClause.storeId = storeId;
    const orders = await database_1.default.orders.findMany({
        where: whereClause,
        include: { orderItems: true, customer: true },
        orderBy: { createdAt: 'desc' }
    });
    return { orders };
};
exports.listOrders = listOrders;
const deleteOrder = async (userId, orderId) => {
    const user = await database_1.default.users.findUnique({ where: { id: userId } });
    if (!user)
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    // Ensure order belongs to user's store
    const order = await database_1.default.orders.findFirst({
        where: {
            id: orderId,
            store: { business: { userId: user.id } }
        }
    });
    if (!order)
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Order not found or unauthorized" };
    await database_1.default.orders.delete({ where: { id: orderId } });
    return { message: "Order successfully deleted" };
};
exports.deleteOrder = deleteOrder;
const updateOrder = async (userId, orderId, data) => {
    const user = await database_1.default.users.findUnique({ where: { id: userId } });
    if (!user)
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "User not found" };
    // Ensure order belongs to user's store
    const order = await database_1.default.orders.findFirst({
        where: {
            id: orderId,
            store: { business: { userId: user.id } }
        }
    });
    if (!order)
        throw { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Order not found or unauthorized" };
    const updatedOrder = await database_1.default.orders.update({
        where: { id: orderId },
        data,
        include: { orderItems: true, customer: true }
    });
    return { order: updatedOrder };
};
exports.updateOrder = updateOrder;
