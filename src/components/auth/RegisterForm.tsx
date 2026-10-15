'use client';

import { useAuth } from '@/context/useAuth';
import { registerSchema } from '@/schemas/auth.schema';
import { RegisterData } from '@/types/user';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	BriefcaseBusiness,
	Check,
	Eye,
	EyeOff,
	Lock,
	Mail,
	User,
	UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
	const {
		register,
		handleSubmit,
		watch,
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

	const selectedRole = watch('role');

	const [authError, setAuthError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [providerCategory, setProviderCategory] = useState<string>('plumber');

	const { register: registerUser } = useAuth();
	const router = useRouter();

	const onSubmit = async (data: RegisterData) => {
		setAuthError(null);

		try {
			await registerUser(data);
			if (data.role === 'provider') {
				router.push(
					`/profile?setup=true&category=${encodeURIComponent(providerCategory)}`,
				);
			} else {
				router.push('/search');
			}
		} catch (error) {
			setAuthError(
				error instanceof Error ? error.message : 'Registration failed',
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 ">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Create an account
				</h1>

				<p className="text-sm text-muted-foreground">
					Get started with your account
				</p>
			</div>

			<div className="space-y-5">
				<div className="space-y-2">
					<label
						htmlFor="name"
						className="text-sm font-medium text-foreground"
					>
						Name
					</label>

					<div className="relative flex items-center">
						<User
							size={18}
							className="absolute left-4 text-muted-foreground"
						/>

						<input
							id="name"
							type="text"
							{...register('name')}
							placeholder="Enter your name"
							className="h-11 w-full rounded-lg border border-border bg-background px-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
						/>
					</div>

					{errors.name && (
						<p className="text-sm text-error">
							{errors.name.message}
						</p>
					)}
				</div>

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
							className="h-11 w-full rounded-lg border border-border bg-background px-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
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
							className="h-11 w-full rounded-lg border border-border bg-background px-12 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
						/>

						<button
							type="button"
							aria-label={
								showPassword ? 'Hide password' : 'Show password'
							}
							className="absolute right-3 flex items-center justify-center p-1 text-muted-foreground hover:text-foreground"
							onClick={() => setShowPassword((prev) => !prev)}
						>
							{showPassword ? (
								<EyeOff size={20} />
							) : (
								<Eye size={20} />
							)}
						</button>
					</div>

					{errors.password && (
						<p className="text-sm text-error">
							{errors.password.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<label
						htmlFor="confirmPassword"
						className="text-sm font-medium text-foreground"
					>
						Confirm password
					</label>

					<div className="relative flex items-center">
						<Lock
							size={18}
							className="absolute left-4 text-muted-foreground"
						/>

						<input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							{...register('confirmPassword')}
							placeholder="••••••••"
							className="h-11 w-full rounded-lg border border-border bg-background px-12 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
						/>

						<button
							type="button"
							aria-label={
								showConfirmPassword
									? 'Hide password'
									: 'Show password'
							}
							className="absolute right-3 flex items-center justify-center p-1 text-muted-foreground hover:text-foreground"
							onClick={() =>
								setShowConfirmPassword((prev) => !prev)
							}
						>
							{showConfirmPassword ? (
								<EyeOff size={20} />
							) : (
								<Eye size={20} />
							)}
						</button>
					</div>

					{errors.confirmPassword && (
						<p className="text-sm text-error">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<div className="space-y-3">
					<div>
						<p className="text-sm font-medium text-foreground">
							I am a
						</p>

						<p className="mt-1 text-sm text-muted-foreground">
							Choose how you want to use the platform
						</p>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<label
							className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
								selectedRole === 'customer'
									? 'border-primary bg-primary/5 shadow-sm'
									: 'border-border bg-background hover:border-primary/40 hover:bg-surface'
							}`}
						>
							<input
								type="radio"
								value="customer"
								{...register('role')}
								className="sr-only"
							/>

							<div className="space-y-3">
								<div
									className={`flex h-9 w-9 items-center justify-center rounded-lg ${
										selectedRole === 'customer'
											? 'bg-primary text-primary-foreground'
											: 'bg-surface text-muted-foreground'
									}`}
								>
									<UserRound size={18} />
								</div>

								<div className="space-y-1">
									<p className="text-sm font-semibold text-foreground">
										Customer
									</p>

									<p className="text-xs leading-5 text-muted-foreground">
										Find local professionals and book
										services.
									</p>
								</div>
							</div>

							{selectedRole === 'customer' && (
								<div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<Check size={13} strokeWidth={3} />
								</div>
							)}
						</label>

						<label
							className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
								selectedRole === 'provider'
									? 'border-primary bg-primary/5 shadow-sm'
									: 'border-border bg-background hover:border-primary/40 hover:bg-surface'
							}`}
						>
							<input
								type="radio"
								value="provider"
								{...register('role')}
								className="sr-only"
							/>

							<div className="space-y-3">
								<div
									className={`flex h-9 w-9 items-center justify-center rounded-lg ${
										selectedRole === 'provider'
											? 'bg-primary text-primary-foreground'
											: 'bg-surface text-muted-foreground'
									}`}
								>
									<BriefcaseBusiness size={18} />
								</div>

								<div className="space-y-1">
									<p className="text-sm font-semibold text-foreground">
										Provider
									</p>

									<p className="text-xs leading-5 text-muted-foreground">
										Offer your services and manage bookings.
									</p>
								</div>
							</div>

							{selectedRole === 'provider' && (
								<div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<Check size={13} strokeWidth={3} />
								</div>
							)}
						</label>
					</div>

					{errors.role && (
						<p className="text-sm text-error">
							{errors.role.message}
						</p>
					)}
				</div>

				{selectedRole === 'provider' && (
					<div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 transition animate-in fade-in-50">
						<label
							htmlFor="providerCategory"
							className="text-sm font-medium text-foreground"
						>
							Service Category
						</label>
						<p className="text-xs text-muted-foreground">
							Choose your primary service trade. You will complete your full profile next.
						</p>
						<select
							id="providerCategory"
							value={providerCategory}
							onChange={(e) => setProviderCategory(e.target.value)}
							className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
						>
							{SERVICE_CATEGORIES.map((c) => (
								<option key={c.value} value={c.value}>
									{c.label}
								</option>
							))}
						</select>
					</div>
				)}
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
				{isSubmitting ? 'Creating account...' : 'Create account'}
			</button>

			<div className="text-center text-sm text-muted-foreground">
				Already have an account?{' '}
				<Link
					href="/login"
					className="font-medium text-primary hover:text-primary-hover"
				>
					Log in
				</Link>
			</div>
		</form>
	);
}
