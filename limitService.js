const { identity, pipe, decrement, incBy, tap, propEq, ifElse, evolve, assoc } = require('./helpers')

const currencyToNum = currency => Number(currency.replace(/[^0-9.-]+/g,""))
const hasMaxDailyLoads = propEq('dailyLoadLimit', loads => loads === 0)
const hasExistingId = id => data => data['fundIds'][id] ? true : false
const hasMaxDailyAmount = propEq('dailyTotal', amount => amount > 5000)
const hasMaxWeeklyAmount = propEq('weeklyTotal', amount => amount > 20000)
const hasMaxAmounts = (data) => hasMaxDailyAmount(data) || hasMaxWeeklyAmount(data)
const getDayInWeek = date => new Date(date).getUTCDay()
const getDateInMonth = date => new Date(date).getUTCDate()
const isNewWeek = (prevDay, day) => prevDay > day
const isNewDay = (prevDate, date) => prevDate !== date
const defaultToInitalCustomerData = hashData => hashData || {
  dailyLoadLimit: 3,
  dailyTotal: 0,
  weeklyTotal: 0,
  fundIds: {}
}

class limitService {
  constructor() {
    this.week = null
    this.day = null
    this.hash = {}
  }

  handleTime(time) {
    let newDay = this.day ? isNewDay(this.day, getDateInMonth(time)) : false
    let newWeek = this.week ? isNewWeek(this.week, getDayInWeek(time)) : false

    this.day = getDateInMonth(time)
    this.week = getDayInWeek(time)

    if (newDay) {
      for (let id in this.hash) {
        this.hash[id] = Object.assign(this.hash[id], { dailyLoadLimit: 3, dailyTotal: 0 })
      }
    }

    if (newWeek) {
      for (let id in this.hash) {
        this.hash[id] = Object.assign(this.hash[id], { weeklyTotal: 0 })
      }
    }
  }

  loadFund(fund) {
    let output;
    const { id, customer_id, load_amount, time } = fund

    this.handleTime(time)

    const log = (bool, fund) => () => {
      output = {
        id: fund.id,
        customer_id: fund.customer_id,
        accepted: bool
      }
    }

    const evolveFundEntryInHash = evolve({
      dailyLoadLimit: decrement,
      dailyTotal: incBy(currencyToNum(load_amount)),
      weeklyTotal: incBy(currencyToNum(load_amount)),
      fundIds: assoc(id, true)
    })
    const handleErrorAndDefault = pipe(
      tap(log(false, fund)),
      identity
    )
    const handleSuccessAndEvolve = pipe(
      tap(log(true, fund)),
      evolveFundEntryInHash,
    )
    const storeIdOfRejectedFund = (data) => {
      let newData = {
        ...data,
        fundIds: {
          ...data.fundIds,
          [id]: true
        }
      }
      return newData
    }
    const handleAmountsCheck = ifElse(
      pipe(evolveFundEntryInHash, hasMaxAmounts),
      pipe(storeIdOfRejectedFund, handleErrorAndDefault), 
      handleSuccessAndEvolve,
    )
    const handleDailyLoadsCheck = ifElse(
      hasMaxDailyLoads,
      pipe(storeIdOfRejectedFund, handleErrorAndDefault),
      handleAmountsCheck
    )
    const handleExisitingCheck = ifElse(
      hasExistingId(id),
      identity,
      handleDailyLoadsCheck
    )


    this.hash[customer_id] = pipe(
      defaultToInitalCustomerData,
      handleExisitingCheck
    )(this.hash[customer_id])

    if (output) {
      return output
    }
  }
}

module.exports = limitService