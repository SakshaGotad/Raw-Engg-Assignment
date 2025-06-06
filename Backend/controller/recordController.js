
const fs = require("fs");          
const path = require("path");      

const transcribeAudio   = require("../Logic/transcribeAudio");

module.exports = function (io) {  
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    let audioChunks = [];

    socket.on("audio-stream", (data) => {
      const buffer = Buffer.from(data.audioChunk, "base64");
      audioChunks.push(buffer);
    });

    socket.on("stop-audio-stream", async (data) => {
     
      const audioBuffer = Buffer.concat(audioChunks);
      const filePath = path.join(__dirname, "..", "temp_" + socket.id + ".wav"); // 
      fs.writeFileSync(filePath, audioBuffer);

      try {
        const transcript = await transcribeAudio(
          filePath,
          data.language || "en"
        );
        socket.emit("transcript-result", transcript);
      } catch (err) {
        console.error("Transcription failed:", err.message);
        socket.emit("transcript-result", "[Transcription failed]");
      } finally {
        
        audioChunks = [];
        fs.unlink(filePath, () => {});  
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      audioChunks = [];
    });
  });
};
