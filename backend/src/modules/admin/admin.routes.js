const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/roleCheck');

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for user and system management
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform statistics (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Stats for users and tasks
 *       403:
 *         description: Forbidden
 */
router.get('/stats', adminController.getStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated user list
 *       403:
 *         description: Forbidden
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Role updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * @swagger
 * /admin/users/{id}/toggle-status:
 *   patch:
 *     summary: Activate or deactivate a user (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status toggled
 *       403:
 *         description: Forbidden
 */
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

module.exports = router;
