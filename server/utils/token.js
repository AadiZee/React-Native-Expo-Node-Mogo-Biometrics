import jwt from "jsonwebtoken";

const signAccess = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

const signRefresh = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );
};

const verifyRefresh = (refresh) => {
  return jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
};

export { signAccess, signRefresh, verifyRefresh };
