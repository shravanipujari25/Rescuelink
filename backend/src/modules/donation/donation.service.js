import { donationRepository } from './donation.repository.js';
import logger from '../../config/logger.js';
import { AppError } from '../../middleware/error.middleware.js';

export const donationService = {
    // NGO Services
    async createCampaign(ngoId, campaignData) {
        const campaign = await donationRepository.createCampaign({
            ...campaignData,
            ngo_id: ngoId
        });

        logger.info({ campaign_id: campaign.id, ngo_id: ngoId }, 'DONATION_CAMPAIGN_CREATED');
        return campaign;
    },

    async recordSpend(ngoId, spendData) {
        // Verify NGO owns the campaign
        const campaign = await donationRepository.findCampaignById(spendData.campaign_id);
        if (campaign.ngo_id !== ngoId) {
            throw new AppError('Unauthorized: You do not own this campaign', 403);
        }

        const spend = await donationRepository.createSpend({
            ...spendData,
            ngo_id: ngoId
        });

        logger.info({ spend_id: spend.id, campaign_id: spend.campaign_id, ngo_id: ngoId }, 'DONATION_SPEND_RECORDED');
        return spend;
    },

    // Citizen Services
    async getActiveCampaigns() {
        return await donationRepository.findAllCampaigns();
    },

    async simulatePayment(donorId, paymentData) {
        const { campaign_id, amount } = paymentData;

        // 1. Create pending donation
        const donation = await donationRepository.createDonation({
            campaign_id,
            donor_id: donorId,
            amount,
            status: 'pending'
        });

        // 2. Simulate success (in real life, we'd wait for webhooks)
        const paymentReference = `sim_${Math.random().toString(36).substring(7)}`;

        // 3. Update status to completed
        const completedDonation = await donationRepository.updateDonationStatus(
            donation.id,
            'completed',
            paymentReference
        );

        // 4. Increment campaign amount
        await donationRepository.updateCampaignAmount(campaign_id, amount);

        logger.info({
            donation_id: completedDonation.id,
            campaign_id,
            donor_id: donorId,
            amount
        }, 'DONATION_MADE');

        return completedDonation;
    },

    async getMemberDonations(userId) {
        const donations = await donationRepository.findDonationsByUser(userId);

        // Enhance with spends for each campaign donated to
        const enhancedDonations = await Promise.all(donations.map(async (d) => {
            const spends = await donationRepository.findSpendsByCampaign(d.campaign_id);
            return {
                ...d,
                campaign_spends: spends
            };
        }));

        return enhancedDonations;
    },

    // Admin Services
    async getAllDataForAdmin() {
        return await donationRepository.findAllForAdmin();
    }
};
