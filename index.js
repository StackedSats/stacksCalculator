const axios = require("axios");
require("dotenv").config();

/**
 *
 * Usage
 * @example
 *  const obj = new Calculator();
 *  obj.BTCTokenPrice(1000);
 *  obj.STXTokenPrice(10);
 *  obj.STXTransferFee(30);
 *  obj.setUserHolding(100000);
 *  obj.BTCTransferFee(10);
 *  console.log(obj.annualEarning());
 *
 * @example
 * const obj = new Calculator();
 * await obj.init();
 * obj.setUserHolding(100000);
 * console.log(obj.annualEarning())
 */

class Calculator {
  /**
   * STX/USD Price
   * @type {number}
   */
  stxusd;

  /**
   * BTC/USD Price
   * @type  {number}
   */
  btcusd;
  stxTransactionFee;
  btcTxFee;
  coinMarketCapApiKey;
  numberOfMiners = 10;
  minersShareOfExcessValue = 0.15;
  blockReward = 1000;
  stackingAddressPerBlock = 2;
  numberOfStxBlockPerRewardCycle = 2000;
  stxBlockPerDay = 144;

  /**
   * User STX Stacking amount
   * @type {number}
   */
  userHolding;
  /**
   * This is the liquid STX Supply
   */
  liquidStxSupply = 852000000;
  totalLiquidSupply;
  percentageOfSupplyStacked = 0.5;

  /**
   * @constructor
   * @param {number=} [numMin=10] If the user wants to specify the number of minros
   * @param {minShare=} [minShare=0.15] To change the miners share of excess values.
   */

  constructor(numMin, minShare) {
    if (numMin) {
      this.numberOfMiners = numMin;
    }
    if (minShare) {
      this.minersShareOfExcessValue = minShare;
    }
  }

  /**
   * Function to initialize all values
   *
   */
  async init() {
    try {
      let result = await axios.get("http://207.148.25.63:3500/data");
      result = result.data;
      console.log(result);
      this.stxusd = result["stxusd"];
      this.btcusd = result["btcusd"];
      this.stxTransactionFee = result["stxTransactionFeeReult"];
      this.btcTxFee = result["btcTxFeeResult"];
      this.liquidStxSupply = result["liquidStxSupplyResult"];
      this.setMinimumLiquidSupply(50);
    } catch (e) {
      console.error(e);
      Promise.reject("Something went wrong");
    }
  }

  //************************************************************************

  // methods to modify global class variables

  /**
   * This function Sets the desired STX Token Price
   * @param {number} value New STX value
   */

  STXTokenPrice(value) {
    this.stxusd = value;
  }

  /**
   * This function sets the desired BTC Token Price
   * @param {number} value New BTC value
   */

  BTCTokenPrice(value) {
    this.btcusd = value;
  }

  /**
   * This function sets the STX transfer fee
   * @param {number} value
   */
  STXTransferFee(value) {
    this.stxTransactionFee = value;
  }

  /**
   * This function sets the STX transfer fee
   * @param {number} value
   */
  BTCTransferFee(value) {
    this.btcTxFee = value;
  }

  // *****************************************************************************

  totalReward() {
    return (this.blockReward + this.stxTransactionFee) * this.stxusd;
  }

  poxTransactionSize() {
    return (this.stackingAddressPerBlock + 1) * 33 + 250;
  }

  txCostPerMinerPerBlock() {
    return 0.00000001 * this.btcusd * this.btcTxFee * this.poxTransactionSize();
  }

  btcTxCose() {
    return this.numberOfMiners * this.txCostPerMinerPerBlock();
  }

  excessValueToBeDistributed() {
    // console.log(this.totalReward(), this.btcTxCose());
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
    return this.stackersShare() / this.stackingAddressPerBlock;
  }

  slotsAvalaiblePerRewardCycle() {
    return this.numberOfStxBlockPerRewardCycle * this.stackingAddressPerBlock;
  }

  lengthOfRewardCycle() {
    return Math.round(
      this.numberOfStxBlockPerRewardCycle / this.stxBlockPerDay,
      10
    );
  }

  minStackingSize() {
    return Math.ceil(
      this.percentageOfSupplyStacked < 0.25
        ? (this.liquidStxSupply / this.slotsAvalaiblePerRewardCycle()) * 0.25
        : (this.liquidStxSupply / this.slotsAvalaiblePerRewardCycle()) *
            this.percentageOfSupplyStacked,
      10000
    );
  }

  usersSlotsPerCycle() {
    return Math.floor(this.userHolding / this.minStackingSize());
  }

  /**
   * Function to calculate liquidSupply
   * @param {number} val Function to set liquid supply. Enter a value between 1-100
   */
  setMinimumLiquidSupply(val) {
    this.totalLiquidSupply = (this.liquidStxSupply * val) / 100;
  }

  /**
   * Function to set the stacking value.
   * @param {number} value Stacking Value
   */
  setUserHolding(value) {
    this.userHolding = value;
  }

  dollarValue() {
    return this.userHolding * this.stxusd;
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
// obj.stxusd = 0.5;
// obj.btcusd = 30000;
// obj.btcTxFee = 100;
// obj.blockReward = 1000;
// obj.stxTransactionFee = 100;
// console.log("totalReward", obj.totalReward());
// obj.stackingAddressPerBlock = 2;
// console.log("poxTransactionSize", obj.poxTransactionSize());
// console.log("txcallperminer", obj.txCostPerMinerPerBlock());
// obj.numberOfMiners = 10;
// obj.minersShareOfExcessValue = 0.15;
// console.log("btctxcost", obj.btcTxCose());
// console.log("excess value to be distributed", obj.excessValueToBeDistributed());
// console.log("miners share", obj.minersShare());
// console.log("stackers share", obj.stackersShare());
// console.log("share per stacking address", obj.sharePerStackingAddress());
// obj.numberOfStxBlockPerRewardCycle = 2000;
// console.log(obj.slotsAvalaiblePerRewardCycle());
// obj.stxBlockPerDay = 144;
// console.log("lengthofreardcycle", obj.lengthOfRewardCycle());
// obj.liquidStxSupply = 852000000;
// obj.percentageOfSupplyStacked = 0.5;
// console.log("minstackingsize", obj.minStackingSize());
// obj.userHolding = 1100000;
// console.log(obj.dollarValue());
// console.log(obj.usersSlotsPerCycle());
// console.log(obj.annualEarningInBTC());
// console.log(obj.annualEarning());
// console.log(obj.annualEarningPercentage() / 100);
const obj = new Calculator();
obj.init().then(() => {
  obj.setUserHolding(100000);
  console.log(obj.annualEarning());
});
