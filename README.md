# 🚀 LearnHub - AI-Powered Course Content Platform

**LearnHub** is an enterprise-grade, full-stack course management platform designed to streamline the sharing and consumption of educational materials. It combines robust cloud storage with **Generative AI** to provide instant summaries, key takeaways, and interactive chat capabilities for uploaded content.

---

## 🌐 Live Demo

- **Frontend (Vercel):** [https://course-frontend.vercel.app](https://course-fronend.vercel.app)
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
# Database
DB_URL="jdbc:mysql://mysql-container:3306/course_content_db1?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC"
DB_USERNAME="root"
DB_PASSWORD="your_password"

# Redis Cache
CACHE_TYPE="redis"
REDIS_HOST="redis-container"
REDIS_PORT="6379"

# Security
JWT_SECRET="your_256_bit_secret_key"
JWT_EXPIRATION=36000000

# AWS S3
AWS_ACCESS_KEY="your_aws_access_key"
AWS_SECRET_KEY="your_aws_secret_key"
AWS_REGION="ap-southeast-1"
AWS_BUCKET_NAME="your_s3_bucket"

# Third-Party APIs
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
We use a Docker Network to connect Spring Boot, MySQL, and Redis.

Step A: Create Network & Infrastructure
```
docker network create learnhub-net

# Start MySQL
docker run -d --name mysql-container --network learnhub-net \
  -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=course_content_db1 mysql:8.0

# Start Redis
docker run -d --name redis-container --network learnhub-net redis:alpine
```

Step B: Build & Run Backend

```
cd backend
docker build -t learnhub-backend .

# Run the app container
docker run -d -p 8080:8080 --name backend-app --network learnhub-net \
  -e DB_URL="jdbc:mysql://mysql-container:3306/course_content_db1?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="your_password" \
  -e CACHE_TYPE="redis" \
  -e REDIS_HOST="redis-container" \
  -e REDIS_PORT="6379" \
  -e JWT_SECRET="your_jwt_secret" \
  -e AWS_ACCESS_KEY="your_aws_key" \
  -e AWS_SECRET_KEY="your_aws_secret" \
  -e AWS_BUCKET_NAME="your_bucket_name" \
  -e GEMINI_API_KEY="your_gemini_key" \
  -e GOOGLE_CLIENT_ID="your_google_client_id" \
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

Data Layer: * MySQL 8 (Containerized) for persistent data.

Redis (Containerized) for high-performance caching.

AWS S3 for object storage.

All backend components communicate via a private Docker bridge network (learnhub-net).
```

🔮 Future Roadmap
[ ] Admin Dashboard: Moderation tools for reported content.

[ ] Video Transcriptions: AI-generated subtitles for uploaded videos.

[ ] Quizzes: Auto-generate quizzes based on uploaded PDFs.

[ ] Payment Integration: Stripe integration for premium courses.

🤝 Contributing
Contributions are welcome! Please fork the repository and create a Pull Request.

<img width="1907" height="1066" alt="image" src="https://github.com/user-attachments/assets/15e5c480-58b2-4dec-bf03-ff27909bcf1e" />
<img width="1917" height="1071" alt="image" src="https://github.com/user-attachments/assets/320984c7-ed1f-49c2-a831-adf57a8d9c5d" />
<img width="1897" height="1079" alt="image" src="https://github.com/user-attachments/assets/b67ce48c-de38-4679-b87b-b224b72badd5" />
<img width="1889" height="1071" alt="image" src="https://github.com/user-attachments/assets/4f39fe02-e734-4366-9308-7416ccad111a" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/773294a4-77d5-4c34-a2f2-b2c9f468167a" />
<img width="1910" height="1077" alt="image" src="https://github.com/user-attachments/assets/016a4431-a16b-4c7b-9e22-5d1ec1dfcd9b" />
<img width="1893" height="1066" alt="image" src="https://github.com/user-attachments/assets/eb2ba31b-beed-46fb-b07e-13ec62bc956b" />
<img width="1919" height="1003" alt="image" src="https://github.com/user-attachments/assets/4836fd3b-66d6-4b6e-b5ac-8614a5e55636" />
<img width="1908" height="1075" alt="image" src="https://github.com/user-attachments/assets/c063b359-ba4a-4780-b6c2-073a70b8014b" />

