const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");

const rpcEndpoint = "https://rpc.juno.omniflix.co:443";
const contract = "juno1k74ye3s835nl9atgfyvdwxmdqv0pqv8c3lwc0p";
const chainId = "lucina";
let cosmJS;
let playerAddress;

window.onload = async () => {
    const status = await registerKeplr();
    if (!status) {
        return;
    }

    // You should request Keplr to enable the wallet.
    // This method will ask the user whether or not to allow access if they haven't visited this website.
    // Also, it will request user to unlock the wallet if the wallet is locked.
    // If you don't request enabling before usage, there is no guarantee that other methods will work.
    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();

    playerAddress = accounts[0].address;
    cosmJS = await SigningCosmWasmClient.connectWithSigner(
        rpcEndpoint,
        offlineSigner
    );
    
    await displayDappBalance();
    await displayPlayerBalance();
    $('#wager_button').click(inputData);
};

async function displayDappBalance() {
    const balance = await cosmJS.getBalance(contract, "ujuno")
    $('#dapp_balance_output').text(fromUjuno(balance.amount));
}

async function displayPlayerBalance() {
    const balance = await cosmJS.getBalance(playerAddress, "ujuno")
    $('#player_balance_output').text(fromUjuno(balance.amount))
}

async function inputData() {
	const executeMsg = {
		flip: {
            value: $('#inlineFormCustomSelect').val() === 'Heads' ? true : false
        }
	};
    const bet = {
        amount: toUjuno($('#wager_input').val()).toString(),
        denom: 'ujuno'
    };

    const response = await cosmJS.execute(playerAddress, contract, executeMsg, "none", [bet])

    if (response.code !== undefined &&
        response.code !== 0) {
        alert("Failed to send tx: " + response.log || response.rawLog);

        return;
    } 

    const attributes = response.logs[0].events[2].attributes;
    let resultAtr = getAtributeValue(attributes, 'result');
    let valueAtr = getAtributeValue(attributes, 'value');
    if (!resultAtr || !valueAtr) {
        alert("Not found result/value key");
        return;
    }

    let result = valueAtr === '1' ? 'Tails': 'Heads';
    let waitingPeriod;
    let n = 4;

    waitingPeriod = setInterval(() => {
        $('#result').text(n-=1);
    }, 1000);

    setTimeout(async () => {
        if (resultAtr === 'true') {
            $('#result').text(result + '... You Won!')
        } else {
            $('#result').text(result + '... You Lost!')
        }
        clearInterval(waitingPeriod);
        await displayDappBalance();
        await displayPlayerBalance();
    }, 4000);
}

function getAtributeValue(attributes, key) {
    for (let index = 0; index < attributes.length; index++) {
        const item = attributes[index];

        if (item.key === key) {
            return item.value;
        }  
    }

    return "";
}

function fromUjuno(amount) {
    return parseInt(amount) / Math.pow(10, 6);
}

function toUjuno(amount) {
    return parseInt(parseFloat(amount) * Math.pow(10, 6));
}

async function registerKeplr() {
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install keplr extension");
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
                // If the user approves, the chain will be added to the user's Keplr extension.
                // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                // If the same chain id is already registered, it will resolve and not require the user interactions.
                await window.keplr.experimentalSuggestChain({
                    // Chain-id of the Cosmos SDK chain.
                    chainId: chainId,
                    // The name of the chain to be displayed to the user.
                    chainName: "Juno testnet",
                    // RPC endpoint of the chain.
                    rpc: rpcEndpoint,
                    // REST endpoint of the chain.
                    rest: "https://api.juno.omniflix.co:443",
                    // Staking coin information
                    // (Currently, Keplr doesn't have the UI that shows multiple tokens, therefore this uses the SHELL token as the primary token althought SHELL is not a staking coin.)
                    stakeCurrency: {
                        // Coin denomination to be displayed to the user.
                        coinDenom: "JUNO",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "ujuno",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: ""
                    },
                    // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
                    // The 'stake' button in Keplr extension will link to the webpage.
                    // walletUrlForStaking: "",
                    // The BIP44 path.
                    bip44: {
                        // You can only set the coin type of BIP44.
                        // 'Purpose' is fixed to 44.
                        coinType: 118,
                    },
                    // Bech32 configuration to show the address to user.
                    // This field is the interface of
                    // {
                    //   bech32PrefixAccAddr: string;
                    //   bech32PrefixAccPub: string;
                    //   bech32PrefixValAddr: string;
                    //   bech32PrefixValPub: string;
                    //   bech32PrefixConsAddr: string;
                    //   bech32PrefixConsPub: string;
                    // }
                    bech32Config: {
                        bech32PrefixAccAddr: "juno",
                        bech32PrefixAccPub: "junopub",
                        bech32PrefixValAddr: "junovaloper",
                        bech32PrefixValPub: "junovaloperpub",
                        bech32PrefixConsAddr: "junovalcons",
                        bech32PrefixConsPub: "junovalconspub"
                    },
                    // List of all coin/tokens used in this chain.
                    currencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: "JUNO",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "ujuno",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: ""
                        // coinGeckoId: ""
                    }],
                    // List of coin/tokens used as a fee token in this chain.
                    feeCurrencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: "JUNO",
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: "ujuno",
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        // coinGeckoId: ""
                        // coinGeckoId: ""
                    }],
                    // (Optional) The number of the coin type.
                    // This field is only used to fetch the address from ENS.
                    // Ideally, it is recommended to be the same with BIP44 path's coin type.
                    // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
                    // So, this is separated to support such chains.
                    // coinType: 118,
                    // (Optional) This is used to set the fee of the transaction.
                    // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
                    // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
                    // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
                    gasPriceStep: {
                        low: 0.01,
                        average: 0.025,
                        high: 0.04
                    },
                    features: ["stargate", 'ibc-transfer', 'cosmwasm']
                });

                return true;
            } catch {
                alert("Failed to suggest the chain");
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
    }

    return false;
}
