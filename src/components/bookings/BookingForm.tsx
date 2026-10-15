'use client';

import { useAuth } from '@/context/useAuth';
import { bookingSchema } from '@/schemas/booking.schema';
import { BookingInput } from '@/types/booking';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import dynamic from 'next/dynamic';

const BookingLocationMap = dynamic(
	() => import('@/components/bookings/BookingLocationMap'),
	{ ssr: false },
);

export default function BookingForm({ providerId }: { providerId: string }) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(bookingSchema),
		defaultValues: {
			requestedTime: '',
			notes: '',
			exactAddress: '',
		},
		mode: 'onTouched',
	});
	const searchParams = useSearchParams();

	const lng = searchParams.get('lng');
	const lat = searchParams.get('lat');

	const [isMapOpen, setIsMapOpen] = useState(!lat || !lng);
	const [selectedLocation, setSelectedLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(
		lat && lng
			? {
					lat: Number(lat),
					lng: Number(lng),
				}
			: null,
	);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [bookingError, setBookingError] = useState<string | null>(null);
	const [checkingLocation, setCheckingLocation] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [geocodeAddress, setGeocodeAddress] = useState('');

	useEffect(() => {
		if (selectedLocation) return;
		navigator.geolocation.getCurrentPosition((position) => {
			setSelectedLocation({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			});
		});
	}, [selectedLocation]);

	useEffect(() => {
		if (!isLoading && !user) {
			const redirect = `/providers/${providerId}/book?${searchParams.toString()}`;
			router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
		}
	}, [isLoading, user, router, providerId, searchParams]);

	const handleLocationSelect = async (loc: {
		lat: number;
		lng: number;
		label: string;
	}) => {
		setCheckingLocation(true);
		setLocationError(null);
		setSearchQuery('');
		setGeocodeAddress('');

		try {
			const [available, reverseGeocode] = await Promise.all([
				fetch(
					`/api/providers/${providerId}/check-service-area?lat=${loc.lat}&lng=${loc.lng}`,
				),
				fetch(
					`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`,
				),
			]);

			const availableResult = await available.json();

			if (!available.ok || !availableResult.data.available) {
				setLocationError(
					"This provider doesn't serve the selected location",
				);
				return;
			}
			const reverseGeocodeResult = await reverseGeocode.json();

			if (!reverseGeocode.ok || !reverseGeocodeResult.display_name) {
				setLocationError('Could not get location name');
				return;
			}

			setSearchQuery(reverseGeocodeResult.display_name);
			setGeocodeAddress(reverseGeocodeResult.display_name);
			setSelectedLocation({ lat: loc.lat, lng: loc.lng });
			const params = new URLSearchParams(searchParams.toString());

			params.set('lat', loc.lat.toString());
			params.set('lng', loc.lng.toString());

			router.replace(`?${params.toString()}`);
			setIsMapOpen(false);
		} catch {
			setLocationError('Could not verify this location');
		} finally {
			setCheckingLocation(false);
		}
	};

	const onSubmit = async (data: BookingInput) => {
		setBookingError(null);

		if (!selectedLocation) {
			setBookingError('Please select a service location');
			return;
		}
		try {
			const res = await fetch('/api/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					...data,
					provider: providerId,
					serviceLocation: {
						type: 'Point',
						coordinates: [
							selectedLocation.lng,
							selectedLocation.lat,
						],
					},
					geocodeAddress,
				}),
			});
			const results = await res.json();
			if (!res.ok) {
				throw new Error(results.message);
			}

			router.replace('/bookings');
		} catch (error) {
			setBookingError(
				error instanceof Error ? error.message : 'Booking failed',
			);
		}
	};

	if (isLoading || !user) return null;

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8"
		>
			<div className="mb-8">
				<button
					type="button"
					onClick={() => router.back()}
					className="mb-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
				>	
					← Back
				</button>

				<h1 className="text-3xl font-semibold tracking-tight">
					Book a service
				</h1>

				<p className="mt-2 text-sm text-muted-foreground">
					Choose when and where you need the service.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
				<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<div className="mb-6">
						<h2 className="text-lg font-semibold">
							Service location
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Select where you want the service.
						</p>
					</div>

					{selectedLocation && !isMapOpen && (
						<div className="rounded-xl border border-border bg-surface p-4">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="text-sm font-medium">
										Selected location
									</p>

									<p className="mt-1 text-sm text-secondary-foreground">
										{geocodeAddress || 'Location selected'}
									</p>
								</div>

								<button
									type="button"
									onClick={() => {
										setLocationError(null);
										setIsMapOpen(true);
									}}
									className="shrink-0 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-background"
								>
									Change
								</button>
							</div>
						</div>
					)}

					{!selectedLocation && !isMapOpen && (
						<button
							type="button"
							onClick={() => setIsMapOpen(true)}
							className="w-full rounded-xl border border-dashed border-border-strong bg-surface px-4 py-8 text-sm font-medium transition hover:border-primary hover:bg-secondary-background"
						>
							Select service location
						</button>
					)}

					{isMapOpen && (
						<div className="overflow-hidden rounded-xl border border-border">
							<div className="h-95">
								<BookingLocationMap
									onSelect={handleLocationSelect}
									center={selectedLocation}
									query={searchQuery}
									setQuery={setSearchQuery}
								/>
							</div>
						</div>
					)}

					{checkingLocation && (
						<p className="mt-3 rounded-lg bg-secondary-background px-3 py-2 text-sm text-secondary-foreground">
							Checking service availability...
						</p>
					)}

					{locationError && (
						<p className="mt-3 rounded-lg bg-error-background px-3 py-2 text-sm text-error">
							{locationError}
						</p>
					)}

					<div className="mt-8 border-t border-border pt-7">
						<div className="mb-5">
							<h2 className="text-lg font-semibold">
								Service details
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Add the details for your booking.
							</p>
						</div>

						<div className="space-y-5">
							<div>
								<label
									htmlFor="service-address"
									className="mb-2 block text-sm font-medium"
								>
									Exact address
								</label>

								<input
									id="service-address"
									{...register('exactAddress')}
									placeholder="House number, street, landmark..."
									className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
								/>

								{errors.exactAddress && (
									<p className="mt-1.5 text-sm text-error">
										{errors.exactAddress.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="requested-time"
									className="mb-2 block text-sm font-medium"
								>
									Requested date & time
								</label>

								<input
									id="requested-time"
									type="datetime-local"
									{...register('requestedTime')}
									className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
								/>

								{errors.requestedTime && (
									<p className="mt-1.5 text-sm text-error">
										{errors.requestedTime.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="notes"
									className="mb-2 block text-sm font-medium"
								>
									Notes{' '}
									<span className="font-normal text-muted-foreground">
										(optional)
									</span>
								</label>

								<textarea
									id="notes"
									{...register('notes')}
									placeholder="Anything the provider should know?"
									rows={4}
									className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
								/>
							</div>
						</div>
					</div>

					{bookingError && (
						<p className="mt-5 rounded-lg bg-error-background px-4 py-3 text-sm text-error">
							{bookingError}
						</p>
					)}

					<button
						type="submit"
						disabled={isSubmitting || checkingLocation}
						className="mt-6 h-12 w-full rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? 'Booking...' : 'Confirm Booking'}
					</button>
				</div>

				<div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-6">
					<h2 className="text-lg font-semibold">Booking summary</h2>

					<div className="mt-6 space-y-5">
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Service location
							</p>

							<p className="mt-1 text-sm">
								{geocodeAddress ||
									'Select a location to continue'}
							</p>
						</div>

						<div className="border-t border-border pt-5">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Exact address
							</p>

							<p className="mt-1 text-sm">Not entered</p>
						</div>

						<div className="border-t border-border pt-5">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Requested time
							</p>

							<p className="mt-1 text-sm">Not selected</p>
						</div>

						{selectedLocation &&
							geocodeAddress &&
							!locationError && (
								<div className="rounded-xl bg-accent-background p-4">
									<p className="text-sm font-medium text-accent-foreground">
										Location verified
									</p>

									<p className="mt-1 text-xs text-accent-foreground/80">
										This location is within the
										provider&apos;s service area.
									</p>
								</div>
							)}
					</div>
				</div>
			</div>
		</form>
	);
}
