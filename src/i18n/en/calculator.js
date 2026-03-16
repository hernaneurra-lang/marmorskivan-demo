export default {
  extraSurfaces: {
    title: "Extra surfaces (rectangular)",
    sum: "Sum",
    add: "Add surface",
    removeTitle: "Remove surface",
    maxText: "Max {{max}} extra surfaces. More can be added during consultation.",
    lengthLabel: "Length (mm) – Surface {{index}}",
    depthLabel: "Depth (mm) – Surface {{index}}",
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
    island: { title: "Island (auto)", hint: "Calculated around the island." },
    backsplash: { title: "Backsplash (edges)", hint: "Summed from backsplash rows." },
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
      changeMaterial: "Change material",
      browseAll: "Browse all",
    },

    // ✅ Updated to match your new CalculatorPage “price overview” keys
    priceOverview: {
      title: "Price overview",

      blocks: {
        stone: "Stone & surface",
        execution: "Execution",
        selectedExtras: "Selected options",
        processing: "Processing",
      },

      lines: {
        material: "Material",
        edges: "Edges",
        backsplash: "Backsplash",
        openings: "Cutouts & options",
        service: "Service",

        // ✅ new (lump sums)
        extras: "Products & options",
        stoneBundle: "Stone incl. installation*",
      },

      polishing: "polishing",
      noExtras: "No options selected",

      estimatedTotal: "Estimated total",
      includesService: "*Includes measuring & installation",
      inclVat: "Incl. VAT",

      // legacy keys kept for compatibility
      selectedStone: "Selected stone",
      totalArea: "Total area:",
      vat: "VAT",
      total: "Total",
    },

    backsplash: {
      title: "Backsplash",
      add: "Add backsplash",
      empty: "No backsplashes added yet.",
      remove: "Remove",
      removeTitle: "Remove",
      fields: { length: "Length (mm)", height: "Height (mm)" },
      mmPlaceholder: "mm",
    },

    // ✅ Used as fallback label when an item lacks name/title
    misc: {
      item: "Product",
    },

    // ✅ Used in price overview “Processing”
    openings: {
      hob: "Hob cutout",
      faucet: "Tap hole",
    },
  },

  openings: {
    title: "Cutouts & options",
    tabs: { sink: "Sink", faucet: "Faucet", hob: "Hob" },
    count: { sinks: "Sinks", faucets: "Faucets", hobs: "Hobs" },
    mode: { catalog: "Choose from our catalogue", own: "I will buy myself", none: "I won’t have this" },
    selectedCount: "Selected ({{count}}/{{max}}):",
    noneSelectedYet: "Nothing selected yet.",
    ownHint: "Quantity is controlled by the dropdowns above. No products need to be selected here.",
    noneHint: "Not applicable.",
    mountTitle: "Mounting",
    mountPreviewHint: "Click for a larger image",
    mountInfoMissing: "Mounting information is missing.",

    mount: {
      sink: { over: "Overmount", flush: "Flushmount", under: "Undermount", recess: "Recessed underside" },
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
      maxReached: "You’ve already selected the maximum of {{max}}. Increase the dropdown quantity to add more.",
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
    placeholders: { city: "e.g. Västerås", message: "Briefly describe what you’re planning" },
    actions: { submit: "Send request", cancel: "Cancel" },
  },
};
