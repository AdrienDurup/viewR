const xpr = require("express");
const routes = require("./routes");
const http = require("http");

const port = "4000";
const host = `http://localhost:${port}`;

const srv = xpr();

srv.listen(port, () => {
    console.log("viewR Demo running");
});

// srv.use((req,res,next)=>{
//     const https = require('https');

// https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', (resp) => {
//   let data = '';

//   // A chunk of data has been received.
//   resp.on('data', (chunk) => {
//     data += chunk;
//   });

//   // The whole response has been received. Print out the result.
//   resp.on('end', () => {
//     console.log(JSON.parse(data).explanation);
//     next();
//   });

// }).on("error", (err) => {
//   console.log("Error: " + err.message);
// });
// });
srv.use(routes);