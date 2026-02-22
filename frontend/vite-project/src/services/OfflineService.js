import { toast } from 'react-hot-toast';

const QUEUE_KEY = 'rl_offline_sos';

export const OfflineService = {
    /**
     * Save an SOS request to localStorage for later sync
     */
    queueSOS(sosData) {
        const queue = this.getQueue();

        // Add unique client-side ID for deduplication if not present
        const enrichedData = {
            ...sosData,
            offline_id: sosData.offline_id || crypto.randomUUID(),
            reported_at: sosData.reported_at || new Date().toISOString()
        };

        queue.push(enrichedData);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

        console.log('[OfflineService] SOS queued locally:', enrichedData.offline_id);
        return enrichedData;
    },

    getQueue() {
        try {
            const data = localStorage.getItem(QUEUE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[OfflineService] Failed to parse queue:', e);
            return [];
        }
    },

    clearQueue() {
        localStorage.removeItem(QUEUE_KEY);
    },

    removeItem(offlineId) {
        const queue = this.getQueue().filter(item => item.offline_id !== offlineId);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    },

    /**
     * Attempt to sync all queued SOS messages to the backend
     */
    async syncQueue(sosApi) {
        const queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`[OfflineService] Attempting to sync ${queue.length} items...`);

        const results = await Promise.allSettled(
            queue.map(async (sos) => {
                try {
                    await sosApi.create(sos);
                    this.removeItem(sos.offline_id);
                    return sos.offline_id;
                } catch (err) {
                    console.error(`[OfflineService] Sync failed for ${sos.offline_id}:`, err);
                    throw err;
                }
            })
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        if (successCount > 0) {
            toast.success(`Successfully synced ${successCount} offline SOS messages!`);
        }
    }
};

// Auto-sync listener
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[OfflineService] Device back online. Triggering sync...');
        // This will be called by a higher-level manager to avoid circular deps
        // or we can dispatch a custom event.
        window.dispatchEvent(new CustomEvent('rl-sync-request'));
    });
}
