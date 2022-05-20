

let debug=null;

const Client = require('./client.js');
            
// putResponse is a callback from the server
// with strText containing the stringified response from SHOW
//function putResponse(strTarget,strtext) 

function makeResponse(sessionId) {       

    //var response = JSON.parse(strText);
    let session = get(sessionId);
    let balance = phaseOne(session);
    let response = phaseTwo(balance);



    var jReport = response[D_Report];
    var jBalance = response[D_Balance];
    var gSchema = response[D_Schema];
    let page = response[D_Page];
    
    let headerInfo = '['+page["BalanceOpen"]+';'+page["header"]+']';

    let arrStr = Client.createJPage(headerInfo);
    var cursor = htmlPage;

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
            // collect compute total right side amount
            if(full_xbrl==='de-gaap-ci_bs.eqLiab') { eqliab=parseInt(init.replace('.','').replace(',',''));  init=cents2EU(eqliab); }
            if(full_xbrl==='de-gaap-ci_is.netIncome.regular') { income=parseInt(init.replace('.','').replace(',','')); }
            if(full_xbrl==='de-gaap-ci_bs.eqLiab.income') { init=cents2EU(eqliab+income); }

            var xbrl = full_xbrl.split('\.');

            if(level==1) {
                cursor=Client.printJFormat(cursor,[iName,' ',' ',' ',init]);
            }
            if(level==2) {
                cursor=Client.printJFormat(cursor,[iName,' ',init]);
            }
            if(level==3) {
                cursor=Client.printJFormat(cursor,[iName,init]);
            }


        } else {
            // divider line out
            console.log('HGBBeginYear unknown '+JSON.stringify(account));
        }
    }

    cursor=Client.setJTrailer(page, cursor);
    //instead of setScreen()
    return arrStr;
    // return table with response data
    // as an array of Strings
}
module.exports['makeResponse']=makeResponse;



