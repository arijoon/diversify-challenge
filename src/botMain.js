const totalOrders = 5;

export class BotMain {
  constructor(marketApi, ledger) {
    this.marketApi = marketApi;
    this.ledger = ledger;
  }

  async start() {
    // Add 5x of each order type
    const { bid, ask } = await this.marketApi.getBestPrices();

    for (let i = 0; i < totalOrders; i++) {
      let bidOrder = this.ledger.addOrder(this.randomInRange(bid), this.randomQuantity());
      let fillOrder = this.ledger.addOrder(this.randomInRange(ask), -this.randomQuantity());
      this.logErrors([bidOrder.error, fillOrder.error]);
    }

    // check fills every 5s
    setTimeout(() => {
      this.fillValidOrders();
    }, 5000);

    // Display stats every 30s
    setInterval(() => {
      const info = this.ledger.displayAssetBalances();
      console.log(info);
    }, 30000);

  }

  async fillValidOrders() {
    const { bid, ask } = await this.marketApi.getBestPrices();
    this.ledger.fillOrders(bid, ask);

    setTimeout(() => {
      this.fillValidOrders();
    }, 5000);
  }

  logErrors(errors) {
    for (let i = 0; i < errors.length; i++) {
      if (errors[i])
        console.error(errors[i]);
    }
  }

  randomInRange(number) {
    return number + (Math.random() * (number * 0.10) - (number * 0.05));
  }

  randomQuantity() {
    return 0.01 + Math.random() * 0.4;
  }
}