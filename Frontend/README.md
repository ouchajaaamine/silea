# Silea Frontend - Modern E-commerce Platform

## 🚀 Quick Start

The development server is running! Visit:

**http://localhost:3000**

## ✨ Features

### Customer Pages
- **Homepage** - Video hero background, featured products, testimonials
- **Category Pages** - Honey & Oils with filters and sorting
- **Product Pages** - Full product details with gallery and reviews
- **Shopping Cart** - Multi-step checkout process
- **Order Tracking** - Track orders by order number
- **About & Contact** - Beautiful information pages

### Admin Dashboard
- **Login** - Secure admin authentication
- **Dashboard** - Statistics and overview
- **Products Management** - Full CRUD operations
- **Orders Management** - Status tracking and updates
- **Categories Management** - Organize products

## 🎨 Design Features

- **Glassmorphism UI** - Modern transparent card effects
- **Smooth Animations** - Fluid transitions throughout
- **Brand Colors**:
  - Primary: #556B2F (Olive Green)
  - Secondary: #D6A64F (Gold)
  - Background: #FAF7F0 (Cream)
- **Responsive Design** - Works on all devices

## 🔧 Configuration

### API Backend
Set the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Or update `lib/api.ts` directly.

### Video Hero
Place your drone video at:
```
public/zaytoun-drone.mp4
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Admin Access

Demo credentials:
- Email: `admin@silea.com`
- Password: `admin123`

Access admin at: `/admin`

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Sonner** - Toast notifications
- **React Context** - State management

## 📝 Notes

- All API calls have fallback demo data for preview
- Cart persists in localStorage
- Admin authentication uses JWT tokens
- Full API integration ready for backend connection

---

**Built with ❤️ for Silea - Pure Treasures from Beni Mellal**

