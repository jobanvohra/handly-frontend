import ReviewForm from '@/components/reviews/ReviewForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ReviewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-background px-6 py-8">
			<div className="mx-auto max-w-2xl space-y-6">
				<Link
					href="/bookings"
					className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
				>
					<ArrowLeft size={16} />
					Back to bookings
				</Link>

				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
						Write a Review
					</h1>
					<p className="text-sm text-muted-foreground">
						Share feedback about your completed service experience.
					</p>
				</div>

				<ReviewForm bookingId={id} />
			</div>
		</main>
	);
}
