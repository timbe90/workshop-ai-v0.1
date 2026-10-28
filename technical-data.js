
/*
 * Workshop AI v0.4
 * Technische Fahrzeugdatenbank
 *
 * Nur verifizierte, zur Nutzung freigegebene
 * Werkstattwerte veröffentlichen.
 */

window.WORKSHOP_TECHNICAL_DATA = [];

/*
 * Vorlage für einen technischen Datensatz.
 * Diese Vorlage ist NICHT aktiv.
 *
 * {
 *   id: "bmw-e91-m47-beispiel",
 *   make: "BMW",
 *   series: "E91",
 *   model: "320d Touring",
 *   engine: "M47D20TÜ2",
 *   category: "Drehmomente",
 *   component: "Bauteilbezeichnung",
 *   value: null,
 *   unit: "Nm",
 *   condition: "",
 *   notes: "",
 *   source: "",
 *   sourceDate: "",
 *   verified: false
 * }
 */

// Technische Daten nach Suchbegriff filtern.
window.searchWorkshopTechnicalData = function (query) {
  const term = String(query || "")
    .trim()
    .toLocaleLowerCase("de-DE");

  const data = window.WORKSHOP_TECHNICAL_DATA;

  if (!term) return data;

  return data.filter(function (entry) {
    return [
      entry.make,
      entry.series,
      entry.model,
      entry.engine,
      entry.category,
      entry.component,
      entry.value,
      entry.unit,
      entry.condition,
      entry.notes
    ].some(function (field) {
      return String(field ?? "")
        .toLocaleLowerCase("de-DE")
        .includes(term);
    });
  });
};

// Nur freigegebene und verifizierte Werte liefern.
window.getVerifiedWorkshopData = function () {
  return window.WORKSHOP_TECHNICAL_DATA.filter(
    function (entry) {
      return entry.verified === true &&
        Boolean(entry.source) &&
        entry.value !== null &&
        entry.value !== undefined &&
        entry.value !== "";
    }
  );
};
