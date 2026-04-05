
# 🧠 AI Quiz Platform

A full-stack web application that allows students and educators to seamlessly generate AI-powered quizzes, track their study statistics, and manage their learning profiles.

## 🚀 Tech Stack

**Frontend:**
* React
* Vite (or Create React App)
* Tailwind CSS
* Lucide Icons

**Backend:**
* Laravel (PHP)
* MySQL
* RESTful API

---

## 💻 Prerequisites

To run this project locally, you will need to have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [PHP](https://www.php.net/) (v8.1 or higher)
* [Composer](https://getcomposer.org/)
* A local database server like MySQL (via [XAMPP](https://www.apachefriends.org/), [DBngin](https://dbngin.com/), or similar)

---

## 🛠️ Local Installation & Setup

Follow these steps to get the development environment running on your machine.

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME

====================== Backend Setup (Laravel) ======================

cd backend

# Install PHP dependencies
composer install

# Copy the example environment file
cp .env.example .env

# Generate the application key
php artisan key:generate

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=quiz_db
DB_USERNAME=root
DB_PASSWORD=

# Create the database tables
php artisan migrate

# Start the Laravel development server
php artisan serve

====================== Frontend Setup (React) ======================

# From the root project folder, go to the frontend directory
cd frontend

# Install Node dependencies
npm install

====================== Environment Variables ======================
Create a .env file in the frontend folder and add the path to your local backend API:

VITE_API_URL=http://localhost:8000/api

(Note: If using Create React App instead of Vite, use REACT_APP_API_URL=http://localhost:8000/api)

# Start the React development server
npm run dev

📖 Usage
Once both servers are running:
- Open your browser and go to the frontend URL (e.g., http://localhost:5173).
- Register a new user account.
- Start generating quizzes, updating your profile, and tracking your stats!
  