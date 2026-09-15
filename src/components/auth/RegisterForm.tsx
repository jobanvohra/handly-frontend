'use client';

import { useAuth } from '@/context/useAuth';
import { registerSchema } from '@/schemas/auth.schema';
import { RegisterData } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors, isValid },
	} = useForm<RegisterData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
			name: '',
			role: 'customer',
		},
		mode: 'onTouched',
	});
	const [authError, setAuthError] = useState<string | null>(null);
	const { register: registerUser } = useAuth();
	const router = useRouter();

	const onSubmit = async (data: RegisterData) => {
		setAuthError(null);
		try {
			await registerUser(data);
			router.push('/dashboard');
		} catch (error) {
			setAuthError(
				error instanceof Error ? error.message : 'Registration failed',
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label htmlFor="name">Name</label>
				<input
					id="name"
					{...register('name')}
					placeholder="Enter your name"
				/>
				{errors.name && <p>{errors.name.message}</p>}
			</div>

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

			<div>
				<label htmlFor="role">I am a</label>
				<select id="role" {...register('role')}>
					<option value="customer">Customer</option>
					<option value="provider">Provider</option>
				</select>
				{errors.role && <p>{errors.role.message}</p>}
			</div>

			{authError && <p>{authError}</p>}

			<div>
				<button type="submit" disabled={isSubmitting || !isValid}>
					{isSubmitting ? 'Registering...' : 'Register'}
				</button>
			</div>
		</form>
	);
}
