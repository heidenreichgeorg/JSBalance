let debug=0;

// Imports
const { addEUMoney, moneyString, iScaleMoney, setEUMoney , setENMoney, setMoney, subEUMoney, lessMoney, cents2EU } = require('./money.js');

// Modules
const express = require('express');
const app = express();

const Account = require('./account.js');
const Sheets = require('./sheets');
const Sender = require('./sender');


const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object


// table parsing
const CEND= '|';
const CSEP = ';';
const J_ACCT = 6; // first account
const J_MINROW=7;


//import { argv } from 'process';

// print process.argv
process.argv.forEach(function (val, index, array) {
    if(debug>1) console.log("0002 Starting server " + index + ': ' + val);
    let attribute=val.split('=');
    if(index>1 && attribute && attribute.length>1) {
        if(debug>1) console.log("0004 Attribute " + index + ': ' + val);
        if(attribute[0].toLowerCase()==='root') {
            Sheets.setRoot(attribute[1]);
            console.log("0006 Starting server SET ROOT TO " + Sheets.getRoot());
        }        
    }
  });

// Language de_DE
let de_DE = {
    // Bilanz nach HGB
    assets:'Aktiva',
    tanfix:'Sachanlagen',
    finfix:'Finanzanlagen',
    fixed:'Anlagevermögen',
    cash:'Bargeld',
    bank:'Bankkonto',
    money:'Bargeld/Bank',
    rec:'Forderungen',
    curr:'Umlaufvermögen',
    eqliab:'Passiva',
    equity:'Eigenkapital',
    liab:'Fremdkapital',
    liabother:'Sonstige Verb.',
    eqfix:'Festkapital',
    eqpart:'Kommanditkapital',
    velimp:'Kommanditisten-VK',
    veulip:'Komplementär-VK',
    income:"Gewinn",
    closing:"Bilanzgewinn",
    
    thereof:"davon",
    reportYear:"Berichtsjahr",

    // Berichtstypen
    AcctOpen:"Kontenspiegel Eröffnung",
    AcctClose:"Kontenspiegel Abschluss",
    AcctHistory:"Kontoauszug",
    Assets:"Anlagespiegel",
    BalanceOpen:"Eröffnungsbilanz",
    DashBoard:"Status",
    GainlossHGB:"Ergebnis HGB275A2",
    BalanceClose:"Bilanz mit Gewinn",
    GainLoss:"Gewinn/Verlust",
    History:"Buchungen",
    Patterns:"Vorlagen",

    // Anlagen
    AssetIdent: "Kennzeichen",
    AssetType:  "Anlagegut",
    AssetCost:  "Anschaffungsk.",
    AssetNumber:"Anzahl",
    AssetRemain:"Zeitwert",
    AssetPrice: "Stückkosten",

    // GainLoss GuV
    Carry4Loss: "Verlustvortrag",
    NextYear: "Folgejahr",
    VariableCap: "Variables Kapital",
    CapGainTax: "KapErtragSt",
    CapGainSoli: "KapErtragStSoli",
    RegularOTC: "Betriebsergebnis",
    RegularFIN: "Finanzergebnis",
    Revenue:    "Umsatz",
    DirectCost: "zurechenb. Kosten",
    GrossYield: "Rohertrag",
    DirectCost: "zurechenb. Kosten",
    Depreciation:"Abschreibung",
    OtherRegular:"and. betriebl. Kosten",
    YPart:"Beteiligungsergebnis",
    FinSale:"Wertpapier-VK",
    NetInterest:"Zinseinnahmen",
    InterestCost:"Zinskosten",
    CapTax:"Kap.Ertragssteuer",
    PaidTax:"gezahlte Steuern",
    OpAssets:"betriebsnotw.Vermögen",
    AvgCurrent:"mittl.Umlaufvermögen",
    OpCapital:"betriebsnotw.Kapital",
    CapMargin:"Kapitalrendite",

    // Buttons
    Address:"Adresse",
    Book: "Buchen",
    Closing:"Abschluss",
    Diagram:"Diagramm",
    Transfer:"Überweisung",
    Transaction:"Buchung"
}
module.exports['de_DE']=de_DE;


// main response object
// SCHEMA-part
const COLMIN=2;
const D_Schema = "Schema"; // includes .Names .total .assets .eqliab  N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
const D_XBRL   = "XBRL";
const D_Eigner = "Eigner";
const D_Equity = "Kapital";
// TRANSACTIONS-part
const D_Balance= "Bilanz";
const D_History= "Historie";
const D_Partner_NET= "NETPartner";
const D_Partner_CAP= "CAPPartner";
const D_Partner_OTC= "OTCPartner";
const D_SHARES = "Anteile";
const D_Report = "Report";
const D_FixAss = "Anlagen";
const D_Muster = "Muster";
const D_Adressen="Adressen";

// XBRL
function initBalance() {

    var balance = [];

    balance[D_Balance]={};
    balance[D_History]={};
    balance[D_Schema]= {};
    balance[D_FixAss]= {};
    balance[D_Partner_NET]= {};

    balance[D_Report]={
        xbrlTanFix : { level:3, xbrl: "de-gaap-ci_bs.ass.fixAss.tan", de_DE:'Sachanlagen'},
        xbrlFinFix : { level:3, xbrl: "de-gaap-ci_bs.ass.fixAss.fin", de_DE:'Finanzanlagen'},
        xbrlFixed  : { level:2, xbrl: "de-gaap-ci_bs.ass.fixAss", de_DE:'Anlagevermögen'},
        abrlABank: {   level:4, xbrl: "de-gaap-ci_bs.ass.currAss.cashEquiv.bank", de_DE:'Bankkonto'},
        abrlAmoney: {  level:3, xbrl: "de-gaap-ci_bs.ass.currAss.cashEquiv", de_DE:'Geldinstr.'},
        xbrlArec: {    level:3, xbrl: "de-gaap-ci_bs.ass.currAss.receiv", de_DE:'Forderungen'},
        xbrlAcurr: {   level:2, xbrl: "de-gaap-ci_bs.ass.currAss", de_DE:'Umlaufvermögen'},
        xbrlAssets : { level:1, xbrl: "de-gaap-ci_bs.ass", de_DE:'Aktiva'},
        divider:    {  level:0, xbrl: "", de_DE:''},
        xbrlLother: {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.liab.other", de_DE:'Sonstige Verb.'},
        xbrlLloan: {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.liab.bank", de_DE:'Darlehen'},
        xbrlLshare: {  level:3, xbrl: "de-gaap-ci_bs.eqLiab.liab.shareholders", de_DE:'Gesell.Darlehen'},
        xbrlLiab: {    level:2, xbrl: "de-gaap-ci_bs.eqLiab.liab", de_DE:'Fremdkapital'},
        xbrlEqfix: {   level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.FK", de_DE:'Festkapital'},
        xbrlEqlim: {   level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK", de_DE:'Kommanditkapital'},
        xbrlEVulp: {   level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK", de_DE:'Komplementär-VK'},
        xbrlEVlim: {   level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK", de_DE:'Kommanditisten-VK'},
        xbrlUVAVA: {   level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.accumLoss", de_DE:'Verlust FA Komplem.'},
        xbrlLVAVA: {   level:3, xbrl: "de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.accumLoss", de_DE:'Verlust FA Kommmand.'},
        xbrlEquity: {  level:2, xbrl: "de-gaap-ci_bs.eqLiab.equity", de_DE:'Eigenkapital'},
        xbrlRegFin:  { level:3, xbrl:"de-gaap-ci_is.netIncome.regular.fin", de_DE:de_DE.RegularFIN},      
        xbrlRegOTC:  { level:3, xbrl:"de-gaap-ci_is.netIncome.regular.operatingTC", de_DE:de_DE.RegularOTC},      
        xbrlRegular: { level:2, xbrl:"de-gaap-ci_is.netIncome.regular", de_DE:'Gewinn/Verlust'},      
        xbrlEqLiab : { level:2, xbrl: "de-gaap-ci_bs.eqLiab", de_DE:'Passiva o G'}, // see HGBBeginYear.html HGBRegular.html
        xbrlIncome: {  level:1, xbrl: "de-gaap-ci_bs.eqLiab.income", de_DE:'Passiva'},
        // see phaseTwo() in server.js, CloseAndSave.htmlReport.xbrlIncome.closing.split(CSEP);
        //xbrlNIP:    {  level:1, xbrl: "de-gaap-ci_bs.eqLiab.equity.netIncomePartnerships", de_DE:'Bilanzgewinn'},
        // 20220123 previous row is synthetic, from KernTax for HGBRegular
    };
    // subscribed.limitedLiablePartners.accumLoss

    return balance;
}


// HTTP
const HTTP_OK = 200;
const PORT = 81;


const bodyParser = require("body-parser");
const { stringify } = require('querystring');
// const { sign } = require('crypto');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve your css and index.html as static
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.redirect('/SHOW');
})



// LOGIN to an existing session
app.post("/LOGIN", (req, res) => { 
    console.log("\n\n");

    console.log("0010 app.post LOGIN "+JSON.stringify(req.body));
    let remote = req.socket.remoteAddress;
    let client = req.body.client;
    let year   = req.body.year;
    let time   = req.body.time;    
    //let sessionId = req.body.sessionId;
    
    let sessionId = strSymbol(time+client+year+time);
    //            let sessionId = Sheets.symbolic(time+client+year+time);

    console.dir("0020 app.post LOGIN with client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+sessionId);

    Sheets.start(sessionId,client,year,time,remote,phaseOne);
    
    let banner = makeBanner(sessionId,year);

    console.dir("0030 app.post LOGIN responds with banner="+banner);

    // send back sessionId to client brwoser or file
    res.writeHead(HTTP_OK, {"Content-Type": "text/html"});
    res.end("\n<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>Welcome</TITLE>"+banner+"</HTML>\n"); 
    
});


//start session with uploading a session file for a known client
app.post("/UPLOAD", (req, res) => { 
    console.log("\n\n");

    // client sends client_year.JSON file
    // this json has to be stored as <SESSION>.json

    var banner = "0031 NO VALID CLIENT FILE";
    
    let remote = req.socket.remoteAddress;
    console.log("0010 app.post UPLOAD from "+remote);

    let data = req.body;

    if(data && data.client && data.year) {

        let client = req.body.client;
        let year   = req.body.year;
        let time   = req.body.time;    
        let sessionId = req.body.id;
        let fileId = strSymbol(time+client+year+time);

        if(sessionId===fileId) { // 20220506
            
            // GH20220506 FIND OTHER YEAR.*JSON file
            // and compare the timestamps
            let dir = Sheets.getClientDir(client);
           
            Sheets.findLatestJSON(client,year); // async - writes it into Sheets.found, Sheets.getJSON()

            if(0) { // later async check sheets found
                res.writeHead(HTTP_OK, {"Content-Type": "text/html"});
                res.end("\n<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>UPLOAD FOUND "+found+"</TITLE>FOUND A NEWER FILE "+found+"</HTML>\n"); 
            }

            // save file on server, not on client
            console.dir("0013 app.post UPLOAD with client="+client+",year="+year+",time="+time+",r="+remote+"  ---> "+fileId);
            Sheets.save2Server(req.body,client,year);

            console.dir("0020 app.post UPLOADED to SERVER");
            Sheets.start(sessionId,client,year,time,remote,phaseOne);

            console.log ( "0030 app.post UPLOAD STARTED  ");
            banner = makeBanner(sessionId,year);

            console.log ( "0040 app.post UPLOAD responds with  " +banner);

        } else console.log ( "0011 UPLOAD "+sessionId+" INVALID session id "+fileId);
    }

    // send back sessionId to client brwoser or file
    res.writeHead(HTTP_OK, {"Content-Type": "text/html"});
    res.end("\n<HTML><HEAD><link rel='stylesheet' href='./FBA/mobile_green.css'/></HEAD><TITLE>UPLOAD Welcome</TITLE>"+banner+"</HTML>\n"); 
    
});


app.post("/BOOK", (req, res) => { 
    console.log("\n\n");
    // from TransferForm.html       
    console.log("0010 app.post BOOK prepareTXN('"+JSON.stringify(req.body)+"')");

    var result="SERVER BOOKED";
    let sessionId = req.body.sessionId;
    if(sessionId) {

        // SECURITY SANITIZE req.body
        let tBuffer = prepareTXN(req.query.sessionId,req.body);

        let session=Sheets.get(sessionId);

        let sessionTime=timeSymbol();
        let nextSessionId= strSymbol(sessionTime+session.client+session.year+sessionTime);

        Sheets.xlsxWrite(req.query.sessionId,tBuffer,sessionTime,nextSessionId); // state change in main.json
    } else {
        result="NO SESSION ID";
        console.log("0015 app.post BOOK NO sessionId");
    }

    res.writeHead(HTTP_OK, {"Content-Type": "text/html"});       
    res.end("\n"+result+".\n");
});



app.post("/MAINFILE", (req, res) => { 
    console.log("\n\n");
    // FUTURE
    // upload main.json and take client/year from that file
    
    // from Welcome.html       
    console.log("app.post MAINFILE login('"+JSON.stringify(req.body)+"')");

    res.writeHead(HTTP_OK, {"Content-Type": "text/html"});       
    res.end("\nCLIENT LOGGED IN.\n");
});


    
app.post("/STORE", (req, res) => { 
    // STORE txn into LOG for later use
    // from HistoryList.html       
    console.log("\n\n");
    console.log("0010 app.post STORE LOG txn into log('"+JSON.stringify(req.body)+"')");
    
    let delta = req.body.delta;

    console.log("0019 app.post STORE LOG with session id=("+req.body.sessionId+")");

    if(delta) Sheets.saveSessionLog(req.body.sessionId,req.body);
    else console.log("0021 app.post STORE LOG Id=("+req.body.sessionId+") did not save: no transaction!");
    
    res.writeHead(HTTP_OK, {"Content-Type": "text/html"});    
    res.end("\nSTORED.");
});



app.post('/SAVE', (req, res) => {
    // save  sheetFile into file named by session.sheetFile / sheetName 
    console.log("\n\n");

    // add closing lines to XLSX balance sheet 
    console.log("/SAVE/ req.query.sessionId="+req.query.sessionId);
    console.log("/SAVE/ req.body.sessionId="+req.body.sessionId);

    Sheets.xlsxWrite(req.body.sessionId,null,'',''); 

    res.writeHead(HTTP_OK, {"Content-Type": "text/html"});    
    res.end("\nSAVED.\n");

});
// save to Excel





app.get("/favicon.ico", (req, res)  => { res.sendFile(__dirname + "/FBA/50eurobill.jpg"); });

app.get("/account", (req, res)  => { res.sendFile(__dirname + "/AccountHistory.html"); });
app.get("/assetl", (req, res)   => { res.sendFile(__dirname + "/AssetList.html"); });
app.get("/assets", (req, res)   => { res.sendFile(__dirname + "/AssetScreen.html"); });
app.get("/balance", (req, res)  => { res.sendFile(__dirname + "/BalanceTable.html"); });
app.get("/dashboard", (req, res)  => { res.sendFile(__dirname + "/DashBoard.html"); });
app.get("/galshgb", (req, res) => { res.sendFile(__dirname + "/HGB275S2OTC.html"); });
app.get("/gainloss", (req, res) => { res.sendFile(__dirname + "/GainLoss.html"); });
app.get("/history", (req, res)  => { res.sendFile(__dirname + "/HistoryScreen.html"); });
app.get("/hgbbeginyear", (req, res) => { res.sendFile(__dirname + "/HGBBeginYear.html"); });
app.get("/openbalance", (req, res) => {res.sendFile(__dirname + "/OpenBalance.html"); });
app.get("/hgbregular", (req, res) => { res.sendFile(__dirname + "/HGBRegular.html"); });
app.get("/pie", (req, res)     => { res.sendFile(__dirname + "/BalancePie.html"); });
app.get("/pattern", (req, res)  => {res.sendFile(__dirname + "/PatternList.html"); });
app.get("/transfer", (req, res)    => { res.sendFile(__dirname + "/Transfer.html"); });
app.get("/closeandsave", (req, res) => { res.sendFile(__dirname + "/CloseAndSave.html"); });



// set Event Listener for LOAD/client/year/prefix/ext/
// internal client page response 
app.get('/SHOW/', (req, res)    => { 
    console.log("\n\n");

    console.log("0010 app.get SHOW req.query.sessionId="+req.query.sessionId);

    // load session via id
    let session = Sheets.get(req.query.sessionId);
    
    //var strSession=['Session']; for(let key in session) strSession.push(key); console.log("Server.js SHOW session="+strSession.join(','));

    let balance = phaseOne(session.addrT,session.logT, session.sheetCells);

    console.dir("0200 app.get SHOW sends Balance ="+JSON.stringify(balance));

    //var strBalance=['Balance']; for(let key in balance) strBalance.push(key); console.log("Server.js SHOW balance="+strBalance.join(','));

    res.writeHead(HTTP_OK, {"Content-Type": "text/html"}); 

    Sender.send(res,balance); 
})



/*
   req.body contains key-value pairs of data submitted in the request body. 
   By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser.
*/


app.get('/welcomedrop', (req, res) => {
    console.log("\n\n");
    res.sendFile('./WelcomeDrop.html', { root: __dirname })
})


// show convenience link to create and load a new browser window
app.listen(PORT, () => { 
    console.log("\n\n");
    console.log(`Server    started from ${PORT} using files in `+__dirname); 
    console.log(`Server    http://ec2-A-B-C-D.compute-1.amazonaws.com:${PORT}/welcomedrop`); 
    console.log(`Local     http://localhost:${PORT}/welcomedrop`); 
})












function phaseOne(addrT, logT, aoaCells) {

    var result = initBalance();
    
    result[D_Muster] = logT;
 
    result[D_Adressen] = addrT;

    // digest aoaCells and write into balance object
    var firstLine=1;
    var lineCount=0;

    if(aoaCells && aoaCells.length>J_MINROW) {

        var numLines=aoaCells.length;

        console.log("0100 server.phaseOne() includes "+aoaCells[numLines-1].join('  '));

        if(numLines>J_MINROW) {

            result[D_Eigner] = {};
            result[D_Schema] = {};
            try {
                var iAssets=0;
                var iEqLiab=0;
                var iTotal=0;

                // print all lines
                aoaCells.forEach(row => {

                    lineCount++;
                    
                    if(debug>3) console.log("0110 server.phaseOne "+JSON.stringify(row));
                        
                    var column;
                    var key=row[0];
                    if(key && key==='N') {
                        const aNames=row;
                        result[D_Schema]["Names"]=aNames;
                        result.writeTime = unixTime();
                        if(debug>1) console.log("N at "+result.writeTime);
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
                                } else 
                                    result[D_Balance][aName] = aName;
                            }                    
                        }
                        iTotal=column;
                        result[D_Schema].total=column;

                        // N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
                        result[D_Schema].author    = row[2];
                        result[D_Schema].residence = row[3];


                        // GH20211015 result[D_Schema]={ "Names": aNames }; crashes
                        console.dir();
                        console.dir("SCHEMA N assets="+iAssets+ " eqLiab="+iEqLiab+ " Total="+iTotal);
                        console.dir();
                    }
                    else if(key && key==='C') {
                        const aDesc=row;
                        result[D_Schema]["Desc"]=aDesc;

                    }
                    else if(key && key==='I') {
                        // N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
                        result[D_Schema].iban   =  row[1];
                        result[D_Schema].register= row[2];
                        result[D_Schema].taxnumber=row[3];
                    }
                    else if(key && key==='K') {
                        // N1.author N2.residence  I1.iban I2.register I3.taxnumber  K1.reportYear K2.client
                        result[D_Schema].reportYear= row[2];
                        result[D_Schema].client    = row[3];
                    }
                    else if(key && key==='A') {
                        if(debug>0) console.log("Server.phaseOne ASSET  "+row);
                        const assetInfo = row;
                        if(assetInfo.length>J_ACCT) {
                            var date = assetInfo[1];
                            var type = assetInfo[2];
                            var init = moneyString(setENMoney(assetInfo[3]));
                            var nmbr = assetInfo[4];
                            var idnt = assetInfo[5];
                            if(idnt && idnt.length>COLMIN && nmbr && nmbr.length>0) {
                                var rest =assetValue(assetInfo,iAssets);
                                var cost =getCost(idnt,nmbr,init);
                                result[D_FixAss][idnt]={ "date":date, "type":type, "init":init,  "nmbr":nmbr, "idnt":idnt, "rest":rest, "cost":cost };
                                if(debug>1) console.log(" BOOK  "+idnt+" = "+result[D_FixAss][idnt].init+ "for #"+nmbr+" at "+cost);
                                //if(debug>1) console.log("Assets"+JSON.stringify( result[D_FixAss][idnt] ));
                            }
                        }
                    }
                    else if(key && key==='X') {

                        // GH20220126
                        var xRow=[];
                        var column;
                        for(column=0;column<row.length;column++) xRow.push(row[column].trim());
                        result[D_XBRL]=xRow;
                        firstLine=1;
                    }
                    else if(key && key==='E') {
                        result[D_Equity]=row;
                    }
                    else if(key && key==='S') {
                        result[D_SHARES]= row;
                    }
                    else if(key && key==='R') {

                    }
                    else if(key && key==='P') {
                        result[D_Eigner]=row;
                    }
                    else if(key && parseInt(key)>0) {                    
                        const MINTXN=5; // elements in a TXN
                        var jHistory = result[D_History];
                        //if(debug>1) console.log("BOOK "+row.join(CSEP));
                        if(row.length>MINTXN && result[D_Schema].Names){
                            var gNames = result[D_Schema].Names;
                            var gDesc  = result[D_Schema].Desc;
                            var aLine = row;
                            
                            jHistory[lineCount]=aLine;
                            if(firstLine) {
                                // opening balance lines
                                for(var xColumn=0;xColumn<gNames.length;xColumn++) {
                                    var rawName = gNames[xColumn];
                                    var xbrl = result[D_XBRL][xColumn];
                                    var xdesc=""+xColumn; if(gDesc && gDesc[xColumn]) xdesc=gDesc[xColumn];
                                    if(rawName && rawName.length>1) {
                                        result[D_Balance][rawName] = Account.makeAccount(rawName,xbrl,xdesc,xColumn);
                                    }
                                    if(debug>1) console.log("make("+rawName+","+xbrl+","+xdesc+","+xColumn+")");
                                    
                                };
                            }

                            var column=0;
                            aLine.forEach(strAmount => {
                                if(debug>1) console.log("init "+strAmount);
                                if(column>=J_ACCT && strAmount && strAmount.length>0) {
                                    var acName = gNames[column];
                                    if(acName && acName.length>1) {
                                        if(firstLine) {
                                            // initialize the values with 0,00 if nothing is specified
                                            if(strAmount==null || strAmount.length==0) strAmount="0,00";
                                        }
                                    
                                        var account = result[D_Balance][acName];
                                        if(account && account.xbrl) {
                                            
                                            if(firstLine) {
                                                result[D_Balance][acName] = Account.openAccount(account,strAmount);
                                                if(debug>1) console.log("open "+strAmount
                                                    +" for "+gNames[column]
                                                    +"  = "+JSON.stringify(result[D_Balance][acName])
                                                );
                                            } else { 
                                                result[D_Balance][acName] = Account.addEUMoney(account,strAmount);
                                                if(debug>1) console.log("add  "+strAmount
                                                +" to  "+gNames[column]
                                                +"  = "+JSON.stringify(result[D_Balance][acName]));
                                            }
                                        }
                                    }
                                }
                                column++;
                            })
                            firstLine=null;                
                            // 2697211	2021-01-19	BAY001	INVEST	200	BAYR_1
                            

                            if(aLine[3] && aLine[3].trim()==='INVEST') {
                                var date = aLine[1].trim();
                                var type = aLine[2].trim();
                                var nmbr = aLine[4].trim();
                                var idnt = aLine[5].trim();

                                var init = assetValue(aLine,iAssets);
                                var cost =getCost(idnt,nmbr,init);
    
                                result[D_FixAss][idnt]={ "date":date, "type":type, "init":init,  "nmbr":nmbr, "idnt":idnt, "rest":init, "cost":cost};
                                if(debug>1) console.log("INVEST "+idnt+" = "+result[D_FixAss][idnt].rest+ "for #"+nmbr+" at "+cost);
                            }

                            if(aLine[3] && aLine[3].trim()==='SELL') {

                                var date = aLine[1].trim();
                                var type = aLine[2].trim();
                                var iSel = parseInt(aLine[4].trim());
                                var idnt = aLine[5].trim();
                                var amnt = assetValue(aLine,iAssets);

                                var init = result[D_FixAss][idnt].init;

                                // sales reduce number of asset C140san damount of asset value
                                var iNum = parseInt(result[D_FixAss][idnt].nmbr);
                                var nmbr = iNum-iSel;
                                var rest = result[D_FixAss][idnt].rest;
                                var  remn = moneyString(addEUMoney(rest,setEUMoney(amnt)));

                                var cost =getCost(idnt,nmbr,init);
                                // OPEN
                                // MUST VERIFY existing identifier
                                result[D_FixAss][idnt]={ "date":date, "type":type, "init":init,  "nmbr":nmbr, "idnt":idnt, "rest":remn, "cost":cost };
                                if(debug>1) console.log("SELL "+idnt+" = "+result[D_FixAss][idnt].rest);
                            }

                            if(aLine[3] && aLine[3].trim()==='YIELD') {

                                var idnt = aLine[5].trim();
                                var amnt = assetValue(aLine,iAssets);

                                //console.log("YIELD "+amnt+" for "+idnt+" in "+aLine.join(';'));

                                if(result[D_FixAss]) {
                                    if(result[D_FixAss][idnt]) {
                                        var date = result[D_FixAss][idnt].date;
                                        var type = result[D_FixAss][idnt].type;
                                        var iVal = result[D_FixAss][idnt].init;
                                        var nmbr = result[D_FixAss][idnt].nmbr;
                                        var curr = result[D_FixAss][idnt].rest;

                                        // yield type of devidend payment reduces the INIT value
                                        // GH20220108  amount reduces the CURRent value
                                        var rest = moneyString(addEUMoney(curr,setEUMoney(amnt)));

                                        // GH20220108 price is calculated as the INIT price per number of units
                                        var price = getCost(idnt,nmbr,init);

                                        // OPEN
                                        // MUST VERIFY existing identifier
                                        result[D_FixAss][idnt]={ "date":date, "type":type, "init":iVal,  "nmbr":nmbr, "idnt":idnt, "rest":rest, "cost":price  };
                                        if(debug>1) console.log("YIELD "+idnt+" = "+result[D_FixAss][idnt].rest);
                                        } else  console.log("YIELD UNKNOWN "+idnt+" ASSET");
                                } else {
                                    if(debug>1) console.log("YIELD UNKNOWN "+idnt+" = "+result[D_FixAss][idnt].rest);
                                }
                            }
                        }
                    }
                });
                if(debug>1) console.log("phaseOne: check partners");

                // process the partners
                var partners = {};
                if(result[D_SHARES] && result[D_XBRL] && result[D_Schema] && result[D_Schema].eqliab>J_ACCT) {

                    var shares = result[D_SHARES];
                    var arrXBRL= result[D_XBRL];
                    var arrEQUI= result[D_Equity];
                    var gNames = result[D_Schema].Names;
                    var eqliab = result[D_Schema].eqliab;

                    var basis = shares[2];


    
    
/*          D_Partner_NET[i] = { }
            phaseOne
                    id:   # 0-(N-1)
                    vk    Name 'K2xx'
                    gain: Nenner
                    denom:Zaehler
                    iVar  #Spalte K2xx
                    iCap  #Spalte Fest/Kommanditkapital
                    name  Name (Text in Spalte mit FK oder KK)

            phaseTwo
                    cyLoss Laufende Verluste aus Veraesserungen VAVA
                    keso
                    kest
                    income
                    otc
                    cap

                    netIncomeFin
                    netIncomeOTC
*/

                    // create partners structure
                    var pNum=0;
                    for(col=eqliab+1;col<shares.length;col++) {
                        if(shares[col] && arrXBRL[col].includes('limitedLiablePartners.VK')) {
                            var pShare = shares[col];
                            if(isNaN(pShare)) pShare=" 0";                       
                            partners[pNum]={ 'id':pNum, 'vk':gNames[col], 'gain':pShare, 'denom':basis, 'iVar':col };
                            pNum++; // GH20220206 
                        }
                    }

                    if(arrXBRL) {
                        pNum=0;
                        for(col=eqliab+1;col<shares.length;col++) {
                            var acc = arrXBRL[col];
                            if(shares[col] && (acc.includes('limitedLiablePartners.KK') || acc.includes('limitedLiablePartners.FK'))) {
                                partners[pNum].iCap=col;
                                partners[pNum].name=shares[col];
                                pNum++;
                            }
                        }
                    } else console.dir("phaseOne: NO arrXBRL for PARTNERS");


                    /*
                    // VAVA VKxx Verluste Verlustvortrag
                    try {
                        if(arrEQUI) {

        // CREATE SYNTHETIC VKXX accounts 

        //                    display losses as booked over the year
                            pNum=0;
                            for(col=eqliab+1;col<shares.length;col++) {
                                if(shares[col] && arrEQUI[col] && arrEQUI[col].includes('limitedPartners.VK') && 
                                    arrXBRL[col].includes('limitedLiablePartners.accumLoss')) {
                                    var glShare = shares[col];
                                    if(isNaN(glShare)) glShare=" 0";                       
                                    let vName = gNames[col];
                                    let vkxx = result[D_Balance][vName];
                                    partners[pNum].vaName=vName;                             // Name d Kontos für eigene Verluste aus Verkaeufen von Aktien
                                    partners[pNum].vaBook=vkxx?Account.getChange(vkxx):{'cents':0}; // Betrag - eigene Buchungen aus Verkaeufen von Aktien  MUSS NULL
                                    partners[pNum].glShare=glShare;                          // Anteil des Gesellschafters an Verlusten und Gewinnen
                                    partners[pNum].vaColumn=col;                             // Spalte - eigene Verluste aus Verkaeufen von Aktien 

                                    let monNYLoss = addEUMoney(vkxx.init,{'cents':p_cyLoss[pNum]});

                                    console.log("NEW VKxx  #"+pNum+"  "+p_cyLoss[pNum]+"+"+vkxx.init+"="+moneyString(monNYLoss));

                                    partners[pNum].nyLoss=moneyString(monNYLoss);

                                    pNum++;
                                }
                            }
                        } else console.dir("phaseOne: NO EQUITY list for partners");
                    } catch(err) { console.dir("phaseOne: ERR EQUITY list for partners"+err); }
                    */

                    
                } else console.dir("0120 server.phaseOne: NO PARTNERS");


                result[D_Partner_NET]=partners;
                if(debug>1) 
                    for (let i in partners) { console.log("Server phaseOne Partner("+i+") "+JSON.stringify(partners[i])); }

            } catch (err) {
                console.error('0125 server.js phaseOne:'+err);
                console.dir('0125 server.js phaseOne:'+err);
            }

            console.log("0191 server.phaseOne.Schema="+JSON.stringify(result[D_Schema]));

        } else console.error('0111 server.js phaseOne NO BALANCE');

    } else console.error('0101 server.js phaseOne NO aoaCells');


    
        for(let key in result) {
            console.dir('0200 server.js phaseOne() -> balance['+key+']'); 
        }

    return result;
}


function makeBanner(sessionId,year) {
    var vbanner=[];

    var results = [];
    if(sessionId) {
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    console.dir ( "OS["+name+"] info "+net.address);
                    results.push({ 'type':name, 'addr':net.address});
                }
            }
        }
        console.dir ( "OS.address  "+results[0].addr);

        localhost = results[0].addr;


    
        vbanner.push('<DIV class="attrRow">');
        /*
            vbanner.push('<SCRIPT>let a=document.createElement("a");a.href='
                    +`"http://${localhost}:${PORT}/JSIG?sessionId=${sessionId}";`
                    +'a.download="sig.json";'
                    +'document.body.appendChild(a);a.click();document.body.removeChild(a);</SCRIPT>');
        */
            vbanner.push('<SCRIPT>localStorage.setItem("mysession",'+`"${sessionId}"`+');</SCRIPT>');

            let target = ""; // http://${localhost}:${PORT}

            vbanner.push(buttonOpenTile(target+`/account?sessionId=${sessionId}`,'AcctHistory'));
            vbanner.push(buttonOpenTile(target+`/hgbbeginyear?sessionId=${sessionId}`,'BalanceOpen'));
            vbanner.push(buttonOpenTile(target+`/openbalance?sessionId=${sessionId}`,'AcctOpen'));
            vbanner.push(buttonOpenWide(target+`/dashboard?sessionId=${sessionId}`,'DashBoard',3));
            vbanner.push(buttonOpenTile(target+`/history?sessionId=${sessionId}`,'History'));
            vbanner.push(buttonOpenTile(target+`/gainloss?sessionId=${sessionId}`,'GainLoss'));
            vbanner.push(buttonOpenTile(target+`/assets?sessionId=${sessionId}`,'Assets'));
            vbanner.push(buttonOpenTile(target+`/balance?sessionId=${sessionId}`,'AcctClose'));
            vbanner.push(buttonOpenTile(target+`/galshgb?sessionId=${sessionId}`,'GainlossHGB'));
            vbanner.push(buttonOpenTile(target+`/hgbregular?sessionId=${sessionId}`,'BalanceClose'));
            if(Sheets.isSameFY(year)) {
                vbanner.push(buttonOpenTile(target+`/transfer?sessionId=${sessionId}`,'Transfer'));
//                vbanner.push(buttonTab(target+`/xfer?sessionId=${sessionId}`,de_DE['Transfer']));
            } else console.log("server.makeBanner "+year +" PAST YEAR ("+unixYear()+")- NO XFER command");
            vbanner.push(buttonOpenTile(target+`/pattern?sessionId=${sessionId}`,'Patterns'));      
            vbanner.push(buttonOpenTile(target+`/closeandsave?sessionId=${sessionId}`,'Closing'));
//            vbanner.push(buttonOpenTile(target+`/assetl?sessionId=${sessionId}`,'Assets']));
            //vbanner.push(buttonTab(target+`/SAVE?sessionId=${sessionId}`,de_DE['Closing']));
            vbanner.push(buttonTab(target+`/pie?sessionId=${sessionId}`,de_DE['Diagram']));      
        vbanner.push('</DIV>');

        console.log("0300 makeBanner OK");
    
    } else return  '<DIV class = "mTable"><DIV class = "ulliTab"><DIV class = "attrRow">NO SESSION info</DIV></DIV></DIV>';
    return '<SCRIPT type="text/javascript" src="/client.js"></SCRIPT><DIV class="mTable"><DIV class="wideTab">'+vbanner.join('')+'</DIV></DIV>';
}


// PURE FUNCTIONS

function buttonTab(link,label) {
    let result =  '<DIV class="C100"><A HREF="'+link+'" target="_blank"><BUTTON class="largeKey">'+label+'</BUTTON></A></DIV>';
    if(debug>2) console.log(result);
    return result;
}

function buttonOpenTile(link,command) {
    let label = de_DE[command];
    let strLink = "'"+link+"'";
    let strCommand = "'"+command+"'";
    let result =  '<DIV class="C100"><A HREF="JavaScript:newPopup('+strLink+','+strCommand+');" ><BUTTON class="largeKey">'+label+'</BUTTON></A></DIV>';
    if(debug>2) console.log(result);
    return result;
}


function buttonOpenWide(link,command,lines) {
    let label = de_DE[command];
    let strLink = "'"+link+"'";
    let strCommand = "'"+command+"'";
    let result =  '<DIV class="C100"><A HREF="JavaScript:newPopup('+strLink+','+strCommand+',1500,'+lines+');" ><BUTTON class="largeKey">'+label+'</BUTTON></A></DIV>';
    if(debug>2) console.log(result);
    return result;
}


function assetValue(row,iAssets) {
    var column=J_ACCT;
    var value = row[column];
    var run=true;
    while(run && value.length<COLMIN && column<iAssets) {
        var test = row[column];
        if(test && test.length > 0 && parseInt(test)!=0) {value=test; run=false;}
        column++;
    } // shares before cash / account
 //   console.log("assetValue("+row+")="+value);
    return value;
}

function getCost(idnt,nmbr,init) {
    var units = parseInt(nmbr);
    var iCost = parseInt(setEUMoney(init).cents);
    
    var uCost=iCost;
    if(units>0) {
        uCost = parseInt(iCost / units);
    }
  //  console.log(idnt+"COST("+init+"):"+iCost+" each "+units+" > "+uCost);
    return moneyString({'cents':uCost});

}


function unixTime() {
    var u = new Date(Date.now()); 
    return u.getUTCFullYear() +
    '-' + ('0' + (1+u.getUTCMonth())).slice(-2) +
    '-' + ('0' + u.getUTCDate()).slice(-2) + 
    ' ' + ('0' + u.getUTCHours()).slice(-2) +
    ':' + ('0' + u.getUTCMinutes()).slice(-2) +
    ':' + ('0' + u.getUTCSeconds()).slice(-2) +
    '.' + (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) 
};

function unixYear() {
    return new Date(Date.now()).getUTCFullYear();
};


function strSymbol(pat) {
    let cypher = "BC0DF1GH2JK3LM4NP5QR6ST7VW8XZ9A";
    let base=31;
    var res = 0;
    var out = [];
    if(!pat) pat = unixTime();
    {
        let factor = 23;
        var sequence = ' '+pat+pat+pat;
        for(let p=0;p<sequence.length && p<80;p++) {
            res = ((res*factor + sequence.charCodeAt(p)) & 0x1FFFFFFF);
            let index = res % base;
            out.push(cypher.charAt(index))
        }
    }
    return out.join('');
}


function prepareTXN(sessionId,reqBody) {

    //if(debugBook) 
    console.dir("server.js prepareTXN("+sessionId+") book "+JSON.stringify(reqBody));

    let session = Sheets.get(sessionId);

    var jFlag = reqBody.flag; if(!jFlag) jFlag=0;
    var jDate = reqBody.date;
    var jSender = reqBody.sender;
    var jAcct = reqBody.refAcct;
    var jSVWZ = reqBody.svwz;
    var jSVWZ2 = reqBody.svwz2;
    var jCredit = reqBody.credit;
    var jDebit = reqBody.debit;

    var bookingForm;

    // UNNECESSARY CREATION OF NEW SESSION FROM FILE READ !!
    //var balance = Sheets.load(sessionId,phaseOne);
    // needs sheets.load via expert as the only reader
    var balance = phaseOne(session.addrT, session.logT, session.sheetCells);
    //GH20220127


    if(balance && balance[D_Schema]) {

        let year = balance[D_Schema].reportYear;
 
        if(Sheets.isSameFY(year) || jFlag) {

            if(debug>0) console.log("server.js prepareTXN() "+JSON.stringify(jCredit)+"/ "+JSON.stringify(jDebit));


            var total = balance[D_Schema].total;
            var aLen = balance[D_Schema].assets;

            bookingForm = (CSEP.repeat(total)).split(CSEP);

            bookingForm[0]= 1-jFlag;
            bookingForm[1]=jDate;
            bookingForm[2]=jSender;
            bookingForm[3]=jAcct;
            bookingForm[4]=jSVWZ;
            bookingForm[5]=jSVWZ2;
            
            for(let money in jCredit) {
                var factor=1;
                var i=jCredit[money].index;
                if(i>aLen) factor=-1;
                bookingForm[i]=moneyString(setMoney(factor*jCredit[money].cents));
            }

            for(let money in jDebit) {
                var factor=-1;
                var i=jDebit[money].index;
                if(i>aLen) factor=1;
                bookingForm[i]=moneyString(setMoney(factor * jDebit[money].cents));
            }
        } else { console.dir("server.js prepareTXN() rejects other fiscal year:"+year);
            return null;
        }
    } else console.error("server.js prepareTXN("+sessionId+") no BALANCE table ");

    // receiver will append this to sheetCells
    return bookingForm;

}
function timeSymbol() { // same as in client.js
    var u = new Date(Date.now()); 
    return ''+ u.getUTCFullYear()+
      ('0' + (1+u.getUTCMonth())).slice(-2) +
      ('0' + u.getUTCDate()).slice(-2) + 
      ('0' + u.getUTCHours()).slice(-2) +
      ('0' + u.getUTCMinutes()).slice(-2) +
      ('0' + u.getUTCSeconds()).slice(-2) +
      (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
};     
