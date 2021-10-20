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
  constructor() {//express locals

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


      /* composants */
      const comps = htmlStr.match(compRx);
      if (comps) {
        console.log("comps", comps);
        for (const el of comps) {
          htmlStr = this.component(valsObj, htmlStr, el);
          console.log(htmlStr);
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
    console.log(match);
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
      const myComp = new MyComp();
      let componentStr = myComp.render();//ajouter optional data ?
      // console.log(componentStr);
      return str.replace(viewrFuncLine, componentStr);//replace vs split join ?
      // console.log(str);
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
}
const https = require("https");
const http = require("http");

class VRComponent {
  httpsOptions = {};
  id = 0;
  dirname;
  viewr;
  constructor(httpsOptions,realDirname) {
    this.httpsOptions = httpsOptions;
    this.id = ViewR.components.length;
    ViewR.components.push(this);
    this.dirname=realDirname;
    this.setViewr();
  }
  /* 
  @param {cbErr} callback for error handling. Needs error param
  @param {cbRes} callback for response handling. Needs response param
   */
  queryData(cbErr, cbRes) {
    console.log(this.httpsOptions);
    const req = http.request(this.httpsOptions, (res) => {
      req.on('error', cbErr);
      res.on('data', cbRes);
    });
    req.end();
  }

  /* permet de stocker la string du balisage .viewr dans l’instance*/
   setViewr(){
    let name=this.constructor.name;
    console.log(name);
    const firstLetterLower=name.slice(0,1).toLowerCase();
    console.log(firstLetterLower);
    name=name.replace(/./,firstLetterLower);
    this.viewr=fs.readFileSync(`${this.dirname}/${name}.viewr`);
  }

  transform(any){}//sert à transformer le composant avant le rendu. Doit retourner string

  /* Méthode appelée par le render de ViewR */
  render(){
   const htmlStr=this.transform(this.viewr);
    return htmlStr;
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
  ViewR, VRComponent,fs
}




