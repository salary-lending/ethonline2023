// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "hardhat/console.sol";

contract InvoiceTable is ERC721Holder {
    uint256 private _tableId;
    string private constant _TABLE_PREFIX = "invoice_table";

    // Add a constructor that creates and inserts data
    constructor() {
        // string memory schema = SQLHelpers.toCreateFromSchema(
        //     "id text primary key, details text, amount integer, status text, financedBy text",
        //     _TABLE_PREFIX
        // );
        // _tableId = TablelandDeployments.get().create(
        //     address(this),
        //     SQLHelpers.toCreateFromSchema(
        //         "id integer primary key,", // Notice the trailing comma
        //         _TABLE_PREFIX
        //     )
        // );
        // console.log("_tableId: %s", _tableId);
    }

    // function create() public payable {
    //     string memory schema = SQLHelpers.toCreateFromSchema(
    //         "id text primary key, details text, amount integer, status text, financedBy text,",
    //         _TABLE_PREFIX
    //     );

    //     TablelandDeployments.get().create(address(this), schema);
    // }

    function insert(
        string memory id,
        string memory details,
        uint256 amount,
        string memory status,
        address financedBy
    ) public payable {
        string memory data = string(
            abi.encodePacked(
                SQLHelpers.quote(id),
                ",",
                SQLHelpers.quote(details),
                ",",
                Strings.toString(amount),
                ",",
                SQLHelpers.quote(status),
                ",",
                SQLHelpers.quote(addressToString(financedBy))
            )
        );

        TablelandDeployments.get().mutate(
            address(this),
            _tableId,
            SQLHelpers.toInsert(
                _TABLE_PREFIX,
                _tableId,
                "id,details,amount,status,financedBy",
                data
            )
        );
    }

    function updateStatus(
        string memory id,
        string memory newStatus
    ) public payable {
        string memory mutation = string(
            abi.encodePacked(
                "UPDATE ",
                _TABLE_PREFIX,
                Strings.toString(_tableId),
                " SET status=",
                SQLHelpers.quote(newStatus),
                " WHERE id=",
                SQLHelpers.quote(id)
            )
        );

        TablelandDeployments.get().mutate(address(this), _tableId, mutation);
    }

    // Helper function to convert address to string
    function addressToString(
        address _address
    ) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        return Strings.toHexString(uint256(value));
    }

    // Add more functions as needed, like delete, etc.
}
