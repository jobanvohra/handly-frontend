'use client';

import { useAuth } from '@/context/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BookNowButton({ providerId }: { providerId: string }) {
	const { user } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleClick = () => {
		const params = searchParams.toString();

		if (!user) {
			const redirect = `/providers/${providerId}/book?${params}`;
			router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
			return;
		}
		router.push(`/providers/${providerId}/book?${params}`);
	};

	return <button onClick={handleClick}>Book now</button>;
}
