// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControlUpgradeable} from '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {ReentrancyGuardUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';

contract Base is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    /**
     * @notice Roles Variable
     */
    bytes32 public constant MODERATOR_ROLE = keccak256('MODERATOR_ROLE');

    /**
     * @notice Error Codes
     */
    string public constant ERROR_UNAUTHORIZED_ACCESS = '0';
    string public constant ERROR_NOT_FOUND = '1';
    string public constant ERROR_INVALID_PRICE = '2';
    string public constant ERROR_PROCESS_FAILED = '3';
    string public constant ERROR_EXPIRED_RESOURCE = '4';

    /**
     * @notice Initialize function
     * @param _admin The address of the administrator
     */
    function init_base_app(address _admin) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function _initError(
        string memory error
    ) internal pure returns (string memory) {
        return string.concat('BC: ', error);
    }
}
