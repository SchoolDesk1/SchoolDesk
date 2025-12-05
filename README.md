# SchoolDesk - Smart School Management System

A comprehensive SaaS platform for schools to manage communication, homework, fees, transport, and more.

## 🌟 Features

### For Super Admins
- Manage multiple schools
- Approve/suspend/delete schools
- Partner management & commissions
- Promo code management
- View analytics and subscriptions

### For School Admins
- Create and manage classes
- Add teachers and parents
- Post school-wide notices
- Track fee payments
- Manage transport/vehicles
- Schedule events
- View all homework assignments

### For Teachers
- Upload homework with file attachments
- Post class-specific notices
- Enter student marks
- View and manage homework history

### For Parents
- View children's homework assignments
- Download homework files
- Read class and school notices
- Check fee payment status
- View transport details
- See school events

### Partner Program
- Referral tracking with unique codes
- Commission management
- Marketing resources

## 🚀 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (Production ready for PostgreSQL)
- **Authentication:** JWT
- **File Upload:** Multer

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Vanilla CSS (Premium UI)
- **HTTP Client:** Axios
- **Animations:** Framer Motion

## 📁 Project Structure

```
SchoolDesk/
├── server/
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth & validation
│   ├── database.js       # SQLite schema
│   └── index.js          # Server entry
├── client/
│   ├── src/
│   │   ├── pages/        # Dashboard components
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   └── App.jsx       # Main app
│   └── package.json
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Backend Setup

```bash
cd server
npm install
node seed_admin.js  # Create initial super admin
node index.js       # Start server on port 5000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev         # Development server
npm run build       # Production build
```

## 🔐 Default Credentials

**Super Admin:**
- Email: `admin@example.com`
- Password: `password123`
- Access: `/admin-secret-login`

**Partner Demo:**
- Email: `partner@demo.com`
- Password: `partner123`

## 💰 Pricing Plans

| Plan | Price | Classes | Students |
|------|-------|---------|----------|
| Trial | FREE (14 days) | 2 | 20 |
| Basic | ₹499/mo | 8 | 100 |
| Standard | ₹799/mo | 15 | 300 |
| Premium | ₹999/mo | Unlimited | Unlimited |

## 🛡️ Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected routes and middleware
- Secure file uploads

## 📦 Deployment

### Backend (Render/Railway)
1. Set environment variables: `JWT_SECRET`
2. Upload code
3. Run: `node index.js`

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder

### Environment Variables

**Backend (.env):**
```
JWT_SECRET=your_secret_key_here
PORT=5000
```

## 📞 Contact

- **Email:** schooldesk18@gmail.com
- **Phone:** +91 6295801248
- **Instagram:** [@schooldesk11](https://instagram.com/schooldesk11)
- **Facebook:** [SchoolDesk](https://www.facebook.com/share/1CB3y2JVUW/)
- **X (Twitter):** [@SchoolDesk11](https://x.com/SchoolDesk11)
- **LinkedIn:** [School Desk](https://www.linkedin.com/company/school-desk/)

## 📄 License

MIT License

---

**Built with ❤️ for better school communication**
