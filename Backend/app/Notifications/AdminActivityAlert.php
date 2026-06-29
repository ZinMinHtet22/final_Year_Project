<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class AdminActivityAlert extends Notification
{


    protected User $user;
    protected string $activityType;
    protected string $timestamp;
    protected ?string $ip;

    /**
     * Create a new notification instance.
     *
     * @param User $user
     * @param string $activityType
     */
    public function __construct(User $user, string $activityType)
    {
        $this->user = $user;
        $this->activityType = $activityType;
        $this->timestamp = now()->toDateTimeString();
        $this->ip = request()->ip();
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param object $notifiable
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param object $notifiable
     * @return MailMessage
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = new MailMessage;

        if ($this->activityType === 'login') {
            $mail->subject('[Vellum Security] Management Access Alert')
                ->line("A login has been detected for user: {$this->user->email} at {$this->timestamp} from IP: {$this->ip}.");
        } elseif ($this->activityType === 'signup') {
            $mail->subject('[Vellum Growth] New Curator Registered')
                ->line("A new user account has been successfully created: {$this->user->email} at {$this->timestamp} from IP: {$this->ip}.");
        }

        $mail->salutation("Regards,\nVellum");

        return $mail;
    }
}
