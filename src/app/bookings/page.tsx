'use client';

import BookingRequests from '@/components/bookings/BookingRequests';
import AvailabilityToggle from '@/components/providers/AvailabilityToggle';
import { useAuth } from '@/context/useAuth';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function BookingsPage() {
	const { user } = useAuth();
	const [hasProfile, setHasProfile] = useState<boolean | null>(null);

	useEffect(() => {
		if (user?.role === 'provider') {
			fetch('/api/providers/me/profile', { credentials: 'include' })
				.then((res) => res.json())
				.then((json) => {
					setHasProfile(Boolean(json?.data?.hasProfile));
				})
				.catch(() => setHasProfile(true));
		}
	}, [user]);

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-6 sm:py-8">
			<div className="mx-auto max-w-5xl space-y-6">
				{/* Provider profile incomplete alert */}
				{user?.role === 'provider' && hasProfile === false && (
					<div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-start gap-3">
							<AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-600" />
							<div>
								<p className="font-semibold">Complete your profile to receive bookings</p>
								<p className="mt-0.5 text-xs text-amber-700">
									Customers cannot find your profile until you set your rates, service radius, and location.
								</p>
							</div>
						</div>
						<Link
							href="/profile?setup=true"
							className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
						>
							Complete Profile Now
							<ArrowRight size={14} />
						</Link>
					</div>
				)}

				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
							{user?.role === 'provider' ? 'Booking Requests' : 'My Bookings'}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							{user?.role === 'provider'
								? 'Review and manage incoming appointments from local customers.'
								: 'Track and manage your upcoming and past service bookings.'}
						</p>
					</div>

					{user?.role === 'provider' && (
						<div className="shrink-0">
							<AvailabilityToggle />
						</div>
					)}
				</div>

				{/* Bookings List */}
				<BookingRequests />
			</div>
		</div>
	);
}
