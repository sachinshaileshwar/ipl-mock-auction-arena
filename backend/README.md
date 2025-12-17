# IPL Auction Backend

Node.js Express backend for the IPL Auction System with Supabase authentication.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (JWT)
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js      # Supabase client configuration
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication & authorization
│   │   └── error.middleware.js   # Global error handler
│   ├── routes/
│   │   ├── auth.routes.js   # Authentication endpoints
│   │   ├── team.routes.js   # Team management endpoints
│   │   ├── player.routes.js # Player management endpoints
│   │   └── auction.routes.js # Live auction endpoints
│   └── server.js            # Express app entry point
├── .env.example             # Environment variables template
├── package.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://pioxqpbaklcluqvgoxpg.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
```

### 3. Run the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/signup` | User registration | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/create-team-user` | Create team user (admin) | Yes (Admin) |

### Teams

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/teams` | Get all teams | No |
| GET | `/api/teams/:id` | Get team with players | No |
| POST | `/api/teams` | Create team | Yes (Admin) |
| PUT | `/api/teams/:id` | Update team | Yes (Admin) |
| DELETE | `/api/teams/:id` | Delete team | Yes (Admin) |
| GET | `/api/teams/:id/players` | Get team's players | No |
| POST | `/api/teams/:id/retain` | Retain player | Yes (Admin) |

### Players

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/players` | Get all players (with filters) | No |
| GET | `/api/players/available` | Get available players by set | No |
| GET | `/api/players/:id` | Get single player | No |
| POST | `/api/players` | Create player | Yes (Admin) |
| POST | `/api/players/bulk` | Bulk import players | Yes (Admin) |
| PUT | `/api/players/:id` | Update player | Yes (Admin) |
| DELETE | `/api/players/:id` | Delete player | Yes (Admin) |
| DELETE | `/api/players` | Delete all players | Yes (Admin) |

### Auction

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auction/current` | Get current live auction | No |
| GET | `/api/auction/history` | Get auction history | No |
| GET | `/api/auction/recently-sold` | Get recently sold players | No |
| POST | `/api/auction/start` | Start auction for player | Yes (Admin) |
| POST | `/api/auction/bid` | Place a bid | Yes (Admin) |
| POST | `/api/auction/update-bid` | Update bid amount | Yes (Admin) |
| POST | `/api/auction/sell` | Mark player as sold | Yes (Admin) |
| POST | `/api/auction/unsold` | Mark player as unsold | Yes (Admin) |
| POST | `/api/auction/reset` | Reset entire auction | Yes (Admin) |

## Authentication Flow

1. **Login**: User sends username/password to `/api/auth/login`
2. **Token**: Server returns JWT access token and session
3. **Authenticated Requests**: Include `Authorization: Bearer <token>` header
4. **Role Check**: Admin endpoints verify user role from `profiles` table

## Example Requests

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Get Teams
```bash
curl http://localhost:3001/api/teams
```

### Create Player (Admin)
```bash
curl -X POST http://localhost:3001/api/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Virat Kohli",
    "category": "batsman",
    "base_price": 2.0,
    "country": "India"
  }'
```

### Start Auction (Admin)
```bash
curl -X POST http://localhost:3001/api/auction/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"player_id": "player-uuid-here"}'
```

## Security Features

- **Helmet**: Sets security HTTP headers
- **CORS**: Configured for frontend origins
- **JWT Validation**: All protected routes verify Supabase JWT
- **Role-Based Access**: Admin-only endpoints check user role
- **Input Validation**: Request body validation with express-validator
- **Error Handling**: Centralized error handling middleware

## Database Schema

The backend uses existing Supabase tables:
- `profiles` - User profiles with roles
- `teams` - Team information
- `players` - Player data with stats
- `team_players` - Team-player assignments
- `auction_rounds` - Live auction tracking

## License

MIT
