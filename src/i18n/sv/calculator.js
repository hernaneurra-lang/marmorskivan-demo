export default {
  extraSurfaces: {
    title: "Extra ytor (rektangulära)",
    sum: "Summa",
    add: "Lägg till yta",
    removeTitle: "Ta bort yta",
    maxText: "Max {{max}} extra ytor. Fler kan läggas till vid konsultation.",
    lengthLabel: "Längd (mm) – Yta {{index}}",
    depthLabel: "Djup (mm) – Yta {{index}}",
  },

  measurementGuide: {
    title: "Mätguide (mm)",
    desc:
      "Längd/djup per del: L1/D1, L2/D2, L3/D3 … Köksö: Lk/Dk (Lk1/Dk1, …). Extra ytor fortsätter numreringen (L4/D4, L5/D5, …). Alla mått visas utanför figuren.",
    enlarge: "Förstora",
    modalTitle: "Mätguide – förstorad",
    close: "Stäng",
    legend: {
      bench: "Bänkskiva",
      sink: "Urtag diskho",
      hob: "Urtag spishäll",
      faucet: "Hål för blandare",
    },
  },

  edges: {
    title: "Kantbearbetning",
    hint: "Synliga kanter som inte ligger mot vägg behöver kantbearbetas.",
    options: {
      fasad: { label: "Fasad", info: "45° fasad kant – tydlig och krispig profil." },
      avrundad: { label: "Avrundad", info: "Lätt avrundning – mjukare känsla." },
      halvrund: { label: "Halvrund", info: "Halvrund profil – mer avrundning." },
      rundad: { label: "Rundad", info: "Helrund – maximal mjukhet." },
    },
    preview: {
      close: "Stäng",
      closeTitle: "Stäng",
      noDesc: "Ingen beskrivning.",
      disclaimer: "Förhandsvisningen är schematisk. Exakt profil anpassas efter vald sten.",
    },
    inputs: {
      visibleEdges: "Totalt synliga kanter (mm)",
      visibleEdgesPlaceholder: "t.ex. 4800",
    },
    island: { title: "Köksö (auto)", hint: "Beräknas runt köksön." },
    backsplash: { title: "Stänkskydd (kanter)", hint: "Summeras från stänkskyddsrader." },
  },

  calc: {
    kitchenShape: {
      title: "Köksform",
      islandOnlyHint: "Endast köksö – ange mått nedan.",
    },
    island: { title: "Köksö" },

    shapes: {
      straight: "Rak",
      straightIsland: "Rak + köksö",
      l: "L-form",
      lIsland: "L-form + köksö",
      u: "U-form",
      uIsland: "U-form + köksö",
      islandOnly: "Endast köksö",
    },

    inputs: {
      surface_length: "Längd (mm) – del {{index}}",
      surface_depth: "Djup (mm) – del {{index}}",
      legA_length: "L1 (mm)",
      legA_depth: "D1 (mm)",
      legB_length: "L2 (mm)",
      legB_depth: "D2 (mm)",
      u_depth: "Djup (mm)",
      u_left: "Vänster ben (mm)",
      u_center: "Mitten (mm)",
      u_right: "Höger ben (mm)",
      island_length: "Längd (mm)",
      island_depth: "Djup (mm)",
    },

    actions: {
      addSurface: "Lägg till yta",
      removeSurface: "Ta bort yta",
      maxSurfaces: "Max 4 ytor.",
      changeMaterial: "Byt material",
      browseAll: "Bläddra alla",
    },

    // ✅ UPPDATERAD: Prisöversikt – nya nycklar som din nya CalculatorPage förväntar sig
    priceOverview: {
      title: "Prisöversikt",

      // blocks.* används i nya “tvåkolumniga detaljer”
      blocks: {
        stone: "Sten & Yta",
        execution: "Utförande",
        selectedExtras: "Valda tillval",
        processing: "Bearbetning",
      },

      // lines.* används i klumpsummorna
      lines: {
        material: "Material",
        edges: "Kanter",
        backsplash: "Stänkskydd",
        openings: "Öppningar & tillval",
        service: "Service",

        // ✅ nya som används i din nya prisöversikt
        extras: "Produkter & Tillval",
        stoneBundle: "Sten inkl. entreprenad*",
      },

      polishing: "polering",
      noExtras: "Inga tillval valda",

      estimatedTotal: "Estimerat totalpris",
      includesService: "*Inkl. mätning & montage",
      inclVat: "Inkl. moms",

      // äldre labels (kan ligga kvar om du har gamla UI-delar kvar)
      selectedStone: "Vald sten",
      totalArea: "Total yta:",
      vat: "Moms",
      total: "Totalt",
    },

    backsplash: {
      title: "Stänkskydd",
      add: "Lägg till stänkskydd",
      empty: "Inga stänkskydd har lagts till ännu.",
      remove: "Ta bort",
      removeTitle: "Ta bort",
      fields: { length: "Längd (mm)", height: "Höjd (mm)" },
      mmPlaceholder: "mm",
    },

    // ✅ användes i din nya list-rendering som fallback (om item saknar namn/title)
    misc: {
      item: "Produkt",
    },
  },

  openings: {
    title: "Öppningar & tillval",
    tabs: { sink: "Diskho", faucet: "Blandare", hob: "Spishäll" },
    count: { sinks: "Diskhoar", faucets: "Blandare", hobs: "Spishällar" },
    mode: { catalog: "Välj från vår katalog", own: "Jag köper själv", none: "Jag ska ej ha" },
    selectedCount: "Valda ({{count}}/{{max}}):",
    noneSelectedYet: "Inget valt ännu.",
    ownHint: "Antal styrs från rullisterna ovan. Inga produkter behöver väljas här.",
    noneHint: "Ej aktuellt.",
    mountTitle: "Montering",
    mountPreviewHint: "Klicka för större bild",
    mountInfoMissing: "Monteringsinformation saknas.",

    mount: {
      sink: { over: "Övermonterad", flush: "Planlimmad", under: "Underlimmad", recess: "Underfräst" },
      hob: { over: "Övermonterad", flush: "Planlimmad" },
    },

    mountDesc: {
      sink: {
        over: "Övermonterad: Diskhon ligger ovanpå skivan, med synlig kantlist. Enkelt byte och montage.",
        flush: "Planlimmad: Diskhon ligger i plan med skivans ovansida. Kräver spårfräsning/planlimning.",
        under: "Underlimmad: Diskhon limmas underifrån. Synlig stenkant runt öppningen – elegant och praktiskt.",
        recess: "Underfräst: Undersidan fräses ur för en tunnare visuell kant vid hon. Ger ett exklusivt intryck.",
      },
      hob: {
        over: "Övermonterad: Spishällen vilar ovanpå skivan. Standardlösning med enkel montering.",
        flush: "Planlimmad: Spishällen ligger i plan med skivan. Kräver fräsning/planlimning för perfekt passning.",
      },
    },

    actions: {
      add: "Lägg till",
      addMore: "Lägg till fler",
      replace: "Byt ut",
      replaceWithThis: "Byt ut med denna",
      remove: "Ta bort",
      clear: "Rensa",
      moreInfo: "Mer info",
      lessInfo: "Mindre info",
      clearSelection: "Rensa val",
      saveSelection: "Spara val",
    },

    catalog: {
      title: "Välj från vår katalog",
      searchPlaceholder: "Sök i namn, märke, modell, specs…",
      selected: "Valda:",
      chosen: "Valda:",
      priceFrom: "Pris från:",
      moreSpecs: "…fler specifikationer",
      allSpecs: "Alla specifikationer",
      noSpecs: "Specifikationer saknas.",
      category: "Kategori:",
      product: "produkt",
      confirmAdd: "Vill du lägga till “{{name}}” och spara dina val?",
      zeroAllowed: "Antalet i rullistan är 0. Öka antalet om du vill lägga till.",
      maxReached: "Du har redan valt max {{max}} st. Öka antalet i rullistan om du vill lägga till fler.",
    },

    sink: { title: "Diskho" },
    faucet: { title: "Blandare" },
    hob: { title: "Spishäll" },

    // ✅ Dessa används nu i prisöversikten: t("calc.openings.hob") / t("calc.openings.faucet")
    // Om din kod använder calc.openings.* istället, kan du låta dem ligga där också.
    // Men detta är bra att ha i openings.* om andra komponenter använder dem.
    // (Vi lägger dem även i calc.openings nedan om du vill ha full kompatibilitet.)
  },

  // ✅ Extra kompatibilitet om din CalculatorPage använder calc.openings.*
  // (Dina senaste versioner har använt t("calc.openings.hob") / t("calc.openings.faucet"))
  calc_openings: undefined,

  // ✅ Lägg calc.openings här om du vill ha exakt match med t("calc.openings.*")
  // Jag lägger den under calc också för att inte skapa en ny topp-nyckel.
  // (Detta är den säkra vägen så inget “tappas”.)
  calc: {
    kitchenShape: {
      title: "Köksform",
      islandOnlyHint: "Endast köksö – ange mått nedan.",
    },
    island: { title: "Köksö" },
    shapes: {
      straight: "Rak",
      straightIsland: "Rak + köksö",
      l: "L-form",
      lIsland: "L-form + köksö",
      u: "U-form",
      uIsland: "U-form + köksö",
      islandOnly: "Endast köksö",
    },
    inputs: {
      surface_length: "Längd (mm) – del {{index}}",
      surface_depth: "Djup (mm) – del {{index}}",
      legA_length: "L1 (mm)",
      legA_depth: "D1 (mm)",
      legB_length: "L2 (mm)",
      legB_depth: "D2 (mm)",
      u_depth: "Djup (mm)",
      u_left: "Vänster ben (mm)",
      u_center: "Mitten (mm)",
      u_right: "Höger ben (mm)",
      island_length: "Längd (mm)",
      island_depth: "Djup (mm)",
    },
    actions: {
      addSurface: "Lägg till yta",
      removeSurface: "Ta bort yta",
      maxSurfaces: "Max 4 ytor.",
      changeMaterial: "Byt material",
      browseAll: "Bläddra alla",
    },
    priceOverview: {
      title: "Prisöversikt",
      blocks: {
        stone: "Sten & Yta",
        execution: "Utförande",
        selectedExtras: "Valda tillval",
        processing: "Bearbetning",
      },
      lines: {
        material: "Material",
        edges: "Kanter",
        backsplash: "Stänkskydd",
        openings: "Öppningar & tillval",
        service: "Service",
        extras: "Produkter & Tillval",
        stoneBundle: "Sten inkl. entreprenad*",
      },
      polishing: "polering",
      noExtras: "Inga tillval valda",
      estimatedTotal: "Estimerat totalpris",
      includesService: "*Inkl. mätning & montage",
      inclVat: "Inkl. moms",
      selectedStone: "Vald sten",
      totalArea: "Total yta:",
      vat: "Moms",
      total: "Totalt",
    },
    backsplash: {
      title: "Stänkskydd",
      add: "Lägg till stänkskydd",
      empty: "Inga stänkskydd har lagts till ännu.",
      remove: "Ta bort",
      removeTitle: "Ta bort",
      fields: { length: "Längd (mm)", height: "Höjd (mm)" },
      mmPlaceholder: "mm",
    },
    misc: {
      item: "Produkt",
    },

    // ✅ används i prisöversiktens “Bearbetning”
    openings: {
      hob: "Hällurtag",
      faucet: "Blandarhål",
    },
  },

  thickness: {
    title: "Tjocklek",
    subtitle: "Välj tjocklek för vald sten",
  },

  offert: {
    title: "Fyll i offertförfrågan",
    openButton: "Begär offert",
    fields: {
      name: "Namn *",
      email: "E-post *",
      phone: "Telefon",
      city: "Kommun",
      address: "Adress (valfritt)",
      message: "Meddelande (valfritt)",
    },
    placeholders: { city: "t.ex. Västerås", message: "Beskriv kort vad du planerar" },
    actions: { submit: "Skicka förfrågan", cancel: "Avbryt" },
  },
};
