import { Request, Response } from "express";
import * as addressService from "../services/address.service";
import { IUserPayload } from "../interfaces/IUserPayload";

export const getAllAddressesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req.user as IUserPayload).id;
    const addresses = await addressService.getAllAddresses(userId);
    res.status(200).json(addresses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUserPayload).id;
    const newAddress = await addressService.createAddress(userId, req.body);
    res.status(201).json(newAddress);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const setMainAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUserPayload).id;
    const addressId = parseInt(req.params.addressId, 10);
    const updatedAddress = await addressService.setMainAddress(
      userId,
      addressId
    );
    res.status(200).json(updatedAddress);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUserPayload).id;
    const addressId = parseInt(req.params.addressId, 10);
    const updatedAddress = await addressService.updateAddress(
      userId,
      addressId,
      req.body
    );
    res.status(200).json(updatedAddress);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUserPayload).id;
    const addressId = parseInt(req.params.addressId, 10);
    await addressService.deleteAddress(userId, addressId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
