<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Quiz;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Quiz::create([
            'title' => 'Introduction to Cellular Biology',
            'difficulty' => 'Easy',
            'type' => 'Multiple Choice',
            'question_count' => 15,
            'time_limit_mins' => 30,
        ]);

        Quiz::create([
            'title' => 'World War II Historical Figures',
            'difficulty' => 'Medium',
            'type' => 'Identification',
            'question_count' => 20,
            'time_limit_mins' => 40,
        ]);

        Quiz::create([
            'title' => 'Advanced Calculus: Integrals',
            'difficulty' => 'Hard',
            'type' => 'Multiple Choice',
            'question_count' => 10,
            'time_limit_mins' => 20,
        ]);
    }
}
