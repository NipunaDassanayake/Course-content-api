# 🚀 LearnHub - AI-Powered Course Content Platform

**LearnHub** is an enterprise-grade, full-stack course management platform designed to streamline the sharing and consumption of educational materials. It combines robust cloud storage with **Generative AI** to provide instant summaries, key takeaways, and interactive chat capabilities for uploaded content.

---

## 🌐 Live Demo

- **Frontend (Vercel):** [https://course-frontend.vercel.app](https://course-frontend.vercel.app)
- **Backend API (AWS EC2):** `http://13.214.176.196:8080/api/content` *(Replace with your current EC2 IP if different)*

---

## ✨ Key Features

### 🧠 AI-Powered Learning
- **Smart Summaries:** Integrates **Google Gemini AI** to automatically generate concise summaries and key takeaways for PDF documents.
- **AI Chat:** Context-aware chat functionality allows users to ask questions directly related to specific course materials.

### 📂 Robust Content Management
- **Cloud Storage:** Stateless file management using **AWS S3**, supporting large files (up to 100MB).
- **Multi-Format Support:** Seamlessly handles PDFs, Videos (MP4), and Images (PNG/JPG).
- **External Resources:** Support for embedding YouTube videos and external resource links.

### 🔐 Security & Auth
- **Google OAuth2:** One-click secure login/signup via Google Identity Services.
- **JWT Authentication:** Stateless, secure session management with custom expiration settings.
- **Role-Based Access:** Foundation laid for Admin/User separation.

### 🤝 Social Engagement
- **Community Feed:** A real-time feed to discover materials uploaded by peers.
- **Interactive System:** Like, comment, and share functionality to foster collaboration.
- **Real-time Notifications:** Alerts for user interactions.

### 🎨 Modern UI/UX
- **Responsive Design:** Built with React + Vite + Tailwind CSS.
- **Dark Mode:** System-wide dark/light theme toggling with split-screen login visuals.
- **Instant Feedback:** Polished User Experience with React Hot Toast notifications.

---

## 🛠️ Tech Stack

### Backend (Microservices-Ready Architecture)
- **Framework:** Spring Boot 3 (Java 17)
- **Database:** MySQL 8 (Dockerized)
- **Caching:** Redis (Dockerized)
- **ORM:** Hibernate / Spring Data JPA
- **Security:** Spring Security 6, JWT, OAuth2
- **AI Integration:** Google Gemini API
- **Storage:** AWS SDK (S3)

### Frontend
- **Library:** React.js (Vite)
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **HTTP Client:** Axios
- **Proxy:** Vercel Rewrites (for CORS handling)

### DevOps
- **Containerization:** Docker (Multi-stage builds)
- **Deployment:** AWS EC2 (Backend), Vercel (Frontend)
- **CI/CD:** Docker Hub Registry

---

## 📂 Project Structure

```text
learnhub/
├── backend/
│   ├── src/main/java/com/silverline/task/coursecontent/
│   │   ├── config/             # App configs (S3, Security, Cors, Redis)
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
    └── vercel.json             # Proxy Configuration

```
⚙️ Environment Variables
Backend
The backend relies on environment variables for security. You must provide these when running locally or via Docker.

```
DB_URL="jdbc:mysql://localhost:3306/db_name"
DB_USERNAME="root"
DB_PASSWORD="your_password"
JWT_SECRET="your_256_bit_secret"
JWT_EXPIRATION=36000000
AWS_ACCESS_KEY="your_aws_access_key"
AWS_SECRET_KEY="your_aws_secret_key"
AWS_REGION="ap-southeast-1"
AWS_BUCKET_NAME="your_s3_bucket"
GEMINI_API_KEY="your_gemini_api_key"
GOOGLE_CLIENT_ID="your_google_client_id"

```


Frontend
Create a .env file in the frontend directory

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```
For Vercel Production: 
```
VITE_API_BASE_URL=/api
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


☁️ Deployment Architecture

```
This project is deployed using a hybrid cloud strategy:

Frontend: Hosted on Vercel for global edge delivery. It uses a vercel.json proxy to forward API requests to the backend securely.

Backend: Hosted on an AWS EC2 (Ubuntu) instance running Docker.

Database: MySQL 8 running as a separate Docker container on the same EC2 network (learnhub-net).
```

🔮 Future Roadmap
[ ] Admin Dashboard: Moderation tools for reported content.

[ ] Video Transcriptions: AI-generated subtitles for uploaded videos.

[ ] Quizzes: Auto-generate quizzes based on uploaded PDFs.

[ ] Payment Integration: Stripe integration for premium courses.

🤝 Contributing
Contributions are welcome! Please fork the repository and create a Pull Request.
