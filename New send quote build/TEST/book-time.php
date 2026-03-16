<?php
// public/api/book-time.php

ini_set('display_errors', 0);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

function logError($message, $context = '') {
    $dir = __DIR__ . '/../../storage';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $file = $dir . '/bookings-' . date('Y-m') . '.log';
    $date = date('c');
    $entry = "[$date] $message\n$context\n---\n";
    @file_put_contents($file, $entry, FILE_APPEND);
}

function buildMailer(): PHPMailer {
    $m = new PHPMailer(true);
    $m->CharSet    = 'UTF-8';
    $m->Encoding   = 'base64';
    $m->isSMTP();
    $m->Host       = $_ENV['SMTP_HOST'];
    $m->SMTPAuth   = true;
    $m->Username   = $_ENV['SMTP_USER'];
    $m->Password   = $_ENV['SMTP_PASS'];
    $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $m->Port       = $_ENV['SMTP_PORT'] ?? 587;
    $m->isHTML(true);

    $from = $_ENV['SMTP_FROM'] ?? $_ENV['SMTP_USER'];
    $fromName = $_ENV['SMTP_FROM_NAME'] ?? 'Marmorskivan.se';
    $m->setFrom($from, $fromName);

    return $m;
}

// --- Kontrollera request ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["ok"=>false,"error"=>"Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(["ok"=>false,"error"=>"No data received"]);
    exit;
}

logError("[BOOKING_REQUEST]", json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));

// --- Läs in fält ---
$name    = $data['name'] ?? '';
$email   = $data['email'] ?? '';
$address = $data['address'] ?? '';
$phone   = $data['phone'] ?? '';
$message = $data['message'] ?? '';
$extra   = $data['extra'] ?? '';
$zipCity = $data['zipCity'] ?? '';

// Hantera datum och tid (stöd för både separat och ISO)
$date = $data['date'] ?? '';
$time = $data['time'] ?? '';

if ($time && !$date) {
    try {
        $dt = new DateTime($time);
        $date = $dt->format("Y-m-d");
        $time = $dt->format("H:i");
    } catch (Exception $e) {
        logError("Invalid datetime format in 'time': ".$time);
    }
}

if (!$name || !$email || !$date || !$time) {
    echo json_encode(["ok"=>false,"error"=>"Namn, e-post, datum och tid krävs"]);
    exit;
}

// --- Skapa ICS-fil ---
$dtStart = date("Ymd\THis", strtotime("$date $time"));
$dtEnd   = date("Ymd\THis", strtotime("$date $time +1 hour"));
$uid     = uniqid();

$ics = "BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Marmorskivan.se//Booking//SV
BEGIN:VEVENT
UID:$uid
DTSTAMP:" . gmdate("Ymd\THis\Z") . "
DTSTART:$dtStart
DTEND:$dtEnd
SUMMARY:Bokning – Marmorskivan.se
LOCATION:$address
DESCRIPTION:Bokad tid med Marmorskivan.se
END:VEVENT
END:VCALENDAR";

$tmpFile = tempnam(sys_get_temp_dir(), 'ics');
file_put_contents($tmpFile, $ics);

// --- Google Calendar-länk ---
$googleLink = "https://www.google.com/calendar/render?action=TEMPLATE" .
    "&text=" . urlencode("Bokning – Marmorskivan.se") .
    "&dates=" . gmdate("Ymd\THis\Z", strtotime("$date $time")) . "/" . gmdate("Ymd\THis\Z", strtotime("$date $time +1 hour")) .
    "&details=" . urlencode("Bokad tid med Marmorskivan.se") .
    "&location=" . urlencode($address) .
    "&sf=true&output=xml";

// --- HTML layout för kund ---
$htmlCustomer = "
<div style='font-family:Arial, sans-serif; max-width:600px; margin:auto;'>
  <div style='background:#2f7d32; color:#fff; padding:15px; text-align:center; font-size:20px; font-weight:bold;'>
    marmorskivan.se
  </div>
  <div style='padding:20px;'>
    <h2 style='color:#2f7d32;'>Bokningsbekräftelse</h2>
    <p>Tack för din bokning <strong>$name</strong>!</p>
    <div style='background:#f7f7f7; padding:15px; border-radius:8px; margin:20px 0;'>
      <p><strong>Tid:</strong> " . date("l d F Y", strtotime($date)) . " kl: $time</p>
      <p><strong>Adress:</strong> $address</p>
      <p><strong>Telefon:</strong> $phone</p>
    </div>
    <p>
      <a href='$googleLink' style='background:#2f7d32; color:#fff; text-decoration:none; padding:12px 20px; border-radius:5px; font-weight:bold;'>
        Lägg till i Google Kalender
      </a>
    </p>
    <p style='font-size:12px;color:#555;'>Tips: Bifogad <em>bokning.ics</em> fungerar i Outlook och Apple Kalender.</p>

    <h3>Så går det till – steg för steg</h3>
    <ol>
      <li>Vi kommer hem till dig på bokad tid och gör mätningen.</li>
      <li>Du får en tydlig offert efter mätningen.</li>
      <li>Produktion och montering enligt överenskommen tid.</li>
    </ol>
  </div>
  <div style='background:#f7f7f7; text-align:center; padding:15px; font-size:12px; color:#555;'>
    © 2025 Marmorskivan.se – Alla rättigheter förbehållna
  </div>
</div>
";

// --- HTML layout för admin ---
$htmlAdmin = "
<div style='font-family:Arial, sans-serif; max-width:700px; margin:auto;'>
  <div style='background:#2f7d32; color:#fff; padding:15px; text-align:center; font-size:20px; font-weight:bold;'>
    marmorskivan.se – Adminbokning
  </div>
  <div style='padding:20px;'>
    <h2 style='color:#2f7d32;'>Ny bokning</h2>
    <p><strong>Namn:</strong> $name</p>
    <p><strong>E-post:</strong> $email</p>
    <p><strong>Telefon:</strong> $phone</p>
    <p><strong>Adress:</strong> $address</p>
    <p><strong>Postnr/Ort:</strong> $zipCity</p>
    <p><strong>Tid:</strong> $date kl $time</p>
    " . ($message ? "<p><strong>Meddelande:</strong> $message</p>" : "") . "
    " . ($extra ? "<p><strong>Extra:</strong> $extra</p>" : "") . "
    <p><strong>IP:</strong> " . ($_SERVER['REMOTE_ADDR'] ?? 'okänd') . "</p>
  </div>
</div>
";

// --- Skicka till kund ---
try {
    $mailer = buildMailer();
    $mailer->addAddress($email, $name);
    if ($email) $mailer->addReplyTo($email, $name);
    $mailer->Subject = "Bokningsbekräftelse – Marmorskivan.se";
    $mailer->Body    = $htmlCustomer;
    $mailer->AltBody = "Tack $name för din bokning! Tid: $date $time, Adress: $address, Telefon: $phone.";
    $mailer->addAttachment($tmpFile, 'bokning.ics');
    $mailer->send();
} catch (Exception $e) {
    logError("SMTP error (customer): ".$e->getMessage());
}

// --- Skicka till admin ---
try {
    $mailer = buildMailer();
    $mailer->addAddress('offert@marmorskivan.se', 'Marmorskivan Admin');
    $mailer->Subject = "Ny bokning från $name – Marmorskivan.se";
    $mailer->Body    = $htmlAdmin;
    $mailer->AltBody = "Ny bokning: $name, $email, $phone, $address, $zipCity, $date $time.";
    $mailer->addAttachment($tmpFile, 'bokning.ics');
    $mailer->send();
} catch (Exception $e) {
    logError("SMTP error (admin): ".$e->getMessage());
}

unlink($tmpFile);

echo json_encode(["ok"=>true,"message"=>"Tack! Vi har nu mottagit din bokning, kontrollera att du mottagit bokningbekräftelse i din mail."]);
