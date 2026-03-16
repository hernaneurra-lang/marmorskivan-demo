<?php
// public/api/ai-render.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
  $raw = file_get_contents('php://input');
  if (!$raw) throw new Exception('Empty body');
  $payload = json_decode($raw, true);
  if (!is_array($payload)) throw new Exception('Invalid JSON');

  // Alltid fallback: spara previewPng till /generated
  $dataUrl = $payload['previewPng'] ?? null;
  if (!$dataUrl || !preg_match('#^data:image/png;base64,#', $dataUrl)) {
    // säkra fallback: returnera ok=false (frontend visar ändå sin PNG)
    echo json_encode([ 'ok' => false, 'error' => 'No previewPng' ]);
    exit;
  }

  $b64 = substr($dataUrl, strpos($dataUrl, ',') + 1);
  $png = base64_decode($b64);
  if ($png === false) throw new Exception('Failed to decode PNG');

  $dir = __DIR__ . '/../generated';
  if (!is_dir($dir)) {
    @mkdir($dir, 0775, true);
  }
  if (!is_dir($dir) || !is_writable($dir)) {
    throw new Exception('Generated folder not writable');
  }

  $fname = 'render_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.png';
  $path = $dir . '/' . $fname;
  file_put_contents($path, $png);

  // Bygg publik URL (antar att denna PHP ligger under https://marmorskivan.se/api/ )
  // => generated mappen ligger under https://marmorskivan.se/generated/
  $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/'); // /api
  // gå upp en nivå till rot
  $publicUrl = $scheme . '://' . $host . '/generated/' . $fname;

  echo json_encode([ 'ok' => true, 'imageUrl' => $publicUrl ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 'ok' => false, 'error' => $e->getMessage() ]);
}

/*
 * === KOPPLA RIKTIG AI (frivilligt) =========================
 * 1) Lägg en miljövariabel OPENAI_API_KEY i Loopia (eller hårdkoda — inte rekommenderat).
 * 2) Anropa t.ex. OpenAI Images API med curl:
 *
 *    $apiKey = getenv('OPENAI_API_KEY');
 *    if ($apiKey) {
 *      // Skicka prompt + ev. preview/skiss som "image" referens till ett image model.
 *      // När du får en bild tillbaka, spara den i /generated och returnera dess URL.
 *    }
 *
 * Om inget API-key finns → fallback ovan funkar alltid.
 */
