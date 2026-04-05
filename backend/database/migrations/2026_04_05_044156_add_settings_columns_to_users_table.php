<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->boolean('email_alerts')->default(true);
        $table->boolean('weekly_summary')->default(true);
        $table->boolean('public_profile')->default(false);
        $table->boolean('data_sharing')->default(true);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['email_alerts', 'weekly_summary', 'public_profile', 'data_sharing']);
    });
}
};
