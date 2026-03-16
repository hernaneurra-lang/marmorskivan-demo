<?php
// /public_html/tack-for-offert.php
?><!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tack för din offertförfrågan – Marmorskivan.se</title>
  <link rel="stylesheet" href="/dist/output.css" /> <!-- Tailwind build (om du kör det) -->
  <style>
    body {
      margin: 0;
      padding: 0;
      background: url('/hero/hero.jpg') no-repeat center center fixed;
      background-size: cover;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    }
    .overlay {
      background: rgba(255, 255, 255, 0.88);
    }
  </style>
</head>
<body>
  <div class="overlay min-h-screen flex items-center justify-center">
    <div class="text-center max-w-lg mx-auto p-6 bg-white/90 rounded-2xl shadow-lg">
      <h1 class="text-2xl font-bold text-emerald-700 mb-4">Tack för din offertförfrågan!</h1>
      <p class="text-gray-700 mb-2">
        Vi har registrerat din offert och återkommer till dig inom <strong>24h</strong>.
      </p>
      <p class="text-gray-700 mb-6">
        Du får en bekräftelse via e-post inom kort.
      </p>
      <a href="https://marmorskivan.se"
         class="inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition">
        Tillbaka till marmorskivan.se
      </a>
    </div>
  </div>
</body>
</html>
