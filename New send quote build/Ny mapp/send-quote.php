<?php
// public_html/boka-tid/api/send-quote.php
// eller public_html/offert/api/send-quote.php

ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=utf-8");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

// ==== Autoload ====
$root = dirname(__DIR__, 2); // två nivåer upp → /public_html
$autoload = $root . '/vendor/autoload.php';

if (!file_exists($autoload)) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "error" => "autoload.php saknas i $autoload"
    ]);
    exit;
}
require $autoload;

// ==== Ladda .env ====
$dotenv = Dotenv::createImmutable($root);
$dotenv->load();

// ==== Loggfunktion ====
function logQuote($message, $context = '') {
    $dir = dirname(__DIR__, 2) . '/storage';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $file = $dir . '/send-quote-' . date('Y-m') . '.log';
    $date = date('c');
    $entry = "[$date] $message\n$context\n---\n";
    @file_put_contents($file, $entry, FILE_APPEND);
}

// ==== Läs POST-data ====
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Method not allowed"]);
    exit;
}

if (!$data || !isset($data['customer']['email'])) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Ogiltig payload"]);
    exit;
}

$customer = $data['customer'];
$selections = $data['selections'] ?? [];
$quote = $data['quote'] ?? [];
$page = $data['page'] ?? [];

logQuote("MOTTAGEN OFFERT", json_encode($data, JSON_PRETTY_PRINT));

// ==== PHPMailer setup ====
function makeMailer(): PHPMailer {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USER'];
    $mail->Password = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $_ENV['SMTP_PORT'];
    $mail->CharSet = "UTF-8";
    $mail->setFrom($_ENV['SMTP_USER'], "Marmorskivan.se");
    return $mail;
}

// ==== Mail-templates ====
$customerHtml = file_get_contents($root . "/templates/customer-offert.html.php");
$adminHtml    = file_get_contents($root . "/templates/admin-offert.html.php");

// Ersätt enkla placeholders i HTML (du kan bygga ut)
$search  = ["{{name}}", "{{email}}", "{{phone}}", "{{message}}"];
$replace = [
    htmlspecialchars($customer['name'] ?? ""),
    htmlspecialchars($customer['email'] ?? ""),
    htmlspecialchars($customer['phone'] ?? ""),
    htmlspecialchars($customer['message'] ?? "")
];

$customerHtml = str_replace($search, $replace, $customerHtml);
$adminHtml    = str_replace($search, $replace, $adminHtml);

// ==== Skicka mail till kund ====
$okCustomer = false;
try {
    $mail = makeMailer();
    $mail->addAddress($customer['email'], $customer['name']);
    $mail->Subject = "Din offertförfrågan hos Marmorskivan.se";
    $mail->msgHTML($customerHtml);
    $mail->send();
    $okCustomer = true;
    logQuote("MAIL skickat till kund", $customer['email']);
} catch (Exception $e) {
    logQuote("KUNDE INTE SKICKA till kund", $e->getMessage());
}

// ==== Alltid maila admin ====
try {
    $mail = makeMailer();
    $mail->addAddress("offert@marmorskivan.se", "Offertadmin");
    $mail->Subject = "Ny offertförfrågan";
    $mail->msgHTML($adminHtml);
    $mail->send();
    logQuote("MAIL skickat till admin", "offert@marmorskivan.se");
} catch (Exception $e) {
    logQuote("KUNDE INTE SKICKA till admin", $e->getMessage());
}

// ==== Om kund-mail failade → fallback ====
if (!$okCustomer) {
    try {
        $mail = makeMailer();
        $mail->addAddress("offert@marmorskivan.se", "Offertadmin");
        $mail->Subject = "Kund kunde inte få offert";
        $mail->Body = "Kund {$customer['name']} ({$customer['email']}) kunde inte få sin offert. Payload:\n\n" . json_encode($data, JSON_PRETTY_PRINT);
        $mail->send();
        logQuote("FALLBACK skickad till admin", "kund misslyckades");
    } catch (Exception $e) {
        logQuote("FALLBACK OCKSÅ MISSLYCKADES", $e->getMessage());
    }
}

echo json_encode(["ok" => true, "msg" => "Offertflöde kört"]);
