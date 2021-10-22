const fs = require("fs");
const ext = ".viewr";

class ViewR {
  /* 
  TODO PUT ALL REGEX IN VIEWR PROPERTY viewr.rx
  */
  static components = [];
  set components(v) {
    if (v.constructor.name === "VRComponent") {
      components.push(v);
    };
  };
  rx = {
    stringAndVarParamRx: /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/,
    stringVarVarParamRx: /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/,
  };
  set rx(v) { };
  locals = {};
  componentRenderReady = new EventEmitter();

  constructor() {//express locals

  }

  static middleware = (req, res, next) => {
    /* En attente */
  }

  render(pathString, valsObj) {
    try {
      // console.log("render running");
      const path = pathString.split("\"").join("") + ext;
      let htmlStr = fs.readFileSync(path, "utf-8");

      const regex = /(?<=\$\{\s*).*?(?=\s*\})/g;
      /* crée une string regex pour toutes les reconnaissances de ${fonctionDuModuleViewr()} */
      function functionWrap(funcName) {
        return `(\\$\\{\\s*${funcName}\\(\\s*)(.*)(\\s*\\)\\s*\\})`;
      }
      function functionWrap2(funcName) {//FOR TEST PURPOSE
        return `\\$\\{\\s*${funcName}\\(\\s*(.*)\\s*\\)\\s*\\}`;
      }
      const outerRx = new RegExp(functionWrap("wrapperSnippet"));
      const innerCompRx = new RegExp(functionWrap2("snippet"), "g");
      const loopCompRx = new RegExp(functionWrap2("loopSnippet"), "g");
      const toggleCompRx = new RegExp(functionWrap2("togglable"), "g");
      const compRx = new RegExp(functionWrap2("component"), "g");

      /* On fournit les composants englobants */
      const outer = htmlStr.match(outerRx);
      if (outer) {
        wrapperSnippet(outer);
      };

      /* On fournit les composants intérieurs */
      /* les simples */
      const innerComps = htmlStr.match(innerCompRx);
      if (innerComps) {
        for (const el of innerComps) {
          const generatedHTML = this.snippet(valsObj, htmlStr, el);
          if (generatedHTML !== "")
            htmlStr = generatedHTML;
        };
      };

      /* les boucles */
      const loopComps = htmlStr.match(loopCompRx);
      if (loopComps) {
        for (const el of loopComps) {
          htmlStr = this.loopSnippet(valsObj, htmlStr, el);
        };
      };

      /* toggles */
      const toggleComps = htmlStr.match(toggleCompRx);
      // console.log(toggleCompRx,toggleComps);
      if (toggleComps) {
        // console.log("hasToggle", toggleComps);
        for (const el of toggleComps) {
          htmlStr = this.togglable(valsObj, htmlStr, el);
        };
      };


      /* On fournit les variables */
      /* 
      TODO ajouter un meilleur controle sur la regex
      qui prend les loops pour des variables 
       */
      const varArray = htmlStr.match(regex);
      if (varArray) {
        for (const el of varArray) {
          const tmpStr = this.findReplace(valsObj, htmlStr, el);
          if (tmpStr)
            htmlStr = tmpStr;
        };
        // console.log("varArray",htmlStr);
      };

      /* composants */
      const comps = htmlStr.match(compRx);
      if (comps) {
        console.log("comps", comps);
        for (const el of comps) {
          htmlStr = this.component(valsObj, htmlStr, el);
        };
      };

      /* 
      TODO RECURSIVITÉ : pour aller chercher les composants extérieurs tant qu’il en trouve à chaque injection
       */
      function wrapperSnippet(outerMatch) {//n’accepte qu’une seule occurence par fichier
        const path = outerMatch[2];
        const viewrFuncLine = outerMatch[0];
        let outerStr = fs.readFileSync(path.split("\"").join("") + ext, "utf-8");
        htmlStr = htmlStr.replace(viewrFuncLine, "");//replace vs split join ?
        htmlStr = outerStr.replace("<<INSERTION-POINT>>", htmlStr);
        // console.log(htmlStr);
      }

      return htmlStr;

    } catch (e) {
      console.error(e);
    };
  }

  component(valsObj, str, compsMatchElement) {
    const stringOptionalVarParamRx = /["'`](.*)["'`]\s*(,\s*([a-zA-Z_][a-zA-Z_0-9^-]*))?/;

    const match = compsMatchElement.match(stringOptionalVarParamRx);
    // console.log(match);
    const viewrFuncLine = compsMatchElement;
    if (match) {
      const pathArray = match[1].split(/["'`]/).join("").split("\/");
      const compName = pathArray[pathArray.length - 1];
      const path = match[1];
      let values;
      if (match[3]) {
        values = valsObj[match[3]];
      };
      const MyComp = require(fs.realpathSync(`${path}/${compName}.js`));
      // console.log("instanciation of " + `${path}/${compName}.js`);
      // let componentStr = "<div>ViewR ERROR : couldn’t fetch required data.</div>";
      let componentStr;
      const myComp = new MyComp();
      myComp.emitter.on("dataReady", (data) => {
        console.log("AAAAAmyComp.emitter.on", data);
        componentStr = data;
      });
      myComp.render();
      return componentStr;
      // myComp.render();

    };
  }


  /* /!\ Fonction test qui ne gère pas l’absence de valeur */
  /*  @param valObj:globl values Object passed at render in the first place
  @param str: string to modify
  @ innerCompsMatchElement: element from array of viewr-components declarations, matching the component() pattern
   */
  snippet(valsObj, str, innerCompsMatchElement) {//Attention match global en amont donc sans les capturants
    console.log("component() running");
    const stringAndVarParamRx = /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/;
    if (!innerCompsMatchElement) {
      return null;
    };
    const match = innerCompsMatchElement.match(stringAndVarParamRx);
    // console.log(match);
    let path, values, objectName, viewrFuncLine;
    if (match) {
      path = match[1].split(/["'`]/).join("");
      objectName = match[2];
      values = valsObj[objectName];
      viewrFuncLine = innerCompsMatchElement;
      // console.log(viewrFuncLine);
      // console.log(match);
      let componentStr = this.render(path, values);
      //console.log(componentStr);
      return str.replace(viewrFuncLine, componentStr);//replace vs split join ?
      // console.log(str);
    };

  }

  loopSnippet(valsObj, str, loopCompMatchElement) {//valsObj l’objet "global" à render qui contient toute la data nécessaire
    // console.log(valsObj);
    try {

      if (!loopCompMatchElement)
        return null;

      const match = loopCompMatchElement.match(this.rx.stringAndVarParamRx);
      console.log("loop running");
      let path, values, objectName, viewrFuncLine;
      if (match) {
        path = match[1].split(/["'`]/).join("");
        objectName = match[2];
        values = valsObj[objectName];
        viewrFuncLine = loopCompMatchElement;
        // console.log(viewrFuncLine);
      } else {
        throw `ViewR Error : invalid argument string in ${loopCompMatchElement}`;
      }
      const tmpArray = [];

      /*       if(!valsObj[objectName])
            return null; */

      for (const dataObject of values) {
        tmpArray.push(this.render(path, dataObject));
      };
      return str.replace(viewrFuncLine, tmpArray.join("\n"));
    } catch (e) {
      console.error(e);
    };

  }

  /* 
  fusionner togglable avec component ?
  TODO gestion des erreurs */
  togglable(valsObj, str, toggleMatchElement) {
    console.log("togglable() running");
    try {
      //     if (!toggleMatchElement)
      // return null;

      const match = toggleMatchElement.match(this.rx.stringVarVarParamRx);
      const viewrFuncLine = toggleMatchElement;
      let path, values, conditionValue;
      if (match) {
        conditionValue = valsObj[match[3]];// match[3] donne un nom de variable 
        console.log(conditionValue);
        if (conditionValue) {
          path = match[1].split(/["'`]/).join("");
          values = valsObj[match[2]];// match[2] donne un nom de variable 
          let componentStr = this.render(path, values);
          return str.replace(viewrFuncLine, componentStr);//replace vs split join ?
        } else {
          return str.replace(viewrFuncLine, "");
        };



      } else {
        throw `ViewR Error : invalid argument string in ${toggleMatchElement}`;
      };
    } catch (e) {
      console.error(e);
    };



  }

  findReplace(valsObj, str, varName) {
    try {
      // console.log("str in findreplace", str);
      const regexVar = /^[a-zA-Z_][a-zA-Z_0-9^-]*$/;
      const regexProp = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)+$/;
      const regexArray = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)*\[.*\]$/;//non utilisé encore
      if (regexVar.test(varName)) {
        // console.log(`VIEWR regexVar "${varName}" : `+regexVar.test(varName));
        return str.replace("${" + varName + "}", valsObj[varName]);
      } else if (regexProp.test(varName)) {
        //  console.log(`VIEWR regexProp "${varName}": `+regexProp.test(varName));
        const nameArr = varName.split(".");
        let tmpValObj = valsObj;

        /* pour chaque partie du tableau nameArr, on va chercher plus loin à l’intérieur de
         tmpValObj copie de (tmpValObj) : tmpValObj[nameArr[0]][nameArr[1]][nameArr[2]]...
         … équivalent à tmpValObj["prop1"]["prop2"]["prop3"]
         à chaque boucle on change l’objet en référence jusqu’à ce qu’on récupère une valeur primitive à la fin*/

        for (let i = 0; i < nameArr.length; i++) {
          tmpValObj = tmpValObj[nameArr[i]];
        };

        return str.replace("${" + varName + "}", tmpValObj);
      } else if (regexArray.test(varName)) {
        console.log("Array not implemented Yet");
        /*
            TODO  Implement Array row recognition 
        */
      };
    } catch (e) {
      console.log(e);
    };
  }


  /* 
  ============================================
  STATIC FUNCTIONS FOR COMPONENT INTERACTION
  ============================================
  */


  static replaceVar(valsObj, str) {

    try {
      /* On fournit les variables */
      /* 
      TODO ajouter un meilleur controle sur la regex
      qui prend les loops pour des variables 
       */ const regex = /(?<=\$\{\s*).*?(?=\s*\})/g;

      const varArray = str.match(regex);
      if (varArray) {
        for (const el of varArray) {
          str = findReplace(valsObj, str, el);
        };
        return str;
      };

      function findReplace(valsObj, str, varName) {
        // console.log("str in findreplace", str);
        const regexVar = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
        const regexProp = /^[a-zA-Z_][a-zA-Z_0-9]*(\.[a-zA-Z_0-9]*)+$/;
        const regexArray = /^[a-zA-Z_][a-zA-Z_0-9]*(\.[a-zA-Z_0-9]*)*\[.*\]$/;//non utilisé encore
        if (regexVar.test(varName)) {
          // console.log(`VIEWR regexVar "${varName}" : `+regexVar.test(varName));
          return str.replace("${" + varName + "}", valsObj[varName]);
        } else if (regexProp.test(varName)) {
          //  console.log(`VIEWR regexProp "${varName}": `+regexProp.test(varName));
          const nameArr = varName.split(".");
          console.log("nameArr ==>", nameArr);
          let tmpValObj = {};
          Object.assign(tmpValObj, valsObj);
          console.log("ASSIGN", tmpValObj);
          /* pour chaque partie du tableau nameArr, on va chercher plus loin à l’intérieur de
           tmpValObj copie de (tmpValObj) : tmpValObj[nameArr[0]][nameArr[1]][nameArr[2]]...
           … équivalent à tmpValObj["prop1"]["prop2"]["prop3"]
           à chaque boucle on change l’objet en référence jusqu’à ce qu’on récupère une valeur primitive à la fin*/
          for (let i = 0; i < nameArr.length; i++) {
            tmpValObj = tmpValObj[nameArr[i]];
            /* 
            TODO Contrôler et gérer les inadéquations entre la data reçue et celle attendue */

            // console.log("KEYS", Object.keys(tmpValObj), typeof tmpValObj, tmpValObj);
          };
          // console.log("STR",str);
          const regexToReplace = new RegExp("\\$\\{\\s*" + varName + "\\s*\\}");
          return str.replace(regexToReplace, tmpValObj);

        } else if (regexArray.test(varName)) {
          console.log("Array not implemented Yet");
          /*
              TODO  Implement Array row recognition 
          */
        };
      };
    } catch (e) {
      console.log(e);
    };
  }
}

const https = require("https");
const http = require("http");
const { EventEmitter } = require("stream");

/* 
============================================
CLASS FOR COMPONENTS
============================================
*/


class VRComponent {
  httpsOptions = {};
  id = 0;
  dirname;
  viewr;
  dataReceiver = "";
  constructor(httpsOptions, realDirname) {
    this.httpsOptions = httpsOptions;
    this.id = ViewR.components.length;
    ViewR.components.push(this);
    this.dirname = realDirname;
    this.setViewr();
  }
  /*
  @param {cbErr} callback for error handling. Needs error param
  @param {cbRes} callback for response handling. Needs response param
   */
  queryData(dataReceiver = this.dataReceiver, errorCb = this.error, resultCb = this.result, endCb = this.end) {
    /* req = http.ClientRequest Object. extends Stream. the callback is an handler for response event. this 
    callback parameter is an http.IncomingMessage. Extends Stream.Readable */
    const request = http.request(this.httpsOptions, (response) => {
      response.on('data', (incomingData) => { resultCb(dataReceiver, incomingData) });//wrapper pour passer le receiver au callback overridable
      response.on('end', (dataReceiver) => { endCb(dataReceiver) });
    });
    request.on('error', errorCb);
    request.end();
    // request.end(JSON.stringify(dataReceiver), "utf-8");
  }
  error(err) {//default callback. overridable
    console.error(`Error : ${err}`);
  }
  result(receiver, incomingData) {//default callback. overridable
    receiver += incomingData;
    console.log("result method", receiver);
  }
  end(receiver) {//default callback. overridable
    console.log("request end with " + receiver);
    return receiver;
  }
  /* permet de stocker la string du balisage .viewr dans l’instance*/
  setViewr() {
    let name = this.constructor.name;
    console.log(name);
    const firstLetterLower = name.slice(0, 1).toLowerCase();
    console.log(firstLetterLower);
    name = name.replace(/./, firstLetterLower);
    this.viewr = fs.readFileSync(`${this.dirname}/${name}.viewr`, "utf-8");
  }

  transform() {

    this.viewr = ViewR.replaceVar({ data: this.dataReceiver }, this.viewr);
  }//sert à transformer le composant avant le rendu. Doit retourner string

  /* Méthode appelée par le render de ViewR */
  render() {
    console.log("render", this.viewr);
    return this.viewr;
  }

  /* Créer ici une requête html */
  // const req = new XMLHttpRequest();

  /* On lui passe des données */
  // req.submittedData=JSON.stringify({move:this.coordinate});

  /* on récupère le nom de session stocké dans l’id de body  */
  // const session = document.querySelector("body").id;
  /* on poste la requête */
  // const reqJSON = encodeURI(JSON.stringify({ move: this.coordinate }));
  // console.log(`reqJSON : ${reqJSON}`);
  // req.open("GET", `/penteonline/${session}/?json=${reqJSON}`, false);
  // req.send();
}

module.exports = {
  ViewR, VRComponent, fs, http
}




