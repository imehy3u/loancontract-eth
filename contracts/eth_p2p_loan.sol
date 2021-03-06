pragma solidity ^0.5.12;
pragma experimental ABIEncoderV2;

contract EthLoan {
    string value;

    enum PaymentTerm{WEEKLY,MONTHLY,QUARTERLY,YEARLY}
    enum TransactionType{NEW,REPAY,CLOSE,UPDATE,DEFAULT}
    enum BorrowStatus{ACTIVE,INACTIVE,LATE}
    enum LendStatus{ACTIVE,RUNNING,INACTIVE,SUSPEND}

    struct Pairing {
        address baseCurry;
        address counterCurry;
        string desc;
        uint8 active;
    }

    struct Lend{
        address lendAddress;
        uint ltv; //1-100
        uint interest; // 100 basis point = 1 percent
        uint issueAmt; // wei - 1 eth = 1,000,000,000,000,000,000 wei
        uint currentAmt; // wei
        PaymentTerm paymentTerm;
        uint endDate;
        uint startDate;
        uint[] pairing;
        LendStatus lendStatus;
    }

    struct Borrow{
        address borrowAddress;
        uint exchRate;
        address lendId;
        uint borrowAmt;
        //Pairing pairing;
        uint pairing;
        BorrowStatus borrowStatus; //A - Active, I - Inactive, L - Late
        uint borrowStartDate;
        uint borrowEndDate;
        uint lastPaymentDate;
        uint nextPaymentDateBy;
        uint collatAmt;
    }

    struct Transaction{
        uint lendId;
        uint borrowId;
        uint exchRate;
        TransactionType transactionType;
        uint transactionAmt;
        uint pairing;
    }

    mapping (address => Lend) lends;
    //mapping (address => Pairing) pairs;
    mapping (address => Borrow) borrows;
    mapping (address => Transaction) transactions;
    address[] public lendList;
    uint[] public pairing;//address[] public pairing;
    address[] public borrowList;
    address[] public transactionList;
    mapping (address => uint) activeLoan;
    mapping (uint => Pairing) pair;

    address owner;
    uint16 dayCount = 360;
    uint lateCharge = 200; // 200 basis point = 2 percent
    uint epochDay = 86400; // 60 x 60 x 24 = Epoch day
    uint precision;

    constructor() public {
        value = "constructor value";
        owner = msg.sender;
        precision = 4;
       // pairing.push(Pairing(0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,'ETH/ETH',1));
    }

    event newLendCreated(Lend);
    event newBorrowCreated(Borrow);
    event interestPayment(address _lendId,address _borrowId);
    event closeLendCreated(address _lendId, uint _lendStatus);
    event closeBorrowCreated(address _borrowId, uint _borrowStatus);

    function checkExistsPairing(address _baseCurry, address _counterCurry) public view returns (uint8){
        for (uint i; i < pairing.length;i++){
            if (pair[i].baseCurry==_baseCurry && pair[i].counterCurry==_counterCurry)
                return 1;
        }
        return 0;
    }

    function addPairing(address _baseCurry, address _counterCurry, string memory _desc) public {
        require(msg.sender == owner,'Only contract owner can add new supported pairing');
        uint noPair = pairing.length;
        if(noPair == 0 || checkExistsPairing(_baseCurry,_counterCurry) == 0){
            pair[noPair] = Pairing(_baseCurry,_counterCurry,_desc,1);
            pairing.push(noPair);
        }
    }

    function getNoPairing() public view returns(uint) {
        return pairing.length;
    }

    function deactivePairing(uint _index) public {
        require(msg.sender == owner,'Only contract owner can deactive pairing support');
        require(pairing.length > _index, 'Invalid pairing index.');
        pair[_index].active = 0;
    }

    function getNoPairingActive() public view returns(uint) {
        require(pairing.length > 0,'No Pairing exists');
        uint counter = 0;
        for(uint i = 0;i<pairing.length;i++) {
            if(pair[i].active == 1)
                counter++;
        }
        return counter;
    }

    function activePairing(uint _index) public {
        require(msg.sender == owner,'Only contract owner can active pairing support');
        require(pairing.length >= _index, 'Invalid pairing index.');
        pair[_index].active = 1;
    }

    function getBlock() public view returns (uint) {
        return block.timestamp;
    }

    function getOwner() public view returns(address){
        return owner;
    }

    function getContractBalance() public view returns(uint){
        return address(this).balance;
    }

    function getUniqueId() public view returns (address) {
        bytes20 b = bytes20(keccak256(abi.encodePacked(msg.sender, now)));
        uint addr = 0;
        for (uint index = b.length-1; index+1 > 0; index--) {
            addr += uint(uint8(b[index])) * ( 16 ** ((b.length - index - 1) * 2));
        }
        //to-do check if address exists

        return address(addr);
    }

    function checkPairing(uint[] memory _pairingList) public view returns(bool) {
        bool check = false;
        if(pairing.length != 0 && _pairingList.length != 0){
            for(uint i = 0; i<_pairingList.length;i++) {
                if(pair[_pairingList[i]].active == 1)
                    check = true;
                else {
                    check = false;
                    break;
                }
            }
        }
        return check;
    }

    function newLend(uint _ltv,uint _interest, uint _issueAmt, uint _paymentTerm, uint[] memory _pairingList ) public payable {
        require(msg.value > _issueAmt,' Message value should be more than the issue amount');
        require(_ltv < 100, ' LTV should be less than and equal 100');
        require(checkPairing(_pairingList) == true, 'Invalid pairing');
        require(_paymentTerm >= 0 && _paymentTerm<=3, 'Invalid Payment Term');
        address tempAddr = getUniqueId();

        lends[tempAddr] = Lend(msg.sender,_ltv,_interest,_issueAmt,_issueAmt,PaymentTerm(_paymentTerm),2147483647,now,_pairingList,LendStatus.ACTIVE);

        lendList.push(tempAddr);
        activeLoan[tempAddr] = 0;
        emit newLendCreated(lends[tempAddr]);
    }

    function checkLend(address _address) public view returns (address, uint,uint,uint,uint,uint,uint,uint,uint[] memory,uint) {
        Lend memory tempLend = lends[_address];
        return (tempLend.lendAddress,tempLend.ltv,tempLend.interest,tempLend.issueAmt,tempLend.currentAmt,uint(tempLend.paymentTerm),
            tempLend.endDate,tempLend.startDate,tempLend.pairing,uint(tempLend.lendStatus));
    }

    function getLendInfo(address _address) external view returns(Lend memory) {
        return lends[_address];
    }

    function getAllLend() external view returns (address[] memory) {
        return lendList;
    }

    function checkActiveBorrower(address _address) public view returns(bool) {
        Lend memory tempLend = lends[_address];
        if(tempLend.lendStatus == LendStatus.RUNNING || activeLoan[_address] > 0) {
            return true;
        }
        return false;
    }

    function closeLend(address _lendId) public payable {
        //Lend memory tempLend = lends[_lendId];
        require(msg.sender == lends[_lendId].lendAddress,'Only lend owner can close the loan.');
        require(lends[_lendId].lendStatus != LendStatus.INACTIVE, ' Loan not active');
        //to-do only allow if there is no active borrower in loan account
        if(lends[_lendId].lendStatus == LendStatus.ACTIVE && lends[_lendId].currentAmt > 0) {
            lends[_lendId].lendStatus = LendStatus.INACTIVE;
            msg.sender.transfer(lends[_lendId].currentAmt);
            lends[_lendId].currentAmt = 0;
        }
        else if (lends[_lendId].lendStatus == LendStatus.RUNNING) {
            lends[_lendId].lendStatus = LendStatus.SUSPEND;
        }
        else if (lends[_lendId].lendStatus == LendStatus.SUSPEND && activeLoan[_lendId] == 0){
            lends[_lendId].lendStatus = LendStatus.INACTIVE;
            msg.sender.transfer(lends[_lendId].currentAmt);
            lends[_lendId].currentAmt = 0;
        }

        emit closeLendCreated(_lendId,uint(lends[_lendId].lendStatus));
    }

    function checkpairingExist(address _lendId,uint _pairingId)  private view returns (bool) {
        for(uint i = 0; i<lends[_lendId].pairing.length; i++) {
            if(lends[_lendId].pairing[i] == _pairingId) {
                return true;
            }
        }
        return false;
    }

    //Date Related Section - Start
    function calcNextDay(uint _epoch) public view returns (uint) {
        uint x = addmod(_epoch,0,epochDay);
        return (_epoch - x + epochDay);
    }

    function calcStartDay(uint _epoch) public view returns(uint) {
        return (_epoch - addmod(_epoch,0,epochDay));
    }

    function calcNextCycle(uint _epoch,uint _period) public view returns(uint) {
        uint nextCycle = 0;
        do {
           nextCycle = (calcNextDay(_epoch) + (convertDayToEpoch(_period)));
        }while(nextCycle <= calcStartDay(_epoch));
        return nextCycle;
    }

    function getPaymentDay(uint _payTerm) private pure returns (uint) {
        if (_payTerm == 0)
            return 7;
        else if (_payTerm == 1)
            return 30;
        else if (_payTerm == 2)
            return 90;
        else if (_payTerm == 3)
            return 180;
        else
            return 360;
    }

    function convertDayToEpoch(uint _day) public pure returns(uint) {
        return uint(_day*60*60*24);
    }

    //Date Related Section - End

    function calcCollatAmt(uint _lendAmt,uint _ltv) public pure returns (uint) {
        return (10000/_ltv * _lendAmt)/100;
    }

    function borrowLend(address _lendId, uint _lendAmt, uint _pairingId, uint _epoch) public payable {
        //require(msg.value > _lendAmt, 'Message value must be more than lend amount');
        require(lends[_lendId].lendStatus == LendStatus.ACTIVE || lends[_lendId].lendStatus == LendStatus.RUNNING, ' Lend account is inactive/suspended');
        require(_lendAmt <= lends[_lendId].currentAmt && _lendAmt <= lends[_lendId].issueAmt,' Lend amount cannot be more than issue amount and current amount');
        require(msg.value >= calcCollatAmt(_lendAmt,lends[_lendId].ltv), 'Message value have to be more than the loan to value amount of lend amount');
        require(checkpairingExist(_lendId,_pairingId) == true, 'Pairing must exists');
        if(lends[_lendId].lendStatus == LendStatus.ACTIVE) {
            lends[_lendId].lendStatus = LendStatus.RUNNING;
        }

        lends[_lendId].currentAmt -= _lendAmt;
        msg.sender.transfer(_lendAmt);
        uint current = block.timestamp;
        if(_epoch > 0 && _epoch < current)
            current = _epoch;
        address tempAddr = getUniqueId();
        borrows[tempAddr] = Borrow(msg.sender,1,_lendId,_lendAmt,_pairingId,BorrowStatus.ACTIVE,current,2147483647,current,
        calcNextCycle(current,getPaymentDay(uint(lends[_lendId].paymentTerm))),calcCollatAmt(_lendAmt,lends[_lendId].ltv));

        borrowList.push(tempAddr);
        activeLoan[tempAddr] += 1;

        emit newBorrowCreated(borrows[tempAddr]);
    }

    //Calculate interest - Start
    function division(uint _numerator, uint _denominator) public view returns(uint) {

         // caution, check safe-to-multiply here
        uint numerator = ( _numerator * 10 ** ( precision + 1 ));
        // with rounding of last digit
        uint quotient = ((numerator / _denominator) + 5) / 10;
        return quotient;
    }

    function interestAmt(uint _interest,uint _payTerm,uint _borrowAmt) public view returns (uint) {
        if(_borrowAmt == 0) {
            return 0;
        }
        uint period = getPaymentDay(_payTerm);
        uint calcInterest = uint((division(_interest,100) * division(period,dayCount) * _borrowAmt/10000000000));
        return calcInterest ;
    }

    function lateInterestAmt(uint _interest,uint _payTerm,uint _borrowAmt,uint _lastPaymentDate, uint _currentEpoch) public view returns(uint) {
        uint period = convertDayToEpoch(getPaymentDay(_payTerm));
        uint currentEpoch;
        if(_currentEpoch == 0)
            currentEpoch = block.timestamp;
        else
            currentEpoch = _currentEpoch;
        if((_lastPaymentDate + period) < currentEpoch ) {
            uint accurIntrDay = currentEpoch - _lastPaymentDate - period;
            uint numLateDays = accurIntrDay / 86400;
            uint lateFee = uint(division(numLateDays,dayCount) * division(_interest+lateCharge,100) * _borrowAmt/ 10000000000);
            return lateFee;
        }
        return 0;
    }

    function totalInterestAmt(uint _interest,uint _payTerm,uint _borrowAmt,uint _lastPaymentDate, uint _current) public view returns (uint) {
        return (interestAmt(_interest,_payTerm,_borrowAmt) + lateInterestAmt(_interest,_payTerm,_borrowAmt,_lastPaymentDate,_current));
    }

    //Calculate interest - End

    function getAllBorrow() external view returns (address[] memory) {
        return borrowList;
    }

    function getBorrowInfo(address _borrowId) external view returns (Borrow memory) {
      return (borrows[_borrowId]);
    }

    /*function getBorrowAllInfo() external view returns(Borrows[] memory) {
      return borrows;
    }*/

    function payInterest(address _borrowId) public payable {
        require(borrows[_borrowId].borrowStatus == BorrowStatus.ACTIVE, 'Invalid borrow');
        uint current = block.timestamp;
        require(msg.value >= totalInterestAmt(lends[borrows[_borrowId].lendId].interest,uint(lends[borrows[_borrowId].lendId].paymentTerm),
        borrows[_borrowId].borrowAmt,borrows[_borrowId].lastPaymentDate,current),'Insucifficent amount');
        require(msg.sender == borrows[_borrowId].borrowAddress,'Only borrow owner can pay the interest.');

        uint nextPayDate = borrows[_borrowId].nextPaymentDateBy;
        borrows[_borrowId].lastPaymentDate = current;
        borrows[_borrowId].nextPaymentDateBy = calcNextCycle(nextPayDate,uint(lends[borrows[_borrowId].lendId].paymentTerm));

        emit interestPayment(borrows[_borrowId].lendId,_borrowId);
    }

    function closeBorrow(address _borrowId) public payable {
        require(msg.sender == borrows[_borrowId].borrowAddress,' Must be borrows borrower');
        require(borrows[_borrowId].collatAmt > 0,' Collateral Amount no more');
        //require(activeLoan[borrows[_borrowId].lendId] > 0,' No active loan');
        msg.sender.transfer(borrows[_borrowId].collatAmt);
        borrows[_borrowId].collatAmt = 0;
        borrows[_borrowId].borrowStatus = BorrowStatus.INACTIVE;
        activeLoan[borrows[_borrowId].lendId] -= 1;

        emit closeBorrowCreated(_borrowId, uint(borrows[_borrowId].borrowStatus));
    }

}