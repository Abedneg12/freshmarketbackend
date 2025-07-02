import express, { Application, Request, Response, NextFunction } from "express";
import passport from "./utils/passport";
import { FE_PORT, PORT } from "./config"
import helmet from 'helmet';
import cors from 'cors';
import './interfaces/IUserPayload';
import CartRouters from './routers/cart.router';
import OrderRouters from './routers/order.router';
import authRoutes from "./routes/auth";
import OAuthRoutes from "./routes/OAuth";
import storeRoutes from "./routes/store";
import userRoutes from "./routes/userRoute";


const port = PORT || 5000;
const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: FE_PORT,
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

app.get(
  "/api",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("test masuk");
    next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send("ini API  dari FreshMart Backend");
  }
);
app.use('/cart', CartRouters);
app.use('/orders', OrderRouters);
app.use("/api/auth", authRoutes);
app.use("/api/oauth", OAuthRoutes);
app.use("/stores", storeRoutes);
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
