'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import LocationSearch from '@/components/search/LocationSearch';

const SearchMap = dynamic(() => import('@/components/search/SearchMap'), {
	ssr: false,
	loading: () => <p>Loading map...</p>,
});

type Provider = {
	_id: string;
	category: string;
	ratePerHour: number;
	address: string;
	location: { coordinates: [number, number] };
	available: boolean;
};

export default function SearchPage() {
	const [providers, setProviders] = useState<Provider[]>([]);
	const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
		null,
	);
	const [category, setCategory] = useState('');
	const [radius, setRadius] = useState(10);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition((position) => {
			setCoords({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			});
		});
	}, []);

	useEffect(() => {
		if (!coords) return;
		fetch(
			`/api/providers/search?lat=${coords.lat}&lng=${coords.lng}&category=${category}&maxDistanceKm=${radius}`,
		)
			.then((res) => res.json())
			.then((json) => setProviders(json.data));
	}, [coords, category, radius]);

	if (!coords) return <p>Loading....</p>;

	return (
		<div>
			<LocationSearch
				onSelect={(loc) => setCoords({ lat: loc.lat, lng: loc.lng })}
			/>

			<select
				value={category}
				onChange={(e) => setCategory(e.target.value)}
			>
				<option value="">All categories</option>
				<option value="plumber">Plumber</option>
				<option value="electrician">Electrician</option>
				{/* etc — match your seeded categories */}
			</select>

			<select
				value={radius}
				onChange={(e) => setRadius(Number(e.target.value))}
			>
				<option value={5}>5 km</option>
				<option value={10}>10 km</option>
				<option value={25}>25 km</option>
				<option value={50}>50 km</option>
			</select>

			{coords && (
				<SearchMap
					providers={providers}
					centerLat={coords.lat}
					centerLng={coords.lng}
				/>
			)}

			<div>
				{providers.map((p) => (
					<div key={p._id}>{p.category}</div>
				))}
			</div>
		</div>
	);
}
