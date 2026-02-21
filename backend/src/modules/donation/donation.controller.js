import { donationService } from './donation.service.js';

export const donationController = {
    // NGO Actions
    async createCampaign(req, res, next) {
        try {
            const campaign = await donationService.createCampaign(req.user.userId, req.body);
            res.status(201).json({
                status: 'success',
                data: campaign
            });
        } catch (err) {
            next(err);
        }
    },

    async recordSpend(req, res, next) {
        try {
            const spend = await donationService.recordSpend(req.user.userId, req.body);
            res.status(201).json({
                status: 'success',
                data: spend
            });
        } catch (err) {
            next(err);
        }
    },

    // Citizen Actions
    async getCampaigns(req, res, next) {
        try {
            const campaigns = await donationService.getActiveCampaigns();
            res.status(200).json({
                status: 'success',
                results: campaigns.length,
                data: campaigns
            });
        } catch (err) {
            next(err);
        }
    },

    async processPayment(req, res, next) {
        try {
            const donation = await donationService.simulatePayment(req.user.userId, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Payment simulated and processed successfully',
                data: donation
            });
        } catch (err) {
            next(err);
        }
    },

    async getMyDonations(req, res, next) {
        try {
            const history = await donationService.getMemberDonations(req.user.userId);
            res.status(200).json({
                status: 'success',
                data: history
            });
        } catch (err) {
            next(err);
        }
    },

    // Admin Actions
    async getAllData(req, res, next) {
        try {
            const data = await donationService.getAllDataForAdmin();
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            next(err);
        }
    }
};
