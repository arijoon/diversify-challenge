import { sides } from "./enums";

export class Ledger {
  constructor(sourceAmount, sourceTicker, destAmount, destTicker) {
    this.balance = sourceAmount;
    this.spareBalance = sourceAmount;
    this.quantity = destAmount;
    this.spareQuantity = destAmount;
    this.sourceTicker = sourceTicker;
    this.destTicker = destTicker;

    this.orders = {
      bid: [],
      ask: []
    };

    // this.sides = {
    //   bid: {
    //     balance: sourceAmount,
    //     availableBalance: sourceAmount,
    //     orders: [],
    //     ticker: sourceTicker
    //   },
    //   ask: {
    //     balance: destAmount,
    //     availableBalance: destAmount,
    //     orders: [],
    //     ticker: destTicker
    //   }
    // };
  }

  /**
   * Delete an order from the ledger and return avilable balance
   * @param {*} order order object
   * @param {*} side the side of the order
   */
  deleteOrder(order) {
    const orders = order.quantity > 0
      ? this.orders.bid
      : this.orders.ask;

    const idx = orders.indexOf(order);

    if (idx < 0) return;

    const deletedOrder = orders.splice(idx, 1);

    if (order.quantity >= 0) {
      const total = order.price * order.amount;
      this.spareBalance += total;
    } else {
      this.spareQuantity -= order.quantity;
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

    } else {
      // Buy order
      if (this.spareBalance < total)
        return { error: `insufficient funds ${this.spareBalance} ${this.sourceTicker}, require ${total}` }

      this.spareBalance -= total;
      this.orders.bid.push(order);
    }

    return order;
  }

  getSideLedger(side) {
    return side === sides.BID
      ? this.sides.bid
      : this.sides.ask;
  }
}