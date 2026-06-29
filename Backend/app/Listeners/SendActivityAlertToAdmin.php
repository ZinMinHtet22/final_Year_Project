<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Notification;
use App\Notifications\AdminActivityAlert;

class SendActivityAlertToAdmin
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param object $event
     * @return void
     */
    public function handle(object $event): void
    {
        // Validate user presence in event
        if (!isset($event->user) || !$event->user) {
            return;
        }

        $user = $event->user;

        // Do not send alert emails when an admin logs in or registers
        if ($user->is_admin) {
            return;
        }

        $adminEmail = env('ADMIN_EMAIL');
        if (!$adminEmail) {
            $adminEmail = \App\Models\User::where('is_admin', true)->value('email') ?? 'admin@example.com';
        }
        $activityType = '';

        if ($event instanceof Login) {
            $activityType = 'login';
        } elseif ($event instanceof Registered) {
            $activityType = 'signup';
        }

        if ($activityType !== '') {
            try {
                \App\Models\LoginLog::create([
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'activity_type' => $activityType,
                ]);
            } catch (\Exception $e) {
                logger()->error("Failed to create activity log in database: " . $e->getMessage());
            }

            try {
                Notification::route('mail', $adminEmail)
                    ->notify(new AdminActivityAlert($user, $activityType));
            } catch (\Exception $e) {
                logger()->error("Failed to send admin monitoring email alert: " . $e->getMessage());
            }
        }
    }
}
