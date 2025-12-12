# 🚀 LearnHub Content System

**LearnHub** is an enterprise-grade, full-stack course management platform designed to streamline the sharing and consumption of educational materials. It combines robust cloud storage with **Generative AI** to provide instant summaries, key takeaways, and interactive chat capabilities for uploaded content.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed)
![AWS](https://img.shields.io/badge/AWS-S3-232f3e)

---

## ✨ Key Features

### 🧠 AI-Powered Learning
* **Smart Summaries:** Integrates **Google Gemini AI 2.5** to automatically generate concise summaries and key takeaways for PDF documents.
* **AI Chat:** Context-aware chat functionality allows users to ask questions directly related to specific course materials.

### 📂 Robust Content Management
* **Cloud Storage:** Stateless file management using **AWS S3**, supporting large files (up to 100MB).
* **Multi-Format Support:** Seamlessly handles **PDFs, Videos (MP4), and Images (PNG/JPG)**.
* **External Resources:** Support for embedding YouTube videos and external resource links.

### 🔐 Security & Auth
* **Google OAuth2:** One-click secure login/signup via Google Identity Services.
* **JWT Authentication:** Stateless, secure session management with custom expiration settings.
* **Role-Based Access:** Foundation laid for Admin/User separation.

### 🤝 Social Engagement
* **Community Feed:** A real-time feed to discover materials uploaded by peers.
* **Interactive System:** Like, comment, and share functionality to foster collaboration.
* **Real-time Notifications:** Alerts for user interactions.

### 🎨 Modern UI/UX
* **Responsive Design:** Built with **React + Vite + Tailwind CSS**.
* **Dark Mode:** System-wide dark/light theme toggling.
* **Instant Feedback:** Polished User Experience with **React Hot Toast** notifications.

---

## 🛠️ Tech Stack

### **Backend (Microservices-Ready Architecture)**
* **Framework:** Spring Boot 3 (Java 17)
* **Database:** MySQL (Local) / PostgreSQL (Production/Render)
* **ORM:** Hibernate / Spring Data JPA
* **Security:** Spring Security 6, JWT, OAuth2
* **AI Integration:** Google Gemini API
* **Storage:** AWS SDK (S3)

### **Frontend**
* **Library:** React.js (Vite)
* **Styling:** Tailwind CSS
* **State Management:** React Query (TanStack Query)
* **HTTP Client:** Axios

### **DevOps**
* **Containerization:** Docker (Multi-stage builds)
* **Deployment:** Render (Backend), Vercel (Frontend)

---

## 📂 Project Structure

```text
learnhub/
├── backend/
│   ├── src/main/java/com/silverline/task/coursecontent/
│   │   ├── config/             # App configs (S3, Security, Cors)
│   │   ├── controller/         # REST API Endpoints
│   │   ├── model/              # JPA Entities (User, Content, Comment)
│   │   ├── repository/         # DB Access Layer
│   │   ├── security/           # JWT Filters & Auth Logic
│   │   ├── service/            # Business Logic (AI, S3, User Services)
│   │   └── CourseContentApplication.java
│   └── Dockerfile              # Backend Container Config
│
└── frontend/
    ├── src/
    │   ├── api/                # Axios API calls
    │   ├── components/         # Reusable UI (Modals, Headers, Upload)
    │   ├── pages/              # Views (Home, Dashboard, Login)
    │   └── App.jsx             # Routing & Providers
    └── tailwind.config.js


```
⚙️ Environment Variables
Backend
The backend relies on environment variables for security. You must provide these when running locally or via Docker.

```
Variable	            Description
DB_URL	              JDBC URL (e.g., jdbc:mysql://localhost:3306/db_name)
DB_USERNAME	          Database username
DB_PASSWORD	          Database password
JWT_SECRET	          256-bit encryption key for tokens
JWT_EXPIRATION	      Token lifetime in ms (e.g., 36000000)
AWS_ACCESS_KEY	      AWS IAM Access Key
AWS_SECRET_KEY	      AWS IAM Secret Key
AWS_REGION	          AWS Region (e.g., us-east-1)
AWS_BUCKET_NAME      	S3 Bucket Name
GEMINI_API_KEY	      Google AI Studio API Key
GOOGLE_CLIENT_ID    	Google Cloud OAuth Client ID

```


Frontend
Create a .env file in the frontend directory

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```


🚀 Getting Started
1. Clone the Repository

```
git clone [https://github.com/yourusername/learnhub.git](https://github.com/yourusername/learnhub.git)
cd learnhub
```

2. Run Backend (Docker Method - Recommended)
Navigate to the backend folder and build the image.
```
cd backend
docker build -t learnhub-backend .
```

Run the container (Replace placeholders with real keys):

```
docker run -p 8080:8080 \
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/your_db" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="password" \
  -e JWT_SECRET="your_secret" \
  -e AWS_ACCESS_KEY="your_key" \
  -e AWS_SECRET_KEY="your_secret" \
  -e AWS_REGION="us-east-1" \
  -e AWS_BUCKET_NAME="your_bucket" \
  -e GEMINI_API_KEY="your_ai_key" \
  -e GOOGLE_CLIENT_ID="your_google_id" \
  learnhub-backend
```

3. Run Frontend
Navigate to the frontend folder.

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

🔮 Future Roadmap
[ ] Admin Dashboard: Moderation tools for reported content.

[ ] Video Transcriptions: AI-generated subtitles for uploaded videos.

[ ] Quizzes: Auto-generate quizzes based on uploaded PDFs.

🤝 Contributing
Contributions are welcome! Please fork the repository and create a Pull Request.
