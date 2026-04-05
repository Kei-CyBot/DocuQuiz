<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [ 'user_id', 'title', 'difficulty', 'type', 'question_count', 'time_limit_mins'];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}