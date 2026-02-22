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
                                <div className="map-popup-content" style={{ padding: '8px', minWidth: '240px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span className={`badge badge-${incident.priority || 'blue'}`} style={{
                                            textTransform: 'uppercase',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: incident.priority === 'critical' ? '#dc2626' : (incident.priority === 'high' ? '#ef4444' : '#f97316'),
                                            color: 'white'
                                        }}>
                                            {incident.priority || 'Normal'}
                                        </span>
                                        <h4 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1rem' }}>{t(`sos.types.${incident.emergency_type}`)}</h4>
                                    </div>

                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                                        {incident.description}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Severity:</span> {incident.severity_score}/10</div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>People:</span> {incident.people_count || 1}</div>
                                        {incident.ai_source === 'gemini' && incident.ai_confidence && (
                                            <div style={{ gridColumn: 'span 2', marginTop: '4px', color: '#818cf8', fontWeight: 600 }}>
                                                🧠 AI Confidence: {Math.round(incident.ai_confidence * 100)}%
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                                        {incident.injured && (
                                            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                ⚠️ {t('sos.alerts.injured') || 'Injured'}
                                            </span>
                                        )}
                                        {incident.trapped && (
                                            <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '11px', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                🚧 {t('sos.alerts.trapped') || 'Trapped'}
                                            </span>
                                        )}
                                        {incident.ai_source === 'gemini' && (
                                            <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '11px', background: 'rgba(129, 140, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                📸 Vision Assisted
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>
        </div>
    );
}
