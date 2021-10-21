/* startCard component */
const { VRComponent, ViewR, http } = require("../../../core/viewr");

class StartCard extends VRComponent {
  static httpsOptions = {
    hostname: "localhost",
    port: 4000,
    path: "/msg/?msg=hello",
    method: 'GET',
  };
  static host = `http://${StartCard.httpsOptions.hostname}:${StartCard.httpsOptions.port}`;
  test = "";
  
  constructor() {
    super(StartCard.httpsOptions, __dirname);
    this.queryData(this.test);
    // this.queryData();
    // console.log("receiver startCard", this.dataReceiver);
  }

//   //WORKING
//   queryData() {
//     const req=http.get(StartCard.host+"/msg/", (response)=>{
//       let data = "";
//       response.on('data', (chunk) => {
//         data += chunk;
//         console.log(data);
//       });
//       response.on('end', () => {
//         console.log(globalThis);
//        this.transform(data);
//         console.log(JSON.parse(data));
//       });
//     });
// req.on("error", (err) => {
//   console.log("Error: " + err.message);
// });
//   }
  queryData() {
    const req=http.get(StartCard.host+"/msg/",this.response);
req.on("error", (err) => {
  console.log("Error: " + err.message);
});
  }
  response=(response)=> {//LE THIS EST RESPECTÉ DANS CETTE FONCTION ANONYME
    let data = "";
    response.on('data', (chunk) => {
      data += chunk;
      // console.log(data);
    });
    response.on('end', () => {
     return this.transform(data);
      // console.log(JSON.parse(data));
    });
  }
  transform(data) {
    data=JSON.parse(data);
    if(data){
     
     const newStr=ViewR.replaceVar({ data }, this.viewr);
     console.log("TRANSFORMED",newStr );
     return newStr;
    }else{console.error("failed to JSON.parse data. is data Valid ?");}
 
   };

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