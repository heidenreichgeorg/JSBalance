        
        <SCRIPT type="text/javascript" src="/client.js"></SCRIPT>
        <SCRIPT type="text/javascript" src="/money.js"></SCRIPT>

            let debug=null;
            let INCOME_REGULAR = 'is.netIncome.regular';
            let INCOME_REGULAR_OTC = 'is.netIncome.regular.operatingTC';
            let INCOME_REGULAR_FIN = 'is.netIncome.regular.fin';
            let OTC_OTHER_REVENUE = 'regular.operatingTC.otherOpRevenue';
            let ASSET_TAX = 'ass.currAss.receiv.other.otherTaxRec';
                      
            var welcomeRecord = [];
            var partnerRecord={};

            function putResponse(strTarget,strText) {       

                var response = JSON.parse(strText);
                var jAccounts = response[D_Balance];
                var gSchema = response[D_Schema];
                let page = response[D_Page];
              
                //var arrHistory = [];                

                var boxFooter="";

                console.log(JSON.stringify(page));
                

                var welcome = document.getElementById("welcome");
                welcome.innerHTML = boxFooter;

                let headerInfo = '<DIV class="C280">'+page['GainLoss']+'&nbsp;'+page['header']+'</DIV>';
                //arrHistory.push(headerInfo);

                // left column client info
                welcomeRecord.push(page["header"]);
                welcomeRecord.push(page["client"]);
                welcomeRecord.push(page["reference"]);
                welcomeRecord.push(page["author"]);
                
                // partnerInfo
                // substitutes partnerInfo
                var htmlPage = createPage( ['C100','L175','C140','L175','R110','R110'],"<DIV class='attrLine'>"+headerInfo+"</DIV>",'PageContent');
                var cursor = htmlPage;

                let id = page['GainLoss'];
                let boxText = "'"+id+"'";

                cursor=printFormat(cursor,['TAX',' ','','']);

                // TAX accounts first 
                for (let name in jAccounts)   {
                    var account=jAccounts[name];
                    var desc = account.desc;
                    var gross = account.gross;
                    var iName = account.name;
                    var full_xbrl = account.xbrl;
                    var xbrl = full_xbrl.split('\.');
                    var xbrl_pre = xbrl.pop()+'.'+xbrl.pop()+'.'+xbrl.pop();

                    console.log("putResponse  "+JSON.stringify(account));

                    if(gross && iName && xbrl) {
                        var check = full_xbrl.trim();

                        // leftmost column with general client info
                        let info = (welcomeRecord.length>wIndex)?welcomeRecord[wIndex]:".";

                        if(check.includes(ASSET_TAX))
                            cursor=printFormat(cursor,[' ','T',iName,xbrl_pre,gross]);

                    } 
                }



                cursor=printFormat(cursor,[' ',' ','','']);
                let butInfo = '<DIV class="C100" border="1px solid #CCC" id="Button'+id+'" type="button" value="'+id+'" onclick="showModalTable('+boxText+','+boxText+')">'+id+'</DIV>';
                cursor = printHTML(cursor,butInfo);










                partnerRecord[id] = [];
                var wIndex=0;

                var centsOTC=0;
                for (let name in jAccounts)   {
                    var account=jAccounts[name];
                    var desc = account.desc;
                    var gross = account.gross;
                    var iName = account.name;
                    var full_xbrl = account.xbrl;
                    var xbrl = full_xbrl.split('\.');
                    var xbrl_pre = xbrl.pop()+'.'+xbrl.pop()+'.'+xbrl.pop();

                    console.log("putResponse  "+JSON.stringify(account));

                    if(gross && iName && xbrl) {
                        var check = full_xbrl.trim();

                        // leftmost column with general client info
                        let info = (welcomeRecord.length>wIndex)?welcomeRecord[wIndex]:".";
                        
                        if(check.includes(INCOME_REGULAR_OTC)) {

                            console.log("putResponse OTC "+JSON.stringify(account));

                            partnerRecord[id].push({'item':info, 'ref':iName, 'note':desc, 'value':gross, 'xbrl':xbrl_pre });
                            cursor=printFormat(cursor,[' ','*',iName,xbrl_pre,gross]);

                            centsOTC +=  setEUMoney(gross).cents;
                            wIndex++;
                        }

                    } 
                }



                partnerRecord[id].push({'item':page['RegularOTC'], 'ref':page['GainLoss'], 'note':page['GainLoss'], 'value':cents2EU(centsOTC), 'xbrl': INCOME_REGULAR_OTC});
                cursor=printFormat(cursor,[' ','&nbsp;',page['RegularOTC'],page['GainLoss'],cents2EU(centsOTC)]);

                cursor=printFormat(cursor,[' ']);





                var centsFIN=0;
                for (let name in jAccounts)   {
                    var account=jAccounts[name];
                    var desc = account.desc;
                    var gross = account.gross;
                    var iName = account.name;
                    var full_xbrl = account.xbrl;
                    var xbrl = full_xbrl.split('\.');
                    var xbrl_pre = xbrl.pop()+'.'+xbrl.pop()+'.'+xbrl.pop();


                    if(gross && iName && xbrl) {
                        var check = full_xbrl.trim();

                        // leftmost column with general client info
                        let info = (welcomeRecord.length>wIndex)?welcomeRecord[wIndex]:".";
                        
                        if(check.includes(INCOME_REGULAR_FIN) || check.includes(OTC_OTHER_REVENUE)) {

                            console.log("putResponse FIN "+JSON.stringify(account));

                            partnerRecord[id].push({'item':info, 'ref':iName, 'note':desc, 'value':gross, 'xbrl':xbrl_pre });
                            cursor=printFormat(cursor,[' ','+',iName,xbrl_pre,gross]);

                            centsFIN +=  setEUMoney(gross).cents;
                            wIndex++;
                            
                        }
                    } 
                }

                
                partnerRecord[id].push({'item':page['RegularFIN'], 'ref':page['GainLoss'], 'note':page['GainLoss'], 'value':cents2EU(centsFIN), 'xbrl': INCOME_REGULAR_FIN});
                cursor=printFormat(cursor,[' ','&nbsp;',page['RegularFIN'],page['GainLoss'],cents2EU(centsFIN)]);

                cursor=printFormat(cursor,[' ']);

                partnerRecord[id].push({'item':page['Regular'], 'ref':page['GainLoss'], 'note':page['GainLoss'], 'value':cents2EU(centsFIN+centsOTC), 'xbrl': INCOME_REGULAR});
                cursor=printFormat(cursor,[' ','&nbsp;',page['GainLoss'],page['GainLoss'],cents2EU(centsFIN+centsOTC)]);

                cursor=printFormat(cursor,[' ']);

                cursor=nextPage(cursor);

                var jPartner = response[D_Partner_NET];
                


                for (let id in jPartner)   {

                    var partnerInfo=[];
                    
                    var p=jPartner[id];
                    var nyCents=0;
                    
                    var varcap=jAccounts[p.vk];
                    var loscap=jAccounts[p.vaName];

                    console.log(JSON.stringify(p));






                    cursor=printFormat(cursor,['&nbsp;']);

                    let boxTitle = "'Gesellschafter "+p.name+"'";
                    let boxText = "'"+id+"'";
                    let butInfo = '<DIV class="C100" border="1px solid #CCC" id="Button'+p.name+'" type="button" value="'+p.name+'" onclick="showModalTable('+boxTitle+','+boxText+')">'+p.name+'</DIV>';
                    cursor=printHTML(cursor,butInfo);



                    partnerRecord[id] = [];

                    partnerRecord[id].push({'item':'Variables Kap', 'ref':p.vk, 'note':'Anfangsstand', 'value':varcap.init });
                    cursor=printFormat(cursor,['&nbsp;',page['VariableCap'],p.vk,'Anfangsstand',varcap.init]);

                    partnerRecord[id].push({'item':p.name, 'ref':p.vk, 'note':'Entnahmen', 'value':varcap.debit });
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',p.vk,'Entnahmen',varcap.debit]);

                    partnerRecord[id].push({'item':'&nbsp;', 'ref':p.vk, 'note':'Einlagen', 'value':varcap.credit });
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',p.vk,'Einlagen',varcap.credit]);

                        // SPLIT OTC and FIN
                        // GH2020112
                    partnerRecord[id].push({'item':'&nbsp;', 'ref':p.vk, 'note':'Endstand', 'value':varcap.gross });
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',p.vk,'Endstand',varcap.gross,cents2EU(nyCents=euCents(varcap.gross))]);


                    partnerRecord[id].push({'item':'&nbsp;', 'ref':'', 'note':'Gewinn', 'value':varcap.income });
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',p.vk,'Gewinn',varcap.income,cents2EU(nyCents+=euCents(varcap.income))]);


                    partnerRecord[id].push({'item':'&nbsp;', 'ref':page['thereof'], 'note':page['RegularOTC'], 'value':varcap.netIncomeOTC });
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',page['thereof'],page['RegularOTC'],varcap.netIncomeOTC]);


                    partnerRecord[id].push({'item':'&nbsp;', 'ref':page.thereof, 'note':page['RegularFIN'], 'value':varcap.netIncomeFin });
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',page['thereof'],page['RegularFIN'],varcap.netIncomeFin]);

                    if(p.cyLoss) {
                        let cyLoss = euCents(p.cyLoss);
                        partnerRecord[id].push({'item':'&nbsp;', 'ref':'', 'note':'Verlustvortrag', 'value':cents2EU(-cyLoss) });
                        cursor=printFormat(cursor,['&nbsp;','&nbsp;',' ','Verlustvortrag',cents2EU(-cyLoss),cents2EU(nyCents-=cyLoss)]);
                    }

                    partnerRecord[id].push({'item':'&nbsp;', 'ref':'', 'note':'KapErtragSt', 'value':p.kest });
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',' ',page['CapGainTax'],p.kest,cents2EU(nyCents-=euCents(p.kest))]);


                    partnerRecord[id].push({'item':'&nbsp;', 'ref':'', 'note':'KapErtragSoli', 'value':p.keso });                      
                    cursor=printFormat(cursor,['&nbsp;','&nbsp;',' ',page['CapGainSoli'],p.keso,cents2EU(nyCents-=euCents(p.keso))]);


                    partnerRecord[id].push({'item':'Variables Kap', 'ref':'', 'note':page['NextYear'], 'value':cents2EU(nyCents) });
                    cursor=printFormat(cursor,['&nbsp;',page['VariableCap'],' ',page['NextYear'],cents2EU(nyCents)]);


                    partnerRecord[id].push({'item':'Verlustvortrag', 'ref':'', 'note':page['NextYear'], 'value':p.nyLoss });
                    cursor=printFormat(cursor,['&nbsp;',page['Carry4Loss'],' ',page['NextYear'],p.nyLoss]);

                }



                setTrailer(page, cursor);
                setScreen(document,htmlPage);


            }  


            var popUpObj;
            function showModalTable(title,key) {

                var boxText=[];
                let jList = partnerRecord[key];
                jList.forEach(jRecord => {
                
                   // let jRecord=jList[0];
                    console.log("showModalTable  "+JSON.stringify(jRecord));

                    boxText.push('<DIV class="C100">&nbsp;'
                            +'</DIV><DIV class="L120">'+jRecord.item
                            +'</DIV><DIV class="C100">'+jRecord.ref
                            +'</DIV><DIV class="L120">'+jRecord.note
                            +'</DIV><DIV class="R110">'+jRecord.value
                            +(jRecord.xbrl?('</DIV><DIV class="L280">'+jRecord.xbrl):'')
                            +'</DIV>');
                });


                popUpObj=window.open(
                    "", 
                    "ModalPopUp",
                    'toolbar=no,scrollbars=no,location=no,statusbar=no,menubar=no,resizable=0,width=900,height=480,left=300,top=100'
                );               
                
                // creates a fresh window popUpObj.document.open();


                text = '<DIV class="witBorder"><DIV class="mTable"><DIV class="ulliTab"><DIV class="attrDash">'+boxText.join('</DIV><DIV class="attrDash">')+'</DIV></DIV></DIV></DIV>';

                popUpObj.document.write('<HTML><TITLE>'+title+'</TITLE><link rel="stylesheet" href="./FBA/mobile_green.css"/>'+text+'</HTML>');
                popUpObj.focus();                
            }

            function euCents(euString) {
                return parseInt(100*parseFloat(euString.replace('\.','').replace(',','.')));
            }

