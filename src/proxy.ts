import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ['/dashboard', '/bookings']
const authOnlyPaths = ['/login', '/register']

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function isValidToken(token: string): Promise<boolean> {
    try {
        await jwtVerify(token, secret)
        return true
    } catch {
        return false
    }
}

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    const isBookingPath = pathname.startsWith('/providers/') && pathname.endsWith('/book');
    const isProtected = protectedPaths.some(path => pathname.startsWith(path)) || isBookingPath
    const isAuthPage = authOnlyPaths.some(path => pathname.startsWith(path))

    const validToken = token ? await isValidToken(token) : false

    if (isProtected && !validToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthPage && validToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/search/:path*', '/bookings/:path*', '/providers/:id/book', '/login', '/register']
}