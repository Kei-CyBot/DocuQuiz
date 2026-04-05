<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;

// ==========================================
// PUBLIC ROUTES (No login required)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// PROTECTED ROUTES (Requires Sanctum Token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // User Info & Logout
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- SECURE QUIZ ROUTES ---
    // This points to the 'index' method we added to your Controller
    Route::get('/quizzes', [QuizController::class, 'index']); 
    
    Route::post('/quizzes/generate', [QuizController::class, 'generate']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']); 

    // --- User Settings Routes ---
    Route::prefix('settings')->group(function () {
        Route::put('/notifications', [SettingsController::class, 'updateNotifications']);
        Route::put('/privacy', [SettingsController::class, 'updatePrivacy']);
        Route::put('/profile', [SettingsController::class, 'updateProfile']);
        Route::put('/password', [SettingsController::class, 'updatePassword']);
    });
});