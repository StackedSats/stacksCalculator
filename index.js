const blockReward = 1000;
const stackingAddressPerBlock = 2;
const numberOfStxBlockPerRewardCycle = 2000;
const stxBlockPerDay = 144;
const liquidStxSupply = 852000000;
const percentageOfSupplyStacked = 50;

const axios = require("axios");
require("dotenv").config();

console.log(process.env.coinmarketcap);
class Calculator {
  stxusd;
  btcusd;
  stxTransactionFee;
  btcTxFee;

  async init() {
    const btc = axios({
      method: "get",
      headers: {
        "X-CMC_PRO_API_KEY": process.env.coinmarketcap,
      },
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC`,
    });

    const stx = axios({
      method: "get",
      headers: {
        "X-CMC_PRO_API_KEY": process.env.coinmarketcap,
      },
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=STX`,
    });

    const stxTransferFee = axios({
      method: "get",
      url: "https://stacks-node-api.blockstack.org/v2/fees/transfer",
    });

    const btcTxFee = axios({
      method: "get",
      url: "https://bitcoiner.live/api/fees/estimates/latest?confidence=0.8",
    });
    const prices = Promise.all([btc, stx, stxTransferFee, btcTxFee]).then(
      (result) => {
        this.stxusd = result[0].data.data.BTC.quote.USD.price;
        this.btcusd = result[1].data.data.STX.quote.USD.price;
        this.stxTransactionFee = result[2].data;
        this.btcTxFee = result[3].data.estimates[30].total.p2wpkh.usd;
        // console.log(this);
        console.log(obj.annualEarningPercentage());
      }
    );
  }

  totalReward() {
    return (blockReward + this.stxTransactionFee) * this.stxusd;
  }

  poxTransactionSize() {
    return (stackingAddressPerBlock + 1) * 33 + 250;
  }

  txCostPerMinerPerBlock() {
    return 0.00000001 * this.btcusd * this.btcTxFee * this.poxTransactionSize();
  }

  sharePerStackingAddress() {
    return this.totalReward() / stackingAddressPerBlock;
  }

  slotsAvalaiblePerRewardCycle() {
    return numberOfStxBlockPerRewardCycle * stackingAddressPerBlock;
  }

  lengthOfRewardCycle() {
    return numberOfStxBlockPerRewardCycle / stxBlockPerDay;
  }

  minStackingSize() {
    return Math.min(
      percentageOfSupplyStacked < 0.25
        ? (liquidStxSupply / this.slotsAvalaiblePerRewardCycle()) * 0.25
        : (liquidStxSupply / this.slotsAvalaiblePerRewardCycle()) *
            percentageOfSupplyStacked,
      10000
    );
  }

  userHolding() {
    return this.minStackingSize() * 10;
  }

  dollarValue() {
    return this.userHolding() * this.stxusd;
  }

  usersSlotsPerCycle() {
    return Math.floor(this.userHolding() / this.minStackingSize());
  }

  annualEarningInBTC() {
    return (
      (this.usersSlotsPerCycle() * this.sharePerStackingAddress() * 365) /
      14 /
      this.btcusd
    );
  }

  annualEarning() {
    return this.annualEarningInBTC() * this.btcusd;
  }
  annualEarningPercentage() {
    return this.annualEarning() / this.dollarValue();
  }
}

const obj = new Calculator();
obj.init();