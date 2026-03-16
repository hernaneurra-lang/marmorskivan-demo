<?php
// public_html/offert/api/send-quote.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require __DIR__ . '/../../../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->load();

function logQuote($message, $context = '') {
    $dir = __DIR__ . '/../../../storage';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $file = $dir . '/send-quote-' . date('Y-m') . '.log';
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

    logQuote("[MAILER] Using From=$from Name=$fromName");

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

logQuote("[INCOMING QUOTE]", json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));

$customer = $data['customer'] ?? [];
$name  = $customer['name'] ?? '';
$email = $customer['email'] ?? '';
$phone = $customer['phone'] ?? '';
$message = $customer['message'] ?? '';

if (!$name || !$email) {
    echo json_encode(["ok"=>false,"error"=>"Namn och e-post krävs"]);
    exit;
}

// --- Förbered e-postinnehåll ---
ob_start();
include __DIR__ . '/../customer-offert.html.php';
$customerHtml = ob_get_clean();

ob_start();
include __DIR__ . '/../admin-offert.html.php';
$adminHtml = ob_get_clean();

// --- Skicka mail ---
try {
    $mailer = buildMailer();

    // Bekräftelse till kund
    $mailer->clearAllRecipients();
    $mailer->addAddress($email, $name);
    $mailer->addReplyTo('offert@marmorskivan.se', 'Marmorskivan.se');
    $mailer->Subject = "Offertförfrågan – Marmorskivan.se";
    $mailer->Body    = $customerHtml;
    $mailer->AltBody = "Hej $name,\n\nTack för din offertförfrågan! Vi återkommer snart.";
    $mailer->send();

    // Mail till admin
    $mailer = buildMailer();
    $mailer->clearAllRecipients();
    $mailer->addAddress('offert@marmorskivan.se', 'Marmorskivan Admin');
    $mailer->Subject = "Ny offertförfrågan från $name";
    $mailer->Body    = $adminHtml;
    $mailer->AltBody = "Ny offertförfrågan från $name ($email, $phone)";
    $mailer->send();

    echo json_encode(["ok"=>true,"message"=>"Offert skickad"]);
} catch (Exception $e) {
    logQuote("SMTP error: ".$e->getMessage(), json_encode($data));

    // --- Fallback: skicka enkel textmail till admin ---
    try {
        $mailer = buildMailer();
        $mailer->clearAllRecipients();
        $mailer->addAddress('offert@marmorskivan.se', 'Marmorskivan Admin');
        $mailer->Subject = "FEL – Kunde inte skicka offert till kund";
        $mailer->Body    = "<pre>".htmlspecialchars(print_r($data, true))."</pre>";
        $mailer->AltBody = "Kunde inte skicka offert.\n\n" . print_r($data, true);
        $mailer->send();
    } catch (Exception $ex) {
        logQuote("Fallback mail misslyckades: ".$ex->getMessage());
    }

    http_response_code(500);
    echo json_encode(["ok"=>false,"error"=>"E-post kunde inte skickas"]);
}
