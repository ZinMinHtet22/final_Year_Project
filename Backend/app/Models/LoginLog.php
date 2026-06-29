<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'email', 'ip_address', 'user_agent', 'activity_type'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
