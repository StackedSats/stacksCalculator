const stxusd = 0.162;
const btcusd = 10900;
const btcTxFee = 82;
const blockReward = 1000;
const stxTransactionFee = 100;
const stackingAddressPerBlock = 2;
const numberOfStxBlockPerRewardCycle = 2000;
const stxBlockPerDay = 144;
const liquidStxSupply = 852000000;
const percentageOfSupplyStacked = 50;

class Calculator {
  constructor() {}
  totalReward() {
    return (blockReward + stxTransactionFee) * stxusd;
  }

  poxTransactionSize() {
    return (stackingAddressPerBlock + 1) * 33 + 250;
  }

  txCostPerMinerPerBlock() {
    return 0.00000001 * btcusd * btcTxFee * this.poxTransactionSize();
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
    return this.userHolding() * stxusd;
  }

  usersSlotsPerCycle() {
    return Math.floor(this.userHolding() / this.minStackingSize());
  }

  annualEarningInBTC() {
    return (
      (this.usersSlotsPerCycle() * this.sharePerStackingAddress() * 365) /
      14 /
      btcusd
    );
  }

  annualEarning() {
    return this.annualEarningInBTC() * btcusd;
  }
  annualEarningPercentage() {
    return this.annualEarning() / this.dollarValue();
  }
}

const obj = new Calculator();
console.log(obj.annualEarningPercentage());
