import https from 'https';

export class MarketApi {
  constructor(url, symbol, percision) {
    this.url = `${url}/${symbol}/${percision}`;
  }

  async getBestPrices() {
    const prices = await this.get(this.url);
    const numberSort = (a, b) => a - b;
    const bids = prices.filter(([_, __, amount]) => amount > 0)
      .map(([price]) => price)
      .sort(numberSort);

    const asks = prices.filter(([_, __, amount]) => amount < 0)
      .map(([price]) => price)
      .sort(numberSort);

    return {
      bid: bids[bids.length - 1],
      ask: asks[0]
    };
  }

  get(url) {
    return new Promise((resolve, reject) => {
      https.get(this.url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', (err) => reject(err));
    })
  }

}