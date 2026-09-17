import { useState } from 'react';

export default function AvailabilityToggle() {
	const [available, setAvailable] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const toggle = async () => {
		setIsLoading(true);
		await fetch(`/api/providers/me/availability`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ available: !available }),
		});
		setAvailable((prev) => !prev);
		setIsLoading(false);
	};
	return (
		<button onClick={toggle} disabled={isLoading}>
			{available
				? '🟢 Available — tap to go offline'
				: '⚪ Offline — tap to go available'}
		</button>
	);
}
