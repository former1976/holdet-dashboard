'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, ArrowRight, Terminal } from 'lucide-react';

export default function BookmarkletPage() {
  const [copiedHoldet, setCopiedHoldet] = useState(false);
  const [copiedSuperliga, setCopiedSuperliga] = useState(false);

  // Script for Holdet.dk - henter PRISER
  const holdetScript = `(async function(){
  console.log('Starter auto-scroll...');
  for(let i=0;i<100;i++){
    window.scrollTo(0,document.body.scrollHeight);
    await new Promise(r=>setTimeout(r,200));
  }
  window.scrollTo(0,0);
  var results=[];
  document.querySelectorAll('tr[data-index]').forEach(function(row){
    var nameEl=row.querySelector('div.font-bold');
    var teamEl=row.querySelector('div.text-on-surface-muted, div.text-xs');
    var cells=row.querySelectorAll('td');
    if(nameEl&&cells.length>=2){
      var name=nameEl.textContent.trim();
      var teamText=teamEl?teamEl.textContent.trim():'';
      var priceSpan=cells[1]?.querySelector('span');
      var price=priceSpan?priceSpan.textContent.trim():'0';
      if(name&&price.includes('000')){
        results.push(name+'\\n'+teamText+'\\n'+price+'    0    0    -    -    -    -    -    -    0 %    -    0');
      }
    }
  });
  if(results.length>0){
    await navigator.clipboard.writeText(results.join('\\n'));
    alert('Kopieret '+results.length+' spillere med PRISER!');
  }else{alert('Ingen spillere fundet.');}
})();`;

  // Script for Superliga.dk stats - henter MÅL, ASSISTS osv. fra ALLE sider
  const superligaScript = `(async function(){
  var allResults=[];
  var teamNames={'FCM':'FC Midtjylland','FCK':'FC København','BIF':'Brøndby IF','AGF':'AGF','OB':'OB','FCN':'FC Nordsjælland','SIF':'Silkeborg IF','VFF':'Viborg FF','RFC':'Randers FC','VB':'Vejle Boldklub','AaB':'AaB','LBK':'Lyngby BK','SJF':'SønderjyskE','FCF':'FC Fredericia','HIF':'Hvidovre IF'};

  function getPlayersFromPage(){
    var nameRows=document.querySelectorAll('table.players tbody tr');
    var statRows=document.querySelectorAll('.stats-table table tbody tr');
    var results=[];
    for(var i=0;i<nameRows.length&&i<statRows.length;i++){
      var nameEl=nameRows[i].querySelector('td.name span');
      var statCells=statRows[i].querySelectorAll('td');
      if(nameEl&&statCells.length>=5){
        var name=nameEl.textContent.trim();
        var team=statCells[0]?.textContent.trim()||'';
        var fullTeam=teamNames[team]||team;
        var matches=statCells[1]?.textContent.trim()||'0';
        var minutes=statCells[2]?.textContent.trim().replace('.','').replace(',','')||'0';
        var goals=statCells[3]?.textContent.trim()||'0';
        var assists=statCells[4]?.textContent.trim()||'0';
        var total=parseInt(goals)+parseInt(assists);
        var minPerContrib=total>0?Math.round(parseInt(minutes)/total):0;
        results.push(name+'|'+fullTeam+'|'+team+'|'+matches+'|'+goals+'|'+assists+'|'+total+'|'+minPerContrib);
      }
    }
    return results;
  }

  function getPageButtons(){
    return Array.from(document.querySelectorAll('.pagination button')).filter(b=>!isNaN(parseInt(b.textContent)));
  }

  var pageButtons=getPageButtons();
  var totalPages=pageButtons.length>0?parseInt(pageButtons[pageButtons.length-1].textContent):1;

  console.log('Henter spillere fra '+totalPages+' sider...');

  for(var page=1;page<=totalPages;page++){
    var btn=Array.from(document.querySelectorAll('.pagination button')).find(b=>b.textContent.trim()===String(page));
    if(btn&&!btn.classList.contains('active')){
      btn.click();
      await new Promise(r=>setTimeout(r,500));
    }
    var pagePlayers=getPlayersFromPage();
    allResults=allResults.concat(pagePlayers);
    console.log('Side '+page+': '+pagePlayers.length+' spillere (total: '+allResults.length+')');
  }

  if(allResults.length>0){
    navigator.clipboard.writeText(allResults.join('\\n')).then(function(){
      alert('Kopieret '+allResults.length+' spillere fra '+totalPages+' sider!');
    }).catch(function(){
      console.log(allResults.join('\\n'));
      alert('Se konsol for data');
    });
  }else{alert('Ingen spillere fundet');}
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

        <h1 className="text-2xl font-bold mb-2">Importér spillerdata</h1>
        <p className="text-gray-300 mb-8">
          Hent priser fra Holdet.dk og statistik fra Superliga.dk
        </p>

        {/* Step 1: Superliga.dk for stats */}
        <div className="bg-[#1e293b] rounded-xl p-6 mb-6 border border-purple-500/30">
          <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Trin 1: Hent STATISTIK fra Superliga.dk
          </h2>
          <p className="text-sm text-gray-300 mb-4">Mål, assists, kampe, minutter osv.</p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <p className="font-medium">Åbn spillerstatistik på Superliga.dk</p>
                <a
                  href="https://superliga.dk/stats#spiller"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline text-sm inline-flex items-center gap-1"
                >
                  Åbn siden <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">2</div>
              <p className="font-medium">Tryk F12 → Console fanen</p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium">Indsæt dette script og tryk Enter:</p>
                <div className="mt-2 p-3 rounded-lg bg-[#0f172a] border border-[#334155] font-mono text-xs text-purple-400 break-all max-h-32 overflow-y-auto">
                  {superligaScript}
                </div>
                <button
                  onClick={() => copyCode(superligaScript, setCopiedSuperliga)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  {copiedSuperliga ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSuperliga ? 'Kopieret!' : 'Kopier script'}
                </button>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">4</div>
              <p className="font-medium">Gå til dashboardet → Importér → Indsæt</p>
            </div>
          </div>
        </div>

        {/* Step 2: Holdet.dk for prices */}
        <div className="bg-[#1e293b] rounded-xl p-6 mb-6 border border-green-500/30">
          <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Trin 2: Hent PRISER fra Holdet.dk
          </h2>
          <p className="text-sm text-gray-300 mb-4">Spillerpriser til budget-beregning</p>

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
              <p className="font-medium">Tryk F12 → Console fanen</p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium">Indsæt dette script og tryk Enter:</p>
                <div className="mt-2 p-3 rounded-lg bg-[#0f172a] border border-[#334155] font-mono text-xs text-green-400 break-all max-h-32 overflow-y-auto">
                  {holdetScript}
                </div>
                <button
                  onClick={() => copyCode(holdetScript, setCopiedHoldet)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  {copiedHoldet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedHoldet ? 'Kopieret!' : 'Kopier script'}
                </button>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm">4</div>
              <p className="font-medium">Gå til dashboardet → Importér → Indsæt</p>
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
