'use client';

import { useAuth } from '@/context/useAuth';
import ProviderProfileForm from '@/components/providers/ProviderProfileForm';
import AvailabilityToggle from '@/components/providers/AvailabilityToggle';
import { getCategoryLabel } from '@/constants/categories';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
	Briefcase,
	Star,
	Eye,
	Calendar,
	CheckCircle2,
	AlertCircle,
	ArrowRight,
	MapPin,
	User,
	Mail,
	Save,
	Check,
} from 'lucide-react';

export default function ProviderProfileView() {
	const { user, refreshUser } = useAuth();
	const searchParams = useSearchParams();
	const isSetup = searchParams.get('setup') === 'true';
	const categoryFromQuery = searchParams.get('category') || undefined;

	const [profileData, setProfileData] = useState<any>(null);
	const [hasProfile, setHasProfile] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [reviews, setReviews] = useState<any[]>([]);
	const [avgRating, setAvgRating] = useState<number | null>(null);
	const [reviewCount, setReviewCount] = useState(0);

	// Account settings state
	const [name, setName] = useState(user?.name || '');
	const [isSavingName, setIsSavingName] = useState(false);
	const [nameSuccess, setNameSuccess] = useState(false);
	const [nameError, setNameError] = useState<string | null>(null);

	const fetchProfileAndReviews = async () => {
		try {
			setIsLoading(true);
			const res = await fetch('/api/providers/me/profile', {
				credentials: 'include',
			});
			const json = await res.json();

			if (json?.data?.hasProfile && json.data.profile) {
				setProfileData(json.data.profile);
				setHasProfile(true);
			} else {
				setProfileData(null);
				setHasProfile(false);
			}

			// Fetch reviews if user has an id
			if (user?.id) {
				const reviewsRes = await fetch(`/api/reviews/${user.id}`, {
					credentials: 'include',
				});
				const reviewsJson = await reviewsRes.json();
				if (reviewsJson?.data) {
					setReviews(Array.isArray(reviewsJson.data) ? reviewsJson.data : []);
					setAvgRating(reviewsJson.data.avgRating ?? null);
					setReviewCount(reviewsJson.data.total ?? 0);
				}
			}
		} catch (err) {
			console.error('Failed to load profile:', err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProfileAndReviews();
	}, [user?.id]);

	useEffect(() => {
		if (user?.name) setName(user.name);
	}, [user?.name]);

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

	return (
		<div className="space-y-8">
			{/* Onboarding Banner if setup mode or profile not created */}
			{(isSetup || hasProfile === false) && (
				<div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
									✓
								</span>
								<h2 className="text-lg font-bold text-foreground">
									{hasProfile
										? 'Profile Created & Active!'
										: 'Complete Your Provider Profile'}
								</h2>
							</div>
							<p className="text-sm text-secondary-foreground">
								{hasProfile
									? 'Your services are ready for local customers to discover and book.'
									: 'Please configure your service category, rates, and coverage area below to begin receiving bookings.'}
							</p>
						</div>

						{hasProfile && (
							<Link
								href="/bookings"
								className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
							>
								Go to Bookings
								<ArrowRight size={14} />
							</Link>
						)}
					</div>
				</div>
			)}

			{/* Provider Header Card */}
			<div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
				<div className="flex items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
						{user?.name?.charAt(0).toUpperCase() || 'P'}
					</div>
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="text-2xl font-bold tracking-tight text-foreground">
								{user?.name}
							</h1>
							<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
								Provider
							</span>
							{profileData?.category && (
								<span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
									{getCategoryLabel(profileData.category)}
								</span>
							)}
						</div>

						<p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
							<Mail size={14} />
							{user?.email}
						</p>

						{/* Ratings & reviews preview */}
						{reviewCount > 0 && (
							<div className="mt-2 flex items-center gap-2 text-xs text-secondary-foreground">
								<span className="flex items-center gap-1 font-bold text-amber-500">
									<Star size={13} fill="currentColor" />
									{avgRating ? avgRating.toFixed(1) : '5.0'}
								</span>
								<span>•</span>
								<span>
									{reviewCount} customer review{reviewCount > 1 ? 's' : ''}
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<AvailabilityToggle
						initialAvailable={profileData?.available}
					/>

					{user?.id && profileData && (
						<Link
							href={`/providers/${user.id}`}
							className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-surface"
						>
							<Eye size={14} />
							Public Preview
						</Link>
					)}

					<Link
						href="/bookings"
						className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
					>
						<Calendar size={14} />
						Bookings
					</Link>
				</div>
			</div>

			{/* Main Grid: Profile Form & Sidebar Info */}
			<div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
				{/* Profile Editor */}
				<div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
					<div className="mb-6 border-b border-border pb-4">
						<h2 className="text-xl font-bold tracking-tight text-foreground">
							Service Details & Coverage
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Set your services, hourly pricing, and service radius so customers can find you.
						</p>
					</div>

					<ProviderProfileForm
						initialProfile={profileData}
						defaultCategory={categoryFromQuery}
						onSaved={fetchProfileAndReviews}
					/>
				</div>

				{/* Sidebar: Account details & Reviews */}
				<div className="space-y-6">
					{/* Account Settings */}
					<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
						<h3 className="text-base font-semibold text-foreground">
							Account Details
						</h3>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Update your profile display name.
						</p>

						<form onSubmit={handleUpdateName} className="mt-4 space-y-4">
							{nameError && (
								<div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error-background p-2.5 text-xs text-error">
									<AlertCircle size={14} />
									<span>{nameError}</span>
								</div>
							)}

							{nameSuccess && (
								<div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success-background p-2.5 text-xs text-success">
									<Check size={14} />
									<span>Name updated successfully!</span>
								</div>
							)}

							<div className="space-y-1">
								<label
									htmlFor="providerName"
									className="text-xs font-medium text-foreground"
								>
									Full Name
								</label>
								<div className="relative flex items-center">
									<User
										size={14}
										className="absolute left-3 text-muted-foreground"
									/>
									<input
										id="providerName"
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="h-10 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-xs font-medium text-foreground">
									Email Address
								</label>
								<div className="relative flex items-center">
									<Mail
										size={14}
										className="absolute left-3 text-muted-foreground"
									/>
									<input
										type="email"
										value={user?.email || ''}
										disabled
										className="h-10 w-full rounded-lg border border-border bg-surface pl-8 pr-3 text-xs text-muted-foreground outline-none cursor-not-allowed"
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={isSavingName || name === user?.name}
								className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Save size={13} />
								{isSavingName ? 'Saving...' : 'Update Name'}
							</button>
						</form>
					</div>

					{/* Customer Reviews Box */}
					<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-base font-semibold text-foreground">
									Customer Reviews
								</h3>
								<p className="mt-0.5 text-xs text-muted-foreground">
									{reviewCount > 0
										? `${reviewCount} review${reviewCount > 1 ? 's' : ''} received`
										: 'No reviews yet'}
								</p>
							</div>

							{avgRating && (
								<div className="text-right">
									<p className="flex items-center gap-1 text-lg font-bold text-amber-500">
										<Star size={16} fill="currentColor" />
										{avgRating.toFixed(1)}
									</p>
								</div>
							)}
						</div>

						<div className="mt-4 space-y-3">
							{reviews.length === 0 ? (
								<div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
									Reviews from customers will appear here after bookings are completed.
								</div>
							) : (
								reviews.slice(0, 4).map((r) => (
									<div
										key={r._id}
										className="rounded-xl border border-border/80 bg-surface/50 p-3 text-xs"
									>
										<div className="flex items-center justify-between">
											<span className="font-semibold text-foreground">
												{r.customer?.name || 'Customer'}
											</span>
											<span className="text-amber-500">
												{'★'.repeat(r.rating)}
											</span>
										</div>
										{r.comment && (
											<p className="mt-1 text-muted-foreground italic">
												"{r.comment}"
											</p>
										)}
										<p className="mt-1 text-[10px] text-muted-foreground">
											{new Date(r.createdAt).toLocaleDateString()}
										</p>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
