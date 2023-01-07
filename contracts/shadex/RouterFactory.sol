pragma solidity >=0.8.0;

import {UniswapV2Router} from "../UniswapV2Router.sol";

contract RouterFactory {

    address public immutable wETH;
    address public immutable factory;

    event RouterCreated(address routerAddress);

    constructor(address _wETH, address _factory) {
        wETH = _wETH;
        factory = _factory;
    }

    receive() external payable {
        revert("No receive");
    }

    function createRouter(address accountant) external {
        UniswapV2Router router = new UniswapV2Router(factory, wETH, accountant);
        emit RouterCreated(address(router));
    }

}
