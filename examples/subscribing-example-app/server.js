const express = require('express');
const Ably = require('ably/promises');
require('dotenv').config();

if (!process.env.ABLY_API_KEY) {
  console.error('ABLY_API_KEY environment variable is missing');
  process.exit(1);
}

const client = new Ably.Realtime(process.env.ABLY_API_KEY);
const port = process.env.PORT || 5000;

const app = express();

app.set('view engine', 'ejs');

app.get('/', async (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/mapbox', async (request, response) => {
  if (!process.env.MAPBOX_API_KEY) {
    console.error('MAPBOX_API_KEY environment variable is missing');
    process.exit(1);
  }
  response.render(__dirname + '/views/mapbox.ejs', {
    mapboxApiKey: process.env.MAPBOX_API_KEY,
  });
});

app.get('/google', async (request, response) => {
  if (!process.env.GOOGLE_API_KEY) {
    console.error('GOOGLE_API_KEY environment variable is missing');
    process.exit(1);
  }
  response.render(__dirname + '/views/google.ejs', {
    googleScriptPath: `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=&v=weekly`,
  });
});

app.get('/api/createTokenRequest', async (request, response) => {
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: 'ably-client-side-api-calls-demo',
  });
  response.send(tokenRequestData);
});

app.use(express.static('public'));
app.use(express.static('../../dist'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
