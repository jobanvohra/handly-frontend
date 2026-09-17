'use client';

import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import LocationSearch from '@/components/search/LocationSearch';

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

type Location = {
	lat: number;
	lng: number;
};

type BookingLocationMapProps = {
	center: Location;
	query: string;
	setQuery: React.Dispatch<React.SetStateAction<string>>;
	onSelect: (loc: { lat: number; lng: number; label: string }) => void;
};

function MapClickHandler({
	onSelect,
}: {
	onSelect: (loc: { lat: number; lng: number; label: string }) => void;
}) {
	useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;
			const label: string = '';
			onSelect({ lat, lng, label });
		},
	});

	return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
	const map = useMap();

	useEffect(() => {
		map.setView([lat, lng], map.getZoom());
	}, [lat, lng, map]);

	return null;
}

export default function BookingLocationMap({
	center,
	query,
	setQuery,
	onSelect,
}: BookingLocationMapProps) {
	return (
		<div>
			<LocationSearch
				query={query}
				setQuery={setQuery}
				onSelect={onSelect}
			/>

			<MapContainer
				center={[center.lat, center.lng]}
				zoom={13}
				style={{ height: '400px', width: '100%' }}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution="&copy; OpenStreetMap contributors"
				/>

				<MapClickHandler onSelect={onSelect} />

				<RecenterMap lat={center.lat} lng={center.lng} />

				{location && <Marker position={[center.lat, center.lng]} />}
			</MapContainer>
		</div>
	);
}
