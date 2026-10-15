'use client';

import { useAuth } from '@/context/useAuth';
import { loginSchema } from '@/schemas/auth.schema';
import { LoginData } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get('redirect');
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = async (data: LoginData) => {
		setAuthError(null);

		try {
			const loggedInUser = await login(data);
			if (redirectTo && redirectTo !== 'dashboard') {
				router.push(redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`);
			} else if (loggedInUser?.role === 'provider') {
				try {
					const res = await fetch('/api/providers/me/profile');
					const json = await res.json();
					if (json?.data?.hasProfile) {
						router.push('/bookings');
					} else {
						router.push('/profile?setup=true');
					}
				} catch {
					router.push('/profile');
				}
			} else {
				router.push('/search');
			}
		} catch (error) {
			setAuthError(
				error instanceof Error ? error.message : 'Login failed',
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Welcome back
				</h1>

				<p className="text-sm text-muted-foreground">
					Sign in to continue to your account
				</p>
			</div>

			<div className="space-y-5">
				<div className="space-y-2">
					<label
						htmlFor="email"
						className="text-sm font-medium text-foreground"
					>
						Email
					</label>

					<div className="relative flex items-center">
						<Mail
							size={18}
							className="absolute left-4 text-muted-foreground"
						/>
						<input
							id="email"
							type="email"
							{...register('email')}
							placeholder="your@example.com"
							className="h-11 w-full px-12 rounded-lg border border-border bg-background  text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
						/>
					</div>

					{errors.email && (
						<p className="text-sm text-error">
							{errors.email.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<label
						htmlFor="password"
						className="text-sm font-medium text-foreground"
					>
						Password
					</label>

					<div className="relative flex items-center">
						<Lock
							size={18}
							className="absolute left-4 text-muted-foreground"
						/>
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							{...register('password')}
							placeholder="••••••••"
							className="h-11 px-12 w-full rounded-lg border border-border bg-background text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
						/>
						<span
							className="absolute right-4 text-muted-foreground cursor-pointer"
							onClick={() => setShowPassword((prev) => !prev)}
						>
							{showPassword ? (
								<EyeOff size={20} />
							) : (
								<Eye size={20} />
							)}
						</span>
					</div>

					{errors.password && (
						<p className="text-sm text-error">
							{errors.password.message}
						</p>
					)}
				</div>
			</div>

			{authError && (
				<div className="rounded-lg border border-error/20 bg-error-background px-4 py-3">
					<p className="text-sm text-error">{authError}</p>
				</div>
			)}

			<button
				type="submit"
				disabled={isSubmitting || !isValid}
				className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? 'Logging in...' : 'Login'}
			</button>
			<div className="text-center text-sm text-muted-foreground">
				Don&apos;t have an account?{' '}
				<Link
					href="/register"
					className="font-medium text-primary hover:text-primary-hover"
				>
					Create account
				</Link>
			</div>
		</form>
	);
}
