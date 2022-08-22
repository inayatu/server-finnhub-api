const express = require('express');
const cors = require('cors');
const WebSocket = require('websocket').w3cwebsocket;
require('dotenv').config();

const PORT = 8000;

const app = express();

app.get('/', (req, res) => {
  res.json('hi');
});

let LPUdata;

app.get('/connect-to-last-price-update-api', async (req, res) => {
  const createWebSocketConnection = async () => {
    const finnhubAPIkey = process.env.FINNHUB_API_KEY;
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${finnhubAPIkey}`);

    // Connection opened -> Subscribe
    socket.addEventListener('open', event => {
      socket.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));
      socket.send(
        JSON.stringify({ type: 'subscribe', symbol: 'BINANCE:BTCUSDT' })
      );
      socket.send(
        JSON.stringify({ type: 'subscribe', symbol: 'IC MARKETS:1' })
      );
    });

    const returnLTPdata = async () => {
      return new Promise(res => {
        // Listen for messages
        socket.addEventListener('message', event => {
          const json = JSON.parse(event.data);

          try {
            if ((json.event = 'data')) {
              console.log(json.data);
            }
          } catch (err) {
            console.log(
              'Event Listener of "Message" event caught error: ',
              err
            );
          }
          res(json);
        });
      });
    };

    const result = await returnLTPdata();
    return result;

    // Unsubscribe
    // const unsubscribe = (symbol) => {
    //     socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
    // }
  };
  LPUdata = await createWebSocketConnection();
  res.json(LPUdata);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
