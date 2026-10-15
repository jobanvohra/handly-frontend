'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReviewInput } from '@/types/review';
import { reviewSchema } from '@/schemas/review.schema';
import { useState } from 'react';
import RatingInput from '@/components/reviews/RatingInput';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ReviewForm({ bookingId }: { bookingId: string }) {
	const [rating, setRating] = useState(0);
	const [reviewError, setReviewError] = useState<string | null>(null);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<ReviewInput>({
		resolver: zodResolver(reviewSchema),
		defaultValues: {
			booking: bookingId,
			rating: 0,
			comment: '',
		},
		mode: 'onTouched',
	});

	const commentValue = watch('comment') || '';

	const onSubmit = async (data: ReviewInput) => {
		setReviewError(null);
		try {
			const response = await fetch(`/api/reviews`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || 'Review could not be submitted',
				);
			}

			router.replace('/bookings');
		} catch (error) {
			setReviewError(
				error instanceof Error
					? error.message
					: 'Review could not be submitted',
			);
		}
	};

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{reviewError && (
					<div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error-background p-4 text-sm text-error">
						<AlertCircle size={18} className="shrink-0" />
						<span>{reviewError}</span>
					</div>
				)}

				{/* Rating Section */}
				<div className="space-y-2">
					<label className="block text-sm font-semibold text-foreground">
						Your Overall Rating <span className="text-error">*</span>
					</label>

					<div className="rounded-xl border border-border/70 bg-surface/60 p-4">
						<RatingInput
							value={rating}
							onChange={(value) => {
								setRating(value);
								setValue('rating', value, {
									shouldValidate: true,
								});
							}}
						/>
					</div>

					{errors.rating && (
						<p className="text-xs text-error">{errors.rating.message}</p>
					)}
				</div>

				{/* Comment Section */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label
							htmlFor="comment"
							className="text-sm font-semibold text-foreground"
						>
							Share Your Experience (Optional)
						</label>
						<span className="text-xs text-muted-foreground">
							{commentValue.length}/500
						</span>
					</div>

					<textarea
						id="comment"
						{...register('comment')}
						rows={5}
						maxLength={500}
						placeholder="How was the service? Was the provider punctual, professional, and thorough? Your review helps other customers."
						className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
					/>

					{errors.comment && (
						<p className="text-xs text-error">{errors.comment.message}</p>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
					<Link
						href="/bookings"
						className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition hover:bg-surface"
					>
						Cancel
					</Link>

					<button
						type="submit"
						disabled={isSubmitting || rating === 0}
						className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Send size={15} />
						{isSubmitting ? 'Submitting...' : 'Submit Review'}
					</button>
				</div>
			</form>
		</div>
	);
}
