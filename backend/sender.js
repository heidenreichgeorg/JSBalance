const debugReport=null;
const debugComp=null;
const debugSend=null;
const debug=null;
const debugPage=null;


const CSEP=';';
const CEND='|';
const J_ACCT = 6;
//reference to server breaks ART


const D_Page = "Seite";   // client register reference author
// SCHEMA-part
const COLMIN=2;
const D_Schema = "Schema"; // includes .Names
const D_XBRL   = "XBRL";
const D_Eigner = "Eigner";
const D_Equity = "Kapital";
// TRANSACTIONS-part
//const D_BeginYear= "Bilanzeröffnung";
const D_Balance= "Bilanz";
const D_History= "Historie";
const D_Partner_NET= "NETPartner";
const D_SHARES = "Anteile";
const D_Report = "Report";
const D_FixAss = "Anlagen";
const D_Muster = "Muster";
const D_Adressen="Adressen";

// OBSOLETE extra XML pattern
// SYNTHETIC
const xbrlAssets = "de-gaap-ci_bs.ass";
const xbrlEqLiab = "de-gaap-ci_bs.eqLiab";
const xbrlEqlInc = "de-gaap-ci_bs.eqlInc";
const xbrlEqlReg = "de-gaap-ci_bs.regularIncome";


// Imports
const { addEUMoney, moneyString, iScaleMoney, setEUMoney , setMoney, negMoney, lessMoney, cents2EU } = require('./money.js');

// Modules
const Account = require('./account.js');
const Server = require('./server');




function makePage(balance) {

    var page = {};

    if(balance) {
        if(balance[D_Schema]) {
            gSchema  = balance[D_Schema];

            let author=gSchema.author;
            let residence=gSchema.residence;
            let iban=gSchema.iban;
            let register=gSchema.register;
            let taxnumber=gSchema.taxnumber;
            let reportYear=gSchema.reportYear;
            let client=gSchema.client;


            page['header'] = Server.de_DE['reportYear'] + "&nbsp;" + reportYear; // Server.de_DE:
            page['client'] = client;
            page['register'] = register+"&nbsp;"+taxnumber;
            page['reference'] = iban+"&nbsp;"+reportYear;
            page['author'] = author+"&nbsp;"+residence;
            page['footer'] = iban+"&nbsp;"+residence;

            for(let key in Server.de_DE) {
                page[key]=  Server.de_DE[key];  
                if(debugPage) console.log("sender makePage de_DE "+key+" -> "+Server.de_DE[key]);
            }

            balance[D_Page] = page;
            // side-effect AND return value

            console.log();
            if(debugPage) console.log("sender makePage "+JSON.stringify(page));

        } else console.error("sender makePage:  NO schema");
    } else console.error("sender makePage: NO balance");

    return page;
}


// generate a copy of the balance, with all accounts closed 
// and GAIN LOSS being distributed to partners
function phaseTwo(balance) {
    let bAccounts = balance[D_Balance];
    let bHistory = balance[D_History];
    
    
    var gResponse = {}; 
    gResponse[D_Balance]={}; 
    let gross  = gResponse[D_Balance];

    gResponse[D_History]={}; 
    let txns = gResponse[D_History];

    var arrXBRL= balance[D_XBRL];
    gResponse[D_XBRL]=balance[D_XBRL];
    
    gResponse[D_Schema]={};
    var gNames = balance[D_Schema].Names;

    let partners=balance[D_Partner_NET];
    gResponse[D_Partner_NET]=partners;


    let bReport = balance[D_Report];
    gResponse[D_Report]=JSON.parse(JSON.stringify(bReport));


    // R1 add account structures to  the copy of D_Report
    let gReport = gResponse[D_Report];
    for(let xbrl in gReport) {
        var element=gReport[xbrl];
        if(debugReport) console.log("sender.js phaseTwo ACCOUNT "+JSON.stringify(element));           
        element.account = Account.openAccount(Account.makeAccount(element.de_DE,element.xbrl),"0,00");
    }

    var kestPaid,kesoPaid;
                
    // ADD bAccounts' saldi to gReport
    for (let name in bAccounts)   {
        if(name && name.length>=COLMIN) {
            var account=bAccounts[name];
            if(account && account.xbrl && account.xbrl.length>COLMIN) {
                var axbrl = account.xbrl;

                //if(axbrl.includes('receiv.other.otherTaxRec.CapTax')) {
                if(name=='KEST') {
                    kestPaid=Account.getSaldo(account);
                    if(debugReport) console.log("sender.js phaseTwo KEST Paid="+kestPaid);
                }

                if(name=='KESO') {
                    kesoPaid=Account.getSaldo(account);
                    if(debugReport) console.log("sender.js phaseTwo KESO Paid="+kesoPaid);
                }

                // search, find and update corresponding SYNTHETIC report account
                for(let rxbrl in gReport) {
                    var element=gReport[rxbrl];
                    var collect=element.account;
                    if(collect && axbrl.startsWith(element.xbrl)) {
                        element.account = Account.addEUMoney(collect,Account.getSaldo(account));
                        element.account.init = moneyString(addEUMoney(element.account.init, setEUMoney(account.init))); // GH20220103 GH20220104 wrong gross value, contains init
                        if(debugReport) console.log("sender.js phaseTwo SYNTHETIC ("+name+"  "+axbrl+") IN "+element.de_DE + "   "+JSON.stringify(element.account));    
                    }
                }
            }
        }
    }


    var kesoShares = distribute(setEUMoney(kesoPaid),partners,'keso');
    if(debugSend) console.log("sender.js phaseTwo KESO  G"+kesoShares[0]+" E"+kesoShares[1]+" A"+kesoShares[2]+" K"+kesoShares[3]+" T"+kesoShares[4]+" L"+kesoShares[5]); 

    var kestShares = distribute(setEUMoney(kestPaid),partners,'kest');
    if(debugSend) console.log("sender.js phaseTwo KEST  G"+kestShares[0]+" E"+kestShares[1]+" A"+kestShares[2]+" K"+kestShares[3]+" T"+kestShares[4]+" L"+kestShares[5]); 




    // find common VAVA account GH202112222 and distribute current-year changes to partners
    var all_cs;
    var all_cyloss="--";
    var all_iSale=-1;
    var assets = balance[D_Schema].assets;
    for(col=J_ACCT;col<assets;col++) {
        if( arrXBRL[col] && arrXBRL[col].includes('receiv.other.CapLoss')) {
            all_cs=gNames[col]; // Kontoname gemeinschaftl Verluste aus Verkaeufen von Aktien
            all_iSale=col;      // Spalte    gemeinschaftl Verluste aus Verkaeufen von Aktien
        }
    }
    // distribute share-sales losses to partners
    var p_cyLoss;
    if(all_cs) {
        //  distribute current-year VAVA changes to partners
        let vava = balance[D_Balance][all_cs];

        all_cyloss = Account.getChange(vava)

        if(debugSend) {
            console.log("VAVA INIT   "+vava.init);
            console.log("VAVA CREDIT "+vava.credit);
            console.log("VAVA DEBIT  "+vava.debit);
            console.log("VAVA CHANGE "+all_cyloss);
        }

        p_cyLoss = distribute(setEUMoney(all_cyloss),partners,'cyLoss');
        if(debugSend) console.log("sender.js phaseTwo CYLOSS  G"+p_cyLoss[0]+" E"+p_cyLoss[1]+" A"+p_cyLoss[2]+" K"+p_cyLoss[3]+" T"+p_cyLoss[4]+" L"+p_cyLoss[5]); 
    
    }
    

    //   transfer overview to report 
    let aAssets = gReport.xbrlAssets.account;
    let aEqliab = gReport.xbrlEqLiab.account;
    let aEqlreg = gReport.xbrlRegular.account;
    let aRegFin = gReport.xbrlRegFin.account;
    let aRegOTC = gReport.xbrlRegOTC.account;

    let aEqlinc = gReport.xbrlIncome.account; // should be empty at this stage


    // started addition with aEqlinc to preserve account name
    let aEqlsum=Account.addEUMoney(aEqlreg,Account.getTransient(aEqliab));
    aEqlinc=Account.addEUMoney(aEqlinc,Account.getTransient(aEqlsum));

    if(debugReport) {
       console.log("sender.js phaseTwo ASSETS = "+JSON.stringify(aAssets));           
       console.log("sender.js phaseTwo EQLIAB = "+JSON.stringify(aEqliab));           
       console.log("sender.js phaseTwo EQLREG = "+JSON.stringify(aEqlreg));           
       console.log("sender.js phaseTwo REGOTC = "+JSON.stringify(aRegOTC));           
       console.log("sender.js phaseTwo REGFIN = "+JSON.stringify(aRegFin));           
       console.log("sender.js phaseTwo EQLINC = "+JSON.stringify(aEqlinc));           
    }
        
    // set the gross component in each gReport account
    for(let rxbrl in gReport) {
        var element = gReport[rxbrl];
        var account = element.account;
        account.gross=Account.getTransient(account);
        if(debug) console.log("sender.js phaseTwo send1 REPORT("+element.de_DE+") "+JSON.stringify(element.account));           
    }


 
    let netIncome = setEUMoney(Account.getSaldo(aEqlreg));
    distribute(netIncome,partners,'income');
    // GH20220206


    let netIncomeFin = setEUMoney(Account.getSaldo(aRegFin));
    distribute(netIncomeFin,partners,'netIncomeFin');
    // GH20220206

    let netIncomeOTC = setEUMoney(Account.getSaldo(aRegOTC));
    distribute(netIncomeOTC,partners,'netIncomeOTC');
    // GH20220206

    
    // GH20220206 MODIFY K2xx accounts 
    for (let id in partners) {
        var p=partners[id];
        var varcap=bAccounts[p.vk];
        varcap.income=p.income;
        varcap.netIncomeOTC=p.netIncomeOTC;
        varcap.netIncomeFin=p.netIncomeFin;
        varcap.gross=Account.getSaldo(varcap);
        varcap.next=Account.getNextYear(varcap);
        if(debug && debug>1) console.log('Sender phaseTwo MODIFY K2xx accounts '+p.income + '>='+JSON.stringify(varcap));
    }




    // build gResponse[D_Balance]==gross from bAccounts:normal Accounts
    // update gross result with saldo for each account
    for (let name in bAccounts)   {
        // add gross saldo value
        if(name && name.length>=COLMIN) {
            var account=bAccounts[name];
            if(account && account.xbrl && account.xbrl.length>COLMIN) {
                var grossAcc=account;
                grossAcc.gross=Account.getSaldo(grossAcc);
                gross[name]=grossAcc; 
                if(debugSend) console.log("sender.js phaseTwo2 ACCOUNT "+JSON.stringify(grossAcc));           
            }
        }
    }

    // transfer all history
    for (let hash in bHistory)   {
        txns[hash]=bHistory[hash]; 

        if(debugSend) console.log("sender js phaseTwo3 HISTORY "+hash+"="+txns[hash]);           
    }
    
    // transfer all fixed assets
    gResponse[D_FixAss] = balance[D_FixAss];

    // transfer schema information
    gResponse[D_Schema] = balance[D_Schema];





    // compensating closing statement
    try {
        let year = balance[D_Schema].reportYear;

        let gAccounts = gResponse[D_Balance];
        let gReport = gResponse[D_Report]

        if(gReport.xbrlRegular.account.gross) {
            var closeIncome = { 'credit':{}, 'debit':{}  };
            closeIncome['date']='31.12.'+year;
            closeIncome['sender']='System';
            closeIncome['refAcct']=Server.de_DE['GainLoss'];
            closeIncome['svwz']=Server.de_DE['NextYear'];
            closeIncome['svwz2']=Server.de_DE['Closing'];

            let gross = gReport.xbrlRegular.account.gross;
            if(debugComp) console.log("phaseTwo CLOSING income "+gross);

            var aNum=0;
            for(let name in gAccounts) {
                if(gAccounts[name]) {
                    // if(debugComp) console.dir("phaseTwo UPDATE CLOSING OTC "+JSON.stringify(gAccounts[name]));
                    let acc = gAccounts[name];
                    let xbrl = acc.xbrl;
                    if(xbrl.includes("netIncome.regular")) {
                        if(negMoney(setEUMoney(acc.gross))) iMoney=closeIncome.debit[name]=setEUMoney(cents2EU(-1 * setEUMoney(acc.gross).cents));
                        else iMoney=closeIncome.credit[name]=setEUMoney(acc.gross);
                        iMoney.index=acc.index; 
                        if(debugComp) console.log("phaseTwo CLOSING OTC "+JSON.stringify(iMoney));
                    }
                }
                aNum++;
            }

            if(partners) for (let i in partners) { 
                let p=partners[i];
                try {
                    let varcap=gAccounts[p.vk];                   
                    if(varcap) {
                        // if(debugComp) console.dir("phaseTwo UPDATE CLOSING VAR "+JSON.stringify(p)+"Partner("+i+") "+JSON.stringify(varcap)); 
                        let name = varcap.name;
                        let aci = varcap.income;
                        if(negMoney(setEUMoney(aci))) iMoney=closeIncome.credit[name]=setEUMoney(cents2EU(-1 * setEUMoney(aci).cents));
                        else iMoney=closeIncome.debit[name]=setEUMoney(aci);
                        iMoney.index=p.iVar; 
                        if(debugComp) console.log("phaseTwo CLOSING VAR "+JSON.stringify(iMoney));
                    }
                } catch(err) { console.error("sender.js phaseTwo UPDATE CLOSING  VARCAP ERROR: "+err); }
            }

            if(debugComp) console.log("phaseTwo "+gross+" CLOSING "+JSON.stringify(closeIncome));

            gReport.xbrlIncome.closing = JSON.stringify(closeIncome);

        } else console.dir("sender.js phaseTwo UPDATE CLOSING: NO gReport.xbrlRegular.account.gross");
    } catch(err) { console.error("sender.js phaseTwo UPDATE CLOSING ERROR: "+err); }

    






    // transfer txn pattern information
    gResponse[D_Muster] = balance[D_Muster];
    gResponse[D_Adressen] = balance[D_Adressen];

    // transfer page header footer information
    var page = makePage(balance); // side-effect
    if(debugPage) console.log("sender.js phaseTwo PAGE "+JSON.stringify(page));
    if(debugPage) console.log();
    gResponse[D_Page] = page;

    return gResponse;
}
module.exports['phaseTwo']=phaseTwo;



function distribute(money,partners,target) {      
    if(debug) console.log('__________');
    var strNumber="0,00";
    if(typeof(money)=='Number') {
        strNumber=(100*money).toString();
        //console.log("sender.js distribute("+target+") format number="+money+ " string="+strNumber);
    } 
    var err="";
    console.log("Sender.distribute("+target+") "+money.cents+" cents "+err); 
    if(!partners) { console.log("sender.js distribute() NO PARTNERS"); return; }

    return distributeMoney(money,partners,target);
}



function distributeMoney(money,bPartner,target) { // GH20211215
    var check=0;
    var result=[ 0, 0, 0, 0, 0, 0 ];
    var millis=0;
    var inc=-1;
    var sign=1;
    if(debug>2) console.log('Sender.distributeMoney('+JSON.stringify(money)+') CALL WITH MONEY');

    
    var amount=setEUMoney(moneyString(money)); 
    if(amount.cents<0) { let abs= -amount.cents; amount.cents=abs; sign=-1; }
    
    if(debug>2) console.log('Sender.distributeMoney('+JSON.stringify(amount)+') *'+sign+' ABSOLUTE VALUE ');

    if(bPartner) { 
        var pNum=0;
        for (var n in bPartner) {
            inc--;
            var p=bPartner[n];
            if(debug>2) console.log('Sender.distributeMoney for '+ p.vk);
            pNum++;
        }

        if(bPartner.length<2) console.log('Sender.distributeMoney('+JSON.stringify(amount)+') PRE-LOOP  NO PARTNERS IN BALANCE'); else
        
        while(lessMoney(setMoney(check),amount) 
                        && inc<999
        ){

            //if(debug>2) console.log("Sender.distribute("+amount.cents+") cents > "+check); 
            var shares=[];
            check=0;
            var fix=inc;
            for (var ndx in bPartner) {
                var p=bPartner[ndx];
                try { 
                    millis=10*parseInt(iScaleMoney(amount,parseInt(p.gain),parseInt(p.denom),parseInt(fix / 2 * pNum))); 
                } catch (err) {
                    millis++; console.log('Sender.distribute LOOP sharing failed');
                }
                if(debug>3) console.log('Sender.distribute('+amount.cents+')  LOOP  +'+fix+' cents at '+p.gain+'/'+p.denom+' => '+Math.trunc(millis/10));
                check=check+Math.trunc(millis/10);
                shares.push(sign * Math.trunc(millis/10));
                

                // GH20220102 
                fix--;

            }
            inc++;
            if(debug>2) console.log('Sender.distributeMoney('+amount.cents+')  POST-LOOP '+check);
            result=shares;
        }


        var index=0;
        for (let id in bPartner) {
            var p=bPartner[id];
            p[target]= moneyString(setMoney(result[index++]));
        }


    } else console.log('Sender.distributeMoney('+JSON.stringify(amount)+') NO PARTNERS IN BALANCE');

    if(debug && result && result.length>5) console.log('Sender.distributeMoney '+moneyString(amount) + " G"+result[0]+" E"+result[1]+" A"+result[2]+" K"+result[3]+" T"+result[4]+" L"+result[5]);
    return result;
}




