'use client';

import type { LoginData, User } from '@/types/user';
import { createContext, useEffect, useState } from 'react';

type AuthContextType = {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	login: ({
		email,
		password,
	}: {
		email: string;
		password: string;
	}) => Promise<User>;
	register: ({
		email,
		password,
		name,
		role,
	}: {
		email: string;
		password: string;
		name: string;
		role: 'customer' | 'provider';
	}) => Promise<User>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<User | null>;
	isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchUser = async (): Promise<User | null> => {
		try {
			const response = await fetch(`/api/auth/user`, {
				credentials: 'include',
			});

			if (!response.ok) {
				setUser(null);
				return null;
			}

			const data = await response.json();
			const userData = data.data?.user || data.data || null;
			setUser(userData);
			return userData;
		} catch (error) {
			console.error(error);
			setUser(null);
			return null;
		}
	};

	useEffect(() => {
		const init = async () => {
			try {
				await fetchUser();
			} finally {
				setIsLoading(false);
			}
		};
		init();
	}, []);

	const login = async ({ email, password }: LoginData): Promise<User> => {
		const response = await fetch(`/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ email, password }),
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Login failed');
		}

		const userData = data.data?.user || data.data || data.user;
		setUser(userData);
		return userData;
	};

	const register = async ({
		name,
		email,
		password,
		role,
	}: {
		name: string;
		email: string;
		password: string;
		role: 'customer' | 'provider';
	}): Promise<User> => {
		const response = await fetch(`/api/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ name, email, password, role }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || 'Registration failed');
		}

		const userData = data.data?.user || data.data || data.user;
		setUser(userData);
		return userData;
	};

	const logout = async () => {
		const response = await fetch(`/api/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || 'Logout failed');
		}
		setUser(null);
	};

	const refreshUser = async () => {
		return await fetchUser();
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				login,
				register,
				logout,
				refreshUser,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
