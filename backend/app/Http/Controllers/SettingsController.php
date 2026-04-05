<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; // <-- Added this to safely encrypt the new password!

class SettingsController extends Controller
{
    // 1. Handle Notifications
    public function updateNotifications(Request $request)
    {
        $user = $request->user();
        $user->update([
            'email_alerts' => $request->emailAlerts,
            'weekly_summary' => $request->weeklySummary,
        ]);

        return response()->json(['message' => 'Notifications saved!']);
    }

    // 2. Handle Privacy
    public function updatePrivacy(Request $request)
    {
        $user = $request->user();
        $user->update([
            'public_profile' => $request->publicProfile,
            'data_sharing' => $request->dataSharing,
        ]);

        return response()->json(['message' => 'Privacy saved!']);
    }

    // 3. Handle Profile (Name, Email, Institution)
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'institution' => 'nullable|string|max:255',
            // Ensure the email is unique, but ignore the current user's own email!
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id, 
        ]);

        $user = $request->user();
        $user->update([
            'name' => $request->name,
            'institution' => $request->institution,
            'email' => $request->email,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user
        ]);
    }

    // 4. Handle Password Change
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|string|min:8', 
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password updated successfully!']);
    }
}