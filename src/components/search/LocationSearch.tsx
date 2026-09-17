'use client';

import { useEffect, useState } from 'react';

type Suggestion = {
	displayName: string;
	lat: number;
	lng: number;
};

type NominatimResult = {
	display_name: string;
	lat: string;
	lon: string;
};

export default function LocationSearch({
	onSelect,
	query,
	setQuery,
}: {
	onSelect: (loc: { lat: number; lng: number; label: string }) => void;
	query: string;
	setQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

	useEffect(() => {
		if (query.trim().length < 3) {
			return;
		}

		const timer = setTimeout(async () => {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
				{
					headers: { 'User-Agent': 'service-finder-dev' },
				},
			);
			const results: NominatimResult[] = await res.json();
			setSuggestions(
				results.map((r) => ({
					displayName: r.display_name,
					lat: parseFloat(r.lat),
					lng: parseFloat(r.lon),
				})),
			);
		}, 500);

		return () => clearTimeout(timer);
	}, [query]);

	return (
		<div>
			<input
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search a location..."
			/>
			{suggestions.length > 0 && (
				<ul>
					{suggestions.map((s, i) => (
						<li
							key={i}
							onClick={() => {
								onSelect({
									lat: s.lat,
									lng: s.lng,
									label: s.displayName,
								});
								setQuery(s.displayName);
								setSuggestions([]);
							}}
						>
							{s.displayName}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
