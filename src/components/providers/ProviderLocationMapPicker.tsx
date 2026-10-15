'use client';

import {
	MapContainer,
	Marker,
	TileLayer,
	Circle,
	useMap,
	useMapEvents,
} from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2 } from 'lucide-react';

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

type NominatimResult = {
	display_name: string;
	lat: string;
	lon: string;
};

type LocationData = {
	lat: number;
	lng: number;
	address: string;
};

type ProviderLocationMapPickerProps = {
	selectedLocation: LocationData | null;
	serviceRadiusKm: number;
	onSelect: (loc: LocationData) => void;
};

function MapClickHandler({
	onSelect,
}: {
	onSelect: (lat: number, lng: number) => void;
}) {
	useMapEvents({
		click(e) {
			onSelect(e.latlng.lat, e.latlng.lng);
		},
	});
	return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
	const map = useMap();
	useEffect(() => {
		map.setView([lat, lng], map.getZoom(), { animate: true });
	}, [lat, lng, map]);
	return null;
}

export default function ProviderLocationMapPicker({
	selectedLocation,
	serviceRadiusKm,
	onSelect,
}: ProviderLocationMapPickerProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isGeocoding, setIsGeocoding] = useState(false);
	const skipSearch = useRef(false);

	const defaultCoords = { lat: 28.6139, lng: 77.209 }; // Default coordinates
	const currentLat = selectedLocation?.lat ?? defaultCoords.lat;
	const currentLng = selectedLocation?.lng ?? defaultCoords.lng;

	// Search autocomplete
	useEffect(() => {
		if (skipSearch.current) {
			skipSearch.current = false;
			return;
		}

		if (searchQuery.trim().length < 3) {
			setSuggestions([]);
			return;
		}

		const timer = setTimeout(async () => {
			setIsSearching(true);
			try {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
						searchQuery,
					)}&format=json&limit=5`,
					{ headers: { 'User-Agent': 'service-finder-dev' } },
				);
				if (res.ok) {
					const data = await res.json();
					setSuggestions(data);
				}
			} catch {
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		}, 450);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// When user clicks anywhere on map
	const handleMapClick = async (lat: number, lng: number) => {
		setIsGeocoding(true);
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
				{ headers: { 'User-Agent': 'service-finder-dev' } },
			);
			if (res.ok) {
				const data = await res.json();
				const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
				skipSearch.current = true;
				setSearchQuery(address);
				setSuggestions([]);
				onSelect({ lat, lng, address });
			} else {
				const fallbackAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
				onSelect({ lat, lng, address: fallbackAddr });
			}
		} catch {
			const fallbackAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
			onSelect({ lat, lng, address: fallbackAddr });
		} finally {
			setIsGeocoding(false);
		}
	};

	const handleSuggestionClick = (s: NominatimResult) => {
		skipSearch.current = true;
		setSearchQuery(s.display_name);
		setSuggestions([]);
		onSelect({
			lat: parseFloat(s.lat),
			lng: parseFloat(s.lon),
			address: s.display_name,
		});
	};

	return (
		<div className="space-y-3">
			{/* Search input with suggestions */}
			<div className="relative">
				<div className="relative flex items-center">
					<Search
						size={16}
						className="absolute left-3 text-muted-foreground"
					/>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search your base area, neighborhood, or city..."
						className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
					/>
					{isSearching && (
						<Loader2
							size={15}
							className="absolute right-3 animate-spin text-primary"
						/>
					)}
				</div>

				{suggestions.length > 0 && (
					<div className="absolute left-0 right-0 top-full z-[1000] mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
						<ul className="divide-y divide-border">
							{suggestions.map((s, idx) => (
								<li key={`${s.lat}-${s.lon}-${idx}`}>
									<button
										type="button"
										onClick={() => handleSuggestionClick(s)}
										className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left text-xs text-foreground transition hover:bg-surface"
									>
										<MapPin
											size={14}
											className="mt-0.5 shrink-0 text-primary"
										/>
										<span className="line-clamp-2">
											{s.display_name}
										</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Interactive Map Box */}
			<div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
				<div className="h-72 w-full sm:h-80">
					<MapContainer
						center={[currentLat, currentLng]}
						zoom={12}
						style={{ height: '100%', width: '100%' }}
					>
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution="&copy; OpenStreetMap contributors"
						/>

						<MapClickHandler onSelect={handleMapClick} />

						{selectedLocation && (
							<>
								<RecenterMap
									lat={selectedLocation.lat}
									lng={selectedLocation.lng}
								/>
								<Marker
									position={[
										selectedLocation.lat,
										selectedLocation.lng,
									]}
								/>
								<Circle
									center={[
										selectedLocation.lat,
										selectedLocation.lng,
									]}
									radius={(serviceRadiusKm || 10) * 1000}
									pathOptions={{
										color: '#635bff',
										fillColor: '#635bff',
										fillOpacity: 0.15,
										weight: 2,
									}}
								/>
							</>
						)}
					</MapContainer>
				</div>

				{/* Map helper hint badge */}
				<div className="absolute bottom-2.5 left-2.5 z-[1000] rounded-lg border border-border/80 bg-card/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
					{isGeocoding
						? 'Locating address...'
						: '💡 Click anywhere on map to reposition your base point'}
				</div>
			</div>

			{/* Currently selected location pill */}
			{selectedLocation ? (
				<div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
					<MapPin size={16} className="mt-0.5 shrink-0 text-emerald-700" />
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-emerald-900">
							Active Base Location
						</p>
						<p className="mt-0.5 truncate text-emerald-800">
							{selectedLocation.address}
						</p>
						<p className="mt-0.5 text-[11px] text-emerald-700">
							Service Coverage: {serviceRadiusKm || 10} km radius
							(purple area on map)
						</p>
					</div>
				</div>
			) : (
				<p className="text-xs text-muted-foreground">
					No location set yet. Click on the map or search an address above.
				</p>
			)}
		</div>
	);
}
