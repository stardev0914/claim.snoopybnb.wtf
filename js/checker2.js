var web3;
var wallet;
var contract;
var provider;
var txHash = "";
var txStatus = null;
var connected = false;

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: { 56: "https://bsc-dataseed.binance.org" },
      //rpc: { 56: "https://bsc-testnet.bnbchain.org" },
      network: "binance",
      chainId: 56,
      infuraId: "1c88e90976ea4bf3ae0f3845eaccddf9",
    },
  },
};

const web3Modal = new Web3Modal({
  providerOptions, // required
  cacheProvider: false, // optional
  disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
});

// token
const contractAddr = "0xf58F0090eb8964849872f1629EF83d70742a45ea";
const contractAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "SaleStarted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "referPercent", type: "uint256" },
      { internalType: "uint256", name: "salePrice", type: "uint256" },
      { internalType: "uint256", name: "tokenAmount", type: "uint256" },
    ],
    name: "StartSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "_BNBsold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_airdropPoints",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_refCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_sumBNB",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_refer", type: "address" }],
    name: "buyTokens",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "newReferPercent", type: "uint256" },
      { internalType: "uint256", name: "newPrice", type: "uint256" },
      { internalType: "uint256", name: "newTokenAmount", type: "uint256" },
    ],
    name: "changeSaleInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "closeSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountPercent", type: "uint256" },
    ],
    name: "getTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pancakePair",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pancakeRouter",
    outputs: [
      { internalType: "contract IPancakeRouter02", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleReceiver",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleStats",
    outputs: [
      { internalType: "uint256", name: "referPercent", type: "uint256" },
      { internalType: "uint256", name: "SalePrice", type: "uint256" },
      { internalType: "uint256", name: "SaleCap", type: "uint256" },
      { internalType: "uint256", name: "remainingTokens", type: "uint256" },
      { internalType: "uint256", name: "SaleCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address payable", name: "_receiver", type: "address" },
    ],
    name: "setSaleReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountPercent", type: "uint256" },
    ],
    name: "withdrawBNB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

const contractSTKAddr = "0x18dBf29fa268c194407F231D94c851216Cd4B688";
const contractSTKAbi = [
  {
    inputs: [
      { internalType: "address", name: "_feesWallet", type: "address" },
      { internalType: "address", name: "_tokenContract", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      {
        indexed: false,
        internalType: "address",
        name: "investor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lockPeriod",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "apy", type: "uint256" },
    ],
    name: "PlanCreated",
    type: "event",
  },
  {
    inputs: [],
    name: "Investors",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_MinimumAmountToReceive",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_currentDepositID",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_points",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_snoopyDecimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "count",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "address", name: "_referrer", type: "address" },
      { internalType: "uint256", name: "_planId", type: "uint256" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "depositRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "depositState",
    outputs: [
      { internalType: "address", name: "investor", type: "address" },
      { internalType: "uint256", name: "depositAmount", type: "uint256" },
      { internalType: "uint256", name: "depositAt", type: "uint256" },
      { internalType: "uint256", name: "claimedAmount", type: "uint256" },
      { internalType: "bool", name: "state", type: "bool" },
      { internalType: "uint256", name: "planId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "devFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_investor", type: "address" }],
    name: "getAllClaimableReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "investor", type: "address" }],
    name: "getOwnedDeposits",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalInvests",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalRewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "investors",
    outputs: [
      { internalType: "address", name: "investor", type: "address" },
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "uint256", name: "totalLocked", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "lastCalculationDate", type: "uint256" },
      { internalType: "uint256", name: "claimableAmount", type: "uint256" },
      { internalType: "uint256", name: "claimedAmount", type: "uint256" },
      { internalType: "uint256", name: "referAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "leaderboardAddresses",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "ownedDeposits",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "percentRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "planCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "plans",
    outputs: [
      { internalType: "uint256", name: "lockPeriod", type: "uint256" },
      { internalType: "uint256", name: "apy", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ref",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "newAmount", type: "uint256" }],
    name: "setMinimumAmountToReceive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_planId", type: "uint256" },
      { internalType: "uint256", name: "_lockPeriod", type: "uint256" },
      { internalType: "uint256", name: "_apy", type: "uint256" },
      { internalType: "bool", name: "_active", type: "bool" },
    ],
    name: "setPlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_feesWallet", type: "address" }],
    name: "setWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "decimals", type: "uint8" }],
    name: "setsnoopyDecimals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "snoopyToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalInvested",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_value", type: "uint256" }],
    name: "withdrawAirdrop",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const contractSaleAddr = "0xb2C0FE57A89F1f05937936ECB57Eb24F55919849";
const contractSaleAbi = [
  {
    inputs: [
      { internalType: "contract IERC20", name: "_token", type: "address" },
      { internalType: "contract IERC20", name: "_USDT", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "AffiliateCommissionPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "bool", name: "isActive", type: "bool" },
    ],
    name: "AffiliateStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
    ],
    name: "AffiliateSystemToggled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "kycFeeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalKycFeesCollected",
        type: "uint256",
      },
    ],
    name: "KycFeeCharged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
    ],
    name: "KycFeeSystemToggled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "USDT",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDTBonusThreshold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDTBonusTokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDTDecimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_ETHSold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_USDTSold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_affiliateETHCommission",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_affiliateUSDTCommission",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_airdropPoints",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_refCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_sumETH",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "_sumUSDT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "affiliateCommissionPercent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "affiliateSumETH",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "affiliateSumUSDT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "affiliateSystemEnabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "becomeAffiliate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_refer", type: "address" }],
    name: "buyWithBNB",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "USDTAmount", type: "uint256" },
      { internalType: "address", name: "_refer", type: "address" },
    ],
    name: "buyWithUSDT",
    outputs: [{ internalType: "bool", name: "success", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "newReferPercent", type: "uint256" },
      { internalType: "uint256", name: "newPriceETH", type: "uint256" },
      { internalType: "uint256", name: "newPriceUSDT", type: "uint256" },
      { internalType: "uint256", name: "newTokenAmount", type: "uint256" },
    ],
    name: "changeSaleInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimBonus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "claimedETHBonus",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "claimedUSDTBonus",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "closeSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ethBonusThreshold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ethBonusTokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feePercent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeReceiver",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountPercent", type: "uint256" },
    ],
    name: "getTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isAffiliate",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "kycFeeCap",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "kycFeeEnabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "kycFeePercent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleReceiver",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleStarted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleStats",
    outputs: [
      { internalType: "uint256", name: "referPercent", type: "uint256" },
      { internalType: "uint256", name: "salePriceETH", type: "uint256" },
      { internalType: "uint256", name: "salePriceUSDT", type: "uint256" },
      { internalType: "uint256", name: "ETHBalance", type: "uint256" },
      { internalType: "uint256", name: "USDTBalance", type: "uint256" },
      { internalType: "uint256", name: "remainingTokens", type: "uint256" },
      { internalType: "uint256", name: "saleCount", type: "uint256" },
      { internalType: "uint256", name: "currentFeePercent", type: "uint256" },
      { internalType: "address", name: "feeReceiverAddress", type: "address" },
      { internalType: "uint256", name: "affiliateCommission", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newPercent", type: "uint256" }],
    name: "setAffiliateCommissionPercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_newThreshold", type: "uint256" },
    ],
    name: "setEthBonusThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newBonus", type: "uint256" }],
    name: "setEthBonusTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_newFeePercent", type: "uint256" },
    ],
    name: "setFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address payable", name: "_receiver", type: "address" },
    ],
    name: "setFeeReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newCap", type: "uint256" }],
    name: "setKycFeeCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newPercent", type: "uint256" }],
    name: "setKycFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address payable", name: "_receiver", type: "address" },
    ],
    name: "setSaleReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_newThreshold", type: "uint256" },
    ],
    name: "setUSDTBonusThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newBonus", type: "uint256" }],
    name: "setUSDTBonusTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "_decimals", type: "uint8" }],
    name: "setUSDTDecimals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "referPercent", type: "uint256" },
      { internalType: "uint256", name: "salePriceETH", type: "uint256" },
      { internalType: "uint256", name: "salePriceUSDT", type: "uint256" },
      { internalType: "uint256", name: "tokenAmount", type: "uint256" },
      {
        internalType: "address payable",
        name: "_feeReceiver",
        type: "address",
      },
    ],
    name: "startSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "toggleAffiliateStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "toggleAffiliateSystem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "toggleKycFeeSystem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalKycFeesCollected",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountPercent", type: "uint256" },
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountPercent", type: "uint256" },
    ],
    name: "withdrawUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

const contractDropAddr = "0xE2Db2dF165Adf515F80C5A30B9D0f06d138120e2";
const contractDropAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "status", type: "bool" },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "points",
        type: "uint256",
      },
    ],
    name: "PointsAwarded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newPoints",
        type: "uint256",
      },
    ],
    name: "PointsPerReferralUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "checker",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
    ],
    name: "Registered",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "checkRegistration",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getChecker",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_wallet", type: "address" }],
    name: "getWalletPoints",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pointsPerReferral",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_checker", type: "uint256" },
      { internalType: "address", name: "_ref", type: "address" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "registeredUsers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_status", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newPoints", type: "uint256" }],
    name: "updatePointsPerReferral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "walletPoints",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// Log inicial para depuração
//console.log("Initial URL on load (iframe):", window.location.href);
//console.log("Parent URL:", window.parent.location.href);

// Função para obter o parâmetro ref
function getQueryParam(param) {
  let parentSearch = "";
  try {
    parentSearch = window.parent.location.search;
    // console.log("Parent Query String:", parentSearch);
  } catch (e) {
    // console.log("Could not access parent URL:", e.message);
  }

  const parentParams = new URLSearchParams(parentSearch);
  let ref = parentParams.get(param);

  if (!ref) {
    const iframeSearch = window.location.search;
    //console.log("Iframe Query String:", iframeSearch);
    const iframeParams = new URLSearchParams(iframeSearch);
    ref = iframeParams.get(param);
  }

  // console.log("Available params (parent):", Array.from(parentParams.entries()));
  //console.log("Available params (iframe):", Array.from(new URLSearchParams(window.location.search).entries()));
  return ref;
}

// Atualizar o DOM com o ref na inicialização
function updateRefDisplay() {
  const ref = getQueryParam("ref");
  if (ref) {
    $("#referid").text(
      "You are invited by: " + ref.slice(0, 6) + "..." + ref.slice(-4)
    );
    $("#referinput").val(ref);
  } else {
    $("#referid").text(""); // No referral provided.
    $("#referinput").val("");
  }
  // console.log("Referral address:", ref);
}

let interactionCount = 0;

const connectToWallet = async () => {
  let web3view;

  web3view = new Web3("https://bsc-dataseed.binance.org");

  try {
    provider = await web3Modal.connect();
  } catch (err) {
    console.log("Could not get a wallet connection", err);
    return;
  }

  web3 = new Web3(provider);
  connected = true;
  console.log("Web3 instance is", web3);

  let accounts = await web3.eth.getAccounts();
  wallet = web3.utils.toChecksumAddress(accounts[0]);

  let balance = await web3.eth.getBalance(wallet);
  let bnbval = Number.parseFloat(web3.utils.fromWei(balance, "ether")).toFixed(
    4
  );
  $("#balance").text(bnbval);

  $("#connect").text(wallet.slice(0, 6) + "..." + wallet.slice(-4));
  $("#referralLink").val("https://airdrop.snoopybnb.wtf/?ref=" + wallet);
  $("#refaddress").val(wallet);

  const contractInteractionAddress =
    "0x5c952063c7fc8610FFDB798152D69F0B9550762b";
  const bscApiKey = "Z32I6MX2XHESUYCVI73PGABQ5SHTI8KC7H";
  const apiUrlInteractions = `https://api.bscscan.com/api?module=account&action=txlist&address=${wallet}&startblock=0&endblock=99999999&sort=desc&apikey=${bscApiKey}`;

  $("#fmeme").html('<i class="fa fa-spinner fa-spin"></i>');
  $("#buyer").html('<i class="fa fa-spinner fa-spin"></i>');
  $("#staker").html('<i class="fa fa-spinner fa-spin"></i>');
  $("#reff").html('<i class="fa fa-spinner fa-spin"></i>');
  $("#allocation").html('<i class="fa fa-spinner fa-spin"></i>');
  try {
    const res = await fetch(apiUrlInteractions);
    const data = await res.json();

    if (data.status === "1") {
      const txs = data.result;

      for (const tx of txs) {
        if (
          tx.to &&
          tx.to.toLowerCase() === contractInteractionAddress.toLowerCase()
        ) {
          interactionCount++;
        }
      }

      $("#fmeme").text(Math.min(interactionCount * 1250, 9500));
    } else {
      console.error("Erro BscScan:", data.message);
    }
  } catch (err) {
    console.error("Erro BscScan:", err);
  }

  const tokensPerUnitBNB = 130;
  const unitBNB = 0.01;

  const tokensPerUnitUSDT = 130;
  const unitUSDT = 7;

  let contractx = new web3.eth.Contract(contractAbi, contractAddr);
  let sumbbnb1 = await contractx.methods._sumBNB(wallet).call();
  let sumbbnbFormatted1 = Number.parseFloat(
    web3.utils.fromWei(sumbbnb1, "ether")
  );

  let contractOld = new web3.eth.Contract(contractSaleAbi, contractSaleAddr);
  let sumbbnb2 = await contractOld.methods._sumETH(wallet).call();
  let sumbbnbFormatted2 = Number.parseFloat(
    web3.utils.fromWei(sumbbnb2, "ether")
  );

  let sumbusdt = await contractOld.methods._sumUSDT(wallet).call();
  let sumbusdtFormatted = Number.parseFloat(
    web3.utils.fromWei(sumbusdt, "ether")
  );

  let totalBNBFormatted = sumbbnbFormatted1 + sumbbnbFormatted2;

  let tokensFromBNB = (totalBNBFormatted / unitBNB) * tokensPerUnitBNB;

  let tokensFromUSDT = (sumbusdtFormatted / unitUSDT) * tokensPerUnitUSDT;

  let tokensEarned = Math.min(tokensFromBNB + tokensFromUSDT, 10500);

  $("#buyer").text(isNaN(tokensEarned) ? 0 : tokensEarned.toFixed(0));

  let rewwW = new web3.eth.Contract(contractSTKAbi, contractSTKAddr);
  let claimt = await rewwW.methods.getOwnedDeposits(wallet).call();
  let lockeddd = Number.parseFloat(String(claimt));

  const bonusTokens = 3500;
  const shownTokens = lockeddd >= 1 ? bonusTokens : 0;

  $("#staker").text(isNaN(lockeddd) ? 0 : shownTokens);

  //
  let refdrop = new web3.eth.Contract(contractDropAbi, contractDropAddr);
  let finalref = Number(await refdrop.methods.getWalletPoints(wallet).call());
  finalref = Math.min(finalref, 11000);
  $("#reff").text(finalref);

  let calfour = Math.min(interactionCount * 1350, 5000);
  let finalalo = shownTokens + tokensEarned + calfour + finalref;
  $("#allocation").text(finalalo.toFixed(2) + " SNOOPY");

  updateRefDisplay();
};

document.addEventListener("DOMContentLoaded", () => {
  updateRefDisplay();
});

document
  .getElementById("connectButton")
  ?.addEventListener("click", async () => {
    await connectToWallet();
  });

const disconnectFromWallet = async () => {
  if (provider.close) {
    await provider.close();
    await web3Modal.clearCachedProvider();
    provider = null;
  }
  connected = null;
  wallet = null;
};

const registerAccount = async () => {
  let refer = document.getElementById("referinput").value;

  if (!connected) {
    await connectToWallet();
  }

  if (wallet == undefined) {
    alert(
      "No BEP20 wallet detected or it was not allowed to connect. Trust wallet or Metamask are recommended."
    );
    return;
  }

  if (refer === "") {
    refer = "0x0000000000000000000000000000000000000000";
  }

  let contract = new web3.eth.Contract(contractDropAbi, contractDropAddr);

  try {
    let registerButton = document.getElementById("register");
    if (registerButton) {
      registerButton.innerText = "Sending tx...";
    }

    contract.methods
      .register(interactionCount, refer)
      .send({
        from: wallet,
      })
      .on("transactionHash", (hash) => {
        console.log("Transaction Hash:", hash);
        if (registerButton) {
          registerButton.innerText = "Done!";
        }
      })
      .on("error", (error) => {
        console.error("Transaction error:", error.message);
        if (registerButton) {
          registerButton.innerText = "Register";
        }
      });
  } catch (error) {
    console.error("Error sending transaction:", error);
    let registerButton = document.getElementById("register");
    if (registerButton) {
      registerButton.innerText = "Register";
    }
  }
};

const viewSale = async () => {
  let web3view;

  web3view = new Web3("https://bsc-dataseed.binance.org");
  //web3view = new Web3('https://bsc-testnet.bnbchain.org');
  //web3view = new Web3('https://rinkeby.infura.io/v3/ee0afda5772040bdb86f8bd3bcdc9165');

  if (txHash != "") {
    //console.log(txHash);
    txStatus = await web3view.eth.getTransactionReceipt(txHash);
  }
  if (txStatus != null) {
    //console.log(txStatus);

    txStatus = null;
    txHash = "";
  }

  let t = setTimeout(function () {
    viewSale();
  }, 1000);
};

jQuery(function ($) {
  viewSale();

  $("#connect").click(function () {
    if (!connected) {
      connectToWallet();
    } else {
      disconnectFromWallet();
    }
  });
  $("#dismiss-popup-btn").click(function () {
    document.getElementsByClassName("popup")[0].classList.remove("active");
  });
});
