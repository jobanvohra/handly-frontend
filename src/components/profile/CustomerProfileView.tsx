'use client';

import { useAuth } from '@/context/useAuth';
import { BookingResponse } from '@/types/booking';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
	User,
	Mail,
	Calendar,
	CheckCircle2,
	Clock,
	Search,
	ArrowRight,
	Save,
	Check,
	AlertCircle,
} from 'lucide-react';
import { getCategoryLabel } from '@/constants/categories';

export default function CustomerProfileView() {
	const { user, refreshUser } = useAuth();
	const [name, setName] = useState(user?.name || '');
	const [isSavingName, setIsSavingName] = useState(false);
	const [nameSuccess, setNameSuccess] = useState(false);
	const [nameError, setNameError] = useState<string | null>(null);

	const [bookings, setBookings] = useState<BookingResponse[]>([]);
	const [isLoadingBookings, setIsLoadingBookings] = useState(true);

	useEffect(() => {
		if (user?.name) {
			setName(user.name);
		}
	}, [user?.name]);

	useEffect(() => {
		fetch('/api/bookings', { credentials: 'include' })
			.then((res) => res.json())
			.then((json) => {
				setBookings(Array.isArray(json?.data) ? json.data : []);
			})
			.catch(() => {})
			.finally(() => setIsLoadingBookings(false));
	}, []);

	const handleUpdateName = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || name.trim().length < 2) {
			setNameError('Name must be at least 2 characters long');
			return;
		}

		setIsSavingName(true);
		setNameError(null);
		setNameSuccess(false);

		try {
			const res = await fetch('/api/auth/user', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ name: name.trim() }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.message || 'Failed to update name');

			setNameSuccess(true);
			await refreshUser();
			setTimeout(() => setNameSuccess(false), 3000);
		} catch (err) {
			setNameError(err instanceof Error ? err.message : 'Update failed');
		} finally {
			setIsSavingName(false);
		}
	};

	const totalBookings = bookings.length;
	const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
	const completedBookings = bookings.filter(
		(b) => b.status === 'completed',
	).length;
	const recentBookings = bookings.slice(0, 3);

	return (
		<div className="space-y-8">
			{/* Profile Header */}
			<div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
				<div className="flex items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
						{user?.name?.charAt(0).toUpperCase() || 'C'}
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold tracking-tight text-foreground">
								{user?.name}
							</h1>
							<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
								Customer
							</span>
						</div>
						<p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
							<Mail size={14} />
							{user?.email}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Link
						href="/search"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
					>
						<Search size={16} />
						Find Services
					</Link>
					<Link
						href="/bookings"
						className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
					>
						View Bookings
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>

			{/* Booking Stats Cards */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Total Bookings
					</p>
					<p className="mt-2 text-3xl font-bold text-foreground">
						{totalBookings}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						All time service requests
					</p>
				</div>

				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Pending Confirmation
					</p>
					<p className="mt-2 text-3xl font-bold text-amber-600">
						{pendingBookings}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Awaiting provider response
					</p>
				</div>

				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Completed Services
					</p>
					<p className="mt-2 text-3xl font-bold text-emerald-600">
						{completedBookings}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Successfully finished jobs
					</p>
				</div>
			</div>

			{/* Main Grid: Account settings & Recent Bookings */}
			<div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
				{/* Account Information Form */}
				<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-foreground">
						Account Settings
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage your personal contact details.
					</p>

					<form onSubmit={handleUpdateName} className="mt-6 space-y-4">
						{nameError && (
							<div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error-background p-3 text-xs text-error">
								<AlertCircle size={15} />
								<span>{nameError}</span>
							</div>
						)}

						{nameSuccess && (
							<div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success-background p-3 text-xs text-success">
								<Check size={15} />
								<span>Name updated successfully!</span>
							</div>
						)}

						<div className="space-y-1.5">
							<label
								htmlFor="customerName"
								className="text-sm font-medium text-foreground"
							>
								Full Name
							</label>
							<div className="relative flex items-center">
								<User
									size={16}
									className="absolute left-3 text-muted-foreground"
								/>
								<input
									id="customerName"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="text-sm font-medium text-foreground">
								Email Address
							</label>
							<div className="relative flex items-center">
								<Mail
									size={16}
									className="absolute left-3 text-muted-foreground"
								/>
								<input
									type="email"
									value={user?.email || ''}
									disabled
									className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Email address is linked to your login credentials.
							</p>
						</div>

						<div className="pt-2">
							<button
								type="submit"
								disabled={isSavingName || name === user?.name}
								className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Save size={15} />
								{isSavingName ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</form>
				</div>

				{/* Recent Bookings Activity */}
				<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-lg font-semibold text-foreground">
								Recent Bookings
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Your latest service requests.
							</p>
						</div>
						<Link
							href="/bookings"
							className="text-xs font-semibold text-primary hover:text-primary-hover"
						>
							View All ({totalBookings})
						</Link>
					</div>

					<div className="mt-6 space-y-3">
						{isLoadingBookings ? (
							<div className="space-y-3">
								<div className="h-16 animate-pulse rounded-xl bg-surface" />
								<div className="h-16 animate-pulse rounded-xl bg-surface" />
							</div>
						) : recentBookings.length === 0 ? (
							<div className="rounded-xl border border-dashed border-border py-8 text-center">
								<p className="text-sm text-muted-foreground">
									No bookings yet
								</p>
								<Link
									href="/search"
									className="mt-2 inline-block text-xs font-semibold text-primary"
								>
									Find a service provider →
								</Link>
							</div>
						) : (
							recentBookings.map((b) => (
								<Link
									key={b._id}
									href="/bookings"
									className="block rounded-xl border border-border bg-surface/50 p-3.5 transition hover:bg-surface hover:border-primary/30"
								>
									<div className="flex items-center justify-between">
										<p className="text-sm font-semibold text-foreground">
											{getCategoryLabel(b.provider?.category || 'Service')}
										</p>
										<span className="text-xs capitalize text-muted-foreground">
											{b.status}
										</span>
									</div>
									<p className="mt-1 text-xs text-secondary-foreground">
										Provider: {b.provider?.user?.name || 'Assigned provider'}
									</p>
									<p className="mt-1 text-[11px] text-muted-foreground">
										{new Date(b.requestedTime).toLocaleDateString(undefined, {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										})}
									</p>
								</Link>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
