
        <SCRIPT type="text/javascript" src="/client.js"></SCRIPT>


            let debug=null;

                        
            function putResponse(strTarget,strText) {       

                var response = JSON.parse(strText);
                var jReport = response[D_Report];
                var gSchema = response[D_Schema];
                if(gSchema) {
                    var author=gSchema.author;
                    var residence=gSchema.residence;
                    var iban=gSchema.iban;
                    var register=gSchema.register;
                    var taxnumber=gSchema.taxnumber;
                    var reportYear=gSchema.reportYear;
                    var client=gSchema.client;

                    var welcome = document.getElementById("welcome");
                    welcome.innerHTML = "<DIV class='L220'>&nbsp;"
                        +"</DIV><DIV class='L220'>"+client
                    +"</DIV><DIV class='L220'>"+register+"&nbsp;"+taxnumber
                    +"</DIV><DIV class='L220'>&nbsp;"
                        +"</DIV><DIV class='L220'>"+iban+"&nbsp;"+reportYear
                    +"</DIV><DIV class='L220'>"+author+"&nbsp;"+residence
                    +"</DIV>";
                }
                var result = [];

                for (let tag in jReport)   {
                    var element = jReport[tag];
                    var account=element.account;
                    var gross = account.gross;
                    var iName = account.name;
                    var full_xbrl = account.xbrl;
                    var xbrl = full_xbrl.split('\.');
                    var xbrl_pre = xbrl.pop()+'.'+xbrl.pop()+'.'+xbrl.pop();

                    if(gross && iName && xbrl) {
                        result.push('<DIV class="attrLine"><DIV class="L120">'+iName
                                        +'</DIV><DIV class="R110">'+gross
                                        +'</DIV><DIV class="L22">&nbsp'
                                        +'</DIV><DIV class="C280">'+xbrl_pre
                                        +'</DIV></DIV>');
                    } else {
                        // ERROR out
                        result.push('<DIV class="attrLine">'+JSON.stringify(account)+'</DIV>');
                    }
                }


                var eText = document.getElementById('strText');
                if(eText) eText.innerHTML = barLabels.join(" ");

                var eTarget = document.getElementById('strTarget');
                if(eTarget) eTarget.innerHTML = barData.join(" ");

                var eBalance = document.getElementById('strBalance');
                if(eBalance) eBalance.innerHTML = result.join("");

                var eHistory = document.getElementById('PageContent');
                if(eHistory) eHistory.innerHTML = result.join("");

            }  
