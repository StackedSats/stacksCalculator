const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

const coinMarketCapApiKey = process.env.apiKey;

axios.interceptors.request.use(
  function (config) {
    console.log(config.url);
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

app.use(cors());
app.get("/data", async (req, res) => {
  try {
    const btc = axios({
      method: "get",
      headers: {
        "X-CMC_PRO_API_KEY": coinMarketCapApiKey,
      },
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC`,
    });

    const stx = axios({
      method: "get",
      headers: {
        "X-CMC_PRO_API_KEY": coinMarketCapApiKey,
      },
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=STX`,
    });

    const stxTransferFee = axios({
      method: "get",
      url: "https://stacks-node-api.blockstack.org/v2/fees/transfer",
    });

    const liquidStxSupply = axios({
      method: "get",
      url: "https://explorer-api.blockstack.org/api/v2/total-supply",
    });

    const btcTxFee = axios({
      method: "get",
      url: "https://bitcoiner.live/api/fees/estimates/latest?confidence=0.8",
    });

    const prices = await Promise.all([
      btc,
      stx,
      stxTransferFee,
      liquidStxSupply,
      btcTxFee,
    ]).then((result) => {
      console.log(result);
      btcusd = result[0].data.data.BTC.quote.USD.price;
      stxusd = result[1].data.data.STX.quote.USD.price;
      stxTransactionFeeReult = result[2].data;
      liquidStxSupplyResult = parseInt(result[3].data.totalStacks);
      btcTxFeeResult = result[4].data.estimates[30].total.p2wpkh.usd;
      const fresult = {
        stxusd,
        btcusd,
        btcTxFeeResult,
        liquidStxSupplyResult,
        stxTransactionFeeReult,
      };
      return fresult;
    });
    console.log(prices);
    res.status(200).send(prices);
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
    res.end();
  }
});

app.listen(3500, () => console.log("Server up at 3500"));
