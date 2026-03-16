// Path: src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * Central i18n-fil
 * - Samma keys för SV / EN
 * - site.js är språkneutral
 * - ALL text ska ligga här
 *
 * OBS:
 * - Enhetliga keys enligt komponenterna:
 *   - EdgeTreatmentSection.jsx => edges.*
 *   - BacksplashSection.jsx    => calc.backsplash.*
 *   - ExtraSurfacesSection.jsx => extraSurfaces.*
 *   - MaterialsSection.jsx     => materialsSection.*
 *   - MeasurementGuide.jsx     => measurementGuide.*
 * - Legacy keys (edgeTreatment, backsplash) är borttagna.
 */

const resources = {
  /* =====================================================
     🇸🇪 SVENSKA
  ===================================================== */
  sv: {
    translation: {
      /* -------------------- COMMON -------------------- */
      common: {
        brand: "marmorskivan.se",
        ctaCalculate: "Beräkna & begär offert",
        orderNow: "Beställ nu →",
        close: "Stäng",
        cancel: "Avbryt",
        send: "Skicka",
        copyright: "marmorskivan.se © 2025",
      },

      lang: {
        sv: "SV",
        en: "EN",
      },

      /* -------------------- NAV / APP -------------------- */
      nav: {
        calculator: "Kalkylator",
        materials: "Material",
      },

      app: {
        hero: {
          titleMaterials: "Välj material",
          titleCalculator: "Kalkylator",
          descMaterials: "Filtrera och välj din sten. Pris per m² visas på varje material.",
          descCalculator:
            "Måtta, välj kantbearbetning, stänkskydd samt öppningar & tillval. Priset uppdateras löpande.",
        },
        tooltips: {
          pickFirst: "Välj material först",
          calc: "Kalkylator",
        },
      },

      /* -------------------- LANDING -------------------- */
      landing: {
        hero: {
          title: "Måttbeställ din bänkskiva online",
          desc: "Välj material, ange mått och få pris direkt. Offerten skickas till din e-post.",
        },

        process: {
          title: "Så går det till – steg för steg",
          steps: [
            { title: "Välj sten", desc: "Bläddra bland våra material och hitta din favorit." },
            { title: "Ange mått & tillval", desc: "Fyll i mått/värden och lägg till önskade tillval." },
            { title: "Offert skickas", desc: "Vi får din förfrågan och du får en kopia via e-post." },
            { title: "Kontakt inom 24 h", desc: "Vi bokar tid för kostnadsfri mätning." },
            { title: "Kostnadsfri mätning", desc: "Vi kommer ut och mäter just ditt projekt." },
            { title: "Fast pris – allt inkluderat", desc: "Du får en tydlig offert med fast totalpris." },
            { title: "Boka montering", desc: "När stenen är klar bokar vi montering." },
            { title: "Montering & 10 års garanti", desc: "Du får garantiintyg (10 år)." },
            { title: "Långsiktig skötsel", desc: "Vi erbjuder service & försegling." },
          ],
        },

        trend: {
          title: "Populära material just nu",
          badge: "Trend",
          orderHint: "Beställ denna till ditt kök nu!",
          tiles: {
            calacattaAntique: {
              title: "Calacatta Antique",
              subtitle: "Exklusiv italiensk marmor med kräm-, guld- och bruna toner.",
            },
            casaBlanca: {
              title: "Casa Blanca",
              subtitle: "Brasiliansk granit i vita, grå och svarta toner.",
            },
            crystalQuartzBlue: {
              title: "Crystal Quartz Blue",
              subtitle: "Halvädelsten från Brasilien med blå-vita nyanser.",
            },
            patagonia: {
              title: "Patagonia",
              subtitle: "Kvartsit från Brasilien med kräm-, bruna och vinröda toner.",
            },
          },
        },

        footer: {
          garanti: "10 års garanti",
          underhall: "Underhåll",
          villkor: "Avtals- & köpvillkor",
          integritet: "Integritetspolicy",
          hallbarhet: "Hållbarhet",
        },
      },

      /* -------------------- MODALS -------------------- */
      modal: {
        garanti: "10 års garanti",
        underhall: "Underhåll & skötsel",
        villkor: "Avtals- & köpvillkor",
        integritet: "Integritetspolicy",
        hallbarhet: "Hållbarhet",
      },

      /* -------------------- MATERIAL PAGE UI -------------------- */
      materialsPage: {
        title: "Material",
        subtitle: "Välj sten och tjocklek för att fortsätta.",
        searchPlaceholder: "Sök material… (namn, kategori eller tjocklek)",
        filterAll: "Alla",
        showing: "Visar {{count}} material",
        loading: "Laddar material…",
        noResults: "Inget material matchade din filtrering.",
        clickToEnlarge: "Klicka för större bild",
        thickness: "Tjocklek:",
        choose: "Välj",
        chooseTitle: "Välj detta material",
        moreInfo: "Mer info",
        moreInfoTitle: "Visa större bild och info",
        modalTitle: "Mer info",
        close: "Stäng",
        closeAria: "Stäng",
        csvErrorPrefix: "Kunde inte läsa materials.csv:",
        priceOnRequest: "Pris lämnas vid förfrågan",
      },

      /* -------------------- MATERIALS -------------------- */
      materials: {
        links: {
          title: "Läs mer om materialen",
          desc: "Upptäck skillnaderna mellan marmor, granit, komposit och andra stensorter.",
        },

        names: {
          marble: "Marmor",
          granite: "Granit",
          composite: "Komposit",
          onyx: "Onyx",
          limestone: "Kalksten",
          terrazzo: "Terrazzo",
          quartzite: "Kvartsit",
          travertine: "Travertin",
          semiPrecious: "Semi Precious",
          recycledGlass: "Återvunnet glas",
        },

        categories: {
          compositeStone: "Kompositsten",
          granite: "Granit",
          ceramic: "Keramik",
          limestone: "Kalksten",
          marble: "Marmor",
          terrazzo: "Terrazzo",
          quartzite: "Kvartsit",
          semiPrecious: "Semi Precious",
          quartziteTranslucent: "Kvartsit (Translucent)",
          onyx: "Onyx",
          travertine: "Travertin",
        },
      },

      /* -------------------- ExtraSurfacesSection.jsx -------------------- */
      extraSurfaces: {
        title: "Extra ytor (rektangulära)",
        sum: "Summa",
        add: "Lägg till yta",
        removeTitle: "Ta bort yta",
        maxText: "Max {{max}} extra ytor. Fler kan läggas till vid konsultation.",
        lengthLabel: "Längd (mm) – Yta {{index}}",
        depthLabel: "Djup (mm) – Yta {{index}}",
      },

      /* -------------------- MaterialsSection.jsx -------------------- */
      materialsSection: {
        title: "Valt material",
        enlargeTitle: "Förstora",
        priceOnRequest: "Pris lämnas vid förfrågan",
        priceDisclaimer:
          "Priset för detta material ingår inte i beräkningen. Du får korrekt pris i offerten.",
        changeLabel: "Byt material",
        searchPlaceholder: "Börja skriva (t.ex. calacatta)…",
        csvErrorPrefix: "Kunde inte läsa materials.csv:",
        loading: "Laddar…",
        noHits: "Inga träffar.",
        pickTitle: "Välj detta material",
        browseTitle: "Öppna materialsidan",
        browseAll: "Bläddra alla material",
      },

      /* -------------------- MeasurementGuide.jsx -------------------- */
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

      /* -------------------- EdgeTreatmentSection.jsx -------------------- */
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

        island: {
          title: "Köksö (auto)",
          hint: "Beräknas runt köksön.",
        },

        backsplash: {
          title: "Stänkskydd (kanter)",
          hint: "Summeras från stänkskyddsrader.",
        },
      },

      /* -------------------- CALCULATOR -------------------- */
      calc: {
        kitchenShape: {
          title: "Köksform",
          islandOnlyHint: "Endast köksö – ange mått nedan.",
        },

        island: {
          title: "Köksö",
        },

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
        },

        priceOverview: {
          title: "Prisöversikt",
          selectedStone: "Vald sten",
          totalArea: "Total yta:",
          lines: {
            material: "Material",
            edges: "Kanter",
            backsplash: "Stänkskydd",
            openings: "Öppningar & tillval",
            service: "Service",
          },
          vat: "Moms",
          total: "Totalt",
        },

        /* -------------------- BacksplashSection.jsx -------------------- */
        backsplash: {
          title: "Stänkskydd",
          add: "Lägg till stänkskydd",
          empty: "Inga stänkskydd har lagts till ännu.",
          remove: "Ta bort",
          removeTitle: "Ta bort",
          fields: {
            length: "Längd (mm)",
            height: "Höjd (mm)",
          },
          mmPlaceholder: "mm",
        },
      },

      /* -------------------- OPENINGS -------------------- */
      openings: {
        title: "Öppningar & tillval",

        tabs: {
          sink: "Diskho",
          faucet: "Blandare",
          hob: "Spishäll",
        },

        count: {
          sinks: "Diskhoar",
          faucets: "Blandare",
          hobs: "Spishällar",
        },

        mode: {
          catalog: "Välj från vår katalog",
          own: "Jag köper själv",
          none: "Jag ska ej ha",
        },

        selectedCount: "Valda ({{count}}/{{max}}):",
        noneSelectedYet: "Inget valt ännu.",

        ownHint: "Antal styrs från rullisterna ovan. Inga produkter behöver väljas här.",
        noneHint: "Ej aktuellt.",

        mountTitle: "Montering",
        mountPreviewHint: "Klicka för större bild",
        mountInfoMissing: "Monteringsinformation saknas.",

        mount: {
          sink: {
            over: "Övermonterad",
            flush: "Planlimmad",
            under: "Underlimmad",
            recess: "Underfräst",
          },
          hob: {
            over: "Övermonterad",
            flush: "Planlimmad",
          },
        },

        mountDesc: {
          sink: {
            over:
              "Övermonterad: Diskhon ligger ovanpå skivan, med synlig kantlist. Enkelt byte och montage.",
            flush:
              "Planlimmad: Diskhon ligger i plan med skivans ovansida. Kräver spårfräsning/planlimning.",
            under:
              "Underlimmad: Diskhon limmas underifrån. Synlig stenkant runt öppningen – elegant och praktiskt.",
            recess:
              "Underfräst: Undersidan fräses ur för en tunnare visuell kant vid hon. Ger ett exklusivt intryck.",
          },
          hob: {
            over:
              "Övermonterad: Spishällen vilar ovanpå skivan. Standardlösning med enkel montering.",
            flush:
              "Planlimmad: Spishällen ligger i plan med skivan. Kräver fräsning/planlimning för perfekt passning.",
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
          maxReached:
            "Du har redan valt max {{max}} st. Öka antalet i rullistan om du vill lägga till fler.",
        },

        sink: { title: "Diskho" },
        faucet: { title: "Blandare" },
        hob: { title: "Spishäll" },
      },

      /* -------------------- OFFERT DIALOG -------------------- */
      offert: {
        title: "Skicka offertförfrågan",
        openButton: "Skicka offertförfrågan",
        fields: {
          name: "Namn *",
          email: "E-post *",
          phone: "Telefon",
          city: "Kommun",
          address: "Adress (valfritt)",
          message: "Meddelande (valfritt)",
        },
        placeholders: {
          city: "t.ex. Västerås",
          message: "Beskriv kort vad du planerar",
        },
        actions: {
          submit: "Skicka förfrågan",
          cancel: "Avbryt",
        },
      },
    },
  },

  /* =====================================================
     🇬🇧 ENGLISH
  ===================================================== */
  en: {
    translation: {
      common: {
        brand: "marmorskivan.se",
        ctaCalculate: "Calculate & request quote",
        orderNow: "Order now →",
        close: "Close",
        cancel: "Cancel",
        send: "Send",
        copyright: "marmorskivan.se © 2025",
      },

      lang: { sv: "SV", en: "EN" },

      nav: {
        calculator: "Calculator",
        materials: "Materials",
      },

      app: {
        hero: {
          titleMaterials: "Choose material",
          titleCalculator: "Calculator",
          descMaterials: "Filter and choose your stone. Price per m² is shown on each material.",
          descCalculator:
            "Enter measurements, choose edge finishing, backsplash, cutouts & options. Price updates continuously.",
        },
        tooltips: {
          pickFirst: "Choose a material first",
          calc: "Calculator",
        },
      },

      landing: {
        hero: {
          title: "Order your worktop online",
          desc: "Choose material, enter measurements and get an instant price. The quote is sent to your email.",
        },

        process: {
          title: "How it works – step by step",
          steps: [
            { title: "Choose stone", desc: "Browse our materials and find your favourite." },
            { title: "Enter measurements & options", desc: "Fill in measurements and add desired options." },
            { title: "Quote sent", desc: "We receive your request and send a copy by email." },
            { title: "Contact within 24h", desc: "We book a free on-site measurement." },
            { title: "Free measurement", desc: "We visit and measure your project." },
            { title: "Fixed price – all included", desc: "You receive a clear quote with a fixed total price." },
            { title: "Book installation", desc: "When the stone is ready we schedule installation." },
            { title: "Installation & 10-year warranty", desc: "You receive a 10-year warranty certificate." },
            { title: "Long-term care", desc: "We offer service & sealing." },
          ],
        },

        trend: {
          title: "Popular materials right now",
          badge: "Trending",
          orderHint: "Order this for your kitchen now!",
          tiles: {
            calacattaAntique: {
              title: "Calacatta Antique",
              subtitle: "Exclusive Italian marble with cream, gold and brown tones.",
            },
            casaBlanca: {
              title: "Casa Blanca",
              subtitle: "Brazilian granite in white, grey and black tones.",
            },
            crystalQuartzBlue: {
              title: "Crystal Quartz Blue",
              subtitle: "Semi-precious stone from Brazil with blue and white tones.",
            },
            patagonia: {
              title: "Patagonia",
              subtitle: "Brazilian quartzite with cream, brown and wine-red tones.",
            },
          },
        },

        footer: {
          garanti: "10-year warranty",
          underhall: "Maintenance",
          villkor: "Terms & conditions",
          integritet: "Privacy policy",
          hallbarhet: "Sustainability",
        },
      },

      modal: {
        garanti: "10-year warranty",
        underhall: "Maintenance & care",
        villkor: "Terms & conditions",
        integritet: "Privacy policy",
        hallbarhet: "Sustainability",
      },

      materialsPage: {
        title: "Materials",
        subtitle: "Choose stone and thickness to continue.",
        searchPlaceholder: "Search materials… (name, category or thickness)",
        filterAll: "All",
        showing: "Showing {{count}} materials",
        loading: "Loading materials…",
        noResults: "No materials matched your filter.",
        clickToEnlarge: "Click to enlarge",
        thickness: "Thickness:",
        choose: "Select",
        chooseTitle: "Select this material",
        moreInfo: "More info",
        moreInfoTitle: "View larger image and info",
        modalTitle: "More info",
        close: "Close",
        closeAria: "Close",
        csvErrorPrefix: "Could not read materials.csv:",
        priceOnRequest: "Price on request",
      },

      materials: {
        links: {
          title: "Learn more about the materials",
          desc: "Discover the differences between marble, granite, composite and other types of stone.",
        },

        names: {
          marble: "Marble",
          granite: "Granit",
          composite: "Composite",
          onyx: "Onyx",
          limestone: "Limestone",
          terrazzo: "Terrazzo",
          quartzite: "Quartzite",
          travertine: "Travertine",
          semiPrecious: "Semi-precious",
          recycledGlass: "Recycled glass",
        },

        categories: {
          compositeStone: "Composite stone",
          granite: "Granite",
          ceramic: "Ceramic",
          limestone: "Limestone",
          marble: "Marble",
          terrazzo: "Terrazzo",
          quartzite: "Quartzite",
          semiPrecious: "Semi-precious",
          quartziteTranslucent: "Quartzite (Translucent)",
          onyx: "Onyx",
          travertine: "Travertine",
        },
      },

      extraSurfaces: {
        title: "Extra surfaces (rectangular)",
        sum: "Sum",
        add: "Add surface",
        removeTitle: "Remove surface",
        maxText: "Max {{max}} extra surfaces. More can be added during consultation.",
        lengthLabel: "Length (mm) – Surface {{index}}",
        depthLabel: "Depth (mm) – Surface {{index}}",
      },

      materialsSection: {
        title: "Selected material",
        enlargeTitle: "Enlarge",
        priceOnRequest: "Price on request",
        priceDisclaimer:
          "The price for this material is not included in the calculation. You will receive the correct price in the quote.",
        changeLabel: "Change material",
        searchPlaceholder: "Start typing (e.g. calacatta)…",
        csvErrorPrefix: "Could not read materials.csv:",
        loading: "Loading…",
        noHits: "No results.",
        pickTitle: "Select this material",
        browseTitle: "Open materials page",
        browseAll: "Browse all materials",
      },

      measurementGuide: {
        title: "Measurement guide (mm)",
        desc:
          "Length/depth per part: L1/D1, L2/D2, L3/D3 … Island: Lk/Dk (Lk1/Dk1, …). Extra surfaces continue numbering (L4/D4, L5/D5, …). All dimensions are shown outside the figure.",
        enlarge: "Enlarge",
        modalTitle: "Measurement guide – enlarged",
        close: "Close",

        legend: {
          bench: "Worktop surface",
          sink: "Sink cutout",
          hob: "Hob cutout",
          faucet: "Tap hole",
        },
      },

      edges: {
        title: "Edge treatment",
        hint: "Visible edges that are not against a wall require edge finishing.",

        options: {
          fasad: { label: "Chamfer", info: "45° chamfered edge – crisp profile." },
          avrundad: { label: "Rounded", info: "Light rounding – softer feel." },
          halvrund: { label: "Half bullnose", info: "Half-round profile – more rounding." },
          rundad: { label: "Full bullnose", info: "Full rounding – maximum softness." },
        },

        preview: {
          close: "Close",
          closeTitle: "Close",
          noDesc: "No description.",
          disclaimer: "Preview is schematic. The exact profile is adapted to the selected stone.",
        },

        inputs: {
          visibleEdges: "Total visible edges (mm)",
          visibleEdgesPlaceholder: "e.g. 4800",
        },

        island: {
          title: "Island (auto)",
          hint: "Calculated around the island.",
        },

        backsplash: {
          title: "Backsplash (edges)",
          hint: "Summed from backsplash rows.",
        },
      },

      calc: {
        kitchenShape: {
          title: "Kitchen shape",
          islandOnlyHint: "Island only – enter dimensions below.",
        },

        island: { title: "Kitchen island" },

        shapes: {
          straight: "Straight",
          straightIsland: "Straight + island",
          l: "L-shape",
          lIsland: "L-shape + island",
          u: "U-shape",
          uIsland: "U-shape + island",
          islandOnly: "Island only",
        },

        inputs: {
          surface_length: "Length (mm) – part {{index}}",
          surface_depth: "Depth (mm) – part {{index}}",

          legA_length: "L1 (mm)",
          legA_depth: "D1 (mm)",
          legB_length: "L2 (mm)",
          legB_depth: "D2 (mm)",

          u_depth: "Depth (mm)",
          u_left: "Left leg (mm)",
          u_center: "Center (mm)",
          u_right: "Right leg (mm)",

          island_length: "Length (mm)",
          island_depth: "Depth (mm)",
        },

        actions: {
          addSurface: "Add surface",
          removeSurface: "Remove surface",
          maxSurfaces: "Max 4 surfaces.",
        },

        priceOverview: {
          title: "Price overview",
          selectedStone: "Selected stone",
          totalArea: "Total area:",
          lines: {
            material: "Material",
            edges: "Edges",
            backsplash: "Backsplash",
            openings: "Cutouts & options",
            service: "Service",
          },
          vat: "VAT",
          total: "Total",
        },

        backsplash: {
          title: "Backsplash",
          add: "Add backsplash",
          empty: "No backsplashes added yet.",
          remove: "Remove",
          removeTitle: "Remove",
          fields: {
            length: "Length (mm)",
            height: "Height (mm)",
          },
          mmPlaceholder: "mm",
        },
      },

      openings: {
        title: "Cutouts & options",

        tabs: { sink: "Sink", faucet: "Faucet", hob: "Hob" },

        count: { sinks: "Sinks", faucets: "Faucets", hobs: "Hobs" },

        mode: {
          catalog: "Choose from our catalogue",
          own: "I will buy myself",
          none: "I won’t have this",
        },

        selectedCount: "Selected ({{count}}/{{max}}):",
        noneSelectedYet: "Nothing selected yet.",

        ownHint: "Quantity is controlled by the dropdowns above. No products need to be selected here.",
        noneHint: "Not applicable.",

        mountTitle: "Mounting",
        mountPreviewHint: "Click for a larger image",
        mountInfoMissing: "Mounting information is missing.",

        mount: {
          sink: {
            over: "Overmount",
            flush: "Flushmount",
            under: "Undermount",
            recess: "Recessed underside",
          },
          hob: { over: "Overmount", flush: "Flushmount" },
        },

        mountDesc: {
          sink: {
            over: "Overmount: The sink sits on top of the worktop, with a visible rim.",
            flush: "Flushmount: The sink is flush with the surface. Requires routing.",
            under: "Undermount: The sink is bonded from underneath. Visible stone edge around the opening.",
            recess: "Recessed underside: The underside is milled for a thinner visual edge.",
          },
          hob: {
            over: "Overmount: The hob rests on top of the worktop. Standard solution.",
            flush: "Flushmount: The hob is flush with the surface. Requires routing.",
          },
        },

        actions: {
          add: "Add",
          addMore: "Add more",
          replace: "Replace",
          replaceWithThis: "Replace with this",
          remove: "Remove",
          clear: "Clear",
          moreInfo: "More info",
          lessInfo: "Less info",
          clearSelection: "Clear selection",
          saveSelection: "Save selection",
        },

        catalog: {
          title: "Choose from our catalogue",
          searchPlaceholder: "Search name, brand, model, specs…",
          selected: "Selected:",
          chosen: "Selected:",
          priceFrom: "Price from:",
          moreSpecs: "…more specifications",
          allSpecs: "All specifications",
          noSpecs: "Specifications missing.",
          category: "Category:",
          product: "product",

          confirmAdd: "Do you want to add “{{name}}” and save your selection?",
          zeroAllowed: "The dropdown quantity is 0. Increase it if you want to add.",
          maxReached:
            "You’ve already selected the maximum of {{max}}. Increase the dropdown quantity to add more.",
        },

        sink: { title: "Sink" },
        faucet: { title: "Faucet" },
        hob: { title: "Hob" },
      },

      offert: {
        title: "Send quote request",
        openButton: "Send quote request",
        fields: {
          name: "Name *",
          email: "Email *",
          phone: "Phone",
          city: "City",
          address: "Address (optional)",
          message: "Message (optional)",
        },
        placeholders: {
          city: "e.g. Västerås",
          message: "Briefly describe what you’re planning",
        },
        actions: {
          submit: "Send request",
          cancel: "Cancel",
        },
      },
    },
  },
};

/* =====================================================
   INIT
===================================================== */

const normalizeLang = (lng) =>
  String(lng || "sv").toLowerCase().startsWith("en") ? "en" : "sv";

function detectInitialLanguage() {
  // 1) saved
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "sv" || saved === "en") return saved;
  } catch {
    // ignore
  }

  // 2) browser
  try {
    return normalizeLang(navigator.language || "sv");
  } catch {
    return "sv";
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: "sv",
  returnNull: false,
  returnEmptyString: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Sync <html lang="">
try {
  document.documentElement.lang = normalizeLang(i18n.language);
} catch {}

i18n.on("languageChanged", (lng) => {
  const normalized = normalizeLang(lng);
  try {
    localStorage.setItem("lang", normalized);
  } catch {}
  try {
    document.documentElement.lang = normalized;
  } catch {}
});

export default i18n;
