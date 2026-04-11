<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Smalot\PdfParser\Parser;

use App\Models\Quiz;
use App\Models\Question;

class QuizController extends Controller
{
    /**
     * Fetch all quizzes belonging to the authenticated user.
     */
    public function index(Request $request)
    {
        $quizzes = Quiz::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($quizzes, 200);
    }

    public function generate(Request $request)
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'Laravel cannot see your API Key. Did you restart the server?'], 500);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'document' => 'required|file|mimes:pdf,txt,docx|max:10240',
            'difficulty' => 'required|string|in:Easy,Medium,Hard',
            'type' => 'required|string|in:Multiple Choice,Identification,True/False,Fill in the Blank,Mixture', 
            'question_count' => 'required|integer|min:1|max:50',
            'instructions' => 'required|string', 
        ]);

        if ($request->hasFile('document')) {
            $file = $request->file('document');

            $path = $file->store('documents');
            $fullPath = Storage::path($path);

            $extractedText = '';

            try {
                if ($file->getClientOriginalExtension() === 'pdf') {
                    $parser = new Parser();
                    $pdf = $parser->parseFile($fullPath);
                    $extractedText = $pdf->getText();
                } elseif ($file->getClientOriginalExtension() === 'txt') {
                    $extractedText = File::get($fullPath);
                }

                $extractedText = preg_replace('/\s+/', ' ', trim($extractedText));

                Storage::delete($path);

                $prompt = "You are an expert teacher. Create a {$request->question_count}-question {$request->difficulty} {$request->type} quiz based ONLY on the following text. " .
                "Any custom instructions: {$request->instructions}. " .
                "You MUST respond ONLY with a raw, valid JSON array of objects. Do not include markdown formatting like ```json. " .
                "Each object in the array MUST contain EXACTLY these 4 keys: " .
                "1. 'question' (string) " .
                "2. 'type' (string - MUST be exactly one of these: 'multiple_choice', 'true_false', 'identification', or 'fill_in_the_blank') " .
                "3. 'options' (array of strings - leave empty if the type is not multiple_choice) " .
                "4. 'answer' (string). " .
                "Text to analyze: " . substr($extractedText, 0, 30000);
                

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

                if ($response->successful()) {
                    $data = $response->json();

                    if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                        return response()->json(['error' => 'Google returned an empty response.', 'details' => $data], 500);
                    }

                    $aiText = $data['candidates'][0]['content']['parts'][0]['text'];

                    $aiText = str_replace(['```json', '```'], '', $aiText);
                    $aiText = trim($aiText);

                    $quizData = json_decode($aiText, true);

                    $quiz = Quiz::create([
                        'user_id' => $request->user()->id,
                        'title' => $request->title,
                        'difficulty' => $request->difficulty,
                        'type' => $request->type, 
                        'question_count' => $request->question_count,
                    ]);

                    foreach ($quizData as $item) {
                        $quiz->questions()->create([
                            'question' => $item['question'],
                            'type' => $item['type'] ?? 'multiple_choice', 
                            'options' => $item['options'] ?? null,
                            'answer' => $item['answer']
                        ]);
                    }

                    return response()->json([
                        'message' => 'AI Quiz Generated and Saved successfully!',
                        'quiz_id' => $quiz->id, 
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

    public function show(Request $request, $id)
    {
        $quiz = Quiz::with('questions')->where('user_id', $request->user()->id)->find($id);

        if (!$quiz) {
            return response()->json(['error' => 'Quiz not found'], 404);
        }

        return response()->json($quiz, 200);
    }

    public function update(Request $request, $id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['error' => 'Quiz not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'questions' => 'required|array',
        ]);

        $quiz->update([
            'title' => $request->title
        ]);

        $quiz->questions()->delete();

        foreach ($request->questions as $q) {
            $quiz->questions()->create([
                'question' => $q['text'],
                'type' => $q['type'] ?? 'multiple_choice',
                'options' => $q['options'] ?? null,
                'answer' => $q['answer']
            ]);
        }

        return response()->json(['message' => 'Quiz and questions updated successfully!'], 200);
    }

    public function destroy($id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['error' => 'Quiz not found'], 404);
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted successfully!'], 200);
    }
}