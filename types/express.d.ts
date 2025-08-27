import { User } from "../entities/User";
import { Request, Response, NextFunction } from "express";

interface Request extends Request {
  user?: User;
}
