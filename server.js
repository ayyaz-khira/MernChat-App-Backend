const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToMongoose = require("./config/dbconfig");
const http = require("http");
const socketio = require("socket.io");
const userRouter = require("./routes/userRoutes");
const socketIo = require("./socket");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");
dotenv.config();

connectToMongoose();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:5173","https://monumental-chebakia-4132ca.netlify.app/"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});



app.use(cors());
app.use(express.json());


socketIo(io);


app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);


const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>console.log("Server is up and running on port", PORT));
