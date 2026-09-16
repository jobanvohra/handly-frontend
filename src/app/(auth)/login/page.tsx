import LoginForm from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function page() {
	return (
		<div>
			<Suspense fallback={<p>Loading...</p>}>
				<LoginForm />
			</Suspense>
		</div>
	);
}
