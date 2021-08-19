use cosmwasm_std::{entry_point, DepsMut, Env, MessageInfo, Response, CosmosMsg, BankMsg, Coin, Uint128, attr};

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg};
use crate::state::{State, STATE};

// Note, you can use StdResult in some functions where you do not
// make use of the custom errors
#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let state = State {
        owner: info.sender,
        native_coin: msg.native_coin,
    };
    STATE.save(deps.storage, &state)?;

    Ok(Response::default())
}

// And declare a custom Error variant for the ones where you will want to make use of it
#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Flip { value } => try_flip(deps, env, info, value),
        ExecuteMsg::Withdraw { amount } => try_withdraw(deps, info, amount),
    }
}

pub fn try_flip(deps: DepsMut, env: Env, info: MessageInfo, value: bool) -> Result<Response, ContractError> {
    let state = STATE.load(deps.storage)?;
    let bet = info
        .funds
        .iter()
        .find(|x| x.denom == state.native_coin)
        .ok_or(ContractError::EmptyBalance {
            coin: state.native_coin.clone(),
        })?;

    let random = random(env.block.time.nanos());

    let response = if random == 0 && value || random == 1 && value == false {
        let bank_send = CosmosMsg::Bank(BankMsg::Send {
            to_address: info.sender.clone().into(),
            amount: vec![Coin::new(bet.amount.0*2, state.native_coin)],
        });

        Response {
            messages: vec![bank_send],
            attributes: vec![
                attr("action", "flip"),
                attr("result", true),
                attr("value", random),
                attr("sender", info.sender.clone()),
            ],
            ..Response::default()
        }
    } else {
        Response {
            attributes: vec![
                attr("action", "flip"),
                attr("result", false),
                attr("value", random),
                attr("sender", info.sender),
            ],
            ..Response::default()
        }
    };

    Ok(response)
}

pub fn try_withdraw(deps: DepsMut, info: MessageInfo, amount: Uint128) -> Result<Response, ContractError> {
    let state = STATE.load(deps.storage)?;
    if state.owner.ne(&info.sender) {
        return Err(ContractError::Unauthorized {})
    }

    let bank_send = CosmosMsg::Bank(BankMsg::Send {
        to_address: info.sender.into(),
        amount: vec![Coin::new(amount.0, state.native_coin)],
    });

    Ok(Response {
        messages: vec![bank_send],
        attributes: vec![
            attr("action", "withdraw"),
            attr("amount", amount),
        ],
        ..Response::default()
    })
}

fn random(time: u64) -> u64 {
    return time % 2;
}
