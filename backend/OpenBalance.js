
        <SCRIPT type="text/javascript" src="/client.js"></SCRIPT>

            let debug=null;       
                        
            function putResponse(strTarget,strText) {       

                var response = JSON.parse(strText);

                var gSchema = response[D_Schema];
                let page = response[D_Page];

                let headerInfo = '<DIV class="C280">'+page["AcctOpen"]+'</DIV><DIV class="C280">'+page["header"]+'</DIV>';
                var htmlPage = createPage(['L175','R110','L22','L280'],"<DIV class='attrLine'>"+headerInfo+"</DIV>",'PageContent');
                var cursor=htmlPage;

                console.log(JSON.stringify(page))

                var jAccounts = response[D_Balance];
                for (let name in jAccounts)   {
                    cursor=display(cursor,name,jAccounts[name]);            
                }

                var jReport = response[D_Report];
                for (let name in jReport)   {
                    cursor=display(cursor,name,jReport[name].account);            
                }

                setTrailer(page, cursor);
                setScreen(document,htmlPage);


            }  

            function display(cursor,name,account) { 

                var init = account.init;
                var iName = account.name;
                var full_xbrl = account.xbrl;
                var desc = account.desc; // xbrl.pop()+'.'+xbrl.pop()+'.'+xbrl.pop();

                if(init && iName && full_xbrl) {
                    
                    cursor=printFormat(cursor,[iName,init,'&nbsp;',(desc?desc:".")]);

                } else {
                    // ERROR out
                    console.log(JSON.stringify(account));
                    //result.push('<DIV class="attrLine">'+JSON.stringify(account)+'</DIV>');
                }

                return cursor;
            }
