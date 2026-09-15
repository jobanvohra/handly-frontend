'use client';

import { useAuth } from '@/context/useAuth';
import { loginSchema } from '@/schemas/auth.schema';
import { LoginData } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors, isValid },
	} = useForm<LoginData>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
		mode: 'onTouched',
	});
	const [authError, setAuthError] = useState<string | null>(null);
	const { login } = useAuth();
	const router = useRouter();

	const onSubmit = async (data: LoginData) => {
		setAuthError(null);
		try {
			await login(data);
			router.push('/dashboard');
		} catch (error) {
			setAuthError(
				error instanceof Error ? error.message : 'Login failed',
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label htmlFor="email">Email</label>
				<input
					id="email"
					{...register('email')}
					placeholder="Enter your email"
				/>
				{errors.email && <p>{errors.email.message}</p>}
			</div>

			<div>
				<label htmlFor="password">Password</label>
				<input
					id="password"
					type="password"
					{...register('password')}
					placeholder="Enter your password"
				/>
				{errors.password && <p>{errors.password.message}</p>}
			</div>

			{authError && <p>{authError}</p>}

			<div>
				<button type="submit" disabled={isSubmitting || !isValid}>
					{isSubmitting ? 'Logging in...' : 'Login'}
				</button>
			</div>
		</form>
	);
}
