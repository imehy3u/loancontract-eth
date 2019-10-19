const EthLoan = artifacts.require("EthLoan");

module.exports = function(deployer) {
  deployer.deploy(EthLoan);
};