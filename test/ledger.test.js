import { Ledger } from '../src/ledger'

const marketLedger = new Ledger(1000, 'USD', 10, 'ETH')

test('create simple order', async () => {
  const order = marketLedger.addOrder(100, 5);

  expect(order.error).toBeFalsy()
});