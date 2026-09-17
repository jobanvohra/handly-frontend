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

			router.replace('/dashboard/customer');
		} catch (error) {
			setBookingError(
				error instanceof Error ? error.message : 'Booking failed',
			);
		}
	};

	if (isLoading || !user) return null;

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label>Service location</label>

				{selectedLocation && !isMapOpen && (
					<div>
						<p>
							{selectedLocation.lat},{selectedLocation.lng}
						</p>
						<button
							type="button"
							onClick={() => {
								setLocationError(null);
								setIsMapOpen(true);
							}}
						>
							Change location
						</button>
					</div>
				)}

				{!selectedLocation && !isMapOpen && (
					<button type="button" onClick={() => setIsMapOpen(true)}>
						Select location
					</button>
				)}

				{selectedLocation && isMapOpen && (
					<BookingLocationMap
						onSelect={handleLocationSelect}
						center={selectedLocation}
						query={searchQuery}
						setQuery={setSearchQuery}
					/>
				)}

				{checkingLocation && <p>Checking service availability..</p>}

				{locationError && <p>{locationError}</p>}
			</div>
			<div>
				<label htmlFor="service-address">Service Address</label>
				<input
					id="service-address"
					{...register('exactAddress')}
					placeholder="Enter the exact address"
				/>
				{errors.exactAddress && <p>{errors.exactAddress.message}</p>}
			</div>

			<div>
				<label htmlFor="requested-time">Requested Time</label>
				<input
					id="requested-time"
					type="datetime-local"
					{...register('requestedTime')}
				/>
				{errors.requestedTime && <p>{errors.requestedTime.message}</p>}
			</div>
			<div>
				<label htmlFor="notes">Notes (optional)</label>
				<textarea id="notes" {...register('notes')} />
			</div>

			{bookingError && <p>{bookingError}</p>}
			<div>
				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Booking ...' : 'Confirm Booking'}
				</button>
			</div>
		</form>
	);
}
