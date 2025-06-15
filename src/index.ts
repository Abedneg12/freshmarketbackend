import express, { Application, Request, Response, NextFunction } from "express";
import { FE_PORT, PORT } from "./config"
import helmet from 'helmet';
import cors from 'cors';


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



  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });