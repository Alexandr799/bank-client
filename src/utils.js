module.exports = {
	readData,
	writeData,
	response,
	makeAccount,
	pregenerateMineCurrencies,
	premakeAccounts,
	formatAmount,
	generateAccountId,
	pregenerateHistory
}

const fs = require('fs')

const PUBLIC_DIR = './public'

function readData() {
	return JSON.parse(fs.readFileSync(`${PUBLIC_DIR}/data.json`))
}

function writeData(dataToWrite) {
	fs.writeFileSync(`${PUBLIC_DIR}/data.json`, JSON.stringify(dataToWrite, null, 4))
}

function response(payload = null, error = '') {
	return JSON.stringify({
		payload,
		error
	})
}

function formatAmount(number) {
	return Number(number.toFixed(2))
}

function generateAccountId() {
	return Array(26)
		.fill(0)
		.map(() => Math.floor(Math.random() * 9))
		.join('')
}

function makeAccount(mine = false, preseededId = '') {
	return {
		account: preseededId || generateAccountId(),
		mine,
		balance: 0,
		transactions: []
	}
}

function pregenerateMineCurrencies(data, knowCurrencies) {
	const currencies = data.mine.currencies
	knowCurrencies.forEach(currency => {
		if (!currencies[currency]) {
			currencies[currency] = {
				"amount": Math.random()*100,
				"code": currency
			}
		}
	})
	writeData(data)
}

function premakeAccounts(data, newAccounts, mine = false) {
	const accounts = data.accounts
	newAccounts.forEach(account => {
		if (!accounts[account]) {
			accounts[account] = makeAccount(mine, account)
		}
	})
	writeData(data)
}

function pregenerateHistory(data, accounts, mine = false) {
	premakeAccounts(data, accounts, mine);
	const months = 10
	const transactionsPerMonth = 5
	accounts.forEach(accountId => {
		const account = data.accounts[accountId]
		if (account.transactions.length >= months * transactionsPerMonth) {
			return;
		}

		const dayAsMs = 24 * 60 * 60 * 1000
		const monthAsMs = 30 * dayAsMs
		const yearAsMs = 12 * monthAsMs
		let date = Date.now() - yearAsMs 

		for (let month = 0; month <= months; month++) {
			for (let transaction = 0; transaction <= transactionsPerMonth; transaction++) {
				const sign = Math.random() < 0.5 ? 1 : -1
				const amount = formatAmount(Math.random() * 10000)

				const otherAccountId = generateAccountId()
				const randomDaysOffset = ((Math.random() - 0.5) * Math.random() * 5) * dayAsMs

				account.transactions.push({
					date: new Date(date + randomDaysOffset).toISOString(),
					from: sign < 0 ? accountId : otherAccountId,
					to: sign > 0 ? accountId : otherAccountId,
					amount,
				})
			}
			date += monthAsMs
		}
	})
}
