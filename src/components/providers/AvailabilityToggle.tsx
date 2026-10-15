'use client';

import { useEffect, useState } from 'react';

type AvailabilityToggleProps = {
	initialAvailable?: boolean;
	onToggle?: (isAvailable: boolean) => void;
};

export default function AvailabilityToggle({
	initialAvailable,
	onToggle,
}: AvailabilityToggleProps) {
	const [available, setAvailable] = useState(initialAvailable ?? false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (initialAvailable !== undefined) {
			setAvailable(initialAvailable);
		} else {
			// Fetch provider profile to know initial availability
			fetch('/api/providers/me/profile', { credentials: 'include' })
				.then((res) => res.json())
				.then((json) => {
					if (json?.data?.profile?.available !== undefined) {
						setAvailable(json.data.profile.available);
					}
				})
				.catch(() => {});
		}
	}, [initialAvailable]);

	const toggle = async () => {
		setIsLoading(true);
		const nextState = !available;
		try {
			const res = await fetch(`/api/providers/me/availability`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ available: nextState }),
			});
			if (res.ok) {
				setAvailable(nextState);
				if (onToggle) onToggle(nextState);
			}
		} catch (err) {
			console.error('Failed to toggle availability', err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={toggle}
			disabled={isLoading}
			aria-pressed={available}
			className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
				available
					? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
					: 'border-border bg-surface text-secondary-foreground hover:bg-surface/80 hover:text-foreground'
			} disabled:cursor-not-allowed disabled:opacity-50`}
		>
			<span
				className={`h-2.5 w-2.5 rounded-full ${
					available
						? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'
						: 'bg-zinc-400'
				}`}
			/>
			<span>
				{isLoading
					? 'Updating...'
					: available
						? 'Online • Accepting Bookings'
						: 'Offline • Tap to go online'}
			</span>
		</button>
	);
}
