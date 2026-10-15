import BookNowButton from '@/components/providers/BookNowButton';
import { getCategoryLabel } from '@/constants/categories';
import Link from 'next/link';

export default async function ProviderProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const [providerRes, reviewsRes] = await Promise.all([
		fetch(`${process.env.SERVER_URL}/api/providers/${id}`, {
			next: { revalidate: 300 },
		}),
		fetch(`${process.env.SERVER_URL}/api/reviews/${id}`, {
			next: { revalidate: 300 },
		}),
	]);

	if (!providerRes.ok) {
		throw new Error('Failed to fetch provider');
	}

	if (!reviewsRes.ok) {
		throw new Error('Failed to fetch reviews');
	}

	const { data: provider } = await providerRes.json();
	const { data: reviewData } = await reviewsRes.json();

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-background">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
				<Link
					href="/search"
					className="text-sm text-muted-foreground transition hover:text-foreground inline-flex items-center gap-1"
				>
					← Back to search
				</Link>

				<div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
					<section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-primary">
									{getCategoryLabel(provider.category)}
								</p>

								<h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
									{provider.user.name}
								</h1>

								<div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
									<span>
										★ {reviewData.avgRating ?? 'New'}
									</span>

									<span>•</span>

									<span>
										{reviewData.total}{' '}
										{reviewData.total === 1
											? 'review'
											: 'reviews'}
									</span>
								</div>
							</div>

							<span
								className={`rounded-full px-3 py-1.5 text-xs font-medium ${
									provider.available
										? 'bg-success-background text-success'
										: 'bg-surface text-muted-foreground'
								}`}
							>
								{provider.available
									? 'Available'
									: 'Unavailable'}
							</span>
						</div>

						<div className="my-6 h-px bg-border" />

						<div>
							<h2 className="text-lg font-semibold text-foreground">
								About
							</h2>

							<p className="mt-2 leading-7 text-muted-foreground">
								{provider.bio || 'No description available.'}
							</p>
						</div>

						<div className="mt-8 grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl bg-surface p-4">
								<p className="text-sm text-muted-foreground">
									Rate
								</p>

								<p className="mt-1 text-xl font-semibold text-foreground">
									₹{provider.ratePerHour}
									<span className="text-sm font-normal text-muted-foreground">
										/hr
									</span>
								</p>
							</div>

							<div className="rounded-xl bg-surface p-4">
								<p className="text-sm text-muted-foreground">
									Service area
								</p>

								<p className="mt-1 text-xl font-semibold text-foreground">
									{provider.serviceRadiusKm} km
								</p>
							</div>
						</div>
					</section>

					<section className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-foreground">
							Book this service
						</h2>

						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Choose a time and provide your service location to
							request a booking.
						</p>

						<div className="my-6 h-px bg-border" />

						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Hourly rate
							</span>

							<span className="font-semibold text-foreground">
								₹{provider.ratePerHour}/hr
							</span>
						</div>

						<div className="mt-5">
							<BookNowButton providerId={id} />
						</div>
					</section>
				</div>

				<section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold text-foreground">
								Reviews
							</h2>

							<p className="mt-1 text-sm text-muted-foreground">
								{reviewData.total}{' '}
								{reviewData.total === 1
									? 'Customer review'
									: 'Customer reviews'}
							</p>
						</div>

						{reviewData.total > 0 && (
							<div className="text-right">
								<p className="text-2xl font-semibold text-foreground">
									★ {reviewData.avgRating}
								</p>

								<p className="text-sm text-muted-foreground">
									Average rating
								</p>
							</div>
						)}
					</div>

					<div className="my-6 h-px bg-border" />

					{reviewData.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No reviews yet.
						</p>
					) : (
						<div className="space-y-4">
							{reviewData.map(
								(review: {
									_id: string;
									rating: number;
									comment?: string;
									customer: {
										name: string;
									};
									createdAt: string;
								}) => (
									<div
										key={review._id}
										className="rounded-xl bg-surface p-4"
									>
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="font-medium text-foreground">
													{review.customer.name}
												</p>

												<p className="mt-1 text-sm tracking-wide text-primary">
													{'★'.repeat(review.rating)}
													<span className="text-border">
														{'★'.repeat(
															5 - review.rating,
														)}
													</span>
												</p>
											</div>

											<p className="text-xs text-muted-foreground">
												{new Date(
													review.createdAt,
												).toLocaleDateString()}
											</p>
										</div>

										{review.comment && (
											<p className="mt-3 text-sm leading-6 text-muted-foreground">
												{review.comment}
											</p>
										)}
									</div>
								),
							)}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
