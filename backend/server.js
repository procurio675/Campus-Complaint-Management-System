import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// CORS Configuration - Development mode: Allow all localhost origins
// IMPORTANT: For production, restrict this to specific domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // In development: Allow all localhost origins and any other origin
  // When credentials are used, we must set the specific origin (not '*')
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // Allow requests with no origin (Postman, curl, etc.)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  
  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
app.use("/api/complaints", complaintRoutes);

// Server
// Use port 3001 to avoid conflict with macOS AirPlay Receiver on port 5000
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
