<?php
// /public_html/boka-tid/api/send-quote.php
// Komplett endpoint med inbyggda HTML-mallar (inga externa template-filer)
// - PHPMailer via SMTP (Loopia)
// - Loggning till /public_html/storage/send-quote-YYYY-MM.log
// - Fallback (plain text) om HTML skulle saknas eller utskick misslyckas

ini_set('display_errors', 0);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require __DIR__ . '/../../vendor/autoload.php';       // boka-tid/api → /public_html/vendor
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../'); // ladda .env i /public_html
$dotenv->load();

/* ========================= Logging ========================= */
function logQuote($message, $context = ''): void {
    $dir = __DIR__ . '/../../storage';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $file = $dir . '/send-quote-' . date('Y-m') . '.log';
    $date = date('Y-m-d H:i:s');
    $entry = "[$date] $message\n" . ($context !== '' ? $context . "\n" : '') . "---\n";
    @file_put_contents($file, $entry, FILE_APPEND);
}

/* ========================= Helpers ========================= */
function h(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function baseUrl(): string {
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host  = $_SERVER['HTTP_HOST'] ?? 'marmorskivan.se';
    return $proto . '://' . $host;
}

function absUrl(?string $path): ?string {
    if (!$path) return null;
    if (preg_match('~^https?://~i', $path)) return $path;
    return rtrim(baseUrl(), '/') . '/' . ltrim($path, '/');
}

/**
 * PHPMailer med rätt inställningar + From/Reply-To/BCC
 */
function buildMailer(array $cust = []): PHPMailer {
    $m = new PHPMailer(true);
    $m->CharSet    = 'UTF-8';
    $m->Encoding   = 'base64';
    $m->isSMTP();
    $m->Host       = $_ENV['SMTP_HOST'] ?? '';
    $m->SMTPAuth   = true;
    $m->Username   = $_ENV['SMTP_USER'] ?? '';
    $m->Password   = $_ENV['SMTP_PASS'] ?? '';
    $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $m->Port       = (int)($_ENV['SMTP_PORT'] ?? 587);

    $from     = $_ENV['SMTP_FROM']      ?? ($_ENV['SMTP_USER'] ?? 'noreply@marmorskivan.se');
    $fromName = $_ENV['SMTP_FROM_NAME'] ?? 'Marmorskivan.se';
    $m->setFrom($from, $fromName);

    // Reply-To till kund
    if (!empty($cust['email'])) {
        $replyName = trim(($cust['name'] ?? '') . (!empty($cust['phone']) ? ' (' . $cust['phone'] . ')' : ''));
        $m->addReplyTo($cust['email'], $replyName ?: $cust['email']);
    }

    // BCC
    if (!empty($_ENV['SMTP_BCC'])) {
        foreach (explode(',', $_ENV['SMTP_BCC']) as $bcc) {
            $bcc = trim($bcc);
            if ($bcc !== '') $m->addBCC($bcc);
        }
    }

    logQuote('[MAILER] Using From=' . $from . ' Name=' . $fromName);
    return $m;
}

/* ========================= Inbyggda HTML-templates ========================= */
function buildCustomerHtml(array $data): string {
    $brandColor   = '#2e7d32';
    $buttonColor  = '#4caf50';
    $year = date('Y');

    $quote   = $data['quote'] ?? [];
    $variant = $quote['variant'] ?? [];
    $totals  = $quote['totals'] ?? [];
    $ctx     = $quote['context'] ?? [];
    $cust    = $data['customer'] ?? [];

    if (!empty($variant['image'])) {
        $variant['image'] = absUrl($variant['image']);
    }
    $imgUrl = $variant['image'] ?? '';

    // Ikoner (stora) – på rad
    $iconSize     = 95;
    $icon_request = absUrl('/images/email-icons/request.png');
    $icon_quote   = absUrl('/images/email-icons/quote.png');
    $icon_measure = absUrl('/images/email-icons/measure.png');
    $icon_install = absUrl('/images/email-icons/install.png');

    $html  = '<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:20px;">';
    $html .=   '<div style="max-width:700px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8;">';
    $html .=     '<div style="background:' . h($brandColor) . ';padding:16px;text-align:center;color:#fff;font-size:22px;font-weight:700;">Marmorskivan.se</div>';
    $html .=     '<div style="padding:20px;">';
    $html .=       '<h2 style="margin:0 0 12px 0;color:#111;">Hej ' . h($cust['name'] ?? '') . '!</h2>';
    $html .=       '<p style="margin:0 0 20px 0;color:#333;">Tack för din offertförfrågan! Nedan finner du en sammanfattning av din förfrågan och nästa steg i processen.</p>';

    // Stora ikoner i rad – utan text
    $html .= '<div style="text-align:center;margin:55px 0;">'
           .   '<span style="display:inline-block;margin:0 55px;">'
           .     '<img src="' . h($icon_request) . '" width="' . $iconSize . '" height="' . $iconSize . '" alt="Förfrågan" />'
           .   '</span>'
           .   '<span style="display:inline-block;margin:0 55px;">'
           .     '<img src="' . h($icon_quote) . '" width="' . $iconSize . '" height="' . $iconSize . '" alt="Offert" />'
           .   '</span>'
           .   '<span style="display:inline-block;margin:0 55px;">'
           .     '<img src="' . h($icon_measure) . '" width="' . $iconSize . '" height="' . $iconSize . '" alt="Mätning" />'
           .   '</span>'
           .   '<span style="display:inline-block;margin:0 55px;">'
           .     '<img src="' . h($icon_install) . '" width="' . $iconSize . '" height="' . $iconSize . '" alt="Installation" />'
           .   '</span>'
           . '</div>';

    // Sammanfattning
    $html .=       '<h3 style="margin:20px 0 8px 0;color:' . h($brandColor) . ';">Sammanfattning av din förfrågan</h3>';
    $html .=       '<div style="display:flex;gap:16px;align-items:flex-start;border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:12px;">';
    if ($imgUrl) {
        $html .=     '<div style="flex:0 0 90px;"><img src="' . h($imgUrl) . '" alt="' . h($variant['name'] ?? '') . '" style="width:90px;height:auto;border-radius:6px;border:1px solid #ddd;object-fit:cover;" /></div>';
    }
    $html .=         '<div style="flex:1;">'
                  .    '<p style="margin:6px 0;"><strong>Material:</strong> ' . h($variant['name'] ?? '') . '</p>'
                  .    '<p style="margin:6px 0;"><strong>Form:</strong> ' . h($ctx['shape'] ?? '') . '</p>';
    if (!empty($ctx['bench']['benchLengthMm'])) {
        $html .=       '<p style="margin:6px 0;">Indikernit ' . h((string)($ctx['bench']['benchLengthMm'] ?? '')) . ' × ' . h((string)($ctx['bench']['benchDepthMm'] ?? '')) . ' mm</p>';
    }
    $html .=         '<p style="margin:6px 0;font-weight:bold;font-size:15px;">Indikation: ' . number_format((float)($totals['total'] ?? 0), 0, ',', ' ') . ' kr</p>'
                  .  '<p style="margin:6px 0;font-size:12px;color:#666;">💡 Priset är inklusive mätning, mallning och transport inom Stor-Stockholm och är en indikation. Ett exakt pris lämnas efter mätning på plats.</p>';
    if (!empty($cust['message'])) {
        $html .=       '<p style="margin:6px 0;"><strong>Meddelande:</strong> ' . nl2br(h((string)$cust['message'])) . '</p>';
    }
    $html .=         '</div>'
                  . '</div>';

    // Prisöversikt (KUND) – endast Moms + Total med belopp, övriga punkter utan belopp. Ingen "Mellansumma".
    $html .=       '<h3 style="margin:16px 0 8px 0;color:' . h($brandColor) . ';">Prisöversikt</h3>'
                 . '<ul style="margin:0 0 16px 18px;padding:0;color:#333;">'
                 .   '<li>Materialkostnad (ingår i totalsumman)</li>'
                 .   '<li>Öppningar (ingår i totalsumman)</li>'
                 .   '<li>Servicekostnad (ingår i totalsumman)</li>'
                 .   '<li>Moms: '  . number_format((float)($totals['moms'] ?? 0), 0, ',', ' ') . ' kr</li>'
                 .   '<li><strong>Total: ' . number_format((float)($totals['total'] ?? 0), 0, ',', ' ') . ' kr</strong></li>'
                 . '</ul>';

    // Vad händer nu? (emojis)
    $html .=       '<h3 style="margin:16px 0 8px 0;color:' . h($brandColor) . ';">Vad händer nu?</h3>'
                 . '<ol style="margin:0 0 16px 18px;padding:0;color:#333;line-height:1.6;">'
                 .   '<li>📞 Vi kontaktar dig för bokning av kostnadsfritt hembesök.</li>'
                 .   '<li>📐 Vi måttar, mallar och går igenom detaljer på plats.</li>'
                 .   '<li>🧾 Du får ett uppdaterat fast pris & orderbekräftelse.</li>'
                 .   '<li>🛠️ Produktion startar efter godkännande & 50% förskott.</li>'
                 .   '<li>🚚 Leverans & montering av bänkskivan hemma hos dig.</li>'
                 . '</ol>';

    // Bokningsknapp
    $html .=       '<div style="text-align:center;margin:30px 0;">'
                 .   '<a href="' . h(absUrl('/boka-tid/')) . '" style="display:inline-block;background:' . h($buttonColor) . ';color:#fff;padding:16px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">📅 Boka tid för hembesök</a>'
                 . '</div>';

    // Footer
    $html .=       '<p style="margin:6px 0;color:#666;font-size:13px;">📨 Vi återkommer så snabbt vi kan med en offert. Om du har några frågor under tiden är du välkommen att kontakta oss.</p>'
                 . '<div style="background:#fafafa;color:#666;text-align:center;padding:12px;font-size:12px;border-top:1px solid #eee;margin-top:20px;">© ' . h($year) . ' Marmorskivan.se – offert@marmorskivan.se</div>';

    $html .=     '</div></div></div>';

    return $html;
}

function buildAdminHtml(array $data): string {
    $brandColor = '#2e7d32';
    $year = date('Y');

    $quote   = $data['quote'] ?? [];
    $variant = $quote['variant'] ?? [];
    $totals  = $quote['totals'] ?? [];
    $ctx     = $quote['context'] ?? [];
    $cust    = $data['customer'] ?? [];
    $page    = $data['page'] ?? [];

    if (!empty($variant['image'])) {
        $variant['image'] = absUrl($variant['image']);
    }
    $imgUrl = $variant['image'] ?? '';

    $html  = '<div style="font-family:Arial,Helvetica,sans-serif;background:#f9f9f9;padding:20px;">';
    $html .= '<div style="max-width:800px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #ddd;">';
    $html .=   '<div style="background:' . h($brandColor) . ';padding:12px;text-align:center;color:#fff;font-size:20px;font-weight:700;">Ny offertförfrågan – marmorskivan.se</div>';
    $html .=   '<div style="padding:20px;">';

    $html .=   '<h3 style="margin:0 0 8px 0;color:#111;">Kundinformation</h3>'
             . '<ul style="margin:0 0 16px 18px;padding:0;color:#333;">'
             .   '<li><strong>Namn:</strong> '   . h($cust['name']  ?? '') . '</li>'
             .   '<li><strong>E-post:</strong> ' . h($cust['email'] ?? '') . '</li>'
             .   '<li><strong>Telefon:</strong> ' . h($cust['phone'] ?? '') . '</li>';
    if (!empty($cust['message'])) {
        $html .= '<li><strong>Meddelande:</strong> ' . nl2br(h((string)$cust['message'])) . '</li>';
    }
    $html .=   '</ul>';

    $html .=   '<h3 style="margin:0 0 8px 0;color:' . h($brandColor) . ';">Förfrågan</h3>'
             . '<div style="display:flex;gap:16px;align-items:flex-start;border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:16px;">';
    if ($imgUrl) {
        $html .= '<div style="flex:0 0 90px;"><img src="' . h($imgUrl) . '" alt="' . h($variant['name'] ?? '') . '" style="width:90px;height:auto;border-radius:6px;border:1px solid #ddd;object-fit:cover;" /></div>';
    }
    $html .=     '<div style="flex:1;">'
             .     '<p style="margin:6px 0;"><strong>Material:</strong> ' . h($variant['name'] ?? '') . '</p>'
             .     '<p style="margin:6px 0;"><strong>Form:</strong> ' . h($ctx['shape'] ?? '') . '</p>';
    if (!empty($ctx['bench']['benchLengthMm'])) {
        $html .=   '<p style="margin:6px 0;">Indikernit ' . h((string)($ctx['bench']['benchLengthMm'] ?? '')) . ' × ' . h((string)($ctx['bench']['benchDepthMm'] ?? '')) . ' mm</p>';
    }
    $html .=     '<p style="margin:6px 0;font-weight:bold;font-size:15px;">Indikation: ' . number_format((float)($totals['total'] ?? 0), 0, ',', ' ') . ' kr</p>'
             .   '</div>'
             . '</div>';

    // Prisöversikt (ADMIN) – oförändrad, full breakdown inkl. mellansumma
    $html .=   '<h3 style="margin:16px 0 8px 0;color:' . h($brandColor) . ';">Prisöversikt</h3>'
             . '<ul style="margin:0 0 16px 18px;padding:0;color:#333;">'
             .   '<li>Materialkostnad: ' . number_format((float)($totals['benchMaterialCost'] ?? 0), 0, ',', ' ') . ' kr</li>'
             .   '<li>Öppningar: '       . number_format((float)($totals['openingsCost'] ?? 0),      0, ',', ' ') . ' kr</li>'
             .   '<li>Servicekostnad: '   . number_format((float)($totals['serviceCost'] ?? 0),       0, ',', ' ') . ' kr</li>'
             .   '<li>Mellansumma: '      . number_format((float)($totals['subtotal'] ?? 0),          0, ',', ' ') . ' kr</li>'
             .   '<li>Moms: '             . number_format((float)($totals['moms'] ?? 0),              0, ',', ' ') . ' kr</li>'
             .   '<li><strong>Total: '    . number_format((float)($totals['total'] ?? 0),             0, ',', ' ') . ' kr</strong></li>'
             . '</ul>';

    $html .=   '<h3 style="margin:16px 0 8px 0;color:' . h($brandColor) . ';">Tekniska detaljer</h3>'
             . '<ul style="margin:0 0 16px 18px;padding:0;color:#333;">';
    if (!empty($ctx['cutouts']['sink'])) { $s = $ctx['cutouts']['sink'];
        $html .= '<li>Diskho ' . h((string)($s['w'] ?? '')) . ' × ' . h((string)($s['d'] ?? '')) . ' mm (förskjutning ' . h((string)($s['x'] ?? '')) . ' × ' . h((string)($s['y'] ?? '')) . ')</li>';
    }
    if (!empty($ctx['cutouts']['hob'])) { $h = $ctx['cutouts']['hob'];
        $html .= '<li>Häll ' . h((string)($h['w'] ?? '')) . ' × ' . h((string)($h['d'] ?? '')) . ' mm (förskjutning ' . h((string)($h['x'] ?? '')) . ' × ' . h((string)($h['y'] ?? '')) . ')</li>';
    }
    if (!empty($ctx['faucet'])) {
        $html .= '<li>Blandare, diameter ' . h((string)($ctx['faucet']['diameter'] ?? '')) . ' mm</li>';
    }
    if (!empty($page['url'])) {
        $html .= '<li>Formulärkälla: ' . h((string)$page['url']) . '</li>';
    }
    $html .=   '</ul>'
             . '<div style="background:#fafafa;color:#666;text-align:center;padding:10px;font-size:12px;border-top:1px solid #eee;margin-top:20px;">© ' . h($year) . ' Marmorskivan.se – intern offertkopia</div>';

    $html .=   '</div></div></div>';

    return $html;
}

/* ========================= AltBody builders ========================= */
function buildCustomerAltText(array $data): string {
    $cust   = $data['customer'] ?? [];
    $quote  = $data['quote'] ?? [];
    $variant= $quote['variant'] ?? [];
    $totals = $quote['totals'] ?? [];
    $ctx    = $quote['context'] ?? [];

    $lines  = [];
    $lines[] = 'Hej ' . ($cust['name'] ?? '') . '! Tack för din offertförfrågan.';
    $lines[] = '';
    $lines[] = 'Material: ' . ($variant['name'] ?? '');
    $lines[] = 'Form: ' . ($ctx['shape'] ?? '');
    $lines[] = '';
    $lines[] = 'Prisöversikt (indikation):';
    $lines[] = '• Materialkostnad (ingår i totalsumman)';
    $lines[] = '• Öppningar (ingår i totalsumman)';
    $lines[] = '• Servicekostnad (ingår i totalsumman)';
    // Ingen "Mellansumma" i kundens alt-body
    $lines[] = '• Moms: ' . number_format((float)($totals['moms'] ?? 0), 0, ',', ' ') . ' kr';
    $lines[] = '• Total: ' . number_format((float)($totals['total'] ?? 0), 0, ',', ' ') . ' kr';
    $lines[] = '';
    $lines[] = 'Vad händer nu?';
    $lines[] = '1) Vi kontaktar dig för kostnadsfritt hembesök';
    $lines[] = '2) Mätning & genomgång på plats';
    $lines[] = '3) Uppdaterad offert & orderbekräftelse';
    $lines[] = '4) Produktion efter godkännande';
    $lines[] = '5) Leverans & montering';
    $lines[] = '';
    $lines[] = 'Boka tid: ' . absUrl('/boka-tid/');
    $lines[] = 'Kontakt: offert@marmorskivan.se';

    return implode("\n", $lines);
}

function buildAdminAltText(array $data): string {
    return 'Intern offertkopia (text).';
}

/* ========================= Request guard ========================= */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["ok"=>false,"error"=>'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
logQuote('Incoming send-quote', 'RAW: ' . $raw);

$payload = json_decode($raw, true);
if (!$payload || !is_array($payload)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["ok"=>false,"error"=>'No/invalid JSON']);
    exit;
}

/* ========================= Extract payload ========================= */
$cust    = $payload['customer']   ?? [];
$quote   = $payload['quote']      ?? [];
$variant = $quote['variant']      ?? [];
$totals  = $quote['totals']       ?? [];
$ctx     = $quote['context']      ?? [];

$name  = trim($cust['name']  ?? '');
$email = trim($cust['email'] ?? '');

if ($name === '' || $email === '') {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["ok"=>false,"error"=>'Namn och e-post krävs']);
    exit;
}

// Absolut bild-URL
if (!empty($variant['image'])) {
    $payload['quote']['variant']['image'] = absUrl($variant['image']);
}

/* ========================= Generera HTML/AltBody ========================= */
$customerHtml = buildCustomerHtml($payload);
$adminHtml    = buildAdminHtml($payload);

logQuote('Template generated (customer)', json_encode(['len' => strlen($customerHtml)]));
logQuote('Template generated (admin)', json_encode(['len' => strlen($adminHtml)]));

$customerAlt = buildCustomerAltText($payload);
$adminAlt    = buildAdminAltText($payload);

/* ========================= Send mails ========================= */
$customerOk = false;
$adminOk    = false;
$errors     = [];

// Kundmail
try {
    $m = buildMailer($cust);
    $m->isHTML(true);
    $m->addAddress($email, $name);
    $m->Subject = 'Tack för din offertförfrågan – Marmorskivan.se';
    $m->Body    = $customerHtml ?: '<p>Hej ' . h($name) . ', tack för din förfrågan!</p>';
    $m->AltBody = $customerAlt ?: 'Tack för din förfrågan!';
    $m->send();
    $customerOk = true;
} catch (Exception $e) {
    $errors[] = 'Kund: ' . $e->getMessage();
    logQuote('KUNDE INTE SKICKA till kund', $e->getMessage());
}

// Adminmail
try {
    $m2 = buildMailer($cust);
    $m2->isHTML(true);
    $m2->addAddress('offert@marmorskivan.se', 'Marmorskivan Admin');
    $m2->Subject = 'Ny offertförfrågan – ' . $name;
    $m2->Body    = $adminHtml ?: nl2br(h(json_encode($payload, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE)));
    $m2->AltBody = $adminAlt ?: 'Offert rådata: ' . json_encode($payload);
    $m2->send();
    $adminOk = true;
} catch (Exception $e) {
    $errors[] = 'Admin: ' . $e->getMessage();
    logQuote('KUNDE INTE SKICKA till admin', $e->getMessage());
}

// Fallback
if (!$customerOk) {
    try {
        $m3 = buildMailer($cust);
        $m3->isHTML(false);
        $m3->addAddress('offert@marmorskivan.se', 'Marmorskivan Admin');
        $m3->Subject = 'KUNDMAIL MISSLYCKADES – ' . $name;
        $fallback = "Kunden {$name} ({$email}) kunde inte få sin offert.\n\n"
                  . "Payload:\n" . json_encode($payload, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE) . "\n\n"
                  . "Fel:\n" . implode("\n", $errors);
        $m3->Body    = $fallback;
        $m3->AltBody = $fallback;
        $m3->send();
        logQuote('FALLBACK skickad till admin', 'kund misslyckades');
    } catch (Exception $e) {
        $errors[] = 'Fallback-admin: ' . $e->getMessage();
        logQuote('FALLBACK OCKSÅ MISSLYCKADES', $e->getMessage());
    }
}

/* ========================= Response ========================= */
header('Content-Type: application/json; charset=utf-8');
if ($customerOk && $adminOk) {
    echo json_encode(['ok'=>true, 'message'=>'Offert skickad']);
} else {
    echo json_encode([
        'ok'           => false,
        'error'        => $errors ? implode(' | ', $errors) : 'Kunde inte skicka',
        'customer_sent'=> $customerOk,
        'admin_sent'   => $adminOk
    ]);
}
