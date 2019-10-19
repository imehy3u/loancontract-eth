const EthLoan = artifacts.require("EthLoan");

contract("EthLoan", accounts => {
  let instance 
  let owner = accounts[0]
  let account = accounts[1]
  let blockNumber = 0

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
    console.log(no_pair);
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

});