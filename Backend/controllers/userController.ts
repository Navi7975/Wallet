import { Request, Response } from "express";
import { User } from "../models";

export const createUser = async (req: Request, res: Response) => {
    const user = await User.create({ name: req.body.name });
    res.json(user);
};

export const getUsers = async (_: Request, res: Response) => {
    const users = await User.findAll();
    res.json(users);
};
