export default async function handler(req, res) {
  const symbols = ['SPY', 'SPX', 'TSLA', 'SPCX', 'NVDA', 'META', 'AMZN', 'NFLX', 'GOOGL', 'HOOD', 'VIX'];
  
  try {
    const prices = {};
    
    for (const sym of symbols) {
      try {
        const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${sym === 'VIX' ? '^VIX' : sym}?modules=price`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.quoteSummary?.result?.[0]?.price) {
          const p = data.quoteSummary.result[0].price;
          prices[sym] = {
            price: p.currentPrice?.raw?.toFixed(2) || '0',
            change: (p.regularMarketChangePercent?.raw || 0).toFixed(2),
            dir: (p.regularMarketChangePercent?.raw || 0) >= 0 ? 'up' : 'down'
          };
        }
      } catch (e) {
        // Use fallback
        prices[sym] = { price: '0', change: '0', dir: 'up' };
      }
    }
    
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}