const blockReward = 1000;
const stackingAddressPerBlock = 2;
const numberOfStxBlockPerRewardCycle = 2000;
const stxBlockPerDay = 144;
const liquidStxSupply = 852000000;
const percentageOfSupplyStacked = 0.5;

const axios = require("axios");
require("dotenv").config();

/**
 * @class
 */

class Calculator {
  stxusd;
  btcusd;
  stxTransactionFee;
  btcTxFee;
  coinMarketCapApiKey;
  numberOfMiners = 10;
  minersShareOfExcessValue = 0.15;

  /**
   * @contructor
   * @param {string} apiKey The Api Key for coinmarketcap
   * @param {number=} [numMin=10] If the user wants to specify the number of minros
   * @param {minShare=} [minShare=0.15] To change the miners share of excess values.
   */

  constructor(apiKey, numMin, minShare) {
    if (numMin) {
      this.numberOfMiners = numMin;
    }
    if (minShare) {
      this.minersShareOfExcessValue = minShare;
    }
    try {
      if (apiKey) {
        this.coinMarketCapApiKey = apiKey;
      } else if (process.env.NODE_ENV === "dev")
        this.coinMarketCapApiKey = process.env.coinmarketcap;
      else {
        throw new EvalError();
      }
      // console.log(this.coinMarketCapApiKey);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Function to initialize all values
   *
   */
  async init() {
    try {
      const btc = axios({
        method: "get",
        headers: {
          "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey,
        },
        url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC`,
      });

      const stx = axios({
        method: "get",
        headers: {
          "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey,
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
          // console.log(obj.annualEarningPercentage());
        }
      );
    } catch (e) {
      console.error(e);
      Promise.reject("Something went wrong");
    }
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

  btcTxCose() {
    return this.numberOfMiners * this.txCostPerMinerPerBlock();
  }

  excessValueToBeDistributed() {
    return this.totalReward() - this.btcTxCose();
  }

  /**
   * Function to calculate minors share
   * @returns miners share
   */

  minersShare() {
    return this.minersShareOfExcessValue * this.excessValueToBeDistributed();
  }

  /**
   * @returns stackers share
   */
  stackersShare() {
    return this.excessValueToBeDistributed() - this.minersShare();
  }

  sharePerStackingAddress() {
    return this.stackersShare() / stackingAddressPerBlock;
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

  /**
   * This function returns the amount in BTC
   * @returns  {number} A BTC Value
   */

  annualEarningInBTC() {
    return (
      (this.usersSlotsPerCycle() * this.sharePerStackingAddress() * 365) /
      14 /
      this.btcusd
    );
  }

  /**
   * Function to return valuee in USD
   * @returns {number} Value USD
   */

  annualEarning() {
    return this.annualEarningInBTC() * this.btcusd;
  }
  annualEarningPercentage() {
    return this.annualEarning() / this.dollarValue();
  }
}

module.exports = Calculator;

// const obj = new Calculator();
// obj.init();
