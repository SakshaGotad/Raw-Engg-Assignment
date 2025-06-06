const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require('http');
const app = express();
const { Server } = require("socket.io");
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

const transcriptRouter = require("./routes/TranscriptRoutes");
app.use("/transcribe", transcriptRouter);


const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

require("./controller/recordController")(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
