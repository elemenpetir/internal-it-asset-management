const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login', authController.login)
router.post('/activate', authController.activateEmployee)

router.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'authenticated user',
        data: {
            id: req.user.id,
            role: req.user.role
        }
    })
})

module.exports = router