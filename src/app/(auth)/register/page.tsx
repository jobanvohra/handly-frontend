import RegisterForm from '@/components/auth/RegisterForm';
import { Suspense } from 'react';

export default function page() {
	return (
		<main className="min-h-screen bg-background">
			<div className="flex min-h-screen items-center justify-center px-6 py-10">
				<div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
					<Suspense fallback={<p>Loading...</p>}>
						<RegisterForm />
					</Suspense>
				</div>
			</div>
		</main>
	);
}
