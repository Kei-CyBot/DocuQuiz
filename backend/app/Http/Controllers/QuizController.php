<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Smalot\PdfParser\Parser;

// --- NEW: Import your Models here! ---
use App\Models\Quiz;
use App\Models\Question;

class QuizController extends Controller
{
    /**
     * Fetch all quizzes belonging to the authenticated user.
     */
    public function index(Request $request)
    {
        // auth()->id() ensures a user only sees THEIR quizzes
        $quizzes = Quiz::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($quizzes, 200);
    }
    public function generate(Request $request)
    {
        // 0. ADD THIS TEMPORARY DEBUG CHECK
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'Laravel cannot see your API Key. Did you restart the server?'], 500);
        }

        // 1. Validate incoming data (UPDATED: Added "Mixture" and "instructions")
        $request->validate([
            'title' => 'required|string|max:255',
            'document' => 'required|file|mimes:pdf,txt,docx|max:10240',
            'difficulty' => 'required|string|in:Easy,Medium,Hard',
            'type' => 'required|string|in:Multiple Choice,Identification,True/False,Fill in the Blank,Mixture', // <-- ADDED Mixture
            'question_count' => 'required|integer|min:1|max:50',
            'instructions' => 'required|string', // <-- ADDED instructions (Your React frontend sends the strict rules here)
        ]);

        if ($request->hasFile('document')) {
            $file = $request->file('document');

            // 2. Save the file temporarily
            $path = $file->store('documents');
            $fullPath = Storage::path($path);

            $extractedText = '';

            try {
                // 3. Extract the text based on the file type
                if ($file->getClientOriginalExtension() === 'pdf') {
                    $parser = new Parser();
                    $pdf = $parser->parseFile($fullPath);
                    $extractedText = $pdf->getText();
                } elseif ($file->getClientOriginalExtension() === 'txt') {
                    $extractedText = File::get($fullPath);
                }
                // Note: If you upload a .docx, you will need a package like phpoffice/phpword to extract text here later!

                // Clean up the text
                $extractedText = preg_replace('/\s+/', ' ', trim($extractedText));

                // Optional: Delete the file from the server now that we have the text
                Storage::delete($path);

                // 4. Build the Strict Prompt for Gemini
                $prompt = "You are an expert teacher. Create a {$request->question_count}-question {$request->difficulty} {$request->type} quiz based ONLY on the following text. " .
                    "Any custom instructions: {$request->instructions}. " .
                    "You MUST respond ONLY with a raw, valid JSON array. Do not include markdown formatting like ```json. " .
                    "Use this exact format: [{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"answer\": \"...\"}] " .
                    "Text to analyze: " . substr($extractedText, 0, 30000);

                // 5. Send it to Google Gemini
                $apiKey = trim(env('GEMINI_API_KEY'));
                $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post($url, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]);

                // 6. Process the AI Response
                if ($response->successful()) {
                    $data = $response->json();

                    // Check if Google actually returned content
                    if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                        return response()->json(['error' => 'Google returned an empty response.', 'details' => $data], 500);
                    }

                    $aiText = $data['candidates'][0]['content']['parts'][0]['text'];

                    // Clean up markdown formatting
                    $aiText = str_replace(['```json', '```'], '', $aiText);
                    $aiText = trim($aiText);

                    $quizData = json_decode($aiText, true);

                    // --- NEW: SAVE TO DATABASE ---
                    // 1. Create the main Quiz record
                    $quiz = Quiz::create([
                        'user_id' => $request->user()->id,
                        'title' => $request->title,
                        'difficulty' => $request->difficulty,
                        'type' => $request->type, // This will now safely save "Mixture"
                        'question_count' => $request->question_count,
                    ]);

                    // 2. Loop through the AI data and save each Question linked to this Quiz
                    foreach ($quizData as $item) {
                        $quiz->questions()->create([
                            'question' => $item['question'],
                            'options' => $item['options'] ?? null,
                            'answer' => $item['answer']
                        ]);
                    }
                    // -----------------------------

                    return response()->json([
                        'message' => 'AI Quiz Generated and Saved successfully!',
                        'quiz_id' => $quiz->id, // Passing the ID back to React!
                        'quiz_data' => $quizData
                    ], 200);
                } else {
                    return response()->json([
                        'error' => 'Google Gemini API failed.',
                        'status_code' => $response->status(),
                        'google_details' => $response->json()
                    ], 500);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Failed to process document: ' . $e->getMessage()], 500);
            }
        }

        return response()->json(['error' => 'No file was uploaded.'], 400);
    }

    // --- NEW: Method to fetch a specific quiz and its questions for the React TakeQuiz component ---
    public function show(Request $request, $id)
    {
        // Find the quiz by ID and include its questions
        $quiz = Quiz::with('questions')->where('user_id', $request->user()->id)->find($id);

        if (!$quiz) {
            return response()->json(['error' => 'Quiz not found'], 404);
        }

        return response()->json($quiz, 200);
    }

    // --- UPDATED: Method to Update/Edit a Quiz AND its Questions ---
    public function update(Request $request, $id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['error' => 'Quiz not found'], 404);
        }

        // Validate the incoming request
        $request->validate([
            'title' => 'required|string|max:255',
            'questions' => 'required|array',
        ]);

        // 1. Update the main quiz title
        $quiz->update([
            'title' => $request->title
        ]);

        // 2. Clear out the old questions
        $quiz->questions()->delete();

        // 3. Save the newly edited/added questions
        foreach ($request->questions as $q) {
            $quiz->questions()->create([
                'question' => $q['text'],
                'options' => $q['options'] ?? null,
                'answer' => $q['answer']
            ]);
        }

        return response()->json(['message' => 'Quiz and questions updated successfully!'], 200);
    }

    // --- NEW: Method to Delete a Quiz ---
    public function destroy($id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['error' => 'Quiz not found'], 404);
        }

        // Because of 'onDelete cascade' in your migration, this automatically deletes the questions too!
        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted successfully!'], 200);
    }
}
