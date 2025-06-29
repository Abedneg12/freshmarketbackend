import express, { Application, Request, Response, NextFunction } from "express";
import { FE_PORT, PORT } from "./config"
import helmet from 'helmet';
import cors from 'cors';
import './interfaces/IUserPayload';

// import CartRouters from './routers/cart.router';
// import OrderRouters from './routers/order.router';
import SuperAdminRouter from "./routers/super.admin.router";
import DiscountRouter from "./routers/discount.router";

const port = PORT || 5000;
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

// app.use('/cart', CartRouters);
// app.use('/orders', OrderRouters);
app.use("/super-admin", SuperAdminRouter);
app.use("/discount", DiscountRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});