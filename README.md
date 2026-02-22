# KICKSTREET - Premium Sneaker E-Commerce Platform

A modern, full-featured e-commerce platform for selling sneakers and streetwear built with Next.js, MongoDB, and Stripe.

![KickStreet](https://img.shields.io/badge/KickStreet-Sneakers-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Green)
![Stripe](https://img.shields.io/badge/Stripe-Purple)

---

## 🚀 Features

### 👤 User Features

- **Product Browsing**
  - Browse all products on home page and dedicated shop page
  - View product details with image gallery, sizes, and pricing
  - Search products by name, description, or category
  - Filter products by category (Men, Women, Children)
  - Sort products by newest or price (low to high / high to low)

- **Shopping Cart**
  - Add products to cart with size selection
  - Update quantities or remove items
  - View cart total with real-time updates

- **User Authentication**
  - Email/password registration and login
  - OTP verification for account security
  - Password reset functionality
  - User profile management

- **Order Management**
  - Place orders (COD or Stripe payment)
  - View order history
  - Order confirmation emails

### 👑 Admin Features

- **Dashboard**
  - Sales statistics overview
  - Total orders, revenue, and products count
  - Recent orders list

- **Product Management**
  - Add new products with images, pricing, sizes, colors
  - Edit existing products
  - Delete products
  - Categorize products (Men, Women, Children)
  - Manage inventory/stock

- **Order Management**
  - View all customer orders
  - Update order status
  - Order details with shipping info

- **Slider Management**
  - Create promotional sliders (max 3)
  - Link sliders to products
  - Auto-generate sliders from latest products

- **Shop Settings**
  - Configure store information
  - Set free shipping threshold

---

## 🛠️ Tech Stack

| Technology------------|---------|
 | Purpose |
|| **Next.js 14** | Frontend framework with App Router |
| **TypeScript** | Type safety |
| **MongoDB** | Database (via Mongoose) |
| **NextAuth.js** | Authentication |
| **Stripe** | Payment processing |
| **Cloudinary** | Image storage & optimization |
| **Tailwind CSS** | Styling |
| **Nodemailer** | Email sending |

---

## 📁 Project Structure

```
shoe-store/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AdminLayout.tsx
│   │   ├── Footer.tsx
│   │   ├── Input.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   └── Toast.tsx
│   ├── context/           # React Context (Cart)
│   ├── lib/               # Utility functions
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── db.ts
│   │   └── email.ts
│   ├── models/            # MongoDB schemas
│   │   ├── Order.ts
│   │   ├── Product.ts
│   │   ├── Slider.ts
│   │   └── User.ts
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Auth pages
│   │   ├── admin/         # Admin pages
│   │   └── products/      # Product pages
│   └── styles/            # Global styles
├── public/                # Static assets
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe Account
- Cloudinary Account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shoe-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create `.env.local` file:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/kickstreet
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

---

## 🔐 Default Admin Account

After first run, create an admin user through:
1. Register a new account
2. Manually update the user role in MongoDB to `"admin"`

Or use the admin registration endpoint (if enabled).

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with featured products |
| `/shop` | Full product catalog with filters |
| `/products/[id]` | Product detail page |
| `/cart` | Shopping cart |
| `/orders` | User order history |
| `/profile` | User profile |
| `/auth/login` | Login page |
| `/auth/register` | Registration page |
| `/admin/dashboard` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/add-product` | Add new product |
| `/admin/orders` | Order management |
| `/admin/sliders` | Slider management |
| `/admin/shop-settings` | Store settings |

---

## 🛒 Product Categories

- **Men** - Men's footwear
- **Women** - Women's footwear  
- **Children** - Kids footwear

---

## 💳 Payment Methods

- **Cash on Delivery (COD)**
- **Stripe Cards** (Credit/Debit)

---

## 📧 Email Features

- Order confirmation emails
- Password reset emails
- Newsletter subscriptions
- New product notifications

---

## 🎨 Design Features

- Modern, bold streetwear aesthetic
- Mobile-responsive design
- Dark/light hero sections
- Product cards with hover effects
- Smooth animations and transitions
- Newsletter signup

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Developer

Built with ❤️ using Next.js, MongoDB, and Stripe

![Tech Stack](https://img.shields.io/badge/TypeScript-Blue?style=for-the-badge&logo=typescript)
![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react)
![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
