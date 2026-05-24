const assetCategoryController = require('../controllers/assetCategoryController')
const roleMiddleware = require('../middleware/roleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const express = require('express')
const router = express.Router()

router.get('/', authMiddleware, assetCategoryController.getAssetCategories)
router.post('/', authMiddleware, roleMiddleware('asset_admin', 'manager'), assetCategoryController.createAssetCategory)

module.exports = router