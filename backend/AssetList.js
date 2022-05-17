
        <SCRIPT type="text/javascript" src="/client.js"></SCRIPT>
        <SCRIPT type="text/javascript" src="/money.js"></SCRIPT>

        <pre id="strIdent"></pre>
       


            let debug=null;

            var gResponse;
            var gAccounts;
            var gHistory;
            var gSchema;
            var gAssets;

            var cNominal=0;
            var cCurrent=0;

           
                        
            function putResponse(strTarget,strText) {       

                gResponse = JSON.parse(strText);

                gHistory  = gResponse[D_History];
                gAccounts= gResponse[D_Balance];
                gSchema  = gResponse[D_Schema];
                let page = gResponse[D_Page];

                
                let headerInfo = '<DIV class="L280">'+page["Assets"]+'</DIV><DIV class="L280">'+page["header"]+'</DIV>';
                

                var htmlPage = createPage(['C100','L175','C100','R110','R110','R110','R110'],"<DIV class='attrLine'>"+headerInfo+"</DIV>",'PageContent');
                var cursor=htmlPage;

                gAssets = gResponse[D_FixAss];
                
        	    console.log('Schema='+JSON.stringify(gSchema));


                if(gSchema) {
                    var reportYear=gSchema.reportYear;
                    
                    printFormat(cursor,[reportYear,page['AssetIdent'],page['AssetType'],page['AssetCost'],page['AssetNumber'],page['AssetRemain'],page['AssetPrice']]);
                }
                // TEST
                var balElements = [];                
                
                if(gAssets) {



                    for (let ident in gAssets)   {
                        
                            console.log("Anlage "+ident+"  "+JSON.stringify(gAssets[ident]));

                            var date = gAssets[ident].date;

                            var type = gAssets[ident].type;

                            var init = gAssets[ident].init;

                            var nmbr = gAssets[ident].nmbr;

                            var rest = gAssets[ident].rest;

                            if(rest && rest.length>0) cCurrent += parseInt(rest.replace('.','').replace(',',''));

                            var cost = gAssets[ident].cost;
                                                
                            printFormat(cursor,[date,ident,type,init,nmbr,rest,cost]);
                    }

                   printFormat(cursor,['Gesamt',timeSymbol(),'&nbsp;','&nbsp;','&nbsp;',cents2EU(cCurrent),'&nbsp;']);


                } else  console.log('Assets --> '+JSON.stringify(gAssets));

                var eBalance = document.getElementById('strIdent');
                if(eBalance) eBalance.innerHTML = balElements.join("");

                setTrailer(page, cursor);
                setScreen(document,htmlPage);
            }  
       