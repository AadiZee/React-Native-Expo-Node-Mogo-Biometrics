import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.route.js";
import connectDB from "./utils/db.js";

connectDB();

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// app.use("/", (req, res) => res.json({ message: "I am alive" }));

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
