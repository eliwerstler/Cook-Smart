# Cook Smart - Intelligent Pantry & Recipe Management

Cook Smart is a full-stack web application that helps users manage their pantry inventory and discover recipes based on available ingredients. The app features an intelligent recommendation system that suggests recipes based on what you have in your pantry.

## Features

### Pantry Management
- **Inventory Tracking**: Add, edit, and delete pantry items with detailed information
- **Categorization**: Organize items by categories (Fruits, Vegetables, Meat, Dairy, etc.)
- **Expiration Tracking**: Monitor expiration dates and get alerts for items expiring soon
- **Quantity Management**: Track quantities and units for each ingredient
- **Search & Filter**: Find items quickly with search and category filters

### Recipe Database
- **Comprehensive Collection**: Large database of recipes with detailed ingredients
- **Recipe Details**: Complete instructions, prep/cook times, difficulty levels, and ratings
- **Smart Search**: Search recipes by title, description, tags, or difficulty
- **Recipe Rating**: Rate and review your favorite recipes

### Intelligent Recommendations
- **Smart Matching**: Algorithm matches recipes based on available pantry ingredients
- **Flexible Matching**: Choose between strict or flexible ingredient matching modes
- **Match Scoring**: See how well each recipe matches your pantry (percentage and score)
- **Missing Ingredients**: View what ingredients you need to buy for each recipe
- **Alternative Recipes**: Discover similar recipes when you're missing key ingredients

### Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Clean Interface**: Modern, intuitive design with Tailwind CSS
- **Real-time Updates**: Instant feedback and smooth interactions
- **Dashboard**: Overview of pantry stats, expiring items, and top recommendations

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **RESTful API** architecture
- **Security middleware** (Helmet, CORS, Rate limiting)

### Development Tools
- **Concurrently** for running frontend and backend simultaneously
- **Nodemon** for backend development
- **TypeScript** for type safety

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cook-Smart
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

### Manual Setup (Alternative)

If you prefer to set up each part separately:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Start backend server**
   ```bash
   cd server
   npm run dev
   ```

5. **Start frontend server** (in a new terminal)
   ```bash
   cd client
   npm start
   ```

## Usage

### Adding Items to Pantry
1. Navigate to the **Pantry** section
2. Click **"Add Item"** button
3. Fill in the item details:
   - Name (required)
   - Category (required)
   - Quantity and unit
   - Purchase date
   - Expiration date
   - Notes (optional)

### Getting Recipe Recommendations
1. Go to the **Recommendations** section
2. The app automatically analyzes your pantry
3. Browse recommended recipes sorted by match percentage
4. Toggle between strict and flexible matching modes
5. Click on any recipe to view detailed instructions

### Managing Recipes
1. Visit the **Recipes** section to browse all available recipes
2. Use search and filters to find specific recipes
3. Click on any recipe to view full details
4. Rate recipes to improve recommendations

## API Endpoints

### Pantry Management
- `GET /api/pantry/items` - Get all pantry items
- `POST /api/pantry/items` - Add new pantry item
- `PUT /api/pantry/items/:id` - Update pantry item
- `DELETE /api/pantry/items/:id` - Delete pantry item
- `GET /api/pantry/categories` - Get all categories
- `GET /api/pantry/stats` - Get pantry statistics

### Recipe Management
- `GET /api/recipes` - Get all recipes (with search/filter support)
- `GET /api/recipes/:id` - Get specific recipe details
- `POST /api/recipes` - Add new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/rate` - Rate a recipe

### Recommendations
- `GET /api/recommendations/recipes` - Get recipe recommendations
- `GET /api/recommendations/suggestions/:recipeId` - Get missing ingredients for a recipe
- `GET /api/recommendations/alternatives/:recipeId` - Get alternative recipes

## Database Schema

### Tables
- **pantry_items**: Stores pantry inventory data
- **categories**: Pantry item categories with colors
- **recipes**: Recipe information (title, instructions, etc.)
- **recipe_ingredients**: Ingredients for each recipe
- **user_preferences**: User dietary preferences (for future features)

## Configuration

### Environment Variables
Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
DATABASE_PATH=./database/cooksmart.db
```

### Client Configuration
The frontend automatically connects to `http://localhost:5000` for development. For production, set the `REACT_APP_API_URL` environment variable.

## Development

### Project Structure
```
Cook-Smart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── ...
├── server/                 # Node.js backend
│   ├── routes/            # API route handlers
│   ├── database/          # Database initialization
│   └── ...
├── package.json           # Root package.json
└── README.md
```

### Adding New Features

1. **New API Endpoints**: Add routes in `server/routes/`
2. **New Components**: Create React components in `client/src/components/`
3. **Database Changes**: Update schema in `server/database/init.js`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Recipe sharing and social features
- [ ] Shopping list generation
- [ ] Meal planning and scheduling
- [ ] Nutrition information integration
- [ ] Barcode scanning for easy item addition
- [ ] Mobile app (React Native)
- [ ] Recipe import from popular cooking websites
- [ ] Dietary restriction filtering
- [ ] Grocery store price tracking

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Cooking with Cook Smart!**
