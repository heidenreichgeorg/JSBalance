

let debug=null;

const Client = require('./client.js');
const Money  = require('./money.js');
            
function putResponse(strTarget,strText) {       

    var response = JSON.parse(strText);
    var jReport = response[D_Report];
    var jBalance = response[D_Balance];
    var gSchema = response[D_Schema];
    let page = response[D_Page];
    
    let headerInfo = '['+page["BalanceOpen"]+';'+page["header"]+']';

    let htmlPage = Client.createJPage("headerInfo",'PageContent');
    var cursor = htmlPage;

    var eqliab=0;
    var income=0;
    
    for (let tag in jReport)   {
        console.log("Report "+JSON.stringify(jReport[tag]));
        
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
            var xbrl_pre = xbrl.pop()+'.'+xbrl.pop()+'.'+xbrl.pop();

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

    Client.setJTrailer(page, cursor);
    Client.setJScreen(document,htmlPage);
    // return table with response data
}
