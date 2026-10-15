'use client';

import { useAuth } from '@/context/useAuth';
import CustomerProfileView from '@/components/profile/CustomerProfileView';
import ProviderProfileView from '@/components/profile/ProviderProfileView';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.push('/login');
		}
	}, [isLoading, user, router]);

	if (isLoading || !user) {
		return (
			<div className="min-h-[calc(100vh-4rem)] bg-background px-6 py-12">
				<div className="mx-auto max-w-5xl space-y-6">
					<div className="h-28 w-full animate-pulse rounded-2xl bg-surface" />
					<div className="h-64 w-full animate-pulse rounded-2xl bg-surface" />
				</div>
			</div>
		);
	}

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-background px-4 sm:px-6 py-6 sm:py-8">
			<div className="mx-auto max-w-5xl">
				{user.role === 'provider' ? (
					<ProviderProfileView />
				) : (
					<CustomerProfileView />
				)}
			</div>
		</main>
	);
}
