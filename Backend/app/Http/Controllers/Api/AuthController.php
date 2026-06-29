<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users',
                function ($attribute, $value, $fail) {
                    $domain = strtolower(substr(strrchr($value, "@"), 1));
                    $typos = ['gmai.com', 'gamil.com', 'gmaill.com', 'hotmai.com', 'yaho.com', 'outlok.com'];
                    if (in_array($domain, $typos)) {
                        $fail('The email domain contains a typo (e.g. did you mean gmail.com?).');
                        return;
                    }
                    if (!checkdnsrr($domain, 'MX')) {
                        $fail('The email domain does not appear to be valid or cannot receive mail.');
                    }
                }
            ],
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new \Illuminate\Auth\Events\Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'is_admin' => $user->is_admin],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 1. Check if the user exists
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Could not find your Vellum Account.'],
            ]);
        }

        // 2. Check if the password is correct
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Wrong password. Try again.'],
            ]);
        }

        // Log the user in to trigger the Login event listener
        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'is_admin' => $user->is_admin],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json($user);
    }

    public function uploadProfileImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $user = $request->user();

        // Delete old image if exists
        if ($user->profile_image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_image);
        }

        // Store new image
        $path = $request->file('image')->store('avatars', 'public');
        $user->profile_image = $path;
        $user->save();

        return response()->json($user);
    }

    public function deleteProfileImage(Request $request)
    {
        $user = $request->user();

        if ($user->profile_image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_image);
            $user->profile_image = null;
            $user->save();
        }

        return response()->json($user);
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'access_token' => 'required|string',
        ]);

        $accessToken = $request->access_token;
        $picture = null;

        if ($accessToken === 'mock-google-token') {
            if (config('app.debug') || app()->environment('local')) {
                $email = 'ryuuprime25@gmail.com';
                $name = 'Zin Min Htet (Google Mock)';
                $picture = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; // standard avatar placeholder
            } else {
                return response()->json(['message' => 'Mock login disabled in production.'], 401);
            }
        } else {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->get('https://www.googleapis.com/oauth2/v3/userinfo', [
                'access_token' => $accessToken,
            ]);

            if ($response->failed()) {
                return response()->json(['message' => 'Invalid Google access token.'], 401);
            }

            $userData = $response->json();
            $email = $userData['email'] ?? null;
            $name = $userData['name'] ?? 'Google User';
            $picture = $userData['picture'] ?? null;
        }

        if (!$email) {
            return response()->json(['message' => 'Email not found in Google account.'], 400);
        }

        $user = User::where('email', $email)->first();
        $isNewUser = !$user;

        if ($isNewUser) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(\Illuminate\Support\Str::random(24)),
                'is_admin' => false,
                'profile_image' => $picture,
            ]);
            
            event(new \Illuminate\Auth\Events\Registered($user));
        } else {
            // Update profile image if it was updated on Google
            if ($picture && $user->profile_image !== $picture && (str_starts_with($user->profile_image ?? '', 'http') || !$user->profile_image)) {
                $user->profile_image = $picture;
                $user->save();
            }
            Auth::login($user);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'profile_image_url' => $user->profile_image_url
            ],
            'token' => $token,
        ]);
    }
}
