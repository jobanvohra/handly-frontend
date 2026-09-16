'use client';

import { useAuth } from '@/context/useAuth';
import { useRouter } from 'next/navigation';

export default function BookNowButton({ providerId }: { providerId: string }) {
	const { user } = useAuth();
	const router = useRouter();

	const handleClick = () => {
		if (!user) {
			router.push(`/login?redirect=/providers/${providerId}`);
			return;
		}
		router.push(`/providers/${providerId}/book`);
	};

	return <button onClick={handleClick}>Book now</button>;
}
