<?php
$quote   = $data['quote'] ?? [];
$sel     = $data['selections'] ?? [];
$variant = $quote['variant'] ?? [];
$totals  = $quote['totals'] ?? [];
$ctx     = $quote['context'] ?? [];
$cust    = $data['customer'] ?? [];
$brandColor = '#2e7d32';
$year = date('Y');

function h($s) { return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8'); }

$imgUrl = $variant['image'] ?? '';
?>
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:700px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8;">
    <div style="background:<?= $brandColor ?>;padding:16px;text-align:center;color:#fff;font-size:22px;font-weight:700;">
      marmorskivan.se
    </div>
    <div style="padding:20px;">
      <h2 style="margin:0 0 12px 0;color:#111;">Hej <?= h($cust['name']) ?>!</h2>
      <p style="margin:0 0 20px 0;color:#333;">
        Tack för din offertförfrågan! Nedan finner du en sammanfattning av din förfrågan och nästa steg i processen.
      </p>

      <!-- Stegindikator -->
      <div style="display:flex;justify-content:space-between;margin:20px 0;text-align:center;">
        <?php
        $steps = [
          ["Förfrågan","📩"],
          ["Offert","🧾"],
          ["Mätning","📐"],
          ["Installation","🛠️"]
        ];
        foreach ($steps as $s): ?>
          <div style="flex:1;">
            <div style="font-size:10px;"><?= $s[1] ?></div>
            <div style="font-size:10px;color:#555;"><?= $s[0] ?></div>
          </div>
        <?php endforeach; ?>
      </div>

      <!-- Sammanfattning -->
      <h3 style="margin:20px 0 8px 0;color:<?= $brandColor ?>;">Sammanfattning av din förfrågan</h3>
      <div style="display:flex;gap:16px;align-items:flex-start;border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:12px;">
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
          <p style="margin:6px 0;font-size:12px;color:#666;">
            💡 Priset är inklusive mätning, mallning och transport inom Stor-Stockholm och är en indikation. Ett exakt pris lämnas efter mätning på plats.
          </p>
          <?php if (!empty($cust['message'])): ?>
            <p style="margin:6px 0;"><strong>Meddelande:</strong> <?= nl2br(h($cust['message'])) ?></p>
          <?php endif; ?>
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

      <!-- Utsnitt och mått -->
      <h3 style="margin:16px 0 8px 0;color:<?= $brandColor ?>;">Utsnitt och mått</h3>
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
      </ul>

      <!-- Vad händer nu -->
      <h3 style="margin:16px 0 8px 0;color:<?= $brandColor ?>;">Vad händer nu?</h3>
      <ol style="margin:0 0 16px 18px;padding:0;color:#333;">
        <li>📞 Vi kontaktar dig för bokning av kostnadsfritt hembesök.</li>
        <li>📐 Vi måttar, mallar och går igenom detaljer på plats.</li>
        <li>🧾 Du får ett uppdaterat fast pris & orderbekräftelse.</li>
        <li>🛠️ Produktion startar efter godkännande & 50% förskott.</li>
        <li>🚚 Leverans & montering av bänkskivan hemma hos dig.</li>
      </ol>

      <!-- Bokningsknapp -->
      <div style="text-align:center;margin:20px 0;">
        <a href="https://marmorskivan.se/boka-tid/" style="display:inline-block;background:<?= $brandColor ?>;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600;">
          📅 Boka tid för hembesök
        </a>
      </div>

      <p style="margin:6px 0;color:#666;font-size:13px;">
        Vi återkommer så snabbt vi kan med en offert. Om du har några frågor under tiden är du välkommen att kontakta oss.
      </p>

      <div style="background:#fafafa;color:#666;text-align:center;padding:12px;font-size:12px;border-top:1px solid #eee;margin-top:20px;">
        © <?= $year ?> Marmorskivan.se – offert@marmorskivan.se
      </div>
    </div>
  </div>
</div>
