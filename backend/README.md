# 🧠 DocuQuiz AI Platform

A full-stack web application that allows students and educators to seamlessly generate AI-powered quizzes, track their study statistics, and manage their learning profiles.

## Members

# Project Manager: 
* Ethan Gabrielle E. Delos Santos
# Frontend Developer:
* Louie Jay A. Alconera
# Backend Developer:
* Anton Daryl A. Brua
# QA Analysts:
* Jann Florence G. Abad

## 🚀 Tech Stack

# Frontend:
* React
* Vite
* Tailwind CSS
* Lucide Icons

# Backend:
* Laravel (PHP)
* MySQL
* Google Gemini API

---

## 💻 Prerequisites

To run this project locally, you will need to have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [PHP](https://www.php.net/) (v8.1 or higher)
* [Composer](https://getcomposer.org/)
* A local database server like MySQL (via [XAMPP](https://www.apachefriends.org/), 

========================================================================================

## 🛠️ Local Installation & Setup

Follow these steps to get the development environment running on your machine.

### 1. Clone the Repository
Open your terminal and run to GitBash or Command Prompt:

git clone [https://github.com/Kei-CyBot/DocuQuiz.git](https://github.com/Kei-CyBot/DocuQuiz.git)
cd DocuQuiz

### 2. Backend Setup (Laravel)

cd backend

# Install PHP dependencies
composer install

# Copy the example environment file
cp .env.example .env

# Generate the application key
php artisan key:generate

========================================================================================

**Configure Environment Variables:**
Open the newly created `.env` file in the `backend` folder and update your database and API settings:

# 1. Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=docuquiz_db
DB_USERNAME=root
DB_PASSWORD=

# 2. Add your Google Gemini API Key
# You can get a free key here: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

# 3. Access the created .env file and paste this in
GEMINI_API_KEY=your_actual_api_key_here

========================================================================================

**Run Migrations & Start Server:**

# Create the database tables
php artisan migrate

# Start the Laravel development server
php artisan serve

### 3. Frontend Setup (React)

Open a **new terminal tab/window** and navigate to the frontend directory:

# From the root project folder, go to the frontend directory
cd frontend

# Install Node dependencies
npm install

========================================================================================

**Configure Frontend Environment:**
Create a `.env` file in the `frontend` folder and add the path to your local backend API:

VITE_API_BASE_URL=http://localhost:8000/api

**Start the React Server:**

# Start the Vite development server
npm run dev

========================================================================================

## 📖 Usage

Once both servers are running:
1. Open your browser and go to the frontend URL (usually `http://localhost:5173`).
2. Register a new user account.
3. Upload a document or enter text to start generating quizzes using your Gemini API key!
