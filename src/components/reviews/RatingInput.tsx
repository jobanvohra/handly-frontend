'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

type RatingInputProps = {
	value: number;
	onChange: (value: number) => void;
};

const RATING_LABELS: Record<number, string> = {
	1: 'Poor experience',
	2: 'Fair / Below expectations',
	3: 'Good / Met expectations',
	4: 'Very Good / Satisfied',
	5: 'Excellent! Highly recommended',
};

export default function RatingInput({ value, onChange }: RatingInputProps) {
	const [hovered, setHovered] = useState<number | null>(null);

	const activeRating = hovered !== null ? hovered : value;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(null)}>
				{[1, 2, 3, 4, 5].map((star) => {
					const isFilled = star <= activeRating;
					return (
						<button
							key={star}
							type="button"
							onMouseEnter={() => setHovered(star)}
							onClick={() => onChange(star)}
							className="group p-1 transition-transform hover:scale-115 active:scale-90 focus:outline-none"
							aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
						>
							<Star
								size={32}
								className={`transition-colors duration-150 ${
									isFilled
										? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_4px_rgba(251,191,36,0.4)]'
										: 'fill-transparent text-border-strong group-hover:text-amber-200'
								}`}
							/>
						</button>
					);
				})}

				{activeRating > 0 && (
					<span className="ml-2 text-sm font-semibold text-foreground">
						{activeRating} / 5
					</span>
				)}
			</div>

			<p className="min-h-5 text-xs font-medium text-muted-foreground transition-opacity">
				{activeRating > 0
					? RATING_LABELS[activeRating]
					: 'Select a star rating from 1 to 5'}
			</p>
		</div>
	);
}
