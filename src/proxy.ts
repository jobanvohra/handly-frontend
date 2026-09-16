import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ['/dashboard', '/bookings', '/provider/profile', '/provider/availability']
const authOnlyPaths = ['/login', '/register']

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')
    const { pathname } = request.nextUrl

    const isProtected = protectedPaths.some(path => pathname.startsWith(path))
    const isAuthPage = authOnlyPaths.some(path => pathname.startsWith(path))

    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/search/:path*', '/bookings/:path*', '/provider/:path*', '/login', '/register']
}