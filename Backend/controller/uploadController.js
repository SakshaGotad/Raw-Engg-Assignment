const fs = require("fs");
const fetch = require("node-fetch");

require("dotenv").config();

const ASSEMBLY_KEY = process.env.API_KEY;

const transcribeAudio = async (req, res) => {
  try {
    const audioPath = req.file.path;
    const audioData = fs.readFileSync(audioPath);
    const language = req.body.language;
    
    const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: ASSEMBLY_KEY },
      body: audioData,
    });

    const { upload_url } = await uploadRes.json();

    
    const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: ASSEMBLY_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_code: language || "en", 
      }),
    });

    const { id: transcriptId } = await transcriptRes.json();

    
    let completed = false;
    let transcriptText = "";

    while (!completed) {
      const pollingRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLY_KEY },
      });

      const pollingData = await pollingRes.json();

      if (pollingData.status === "completed") {
        transcriptText = pollingData.text;
        completed = true;
      } else if (pollingData.status === "error") {
        return res.status(500).json({ error: pollingData.error });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    fs.unlinkSync(audioPath); 

    return res.json({ transcript: transcriptText });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Transcription failed", message: err.message });
  }
};

module.exports = { transcribeAudio };
