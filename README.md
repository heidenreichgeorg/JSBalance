# JSBalance

# Server process reads TABLE (e.g. MS Excel (TM)) with accounting history in Euros and then produces the account history for each account plus balances plus some reports

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
# Subsequent columns shall be for Equity/Liability accounts, 
# preferably starting with long-term liabilities, short-term liabilities, then short-term-equity and then fixed equity

# Assumptions Excel Rows
# The first rows are for defining the account names and types

# Column 'A' is a control letter for the line type
# . indicates a comment
# N with N being some positive integer indicates a booking transaction
# 1 should be the number used for the initital account opening statement
# C is for comments 
# N is for the account names, where 'C' has the contact person's full name and 'D' the entities legal residence address
# I is for the entity info, where 'B' has the primary entity IBAN, 'C' the company registry number, 'D' the entity tax number
# K is the internal account number (identifies the type of account), where 'C' is the reporting year  and 'D' the entity's legal name
# S is the share percentage of partner accounts where 'C' has the integer value of 100
# R is a report indicator with empty or 'x' - indicting that this account is on a summary report
# E is (K-derived) the equity xbrl use for partner accounts - with de-gaap-ci_table.kke.allKindsOfEquityAccounts.(un)limitedPartners.KK .FK .VK
# X is (K-derived) the general xbrl
# P is the partner name
# A is a fixed asset initial statement for that fiscal year
#   where 'B' is the date, 'C'=AssetName, 'D'=PurchasingCost, 'E'=NumberOfItems, and the related account column holds the current balance value



# Assumptions Server
#  TABLE file name syntax BOOK_<CLIENT><YEAR>.xlsx
# fiscal year runs from 01/01 to 12/31
# all amounts are in Euros, column for the cents fraction and . for powers of thousands 
