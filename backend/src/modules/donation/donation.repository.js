import { supabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/error.middleware.js';

export const donationRepository = {
    // Campaign methods
    async createCampaign(data) {
        const { data: campaign, error } = await supabase
            .from('donation_campaigns')
            .insert(data)
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return campaign;
    },

    async findAllCampaigns() {
        const { data, error } = await supabase
            .from('donation_campaigns')
            .select(`
                *,
                ngo:ngo_id (
                    ngo_name,
                    location
                )
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    async findCampaignById(id) {
        const { data, error } = await supabase
            .from('donation_campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new AppError('Campaign not found', 404);
        return data;
    },

    async updateCampaignAmount(id, amount) {
        const { data, error } = await supabase
            .rpc('increment_campaign_amount', {
                campaign_id: id,
                inc_amount: amount
            });

        // If RPC isn't set up yet, fallback to manual (less safe for concurrency but works for demo)
        if (error) {
            const campaign = await this.findCampaignById(id);
            const { data: updated, error: updateError } = await supabase
                .from('donation_campaigns')
                .update({ current_amount: (Number(campaign.current_amount) || 0) + Number(amount) })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw new AppError(updateError.message, 500);
            return updated;
        }

        return data;
    },

    // Donation methods
    async createDonation(data) {
        const { data: donation, error } = await supabase
            .from('donations')
            .insert(data)
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return donation;
    },

    async updateDonationStatus(id, status, payment_reference = null) {
        const updates = { status };
        if (payment_reference) updates.payment_reference = payment_reference;

        const { data, error } = await supabase
            .from('donations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    async findDonationsByUser(userId) {
        const { data, error } = await supabase
            .from('donations')
            .select(`
                *,
                campaign:campaign_id (
                    title,
                    description,
                    category
                )
            `)
            .eq('donor_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    // Spend methods
    async createSpend(data) {
        const { data: spend, error } = await supabase
            .from('donation_spends')
            .insert(data)
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return spend;
    },

    async findSpendsByCampaign(campaignId) {
        const { data, error } = await supabase
            .from('donation_spends')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false });

        if (error) throw new AppError(error.message, 500);
        return data;
    },

    // Admin methods
    async findAllForAdmin() {
        const { data: campaigns, error: campaignError } = await supabase
            .from('donation_campaigns')
            .select(`
                *,
                donations (
                    id,
                    amount,
                    status,
                    created_at
                )
            `)
            .order('created_at', { ascending: false });

        if (campaignError) throw new AppError(campaignError.message, 500);
        return campaigns;
    }
};
