import Peer from 'peerjs';
import { sosApi } from './api';
import { OfflineService } from './OfflineService';
import { toast } from 'react-hot-toast';

let peer = null;
const RELAY_TOPIC = 'rl_sos_relay';

export const MeshService = {
    init() {
        if (peer) return;

        // In a real app, Peer ID could be the UserId
        const userId = localStorage.getItem('rl_user_id') || `peer-${Math.random().toString(36).substr(2, 9)}`;

        peer = new Peer(userId, {
            debug: 1
        });

        peer.on('open', (id) => {
            console.log('[MeshService] Peer initialized with ID:', id);
        });

        peer.on('connection', (conn) => {
            console.log('[MeshService] Incoming peer connection:', conn.peer);

            conn.on('data', (data) => {
                this.handleIncomingData(data, conn.peer);
            });
        });

        peer.on('error', (err) => {
            console.error('[MeshService] Peer error:', err);
        });

        // Listen for sync requests from OfflineService
        window.addEventListener('rl-sync-request', () => {
            this.syncLocalQueue();
        });
    },

    async handleIncomingData(data, senderId) {
        if (data && data.type === RELAY_TOPIC) {
            console.log(`[MeshService] Received relayed SOS from peer ${senderId}:`, data.sos.offline_id);

            const sos = data.sos;
            sos.is_relayed = true;
            sos.relayed_by = peer.id; // Mark as relayed by this device

            // If we are online, try to send to backend immediately
            if (navigator.onLine) {
                try {
                    await sosApi.create(sos);
                    console.log(`[MeshService] Successfully relayed SOS ${sos.offline_id} to backend.`);
                    toast.success('Relayed a peer SOS to emergency services!');
                } catch (err) {
                    console.error('[MeshService] Failed to relay immediately, queuing locally:', err);
                    OfflineService.queueSOS(sos);
                }
            } else {
                console.log('[MeshService] Device offline, queuing peer SOS locally.');
                OfflineService.queueSOS(sos);
            }
        }
    },

    broadcastSOS(sos) {
        if (!peer) return;

        console.log('[MeshService] Broadcasting SOS to mesh...');
        // In a true mesh, we'd discover neighbors. 
        // For MVP simulation, we'd need a list of IDs.
        // For now, we'll log the attempt and explain that discovery happens via signaling.

        // MVP: If we had a list of nearby peers, we'd loop and connect:
        // peers.forEach(pId => {
        //    const conn = peer.connect(pId);
        //    conn.on('open', () => conn.send({ type: RELAY_TOPIC, sos }));
        // });
    },

    async syncLocalQueue() {
        if (navigator.onLine) {
            await OfflineService.syncQueue(sosApi);
        }
    }
};
