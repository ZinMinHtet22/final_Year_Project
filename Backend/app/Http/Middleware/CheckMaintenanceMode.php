<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isMaintenanceActive = Cache::get('maintenance_mode_active', false);

        if ($isMaintenanceActive) {
            // Always allow authentication and base status routes so Jeffery can log in to turn it off
            if ($request->is('api/auth/*') || $request->is('api/currencies') || $request->is('up')) {
                return $next($request);
            }

            // Attempt to resolve authenticated user via Sanctum
            $user = $request->user('sanctum');
            
            if ($user && $user->is_admin) {
                return $next($request);
            }

            return response()->json([
                'message' => 'The system is currently undergoing scheduled maintenance. Please check back later.'
            ], 503);
        }

        return $next($request);
    }
}
