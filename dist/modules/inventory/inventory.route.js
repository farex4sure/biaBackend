"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventory_controller_1 = require("./inventory.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const inventoryRoutes = express_1.default.Router();
inventoryRoutes.get('/inventory-summary', auth_middleware_1.authenticate, inventory_controller_1.inventorySummaryController);
// category
inventoryRoutes.post('/category', auth_middleware_1.authenticate, inventory_controller_1.addCategoryController);
inventoryRoutes.get('/category', auth_middleware_1.authenticate, inventory_controller_1.listCategoriesController);
inventoryRoutes.patch('/category/:id', auth_middleware_1.authenticate, inventory_controller_1.editCategoryController);
inventoryRoutes.delete('/category/:id', auth_middleware_1.authenticate, inventory_controller_1.deleteCategoryController);
// product
inventoryRoutes.post('/product', auth_middleware_1.authenticate, inventory_controller_1.addProductController);
inventoryRoutes.get('/product', auth_middleware_1.authenticate, inventory_controller_1.listProductsController);
inventoryRoutes.patch('/product/:id', auth_middleware_1.authenticate, inventory_controller_1.editProductController);
inventoryRoutes.delete('/product/:id', auth_middleware_1.authenticate, inventory_controller_1.deleteProductController);
// order
inventoryRoutes.get('/order/summary', auth_middleware_1.authenticate, inventory_controller_1.orderSummaryController);
inventoryRoutes.post('/order', auth_middleware_1.authenticate, inventory_controller_1.addOrderController);
inventoryRoutes.get('/order', auth_middleware_1.authenticate, inventory_controller_1.listOrdersController);
exports.default = inventoryRoutes;
