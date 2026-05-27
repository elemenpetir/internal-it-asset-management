const express = require('express');
const app = express()
const authRoutes = require('./routes/authRoutes');
const assetCategoryRoutes = require('./routes/assetCategoryRoutes')
const assetRoutes = require('./routes/assetRoutes')
const assetAssignmentRoutes = require('./routes/assetAssignmentRoutes')
const auditLogRoutes = require('./routes/auditLogRoutes')

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/asset-categories', assetCategoryRoutes)
app.use('/api/assets', assetRoutes)
app.use('/api/asset-assignments', assetAssignmentRoutes)
app.use('/api/audit-logs', auditLogRoutes)


module.exports = app