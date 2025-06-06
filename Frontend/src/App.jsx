import { useRef, useState } from "react";
import "./App.css";
import io from "socket.io-client";


// const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001");

export default function App() {
  const mediaRecorderRef = useRef(null);
 const socketRef = useRef(null);
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loadingUpload, setLoadingUpload] = useState(false);
  // const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const[recording , setRecording]= useState('false');
  const [transcript , setTranscript] =  useState('');
  const reset = () => {
    setTranscript("");
    setError("");
  };


  const startRecording = async () => {
    setTranscript("");
    setRecording(true);
    console.log("Recording started in language:", language);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    // Connect socket
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3001");
      socketRef.current.on("transcript-result", (data) => {
        setTranscript(data);
      });
    }

    mediaRecorder.ondataavailable = (event) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = btoa(
          new Uint8Array(reader.result).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        socketRef.current.emit("audio-stream", {
          audioChunk: base64,
          language,
        });
      };
      reader.readAsArrayBuffer(event.data);
    };

    mediaRecorder.start(1000);
    setRecording(true);
  };

  // Stop recording and tell backend to process audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (socketRef.current) {
      socketRef.current.emit("stop-audio-stream", { language });
    }
  };
  


  

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Choose a file first!");
    reset();
    setLoadingUpload(true);

    try {
      const fd = new FormData();
      fd.append("audio", file);
      fd.append("language_code", language);

      const res = await fetch("http://localhost:5000/transcribe", {
        method: "POST",
        body: fd,
      });

      if (!res.ok)
        throw new Error((await res.json()).details || res.statusText);

      const { transcript: t } = await res.json();
      setTranscript(t || "(No transcript returned)");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUpload(false);
    }
  };

  return (
    <div className="app-container">
    {/* Floating background shapes */}
    <div className="floating-shapes">
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>
    </div>

    <div className="main-content">
      {/* Header */}
      <header className="header">
        <div className="header-icon">🎙️</div>
        <h1 className="main-title">Audio Transcriber</h1>
        <p className="subtitle">
          Transform your audio files into text with AI-powered transcription
        </p>
      </header>

      {/* Main Card */}
      <div className="main-card">
        <form className="transcribe-form" onSubmit={handleUpload}>
          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">📁 Audio File</label>
            <div className="file-upload-container">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="file-input"
              />
              <div className={`file-upload-area ${file ? "has-file" : ""}`}>
                <div className="upload-icon">{file ? "✅" : "📁"}</div>
                <div className="upload-text">
                  {file ? (
                    <span className="file-name">{file.name}</span>
                  ) : (
                    "Drop your audio file here"
                  )}
                </div>
                <div className="upload-subtext">
                  {file ? "Click to change file" : "or click to browse"}
                </div>
              </div>
            </div>
          </div>

          {/* Language Input */}
          <div className="form-group">
            <label className="form-label">🌐 Language Code</label>
            {/* <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="en"
              className="text-input"
            /> */}
            <select className="text-input" onChange={(e) => setLanguage(e.target.value)}>
              <option value={language}>english</option>
              <option value={language}>hindi</option>
              <option value={language}>marathi</option>
            </select>
            <div className="input-hint">
              Examples: en (English), es (Spanish), fr (French), de (German)
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loadingUpload}
            className="submit-btn"
          >
            {loadingUpload ? (
              <>
                <div className="loading-spinner"></div>
                <span>Transcribing...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Transcribe Audio</span>
              </>
            )}
          </button>
        </form>

        {/* Recording Button */}
        <div className="recording-button-wrapper">
          <button
            type="button"
            className={`recording-button ${recording ? "recording" : ""}`}
            onClick={recording ? stopRecording : startRecording}
            title={recording ? "Stop Recording" : "Start Recording"}
          >
            🎙️
          </button>
          <div className="recording-label">
            {recording ? "Recording..." : "Start Recording"}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Transcript Section */}
      {transcript && (
        <div className="transcript-section">
          <h2 className="transcript-title">
            <span>📝</span>
            <span>Transcript</span>
          </h2>
          <div className="transcript-content">{transcript}</div>
        </div>
      )}
    </div>
  </div>

  );
}