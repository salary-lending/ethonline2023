import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract InvoiceToken is ERC20 {
    constructor() ERC20("InvoiceToken", "INV") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}
