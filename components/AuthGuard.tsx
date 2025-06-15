import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, { useEffect } from 'react';

interface AuthGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export default function AuthGuard({
	children,
	requireAuth = true,
}: AuthGuardProps) {
	const { isLoggedIn } = useAuth();

	useEffect(() => {
		if (requireAuth && !isLoggedIn) {
			router.replace('/auth/login');
		}
	}, [isLoggedIn, requireAuth]);

	if (requireAuth && !isLoggedIn) {
		return null;
	}

	return <>{children}</>;
}
