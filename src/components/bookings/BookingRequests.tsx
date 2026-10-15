'use client';

import { useAuth } from '@/context/useAuth';
import { BookingResponse, BookingStatus } from '@/types/booking';
import { getCategoryLabel } from '@/constants/categories';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
	Calendar,
	Clock,
	MapPin,
	Search,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	RotateCcw,
	Star,
	User as UserIcon,
	FileText,
	ArrowUpDown,
	Filter,
} from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'accepted' | 'completed' | 'cancelled' | 'expired';

export default function BookingRequests() {
	const [bookings, setBookings] = useState<BookingResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const [activeTab, setActiveTab] = useState<FilterTab>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
	const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-desc');

	const { user } = useAuth();
	const router = useRouter();
	const role = user?.role;

	const fetchBookings = async () => {
		try {
			setIsLoading(true);
			const response = await fetch('/api/bookings', {
				credentials: 'include',
			});
			if (!response.ok) {
				throw new Error('Failed to fetch bookings');
			}

			const { data } = await response.json();
			setBookings(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error('Failed to fetch Bookings:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBookings();
	}, []);

	const handleAction = async (
		id: string,
		action: 'accept' | 'decline' | 'complete' | 'cancel',
	) => {
		setActionError(null);
		setActionLoadingId(`${id}-${action}`);
		try {
			const res = await fetch(`/api/bookings/${id}/${action}`, {
				method: 'PATCH',
				credentials: 'include',
			});
			const json = await res.json();
			if (!res.ok) {
				throw new Error(json.message || `Failed to ${action} booking`);
			}
			setBookings((prev) =>
				prev.map((b) => (b._id === id ? json.data : b)),
			);
		} catch (err) {
			setActionError(
				err instanceof Error ? err.message : `Failed to ${action} booking`,
			);
		} finally {
			setActionLoadingId(null);
		}
	};

	const counts = useMemo(() => {
		const res: Record<FilterTab, number> = {
			all: bookings.length,
			pending: 0,
			accepted: 0,
			completed: 0,
			cancelled: 0,
			expired: 0,
		};
		for (const b of bookings) {
			if (b.status in res) {
				res[b.status as FilterTab]++;
			}
		}
		return res;
	}, [bookings]);

	const filteredBookings = useMemo(() => {
		const now = new Date().getTime();

		return bookings
			.filter((b) => {
				if (activeTab !== 'all' && b.status !== activeTab) {
					return false;
				}

				const bookingTime = new Date(b.requestedTime).getTime();
				if (timeFilter === 'upcoming' && bookingTime < now) {
					return false;
				}
				if (timeFilter === 'past' && bookingTime >= now) {
					return false;
				}

				if (searchQuery.trim()) {
					const q = searchQuery.toLowerCase();
					const providerName = b.provider?.user?.name?.toLowerCase() || '';
					const customerName = b.customer?.name?.toLowerCase() || '';
					const category = b.provider?.category?.toLowerCase() || '';
					const address = b.exactAddress?.toLowerCase() || '';
					const notes = b.notes?.toLowerCase() || '';

					return (
						providerName.includes(q) ||
						customerName.includes(q) ||
						category.includes(q) ||
						address.includes(q) ||
						notes.includes(q)
					);
				}

				return true;
			})
			.sort((a, b) => {
				const timeA = new Date(a.requestedTime).getTime();
				const timeB = new Date(b.requestedTime).getTime();
				if (sortBy === 'date-asc') {
					return timeA - timeB;
				}
				return timeB - timeA;
			});
	}, [bookings, activeTab, timeFilter, searchQuery, sortBy]);

	const getStatusBadge = (status: BookingStatus) => {
		switch (status) {
			case 'accepted':
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
						<CheckCircle2 size={13} />
						Confirmed
					</span>
				);
			case 'pending':
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
						<Clock size={13} />
						Pending
					</span>
				);
			case 'completed':
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
						<CheckCircle2 size={13} />
						Completed
					</span>
				);
			case 'declined':
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
						<XCircle size={13} />
						Declined
					</span>
				);
			case 'cancelled':
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
						<XCircle size={13} />
						Cancelled
					</span>
				);
			case 'expired':
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
						<AlertTriangle size={13} />
						Expired
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
						{status}
					</span>
				);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4 py-8">
				<div className="h-10 w-full animate-pulse rounded-xl bg-surface" />
				<div className="h-40 w-full animate-pulse rounded-2xl bg-surface" />
				<div className="h-40 w-full animate-pulse rounded-2xl bg-surface" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{actionError && (
				<div className="flex items-center justify-between rounded-xl border border-error/20 bg-error-background p-4 text-sm text-error">
					<div className="flex items-center gap-2">
						<AlertTriangle size={18} className="shrink-0" />
						<span>{actionError}</span>
					</div>
					<button
						type="button"
						onClick={() => setActionError(null)}
						className="text-xs font-medium underline"
					>
						Dismiss
					</button>
				</div>
			)}

			<div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
				<div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
					{(
						[
							{ key: 'all', label: 'All' },
							{ key: 'pending', label: 'Pending' },
							{ key: 'accepted', label: 'Confirmed' },
							{ key: 'completed', label: 'Completed' },
							{ key: 'expired', label: 'Expired' },
							{ key: 'cancelled', label: 'Cancelled' },
						] as const
					).map((tab) => {
						const count = counts[tab.key] || 0;
						const isActive = activeTab === tab.key;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => setActiveTab(tab.key)}
								className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${isActive
										? 'bg-primary text-primary-foreground shadow-sm'
										: 'bg-surface text-secondary-foreground hover:bg-surface/80 hover:text-foreground'
									}`}
							>
								<span>{tab.label}</span>
								<span
									className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive
											? 'bg-white/20 text-primary-foreground'
											: 'bg-border text-muted-foreground'
										}`}
								>
									{count}
								</span>
							</button>
						);
					})}
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative flex-1">
						<Search
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder={
								role === 'provider'
									? 'Search customer, address, notes...'
									: 'Search provider, category, address...'
							}
							className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<div className="flex items-center gap-1.5">
							<Filter size={14} className="text-muted-foreground" />
							<select
								value={timeFilter}
								onChange={(e) =>
									setTimeFilter(
										e.target.value as 'all' | 'upcoming' | 'past',
									)
								}
								className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-primary"
							>
								<option value="all">All Dates</option>
								<option value="upcoming">Upcoming Appointments</option>
								<option value="past">Past Appointments</option>
							</select>
						</div>

						<div className="flex items-center gap-1.5">
							<ArrowUpDown size={14} className="text-muted-foreground" />
							<select
								value={sortBy}
								onChange={(e) =>
									setSortBy(
										e.target.value as 'date-asc' | 'date-desc',
									)
								}
								className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-primary"
							>
								<option value="date-desc">Newest First</option>
								<option value="date-asc">Oldest / Nearest First</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{filteredBookings.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
						<Calendar size={22} />
					</div>
					<p className="mt-3 text-base font-semibold text-foreground">
						No bookings found
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{searchQuery || activeTab !== 'all' || timeFilter !== 'all'
							? 'No bookings match your current filter criteria.'
							: role === 'provider'
								? 'You have not received any service booking requests yet.'
								: 'Find trusted local professionals and schedule your first service.'}
					</p>

					{role === 'customer' && (
						<button
							type="button"
							onClick={() => router.push('/search')}
							className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
						>
							Find a Service Provider
						</button>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{filteredBookings.map((b) => {
						const dateObj = new Date(b.requestedTime);
						const isPast = dateObj.getTime() < Date.now();

						return (
							<div
								key={b._id}
								className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
							>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div className="space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="text-base font-semibold text-foreground">
												{getCategoryLabel(
													b.provider?.category || 'Service',
												)}
											</span>
											{getStatusBadge(b.status)}
										</div>

										<p className="flex items-center gap-1.5 text-sm text-secondary-foreground">
											<UserIcon size={15} className="text-muted-foreground" />
											<span className="text-muted-foreground">
												{role === 'provider' ? 'Customer:' : 'Provider:'}
											</span>
											<span className="font-medium text-foreground">
												{role === 'provider'
													? b.customer?.name || 'Customer'
													: b.provider?.user?.name || 'Provider'}
											</span>
										</p>
									</div>
									<div className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-3 py-2 text-xs text-foreground sm:text-right">
										<Calendar size={14} className="text-primary" />
										<span className="font-semibold">
											{dateObj.toLocaleDateString(undefined, {
												weekday: 'short',
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</span>
										<span className="text-muted-foreground">•</span>
										<span className="font-medium text-secondary-foreground">
											{dateObj.toLocaleTimeString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</div>
								<div className="mt-4 space-y-2 border-t border-border pt-4 text-xs sm:text-sm">
									<div className="flex items-start gap-2 text-secondary-foreground">
										<MapPin
											size={16}
											className="mt-0.5 shrink-0 text-primary"
										/>
										<div>
											<span className="font-medium text-foreground">
												Service Address:
											</span>{' '}
											<span>{b.exactAddress}</span>
										</div>
									</div>

									{b.notes && (
										<div className="flex items-start gap-2 text-secondary-foreground">
											<FileText
												size={16}
												className="mt-0.5 shrink-0 text-muted-foreground"
											/>
											<div>
												<span className="font-medium text-foreground">
													Notes:
												</span>{' '}
												<span className="italic">"{b.notes}"</span>
											</div>
										</div>
									)}
									{b.status === 'expired' && (
										<div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800">
											<p className="font-semibold flex items-center gap-1.5">
												<AlertTriangle size={14} />
												Request Expired
											</p>
											<p className="mt-0.5 text-amber-700">
												{role === 'provider'
													? 'This request was not accepted or declined before the requested appointment time.'
													: 'The provider did not respond to this booking request before the scheduled time.'}
											</p>
										</div>
									)}
								</div>

								<div className="mt-5 flex flex-wrap items-center gap-2.5 pt-1">
									{role === 'provider' && b.status === 'pending' && (
										<>
											<button
												type="button"
												disabled={Boolean(actionLoadingId)}
												onClick={() =>
													handleAction(b._id, 'accept')
												}
												className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
											>
												{actionLoadingId === `${b._id}-accept`
													? 'Accepting...'
													: 'Accept Booking'}
											</button>

											<button
												type="button"
												disabled={Boolean(actionLoadingId)}
												onClick={() =>
													handleAction(b._id, 'decline')
												}
												className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
											>
												{actionLoadingId === `${b._id}-decline`
													? 'Declining...'
													: 'Decline'}
											</button>
										</>
									)}

									{role === 'provider' && b.status === 'accepted' && (
										<button
											type="button"
											disabled={Boolean(actionLoadingId)}
											onClick={() =>
												handleAction(b._id, 'complete')
											}
											className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
										>
											{actionLoadingId === `${b._id}-complete`
												? 'Updating...'
												: 'Mark as Completed'}
										</button>
									)}

									{role === 'customer' &&
										(b.status === 'pending' || b.status === 'accepted') && (
											<button
												type="button"
												disabled={Boolean(actionLoadingId)}
												onClick={() =>
													handleAction(b._id, 'cancel')
												}
												className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-surface disabled:opacity-50"
											>
												{actionLoadingId === `${b._id}-cancel`
													? 'Cancelling...'
													: 'Cancel Booking'}
											</button>
										)}

									{role === 'customer' && b.status === 'completed' && (
										<button
											type="button"
											onClick={() =>
												router.push(`/bookings/${b._id}/review`)
											}
											className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
										>
											<Star size={14} />
											Leave a Review
										</button>
									)}

									{role === 'customer' &&
										(b.status === 'expired' || b.status === 'declined') && (
											<button
												type="button"
												onClick={() => router.push('/search')}
												className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-surface"
											>
												<RotateCcw size={13} />
												Find Another Provider
											</button>
										)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
