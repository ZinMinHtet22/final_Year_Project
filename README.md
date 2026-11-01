# Vellum — Smart Recipe & AI Culinary Assistant

> Full kitchen-management platform with ChefBot AI assistant (Google Gemini API), smart pantry, meal planning, multi-currency budgets, and analytics. Bachelor's capstone project.


---

## 📸 Screenshot


> Replace `screenshot.png` with an actual screenshot of your app running locally or on the live demo.

---

## 🚀 Features

- 🤖 **ChefBot AI Assistant** — conversational cooking help powered by Google Gemini API
- 🥗 **Smart Pantry** — track ingredients and get recipe suggestions
- 📅 **Meal Planning** — plan weekly menus with nutritional info
- 💰 **Multi-Currency Budgets** — manage food expenses across currencies
- 📊 **Analytics** — visualize spending and nutrition trends
- 🔐 **Sanctum Token Auth** — secure authentication with API tokens
- 👥 **Role-Based Admin Moderation** — admin and user role management
- ⚡ **React + Vite Frontend** — fast, modern UI
- 🐘 **Laravel 11 REST API** — robust backend with MySQL

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | Laravel 11 (PHP) |
| Database | MySQL |
| AI | Google Gemini || Authentication | Laravel Sanctum |
| Styling | Tailwind CSS |
| State Management | React Context / Hooks |

---

## 📦 Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- MySQL 8.0+

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/ZinMinHtet22/final_Year_Project.git
cd final_Year_Project/Backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env
# DB_DATABASE=vellum
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# (Optional) Seed database
php artisan db:seed

# Start Laravel development server
php artisan serve
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../Frontend

# Install dependencies
npm install
# or: pnpm install

# Start development server
npm run dev
# or: pnpm dev

# Build for production
npm run build
```

---

## 🌐 Live Demo

🔗 [https://vellum-frontend-three.vercel.app](https://vellum-frontend-three.vercel.app)

---

## 🔐 Environment Variables

Create a `.env` file in `Backend/` based on `.env.example`. Key variables:

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Laravel application key (auto-generated) |
| `DB_DATABASE` | MySQL database name |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `GEMINI_API_KEY` | Google Gemini API key for ChefBot |

> ⚠️ Never commit your actual `.env` file. It is gitignored.

---

## 📁 Project Structure

```
final_Year_Project/
├── Backend/
│   ├── app/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   ├── .env.example
│   ├── composer.json
│   └── artisan
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── README.md
└── LICENSE
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Jeffery Zin Min Htet**  
Full-Stack Developer | IT Engineer | Content Developer  
Yangon, Myanmar  
- GitHub: [@ZinMinHtet22](https://github.com/ZinMinHtet22)
- LinkedIn: [zin-min-htet-a167b42b5](https://linkedin.com/in/zin-min-htet-a167b42b5)
- Email: jefferyyas8@gmail.com

---

> ⭐ Star this repo if you find it useful!