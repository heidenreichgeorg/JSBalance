# JSBalance
JS-based

# Server process reads TABLE (e.g. MS Excel (TM)) with accounting history and processes account history and balances plus some reports
# In the TABLE a single page ('tab') is for one entity and one fiscal year 
# Each row in TABLE page is a transaction
# TABLE row has one column per account

#Assumptions Excel
#The first six columns are for information on the specific transaction
#Column 'A' is a simple hash code that may be used as a signature for that transaction
#Column 'B' is the date of the transaction
#Column 'C' should be the money sender or money recipient 
#Column 'D' should be the Equity/Liability/Gain/Cost account that is affected
#Column 'E' should be the reason or keyword for the transaction
#Column 'F' should be the referring date interval e.g.month/quarter/year or an external identification code for that transaction 


#Assumptions Server
#fiscal year runs from 01/01 to 12/31
