<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = App\Models\User::first();
    if (!$user) {
        echo "No users found in the database to test with.\n";
        exit(1);
    }
    
    $adminEmail = env('ADMIN_EMAIL') ?: (App\Models\User::where('is_admin', true)->value('email') ?? 'admin@example.com');
    
    echo "Attempting to send validation email to {$adminEmail}...\n";
    Illuminate\Support\Facades\Notification::route('mail', $adminEmail)
        ->notify(new App\Notifications\AdminActivityAlert($user, 'login'));
        
    echo "SMTP Validation Success: The email alert has been successfully sent to {$adminEmail}!\n";
} catch (Exception $e) {
    echo "SMTP Validation Failed: " . $e->getMessage() . "\n";
}
