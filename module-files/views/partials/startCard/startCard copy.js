/* startCard component */
const { VRComponent, ViewR, http } = require("../../../core/viewr");
const { EventEmitter } = require("events");
// const { EventEmitter, EventTarget} = require("events");
class dataReadyEmitter extends EventEmitter { }

class StartCard extends VRComponent {
  static httpsOptions = {
    hostname: "localhost",
    port: 4000,
    path: "/msg/?msg=hello",
    method: 'GET',
  };
  static host = `http://${StartCard.httpsOptions.hostname}:${StartCard.httpsOptions.port}`;
   emitter = new dataReadyEmitter();
  constructor() {
    super(StartCard.httpsOptions, __dirname);
    // this.queryData();
    // console.log("receiver startCard", this.dataReceiver);
  }

  queryData(receiver) {
    const req = http.get(StartCard.host + "/msg/", (response) => { this.response(receiver, response) });
    req.on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
  response = (receiver, response) => {//LE THIS EST RESPECTÉ DANS CETTE FONCTION ANONYME
    receiver = "";
    response.on('data', (chunk) => {
      receiver += chunk;
      // console.log(data);
    });
    response.on('end', () => {

      console.log(JSON.parse(receiver));
      const str = this.transform(receiver);
      this.emitter.emit("dataReady",str);
      // console.log(str);
      // return str;
    });
  }
  transform(data) {
    data = JSON.parse(data);
    if (data) {
      const newStr = ViewR.replaceVar({ data }, this.viewr);
      // console.log("TRANSFORMED", newStr);
      return newStr;
    } else { console.error("failed to JSON.parse data. is data Valid ?"); }

  };
  render() {
    this.emitter.on("dataReady", (data) => {
      console.log("EMITTER", data);
      return data;
    });
  this.queryData(this.dataReceiver);
    // console.log("RENDER", str);
    // return str;
    // console.log("render", this.viewr);
    // return this.viewr;
  }
  // result(receiver, incomingData) {//default callback. overridable
  //   receiver += incomingData;
  //   console.log("result startCard", receiver);
  // }
  // error(err) {
  //   console.error(err);
  // }
  // end(receiver) {//default callback. overridable
  //   console.log("request end with " + receiver);
  //   this.transform();
  // }
  // transform() {
  //  const data=JSON.parse(this.test);
  //  if(data){
  //   console.log("Receiver on transform", );
  //   return ViewR.replaceVar({ data }, this.viewr);
  //  }else{console.error("failed to JSON.parse data. is data Valid ?");}

  // };
}

module.exports = StartCard;