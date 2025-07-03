const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectToDB = require("./config/connectToDb");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

const userRoutes = require("./routes/user.routes");
const roomRoutes = require("./routes/room.routes");
const { createSocketServer } = require("./sockets/socket");

const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the LiveStack Server<h1>");
});

// routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/room", roomRoutes);

// configs
connectToDB();

// socket.io setup
const server = require("http").createServer(app);

const io = createSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}/`);
});
