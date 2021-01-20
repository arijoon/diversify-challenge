import { MarketApi } from '../src/marketApi'

const api = new MarketApi("https://api.stg.deversifi.com/bfx/v2/book", "tETHUSD", "P0");

test('returns two numbers', async () => {
  const { bid, ask} = await api.getBestPrices();

  expect(typeof bid).toBe('number')
  expect(typeof ask).toBe('number')
});