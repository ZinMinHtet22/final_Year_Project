<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
        ]);

        $conversation = $request->input('messages');
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['error' => 'API key is not configured on the server.'], 500);
        }

        // Support OpenRouter API keys (sk-or-...)
        if (str_starts_with($apiKey, 'sk-or-')) {
            try {
                // Check if 'json' is in the conversation to support response_format json_object
                $hasJsonKeyword = false;
                foreach ($conversation as $msg) {
                    if (stripos($msg['content'] ?? '', 'json') !== false) {
                        $hasJsonKeyword = true;
                        break;
                    }
                }

                $payload = [
                    'model' => 'openai/gpt-4o-mini',
                    'messages' => $conversation,
                ];

                if ($hasJsonKeyword) {
                    $payload['response_format'] = ['type' => 'json_object'];
                }

                $response = Http::withoutVerifying()
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'HTTP-Referer' => 'http://localhost',
                        'X-Title' => 'Vellum',
                    ])
                    ->post('https://openrouter.ai/api/v1/chat/completions', $payload);

                if ($response->failed()) {
                    $errorMsg = $response->json()['error']['message'] ?? 'OpenRouter API request failed';
                    throw new \Exception($errorMsg);
                }

                $data = $response->json();
                $reply = $data['choices'][0]['message']['content'] ?? null;

                if ($reply) {
                    return response()->json(['reply' => $reply]);
                }
                throw new \Exception('Empty response from OpenRouter');
            } catch (\Exception $e) {
                Log::error('OpenRouter Chatbot Error: ' . $e->getMessage());
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        // Support standard OpenAI API keys (sk-...)
        if (str_starts_with($apiKey, 'sk-')) {
            try {
                // Check if 'json' is in the conversation to support response_format json_object
                $hasJsonKeyword = false;
                foreach ($conversation as $msg) {
                    if (stripos($msg['content'] ?? '', 'json') !== false) {
                        $hasJsonKeyword = true;
                        break;
                    }
                }

                $payload = [
                    'model' => 'gpt-4o-mini',
                    'messages' => $conversation,
                ];

                if ($hasJsonKeyword) {
                    $payload['response_format'] = ['type' => 'json_object'];
                }

                $response = Http::withoutVerifying()
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                    ])
                    ->post('https://api.openai.com/v1/chat/completions', $payload);

                if ($response->failed()) {
                    $errorMsg = $response->json()['error']['message'] ?? 'OpenAI API request failed';
                    throw new \Exception($errorMsg);
                }

                $data = $response->json();
                $reply = $data['choices'][0]['message']['content'] ?? null;

                if ($reply) {
                    return response()->json(['reply' => $reply]);
                }
                throw new \Exception('Empty response from OpenAI');
            } catch (\Exception $e) {
                Log::error('OpenAI Chatbot Error: ' . $e->getMessage());
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        try {
            $geminiMessages = [];
            $systemInstructionText = '';

            foreach ($conversation as $msg) {
                $role = $msg['role'] ?? 'user';
                $content = $msg['content'] ?? '';

                if ($role === 'system') {
                    $systemInstructionText = $content;
                } else {
                    $geminiMessages[] = [
                        'role' => $role === 'assistant' ? 'model' : 'user',
                        'parts' => [['text' => $content]]
                    ];
                }
            }

            $payload = [
                'contents' => $geminiMessages,
                'generationConfig' => [
                    'responseMimeType' => 'application/json'
                ]
            ];

            if ($systemInstructionText) {
                $payload['systemInstruction'] = [
                    'parts' => [['text' => $systemInstructionText]]
                ];
            }

            // Call Gemini API from server
            $response = Http::withoutVerifying()->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={$apiKey}", $payload);

            if ($response->failed()) {
                $errorMsg = $response->json()['error']['message'] ?? 'Gemini API request failed';
                throw new \Exception($errorMsg);
            }

            $data = $response->json();
            $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if ($reply) {
                return response()->json(['reply' => $reply]);
            }

            throw new \Exception('Empty response from Gemini');

        } catch (\Exception $e) {
            Log::error('Gemini Chatbot Error: ' . $e->getMessage());
            
            // Fallback to Pollinations.ai if Gemini fails
            try {
                $pollinationsResponse = Http::withoutVerifying()->post('https://text.pollinations.ai/', [
                    'messages' => $conversation,
                    'model' => 'openai',
                    'private' => true
                ]);

                if ($pollinationsResponse->successful()) {
                    $text = $pollinationsResponse->body();
                    // Strip Pollinations deprecation/notice blocks
                    $text = preg_replace('/\x{26a0}[\x{FE0F}]?\s*\*{0,2}IMPORTANT NOTICE\*{0,2}[\x{26a0}\x{FE0F}]*[\s\S]*?work normally\./ui', '', $text);
                    $text = preg_replace('/The Pollinations legacy text API[\s\S]*?work normally\./i', '', $text);
                    $text = trim($text);

                    if ($text) {
                        return response()->json(['reply' => $text]);
                    }
                }
            } catch (\Exception $fallbackEx) {
                Log::error('Pollinations Fallback Error: ' . $fallbackEx->getMessage());
            }

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
