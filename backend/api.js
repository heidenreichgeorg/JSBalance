

let debug=1;

const SCREENLINES=19;


const Money = require('./money');
const Sender = require('./sender');
            
// putResponse is a callback from the server
// with strText containing the stringified response from SHOW
//function putResponse(strTarget,strtext) 

function apiHGBBeginYear(sessionId,balance) {       

    if(debug) console.log("\n");
    //console.log(Client.timeSymbol());
    if(debug) console.log("apiHGBBeginYear ("+sessionId+")");

    //var response = JSON.parse(strText);
    let response = Sender.sendBalance(balance);

    var jReport = response[Sender.D_Report];
    let page = response[Sender.D_Page];
    
    let headerInfo = '['+page["BalanceOpen"]+';'+page["header"]+']';

    let jPage = createJPage(headerInfo);
    var cursor = jPage;

    var eqliab=0;
    var income=0;
    
    for (let tag in jReport)   {
        console.log("apiHGBBeginYear Report "+JSON.stringify(jReport[tag]));
        
        var element = jReport[tag];
        var level = element.level;
        var account=element.account;
        var init = account.init;
        var iName = account.name;
        var full_xbrl = account.xbrl;


        if(init && iName && full_xbrl) {
            
            if(debug) console.log('apiHGBBeginYear XBRL '+JSON.stringify(account));

            // collect compute total right side amount
            if(full_xbrl==='de-gaap-ci_bs.eqLiab') { eqliab=parseInt(init.replace('.','').replace(',',''));  init=Money.cents2EU(eqliab); }
            if(full_xbrl==='de-gaap-ci_is.netIncome.regular') { income=parseInt(init.replace('.','').replace(',','')); }
            if(full_xbrl==='de-gaap-ci_bs.eqLiab.income') { init=Money.cents2EU(eqliab+income); }

            //var xbrl = full_xbrl.split('\.');

            if(level==1) {
                cursor=printJFormat(cursor,[iName,' ',' ',' ',init]);
            }
            if(level==2) {
                cursor=printJFormat(cursor,[iName,' ',init]);
            }
            if(level==3) {
                cursor=printJFormat(cursor,[iName,init]);
            }


        } else {
            // divider line out
            console.log('apiHGBBeginYear unknown '+JSON.stringify(account));
        }
    }

    cursor=setJTrailer(cursor, page);
    //instead of setScreen()
    return jPage;
    // return table with response data
    // as an array of Strings
}


function timeSymbol() { // same as in server.js
    var u = new Date(Date.now()); 
    return ''+ u.getUTCFullYear()+
      ('0' + (1+u.getUTCMonth())).slice(-2) +
      ('0' + u.getUTCDate()).slice(-2) + 
      ('0' + u.getUTCHours()).slice(-2) +
      ('0' + u.getUTCMinutes()).slice(-2) +
      ('0' + u.getUTCSeconds()).slice(-2) +
      (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
};     

function createJPage(headerInfo) {
    return printJFormat({ 'lines':[]},headerInfo.split(Sender.CSEP));
}

function printJFormat(cursor,arrLine) {
    if(arrLine) {
        try {
            let line = arrLine.join(Sender.CSEP);
            var lines = cursor.lines;
            if(lines.length>=SCREENLINES) { cursor.next = { 'lines':[] }; cursor=cursor.next; }

            cursor.lines.push(line);
        } catch(err) { console.dir("printJFormat: strange param2 "); }
    } 
    return cursor;
}

function setJTrailer(cursor, page) {
    if(cursor) {

        cursor=printJFormat(cursor,[' ']);
   
        let boxFooter1 = [  '&nbsp,', page["client"],    '&nbsp;', page["register"]  ];
        cursor=printJFormat(cursor,boxFooter1);
    
        let boxFooter2 = [  '&nbsp,', page["reference"], '&nbsp;', page["author"]  ];
        cursor=printJFormat(cursor,boxFooter2);
            
        return cursor;
    }
}

module.exports['apiHGBBeginYear']=apiHGBBeginYear;



