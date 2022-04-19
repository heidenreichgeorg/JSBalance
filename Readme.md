# JSBalance

# Server process reads TABLE (e.g. MS Excel (TM)) with accounting history and then produces the account history for each account plus balances plus some reports

# Each TABLE is used for a single legal entity, tabs/pages are for the various fiscal years
# In the TABLE a single page ('tab') is for one entity and one fiscal year 
# Each row in TABLE page is a transaction
# where each TABLE row has one column per account

# Assumptions Excel Columns
# The first six columns are for information on the specific transaction
# Column  'A' is a simple hash code that may be used as a signature for that transaction
# Column  'B' is the date of the transaction
# Column  'C' should be the money sender or money recipient 
# Column  'D' should be the Equity/Liability/Gain/Cost account that is affected
# Column  'E' should be the reason or keyword for the transaction
# Column  'F' should be the referring date interval e.g.month/quarter/year or an external identification code for that transaction 
# Columns 'G' on shall be asset accounts, preferably starting with fixed assets then currecny assets and then claims
# The limiting columns is then called ASSETS
# Subsequent columns shall be for Gain/Loss accounts i.e. revenues and cost
# The limiting columns is then called EQLIAB
# Subsequent columns shall be for Equity/Liabilty accounts, 
# preferably starting with long-term liabilities, short-term liabilities, then short-term-equity and then fixed equity

# Assumptions Excel Columns
# The first rows are for deffining the account names and types


# Assumptions Server
# fiscal year runs from 01/01 to 12/31
