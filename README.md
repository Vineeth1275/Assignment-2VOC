# AnimeTracker - Comprehensive Anime & TV Series Tracker

A modern, full-stack web application for tracking anime and TV series with community features, built with React, Node.js, and MongoDB.

## 🌟 Features

### Core Functionality
- **Smart Watchlist Management**: Organize anime with categories (Watching, Completed, On Hold, Dropped, Plan to Watch)
- **Progress Tracking**: Track episodes watched, rate shows, and maintain detailed viewing statistics
- **Search & Discovery**: Powered by Jikan API (MyAnimeList) for comprehensive anime database
- **Dark/Light Mode**: Customizable themes for comfortable viewing

### Community Features
- **Custom Clubs**: Create or join clubs to discuss favorite anime with like-minded fans
- **Discussion Boards**: Engage in real-time discussions with spoiler protection
- **User Reviews & Ratings**: Write detailed reviews with aspect-based ratings
- **Polls & Voting**: Community polls for episodes, characters, and storylines

### Advanced Features
- **Episode Reminders**: Never miss new episodes with customizable notifications
- **Streaming Integration**: Direct links to legal streaming platforms
- **Analytics Dashboard**: Detailed insights into viewing patterns and statistics
- **Watchlist Sharing**: Share lists with friends and community members
- **Tags & Filters**: Advanced filtering by genre, year, studio, rating, and more

### Admin Features
- **Admin Control Panel**: Comprehensive moderation tools
- **User Management**: Manage users, roles, and permissions
- **Content Moderation**: Review flagged content and maintain community standards

## 🚀 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Styled Components** for styling
- **React Router** for navigation
- **TanStack Query** for state management
- **React Hook Form** for form handling
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Bcrypt** for password hashing
- **Express Validator** for input validation

### External APIs
- **Jikan API** (MyAnimeList) for anime data
- **Email Service** for notifications

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/anime-tracker.git
cd anime-tracker
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install --legacy-peer-deps
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/anime_tracker

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_URL=http://localhost:3000

# External APIs
JIKAN_API_URL=https://api.jikan.moe/v4
MAL_CLIENT_ID=your_mal_client_id_here

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only
npm run client
```

### 6. Access the Application
- **Landing Page**: http://localhost:3000
- **Main App**: http://localhost:3000 (after registration/login)
- **API**: http://localhost:5000/api

## 🎯 Usage

### Getting Started
1. Visit the landing page at `http://localhost:3000`
2. Click "Get Started" to register a new account
3. Complete the registration form
4. Login and start tracking your anime!

### Key Features Usage

#### Watchlist Management
- Search for anime using the search bar
- Click on an anime to view details
- Add to watchlist with status (Watching, Completed, etc.)
- Update progress and ratings
- Use filters to organize your list

#### Community Features
- Navigate to "Clubs" to browse available communities
- Join existing clubs or create your own
- Participate in discussions with spoiler protection
- Write reviews for anime you've watched

#### Admin Features (Admin accounts only)
- Access admin panel via user menu
- Manage users, clubs, and content
- Review moderation reports
- View system statistics

## 🏗️ Project Structure

```
anime-tracker/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── common/     # Common UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── anime/      # Anime-related components
│   │   │   ├── watchlist/  # Watchlist components
│   │   │   ├── clubs/      # Club components
│   │   │   ├── reviews/    # Review components
│   │   │   └── admin/      # Admin components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── styles/         # Styled components themes
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── assets/                 # Static assets
├── .env                    # Environment variables
├── package.json            # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Anime
- `GET /api/anime/search` - Search anime
- `GET /api/anime/:id` - Get anime details
- `GET /api/anime/top/anime` - Get top anime
- `GET /api/anime/seasons/:year/:season` - Get seasonal anime

### User/Watchlist
- `GET /api/users/watchlist` - Get user's watchlist
- `POST /api/users/watchlist` - Add anime to watchlist
- `PUT /api/users/watchlist/:animeId` - Update watchlist item
- `DELETE /api/users/watchlist/:animeId` - Remove from watchlist

### Clubs
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Create new club
- `GET /api/clubs/:id` - Get club details
- `POST /api/clubs/:id/join` - Join club

### Reviews
- `GET /api/reviews` - Get reviews for anime
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/clubs` - Manage clubs
- `GET /api/admin/reviews` - Manage reviews

## 🎨 Design System

The application uses a comprehensive design system with:
- **Colors**: Primary gradient (#667eea to #764ba2), semantic colors
- **Typography**: Inter font family with responsive sizing
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable styled components
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG compliant with focus management

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production
Update `.env` with production values:
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure proper CORS origins
- Set up email service credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Jikan API](https://jikan.moe/) for providing anime data
- [MyAnimeList](https://myanimelist.net/) for the comprehensive anime database
- React and Node.js communities for excellent documentation
- All contributors and users of the application

## 📞 Support

For support, email support@animetracker.com or join our Discord community.

## 🔄 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced recommendation engine
- [ ] Social features (friends, activity feed)
- [ ] Import/export from other platforms
- [ ] Offline support
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Voice search
- [ ] AR features for merchandise

---

Built with ❤️ for the anime community