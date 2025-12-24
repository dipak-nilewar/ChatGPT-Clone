 # ChatGPT Clone (React Native)

## App Overview

This is a **ChatGPT-like mobile application** developed using **React Native CLI** and the **Groq LLM API**.
The application delivers a conversational AI experience similar to ChatGPT with a clean, modern, and user-friendly UI.

The app supports real-time AI chat, voice input, attachments, theme switching, and AI model selection.
This project was developed as part of a **React Native Developer Assignment**.

---

## Key Features

* AI-powered chat using **Groq LLM API**
* Light Mode & Dark Mode support
* Voice Input (Speech-to-Text)
* AI Model Switching (LLaMA / Mixtral)
* Image, Camera & File Attachments
* Clear Chat History
* ChatGPT-style UI & UX
* Android Release APK support

---

## Technology Stack

* **React Native CLI**
* **JavaScript (ES6+)**
* **Groq API (LLM)**
* **React Native Vector Icons**
* **React Native Voice**
* **Async Storage**
* **Android (APK Build)**

---

## Project Setup Instructions

### 1️. Clone the Repository

```bash
git clone https://github.com/dipak-nilewar/ChatGPTClone.git
```

### 2️. Navigate to Project Directory

```bash
cd ChatGPTClone
```

### 3️. Install Dependencies

```bash
npm install
```

### 4️. Run the Application (Android)

```bash
npx react-native run-android
```

---

##  Environment Configuration

Create a `.env` file in the root directory and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

>  **Important:**
>
> * Do NOT commit the `.env` file
> * `.env` must be added to `.gitignore`

--

##  Prerequisites

* React Native CLI environment setup
* Android Studio with Emulator or Physical Device
* Java Development Kit (JDK)

---

##  Project Structure 

```
 ChatGPTClone/
│
├── android/
├── src/
│ ├── screens/
      ChatScreen.js.js

│ ├── components/ 
      ChatBUbbl.js
      Loader.js

│ ├── services/
      groqApi.js

│ └── theme/
│     colors.js
│
├── App.js

├── .env

├── package.json

└── README.md


```

## Login Credentials / Access

The app is **open access**, no login is required to use the application.

---

##  Future Enhancements

* Chat History Sync
* iOS Support
* Streaming Responses

---

##  Author

**Dipak Nilewar**
GitHub: [https://github.com/dipak-nilewar](https://github.com/dipak-nilewar)


