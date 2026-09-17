'use client';

import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

interface IconDefaultPrototype {
	_getIconUrl?: string;
}

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Provider = {
	_id: string;
	category: string;
	ratePerHour: number;
	address: string;
	location: { coordinates: [number, number] };
	available: boolean;
};

type SearchMapProps = {
	providers: Provider[];
	centerLat: number;
	centerLng: number;
	setQuery: React.Dispatch<React.SetStateAction<string>>;
	setCoords: React.Dispatch<
		React.SetStateAction<{ lat: number; lng: number } | null>
	>;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
	const map = useMap();

	useEffect(() => {
		map.setView([lat, lng], map.getZoom());
	}, [lat, lng, map]);

	return null;
}

function MapClickHandler({
	onSelect,
}: {
	onSelect: (lat: number, lng: number) => void;
}) {
	useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;

			onSelect(lat, lng);
		},
	});

	return null;
}

export default function SearchMap({
	providers,
	centerLat,
	centerLng,
	setQuery,
	setCoords,
}: SearchMapProps) {
	const handleMapClick = async (lat: number, lng: number) => {
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
			);
			const data = await res.json();

			if (!res.ok) {
				throw new Error('Failed to get address');
			}

			setQuery(data.display_name);
			setCoords({ lat, lng });
		} catch (error) {
			console.error('Reverse geocoding failed:', error);

			setCoords({ lat, lng });
		}
	};

	return (
		<MapContainer
			center={[centerLat, centerLng]}
			zoom={13}
			style={{ height: '500px', width: '100%' }}
		>
			<RecenterMap lat={centerLat} lng={centerLng} />
			<MapClickHandler onSelect={handleMapClick} />
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution="&copy; OpenStreetMap contributors"
			/>
			<Marker position={[centerLat, centerLng]}>
				<Popup>Selected service location</Popup>
			</Marker>
			{providers.map((p) => (
				<Marker
					key={p._id}
					position={[
						p.location.coordinates[1],
						p.location.coordinates[0],
					]} // [lat, lng]
				>
					<Popup>
						<strong>{p.category}</strong>
						<br />₹{p.ratePerHour}/hr
						<br />
						{p.address}
						<br />
						{p.available ? '🟢 Available now' : '⚪ Not available'}
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}
