"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrdersController = exports.addOrderController = exports.orderSummaryController = exports.listProductsController = exports.deleteProductController = exports.editProductController = exports.addProductController = exports.listCategoriesController = exports.deleteCategoryController = exports.editCategoryController = exports.addCategoryController = exports.inventorySummaryController = void 0;
const inventory_dto_1 = require("./inventory.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const inventory_service_1 = require("./inventory.service");
const http_status_codes_1 = require("http-status-codes");
const inventorySummaryController = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            responseSuccessful: false,
            responseMessage: "Unauthorized",
            responseBody: null,
        });
        return;
    }
    try {
        const result = await (0, inventory_service_1.inventorySummary)(userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            responseSuccessful: true,
            responseMessage: "User inventory summary successfully fetched",
            responseBody: result,
        });
    }
    catch (err) {
        const status = err.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.inventorySummaryController = inventorySummaryController;
// category
const addCategoryController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const dto = (0, class_transformer_1.plainToInstance)(inventory_dto_1.addCategoryDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Validation failed",
                responseBody: errors,
            });
            return;
        }
        const result = await (0, inventory_service_1.addCategory)(userId, dto);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Category successfully added",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.addCategoryController = addCategoryController;
const editCategoryController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Invalid category ID",
                responseBody: null
            });
            return;
        }
        const dto = (0, class_transformer_1.plainToInstance)(inventory_dto_1.editCategoryDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Validation failed",
                responseBody: errors,
            });
            return;
        }
        const result = await (0, inventory_service_1.editCategory)(userId, categoryId, dto);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Category successfully updated",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.editCategoryController = editCategoryController;
const deleteCategoryController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Invalid category ID",
                responseBody: null
            });
            return;
        }
        const result = await (0, inventory_service_1.deleteCategory)(userId, categoryId);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Category successfully deleted",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.deleteCategoryController = deleteCategoryController;
const listCategoriesController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const result = await (0, inventory_service_1.listCategories)(userId);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Categories successfully fetched",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.listCategoriesController = listCategoriesController;
// product
const addProductController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const dto = (0, class_transformer_1.plainToInstance)(inventory_dto_1.addProductDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Validation failed",
                responseBody: errors,
            });
            return;
        }
        const result = await (0, inventory_service_1.addProduct)(userId, dto);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Product successfully added",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.addProductController = addProductController;
const editProductController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Invalid product ID",
                responseBody: null
            });
            return;
        }
        const dto = (0, class_transformer_1.plainToInstance)(inventory_dto_1.editProductDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Validation failed",
                responseBody: errors,
            });
            return;
        }
        const result = await (0, inventory_service_1.editProduct)(userId, productId, dto);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Product successfully updated",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.editProductController = editProductController;
const deleteProductController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Invalid product ID",
                responseBody: null
            });
            return;
        }
        const result = await (0, inventory_service_1.deleteProduct)(userId, productId);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Product successfully deleted",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.deleteProductController = deleteProductController;
const listProductsController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
        if (storeId && isNaN(storeId)) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Invalid store ID",
                responseBody: null
            });
            return;
        }
        const result = await (0, inventory_service_1.listProducts)(userId, storeId);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Products successfully fetched",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.listProductsController = listProductsController;
// order
const orderSummaryController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const result = await (0, inventory_service_1.orderSummary)(userId);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Order summary successfully fetched",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.orderSummaryController = orderSummaryController;
const addOrderController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const dto = (0, class_transformer_1.plainToInstance)(inventory_dto_1.CreateOrderDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Validation failed",
                responseBody: errors,
            });
            return;
        }
        const result = await (0, inventory_service_1.addOrder)(userId, dto);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Order successfully added",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.addOrderController = addOrderController;
const listOrdersController = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                responseSuccessful: false,
                responseMessage: "Unauthorized",
                responseBody: null
            });
            return;
        }
        const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
        if (storeId && isNaN(storeId)) {
            res.status(400).json({
                responseSuccessful: false,
                responseMessage: "Invalid store ID",
                responseBody: null
            });
            return;
        }
        const result = await (0, inventory_service_1.listOrders)(userId, storeId);
        res.status(200).json({
            responseSuccessful: true,
            responseMessage: "Orders successfully fetched",
            responseBody: result
        });
    }
    catch (err) {
        const status = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(status).json({
            responseSuccessful: false,
            responseMessage: message,
            responseBody: null,
        });
    }
};
exports.listOrdersController = listOrdersController;
