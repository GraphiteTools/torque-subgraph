import { BigInt } from "@graphprotocol/graph-ts";

import { iToken, Borrow, Repay } from "../generated/iDAI Token/iToken";
import { Token, User, Loan } from "../generated/schema";


export function handleBorrow(event: Borrow): void {
	let address = event.address;
	let borrower = event.params.borrower;
	let amount = event.params.borrowAmount;
	let interestRate = event.params.interestRate;
	let withdrawOnOpen = event.params.withdrawOnOpen;

	if (!withdrawOnOpen) {
		return;
	}

	let token = Token.load(address.toHexString());
	if (!token) {
		token = new Token(address.toHexString());
		let itoken = iToken.bind(address);
		token.symbol = itoken.symbol();
		token.save();
	}

	let user = User.load(borrower.toHexString());
	if (!user) {
		user = new User(borrower.toHexString());
		user.loans = [];
		user.save();
	}

	let loanId = borrower.toHexString() + '-' + address.toHexString();
	let loan = Loan.load(loanId);
	if (!loan) {
		loan = new Loan(loanId);
		loan.borrower = borrower.toHexString();
		loan.token = address.toHexString();
		loan.amount = new BigInt(0);
		loan.interestRate = interestRate;
		loan.timestamp = event.block.timestamp;
	}
	loan.amount += amount;
    loan.save();
}

export function handleRepay(event: Repay): void {
	let address = event.address;
	let borrower = event.params.borrower;
	let amount = event.params.amount;

	let token = Token.load(address.toHexString());

	let user = User.load(borrower.toHexString());
	if (!user) {
		user = new User(borrower.toHexString());
		user.loans = [];
		user.save();
	}

	let loanId = borrower.toHexString() + '-' + address.toHexString();
	let loan = Loan.load(loanId);
	if (!loan) {
		loan = new Loan(loanId);
		loan.borrower = borrower.toHexString();
		loan.token = address.toHexString();
		loan.amount = new BigInt(0);
	}
	loan.amount -= amount;
	loan.save();
}
