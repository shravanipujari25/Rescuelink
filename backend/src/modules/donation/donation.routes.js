import { Router } from 'express';
import { donationController } from './donation.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/campaigns', donationController.getCampaigns);

// ==========================================
// NGO ROUTES
// ==========================================
router.post(
    '/campaign',
    requireAuth,
    requireRole(['ngo']),
    donationController.createCampaign
);

router.post(
    '/spend',
    requireAuth,
    requireRole(['ngo']),
    donationController.recordSpend
);

// ==========================================
// CITIZEN ROUTES
// ==========================================
router.post(
    '/pay',
    requireAuth,
    requireRole(['citizen']),
    donationController.processPayment
);

router.get(
    '/my',
    requireAuth,
    requireRole(['citizen']),
    donationController.getMyDonations
);

// ==========================================
// ADMIN ROUTES
// ==========================================
router.get(
    '/all',
    requireAuth,
    requireRole(['admin']),
    donationController.getAllData
);

export default router;
