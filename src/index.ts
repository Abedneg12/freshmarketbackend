import express, { Application, Request, Response, NextFunction } from "express";
import passport from "./utils/passport";
import { FE_PORT, PORT } from "./config"
import helmet from 'helmet';
import cors from 'cors';
import './interfaces/IUserPayload';
import path from "path";


import { initScheduledJobs } from './cron/scheduler';

import SuperAdminRouter from "./routers/super.admin.router";
import DiscountRouter from "./routers/discount.router";
import CartRouters from './routers/cart.router';
import OrderRouters from './routers/order.router';
import authRoutes from "./routers/auth";
import OAuthRoutes from "./routers/OAuth";
import storeRoutes from "./routers/store";
import userRoutes from "./routers/userRoute";
import AdminOrderRouters from './routers/admin/admin.order.router';
import CategoryRouters from "./routers/category.router";
import ProductRouters from "./routers/product.router";
import InventoryRouters from "./routers/inventory.router";
import addressRoutes from "./routers/address.router";
import shippingRoutes from "./routers/shipping.router";




const port = PORT || 8000;
const app: Application = express();

app.use(helmet());

app.use(cors({
  origin: FE_PORT,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());
app.get(
  "/api",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("test masuk");
    next()
  },
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send("ini API event_management kita");
  }
);


app.use("/super-admin", SuperAdminRouter);
app.use('/api/admin/orders', AdminOrderRouters);
app.use("/discount", DiscountRouter);
app.use('/cart', CartRouters);
app.use('/api/orders', OrderRouters);
app.use("/api/auth", authRoutes);
app.use("/api/oauth", OAuthRoutes);
app.use("/stores", storeRoutes);
app.use("/api/user", userRoutes);
app.use("/category", CategoryRouters);
app.use("/product", ProductRouters);
app.use("/inventory", InventoryRouters);
app.use("/api/addresses", addressRoutes);
app.use("/api/shipping", shippingRoutes);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  initScheduledJobs();
});

