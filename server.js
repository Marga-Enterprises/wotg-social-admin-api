// Module-alias setup
require("module-alias/register");

// Load environment variables
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Core packages
const express = require("express");
const cors = require("cors");
const http = require("http");

// Sequelize connection
const sequelize = require("@config/db"); 

// Init app and server
const app = express();
const port = process.env.PORT || 4000;
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes
const authRoutes = require("@routes/auth");
const blogRoutes = require("@routes/blogs");
const mediaRoutes = require("@routes/media");
const albumRoutes = require("@routes/album");
const musicRoutes = require("@routes/music");

// Use routes
app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);
app.use("/media", mediaRoutes);
app.use("/album", albumRoutes);
app.use("/music", musicRoutes);

// Sync Database and Start Server
sequelize
  .sync({ force: false })
  .then(() => console.log("Database synchronized..."))
  .catch((err) => console.error("Error synchronizing the database:", err))
  .finally(() => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  });
