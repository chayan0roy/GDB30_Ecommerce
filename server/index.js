const express = require('express');
const app = express();
const dotenv = require('dotenv');
const passport = require('passport');


const db = require('./config/db');
require('./middleware/passport-config')



const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const addressRoutes = require('./routes/addressRoutes');




dotenv.config();

app.use(express.json());

app.use(passport.initialize());



app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoryRoutes);
app.use('/banners', bannerRoutes);
app.use('/addresses', addressRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});