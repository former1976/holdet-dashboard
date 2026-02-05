'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, ArrowRight, Terminal } from 'lucide-react';

export default function BookmarkletPage() {
  const [copiedConsole, setCopiedConsole] = useState(false);

  // Auto-scroll and extract all players script
  const consoleScript = `(async function(){
  async function scrollToBottom(){
    let lastHeight=0;
    let attempts=0;
    while(attempts<50){
      window.scrollTo(0,document.body.scrollHeight);
      await new Promise(r=>setTimeout(r,300));
      if(document.body.scrollHeight===lastHeight)break;
      lastHeight=document.body.scrollHeight;
      attempts++;
    }
  }
  console.log('Scroller ned for at loade alle spillere...');
  await scrollToBottom();
  var results=[];
  document.querySelectorAll('tr[data-index]').forEach(function(row){
    var nameEl=row.querySelector('div.font-bold');
    var teamEl=row.querySelector('div.text-xs.text-gray-400, span.text-xs');
    var cells=row.querySelectorAll('td');
    if(nameEl&&cells.length>=2){
      var name=nameEl.textContent.trim();
      var teamText=teamEl?teamEl.textContent.trim():'';
      var priceSpan=cells[1].querySelector('span');
      var price=priceSpan?priceSpan.textContent.trim():'0';
      if(name){
        results.push(name+'\\n'+teamText+'\\n'+price+'    0    0    -    -    -    -    -    -    0 %    -    0');
      }
    }
  });
  if(results.length>0){
    copy(results.join('\\n'));
    alert('Kopieret '+results.length+' spillere til udklipsholder!\\n\\nGå til dashboardet og indsæt i importfeltet.');
  }else{
    alert('Ingen spillere fundet.');
  }
})();`;

  const copyCode = (code: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(code);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-blue-400 hover:underline text-sm">
            ← Tilbage til dashboard
          </a>
        </div>

        <h1 className="text-2xl font-bold mb-2">Importér priser fra Holdet.dk</h1>
        <p className="text-gray-300 mb-8">
          To metoder til at hente spillerpriser fra Holdet.dk ind i dashboardet.
        </p>

        {/* Method 1: Copy-paste */}
        <div className="bg-[#1e293b] rounded-xl p-6 mb-6 border border-green-500/30">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Metode 1: Kopiér tabellen direkte</h2>
          <p className="text-sm text-gray-300 mb-4">Nemmeste metode - kræver ingen installation:</p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <p className="font-medium">Åbn spillerstatistik på Holdet.dk</p>
                <a
                  href="https://www.holdet.dk/da/super-manager-spring-2026/soccer/statistics/players"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline text-sm inline-flex items-center gap-1"
                >
                  Åbn siden <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm">2</div>
              <p className="font-medium">Scroll ned for at loade alle spillere</p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium">Markér spillertabellen med musen og kopiér</p>
                <p className="text-sm text-gray-400">Ctrl+C (Windows) / Cmd+C (Mac)</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <p className="font-medium">Gå til dashboardet → Bytter-fanen → Indsæt i tekstfeltet</p>
                <p className="text-sm text-gray-400">Ctrl+V (Windows) / Cmd+V (Mac), tryk derefter &quot;Tilføj priser&quot;</p>
              </div>
            </div>
          </div>
        </div>

        {/* Method 2: Console script */}
        <div className="bg-[#1e293b] rounded-xl p-6 mb-6 border border-blue-500/30">
          <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Metode 2: Konsol-script (avanceret)
          </h2>
          <p className="text-sm text-gray-300 mb-4">Kopierer alle spillerpriser automatisk:</p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <p className="font-medium">Åbn spillerstatistik og scroll ned</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <p className="font-medium">Tryk F12 for at åbne Developer Tools</p>
                <p className="text-sm text-gray-400">Eller højreklik → &quot;Undersøg&quot; / &quot;Inspect&quot;</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium">Klik på &quot;Console&quot; fanen</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <p className="font-medium">Indsæt dette script og tryk Enter:</p>
                <div className="mt-2 p-3 rounded-lg bg-[#0f172a] border border-[#334155] font-mono text-xs text-green-400 break-all">
                  {consoleScript}
                </div>
                <button
                  onClick={() => copyCode(consoleScript, setCopiedConsole)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {copiedConsole ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedConsole ? 'Kopieret!' : 'Kopier script'}
                </button>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">5</div>
              <div>
                <p className="font-medium">Gå til dashboardet → Bytter → Indsæt (Ctrl+V)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Gå til dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
