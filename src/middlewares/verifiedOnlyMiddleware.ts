import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUserPayload } from "../interfaces/IUserPayload";
import prisma from "../lib/prisma";

export const verifiedOnlyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized - No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IUserPayload;

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ message: "Unauthorized - User not found" });
      return;
    }

    if (!decoded.isVerified) {
      res.status(403).json({ message: "Forbidden - Account not verified" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
