const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const {
	readData,
	writeData,
	response,
	makeAccount,
	pregenerateMineCurrencies,
	premakeAccounts,
	formatAmount,
	generateAccountId,
	pregenerateHistory
} = require('./utils.js')

const app = express()
const expressWs = require('express-ws')(app)
const port = 3000

const AUTH_DATA = Object.freeze({
	login: 'developer',
	password: 'skillbox',
	token: 'ZGV2ZWxvcGVyOnNraWxsYm94'
})

const MINE_ACCOUNT = '74213041477477406320783754'

const KNOWN_OTHER_ACCOUNTS = Object.freeze([
	'61253747452820828268825011',
	'05168707632801844723808510',
	'17307867273606026235887604',
	'27120208050464008002528428',
	"2222400070000005",
	"5555341244441115",
])

const KNOWN_CURRENCY_CODES = Object.freeze([
	'ETH',
	'BTC',
	'USD',
	'EUR',
	'JPY',
	'GBP',
	'AUD',
	'CAD',
	'CHF',
	'CNH',
	'HKD',
	'NZD',
	'RUB',
	'UAH',
	'BYR'
])

let currencyFeedSubscribers = []

const data = readData()

pregenerateMineCurrencies(data, KNOWN_CURRENCY_CODES)
premakeAccounts(data, KNOWN_OTHER_ACCOUNTS)
pregenerateHistory(data, [ MINE_ACCOUNT ], true)

function authCheck(req, res, next) {
	if ((req.headers.authorization !== `Basic ${AUTH_DATA.token}`)) {
		res.end(response(null, 'Unauthorized'))
		return
	}
	next()
}

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Backend is working')
})

app.post('/login', (req, res) => {
	const { login, password } = (req.body || {})

	if (login === AUTH_DATA.login) {
		if (password === AUTH_DATA.password) {
			res.end(response({ token: AUTH_DATA.token }))
		} else {
			res.end(response(null, 'Invalid password'))
		}
		return
	}

	res.end(response(null, 'No such user'))
})

app.get('/accounts', authCheck, (req, res) => {
	const myAccounts = Object.values(data.accounts).filter(account => account.mine).map(account => ({
		...account,
		transactions: [ account.transactions[ account.transactions.length - 1 ] ].filter(Boolean)
	}))
	res.end(response(myAccounts))
})

app.get('/account/:id', authCheck, (req, res) => {
	const myAccount = data.accounts[req.params.id]
	if (myAccount) {
		res.end(response(myAccount))
		return
	}
	res.end(response(null, 'No such account'))
})

app.post('/create-account', authCheck, (req, res) => {
	const newAccount = makeAccount(true);
	data.accounts[newAccount.account] = newAccount;
	writeData(data)
	res.end(response(newAccount))
})

app.post('/transfer-funds', authCheck, (req, res) => {
	const { from, to, amount: rawAmount } = (req.body || {})
	const fromAccount = data.accounts[from]
	let toAccount = data.accounts[to]
	const amount = Number(rawAmount)

	if (!fromAccount || !fromAccount.mine) {
		res.end(response(null, 'Invalid account from'))
		return
	}
	
	if (!toAccount) {
		if (Math.random() < 0.25) {
			toAccount = makeAccount(false, toAccount)
			data.accounts[to] = toAccount
		} else {
			res.end(response(null, 'Invalid account to'))
			return
		}
	}

	if (isNaN(amount) || amount < 0) {
		res.end(response(null, 'Invalid amount'))
		return
	}

	if (fromAccount.balance - amount < 0) {
		res.end(response(null, 'Overdraft prevented'))
		return
	}

	fromAccount.balance -= amount;
	toAccount.balance += amount;

	const transactionTime = (new Date()).toISOString()
	fromAccount.transactions.push({
		date: transactionTime,
		from: fromAccount.account,
		to: toAccount.account,
		amount,
	})
	toAccount.transactions.push({
		date: transactionTime,
		from: fromAccount.account,
		to: toAccount.account,
		amount,
	})
	
	writeData(data)

	res.end(response(fromAccount))
})

app.get('/all-currencies', (req, res) => {
	res.end(response(KNOWN_CURRENCY_CODES))
})

app.ws('/currency-feed', (ws, req) => {
	currencyFeedSubscribers.push(ws)
	ws.on('close', () => {
		currencyFeedSubscribers = currencyFeedSubscribers.filter(websocket => websocket !== ws)
	})
})

app.get('/currencies', authCheck, (req, res) => {
	const myCurrencies = data.mine.currencies || {}
	res.end(response(myCurrencies))
})

app.post('/currency-buy', authCheck, (req, res) => {
	const { from, to, amount: rawAmount } = (req.body || {})
	const myCurrencies = data.mine.currencies || {}

	const amount = Number(rawAmount)

	if (!KNOWN_CURRENCY_CODES.includes(from) || !KNOWN_CURRENCY_CODES.includes(to)) {
		res.end(response(null, 'Unknown currency code'))
		return
	}

	if (isNaN(amount) || amount < 0) {
		res.end(response(null, 'Invalid amount'))
		return
	}

	const fromCurrency = myCurrencies[from]
	const toCurrency = myCurrencies[to] = (myCurrencies[to] || {
		"amount": 0,
		"code": to
	})

	if (!fromCurrency || !fromCurrency.amount) {
		res.end(response(null, 'Not enough currency'))
		return
	}

	const exchangeRate = getExchangeRate(from, to) || 1

	if (fromCurrency.amount - amount < 0) {
		res.end(response(null, 'Overdraft prevented'))
		return
	}

	fromCurrency.amount -= amount
	toCurrency.amount += amount * exchangeRate

	writeData(data)

	res.end(response(myCurrencies))
})

app.get('/banks', (req, res) => {
	const POINTS_LIST = Object.freeze([
		{ lat: 44.878414, lon: 39.190289 },
		{ lat: 44.6098268, lon: 40.1006606 },
		{ lat: 51.9581028, lon: 85.9603235 },
		{ lat: 52.4922513, lon: 82.7793606 },
		{ lat: 53.3479968, lon: 83.7798064 },
		{ lat: 44.6344864, lon: 39.1354738 },
		{ lat: 44.8950433, lon: 37.3163282 },
		{ lat: 45.0401604, lon: 38.9759647 },
		{ lat: 44.7235026, lon: 37.7686135 },
		{ lat: 45.2603626, lon: 38.1259774 },
		{ lat: 43.5854551, lon: 39.7231548 },
		{ lat: 45.2610949, lon: 37.4454412 },
		{ lat: 44.9482948, lon: 34.1001151 },
		{ lat: 45.190629, lon: 33.367634 },
		{ lat: 45.3562627, lon: 36.4674513 },
		{ lat: 44.4953612, lon: 34.166308 },
		{ lat: 55.7540471, lon: 37.620405 },
		{ lat: 55.830690, lon: 37.518810 },
		{ lat: 55.829411, lon: 37.643015 },
		{ lat: 55.748041, lon: 37.646865 },
		{ lat: 55.720713, lon: 37.626331 },
		{ lat: 55.740991, lon: 37.679561 },
		{ lat: 55.670706, lon: 37.759068 },
		{ lat: 55.627540, lon: 37.656112 },
		{ lat: 59.9391313, lon: 30.3159004 },
		{ lat: 59.945220, lon: 30.266218 },
		{ lat: 59.961265, lon: 30.295690 },
		{ lat: 59.978295, lon: 30.420077 },
		{ lat: 59.893296, lon: 30.464415 },
		{ lat: 59.851047, lon: 30.255081 },
		{ lat: 59.910094, lon: 30.329551 },
		{ lat: 59.850012, lon: 30.457657 },
	])
	
	res.end(response(POINTS_LIST))
})

app.post('*', (req, res) => {
	res.end(response(null, 'Invalid route'))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


function setExchangeRate(currency1, currency2, rate) {
	const existingInverseRate = data.exchange[`${currency2}/${currency1}`]
	if (existingInverseRate) {
		data.exchange[`${currency2}/${currency1}`] = formatAmount(1 / rate)
		return
	}
	data.exchange[`${currency1}/${currency2}`] = rate
}

function getExchangeRate(currency1, currency2) {
	const straightRate = Number(data.exchange[`${currency1}/${currency2}`])
	if (!isNaN(straightRate)) {
		return straightRate
	}
	const inverseRate = data.exchange[`${currency2}/${currency1}`]
	if (inverseRate) {
		return 1/inverseRate
	}
	return 0
}

const currencyRateFeedGenerator = setInterval(() => {
	// generate currency exchange rate change
	const currenciesLength = KNOWN_CURRENCY_CODES.length
	const index1 = Math.floor(Math.random() * currenciesLength)
	let index2 = Math.floor(Math.random() * currenciesLength)
	if (index1 === index2) {
		index2 = (index2 + 1) % currenciesLength
	}
	const from = KNOWN_CURRENCY_CODES[index1]
	const to = KNOWN_CURRENCY_CODES[index2]
	const rate = formatAmount(0.001 + Math.random() * 100)
	const previousExchangeRate = getExchangeRate(from, to)
	const change = rate > previousExchangeRate ? 1 : rate < previousExchangeRate ? -1 : 0
	setExchangeRate(from, to, rate)
	writeData(data)
	currencyFeedSubscribers.forEach(subscriber => subscriber.send(
		JSON.stringify({
			type: 'EXCHANGE_RATE_CHANGE',
			from,
			to,
			rate,
			change
		})
	))

	// pick random user account and generate random transaction for it
	if (Math.random() > 0.9) {
		const account = data.accounts[MINE_ACCOUNT]
		const amount = formatAmount(Math.random() * 1000)
		account.balance = formatAmount(account.balance + amount)
		account.transactions.push({
			amount,
			date: (new Date()).toISOString(),
			from: generateAccountId(),
			to: MINE_ACCOUNT
		})
		writeData(data)
	}
}, 1000)
currencyRateFeedGenerator.unref()
