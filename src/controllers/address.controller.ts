import { Request, Response } from "express";
import {
  createAddress,
  getAllAddresses,
  updateAddress,
  deleteAddress,
} from "../services/address.service";
import { IAddress } from "../interfaces/address";

export const getAllAddressesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req.user as any).id;
    const addresses = await getAllAddresses(userId);
    res.status(200).json(addresses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const addressData: IAddress = req.body;
    const newAddress = await createAddress(userId, addressData);
    res.status(201).json(newAddress);
  } catch (error: any) {
    console.error("Error in createAddress controller:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const addressId = parseInt(req.params.id, 10);
    const addressData: Partial<IAddress> = req.body;
    const updatedAddress = await updateAddress(userId, addressId, addressData);
    res.status(200).json(updatedAddress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const addressId = parseInt(req.params.id, 10);
    const result = await deleteAddress(userId, addressId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
