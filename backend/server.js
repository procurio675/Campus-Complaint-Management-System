import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js"
dotenv.config();
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("MONGO_URI missing in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});
app.use("/api/auth", authRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
