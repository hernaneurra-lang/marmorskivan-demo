<?php
// api/templates/admin-offert.html.php
$quote   = $data['quote'] ?? [];
$sel     = $data['selections'] ?? [];
$variant = $quote['variant'] ?? [];
$totals  = $quote['totals'] ?? [];
$ctx     = $quote['context'] ?? [];
$cust    = $data['customer'] ?? [];
$page    = $data['page'] ?? [];
$brandColor = '#2e7d32';
$year = date('Y');

function h($s) { return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8'); }

$imgUrl = $variant['image'] ?? '';
?>
<div style="font-family:Arial,Helvetica,sans-serif;background:#f9f9f9;padding:20px;">
  <div style="max-width:800px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #ddd;">
    <div style="background:<?= $brandColor ?>;padding:12px;text-align:center;color:#fff;font-size:20px;font-weight:700;">
      Ny offertförfrågan – marmorskivan.se
    </div>
    <div style="padding:20px;">

      <!-- Kundinfo -->
      <h3 style="margin:0 0 8px 0;color:#111;">Kundinformation</h3>
      <ul style="margin:0 0 16px 18px;padding:0;color:#333;">
        <li><strong>Namn:</strong> <?= h($cust['name']) ?></li>
        <li><strong>E-post:</strong> <?= h($cust['email']) ?></li>
        <li><strong>Telefon:</strong> <?= h($cust['phone']) ?></li>
        <?php if (!empty($cust['message'])): ?>
          <li><strong>Meddelande:</strong> <?= nl2br(h($cust['message'])) ?></li>
        <?php endif; ?>
      </ul>

      <!-- Offertinfo -->
      <h3 style="margin:0 0 8px 0;color:<?= $brandColor ?>;">Förfrågan</h3>
      <div style="display:flex;gap:16px;align-items:flex-start;border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:16px;">
        <?php if ($imgUrl): ?>
          <div style="flex:0 0 120px;">
            <img src="<?= h($imgUrl) ?>" alt="<?= h($variant['name']) ?>" style="width:120px;height:auto;border-radius:6px;border:1px solid #ddd;object-fit:cover;" />
          </div>
        <?php endif; ?>
        <div style="flex:1;">
          <p style="margin:6px 0;"><strong>Material:</strong> <?= h($variant['name']) ?></p>
          <p style="margin:6px 0;"><strong>Form:</strong> <?= h($ctx['shape']) ?></p>
          <?php if (!empty($ctx['bench']['benchLengthMm'])): ?>
            <p style="margin:6px 0;">Indikernit <?= $ctx['bench']['benchLengthMm'] ?> × <?= $ctx['bench']['benchDepthMm'] ?> mm</p>
          <?php endif; ?>
          <p style="margin:6px 0;font-weight:bold;font-size:15px;">
            Indikation: <?= number_format($totals['total'] ?? 0,0,","," ") ?> kr
          </p>
        </div>
      </div>

      <!-- Prisöversikt -->
      <h3 style="margin:16px 0 8px 0;color:<?= $brandColor ?>;">Prisöversikt</h3>
      <ul style="margin:0 0 16px 18px;padding:0;color:#333;">
        <li>Materialkostnad: <?= number_format($totals['benchMaterialCost'] ?? 0,0,","," ") ?> kr</li>
        <li>Öppningar: <?= number_format($totals['openingsCost'] ?? 0,0,","," ") ?> kr</li>
        <li>Servicekostnad: <?= number_format($totals['serviceCost'] ?? 0,0,","," ") ?> kr</li>
        <li>Mellansumma: <?= number_format($totals['subtotal'] ?? 0,0,","," ") ?> kr</li>
        <li>Moms: <?= number_format($totals['moms'] ?? 0,0,","," ") ?> kr</li>
        <li><strong>Total: <?= number_format($totals['total'] ?? 0,0,","," ") ?> kr</strong></li>
      </ul>

      <!-- Tekniska detaljer -->
      <h3 style="margin:16px 0 8px 0;color:<?= $brandColor ?>;">Tekniska detaljer</h3>
      <ul style="margin:0 0 16px 18px;padding:0;color:#333;">
        <?php if (!empty($ctx['cutouts']['sink'])): $s=$ctx['cutouts']['sink']; ?>
          <li>Diskho <?= $s['w'] ?> × <?= $s['d'] ?> mm (förskjutning <?= $s['x'] ?> × <?= $s['y'] ?>)</li>
        <?php endif; ?>
        <?php if (!empty($ctx['cutouts']['hob'])): $h=$ctx['cutouts']['hob']; ?>
          <li>Häll <?= $h['w'] ?> × <?= $h['d'] ?> mm (förskjutning <?= $h['x'] ?> × <?= $h['y'] ?>)</li>
        <?php endif; ?>
        <?php if (!empty($ctx['faucet'])): ?>
          <li>Blandare, diameter <?= $ctx['faucet']['diameter'] ?> mm</li>
        <?php endif; ?>
        <?php if (!empty($page['url'])): ?>
          <li>Formulärkälla: <?= h($page['url']) ?></li>
        <?php endif; ?>
      </ul>

      <div style="background:#fafafa;color:#666;text-align:center;padding:10px;font-size:12px;border-top:1px solid #eee;margin-top:20px;">
        © <?= $year ?> Marmorskivan.se – intern offertkopia
      </div>
    </div>
  </div>
</div>
