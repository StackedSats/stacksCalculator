# stacksCalculator

## Installation

`npm i stxcalculator`

## Usage

> Enter your coinmarketcap api key in .env if in devevlopment mode

 <pre class="prettyprint"><code>const obj = new Calculator();
 obj.BTCTokenPrice(1000);
 obj.STXTokenPrice(10);
 obj.STXTransferFee(30);
 obj.setUserHolding(100000);
 obj.BTCTransferFee(10);
 console.log(obj.annualEarning());
 </code>
 </pre>

```
const Calculator = require('stackcalculator');
const calculator = new Calculator(" Your CoinMarketCap Api Key");
await calculator.init();
```

#### Get Total Supply

```
calculate.annualEarning();
calculate.annualEarning();
```

## Development Mode

```
- npm run dev
```
