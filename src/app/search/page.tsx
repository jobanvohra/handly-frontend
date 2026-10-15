'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import LocationPicker from '@/components/common/LocationPicker';
import Loader from '@/components/common/Loader';
import { SERVICE_CATEGORIES, getCategoryLabel } from '@/constants/categories';

const SearchMap = dynamic(() => import('@/components/search/SearchMap'), {
	ssr: false,
	loading: () => (
		<div className="flex h-full min-h-64 items-center justify-center bg-surface text-xs text-muted-foreground">
			Loading map...
		</div>
	),
});

type Provider = {
	_id: string;
	user: {
		name: string;
		_id: string;
	};
	category: string;
	ratePerHour: number;
	address: string;
	location: { coordinates: [number, number] };
	available: boolean;
};

export default function SearchPage() {
	const [providers, setProviders] = useState<Provider[]>([]);
	const [coords, setCoords] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [category, setCategory] = useState('');
	const [radius, setRadius] = useState(10);
	const [query, setQuery] = useState('');

	const router = useRouter();
	const searchParams = useSearchParams();

	const handleProviderClick = (providerId: string) => {
		const params = new URLSearchParams(searchParams.toString());

		router.push(`/providers/${providerId}?${params.toString()}`);
	};

	useEffect(() => {
		if (!coords) return;

		const params = new URLSearchParams(searchParams.toString());

		const lat = coords.lat.toString();
		const lng = coords.lng.toString();

		if (params.get('lat') === lat && params.get('lng') === lng) {
			return;
		}

		params.set('lat', lat);
		params.set('lng', lng);

		router.replace(`?${params.toString()}`);
	}, [coords, searchParams, router]);

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
			.then((json) => {
				setProviders(json.data);
			});
	}, [coords, category, radius]);

	if (!coords) {
		return (
			<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
				<Loader size="lg" message="Acquiring your local coordinates..." />
			</div>
		);
	}

	return (
		<main className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-background flex flex-col">
			<div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-5">
				<div className="mb-4 shrink-0">
					<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						Find a service near you
					</h1>

					<p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
						Discover verified local professionals available in your radius.
					</p>
				</div>

				<div className="mb-4 shrink-0 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
						<div>
							<label className="mb-1.5 block text-xs font-medium text-foreground">
								Location
							</label>

							<LocationPicker
								placeholder="Search a location..."
								onSelect={(loc) =>
									setCoords({
										lat: loc.lat,
										lng: loc.lng,
									})
								}
							/>
						</div>

						<div>
							<label
								htmlFor="category"
								className="mb-1.5 block text-xs font-medium text-foreground"
							>
								Service Category
							</label>

							<select
								id="category"
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className="h-11 w-full lg:min-w-44 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
							>
								<option value="">All services</option>
								{SERVICE_CATEGORIES.map((c) => (
									<option key={c.value} value={c.value}>
										{c.label}
									</option>
								))}
							</select>
						</div>

						<div className="sm:col-span-2 lg:col-span-1">
							<label
								htmlFor="radius"
								className="mb-1.5 block text-xs font-medium text-foreground"
							>
								Within Radius
							</label>

							<select
								id="radius"
								value={radius}
								onChange={(e) =>
									setRadius(Number(e.target.value))
								}
								className="h-11 w-full lg:min-w-32 rounded-lg border border-border bg-background px-3 text-xs sm:text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
							>
								<option value={5}>5 km</option>
								<option value={10}>10 km</option>
								<option value={25}>25 km</option>
								<option value={50}>50 km</option>
							</select>
						</div>
					</div>
				</div>

				<div className="flex flex-col-reverse lg:grid lg:grid-cols-[2fr_3fr] gap-5 min-h-0 flex-1">
					<section className="flex min-h-0 flex-col">
						<div className="mb-2 shrink-0">
							<h2 className="text-sm font-semibold text-foreground">
								Available Specialists ({providers.length})
							</h2>
						</div>

						<div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
							{providers.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
									<p className="text-sm font-semibold text-foreground">
										No providers found in this area
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										Try increasing the radius to 25km or 50km, or choose "All services".
									</p>
								</div>
							) : (
								providers.map((p) => (
									<button
										key={p._id}
										type="button"
										onClick={() =>
											handleProviderClick(p.user._id)
										}
										className="w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-sm"
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="font-semibold text-sm text-foreground">
													{p.user.name}
												</p>

												<p className="mt-0.5 text-xs font-medium text-primary">
													{getCategoryLabel(p.category)}
												</p>
											</div>

											<span
												className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
													p.available
														? 'bg-success-background text-success'
														: 'bg-surface text-muted-foreground'
												}`}
											>
												{p.available
													? 'Available'
													: 'Unavailable'}
											</span>
										</div>

										<div className="mt-3 flex items-center justify-between gap-3 text-xs border-t border-border/70 pt-3">
											<span className="truncate text-muted-foreground">
												{p.address}
											</span>

											<span className="shrink-0 font-bold text-foreground">
												₹{p.ratePerHour}/hr
											</span>
										</div>
									</button>
								))
							)}
						</div>
					</section>

					<section className="h-72 sm:h-80 lg:h-full min-h-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
						<SearchMap
							radius={radius}
							providers={providers}
							centerLat={coords.lat}
							centerLng={coords.lng}
							setQuery={setQuery}
							setCoords={setCoords}
						/>
					</section>
				</div>
			</div>
		</main>
	);
}
