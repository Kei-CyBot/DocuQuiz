<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
{
    Schema::create('quizzes', function (Blueprint $table) {
        $table->id();
        
        $table->string('title');
        $table->enum('difficulty', ['Easy', 'Medium', 'Hard']);
        $table->string('type');
        $table->integer('question_count');
        $table->integer('time_limit_mins')->default(30); // E.g., "~30 mins" from your UI
        
        $table->timestamps();
    });
}
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
