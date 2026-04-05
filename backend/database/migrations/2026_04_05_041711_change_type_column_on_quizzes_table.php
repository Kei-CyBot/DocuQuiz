<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // This drops the strict ENUM restriction and changes it to a standard string
            // allowing us to save "Mixture" or any other future types you invent!
            $table->string('type')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // If you ever rollback, this reverts it back to the original strict list
            $table->enum('type', [
                'Multiple Choice', 
                'True/False', 
                'Fill in the Blank', 
                'Identification'
            ])->change();
        });
    }
};