'use client';

import Link from 'next/link';
import { LogOut, UserRound, Menu, X, Calendar, Search } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	const handleLogout = async () => {
		try {
			await logout();
			setMobileMenuOpen(false);
			router.push('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
			<nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
				<Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">

					Handly
				</Link>

				{/* Desktop Navigation Links */}
				<div className="hidden items-center gap-6 md:flex">
					<Link
						href="/search"
						className={`text-sm font-medium transition ${pathname === '/search'
								? 'text-primary font-semibold'
								: 'text-secondary-foreground hover:text-foreground'
							}`}
					>
						Find Services
					</Link>

					{user ? (
						<>
							<Link
								href="/bookings"
								className={`text-sm font-medium transition ${pathname === '/bookings'
										? 'text-primary font-semibold'
										: 'text-secondary-foreground hover:text-foreground'
									}`}
							>
								{user.role === 'provider' ? 'Requests' : 'My Bookings'}
							</Link>

							<Link
								href="/profile"
								className={`flex items-center gap-1.5 text-sm font-medium transition ${pathname === '/profile'
										? 'text-primary font-semibold'
										: 'text-secondary-foreground hover:text-foreground'
									}`}
							>
								<UserRound size={17} />
								<span className="max-w-[120px] truncate">{user.name}</span>
							</Link>

							<button
								type="button"
								onClick={handleLogout}
								className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface"
							>
								<LogOut size={15} />
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								href="/login"
								className="text-sm font-medium text-secondary-foreground transition hover:text-foreground"
							>
								Login
							</Link>

							<Link
								href="/register"
								className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover shadow-sm"
							>
								Register
							</Link>
						</>
					)}
				</div>

				{/* Mobile Hamburger Toggle */}
				<button
					type="button"
					onClick={() => setMobileMenuOpen((prev) => !prev)}
					aria-label="Toggle Navigation Menu"
					className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface md:hidden"
				>
					{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</nav>

			{/* Mobile Dropdown Menu */}
			{mobileMenuOpen && (
				<div className="border-b border-border bg-card px-4 py-4 md:hidden animate-in slide-in-from-top-2">
					<div className="flex flex-col gap-2.5">
						<Link
							href="/search"
							className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
						>
							<Search size={17} className="text-primary" />
							Find Services
						</Link>

						{user ? (
							<>
								<Link
									href="/bookings"
									className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
								>
									<Calendar size={17} className="text-primary" />
									{user.role === 'provider'
										? 'Booking Requests'
										: 'My Bookings'}
								</Link>

								<Link
									href="/profile"
									className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
								>
									<UserRound size={17} className="text-primary" />
									Profile ({user.name})
								</Link>

								<div className="my-1 h-px bg-border" />

								<button
									type="button"
									onClick={handleLogout}
									className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
								>
									<LogOut size={17} />
									Logout
								</button>
							</>
						) : (
							<div className="flex flex-col gap-2 pt-2">
								<Link
									href="/login"
									className="flex h-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface"
								>
									Login
								</Link>
								<Link
									href="/register"
									className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary-hover"
								>
									Register
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
