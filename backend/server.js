require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');
// const commentUpdateRoutes = require('./routes/commentUpdateRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const promoRoutes = require('./routes/promoRoutes');
// const checkoutRoutes = require('./routes/checkoutRoutes');
// const searchRoutes = require('./routes/searchRoutes');

connectDB();

const app = express();
app.set('trust proxy', 1);

// --- Security middleware ---
app.use(helmet()); 
app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/comments', commentUpdateRoutes); 
// app.use('/api/cart', cartRoutes);
// app.use('/api/promo', promoRoutes);
// app.use('/api/checkout', checkoutRoutes);
// app.use('/api/search', searchRoutes);

app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TapBazaar API running on port ${PORT}`));

module.exports = app;