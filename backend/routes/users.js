const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getUserById } = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public to authenticated users: get single user
router.get('/:id', protect, getUserById);

// Admin-only user management
router.get('/', protect, authorizeRoles('admin'), getUsers);
router.post('/', protect, authorizeRoles('admin'), createUser);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
