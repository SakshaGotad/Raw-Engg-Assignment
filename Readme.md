### Multilingual Transcription App..

This project provides a **full-stack real-time transcription system** powered by AssemblyAI, using:
- **Node.js (Express)** for backend API
- **WebSocket proxy** for real-time microphone streaming
- **Frontend with React**
- **Electron.js** for native desktop support
- **WhisperAI** for real time transcription

## setup instructions
#### Backend setup 
1. Navigate to the Backend folder:
 ```bash
   cd Backend
 ```  
2. Install dependencies
 ```bash
    npm install
```
3.Start the backend server with live-reload:
```bash
   nodemon server.js
 ```  
### frontend setup
1. Navigate to the Frontend Folder:
```bash
   cd Frontend
```   
2.Install frontend and Electron dependencies:
```npm install
```
3.Open two terminals or split your terminal:

Terminal 1: Start React frontend development server
 ```bash
    npm run dev
``` 
Terminal 2: Start Electron app
 ```bash
    npm run dev:electron
 ```   

