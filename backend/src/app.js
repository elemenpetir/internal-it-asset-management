const express = require('express');
const authRoutes = require('./routes/authRoutes');
const assetCategoryRoutes = require('./routes/assetCategoryRoutes')
const assetRoutes = require('./routes/assetRoutes')
const app = express()

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/asset-categories', assetCategoryRoutes)
app.use('/api/assets', assetRoutes)

module.exports = app