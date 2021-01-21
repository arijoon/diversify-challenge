import { MarketApi } from './marketApi'
import { Ledger } from './ledger'
import { BotMain } from './botMain'

const api = new MarketApi("https://api.deversifi.com/bfx/v2/book", "tETHUSD", "P0");
const ledger = new Ledger(2000, 'USD', 10, 'ETH')

const bot = new BotMain(api, ledger);

bot.start();