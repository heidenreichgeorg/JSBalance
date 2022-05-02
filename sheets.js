const debug=1;
const debugWrite=1;

// ASSETS BEFORE OTHER ACCOUNTS
// NO NEGATIVE RESULTS in distribute()
// EXTEND sy_purge ;EXCEL if needed
// N defines number of columns, balance[D_Schema].total 

/*
C	DE46 7603 0080 0900 4976 10	Buchungssatz	Sender	SVWZ1	SVWZ2	Eifelweg 22
.	Fürth HRA 10564	Heidenreich Grundbesitz KG		UTF-8	UTF-8	Beträge als Zahl2
.	216_162_50652	Buchungssatz	Sender	SVWZ1	SVWZ2	Eifelweg 22
N	Name	Dr. Georg Heidenreich	Erlangen	.	.	GRSB
I	DE46 7603 0080 0900 4976 10	Fürth HRA 10564	216_162_50652			
K	Kontennummer	2021	Heidenreich Grundbesitz KG	.	.	200
S	Shares	100				m m n n n 
R	Report					x
E	Eigenkapital			de-gaap-ci_bs.eqLiab.equity.		
X	BALANCE					de-gaap-ci_bs.ass.fixAss.tan.landBuildings.buildingsOnOwnLand
P	Partnername					MM MM NN NN NN
A	Anlagespiegel		1,1,2021			
*/

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



const J_ACCT = 6;
const H_LEN  = 7; // header length



const LOCALROOT = 'D:\\Privat\\';
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



//var sessionList = [];
var sessionABC = {};
function setSession(aSession) { sessionABC=aSession; }
function get(id) { return sessionABC; }

module.exports['get']=get;






/*
function load(sessionId,phaseOneFunction) {
    // INSTEAD OF SESSION BAlANCE MEMBER
    var balance = [];

    let addrT= 0;

    var session = get(sessionId);

    if(session && session.time && session.time.length>4 && session.client && session.client.length>2 && session.year && session.year.length>3) {

        session = create(session.client,session.year,session.time,session.remote,session.id);

        if(session.sheetCells && session.sheetCells.length>H_LEN) {

            if(debug) console.log("sheets.load() with "+session.id);    
            balance = phaseOneFunction(addrT,session.logT, session.sheetCells);

        } else { console.error("sheets.load() NO SHEET CELLS"); }

    } else { console.error("sheets.load("+sessionId+") NO  SESSION"); }

    return balance; 
}
//module.exports['load']=load;
*/



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



async function setFileNameS(root,session,client,year,start,ext) {

    // directory path
    var result=null;
    var dir = root+client+Slash; // GH20220430

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
                
            } else if(debug) console.log("fs.readDir in "+dir+" sets default "+session.sheetFile);
        })
    });
// unreached code
}
//module.exports['getFromFile']=getFromFile;






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
                //if(typeof value ==='number') result[i]=Money.cents2Excel(Money.setEUMoney(cell).cents);               
                if(typeof value === 'number') result[i]=value;
                

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
        if(debug) console.log("server.readCSVFile reading "+foundPath);
        try {
            // read contents of the file in ISO-8859-1 = latin1
            const data = fs.readFileSync(foundPath, 'latin1');       
            // split the contents by new line
            var csvLines = data.split(/\r?\n/);

            //aoaCells = readEULines(csvLines,Money.setEUMoney); 
            aoaCells = readNumeric(csvLines,Money.setEUMoney); 
            
        }  catch (err) {
            console.error('server.readCSVFile:'+err);
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



function start(sessionId,client,year,time,remote,phaseOneFunction) {
    
    var balance = [];
    let addrT = null;
    
    if(time && time.length>4 && client && client.length>2 && year && year.length>3) {
        console.dir("0410 sheets.start(sessionId "+sessionId+",client"+client+",year "+year+",time "+time+",remote "+remote+")");    

        var session = create(client,year,time,remote,sessionId);
        if(session.sheetCells && session.sheetCells.length>H_LEN) {

            session.id = sessionId;
            // generate session with symbolic string as extra credential parameter
            // GLOBAL STATE CHANGE  without balance member GH20211120
            setSession(session);

            balance = phaseOneFunction(addrT,session.logT,session.sheetCells);
            console.dir("0410 sheets.start() uses sessionId: "+sessionId);    

        } else { console.log("0401 sheets.start() NO SHEET CELLS"); }
    }
    return balance; 
}
module.exports['start']=start;



function xlsxWrite(sessionId,tBuffer) {

    var session = get(sessionId);

    if(session) {

        if(session.sheetFile) {
            if(session.sheetName) {
            let client = session.client;
            let year = session.year;

            if(client && year) {

                    if(debugWrite) console.log("1400 sheets.xlsxWrite ENTER "+session.sheetName+ " for ("+client+","+year+") in file "+session.sheetFile);

                    var excelData=[];            
                    var numLines = 0;
                    var schemaLen = 0;

                    if(session.sheetCells) {
                        var r=0;

                        numLines = session.sheetCells.length;
                        schemaLen = session.sheetCells[H_LEN].length;
                        // GH20220131
                        console.dir("1410 sheets.xlsxWrite using schemaLen "+schemaLen+" for #"+numLines);
                        
                        for(;r<numLines;r++) {
                            var arrTransaction = numericSheet(session.sheetCells[r],schemaLen);
                            arrTransaction.push(CEND);
                            excelData.push(arrTransaction);
                        }
                    } else console.error("1415 sheets.xlsxWrite NO sheetCells");


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

                        // add new txn to JSON
                        let len=session.sheetName.length;
                        if(len>6) {
                            if(debugWrite) console.log("1450 sheets.xlsxWrite saveLatest("+arrTransaction+") to "+client+","+year);
                            save2Server(session,client,year);
                            
                        } else console.dir("1455 sheets.xlsxWrite can't write to "+session.sheetName);

                        if(debugWrite) console.log("1460 sheets.xlsxWrite APPEND  "+JSON.stringify(tBuffer)+" to ("+client+","+year+") #"+numLines);
                    }
                    else if(debugWrite) console.log("1465 sheets.xlsxWrite SAVE("+client+","+year+") #"+numLines);



                    // MAKE NEW SHEETS
                    var  xSheet = XLSX.utils.json_to_sheet(excelData,{skipHeader:true });
                    var  lSheet = null; if(excelLogT) lSheet=XLSX.utils.json_to_sheet(excelLogT,{skipHeader:true }); 
                    var  aSheet = null; if(excelAddrT) aSheet=XLSX.utils.json_to_sheet(excelAddrT,{skipHeader:true }); 
                    var  workBook = null;
                    try{  
                        workBook = XLSX.readFile(session.sheetFile);
                        // GH20220118 workBook.Sheets[session.sheetName]=xSheet;
                    } catch(err) { console.dir("1475 sheets.xlsxWrite FAILED to OPEN sheetFile "+session.sheetFile+" for ("+client+","+year+") #"+numLines);}

                    if(workBook==null) {
                        workBook = XLSX.utils.book_new();
                        console.dir("1480 sheets.xlsxWrite CREATE new workbook for ("+client+","+year+") #"+numLines);
                    }


                    if(numLines>0 && excelData && xSheet) {
                        if(workBook.Sheets && workBook.Sheets[session.sheetName]) {
                            if(debugWrite) console.log("sheets.xlsxWrite UPDATE SHEET ("+client+year+") #"+numLines);
                            workBook.Sheets[session.sheetName]=xSheet;                
                        } else {
                            // did not work
                            console.dir("1485 sheets.xlsxWrite CREATE SHEET "+sesssion.sheetName+" for ("+client+","+year+") #"+numLines);
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


                    XLSX.writeFile(workBook, session.sheetFile);
                    if(debugWrite)  console.log("1530 sheets.xlsxWrite WRITE FILE "+session.sheetFile);
                    
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



function create(client,year,time,remote,sessionId) {
    let sName=client+year;
    
    var session = { 'client':client,  'year':year,  'remote':remote,  'time':time,  'sheetCells':'', 'sheetName':client+year, 'id':sessionId, 'logT':[] };

    setFileNameS(SERVEROOT,session,client,year,'BOOK','xlsx'); // async find a XLSX file and sets session.sheetFile
    
    var sFile=jsonMain(SERVEROOT,client,year,sessionId);
    try {
        console.log("0021 sheets.create MAIN "+sFile);
        var json = JSON.parse(fs.readFileSync(sFile,{'encoding':'utf8'})); // was latin1 GH20211120
        session.sheetCells = json.sheetCells;
        console.log("0022 sheets.create reads MAIN JSON sheetCells#"+session.sheetCells.length);

    }  catch (err) {
        console.error('0023 sheets.create getSheet MAIN ERROR:'+err);
        console.log(  '0023 sheets.create getFromFile MAIN used '+sFile);
    }

    var lFile=jsonLogf(client);
    try {
        console.log("0024 sheets.create LOGF "+lFile);
        var logT = JSON.parse(fs.readFileSync(lFile,{'encoding':'utf8'})); // was latin1 GH20211120
        if(debug>2) console.log("     sheets.create reads LOGF JSON content: "+JSON.stringify(logT));
        session.logT = logT;
        if(debug>0) console.log("     sheets.create reads LOGF JSON logt#"+session.logT.length);
        
    }  catch (err) {
        session.logT = { };
        console.error('0025 sheets.create LOGT ERROR:'+err);
        console.log(  '0025 sheets.create LOGT used '+lFile);
    }

    /*
    var lFile=jsonADDRf(client);
    try {
        console.log("Sheets.getSheet ADDRF "+lFile);
        var ADDRT = JSON.parse(fs.readFileSync(lFile,{'encoding':'utf8'})); // was latin1 GH20211120
        if(debug>2) console.log("getSheet reads ADDRF JSON content: "+JSON.stringify(ADDRT));
        session.ADDRT = ADDRT;
        if(debug>0) console.log("getSheet reads ADDRF JSON ADDRt#"+session.ADDRT.length);
        
    }  catch (err) {
        session.ADDRT = { };
        console.error(' sheets.getSheet ADDRT ERROR:'+err);
        console.ADDR(' sheets.getFromFile ADDRT used '+lFile);
    }
    */
   // bootstrap
    session.addrT = { 
        "BundesanzeigerVerlag": [ "",                  "Amsterdamerstraße 192","Köln",   "50735"  ],
        "Reichel":              [ "Schornsteinfeger",  "Bamberger Str. 10","Mühlhausen", "96172"  ],
        "Joachim Dudek":        [ "Hausmeisterservice","Ritterspornweg 1" ,"Erlangen",   "91056"  ], 
        "Ferguson":             [ "George",            "Eifelweg 22","Erlangen",         "91056"  ], 
        "Roby Vau":             [ "Familie"           ,"Am Dummetsweiher 6", "Erlangen", "91056"  ],
        "Kristina":             [ "Heidenreich"       ,"Hützel Bahnhof", "Bispingen",    "29646"  ]
    };


    setTimeout(function(){
        let sFile = session.sheetFile;
        if(sFile && sFile.length>3) {
            session.sheetName=sName;
            console.log('sheets.create getSheet finds '+sFile);
        } else console.log('sheets.create getSheet finds NO sheetFile');


        // CREATE JSON FROM EXCEL
        if(!session.sheetCells || session.sheetCells.length<H_LEN) {
            session.sheetCells = getFromFile(client,year,sFile,time,sName);

            console.dir('sheets.create getSheet getFromFile reads '+session.sheetName+" with "+session.sheetCells.length+" lines.")

            //console.log(' sheets.getFromFile reads '+session.sheetName); 
            save2Server(session,client,year);       
        }   
    }, 2000);

    logS(session,"getSheet");

    console.dir('0026 sheets.create reads '+session.sheetName+" with "+session.sheetCells.length+" lines.")

    return session;
}





function getFromFile(client,year,sFile,time,sName) {

    var sheetCells=[];
    var dir = SERVEROOT+client+Slash; // GH20220430

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


/*
async function saveLatest(session,client,year) {
    console.log("saveLatest Saving(JSON)");        

    const data = JSON.stringify(session);

    let sessionId=session.id;

    var pSave = fs.writeFileSync(jsonMain(SERVEROOT,client,year,sessionId), data, {'encoding':'utf8'}, (err) => { // was latin1 GH20211120
        if (err) {
            console.log(" sheets.saveLatest: "+err);          
            throw err;
        }
        console.log("saveLatest Saving("+data+")");          
    });
    console.log("JSON main is saved.");
}
module.exports['saveLatest']=saveLatest;
*/

async function save2Server(session,client,year) {
    console.log("0016 save2Server Saving(JSON) to "+SERVEROOT);        

    const data = JSON.stringify(session);

    let sessionId=session.id;

    var pSave = fs.writeFileSync(jsonMain(SERVEROOT,client,year,sessionId), data, {'encoding':'utf8'}, (err) => { // was latin1 GH20211120
        if (err) {
            console.log("0017  sheets.save2Server: "+err);          
            throw err;
        }
        console.log("save2Server Saving("+data+")");          
    });
    console.log("0018 save2Server: JSON main is saved.");
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







// GH20211119
function jsonMain(root,client,year,sid) {
    return root+client+Slash+year+fileFromSession(sid)+".json";
    // return root+client+Slash+year+Slash+fileFromSession(sid)+".json"; GH20220430
}

function jsonLogf(client) {
    return SERVEROOT+client+Slash+"logf.json";
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


