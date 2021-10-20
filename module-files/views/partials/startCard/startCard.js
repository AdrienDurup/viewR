/* startCard component */
const {VRComponent,fs}=require("../../../core/viewr");

class StartCard extends VRComponent{
   static httpsOptions = {
      hostname: "localhost",
      port: 4000,
      path: "component/?test=oui",
      method: 'GET'
    };
    constructor() {
      super(StartCard.httpsOptions,__dirname);
  
    }
transform(){
return this.viewr;
};
}

module.exports=StartCard;