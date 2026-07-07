// Tiny include-style helper: builds the nav + footer markup, keeps pages DRY.
// Uses data-active attribute on body to mark current page.

(function () {
  const active = document.body.dataset.active || '';
  const link = (href, label, id) =>
    `<a href="${href}" class="${id === active ? 'active' : ''}" data-page="${id}">${label}</a>`;

  const navHTML = `
    <nav class="nav" id="nav">
      <div class="wrap nav-row">
        <a href="index.html" class="brand">
          <img class="brand-mark" src="images/logo.png" alt="SMU" />
          <span class="brand-name">
            <span>Stock Market University</span>
            <small>EST. 2026</small>
          </span>
        </a>
        <div class="nav-links" id="navLinks">
          ${link('index.html',     'Home',       'home')}
          ${link('pricing.html',   'Programs',   'pricing')}
          ${link('ebook.html',     'Free Ebook', 'ebook')}
          <a href="pricing.html" class="nav-cta">Apply to SMU →</a>
        </div>
        <button class="menu-btn" aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </nav>`;

  const footerHTML = `
    <footer class="foot">
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <a href="index.html" class="brand" style="margin-bottom:18px">
              <img class="brand-mark" src="images/logo.png" alt="SMU" />
              <span class="brand-name">
                <span>Stock Market University</span>
                <small>EST. 2026</small>
              </span>
            </a>
            <p style="max-width:36ch; color:var(--muted); font-size:14px; margin-top:18px">
              A disciplined education in market structure, risk, and execution. Taught by working traders, designed for serious operators.
            </p>
          </div>
          <div>
            <h5>Program</h5>
            <ul>
              <li><a href="curriculum.html">Curriculum</a></li>
              <li><a href="pricing.html">Pricing &amp; Cohorts</a></li>
              <li><a href="#">Faculty</a></li>
              <li><a href="#">Outcomes</a></li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li><a href="#">The Trading Journal</a></li>
              <li><a href="#">Market Glossary</a></li>
              <li><a href="#">Free Webinar</a></li>
              <li><a href="#">Discord Community</a></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <span>© 2026 SMU HOLDINGS, LLC · ALL RIGHTS RESERVED</span>
          <span>NOT INVESTMENT ADVICE · EDUCATIONAL CONTENT ONLY</span>
        </div>
      </div>
    </footer>`;

  // Ticker tape (used on multiple pages)
  const tickers = [
    ['SPY',   '640.28',   '+0.53%',  'up'],
    ['SPX',   '5,842.31', '+0.62%',  'up'],
    ['TSLA',  '312.45',   '+1.22%',  'up'],
    ['SPCX',  '89.67',    '-0.34%',  'down'],
    ['NVDA',  '156.89',   '+2.10%',  'up'],
    ['META',  '524.31',   '+0.88%',  'up'],
    ['AMZN',  '209.54',   '+0.71%',  'up'],
    ['NFLX',  '287.12',   '+1.45%',  'up'],
    ['GOOGL', '197.83',   '+0.41%',  'up'],
    ['HOOD',  '23.45',    '-1.20%',  'down'],
    ['VIX',   '13.42',    '-2.40%',  'down'],
  ];
  
  const tickerItem = ([sym, px, ch, dir]) =>
    `<span class="tk"><b>${sym}</b> ${px} <span class="${dir}">${ch}</span></span><span class="dot tk"></span>`;
  
  const buildTickerHTML = (tickerData) => `
    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">
        ${tickerData.concat(tickerData).map(tickerItem).join('')}
      </div>
    </div>`;
  
  const tickerHTML = buildTickerHTML(tickers);
  
  // Fetch live prices from our serverless API
  async function updateLiveStocks() {
    try {
      const res = await fetch('/api/stocks');
      const liveData = await res.json();
      
      if (liveData && typeof liveData === 'object') {
        const liveTickers = tickers.map(([sym, _, __, ___]) => [
          sym,
          liveData[sym]?.price || _,
          `${liveData[sym]?.change >= 0 ? '+' : ''}${liveData[sym]?.change || __}`,
          liveData[sym]?.dir || ___
        ]);
        
        const liveHTML = buildTickerHTML(liveTickers);
        document.querySelectorAll('[data-ticker]').forEach(el => el.outerHTML = liveHTML);
      }
    } catch (err) {
      console.log('Using cached prices');
    }
  }
  
  document.querySelectorAll('[data-ticker]').forEach(el => el.outerHTML = tickerHTML);
  updateLiveStocks();
  setInterval(updateLiveStocks, 5 * 60 * 1000);

  // Mount
  const navMount = document.getElementById('nav-mount');
  if (navMount) navMount.outerHTML = navHTML;
  const footMount = document.getElementById('foot-mount');
  if (footMount) footMount.outerHTML = footerHTML;
  document.querySelectorAll('[data-ticker]').forEach(el => el.outerHTML = tickerHTML);
})();
