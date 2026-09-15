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
	}) => Promise<void>;
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
	}) => Promise<void>;
	logout: () => Promise<void>;
	isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getUser = async () => {
			try {
				const response = await fetch(`/api/auth/user`, {
					credentials: 'include',
				});

				if (!response.ok) {
					setUser(null);
					return;
				}

				const data = await response.json();
				setUser(data.user);
			} catch (error) {
				console.error(error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};
		getUser();
	}, []);

	const login = async ({ email, password }: LoginData) => {
		const response = await fetch(`/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ email, password }),
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message);
		}

		setUser(data.user);
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
	}) => {
		const response = await fetch(`/api/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ name, email, password, role }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message);
		}
		setUser(data.user);
	};

	const logout = async () => {
		const response = await fetch(`/api/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message);
		}
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				login,
				register,
				logout,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
