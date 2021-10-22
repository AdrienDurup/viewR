/* startCard component */
const { VRComponent, ViewR, http } = require("../../../core/viewr");
const { EventEmitter } = require("events");
const axios = require("axios");
// const { EventEmitter, EventTarget} = require("events");
class dataReadyEmitter extends EventEmitter { }

class StartCard extends VRComponent {

constructedView="";
  constructor() {
    super(StartCard.httpsOptions, __dirname);
    // this.queryData();
    // console.log("receiver startCard", this.dataReceiver);
  }

  async queryData(receiver) {
    try {
      receiver = await axios.get("http://localhost:4000/msg");
      receiver=receiver.data;
      console.log("RECEIVER",receiver);
      this.constructedView=this.transformWith(receiver);
    } catch (e) {
      console.error(e);
    };
  }
  transformWith(data) {
    if (data) {
      const newStr = ViewR.replaceVar({ data }, this.viewr);
      // console.log("TRANSFORMED", newStr);
      return newStr;
    } else { console.error("failed to JSON.parse data. is data Valid ?"); }

  };
  async render() {
   await this.queryData(this.dataReceiver);
    return this.constructedView;

  }

}

module.exports = StartCard;