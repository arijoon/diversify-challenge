export class Ledger {
  constructor(sourceAmount, sourceTicker, destAmount, destTicker) {
    this.balance = sourceAmount;
    this.spareBalance = sourceAmount;
    this.quantity = destAmount;
    this.spareQuantity = destAmount;
    this.sourceTicker = sourceTicker;
    this.destTicker = destTicker;
    this.orderHistory = [];

    this.orders = {
      bid: [],
      ask: []
    };
  }

  /**
   * Delete an order from the ledger and return avilable balance
   * @param {*} order order object
   * @param {*} side the side of the order
   */
  deleteOrder(order, keepBalanceReduction = false) {
    const orders = order.quantity > 0
      ? this.orders.bid
      : this.orders.ask;

    const idx = orders.indexOf(order);

    if (idx < 0) return;

    const deletedOrder = orders.splice(idx, 1);

    if (!keepBalanceReduction) {
      if (order.quantity >= 0) {
        const total = order.price * order.amount;
        this.spareBalance += total;
      } else {
        this.spareQuantity -= order.quantity;
      }
    }

    return deletedOrder;
  }

  /**
   * Create an order in the ledger based on a price and quantity, must have enough funds available
   * @param {*} price price point for the order 
   * @param {*} quantity quantity of the order, negative quantity for ask (SELL)
   */
  addOrder(price, quantity) {
    const order = { price, quantity };
    const total = price * quantity;

    // Verify balance
    if (quantity < 0) {
      // Sell order
      if (this.spareQuantity < quantity)
        return { error: `insufficient funds ${this.spareQuantity} ${this.destTicker}, require ${quantity}` }
      
      this.spareQuantity += quantity
      this.orders.ask.push(order);
      this.logOrder('ASK', price, quantity);

    } else {
      // Buy order
      if (this.spareBalance < total)
        return { error: `insufficient funds ${this.spareBalance} ${this.sourceTicker}, require ${total}` }

      this.spareBalance -= total;
      this.orders.bid.push(order);
      this.logOrder('BID', price, quantity);
    }

    return order;
  }

  /**
   * Fill valid orders based on best bid and ask prices 
   */
  fillOrders(bidPrice, askPrice) {
    // Fill Bids
    this.orders.bid.filter((order) => order.price > bidPrice)
      .map(o => this.fillBidOrder(o));

    // Fill Asks
    this.orders.ask.filter((order) => order.price < askPrice)
      .map(o => this.fillAskOrder(o));

  }

  fillBidOrder(order) {
    const total = order.quantity * order.price;
    this.quantity += order.quantity;
    this.spareQuantity += order.quantity;
    this.balance -= total;

    this.deleteOrder(order, true);
    this.orderHistory.push(order);
    this.logFill('BID', order.price, order.quantity, order.quantity, -total);
  }

  fillAskOrder(order) {
    const total = -order.quantity * order.price;
    this.quantity -= order.quantity;
    this.balance += total;
    this.spareBalance += total;

    this.deleteOrder(order, true);
    this.orderHistory.push(order);
    this.logFill('ASK', order.price, order.quantity, order.quantity, total);
  }

  /**
   * Return a string showing current balances and open orders
   */
  displayAssetBalances() {
    return `${this.sourceTicker}: ${this.balance} (${this.spareBalance})\n` +
      `${this.destTicker}: ${this.quantity} (${this.spareQuantity})\n` +
      `Bids (${this.orders.bid.length}) | Asks (${this.orders.ask.length}) | Filled (${this.orderHistory.length})`;
  }

  logFill(side, price, quantity, dquantity, dbalance) {
    console.log(`FILLED ${side} @ ${price} ${quantity} (${this.sourceTicker} ${this.formatNumber(dbalance)} ${this.destTicker} ${this.formatNumber(dquantity)})`)
  }

  logOrder(side, price, quantity) {
    console.log(`PLACED ${side} @ ${price} ${quantity}`);
  }

  formatNumber(number) {
    return number > 0
     ? "+" + number
     : number;
  }

}