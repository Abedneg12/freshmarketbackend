// src/index.ts -> VERSI FINAL

import express, { Application, Request, Response, NextFunction } from "express";
import { FE_PORT, PORT } from "./config";
import helmet from 'helmet';
import cors from 'cors';
import './interfaces/IUserPayload';

// Routers untuk user biasa
import CartRouters from './routers/cart.router';
import OrderRouters from './routers/order.router';
import AdminOrderRouters from './routers/admin/admin.order.router'; 
import { handleMidtransNotificationController } from "./controllers/order.controller";

const port = PORT || 8000;
const app: Application = express();

app.use(helmet());
app.use(cors({
    origin: FE_PORT,
    credentials: true
}));
app.use(express.json());

app.get(
    "/api",
    (req: Request, res: Response, next: NextFunction) => {
      console.log("test masuk");
      next()
    },
    (req: Request, res: Response, next: NextFunction) => {
      res.status(200).send("ini API  dari FreshMart Backend");
    }
);

// Rute untuk user 
app.use('/api/cart', CartRouters);       
app.use('/api/orders', OrderRouters); 

// Rute publik untuk notifikasi
app.post('/api/payments/midtrans-notification', handleMidtransNotificationController);

// Rute untuk admin
app.use('/api/admin/orders', AdminOrderRouters);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});