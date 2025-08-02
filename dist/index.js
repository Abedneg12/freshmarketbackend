"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("./utils/passport"));
const config_1 = require("./config");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
require("./interfaces/IUserPayload");
const scheduler_1 = require("./cron/scheduler");
const super_admin_router_1 = __importDefault(require("./routers/super.admin.router"));
const discount_router_1 = __importDefault(require("./routers/discount.router"));
const cart_router_1 = __importDefault(require("./routers/cart.router"));
const order_router_1 = __importDefault(require("./routers/order.router"));
const auth_1 = __importDefault(require("./routers/auth"));
const OAuth_1 = __importDefault(require("./routers/OAuth"));
const store_1 = __importDefault(require("./routers/store"));
const userRoute_1 = __importDefault(require("./routers/userRoute"));
const admin_order_router_1 = __importDefault(require("./routers/admin/admin.order.router"));
const dashboard_admin_router_1 = __importDefault(require("./routers/admin/dashboard.admin.router"));
const category_router_1 = __importDefault(require("./routers/category.router"));
const product_router_1 = __importDefault(require("./routers/product.router"));
const inventory_router_1 = __importDefault(require("./routers/inventory.router"));
const address_router_1 = __importDefault(require("./routers/address.router"));
const shipping_router_1 = __importDefault(require("./routers/shipping.router"));
const stocks_reports_router_1 = __importDefault(require("./routers/stocks.reports.router"));
const sales_report_router_1 = __importDefault(require("./routers/sales.report.router"));
const store_management_router_1 = __importDefault(require("./routers/store.management.router"));
const port = config_1.PORT || 8000;
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.FE_PORT,
    credentials: true
}));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.get("/api", (req, res, next) => {
    console.log("test masuk");
    next();
});
app.use("/super-admin", super_admin_router_1.default);
app.use("/api/admin/orders", admin_order_router_1.default);
app.use("/api/admin/dashboard", dashboard_admin_router_1.default);
app.use("/discount", discount_router_1.default);
app.use("/cart", cart_router_1.default);
app.use("/api/orders", order_router_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/oauth", OAuth_1.default);
app.use("/stores", store_1.default);
app.use("/api/user", userRoute_1.default);
app.use("/category", category_router_1.default);
app.use("/product", product_router_1.default);
app.use("/inventory", inventory_router_1.default);
app.use("/api/addresses", address_router_1.default);
app.use("/api/shipping", shipping_router_1.default);
app.use("/stocks", stocks_reports_router_1.default);
app.use("/sales", sales_report_router_1.default);
app.use("/api/management/stores", store_management_router_1.default);
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    (0, scheduler_1.initScheduledJobs)();
});
