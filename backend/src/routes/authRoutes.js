const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

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
router.get('/admin-test', authMiddleware, roleMiddleware('admin', 'manager'), (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'you can access this route'
    })
})

module.exports = router