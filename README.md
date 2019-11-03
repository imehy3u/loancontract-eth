# Ethereum based smart contract P2P loan contract -- Working in progress

Allow to create a decentralize finance platform to allow user to be both lender and borrower. It also have a secondary market to allow lender or borrower trade their existing loan.

# Features

**Create Lend**

Allow user to create a loan which defines the following parameter:
- Public key address of lenders
- enum for loan { smart contract address, amount, loan expiry }
- enum for interest { interest percentage, interest period }

**Close Lend**

Allow user to close their existing loan which defines the following parameter:
- Public key address of lenders
- Loan id 

**Borrow Lend**

Allow user to subscribe to the loan which defines the following parameter:
- Public key address of borrower
- Loan id
- enum for sub-loan {smart contract address, amount}

**Close Borrow**

Allow the borrower to close their loan which defines the following parameter:
- Public key address of borrower
- Loan id

**Repay Interest**

Allow the borrower to repay the interest which defines the following parameter:
- Public key address of borrower
- Loan id
- enum for interest amount {smart contract address, amount}

**Calculate Interest**

Allow to calculate the interest amount of loan which defines the following parameter:
- Public key address of borrower (nullable)
- Public key address of lender (nullable)

**P2P Loan Offer**

Allow lender to sell their loan to another user which defines by the following parameter:
- Public key address of lender 
- enum for loan amount { smart contract address, amount }

**Close P2P Loan Offer**

Allow owner's of P2P loan offer to close loan which defines by the following parameter:
- Public key address of lender
- P2P loan id

**Transfer P2P Loan**

Allow the transfer of P2P loan which defines by the following parameter:
- Public key address of new lender
- P2P loan id

**Get All Loan Contract**

Allow to extract all the loan contract

**Set Fees**

Allow the owner of the contract to set fees which defines by the following parameter:
- Percentage of the fees
