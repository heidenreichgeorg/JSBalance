const debug=1;
const debugWrite=1;


const HTTP_OK = 200;
const HTTP_WRONG = 400;




// ASSETS BEFORE OTHER ACCOUNTS
// NO NEGATIVE RESULTS in distribute()
// EXTEND sy_purge ;EXCEL if needed
// N defines number of columns, balance[D_Schema].total 


const { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } = require('constants');
const { FORMERR } = require('dns');
// File system
const fs = require('fs');


const Money = require('./money.js');
//const Client = require('./client.js');

const D_Schema = "Schema"; // includes .Names .total

const CSEP = ';';
const CEND = '|';

const XLSX = require('xlsx');
//const { pseudoRandomBytes } = require('crypto');


const H_LEN  = 7; // header length
const J_MINROW = 7;
const J_ACCT = 6;
const COLMIN = 2;

var SERVEROOT= '/data/sessions/';
const Slash = '/';
function setRoot(root) {  
    SERVEROOT=root; 
    console.dir("Sheets.setRoot = "+SERVEROOT);
}
module.exports['setRoot']=setRoot;



function getRoot() {  return SERVEROOT; }
module.exports['getRoot']=getRoot;



const SY_MAXCEL=255;
const SY_MAXCOL=511;
const SY_MAXLINE=4190; // maximum number of characters in one row
const SY_MAXROWS=4190; // maximum number of rows in the table
function sy_purgeRow(row) {
    if(!row) return null;
    if(row.length>=(SY_MAXLINE)) {
        console.dir("***************************************"); 
        console.dir("*           SECURITY                  *"); 
        console.dir("***************************************"); 
    }
    return row.substring(0,SY_MAXLINE);
}

function sy_purgeCell(str) {     
    if(!str) return '';
    let letters = /^[A-Za-zäöüÄÖÜß]+$/;
    let digits = /^[0-9,._ ]+$/;
    var result=[];
    for(var i=0;i<str.length && i<SY_MAXCEL;i++) {
        let c=str.charAt(i);
        if(c=='-') result.push(c);
        else if(c.match(letters)) result.push(c);
        else if(c.match(digits)) result.push(c);
    }
    return result.join('');
    //return str.replace(/;\\\'\"/,'');
}




var arrSession = [];

// GH20220524 HACK because 2nd push crashed
// function setSession(aSession) {  arrSession= [ aSession ] ; } //

function setSession(aSession) {  arrSession.push(aSession); }
module.exports['setSession']=setSession;


function get(id) { 
    let result=null;
    arrSession.forEach(session => {
        if(session.id===id) result=session;
    });
    if(result) {
        console.log("\n1800  => (SESSION  time="+result.time+"  client="+result.client+"  year="+result.year+")");
    }

    return result; 
}
module.exports['get']=get;

// 20220730
function getClient(client) { 
    let result=null;
    arrSession.forEach(session => {
        if(session.client===client && session.id!=null) result=session;
    });
    if(result) {
        console.log("\n1800  => (SESSION  time="+result.time+"  client="+result.client+"  year="+result.year+")");
    }

    return result; 
}
module.exports['getClient']=getClient;




function sy_findSessionId(client,year) {
    var result=null;
    console.log("\n1802  FIND => ( client="+client+"  year="+year+")");
    arrSession.forEach(session => {
        console.log("\n1804  CHECK => (SESSION  client="+session.client+"  year="+session.year+")");
        if(session.year===year && session.client===client) {
            result=session;
            console.log("\n1806  FOUND => (SESSION  client="+session.client+"  year="+session.year+")");
        }
    });
    if(result) return result.id;
    else return null;
}
module.exports['sy_findSessionId']=sy_findSessionId;





function getLatestFile(dir,files,lStart,lExt) {
    // log them on console
    // and remember the last match
    var found=null;
    var recent=null;
    try {
        files.forEach(file => {
            var lFile=file.toLowerCase();
            if(lFile.startsWith(lStart) && lFile.endsWith(lExt)) {
                const { mtimeMs, ctimeMs } = fs.statSync(dir+file);
                if(!recent || mtimeMs>recent) {
                    recent=mtimeMs;
                    found=dir+file;
                }
                
            } //else console.log("getLatestFile("+lStart+","+lExt+") skips "+file);
        });
    } catch(err) { console.dir("getLatestFile from dir="+dir+"  files="+files+":"+err); }
    if(debug) console.log("getLatestFile("+lStart+","+lExt+")     returns  "+found);
    return found;
}


/*
async function __setFileNameS(session,client,year,start,ext) {

    // directory path
    var result=null;
    var dir = getClientDir(client); // GH20220430

    var lStart =year; // =start.toLowerCase();   // GH20220430
    var lExt= ext.toLowerCase();

    if(debug) console.log("sheet.setFileNameS SEARCH in "+dir+" for "+lStart+"*"+lExt);



    result = await new Promise((resolve) => {
        // GH20211231
        // list all files in the directory
        fs.readdir(dir, (err, files) => {

            if (err) { console.dir(err);  }        
            // files object contains all files names
            session.sheetFile=dir+"BOOK"+lStart+'.'+lExt;
            let sFile=getLatestFile(dir,files,lStart,lExt);
            if(sFile && sFile.length>session.sheetFile.length) {
                session.sheetFile=sFile;
                if(debug) console.log("sheet.setFileNameS fs.readDir in "+dir+" FOUND: sets default "+session.sheetFile);
                
            } else if(debug) console.log("sheet.setFileNameS fs.readDir in "+dir+" NOT FOUND: sets default "+session.sheetFile);
        })
    });
// unreached code
}
*/

var found='';
function getJSON() {
    return found;
}
module.exports['getJSON']=getJSON;


async function findLatestJSON(client,year) {
    // directory path
    var result=null;
    var dir = getClientDir(client); // GH20220430
    var lStart =year; 
    var lExt= ".json";

    if(debug) console.log("sheet.getLatestJSON SEARCH in "+dir+" for "+lStart+"*"+lExt);

    result = await new Promise((resolve) => {
        // GH20211231
        // list all files in the directory
        fs.readdir(dir, (err, files) => {
            if (err) { console.dir(err);  }        
            // files object contains all files names
            //session.sheetFile=dir+"BOOK"+lStart+'.'+lExt;
            let sFile=getLatestFile(dir,files,lStart,lExt);
            if(sFile && sFile.length>10) {
                found=sFile;
                console.log("getLatestJSON fs.readDir in "+dir+" finds "+found);

            } else if(debug) console.log("getLatestJSON fs.readDir in "+dir+" finds NO LATEST ");
        })
    });
// unreached code
}
module.exports['findLatestJSON']=findLatestJSON;





// GH20211024
function numericSheet(tBuffer,schemaLen) {
    // result:JS numeric values for XLSX

    //GH20211026 side-effect: clean tBuffer, use EU values

    // SECURITY - SANITIZE OUTPUT
  
    // function return make EN string booking values for JSON
    var result=(CSEP.repeat(schemaLen-1)+CEND).split(CSEP);
    
    result[0]=tBuffer[0];
    for(let i=1;i<schemaLen;i++) {

        if(tBuffer[i] && tBuffer[i].length>0) {

            let cell=sy_purgeCell(tBuffer[i]);

            if(i>=J_ACCT && ((tBuffer[0]=='A') || (parseInt(tBuffer[0])>0))) {
                // EU to EN
                let value=parseFloat(cell.replace('\.','').replace(',','\.'));
                
                if(typeof value === 'number' && !Number.isNaN(value)) result[i]=value;
                

                //GH20211026 side-effect: clean tBuffer
                var amount = Money.setEUMoney(cell);
                tBuffer[i]  = Money.moneyString(amount);

            } else result[i]=cell;

        } else result[i]='';
    }
    return result;
}





async function saveLogT(client,logT) {
    if(debug) console.log("sheets.saveLogT Saving(JSON)");        
    //log("saveLogT");  
    const data = JSON.stringify(logT);
    if(data) {
        var pSave = fs.writeFileSync(jsonLogf(client), data, {'encoding':'utf8'}, (err) => { // was latin1 GH20211120
            if (err) {
                console.dir("sheets.saveLogT: "+err);          
                throw err;
            }
            console.log("sheets.saveLogT Saving("+data+")");          
        });
    }
    console.log("JSON logf is saved.");
}





function readCSVFile(foundPath) {
    var aoaCells = [];
    if(foundPath) {
        if(debug) console.log("sheets.readCSVFile reading "+foundPath);
        try {
            // read contents of the file in ISO-8859-1 = latin1
            const data = fs.readFileSync(foundPath, 'latin1');       
            // split the contents by new line
            var csvLines = data.split(/\r?\n/);

            //aoaCells = readEULines(csvLines,Money.setEUMoney); 
            aoaCells = readNumeric(csvLines,Money.setEUMoney); 
            
        }  catch (err) {
            console.error('sheets.readCSVFile:'+err);
        }
    }
    return aoaCells;
}



function readXLSXFile(foundPath,tabName,annualTXN) {
    var aoaCells = [];
    if(foundPath) {
        if(debug) console.log("sheets.readXLSXFile reading "+foundPath);
        try {
           // XLSX
           var workbook = XLSX.readFile(foundPath);
           
           var xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[tabName],{ 'FS':CSEP });
           if(debug) console.log("sheets.readXLSXFile finds sheet "+tabName);    

            // split the contents by new line
            var numericLines = xlData.split(/\r?\n/);

            if(debug) console.log('sheets.readXLSXFile: #'+numericLines.length);

            aoaCells = readNumeric(numericLines,Money.setENMoney);
            //aoaCells = readENLines(numericLines,Money.setENMoney);

        }  catch (err) {
            console.error('sheets.readXLSXFile:'+err);
        }
    }
    return aoaCells;
}


function readNumeric(csvLines,makeMoneyFunc) {
    var row=0;
    var aoaCells = [];

    if(csvLines.length>=SY_MAXROWS) console.dir("SECURITY readNumeric SY_MAXROWS exceeded!");

// SECURITY - SANITIZE INPUT

    for(;row<csvLines.length && row<SY_MAXROWS;row++) { 
        
        let  rawLine=sy_purgeRow(csvLines[row]);
        
        if(rawLine) {
            var cells = rawLine.split(CSEP);
            var keep=false;
            if(cells[0] && cells[0].length>0) keep=true;
            var jCells=[];
            var col=0;

            if(parseInt(cells[0])>0) console.log('sheets.readNumeric storeCell '+rawLine);

            // GH20220127
            // issue with non-existing cells in excel
            var schemaLen = SY_MAXCOL;
            for(var col=0; col<schemaLen /*&& col<cells.length*/;col++) {
                if(cells[col] && cells[col].length>0) {      
                                                                                
                    if((schemaLen == SY_MAXCOL) && cells[col].charAt(0)===CEND) { schemaLen=col; }
                    else {
                        // GH20220129
                        var text = sy_purgeCell(   cells[col]  );

                        // GH2021-11-02
                        if(keep && (parseInt(cells[0])>0  ||  cells[0].charAt(0)==='A') && col>=J_ACCT) {
                            text=Money.moneyString(makeMoneyFunc(text));
                        }
                        jCells[col]= text.trim();
                    }

                } else jCells[col]='';
                
            }  // );

            if(keep) { // avoid empty rows
                aoaCells[row]=jCells;
            } else {
                console.log('sheets.readNumeric('+row+') SKIP '+rawLine);
            }
        }
    }
    return aoaCells;
}





function bookSheet(sessionId,tBuffer,sessionTime,nextSessionId) {

    var session = get(sessionId);

    if(session) {
        if(session.sheetName) {
            let client = session.client;
            let year = session.year;

            if(client && year && session.sheetCells) {

                var numLines = session.sheetCells.length;
                if(debugWrite) console.log("2010 sheets.bookSheet ENTER "+session.sheetName+ " for ("+client+","+year+") with "+numLines+" lines in sheet ");
                
//                let schemaLen = session.sheetCells[H_LEN].length;
                if(tBuffer) {
                    // add hash
                    if(tBuffer[0]>0) tBuffer[0]=symbolic(tBuffer.join('')); 

                    numLines = session.sheetCells.push(tBuffer); 

                    session.time=sessionTime;
                    session.id=nextSessionId;

                    if(debugWrite) console.log("2020 sheets.bookSheet APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);

                    setSession(session);
                }
                else if(debugWrite) console.log("2021 sheets.bookSheet SAVE NO booking statement tBuffer ("+client+","+year+") #"+numLines);
            }
            else if(debugWrite) console.log("2023 sheets.bookSheet SAVE NO DATA ("+client+","+year+")") ;
        }
        else if(debugWrite) console.log("2025 sheets.bookSheet SAVE NO sheetName"+sessionId);
    }
    else if(debugWrite) console.log("2027 sheets.bookSheet SAVE NO session"+sessionId);
}
module.exports['bookSheet']=bookSheet;



function getNLine(aoaCells) {
    // redundant, subset of Server.phaseOne, processes N line only
    var result = [];
    result[D_Schema]= {};
    

    // digest aoaCells and write into balance object
    var lineCount=0;

    if(aoaCells && aoaCells.length>J_MINROW) {

        var numLines=aoaCells.length;

        let lastLine = aoaCells[numLines-1];
        console.log("0100 sheets.getNLine() LAST TXN at "+lastLine[1]+' for '+lastLine[3]);

        if(numLines>J_MINROW) {

            try {
                var iAssets=0;
                var iEqLiab=0;
                var iTotal=0;

                // print all lines
                aoaCells.forEach(row => {

                    lineCount++;
                    
                    if(debug>3) console.log("0110 sheets.getNLine "+JSON.stringify(row));
                        
                    var column;
                    var key=row[0];
                    if(key && key==='N') {
                        const aNames=row;
                        result[D_Schema]["Names"]=aNames;
                        var column;
                        for(column=0;column<aNames.length && !(aNames[column].length>0 && aNames[column].length<4 && aNames[column].includes(CEND));column++) {
                            var rawName=aNames[column];
                            if(rawName && rawName.length>=COLMIN && column>=J_ACCT) {
                                var aName=rawName.trim();
                                if(debug>1) console.log("N "+aName);
                                if(aName==='ASSETS') { iAssets=column;
                                    result[D_Schema].assets=column;
                                } else if(aName==='EQLIAB') { iEqLiab=column;
                                    result[D_Schema].eqliab=column;
                                } 
                            }                    
                        }
                        iTotal=column;
                        result[D_Schema].total=column;
                    }
                });
            } catch (err) {
                console.error('0125 sheets.js getNLine:'+err);
                console.dir('0125 sheets.js getNLine:'+err);
            }
        }
    }
    return result;
}




// skip tBuffer ??
function xlsxWrite(sessionId,tBuffer,sessionTime,nextSessionId) {

    // ignore session.sheetFile

    var session = get(sessionId);

    if(session) {

        let sheetFile = getClientDir(session.client) + session.year + session.client + ".xlsx"

        if(sheetFile) {
            if(session.sheetName) {
            let client = session.client;
            let year = session.year;

            if(client && year) {

                    if(debugWrite) console.log("1400 sheets.xlsxWrite ENTER "+session.sheetName+ " for ("+client+","+year+") in file "+sheetFile);

                    var excelData=[];            
                    var numLines = 0;
                    var schemaLen = 0;

                    if(session.sheetCells) {
                        var r=0;

                        numLines = session.sheetCells.length;
                        schemaLen = session.sheetCells[H_LEN].length;
                        // GH20220131
                        let response = getNLine(session.sheetCells);
                        let aLen = parseInt(response[D_Schema].assets);
                        let eLen = parseInt(response[D_Schema].eqliab);
                        console.dir("1410 sheets.xlsxWrite using aLen "+aLen+" schemaLen "+schemaLen+" for #"+numLines);

                        var aCentsTotal=0;
                        var eCentsTotal=0;
                        for(;r<numLines;r++) {
                            let arrNum = session.sheetCells[r];

                            if(parseInt(arrNum[0])>0) {
                            
                                // 20220627 add all-String ASSET sum to arrTransaction
                                var centsSum=0;
                                for(var col=J_ACCT;col<aLen;col++) {
                                    let cVal = Money.setEUMoney(arrNum[col]).cents;
                                    if(cVal!=0) centsSum = cVal+centsSum;
                                }
                                arrNum[aLen]=Money.cents2EU(centsSum);
                                if(centsSum!=0) {
                                    aCentsTotal=aCentsTotal+centsSum;
                                }

                                // 20220628 add all-String GALS,EQLIAB sum to arrTransaction
                                centsSum=0;
                                for(var col=aLen+1;col<schemaLen;col++) {
                                    let cVal = Money.setEUMoney(arrNum[col]).cents;
                                    if(cVal!=0 && col!=eLen) centsSum = cVal+centsSum;
                                }
                                arrNum[eLen]=Money.cents2EU(centsSum);
                                if(centsSum!=0) {
                                    eCentsTotal=eCentsTotal+centsSum;
                                }
                            }
                            
                            var arrTransaction = numericSheet(arrNum,schemaLen);
                            arrTransaction.push(CEND);
                            excelData.push(arrTransaction);
                        }
                    } else console.error("1415 sheets.xlsxWrite NO sheetCells");

                    console.dir("1416 sheets.xlsxWrite "+numLines+" lines with ASSETS "+Money.cents2EU(aCentsTotal)+"  and GALS+EQLIAB="+Money.cents2EU(eCentsTotal));

                    var excelLogT=[];            
                    var numLogs = 0;
                    if(session.logT) {
                        var s=0;
                        for(let id in session.logT) {
                            let arrLine = [ id, JSON.stringify(session.logT[id]) ];
                            excelLogT.push(arrLine);
                            numLogs++;
                        }                       
                    } else console.dir("1425 sheets.xlsxWrite NO LOGT");


                    var excelAddrT=[];            
                    var numAddrs = 0;
                    try {
                        if(session.addrT) {
                            for(let id in session.addrT) {
                                let title = [ id ];
                                let arrLine = title.concat(session.addrT[id]);
                                excelAddrT.push(arrLine);
                                numAddrs++;
                            }                       
                        } else console.dir("1435 sheets.xlsxWrite NO ADDRT");
                    } catch(err) {console.dir("1445 sheets.xlsxWrite ADDRT "+err);}


                    if(tBuffer) {
                        // add hash
                        if(tBuffer[0]>0) tBuffer[0]=symbolic(tBuffer.join('')); 

                        var arrTransaction = numericSheet(tBuffer,schemaLen);
                        numLines = session.sheetCells.push(tBuffer); 
                        arrTransaction.push(CEND);
                        excelData.push(arrTransaction); 

                        session.time=sessionTime;
                        session.id=nextSessionId;

                        // add new txn to JSON
                        let len=session.sheetName.length;
                        if(len>6) {

                            if(debugWrite) console.log("1450 sheets.xlsxWrite JSON save2Server("+arrTransaction+") to "+client+","+year);
                            save2Server(session,client,year);
                            
                        } else console.dir("1455 sheets.xlsxWrite can't write to "+session.sheetName);

                        if(debugWrite) console.log("1460 sheets.xlsxWrite APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);
                    }
                    else if(debugWrite) console.log("1465 sheets.xlsxWrite SAVE NO TRANSACTION ("+client+","+year+") #"+numLines);



                    // MAKE NEW SHEETS
                    var  xSheet = XLSX.utils.json_to_sheet(excelData,{skipHeader:true });
                    var  lSheet = null; if(excelLogT) lSheet=XLSX.utils.json_to_sheet(excelLogT,{skipHeader:true }); 
                    var  aSheet = null; if(excelAddrT) aSheet=XLSX.utils.json_to_sheet(excelAddrT,{skipHeader:true }); 
                    var  workBook = null;
                    try{  
                        workBook = XLSX.readFile(sheetFile);
                        // GH20220118 workBook.Sheets[session.sheetName]=xSheet;
                    } catch(err) { console.dir("1475 sheets.xlsxWrite FAILED to OPEN sheetFile "+sheetFile+" for ("+client+","+year+") #"+numLines);}

                    if(workBook==null) {
                        workBook = XLSX.utils.book_new();
                        console.dir("1480 sheets.xlsxWrite CREATE new workbook for ("+client+","+year+") #"+numLines);
                    }


                    if(numLines>0 && excelData && xSheet) {
                        if(workBook.Sheets && workBook.Sheets[session.sheetName]) {
                            if(debugWrite) console.log("sheets.xlsxWrite UPDATE SHEET ("+client+year+") #"+numLines);
                            workBook.Sheets[session.sheetName]=xSheet;                
                        } else {
                            // append did not work, so make a new one
                            console.dir("1485 sheets.xlsxWrite CREATE SHEET "+session.sheetName+" for ("+client+","+year+") #"+numLines);
                            XLSX.utils.book_append_sheet(workBook, xSheet, session.sheetName);
                        }
                        if(debugWrite) console.log("sheets.xlsxWrite SHEET ("+client+year+")  OK ");
                    }


                    if(numLogs>0 && excelLogT && lSheet) {
                        if(workBook.Sheets && workBook.Sheets['LOGT']) {
                            if(debugWrite) console.log("1490 sheets.xlsxWrite UPDATE SHEET LOGT #"+numLogs);
                            workBook.Sheets['LOGT']=lSheet;                
                        } else {
                            // did not work
                            console.dir("1495 sheets.xlsxWrite CREATE SHEET LOGT "+numLogs);
                            XLSX.utils.book_append_sheet(workBook, lSheet, 'LOGT');
                        }
                        if(debugWrite) console.log("1500 sheets.xlsxWrite SHEET LOGT OK ");
                    }


                    if(numAddrs>0 && excelAddrT && aSheet) {
                        if(workBook.Sheets && workBook.Sheets['ADDR']) {
                            if(debugWrite) console.log("1510 sheets.xlsxWrite UPDATE SHEET ADDR #"+numAddrs);
                            workBook.Sheets['ADDR']=aSheet;                
                        } else {
                            // did not work
                            console.dir("1515 sheets.xlsxWrite CREATE SHEET ADDR #"+numAddrs);
                            XLSX.utils.book_append_sheet(workBook, aSheet, 'ADDR');
                        }
                        if(debugWrite) console.log("1520 sheets.xlsxWrite SHEET ADDR OK ");
                    }


                    XLSX.writeFile(workBook, sheetFile);
                    if(debugWrite)  console.log("1530 sheets.xlsxWrite WRITE FILE "+sheetFile);
                    
                } else {
                    console.dir("1535 sheets.xlsxWrite() NO client / year "+JSON.stringify(session));
                }   
            } else {
                console.dir("1545 sheets.xlsxWrite() NO sheetName and NOT writing "+JSON.stringify(session));
            }
        } else {
                console.dir("1555 sheets.xlsxWrite NO sheetFile and NOT writing "+JSON.stringify(session));
        }
    } else {
        console.dir("1565 sheets.xlsxWrite NO SESSION "+sessionId);
    }
}
module.exports['xlsxWrite']=xlsxWrite;







function getFromFile(client,year,sFile,time,sName) {

    var sheetCells=[];
    var dir = getRoot()+client+Slash; // GH20220430

    if(debug) console.log("getFromFile "+sFile+" in "+dir);

    if(sFile) {

        let ext = sFile.split('\.').pop();

        // temporary object names
        if(ext==='csv') {
            if(debug) console.log("getFromFile Found CSV in "+sFile);
            sheetCells = readCSVFile(sFile);
        }
        else if(ext==='xlsx') {
            if(debug) console.log("getFromFile Found XLSX in "+sFile);
            sheetCells = readXLSXFile(sFile,sName);
        }

        var numLines = sheetCells.length;            
        console.log("getFromFile Found "+sFile+" with "+numLines+" lines.");                    
    }            

    return sheetCells;
       
}



async function save2Server(session,client,year,res,forwardURL) {
    console.log("0014 save2Server Start saving(JSON) to "+SERVEROOT);        

    const data = JSON.stringify(session);

    let sessionId=session.id;
    let jsonFileName=jsonMain(client,year,sessionId);


    // REJECT IF FILE EXISTS
    if(checkExist(getClientDir(client),year)) {
        console.log("0017 sheets.save2Server: DETECTS COLLISION ");   
        return null;
    }


    // WRITE SESSION   1st PARAMETER
    fs.writeFileSync(jsonFileName, data, {'encoding':'utf8'}, (err) => { // was latin1 GH20211120
        if (err) {
            console.log("0019 sheets.save2Server: "+err);          
            //throw err;
        }
        //console.log("0016 save2Server Saving("+jsonFileName+")");          
    });
    console.log("0016 save2Server: JSON main save to "+jsonFileName+" started.");


    // REDIRECT TO FORWARD PAGE
    if(res && forwardURL) {
        console.log("0018 save2Server: redirecting to "+forwardURL);

        //res.redirect(forwardURL);
        res.writeHead(HTTP_OK, {"Content-Type": "text/html"});
        res.end("<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>LOGIN</TITLE><BODY><A class='keyPanel' HREF="+
            forwardURL+">LOGIN</A></BODY><HTML>\n\n");
   
    }

    return jsonFileName;
}
module.exports['save2Server']=save2Server;


function saveSessionLog(sessionId,txn) {

    let delta = txn.delta;
    let sInfo = JSON.stringify(txn);

    let session = get(sessionId);

    if(session) {
        if(delta) {
            if(!session.logT) session.logT = {};

            let id = symbolic(delta);

            if(id) {
                console.log("app.post saveSessionLog map("+id+")=>"+sInfo);

                session.logT[id] = txn;

                if(session.client) {
                    saveLogT( session.client, session.logT );
                    console.log("app.post saveSessionLog saved "+JSON.stringify(session.logT));

                } else console.log("app.post saveSessionLog did not save: no client!");
            } else console.log("app.post saveSessionLog did not save: no hashed id!");
        } else console.log("app.post saveSessionLog did not save: no transaction!");
    } else console.log("app.post saveSessionLog did not save: no session object!");
}
module.exports['saveSessionLog']=saveSessionLog;


function logS(session,caller) {
    var  info = "empty";
    if(session) {
        let sCells=session.sheetCells;
        info = "{ client:"+session.client+" year:"+session.year+" time:"+session.time+ " sheetName:"+session.sheetName+" sheetCells#"+sCells.length+"  #="+sCells[sCells.length-1]+"}";
    }
    console.log("**** "+caller+" session "+info);
    
}


function isSameFY(year) 
{
    let numYear=unixYear();
    console.log("isSameFY"+numYear);
    if(parseInt(year)>numYear-1) return true;
    return (parseInt(year)==numYear) 
}
module.exports['isSameFY']=isSameFY;




// returns YEARmain.json file FOUND
// also sets found variable as a side-effect
function checkExist(dir,year) {
    console.log("sheets.checkExist fs.readDir in "+dir+" for file '"+year+"main.json'");
    var found=null;
    fs.readdir(dir, (err, files) => {
        if (err) { console.dir(err);  }        
        // files object contains all files names
    
        found=getLatestFile(dir,files,year+"main",".json");
        if(found && found.length>8) {
            console.log("sheets.checkExist fs.readDir in "+dir+" FINDS EXISTING '"+found+"'");
        } else if(debug) console.log("sheets.checkExist fs.readDir in "+dir+" CLEARED "+year+"main.json");
    })

    return found;
}


function getClientDir(client) {
    return getRoot()+client+Slash; 
}
module.exports['getClientDir']=getClientDir;

// GH20211119
function jsonMain(client,year,sid) {
    return getClientDir(client)+year+"main.json";
}

function jsonFile(client,year,sid) {
    return getClientDir(client)+year+fileFromSession(sid)+".json";
    // return root+client+Slash+year+Slash+fileFromSession(sid)+".json"; 
}

function jsonLogf(client) {
    return getClientDir(client)+"logf.json";
}



function unixYear() {
    return new Date(Date.now()).getUTCFullYear();
};


function fileFromSession(sid) {
    var result="main";
    if(sid) {
        var buffer=[ sid[0] ];
        for(var i=1;i+4<sid.length;i+=4) buffer.push(sid[i]);
        result=buffer.join('');
    } 
    return result;
}




function symbolic(pat) {
    var res = 0;
    if(pat) {
        var sequence = ' '+pat+pat+pat;
        var base=71;
        for(let p=0;p<sequence.length && p<80;p++) {
            res = (res + sequence.charCodeAt(p) & 0x1FFFFFEF)*base;  
        }
    }
    return res & 0x3FFFFFF;
}
module.exports['symbolic']=symbolic;


