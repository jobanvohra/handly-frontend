'use client';

import { useState, useEffect, useRef } from 'react';

type NominatimResult = {
	display_name: string;
	lat: string;
	lon: string;
};

type Location = {
	lat: number;
	lng: number;
	address: string;
};

type LocationPickerProps = {
	onSelect: (loc: Location) => void;
	placeholder?: string;
	initialQuery?: string;
};

export default function LocationPicker({
	onSelect,
	placeholder = 'Search a location...',
	initialQuery = '',
}: LocationPickerProps) {
	const [query, setQuery] = useState(initialQuery);
	const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
	const skipSearch = useRef(false);

	useEffect(() => {
		if (skipSearch.current) {
			skipSearch.current = false;
			return;
		}

		if (query.trim().length < 3) {
			setSuggestions([]);
			return;
		}

		const timer = setTimeout(async () => {
			try {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
					{
						headers: {
							'User-Agent': 'service-finder-dev',
						},
					},
				);

				if (!res.ok) {
					setSuggestions([]);
					return;
				}

				const results: NominatimResult[] = await res.json();
				setSuggestions(results);
			} catch {
				setSuggestions([]);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [query]);

	const handleSelect = (suggestion: NominatimResult) => {
		skipSearch.current = true;

		setQuery(suggestion.display_name);
		setSuggestions([]);

		onSelect({
			lat: parseFloat(suggestion.lat),
			lng: parseFloat(suggestion.lon),
			address: suggestion.display_name,
		});
	};

	return (
		<div className="relative">
			<input
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder={placeholder}
				className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
			/>

			{suggestions.length > 0 && (
				<div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
					<ul>
						{suggestions.map((suggestion, index) => (
							<li
								key={`${suggestion.lat}-${suggestion.lon}-${index}`}
							>
								<button
									type="button"
									onClick={() => handleSelect(suggestion)}
									className="w-full px-4 py-3 text-left text-sm text-foreground transition hover:bg-surface"
								>
									{suggestion.display_name}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
