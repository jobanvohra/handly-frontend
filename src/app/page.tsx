'use client';

import { SERVICE_CATEGORIES } from '@/constants/categories';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
	Search,
	MapPin,
	ShieldCheck,
	Clock,
	CheckCircle2,
	Star,
	ArrowRight,
	Wrench,
	Zap,
	Sparkles,
	Hammer,
	Paintbrush,
	Flame,
	GraduationCap,
	Camera,
	Trees,
	KeyRound,
	Briefcase,
	Users,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	plumber: <Wrench size={22} className="text-primary" />,
	electrician: <Zap size={22} className="text-amber-500" />,
	cleaner: <Sparkles size={22} className="text-emerald-500" />,
	carpenter: <Hammer size={22} className="text-amber-700" />,
	painter: <Paintbrush size={22} className="text-rose-500" />,
	'appliance-repair': <Wrench size={22} className="text-indigo-500" />,
	'pest-control': <ShieldCheck size={22} className="text-teal-600" />,
	hvac: <Flame size={22} className="text-sky-500" />,
	gardener: <Trees size={22} className="text-emerald-600" />,
	tutor: <GraduationCap size={22} className="text-blue-500" />,
	photographer: <Camera size={22} className="text-purple-500" />,
	locksmith: <KeyRound size={22} className="text-amber-600" />,
};

export default function Home() {
	const router = useRouter();
	const [selectedCategory, setSelectedCategory] = useState('');

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedCategory) {
			router.push(`/search?category=${encodeURIComponent(selectedCategory)}`);
		} else {
			router.push('/search');
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card via-background to-background px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
				<div className="mx-auto max-w-5xl text-center">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
						<span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
						On-Demand Local Services
					</div>

					{/* Title */}
					<h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
						Find & Book Trusted Local Pros{' '}
						<span className="text-primary block sm:inline">in Minutes</span>
					</h1>

					{/* Subtitle */}
					<p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
						From emergency plumbing to deep home cleaning and tutoring.
						Connect with verified service providers in your neighborhood with upfront rates.
					</p>

					{/* Search Box */}
					<form
						onSubmit={handleSearch}
						className="mx-auto mt-8 flex max-w-2xl flex-col gap-2.5 rounded-2xl border border-border bg-card p-2.5 shadow-lg sm:flex-row sm:items-center sm:gap-3 sm:p-3"
					>
						<div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
							<Search size={18} className="shrink-0 text-muted-foreground" />
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="h-10 w-full bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
							>
								<option value="">What service do you need?</option>
								{SERVICE_CATEGORIES.map((c) => (
									<option key={c.value} value={c.value}>
										{c.label}
									</option>
								))}
							</select>
						</div>

						<button
							type="submit"
							className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover shadow-sm"
						>
							<Search size={16} />
							Find Specialists
						</button>
					</form>

					{/* Trust highlights */}
					<div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground sm:gap-8 sm:text-sm">
						<div className="flex items-center gap-2">
							<ShieldCheck size={16} className="text-emerald-500" />
							<span>Verified Providers</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock size={16} className="text-primary" />
							<span>Instant Booking</span>
						</div>
						<div className="flex items-center gap-2">
							<Star size={16} className="text-amber-500" />
							<span>Real Customer Reviews</span>
						</div>
					</div>
				</div>
			</section>

			{/* Service Categories Grid */}
			<section className="px-6 py-14 sm:py-20">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
								Popular Service Categories
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Browse specialized services available in your area.
							</p>
						</div>
						<Link
							href="/search"
							className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
						>
							Explore all services
							<ArrowRight size={15} />
						</Link>
					</div>

					<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
						{SERVICE_CATEGORIES.map((category) => (
							<Link
								key={category.value}
								href={`/search?category=${category.value}`}
								className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
							>
								<div className="flex items-center justify-between">
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface group-hover:bg-primary/10 transition">
										{CATEGORY_ICONS[category.value] || (
											<Wrench size={22} className="text-primary" />
										)}
									</div>
									<ArrowRight
										size={16}
										className="text-muted-foreground opacity-0 transition group-hover:opacity-100 group-hover:text-primary"
									/>
								</div>

								<div className="mt-4">
									<h3 className="font-semibold text-foreground group-hover:text-primary transition">
										{category.label}
									</h3>
									<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
										{category.description}
									</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="border-t border-border bg-surface/50 px-6 py-14 sm:py-20">
				<div className="mx-auto max-w-6xl">
					<div className="text-center">
						<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
							How Handly Works
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Simple, transparent, and direct service booking from start to finish.
						</p>
					</div>

					<div className="mt-10 grid gap-6 sm:grid-cols-3">
						<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
								1
							</div>
							<h3 className="mt-4 text-base font-semibold text-foreground">
								Search by Location & Trade
							</h3>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Find verified specialists within your radius. Review transparent hourly rates, ratings, and live availability.
							</p>
						</div>

						<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
								2
							</div>
							<h3 className="mt-4 text-base font-semibold text-foreground">
								Request an Appointment
							</h3>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Pick your preferred appointment slot and provide your address. The provider reviews and confirms the job.
							</p>
						</div>

						<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
								3
							</div>
							<h3 className="mt-4 text-base font-semibold text-foreground">
								Service Done & Verified
							</h3>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Get your job completed professionally. Leave an honest star review and feedback to help your neighborhood.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Provider Banner CTA */}
			<section className="px-6 py-12 sm:py-16">
				<div className="mx-auto max-w-5xl rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] via-surface to-card p-8 sm:p-12 shadow-sm">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-2">
							<div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
								<Briefcase size={14} />
								For Service Professionals
							</div>
							<h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
								Grow Your Service Business with Handly
							</h2>
							<p className="max-w-xl text-sm leading-6 text-muted-foreground">
								Set your hourly rate, choose your exact service radius on an interactive map, and receive direct booking requests from customers near you.
							</p>
						</div>

						<div className="flex shrink-0 flex-wrap items-center gap-3">
							<Link
								href="/register"
								className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover shadow-sm"
							>
								Join as a Provider
							</Link>
							<Link
								href="/search"
								className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-surface"
							>
								Browse Services
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
