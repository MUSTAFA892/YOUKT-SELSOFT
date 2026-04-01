import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { config } from "../config.js";
import { AppError } from "../errors.js";

export const verifyPassword = async (email, password) => {
  const { rows } = await pool.query("SELECT * FROM public.users WHERE lower(email) = lower($1) LIMIT 1", [email]);
  const user = rows[0];
  if (!user) return null;
  if (!user.password_hash) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  // remove sensitive fields
  delete user.password_hash;
  return user;
};

export const findOrCreateByProvider = async ({ auth_provider, auth_provider_id, email, first_name, last_name }) => {
  if (!auth_provider || !auth_provider_id) throw new AppError("auth_provider and auth_provider_id are required", 400);

  const { rows } = await pool.query(
    `SELECT * FROM public.users WHERE auth_provider = $1 AND auth_provider_id = $2 LIMIT 1`,
    [auth_provider, auth_provider_id]
  );

  let user = rows[0];
  if (user) {
    delete user.password_hash;
    return user;
  }

  const insertRes = await pool.query(
    `INSERT INTO public.users (email, auth_provider, auth_provider_id, first_name, last_name)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [email || null, auth_provider, auth_provider_id, first_name || null, last_name || null]
  );

  user = insertRes.rows[0];
  delete user.password_hash;
  return user;
};

export const signToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    role_id: user.role_id || null
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    throw new AppError("Invalid token", 401);
  }
};
