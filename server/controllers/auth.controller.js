import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { signAccess, signRefresh, verifyRefresh } from "../utils/token.js";

const register = asyncHandler(async (req, res) => {
  console.log("I WAS CALLED?");
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email & Password are required!" });

  const exists = await User.findOne({ email: email });

  if (exists) return res.status(400).json({ message: "User already exists!" });

  const salt = 10;
  const enPassword = await bcrypt.hash(password, salt);

  const user = new User({ email, password: enPassword });
  await user.save();

  return res.json({ message: "Registered!" });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const passed = await bcrypt.compare(password, user.password);
  if (!passed) return res.status(400).json({ message: "Invalid credentials" });

  const token = signAccess(user);
  const refresh = signRefresh(user);

  // user.refreshTokens.push({ refresh });
  user.refreshTokens.push(refresh);
  await user.save();

  return res.json({ token, refreshToken: refresh, email: user.email });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized!" });

  let verify = verifyRefresh(refreshToken);

  if (!verify) return res.json({ message: "Logged out" });

  const user = await User.findById(verify.id);
  if (!user) return res.json({ message: "Logged out" });
  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== refreshToken
  );

  await user.save();
  return res.json({ message: "Logged out" });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "refreshToken required" });

  let verify = verifyRefresh(refreshToken);

  if (!verify)
    return res.status(401).json({ message: "Invalid refresh token" });

  const user = await User.findById(payload.id);
  if (!user) return res.status(401).json({ message: "Invalid token" });

  const found = user.refreshTokens.find((rt) => rt.token === refreshToken);
  if (!found) return res.status(401).json({ message: "Invalid refresh token" });

  const token = signAccess(user);

  return res.json({ token, email: user.email });
});

export { register, login, logout, refresh };
