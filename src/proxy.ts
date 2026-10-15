import { JWTPayload, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthPayload = JWTPayload & {
    id: string;
    name: string;
    role: 'customer' | 'provider';
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function getAuth(token?: string): Promise<AuthPayload | null> {
    try {
        if (!token) return null
        const { payload } = await jwtVerify(token, secret)
        return payload as AuthPayload
    } catch {
        return null
    }
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('token')?.value
    const auth = await getAuth(token)

    const protectedRoute =
        pathname.startsWith('/profile') ||
        pathname.startsWith('/bookings') ||
        pathname.startsWith('/dashboard') ||
        /^\/providers\/[^/]+\/book$/.test(pathname)

    if (protectedRoute && !auth) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const authRoute =
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')

    if (authRoute && auth) {
        return NextResponse.redirect(new URL('/bookings', request.url))
    }

    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/bookings', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/profile/:path*', '/bookings/:path*', '/dashboard/:path*', '/search/:path*', '/providers/:id/book', '/login', '/register']
}