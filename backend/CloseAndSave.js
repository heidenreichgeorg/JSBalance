
        // 20220424
        // character count for notmal columns
        let iCpField = 16;
        var page;
        var accountPages={};
        var cCent=0;

        var gResponse;
        var gAccounts;
        var gHistory;
        var gSchema;
        var gAssets;

        var paramString;
    
        
        function putResponse(strTarget,strText) {       

            console.log('1000 CloseAndSave '+strTarget);
            paramString = strTarget.split('?')[1];

            gResponse = JSON.parse(strText);

            let gReport  = gResponse[D_Report];

            gHistory  = gResponse[D_History];
            gAccounts= gResponse[D_Balance];
            gSchema  = gResponse[D_Schema];
            gAssets = gResponse[D_FixAss];
            page = gResponse[D_Page];
            
            if(gSchema) {
                var author=gSchema.author;
                var residence=gSchema.residence;
                var iban=gSchema.iban;
                var register=gSchema.register;
                var taxnumber=gSchema.taxnumber;
                var reportYear=gSchema.reportYear;
                var client=gSchema.client;
                
                var cDisplay = document.getElementById("display");
                cDisplay.innerHTML = page["Closing"];

                /*
                var welcome = document.getElementById("welcome");
                welcome.innerHTML = "<DIV class='L120'>"+client
                +"</DIV><DIV class='L220'>"+register+"&nbsp;"+taxnumber
                +"</DIV><DIV class='L220'>"+iban+"&nbsp;"+reportYear
                +"</DIV><DIV class='L220'>"+author+"&nbsp; "+residence
                    +'</DIV><DIV class="C100"><button id="read-button" onclick="bookTax()" )>NEXT</button> '
                +"</DIV>";
                */
            }
            console.log('Schema='+JSON.stringify(gSchema));

            var txnTable = [];                

            // build history from given account as a prompt list
            if(gSchema && gSchema.Names && gSchema.Names.length>0) {
                var parts=gSchema.Names;

                let closing = JSON.parse(gReport.xbrlIncome.closing); //.split(CSEP);

                var jInfo = closing; // { "date":closing[1], "sender":closing[2], "refAcct":closing[3], "svwz":closing[4], "svwz2":closing[5], "credit":[], "debit":[]  };

                txnTable.push('<DIV class="attrLine">'
                +'<div class="L22" >&nbsp;</div>'
                +'<div class="C100" id="date" value="'+jInfo.date+'">'+jInfo.date+'</div>'
                +'<DIV class="L120">'+jInfo.sender+'</DIV>'      
                +'<DIV class="L120">'+jInfo.refAcct+'</DIV>'
                +'<DIV class="L120">'+jInfo.svwz+'</DIV>'
                +'<DIV class="L120">'+jInfo.svwz2+'</DIV>'
                +'</DIV>');


                var aTable = document.getElementById('selAccount');
                if(aTable) aTable.innerHTML = txnTable.join("");

                creditList= jInfo.credit;
                console.log("CREDIT = "+JSON.stringify(creditList));

                debitList = jInfo.debit;
                console.log("DEBIT = "+JSON.stringify(debitList));

                // override other year 
                jInfo.flag = 1;

                showClose(validateCD(creditList,debitList),'downloadJSON');
            
            }               
        }

    
        function download(event) {
            console.log("1100 CloseAndSave Download ENTER with paramstring="+paramString);
            handleEvent(event);
            let sessionId = paramString.split('=')[1];
            console.log("1110 CloseAndSave sessionId = "+sessionId);
            
            let jInfo = { "sessionId" :sessionId };
            let sInfo = JSON.stringify(jInfo);
            // 20220509 postToServer("SAVE",  sInfo  );
            postAndDisplay("SAVE",  jInfo , 80 ); // writes CLSX file, no JSON

            console.log("1190 CloseAndSave Download EXIT");
            // closeWindow();
        }
    
        function downloadJSON(event) {
            console.log("1200 CloseAndSave downloadJSON ENTER with paramstring="+paramString);
            handleEvent(event);
            let sessionId = paramString.split('=')[1];
            console.log("1210 CloseAndSave downloadJSON sessionId = "+sessionId);
            

            //(A) sk the server
            //let jInfo = { "sessionId" :sessionId };
            //let sInfo = JSON.stringify(jInfo);
            // 20220509 postToServer("SAVE",  sInfo  );
            // postAndDisplay("DOWNLOAD",  jInfo , 80 ); // writes CLSX file, no JSON


            window.open('/DOWNLOAD?sessionId='+sessionId);


            console.log("1290 CloseAndSave downloadJSON EXIT");
            // closeWindow();
        }


        function closeWindow() {
            console.log("1300 CloseAndSave Close IN");
            window.close();
            console.log("1310 CloseAndSave Close OUT");
        }

