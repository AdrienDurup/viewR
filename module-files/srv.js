const xpr = require("express");
const routes = require("./routes");
const http = require("http");

const port = "4000";
const host = `http://localhost:${port}`;

const srv = xpr();

srv.listen(port, () => {
    console.log("viewR Demo running");
});

srv.use(routes);