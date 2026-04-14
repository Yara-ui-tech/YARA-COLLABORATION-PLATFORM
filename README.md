<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# YARIA - Youth Academy for Robotics & Industrial Automation

A comprehensive collaboration platform for African youth innovators, featuring mentorship, project showcase, real-time collaboration, and educational resources.

## 🚀 Features

### Core Features

- **Real-time Collaboration** - Live video sessions, instant messaging, and real-time updates
- **Mentorship Hub** - Connect innovators with experienced mentors
- **Project Showcase** - Display and track project progress with visual timelines
- **Idea Board** - Share and discuss innovative concepts
- **Resource Library** - Access study materials, tutorials, and tools
- **Event Management** - Competitions, workshops, and community events
- **Feedback System** - Community-driven improvement platform

### Technical Features

- **Tech-focused UI** - Modern design with tech color schemes and animations
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Real-time Updates** - WebSocket-powered live features
- **File Upload** - Secure file storage and management
- **Email Notifications** - Automated welcome emails and notifications
- **Payment Integration** - PayPal-powered subscription system
- **Admin Dashboard** - Comprehensive user and content management

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

### Backend

- **Node.js + Express** - RESTful API server
- **Socket.io** - Real-time communication
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Resend** - Email service integration
- **PayPal** - Payment processing
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### External Services

- **Daily.co** - Video conferencing
- **Google Gemini AI** - AI-powered features
- **Supabase Storage** - File storage

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account and project
- **Resend** account for emails
- **PayPal** developer account
- **Daily.co** account for video calls

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd yaria-collaboration-platform
npm install
```

### 2. Environment Setup

Copy the environment template and configure:

```bash
cp .env.local .env.local.example  # For reference
```

Edit `.env.local` with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# External Services
VITE_GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=your_resend_api_key_here
VITE_DAILY_DOMAIN=your_daily_domain

# Payment
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

### 3. Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and API keys

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and run the contents of `database-schema.sql`
   - This creates all tables, policies, and functions

3. **Configure Authentication**
   - In Supabase Dashboard → Authentication → Settings
   - Configure OAuth providers (Google, etc.)
   - Set up email templates

4. **Storage Setup**
   - Create a bucket named `uploads`
   - Set it to public
   - Configure CORS for your domain

### 4. External Services Setup

#### Resend (Email)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Verify your domain for sending emails

#### Daily.co (Video)

1. Sign up at [daily.co](https://daily.co)
2. Create a domain/room
3. Get your domain name for the `VITE_DAILY_DOMAIN` variable

#### PayPal (Payments)

1. Sign up for PayPal Developer account
2. Create a REST API app
3. Get client ID and secret

### 5. Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### 6. Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
yaria-collaboration-platform/
├── public/                 # Static assets
│   └── assets/            # Images, icons, etc.
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── Layout.tsx         # Main app layout
│   │   ├── PlaceholderImage.tsx # Tech-themed placeholders
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   └── Loading.tsx         # Loading states
│   ├── pages/             # Route components
│   │   ├── Home.tsx           # Dashboard
│   │   ├── Auth.tsx           # Login/signup
│   │   ├── Ideas.tsx          # Idea board
│   │   ├── Projects.tsx       # Project showcase
│   │   ├── Mentorship.tsx     # Mentor hub
│   │   ├── Events.tsx         # Events & competitions
│   │   └── Admin.tsx          # Admin dashboard
│   ├── lib/               # Utilities
│   │   ├── supabase.ts        # Supabase client
│   │   ├── apiClient.ts       # Backend API client
│   │   ├── imageGenerator.ts  # SVG generators
│   │   └── techColors.ts      # Color system
│   ├── constants/         # App constants
│   │   └── assets.ts          # Asset URLs
│   └── index.css         # Global styles
├── server.ts              # Express backend server
├── database-schema.sql    # Database setup
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔧 API Endpoints

### Ideas

- `GET /api/ideas` - Get ideas with pagination
- `POST /api/ideas` - Create new idea
- `DELETE /api/ideas/:id` - Delete idea

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Mentorship

- `GET /api/mentors` - Get all mentors
- `POST /api/mentorship-requests` - Create request
- `PUT /api/mentorship-requests/:id` - Update request

### Live Sessions

- `POST /api/live-sessions` - Create session
- `GET /api/live-sessions` - Get sessions
- `PUT /api/live-sessions/:id/approve` - Approve session

### File Upload

- `POST /api/upload` - Upload file to Supabase storage

### Feedback

- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback

### Analytics

- `GET /api/analytics/stats` - Get platform statistics

## 🎨 Design System

### Colors

- **Primary**: Indigo (#4f46e5)
- **Secondary**: Purple (#8b5cf6)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

### Animations

- **Framer Motion** for smooth transitions
- **Tech-themed** shimmer effects
- **Floating** elements
- **Slide-up** animations
- **Glow pulses** for interactive elements

### Components

- **PlaceholderImage** - Tech-themed SVG generators
- **Loading** - Animated loading states
- **ErrorBoundary** - Graceful error handling
- **CountdownTimer** - Animated countdowns

## 🔐 Security Features

- **Row Level Security** (RLS) on all database tables
- **Rate Limiting** on API endpoints
- **Helmet** security headers
- **CORS** configuration
- **Input validation** and sanitization
- **Secure file upload** with type checking

## 📊 Database Schema

The application uses 12 main tables:

- `profiles` - User profiles and roles
- `ideas` - Innovation ideas
- `projects` - Project showcases
- `mentorship_requests` - Mentor-student connections
- `live_sessions` - Video conferencing sessions
- `study_materials` - Educational resources
- `mentor_reviews` - Feedback system
- `events` - Workshops and events
- `competitions` - Competitions and challenges
- `feedback` - Platform feedback
- `user_sessions` - Analytics tracking

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key
RESEND_API_KEY=your_prod_resend_key
VITE_DAILY_DOMAIN=your_prod_daily_domain
```

### Build Commands

```bash
# Install dependencies
npm ci

# Build frontend
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@yaria.org or join our Discord community.

## 🙏 Acknowledgments

- Built with ❤️ for African youth innovators
- Special thanks to the YARA community
- Powered by Supabase, Daily.co, and modern web technologies
