<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = ['quiz_id', 'question', 'options', 'answer'];

    // This tells Laravel to automatically convert the options array to JSON in the database
    protected $casts = [
        'options' => 'array', 
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
