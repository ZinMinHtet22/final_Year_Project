# Vellum - Smart Recipe, Kitchen Management, and AI Culinary Assistant

Vellum is a modern, comprehensive web application designed to simplify kitchen management, recipe discovery, meal planning, and shopping. Powered by a React frontend and a Laravel backend, Vellum integrates an AI Culinary Assistant (ChefBot) powered by the Google Gemini API, a Smart Pantry, shopping list budget planners, and detailed usage analytics.

---

## 🚀 Features

### 1. 🍳 Recipe Discovery & Community
- Browse, search, and filter a vast collection of recipes.
- Filter by categories, dietary tags (Vegan, Gluten-Free, Keto, etc.), and difficulty levels.
- Submit custom recipes to the community (requires admin approval before publishing).
- Write and view user reviews and ratings.
- Save favorite recipes to a personalized favorites list.

### 2. 🤖 AI ChefBot (Culinary Assistant)
- Integrated AI widget powered by the **Google Gemini API**.
- Ask for recipe recommendations based on ingredients you have, cooking tips, or step-by-step guidance.
- Access the ChefBot page for continuous cooking chat assistance.

### 3. 🍱 Smart Pantry
- Keep track of the ingredients you currently have in stock.
- Add and remove ingredients with ease.
- Get suggestions for recipes you can cook right now with your pantry stock.

### 4. 🛒 Shopping List & Budget Planner
- Add ingredients directly from recipes to your shopping list.
- Check off items as you shop.
- Estimate costs and manage budgets.
- Support for **multi-currency conversion** with automatic exchange rate calculations.

### 5. 📊 Analytics Engine
- Keep track of cooked recipes over time.
- View stats and charts on your eating habits, recipe diversity, and cost savings.

### 6. 🛡️ Admin Command Center
- **User Management**: Modify user roles (toggle Admin privileges) and delete accounts.
- **Recipe Moderation**: Review, edit, approve, or reject pending community recipe submissions.
- **Ingredient & Currency Database**: CRUD operations for available ingredients and exchange rates.
- **Feedback Portal**: Review user feedback and suggestions.
- **System Controls**: View live server performance stats and toggle maintenance mode.

---

## 🛠️ Technology Stack

- **Frontend**: React (v19), Vite, Tailwind CSS (v4), Axios, Chart.js, Lucide Icons, React Router (v7)
- **Backend**: PHP (v8.x), Laravel (v11), Laravel Sanctum (Token Auth)
- **Database**: MySQL
- **AI Integration**: Google Gemini API

---

## 📁 Directory Structure

```
Final Year Project/
├── Backend/          # Laravel REST API project
└── Frontend/         # React + Vite application
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **PHP** (v8.2 or higher)
- **Composer**
- **Node.js** (v18 or higher) & **npm**
- **MySQL**

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Configure your Environment:
   Copy `.env.example` to `.env` and configure your database settings and Gemini API key:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=laravel
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password

   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Generate Application Key:
   ```bash
   php artisan key:generate
   ```

5. Run Migrations & Seeders:
   ```bash
   php artisan migrate --seed
   ```

6. Start the Laravel Dev Server:
   ```bash
   php artisan serve
   ```
   The backend will be running at `http://127.0.0.1:8000`.

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the frontend root and set the Google Client ID if using Google Authentication:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
   *Note: The frontend connects to the backend at `http://127.0.0.1:8000/api` by default (defined in `src/api/client.js`).*

4. Start the Vite Dev Server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173`.

---

## 🧪 Running Tests

To run the backend test suite:
```bash
cd Backend
php artisan test
```

---

## 📄 License
Vellum is open-sourced software.
