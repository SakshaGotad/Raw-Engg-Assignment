const {OpenAI} = require('openai');
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const transcribeAudio = async(filepath , language)=>{
    try {
        const transcript = await openai.audio.transcriptions.create({
                  file: fs.createReadStream(filepath),
                  model: "whisper-1",
                  language,
                  response_format: "text",})

                  return response.text ?? "";
    } catch (error) {
        console.error(error);
    }

}

module.exports= 
    transcribeAudio
