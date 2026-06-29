<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $primaryKey = 'code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['code', 'symbol', 'name', 'exchange_rate'];

    protected $casts = [
        'exchange_rate' => 'float',
    ];
}
