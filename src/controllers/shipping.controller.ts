import { Request, Response } from "express";
import { calculateShippingCost } from "../services/shipping.service";
import { IUserPayload } from "../interfaces/IUserPayload";

export const getShippingCostController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req.user as IUserPayload).id;
    const { addressId } = req.body;
    if (!addressId) {
      res.status(400).json({ error: "addressId tidak boleh kosong." });
      return;
    }
    const shippingData = await calculateShippingCost(userId, Number(addressId));
    res.status(200).json(shippingData);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
