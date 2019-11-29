const EthLoan = artifacts.require("EthLoan");

contract("EthLoan", accounts => {
  let instance;
  let owner = accounts[0];
  let account = accounts[1];
  let testaccount = accounts[2];
  let blockNumber = 0;
  let loanAddr;
  let allLendAddr;

  beforeEach(async () => {
    instance = await EthLoan.deployed();
  })
  
  it("should acccess to contract with block number available.", async () => {
    blockNumber = await instance.getBlock();
    assert(blockNumber>0 && blockNumber != null,'Block number should not be null or 0');
  });

  it("adding pairing - owner", async () => {
    let errorMsg;
    try {
      await instance.addPairing('0x0000000000000000000000000000000000000000','0x0000000000000000000000000000000000000000','ETH/ETH',{from: owner});
    }
    catch(e){
      errorMsg = e;
    }
    assert(errorMsg == null,'adding pairing - owner. This should not fail' );

  });

  it("adding pairing - account", async () => {
    let errorMsg;
    try{
      await instance.addPairing('0x0000000000000000000000000000000000000000','0x0000000000000000000000000000000000000000','ETH/ETH',{from: account});
    }
    catch(e) {
      errorMsg = e;
    }
 
    assert(errorMsg != null,'adding pairing - account. This should fail' );

  });

  it("adding pairing 2 - owner", async () => {
    let errorMsg;
    try {
      await instance.addPairing('0x0000000000000000000000000000000000000001','0x0000000000000000000000000000000000000001','ETH/ETH Sample',{from: owner});
    }
    catch(e){
      errorMsg = e;
    }
    assert(errorMsg == null,'adding pairing 2 - owner. This should not fail' );

  });

  it("get no. of pairing", async () => {

    let no_pair = await instance.getNoPairing();
    //console.log(no_pair);
    assert(no_pair == 2,no_pair +' Pair is not correct, should be 2 pair')

  });

  it("deactive pair - owner", async () => {
    let errorMsg;
    try {
      await instance.deactivePairing(1,{from: owner});
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'Deactive pair - owner. This should not fail. Error:'+errorMsg);
    let no_pair = await instance.getNoPairingActive();
    assert(no_pair==1,no_pair +' no. of pair is not correct, should be 1 pair');
  });

  it("active pair - account", async () => {
    let errorMsg;
    try {
      await instance.activePairing(1,{from: account});
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg != null,'active pair - account. This should fail. Error:'+errorMsg);
    let no_pair = await instance.getNoPairingActive();
    assert(no_pair == 1,no_pair +' no. of pair is not correct, should be 1 pair');
  });

  it("active pair - owner", async () => {
    let errorMsg;
    try {
      await instance.activePairing(1,{from: owner});
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'active pair - owner. This should not fail. Error: '+errorMsg);
    let no_pair = await instance.getNoPairingActive();
    assert(no_pair==2,no_pair +' no. of pair is not correct, should be 2 pair');
  });
  
  it("deactive pair - account", async () => {
    let errorMsg;
    try {
      await instance.deactivePairing(1,{from: account});
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg != null,'Deactive pair - account. This should fail. Error:'+errorMsg);
    let no_pair = await instance.getNoPairingActive();
    assert(no_pair==2,no_pair +' no. of pair is not correct, should be 2 pair');
  });

  it("get owner id", async () => {
    let errorMsg;
    let unique_addr;
    try {
      unique_addr = await instance.getOwner();
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'get owner id. Error:'+unique_addr);

  });

  it("get unique id", async () => {
    let errorMsg;
    let unique_addr ;
    try {
      unique_addr = await instance.getUniqueId();
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'get unique id. Error:'+errorMsg);
    assert(unique_addr != null,' Unique ID should not be null ');

  });

  it("get check pairing id single - true", async () => {
    let errorMsg;
    let check_pair ;
    try {
      check_pair = await instance.checkPairing([0]);
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'get check pairing id. Error:'+errorMsg);
    assert(check_pair == true,'check_pair should not be false ');

  });

  it("get check pairing id single - false", async () => {
    let errorMsg;
    let check_pair ;
    try {
      check_pair = await instance.checkPairing([2]);
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'get check pairing id. Error:'+errorMsg);
    assert(check_pair == false,'check_pair should not be true ');

  });
  
  it("get check pairing id multi - true", async () => {
    let errorMsg;
    let check_pair ;
    try {
      check_pair = await instance.checkPairing([0,1]);
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'get check pairing id. Error:'+errorMsg);
    assert(check_pair == true,'check_pair should not be false ');

  });

  it("get check pairing id multi - false", async () => {
    let errorMsg;
    let check_pair ;
    try {
      check_pair = await instance.checkPairing([0,2]);
    }
    catch(e) {
      errorMsg = e;
    }
    assert(errorMsg == null,'get check pairing id. Error:'+errorMsg);
    assert(check_pair == false,'check_pair should not be true ');

  });

  it('create new lend - owner - success', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+1500000000000000000;
    try{
      contract_val = await instance.getContractBalance();
      console.log('before contract bal:'+contract_val);
      await instance.newLend(90,100, temp, 1, [0],{from: owner,value: 1.51e+18});
    }catch(e){
      errorMsg = e;
    }
    assert(errorMsg == null,'create new lend - owner - success. Error:'+errorMsg);
    contract_val = await instance.getContractBalance();
      console.log('after contract bal:'+contract_val);
  });

  it('create new lend - owner - fail', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+1500000000000000000;
    let expectError = 'Error: Returned error: VM Exception while processing transaction: revert  Message value should be more than the issue amount -- Reason given:  Message value should be more than the issue amount';
    try{
      contract_val = await instance.getContractBalance();
      console.log('before contract bal:'+contract_val);
      await instance.newLend(90,100, temp, 1, [0],{from: owner,value: 1.49e+18});
    }catch(e){
      errorMsg = e;
    }
    assert(errorMsg != expectError,'create new lend - owner - fail. Error:'+errorMsg);
    contract_val = await instance.getContractBalance();
      console.log('after contract bal:'+contract_val);
  });

  it('create new lend 2 - account - success', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+1000000000000000000;
    try{
      contract_val = await instance.getContractBalance();
      console.log('before contract bal:'+contract_val);
      await instance.newLend(70,100, temp, 1, [0],{from: account,value: 1.000000001e+18});
    }catch(e){
      errorMsg = e;
    }
    assert(errorMsg == null,'create new lend 2 - account - success. Error:'+errorMsg);
    contract_val = await instance.getContractBalance();
      console.log('after contract bal:'+contract_val);
  });

  it('create new lend 3 - testaccount - success', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+1800000000000000000;
    try{
      contract_val = await instance.getContractBalance();
      await instance.newLend(90,100, temp, 1, [0],{from: testaccount,value: 1.800000001e+18});
    }catch(e){
      errorMsg = e;
    }
    assert(errorMsg == null,'create new lend 3 - testaccount - success. Error:'+errorMsg);
    contract_val = await instance.getContractBalance();
      console.log('after contract bal:'+contract_val);
  });

  it('get all lend', async () =>{
    allLendAddr = await instance.getAllLend();
    console.log(allLendAddr);
  });

  it('check lend - success', async () => {
    
    let checkLendList = await instance.checkLend(allLendAddr[0]);
    //console.log(checkLendList);
    assert(checkLendList[0] != '0x0000000000000000000000000000000000000000','check lend - success. No lend found');

  });

  it('check lend - fail', async () => {
    let checkLendList = await instance.checkLend('0x63cE6a8f0cDB34E092CDA1374d6599fb83F3d382');
    //console.log(checkLendList);
    assert(checkLendList[0] == '0x0000000000000000000000000000000000000000','check lend - success. No lend found');

  });
  
  it('check active borrower - false', async () => {
    let checkActiveBorrower = await instance.checkActiveBorrower(allLendAddr[0]);
    //console.log(checkActiveBorrower);
    assert(checkActiveBorrower == false,'check active borrower - false. Should be false.');
  });

  it('check close lend - false', async () => {
    let errorMsg;
    let contract_val;
    try{
      await instance.closeLend('0x63cE6a8f0cDB34E092CDA1374d6599fb83F3d382');
    }catch(e){
      errorMsg = e;
    }
    assert(errorMsg != null,'check close lend - false. Error:'+errorMsg);
  });

  it('check close lend - true - testaccount', async () => {
    let errorMsg;
    let contract_val;
    
    
    try{
      await instance.closeLend(allLendAddr[2],{from: testaccount}).then(function(tempvar){console.log(tempvar)});
    }catch(e){
      errorMsg = e;
    }
    
    assert(errorMsg == null,'check close lend - false. Error:'+errorMsg);
  });

  it('check borrow lend - false - amt> msg value', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+1000000000000000000;
    try{
      await instance.borrowLend(allLendAddr[0],temp,0,{from: account,value: 0.90000000e+18});

    }catch(e){
      errorMsg = e;
    }
    //console.log(errorMsg)
    assert(errorMsg != null,'check borrow lend - false - amt> msg value. Error:'+errorMsg);
  });

  it('check borrow lend - false - status inactive', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+1000000000000000000;
    try{
      await instance.borrowLend(allLendAddr[2],temp,0,{from: account,value: 1.10000000e+18});

    }catch(e){
      errorMsg = e;
    }
    //console.log(errorMsg)
    assert(errorMsg != null,'check borrow lend - false - status inactive. Error:'+errorMsg);
  });

  it('check borrow lend - false - available value < borrow value', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+2000000000000000000;
    try{
      await instance.borrowLend(allLendAddr[0],temp,0,{from: account,value: 2.10000000e+18});

    }catch(e){
      errorMsg = e;
    }
    //console.log(errorMsg)
    assert(errorMsg != null,'check borrow lend - available value < borrow value. Error:'+errorMsg);
  });

  it('check borrow lend - true', async () => {
    let errorMsg;
    let contract_val;
    let temp = ""+800000000000000000;
    try{
      await instance.borrowLend(allLendAddr[0],temp,0,{from: account,value: 1.0000001e+18});

    }catch(e){
      errorMsg = e;
    }
    //console.log(errorMsg)
    assert(errorMsg == null,'check borrow lend. Error:'+errorMsg);
  });

  it('check interest amount', async () => {
    
  });

});