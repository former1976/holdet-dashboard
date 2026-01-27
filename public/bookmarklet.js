// Holdet.dk Spillerpris Bookmarklet
// Kopierer alle spillere og priser fra statistiksiden

(function() {
  try {
    // Find alle spiller-rækker i tabellen
    const rows = document.querySelectorAll('tr[data-index]');

    if (rows.length === 0) {
      alert('Kunne ikke finde spillertabellen. Sørg for at du er på spillerstatistik-siden.');
      return;
    }

    const players = [];

    rows.forEach(row => {
      try {
        // Find spillernavn (i div med font-bold class)
        const nameEl = row.querySelector('.font-bold');

        // Find pris (første td med text-right class, indeholder span med tal)
        const priceCells = row.querySelectorAll('td.text-right');
        let priceEl = null;

        // Prisen er typisk i den første text-right celle
        if (priceCells.length > 0) {
          priceEl = priceCells[0].querySelector('span');
        }

        if (nameEl && priceEl) {
          const name = nameEl.textContent.trim();
          let priceText = priceEl.textContent.trim();

          // Konverter pris fra "12.000.000" til "12"
          // Fjern punktummer og konverter til millioner
          priceText = priceText.replace(/\s/g, '').replace(/\./g, '');
          const priceNum = parseInt(priceText, 10);

          if (name && priceNum > 0) {
            // Konverter til millioner (del med 1.000.000)
            const priceInMillions = priceNum / 1000000;
            players.push(name + ' ' + priceInMillions);
          }
        }
      } catch (e) {
        // Skip fejl i enkelte rækker
      }
    });

    if (players.length === 0) {
      alert('Kunne ikke finde nogen spillere. Prøv at scrolle ned på siden først for at loade flere spillere.');
      return;
    }

    // Kopier til clipboard
    const text = players.join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Kopieret ' + players.length + ' spillere til clipboard!\n\nGå til dashboardet og indsæt i "Bytter" fanen.');
    }).catch(err => {
      // Fallback hvis clipboard API ikke virker
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Kopieret ' + players.length + ' spillere!\n\nGå til dashboardet og indsæt i "Bytter" fanen.');
    });

  } catch (error) {
    alert('Fejl: ' + error.message);
  }
})();
