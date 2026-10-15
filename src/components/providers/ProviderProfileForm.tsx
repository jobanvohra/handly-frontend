'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ProviderProfileFormInput } from '@/types/provider';
import { providerProfileFormSchema } from '@/schemas/provider.schema';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import { Check, MapPin, AlertCircle, Save } from 'lucide-react';

const ProviderLocationMapPicker = dynamic(
	() => import('@/components/providers/ProviderLocationMapPicker'),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-xs text-muted-foreground">
				Loading interactive map...
			</div>
		),
	},
);

type ProviderProfileFormProps = {
	initialProfile?: {
		category?: string;
		bio?: string;
		ratePerHour?: number;
		serviceRadiusKm?: number;
		address?: string;
		location?: {
			coordinates: [number, number];
		};
	} | null;
	defaultCategory?: string;
	onSaved?: () => void;
};

export default function ProviderProfileForm({
	initialProfile,
	defaultCategory,
	onSaved,
}: ProviderProfileFormProps) {
	const router = useRouter();
	const [saveSuccess, setSaveSuccess] = useState(false);

	const initialCategory =
		initialProfile?.category ||
		defaultCategory ||
		SERVICE_CATEGORIES[0].value;

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<ProviderProfileFormInput>({
		resolver: zodResolver(providerProfileFormSchema),
		defaultValues: {
			category: initialCategory,
			bio: initialProfile?.bio || '',
			ratePerHour: initialProfile?.ratePerHour ?? 250,
			serviceRadiusKm: initialProfile?.serviceRadiusKm ?? 10,
		},
		mode: 'onTouched',
	});

	const [selectedLocation, setSelectedLocation] = useState<{
		lat: number;
		lng: number;
		address: string;
	} | null>(() => {
		if (
			initialProfile?.address &&
			initialProfile?.location?.coordinates &&
			initialProfile.location.coordinates.length === 2
		) {
			return {
				lng: initialProfile.location.coordinates[0],
				lat: initialProfile.location.coordinates[1],
				address: initialProfile.address,
			};
		}
		return null;
	});

	useEffect(() => {
		if (initialProfile) {
			if (initialProfile.category) {
				setValue('category', initialProfile.category);
			}
			if (initialProfile.bio) {
				setValue('bio', initialProfile.bio);
			}
			if (initialProfile.ratePerHour !== undefined) {
				setValue('ratePerHour', initialProfile.ratePerHour);
			}
			if (initialProfile.serviceRadiusKm !== undefined) {
				setValue('serviceRadiusKm', initialProfile.serviceRadiusKm);
			}
			if (
				initialProfile.address &&
				initialProfile.location?.coordinates
			) {
				setSelectedLocation({
					lng: initialProfile.location.coordinates[0],
					lat: initialProfile.location.coordinates[1],
					address: initialProfile.address,
				});
			}
		} else if (defaultCategory) {
			setValue('category', defaultCategory);
		}
	}, [initialProfile, defaultCategory, setValue]);

	const [locationError, setLocationError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const onSubmit = async (data: ProviderProfileFormInput) => {
		setSubmitError(null);
		setSaveSuccess(false);

		if (!selectedLocation) {
			setLocationError('Please select your service base location on the map');
			return;
		}

		try {
			const res = await fetch('/api/providers', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					...data,
					address: selectedLocation.address,
					location: {
						type: 'Point',
						coordinates: [
							selectedLocation.lng,
							selectedLocation.lat,
						],
					},
				}),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.message || 'Failed to save profile');

			setSaveSuccess(true);
			if (onSaved) {
				onSaved();
			} else {
				router.push('/bookings');
			}
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : 'Failed to save profile',
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{submitError && (
				<div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error-background p-4 text-sm text-error">
					<AlertCircle size={18} className="shrink-0" />
					<span>{submitError}</span>
				</div>
			)}

			{saveSuccess && (
				<div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success-background p-4 text-sm text-success">
					<Check size={18} className="shrink-0" />
					<span>Profile saved successfully!</span>
				</div>
			)}

			<div className="space-y-4">
				<div className="space-y-1.5">
					<label
						htmlFor="category"
						className="text-sm font-medium text-foreground"
					>
						Service Category <span className="text-error">*</span>
					</label>
					<select
						id="category"
						{...register('category')}
						className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
					>
						{SERVICE_CATEGORIES.map((c) => (
							<option key={c.value} value={c.value}>
								{c.label}
							</option>
						))}
					</select>
					{errors.category && (
						<p className="text-xs text-error">{errors.category.message}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="bio"
						className="text-sm font-medium text-foreground"
					>
						About / Bio
					</label>
					<textarea
						id="bio"
						rows={4}
						{...register('bio')}
						placeholder="Describe your skills, experience, and what customers can expect..."
						className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
					/>
					{errors.bio && (
						<p className="text-xs text-error">{errors.bio.message}</p>
					)}
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<label
							htmlFor="ratePerHour"
							className="text-sm font-medium text-foreground"
						>
							Rate per hour (₹) <span className="text-error">*</span>
						</label>
						<div className="relative flex items-center">
							<span className="absolute left-3 text-sm text-muted-foreground">
								₹
							</span>
							<input
								id="ratePerHour"
								type="number"
								min="1"
								step="1"
								{...register('ratePerHour', { valueAsNumber: true })}
								className="h-11 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
							/>
						</div>
						{errors.ratePerHour && (
							<p className="text-xs text-error">
								{errors.ratePerHour.message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="serviceRadiusKm"
							className="text-sm font-medium text-foreground"
						>
							Service radius (km) <span className="text-error">*</span>
						</label>
						<div className="relative flex items-center">
							<input
								id="serviceRadiusKm"
								type="number"
								min="1"
								max="100"
								step="1"
								{...register('serviceRadiusKm', { valueAsNumber: true })}
								className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
							/>
							<span className="absolute right-3 text-sm text-muted-foreground">
								km
							</span>
						</div>
						{errors.serviceRadiusKm && (
							<p className="text-xs text-error">
								{errors.serviceRadiusKm.message}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2 pt-2">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-foreground">
							Service Base Location & Map <span className="text-error">*</span>
						</label>
						<span className="text-xs text-muted-foreground">
							Drag, click, or search to position pin
						</span>
					</div>
					<p className="text-xs text-muted-foreground">
						Position your base on the map. The purple circle visualizes your active service radius.
					</p>

					<ProviderLocationMapPicker
						selectedLocation={selectedLocation}
						serviceRadiusKm={Number(watch('serviceRadiusKm')) || 10}
						onSelect={(loc) => {
							setSelectedLocation(loc);
							setLocationError(null);
						}}
					/>

					{locationError && (
						<p className="text-xs text-error">{locationError}</p>
					)}
				</div>
			</div>

			<div className="pt-2">
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
				>
					<Save size={16} />
					{isSubmitting ? 'Saving profile...' : 'Save Profile'}
				</button>
			</div>
		</form>
	);
}
