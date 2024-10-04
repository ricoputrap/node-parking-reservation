import * as jwt from "jsonwebtoken";
import IUser from "../../entity/user.entity";
import { IPayload } from "./index.types";
import { ServerResponse } from "http";
import { ONE_DAY_IN_SECONDS, ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MILLISECONDS } from "../../../config/constants";

const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET || "";
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET || "";

export const generateAccessToken = (user: Omit<IUser, "password">) => {
  // current time in seconds
  const now = Math.floor(Date.now() / ONE_SECOND_IN_MILLISECONDS)

  // expires in 15 minutes
  const exp = now + ONE_MINUTE_IN_SECONDS * 15;

  const payload: IPayload = {
    iat: now,
    exp,
    user_id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET);
};

export const generateRefreshToken = (user: Omit<IUser, "password">) => {
  // current time in seconds
  const now = Math.floor(Date.now() / ONE_SECOND_IN_MILLISECONDS)

  // expires in 30 days
  const exp = now + ONE_DAY_IN_SECONDS * 30;

  const payload: IPayload = {
    iat: now,
    exp,
    user_id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};


export const setHttpOnlyCookie = (
  res: ServerResponse, name: string,
  value: string,
  options: Record<string, any>
) => {
  const cookieOptions = {
    ...options,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: options.path || "/",
    maxAge: options.maxAge || undefined // maxAge is in seconds
  };

  const cookieString = `${name}=${value}; ` +
    `HttpOnly; ` +
    `Path=${cookieOptions.path}; ` +
    `SameSite=${cookieOptions.sameSite}; ` +
    (cookieOptions.secure ? 'Secure; ' : '') +
    (cookieOptions.maxAge ? `Max-Age=${cookieOptions.maxAge}; ` : '');

  res.setHeader("Set-Cookie", cookieString);
}