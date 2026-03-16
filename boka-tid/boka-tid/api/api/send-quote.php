<?php
// public/api/send-quote.php
// En enkel “skicka offertförfrågan” – försök maila, annars logga till fil.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

try {
  $raw = file_get_contents('php://input');
  if (!$raw) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Tom body']); exit; }
  $req = json_decode($raw, true);
  if (!$req) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Ogiltig JSON']); exit; }

  $name  = $req['customer']['name'] ?? '';
  $email = $req['customer']['email'] ?? '';
  $phone = $req['customer']['phone'] ?? '';
  $msg   = $req['customer']['message'] ?? '';
  if (!$name || !$email) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Namn och e-post krävs']); exit; }

  $to = 'offert@marmorskivan.se'; // ändra till din adress
  $subject = 'Ny offertförfrågan – marmorskivan.se';
  $body = "Namn: $name\nE-post: $email\nTelefon: $phone\n\nMeddelande:\n$msg\n\n";
  $body .= "Rådata:\n" . json_encode($req, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);

  $headers = "From: noreply@marmorskivan.se\r\n".
             "Reply-To: ".($email ?: "noreply@marmorskivan.se")."\r\n".
             "Content-Type: text/plain; charset=utf-8\r\n";

  $sent = @mail($to, $subject, $body, $headers);

  if ($sent) {
    echo json_encode(['ok'=>true]);
    exit;
  }

  // Om mail() inte funkar – skriv till logg
  $dir = __DIR__ . '/../../storage';
  if (!is_dir($dir)) { @mkdir($dir, 0775, true); }
  $file = $dir.'/quotes-'.date('Y-m').'.log';
  @file_put_contents($file, date('c')." ".$email." ".$name."\n".$body."\n---\n", FILE_APPEND);

  echo json_encode(['ok'=>true, 'warning'=>'mail() misslyckades; logg sparad']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
}
