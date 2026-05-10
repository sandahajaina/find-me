import { Request, Response } from "express";
import { RegisterBody } from "../types";
import * as AuthService from '../services/auth.service';

export async function register(req: Request<{}, {}, RegisterBody >, res: Response) {

}