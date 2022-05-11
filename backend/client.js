
const D_XBRL   = "XBRL";
const D_Balance= "Bilanz";
const D_FixAss  = "Anlagen";
const D_History = "Historie";
const D_Page = "Seite";
const D_Partner_NET= "NETPartner";
const D_Partner_CAP= "CAPPartner";
const D_Partner_OTC= "OTCPartner";
const D_Report = "Report";
const D_Schema  = "Schema";
const D_Muster = "Muster";
const D_Adressen="Adressen";

const J_ACCT=6;
const DOUBLE = ':';
const CSEP = ';';
const COLMIN=1; // minimum length of column text
        
const PORT = 81;


function getFromServer(responseHandler) {
                
    let strServerDNS = 'http://'+self.location.hostname+':'+PORT+'/'; 

    var request = new XMLHttpRequest();
    if(debug) console.log("getFromServer()  ENTER");

    let strTarget = window.location.href;

    let paramString = strTarget.split('?')[1];
    var url=strServerDNS+'SHOW?'+paramString;
  

    request.open('GET',url, true);				
    console.dir("client.getFromServer GET url="+url);

    request.onreadystatechange = function() {
        if(debug) console.log("getFromServer response state changed");
        if(request.readyState==4) {	 // DONE
            if(request.status>=200) {
                var value = request.response;
                if(value.endsWith("|")) value=value.slice(0,-1);
                if(debug) console.log("getFromServer RESPONSE received = "+value);
                responseHandler(strTarget,value);
            }
            else console.log(strTarget+' --> '+request.status);			    
        }
    }		

    request.addEventListener('error', handleEvent);
    request.setRequestHeader('Cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
    request.setRequestHeader('Cache-control', 'max-age=0');

    request.setRequestHeader("Content-type", "text/json");			
    request.send();

}	



function postToServer(strTarget,strParams,callBack) {

    let strServerDNS = 'http://'+self.location.hostname+':'+PORT+'/'; 
    
    if(strTarget) {
        var request = new XMLHttpRequest();

        /*
        request.onerror = function (e) {
            //console.error("Unknown Error Occured. Server response not received.");
            console.error("postToServer "+strTarget+": "+request.responseText);
            callBack( request.responseText );
        };
        */

        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status>=200) {
                console.log("postToServer "+strTarget+": "+request.responseText);
                if(callBack) {
                    if(this.status==200 || this.status==400) callBack( ""+this.status+" OK " );
                    else callBack( request.responseText );
                }
            }
        };

        request.open('POST',strServerDNS+strTarget, true);						
        request.addEventListener('error', handleEvent);
        request.setRequestHeader('Cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
        request.setRequestHeader('Cache-control', 'max-age=0');
        request.setRequestHeader( 'Content-Type', 'application/json;charset=UTF-8'); //("Content-type", "text/json");			
        request.send(strParams);
    } else alert('postToServer: no target!');
}



function postAndDisplay(strCommand,jBody,height) {

// show modal message window

    //let strServerDNS = 'http://'+self.location.hostname+':'+PORT+'/';
    //const url = strServerDNS+strCommand;
    const url ="./"+strCommand;

    jBody.sessionId=getId();

    // request options
    const options =  { method: 'POST', body: JSON.stringify(jBody), headers: { 'Content-Type': 'application/json' }}

    if(!height) height=55;
    var top=1080-height;
    let panel = window.open("", 'Panel',' height='+height+', width=1480, left=1, top='+top+', resizable=no , scrollbars=no  ,toolbar=no ,menubar=no ,location=no ,directories=no ,status=no ');
    panel.document.open();

    // send POST request
    fetch(url, options)
       .then((resp) => resp.text())
       .then(function(data) {
          
        // show IN PLACE
          //var page = document.getElementById(target)
          //if(page) page.innerHTML = data;
          panel.document.write(data);
          panel.focus();        
                })
       .catch(function(error) {
          console.log(error);
    });      
    
}


function unixYYYYMM() {
    var u = new Date(Date.now()); 
    return u.getUTCFullYear() +
    '-' + ('0' + (1+u.getUTCMonth())).slice(-2);
}

function unixYYYYQQ() {
    var u = new Date(Date.now()); 
    return u.getUTCFullYear() +
    '-' + ('Q' + (1+(u.getUTCMonth()%3))).slice(-2);
}

function unixYYYY() {
    var u = new Date(Date.now()); 
    return ''+u.getUTCFullYear();
}

function unixYYYYNNNN() {
    var u = new Date(Date.now()); 
    let yy=u.getUTCFullYear();
    return ''+yy+'/'+(yy+1);
}

function unixPPPPYYYY() {
    var u = new Date(Date.now()); 
    let yy=u.getUTCFullYear()-1;
    return ''+yy+'/'+(yy+1);
}

function unixTime() {
    var u = new Date(Date.now()); 
    return u.getUTCFullYear() +
    '-' + ('0' + (1+u.getUTCMonth())).slice(-2) +
    '-' + ('0' + u.getUTCDate()).slice(-2) + 
    ' ' + ('0' + u.getUTCHours()).slice(-2) +
    ':' + ('0' + u.getUTCMinutes()).slice(-2) 
  +  ':' + ('0' + u.getUTCSeconds()).slice(-2) 
 // +  '.' + (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) 
}



function handleEvent(event) { 
    if(event) console.log(unixTime()+'--'+event.type+': '+event.message+' '+event.filename+'\n'); 
    else console.log(unixTime()+'--EMPTY');
}


function arrNumeric(arrStrings) {
    var result=[];
    arrStrings.forEach(text => {
        var clean = text.replace('.','');
        result.push(parseInt(clean));
    });
    return result;
}

var module = { 'exports':[] }
// allow for normal js to follow 



 // from money.js
 function moneyString(money) {
    var prefix = "";
    var value=money.cents;
    if(value<0) {
        prefix='-';
        value=-1 * money.cents;
    } 
    var kilos=parseInt(value / 100000);
    var coins=value - (100000*kilos);
    
    var euros=parseInt(coins / 100);	
    var cents=coins - (100*euros);
    
    var strEuros = ''+euros;
    var strCent = '00'+cents;
    var lenCent = strCent.length;
    if(kilos>0) {
        prefix = prefix + kilos+'.';
        strEuros = '000'+strEuros;
        lenEuros = strEuros.length;
        strEuros = strEuros.slice(lenEuros-3);
    }
    return prefix + strEuros + ',' + strCent.slice(lenCent-2);	
}



// var cCent
// var creditList
// var debitList

//GH20220315 merge these two
var creditDivs;
var debitDivs;


function validateCD(creditList,debitList) {
    var saldoC=0;
    var saldoD=0;

   creditDivs=[];
    for(let name in creditList) {
        let value=creditList[name];
        saldoC+=value.cents;
        var display=moneyString(value);
        creditDivs.push("<div class='L66'>"+name+DOUBLE+"</div><div class='R110' onclick='toggleC2D("+'"'+name+'"'+")'>"+display+"</div>");
    }
 

    debitDivs=[];
    for(let name in debitList) {
        let value=debitList[name];
        saldoD+=value.cents;
        var display=moneyString(value);
        debitDivs.push("<div class='L66'>"+name+DOUBLE+"</div><div class='R110' onclick='toggleD2C("+'"'+name+'"'+")'>"+display+"</div>");
    }

    var diff=0;
    if(saldoC>saldoD) diff=saldoC-saldoD;
    if(saldoC<saldoD) diff=saldoD-saldoC;

    //merge the two columns
    var cdPairs=[];
    if(creditDivs.length>0 || debitDivs.length>0) {
        //cCent=diff; 20220316

        var lines=0;
        for(;creditDivs.length>0 || debitDivs.length>0;lines++) {
            var left=  "<div class='L66'>&nbsp;</DIV><div class='R110'>&nbsp;</DIV>";
            var right= "<div class='L66'>&nbsp;</DIV><div class='R110'>&nbsp;</DIV>";
            if(creditDivs.length>0) { left=creditDivs.pop(); }
            if(debitDivs.length>0)  { right=debitDivs.pop(); }
            cdPairs.push(left+"<div class='L66'>&nbsp;</DIV>"+right);
        }
    }

    return { 'diff':diff, 'saldoC':saldoC, 'saldoD':saldoD, 'cdPairs':cdPairs };
}

var notes;

function addNote(notes) {
    var result="<DIV class='C100'>&nbsp;</DIV>";
    if(notes && notes.length) {
        let cmd = notes.pop();
        result="<DIV class='C100'><div class=\"key\" onclick=\"doCommand(\'"+cmd+"\')\">"+cmd+"</div></DIV>";
        // inner control was button
    } 
    return result;
}

function addLink(i,name) {
    var result="";
    if(name && name.length>COLMIN) {
        makeAccount(parseInt(i),name);
        result='<DIV class="C100" id="sel'+name+'">'
        +'<div  class="key" oncontextmenu="accountMenu(event,\''+name+'\')" '
        +' onclick="listCreditAccount('+i+',\''+name+'\')"'
        +'>'+name+'</div></DIV>'; // inner control was button
    }
    return result;
}

function makeAccount(index,name) {  

//    if(debug) console.log("LA01 makeAccount: "+index+"="+name);

    var schemaNames = gSchema.Names;

    var partin=["Date","Sender","Reason","Ref1","Ref2","Target","Saldo"];
    partin[J_ACCT-1] =schemaNames[index];
    let headerInfo = '<DIV class="R110">'+partin.join('</DIV><DIV class="R110">')+'</DIV>';
    var htmlAccount = createPage( ['C100','R110','R110','R110','R110','R110','R110'],"<DIV class='attrLine'>"+headerInfo+"</DIV>",'PageContent');
    var cursor=htmlAccount;



    // effective trailer
    //var partout=["&nbsp;","Open","Credit","Debit","Saldo","Target"];
    //partout[J_ACCT-1]=schemaNames[index];
    //cursor=printFormat(cursor,partout);


    var saldo = show(null,null);



    for (let hash in gHistory)  {
        var txn = gHistory[hash];
        if(txn && txn.length>0) {
            var flag=0;
            var parts=txn;// server made each line an array already
            var entry = []; // skip hash or index
            for(var i=1;i<parts.length;i++) {
                var data = parts[i];
                if(!data || data.length<=COLMIN) data="";

                if(i>=J_ACCT && schemaNames[i] && schemaNames[i].length>COLMIN) {
                    if(i==index && data && data.length>0) {
                        entry.push(data);
                        saldo = show(saldo,data);
                        flag=1;
                    }
                }
                else if(i<J_ACCT) entry.push(data.substring(0,iCpField));
            }
            
            // trying to find current rolling saldo
            entry.push(cents2EU(saldo.cents));

            if(flag>0) cursor=printFormat(cursor,entry);
        } else {
            // ERROR out
            //arrHistory.push('<DIV class="attrLine">'+JSON.stringify(txn)+'</DIV>');
        }
    }



    // closing line 
    var closing=[];
    closing= [ "31.12.","Initial", "Credit", "Debit", "Ergebnis", "Konto" ];
    cursor=printFormat(cursor,closing);

    if(name && gAccounts[name])   {
        var account=gAccounts[name];
        closing= [ "31.12.",""+account.init,""+account.credit,""+account.debit,""+account.gross,schemaNames[index] ];
        cursor=printFormat(cursor,closing);
    }

    accountPages[name] = htmlAccount;
}  

var terminal=null;


    
// complete Close page
function showTransfer(txnForm) {

    let cdPairs = txnForm.cdPairs;

    let headerInfo = '<DIV class="C280">'+page["Transfer"]+'&nbsp;'+page["header"]+'</DIV>';

    let htmlPage = createPage( ['L220','L120','L120','R110','R110','R110'],"<DIV class='attrLine'>"+headerInfo+"</DIV>",'PageContent');
    
    if(!terminal) terminal = initTerminal(page,'PageContent',18);  

    var cursor=htmlPage;


    notes = [ "<","0","X",   "9","8","7",  "6","5","4",   "3","2","1"    ];
    

   // if(debug) console.log('Schema='+JSON.stringify(gSchema));                
    if(gSchema && gSchema.Names && gSchema.Names.length>0) {
        var parts=gSchema.Names;


        // balance account names
        for(var i=J_ACCT;i<parts.length;i+=5) {
        
            let strHTML =
            " "+addNote(notes)+" "+addNote(notes)+" "+addNote(notes)
            +addLink( i, parts[i])
            +addLink(i+1,parts[i+1])
            +addLink(i+2,parts[i+2])
            +addLink(i+3,parts[i+3])
            +addLink(i+4,parts[i+4]);
            

            cursor=print2Terminal(cursor,strHTML);
             
        }
    }


    var sender=""; try { sender=document.getElementById("sender").attr("value"); } catch(err) {}
    var refAcct=""; try { refAcct=document.getElementById("refAcct").attr("value"); } catch(err) {}
    var info4=""; try { info4=document.getElementById("info4").attr("value"); } catch(err) {}
    var info5=""; try { info5=document.getElementById("info5").attr("value"); } catch(err) {}



    var bookingHead = 
     '<DIV class="L175"><input type="date" id="date"></input></DIV>'
    +'<DIV class="L120"><input type="edit" id="sender" value="'+sender+'"></input></DIV>'      
    +'<DIV class="L120"><input type="edit" id="refAcct" value="'+refAcct+'"></input></DIV>'
    +'<DIV class="L120"><input type="edit" id="info4" value="'+info4+'"></input></DIV>'
    +'<DIV class="L120"><input type="edit" id="info5" value="'+info5+'"></input></DIV>';
    print2Terminal(cursor,bookingHead);



    // BOOK button and 'display' for delta = cCent
    var bookingAmount =  // inner control was button
      "<div class='C100' ><div class='key' id='book-button' onclick='book()' )>Book</div></div>"
    + "<DIV id='display'>"+cents2EU(cCent)+"</DIV>";
    print2Terminal(cursor,bookingAmount);


    for(var c=0;c<cdPairs.length;c++) {
        cursor=print2Terminal(cursor,"<div class='C100' >&nbsp;</div><DIV class='R165' id='display'>&nbsp;</DIV>"+cdPairs[c]);
    }
    

    showTerminal(terminal,htmlPage);

}


// complete Close page
function showClose(txnForm,nextFuncName) {

    let cdPairs = txnForm.cdPairs;
    var saldoC=0; saldoC=txnForm.saldoC;
    var saldoD=0; saldoD=txnForm.saldoD;

    let headerInfo = '<DIV class="C280">'+page["Closing"]+'&nbsp;'+page["header"]+'</DIV>';

    let htmlPage = createPage( ['L220','L120','L120','R110','R110','R110'],"<DIV class='attrLine'>"+headerInfo+"</DIV>",'PageContent');
    
    if(!terminal) terminal = initTerminal(page,'PageContent',18,  nextFuncName); 

    var cursor=htmlPage;
  
    for(var c=0;c<cdPairs.length;c++) {
        cursor=print2Terminal(cursor,"<div class='C100' >&nbsp;</div>"+cdPairs[c]);
        // <DIV class='R165' id='display'>&nbsp;</DIV>
    }

    cursor=print2Terminal(cursor,"<div class='C100' >&nbsp;</div>"+
    "<div class='L66'>Credit</DIV><div class='R110'>"+cents2EU(saldoC)+"</div><div class='L66'>&nbsp;</DIV><div class='L66'>Debit</DIV><div class='R110'>"+cents2EU(saldoD)+"</div>");
    

    showTerminal(terminal,htmlPage);
}



function save(jInfo) {

    var date = jInfo.date;

    jInfo.sessionId=getId();

    var sInfo = JSON.stringify(jInfo);

    var target = document.getElementById("display");
    if(date.length>6) {
        let  txnForm = validateCD(jInfo.credit,jInfo.debit); 
        if(txnForm.diff==0) {
            showTransfer(txnForm);
            postToServer("BOOK",sInfo);
            console.log('client.js save() postToServer'+sInfo);
            target.innerHTML = "<DIV >&nbsp;</DIV ><DIV onclick='closeWindow' >CLOSE</DIV>" ; // class='R110'

        }
        else   {  
            console.log('Not Balanced!');
            target.innerHTML = "<DIV >&nbsp;</DIV ><DIV >NOT BALANCED</DIV>" ; // class='R110'
        }
    }
    else   {  
        console.log('No Date!');
        target.innerHTML = "<DIV >&nbsp;</DIV ><DIV >NO DATE</DIV>" ; // class='R110'
    }
}


//--------------------------------------------

//********************************************************************************** */
//POPUP windows


var dashBoard={};
var tile=0;

function newPopup(url,command,width,lines) {

    var pLines=2; // line has 140 pixels
    if(lines) pLines=lines;

    pWidth=890; // wifth in pixels
    if(width && width>1) pWidth=width;

    // runs in WELCOME button panel

    // console of WELCOME button panel


    tile++;
    if(tile>=4) tile=0;
    let leftPos=(tile%2)==0 ? 30 :890;
    let verticalPos=(tile>1?470:-10);
    
    console.dir("NEW POPUP "+command+ "  Width="+width + " Tile="+tile + "  X="+leftPos+"  Y="+verticalPos);

    let panel = window.open(url, 'window'+command,'height='+(240*pLines)+',width='+pWidth+', top='+verticalPos+', left='+leftPos+',resizable=no ,scrollbars=no ,toolbar=no ,menubar=no ,location=no ,directories=no ,status=no ');

    if(command&&command.length>0) dashBoard[command]=panel;
        
}



//********************************************************************************** */
// content of mTable


function createPage(arrCSS,strHeader,target,lines) {
    var arrStr=[strHeader];
    if(!lines) lines=18;  
    return { 'arrContent':arrStr, 'arrCSS':arrCSS, 'page':0, 'target':target, 'screenLines':lines }
}


function printFormat(htmlPage,content,strHTML) {
    let strLine='attrLine';
    if(htmlPage && content) {             
        let arrCSS=htmlPage.arrCSS;
        if(arrCSS) {
            while(content.length>0) {
                // GH20220214
                if(htmlPage.arrContent && htmlPage.arrContent.length>=htmlPage.screenLines) {
                    let newPage=createPage(arrCSS,htmlPage.arrContent[0],htmlPage.target);
                    htmlPage.succPage = newPage;
                    htmlPage=newPage;
                }
                printInternal(htmlPage,arrCSS,content,strHTML);
            }
        }
    }
    return htmlPage;
}


// GH20220215
// fill remaining lines in last page
function nextPage(htmlPage) {
    let strLine='attrLine';
    if(htmlPage) {             
        let arrCSS=htmlPage.arrCSS;
        if(arrCSS) {
            while(htmlPage.arrContent.length<htmlPage.screenLines) {
                printInternal(htmlPage,arrCSS,['&nbsp;'])
            }
            let newPage=createPage(arrCSS,htmlPage.arrContent[0],htmlPage.target);
            htmlPage.succPage = newPage;
            htmlPage=newPage;
        }
    }
    return htmlPage;
}



function printInternal(htmlPage,arrCSS,content,strHTML) {
    let strLine='attrLine';
    var result = [];
    let limit = 32;
    result.push('<DIV class="'+strLine+'">');
    for(var i=0;i<arrCSS.length && content && content.length>0;i++) {
        let text = content.shift();
        if(text && text.length>0) {
            result.push("<DIV class='"+arrCSS[i]+"'>"+text.substring(0, limit)+'</DIV>');
        }
    }
    if(strHTML) result.push(strHTML);
    result.push('</DIV>');
    htmlPage.arrContent.push(result.join(''));
}


function printHTML(htmlPage,strHTML) {
    if(htmlPage && strHTML) {             
        if(htmlPage.arrContent && htmlPage.arrContent.length>=htmlPage.screenLines) {   
            console.dir("printHTML PAGE BREAK");
            let newPage=createPage(htmlPage.arrCSS,htmlPage.arrContent[0],htmlPage.target);
            htmlPage.succPage = newPage;
            htmlPage=newPage;
        }
        htmlPage.arrContent.push("<DIV class='attrLine'>"+strHTML+"</DIV>");
    }
    return htmlPage;
}


function print2Terminal(htmlPage,strHTML) {
    if(htmlPage && strHTML) {             
        if(htmlPage.arrContent && htmlPage.arrContent.length<htmlPage.screenLines) {            
            htmlPage.arrContent.push(strHTML);
        }
    }
    return htmlPage;
}

function setTrailer(page,cursor) {   
    if(cursor) {

        cursor=printFormat(cursor,[' ']);


        let boxFooter1 = "<DIV class='L120'>&nbsp;"
        +"</DIV><DIV class='L280'>"+page["client"]
        +"</DIV><DIV class='L280'>"+page["register"]
        +"</DIV>"
        cursor=printHTML(cursor,boxFooter1);


        let boxFooter2 = "<DIV class='L120'>&nbsp;"
        +"</DIV><DIV class='L280'>"+page["reference"]
        +"</DIV><DIV class='L280'>"+page["author"]
        +"</DIV>";
        cursor=printHTML(cursor,boxFooter2);
    }

    return cursor;
}

 function setDashBoard(unit,arrClock) {   
     
    // prefix e.g. "01"
    var svg='';
    var cMax=1;

    for(var j=0;j<arrClock.length;j++) {
        let scale = arrClock[j];
        if(scale.value1>cMax) cMax=scale.value1+1;
        if(scale.value2>cMax) cMax=scale.value2+1;
    }


    // calculate scales range and factor from cMax
    for(var j=0;j<arrClock.length;j++) {
        let scale = arrClock[j];
//        let cMax=scale.cMax; use given maximum value

        var  fVar=cMax;
        var log=1;
        var range=1;
        var strLog="";
        while(fVar>100) {
            log++;
            range=range*10;
            fVar=fVar/10;
            strLog="0"+strLog;
            if(log==3)strLog=","+strLog;
        }

        let factor=parseInt("1"+strLog);
        
        if(fVar<50) { range=range/2;  fVar=fVar/2; } // factor=factor/2;
        //if(fVar>20) { range=range*2; fVar=fVar/2; }



        if(factor>range) factor=factor/10;



        scale.factor=factor;
        scale.range=range;

        console.log("showMinute INST cMax="+cMax+" --> fVar="+fVar+"  factor="+factor+"  range="+range);
    }


    for(var j=0;j<arrClock.length;j++) {
        let scale = arrClock[j];

        let suffix = scale.prefix;
        let nominal = (''+scale.nominal).substring(0,6);
        let title=scale.title;
        let factor=scale.factor;


        svg =  svg + '<DIV id="instrument'+suffix+'" class="scalesA"><svg  class="clock" viewBox="-10 -10 120 120">'+ 
            '<g class="scalesB">'+
                '<line class="line-0" x1="50" y1="5" x2="50" y2="10"></line>  <text id="scaleA'+suffix+'" class="scalesC line-0" x="46" y="-4">0</text>'+
                '<line class="line-1" x1="50" y1="5" x2="50" y2="10"></line>  <text id="scaleB'+suffix+'" class="scalesC line-1" x="46" y="-4">5</text>'+
                '<line class="line-2" x1="50" y1="5" x2="50" y2="10"></line>  <text id="scaleC'+suffix+'" class="scalesC line-2" x="46" y="-4">10</text>'+
                '<line class="line-3" x1="50" y1="5" x2="50" y2="10"></line>  <text  id="scaleD'+suffix+'" class="scalesC line-3" x="46" y="-4">15</text>'+
                '<line class="line-4" x1="50" y1="5" x2="50" y2="10"></line>  <text  id="scaleE'+suffix+'" class="scalesC line-4" x="46" y="-4">20</text>'+
                '<line class="line-5" x1="50" y1="5" x2="50" y2="10"></line>  <text  id="scaleF'+suffix+'" class="scalesC line-5" x="46" y="-4">25</text>'+
                '<line class="line-6" x1="50" y1="5" x2="50" y2="10"></line>  <text  id="scaleG'+suffix+'" class="scalesC line-6" x="46" y="-4">30</text>'+
                '<line class="line-7" x1="50" y1="5" x2="50" y2="10"></line>  <text  id="scaleH'+suffix+'" class="scalesC line-7" x="46" y="-4">35</text>'+
                '<line class="line-8" x1="50" y1="5" x2="50" y2="10"></line>  <text  id="scaleI'+suffix+'" class="scalesC line-8" x="46" y="-4">40</text>'+
                '<line class="line-9" x1="50" y1="5" x2="50" y2="10"></line>  <text  id="scaleJ'+suffix+'" class="scalesC line-9" x="46" y="-4">45</text>'+
                '<line class="line-10" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleK'+suffix+'" class="scalesC line-10" x="46" y="-4">50</text>'+
                '<line class="line-11" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleL'+suffix+'" class="scalesC line-11" x="46" y="-4">55</text>'+
                '<line class="line-12" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleM'+suffix+'" class="scalesC line-12" x="46" y="-4">60</text>'+
                '<line class="line-13" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleN'+suffix+'" class="scalesC line-13" x="46" y="-4">65</text>'+
                '<line class="line-14" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleO'+suffix+'" class="scalesC line-14" x="46" y="-4">70</text>'+
                '<line class="line-15" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleP'+suffix+'" class="scalesC line-15" x="46" y="-4">75</text>'+
                '<line class="line-16" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleQ'+suffix+'" class="scalesC line-16" x="46" y="-4">80</text>'+
                '<line class="line-17" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleR'+suffix+'" class="scalesC line-17" x="46" y="-4">85</text>'+
                '<line class="line-18" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleS'+suffix+'" class="scalesC line-18" x="46" y="-4">90</text>'+
                '<line class="line-19" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleT'+suffix+'" class="scalesC line-19" x="46" y="-4">95</text>'+
                '<line class="line-20" x1="50" y1="5" x2="50" y2="10"></line> <text  id="scaleU'+suffix+'" class="scalesC line-20" x="46" y="-4">100</text>'+               
                '<circle class="scalesC" cx="50" cy="50" r="43" fill="none"></circle>'+
                '<circle class="scalesB" cx="50" cy="50" r="45" fill="none"></circle>'+
                '<circle class="scalesB" cx="50" cy="50" r="59" fill="none"></circle>'+
                '<circle class="scalesC" cx="50" cy="50" r="60" fill="none"></circle>'+
                '<text class="scalesD line-10" x="38"  y="25">'+nominal+'</text>'+
                '<text class="scalesD line-10" x="40"  y="45">x '+factor+'</text>'+
                '<text class="scalesD line-10" x="35" y="101">'+title+'</text>'+
                '<text class="scalesE line-10" x="-10"  y="1">'+unit+'</text>'+
            '</g>'+
        

            '<polygon id="clockA'+suffix+'"  points="50,0  48,50   52,50  " fill="#77FF44"></polygon>' +

            '<polygon id="clockB'+suffix+'"  points="50,0  48,50   52,50  " fill="#44DD22"></polygon>' +

            //'<line id="clock'+suffix+'"  class="pointer" x1="50" y1="10" x2="50" y2="50"></line>'+
        '</svg></DIV>';
    }
    
    var ePage = document.getElementById('PageContent');
    if(ePage) {
        ePage.setAttribute("class","dosBorder");
        ePage.setAttribute("width","1500");
    }

    var eHistory = document.getElementById('pageTable');      
    if(eHistory) {
        eHistory.insertAdjacentHTML ('beforeend','<DIV class="instRow">' + svg + '</DIV>');
  
        for(var j=0;j<arrClock.length;j++) {
            let data = arrClock[j];
            
            console.dir(JSON.stringify(data));
            
            let factor =data.factor;
            let range =data.range;
            let value1=data.value1;    
            let value2=data.value2;    
            let suffix = data.prefix;
            
            showMinute('clock',suffix,value1,value2,range,factor);
        }    
    }
}


function showMinute(instrument,suffix,value1,value2,range,factor) {

    const minutesDeg1 = 210 + (value1*3)/range; // using only 300 degrees of 360
    const minutesDeg2 = 210 + (value2*3)/range; // using only 300 degrees of 360
    const minuteline1 = document.getElementById(instrument+'A'+suffix);
    const minuteline2 = document.getElementById(instrument+'B'+suffix);
    minuteline1.style.transform = `rotate(${minutesDeg1}deg)`;
    minuteline2.style.transform = `rotate(${minutesDeg2}deg)`;

    let index = 'ABCDEFGHIJKLMNOPQRSTU';

    let step = (range/20)/factor;

    console.log("range="+range+" value1="+value1+"  value2="+value2+" step="+step+" instrument="+instrument+" suffix="+suffix);

    for(var i=0;i<=20;i++) {
        let letter=index.charAt(i);
        let scale = document.getElementById('scale'+letter+suffix);
        scale.innerHTML=(""+step*i).substring(0,6);

        scale.setAttributeNS(null,'y',2-6*(i%2));
    }
    
    
}
 

function setScreen(targetDocument,htmlPage) {   
     
    if(htmlPage) {

        // creates the DOS-type screen
        let strLine='attrLine'; 
        var eHistory = targetDocument.getElementById(htmlPage.target);
        var strTarget= "'"+htmlPage.target+"'";
        var  arrPanel=[ '<div class="key" onclick="select('+strTarget+',-1)">Print</div>'  ]; 
        var  arrHTML =[  ]; 
    

        var autofocus='autofocus';
        for(var num=0;htmlPage;num++) {
            var next=null;
            if(!htmlPage.succPage) { nextPage(htmlPage,strLine);  } else next = htmlPage.succPage;
            arrHTML.push('<DIV class="ulliTab" id='+htmlPage.target+num+'>'+htmlPage.arrContent.join('')+'</DIV>');
            arrPanel.push('<div class="key" onclick="select('+strTarget+','+num+')"><label class="form-control"><input type="radio" '+autofocus+'>'+num+'</input></label></div>');
            autofocus='';
            htmlPage=next;
        }

        let panel = '<DIV class="attrRow">'+arrPanel.join('')+'</DIV>';
        


    //    let style=" text-shadow: 0px 1px 0px #1EEE1E;"
        let style=' class="dosBorder" ';
      

        if(eHistory) eHistory.innerHTML = '<HEAD><link rel="stylesheet" href="./FBA/mobile_green.css"/>'
            +'<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Inconsolata" />'
            +'</HEAD><BODY  onload="getFromServer(putResponse)" '+style+' ><DIV id="windowBorder" class="dosBorder"><DIV class="mTable">'
            
             + panel + arrHTML.join('') 
            
             + '</DIV></DIV></BODY>';
        
        
        select('PageContent',0); // htmlPage.target,  -1 is the PRINT page
    }
}


function initTerminal(page,target,screenLines,nextFuncName) {   
     

    // creates the DOS-type screen
    var eHistory = document.getElementById(target);


    // create top PANEL and HTML area
    let num=0;
    var  arrPanel=[ '<div class="key" onclick="select('+target+',-1)">Print</div>'  ]; 
    arrPanel.push('<div class="key" onclick="select('+target+','+num+')">Screen '+num+'</div>');


    // create main HTML area
    var  arrHTML =[  ];
    var l=0
    arrHTML.push('<DIV class="ulliTab" id='+target+num+'>');
    for(;l<screenLines;l++) {
        arrHTML.push('<DIV class="attrLine" id="'+target+'termLine'+l+'">&nbsp;</DIV>');
    }


    let boxFooter1 = "<DIV class='L120' id='box1Footer'>&nbsp;"
    +"</DIV><DIV class='L280'>"+page["client"]
    +"</DIV><DIV class='L280'>"+page["register"]
    +"</DIV>"
    arrHTML.push('<DIV class="attrLine" id="termLine'+l+'">'+boxFooter1+'</DIV>');
    l++;


    let boxFooter2 = "<DIV class='L120' id='box2Footer'>&nbsp;"
    +"</DIV><DIV class='L280'>"+page["reference"]
    +"</DIV><DIV class='L280'>"+page["author"]
    +"</DIV>" + (nextFuncName==null ? "": "<BUTTON autofocus class='L40' onclick='"+nextFuncName+"()'> >>> </BUTTON>");
    arrHTML.push('<DIV  class="attrLine" id="'+target+'termLine'+l+'">'+boxFooter2+'</DIV>');
    l++;



    let panel = '<DIV class="attrRow" id="Panel">'+arrPanel.join('')+'</DIV>';
    
    let body = '<BODY onload="getFromServer(putResponse)" style=" text-shadow: 0px 1px 0px #1EEE1E;">'; 
    
    if(eHistory) eHistory.innerHTML = '<HEAD><link rel="stylesheet" href="./FBA/mobile_green.css"/>'
        +'<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Inconsolata" />'
        +'</HEAD>' + body + '<DIV id="windowBorder" class="dosBorder"><DIV class="mTable">' + panel + arrHTML.join('') + '</DIV></DIV></BODY>';


    return document;
}

function showTerminal(terminal,htmlPage) {   
     
    // fills the DOS-type screen
    var strTarget= htmlPage.target;


    // fill main HTML area
    var  arrHTML =[  ];
    var l=0
    // Terminal has only Screen 0
    arrHTML.push('<DIV class="ulliTab" id='+strTarget+'0>');
    for(;l<htmlPage.screenLines;l++) {
        let arrHTMLKey=strTarget+"termLine"+l;
        let docHTML=terminal.getElementById(arrHTMLKey);
        if(docHTML && htmlPage.arrContent[l]) {
            docHTML.innerHTML=htmlPage.arrContent[l];
            console.log("showTerminal sets "+arrHTMLKey);
        } else console.log("showTerminal can't find "+arrHTMLKey);
        
    }

    
}




function select(target,num) {

    let eHistory = document.getElementById(target+num);
    var screen=eHistory;
    var style="none";
    
    if(!eHistory) { 
        screen=document.getElementById(target+'0'); 
        style="block"; 
        document.getElementById('windowBorder').className="witBorder"; 
    } 
    
    for(var i=0;screen;i++) {
        screen.style.display=style;
        screen=document.getElementById(target+i);
    }
    if(eHistory) {
        eHistory.style.display="block";
        document.getElementById('windowBorder').className="dosBorder"; 
    }
}


function getId() {
    
    var searchParams = new URL(window.location.href).searchParams;
    //Iteriert über die Suchparameter
    for (let p of searchParams) {
      console.log("CLIENT "+p);
    }
    return searchParams.get("sessionId");
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
