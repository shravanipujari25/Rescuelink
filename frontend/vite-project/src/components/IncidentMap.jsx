import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

// Import local images to avoid CDN tracking prevention issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon issues in React using imported local assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

/**
 * Creates a custom marker icon based on priority color
 */
const createCustomIcon = (priority) => {
    // Priority levels from AI
    const colors = {
        critical: '#dc2626', // Deep Red
        high: '#ef4444',     // Red
        medium: '#f97316',   // Orange
        low: '#eab308'       // Yellow
    };

    // Explicit check for undefined or unknown priority
    const color = colors[priority] || '#3b82f6'; // Blue fallback if data is missing

    return L.divIcon({
        className: 'custom-map-marker-container',
        html: `<div class="marker-pin" style="background-color: ${color};">
                <div class="marker-dot"></div>
               </div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -40]
    });
};

/**
 * Helper component to fit map to markers
 */
function ChangeView({ markers }) {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [markers, map]);
    return null;
}

export default function IncidentMap({ incidents = [] }) {
    const { t } = useTranslation();

    // Default center (Pune, India coordinates from user request)
    const defaultCenter = [18.5204, 73.8567];

    useEffect(() => {
        if (incidents.length > 0) {
            console.log('📍 [IncidentMap] Rendering markers for:', incidents);
        }
    }, [incidents]);

    return (
        <div className="map-container" style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ChangeView markers={incidents} />

                {incidents
                    .filter(inc => inc.latitude && inc.longitude)
                    .map((incident) => (
                        <Marker
                            key={incident.id}
                            position={[
                                parseFloat(incident.latitude),
                                parseFloat(incident.longitude)
                            ]}
                            icon={createCustomIcon(incident.priority)}
                        >
                            <Popup>
                                <div className="map-popup-content" style={{ padding: '8px', minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span className={`badge badge-${incident.priority || 'blue'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                            {incident.priority || 'Normal'}
                                        </span>
                                        <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{t(`sos.types.${incident.emergency_type}`)}</h4>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                                        {incident.description}
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                        <div style={{ color: 'var(--text-muted)' }}>{t('dashboard.stats.role')}: {incident.people_count || 1}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>Status: {incident.status}</div>
                                    </div>
                                    {incident.injured && (
                                        <div style={{ marginTop: '8px', color: '#ef4444', fontWeight: 600, fontSize: '12px' }}>
                                            ⚠️ {t('sos.alerts.injured')}
                                        </div>
                                    )}
                                    {incident.trapped && (
                                        <div style={{ marginTop: '4px', color: '#f59e0b', fontWeight: 600, fontSize: '12px' }}>
                                            🚧 {t('sos.alerts.trapped')}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>
        </div>
    );
}
