// const viewr = {
//   /* 
//   TODO PUT ALL REGEX IN VIEWR PROPERTY viewr.rx
//   */
//  rx:{
//   stringAndVarParamRx : /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/,
//  },
//   render: (pathString, valsObj) => {
//     try {
//       // console.log("render running");
//       const path = pathString.split("\"").join("") + ext;
//       let htmlStr = fs.readFileSync(path, "utf-8");
//       const regex = /(?<=\$\{\s*).*?(?=\s*\})/g;
//       /* crée une string regex pour toutes les reconnaissances de ${fonctionDuModuleViewr()} */
//       function functionWrap(funcName) {
//         // return `(?<=\\$\\{\\s*${funcName}\\(\\s*)(.*)(?=\\s*\\)\\s*\\})`;
//         return `(\\$\\{\\s*${funcName}\\(\\s*)(.*)(\\s*\\)\\s*\\})`;
//       }
//       function functionWrap2(funcName) {//FOR TEST PURPOSE
//         // return `(?<=\\$\\{\\s*${funcName}\\(\\s*)(.*)(?=\\s*\\)\\s*\\})`;
//         return `\\$\\{\\s*${funcName}\\(\\s*(.*)\\s*\\)\\s*\\}`;
//       }
//       const outerRx = new RegExp(functionWrap("outerComponent"));

//       const innerCompRxGlobal = new RegExp(functionWrap2("component"), "g");
//       // const innerCompRx = new RegExp(functionWrap2("component"));

//       const loopCompRx = new RegExp(functionWrap2("loopComponent"), "g");
//       // const loopCompRx = new RegExp(functionWrap2("loopCompoment"));

//       /* On fournit les composants englobants */
//       const outer = htmlStr.match(outerRx);
//       if (outer) {
//         outerComponent(outer);
//       };

//       /* On fournit les composants intérieurs */
//       /* les simples */
//       const innerComps = htmlStr.match(innerCompRxGlobal);
//       if (innerComps) {
//         for (el of innerComps) {
//           // const match=innerCompsMatch.match(stringAndObjParamRx);
//           const generatedHTML = viewr.component(valsObj, htmlStr, el);
//           if (generatedHTML!=="") 
//             htmlStr = generatedHTML;
//             // console.log(generatedHTML);
//         };
//       };
//       /* les boucles */
//       const loopComps = htmlStr.match(loopCompRx);
//       if (loopComps) {
//         for (el of loopComps) {
//           htmlStr = viewr.loopComponent(valsObj, htmlStr, el);
//         };
//       };

//       /* On fournit les variables */
//       /* 
//       TODO ajouter un meilleur controle sur la regex
//       qui prend les loops pour des variables 
//        */
//       const varArray = htmlStr.match(regex);
//       if (varArray) {
//         for (el of varArray) {
//           const tmpStr=viewr.findReplace(valsObj, htmlStr, el);
//           if(tmpStr)
//           htmlStr = tmpStr;
//         };
//        // console.log("varArray",htmlStr);
//       };


//       /* 
//       TODO RECURSIVITÉ : pour aller chercher les composants extérieurs tant qu’il en trouve à chaque injection
//        */
//       function outerComponent(outerMatch) {//n’accepte qu’une seule occurence par fichier
//         const path = outerMatch[2];
//         const viewrFuncLine = outerMatch[0];
//         let outerStr = fs.readFileSync(path.split("\"").join("") + ext, "utf-8");
//         htmlStr = htmlStr.replace(viewrFuncLine, "");//replace vs split join ?
//         htmlStr = outerStr.replace("<<INSERTION-POINT>>", htmlStr);
//         // console.log(htmlStr);
//       }

//       return htmlStr;

//     } catch (e) {
//       console.error(e);
//     };
//   },

//   /* /!\ Fonction test qui ne gère pas l’absence de valeur */
//   /*  @param valObj:globl values Object passed at render in the first place
//   @param str: string to modify
//   @ innerCompsMatchElement: element from array of viewr-components declarations, matching the component() pattern
//    */
//   component: (valsObj, str, innerCompsMatchElement) => {//Attention match global en amont donc sans les capturants
//     console.log("component() running");
//     const stringAndVarParamRx = /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/;
//     if (!innerCompsMatchElement) {
//       return null;
//     };
//     const match = innerCompsMatchElement.match(stringAndVarParamRx);
//     // console.log(match);
//     let path, values, objectName, viewrFuncLine;
//     if (match) {
//       path = match[1].split("\"").join("");
//       objectName = match[2];
//       values = valsObj[objectName];
//       viewrFuncLine = innerCompsMatchElement;
//       // console.log(viewrFuncLine);
//     };
//     // console.log(match);
//     let componentStr = viewr.render(path, values);
//     // console.log(componentStr);
//     return str.replace(viewrFuncLine, componentStr);//replace vs split join ?
//     // console.log(str);
//   },
//   loopComponent: (valsObj, str, loopCompMatchElement) => {//valsObj l’objet "global" à render qui contient toute la data nécessaire
//     // console.log(valsObj);
//     try {

//     if (!loopCompMatchElement)
//       return null;

//     const match=loopCompMatchElement.match(viewr.rx.stringAndVarParamRx);
//     console.log("loop running");
//     let path, values, objectName, viewrFuncLine;
//     if (match) {
//       path = match[1].split("\"").join("");
//       objectName = match[2];
//       values = valsObj[objectName];
//       viewrFuncLine = loopCompMatchElement;
//       // console.log(viewrFuncLine);
//     };
//       const tmpArray = [];

// /*       if(!valsObj[objectName])
//       return null; */

//       for (dataObject of values) {
//         tmpArray.push(viewr.render(path,dataObject));
//       };
//       return str.replace(viewrFuncLine, tmpArray.join("\n"));
//     } catch (e) {
//       console.error(e);
//     };

//   },

//   findReplace: (valsObj, str, varName) => {
//     try {
//       // console.log("str in findreplace", str);
//       const regexVar = /^[a-zA-Z_][a-zA-Z_0-9^-]*$/;
//       const regexProp = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)+$/;
//       const regexArray = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)*\[.*\]$/;//non utilisé encore
//       if (regexVar.test(varName)) {
//         // console.log(`VIEWR regexVar "${varName}" : `+regexVar.test(varName));
//         return str.replace("${" + varName + "}", valsObj[varName]);
//       } else if (regexProp.test(varName)) {
//         //  console.log(`VIEWR regexProp "${varName}": `+regexProp.test(varName));
//         const nameArr = varName.split(".");
//         let tmpValObj = valsObj;

//         /* pour chaque partie du tableau nameArr, on va chercher plus loin à l’intérieur de
//          tmpValObj copie de (tmpValObj) : tmpValObj[nameArr[0]][nameArr[1]][nameArr[2]]...
//          … équivalent à tmpValObj["prop1"]["prop2"]["prop3"]
//          à chaque boucle on change l’objet en référence jusqu’à ce qu’on récupère une valeur primitive à la fin*/

//         for (let i = 0; i < nameArr.length; i++) {
//           tmpValObj = tmpValObj[nameArr[i]];
//         };

//         return str.replace("${" + varName + "}", tmpValObj);
//       } else if (regexArray.test(varName)) {
//         console.log("Array not implemented Yet");
//         /*
//             TODO  Implement Array row recognition 
//         */
//       };
//     } catch (e) {
//       console.log(e);
//     };
//   },
//   init: (xprLocals) => {//express locals
//     this.locals = xprLocals;
//     console.log(this.locals);
//   }
// };