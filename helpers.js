const identity = x => x
const pipe = (...fns) => data => fns.reduce((acc, fn) => fn(acc), data)
const decrement = num => num - 1
const incBy = incNum => num => incNum + num
const tap = fn => data => {
  fn(data)
  return data
}
const propEq = (prop, eqFn) => obj => eqFn(obj[prop])
const ifElse = (eq, fn, fn2) => data => eq(data) ? fn(data) : fn2(data)
const when = (eq, fn) => data => eq(data) ? fn(data) : null 
const evolve = transformations => obj => {
  let result = {}
  for (key in transformations) {
    result[key] = transformations[key](obj[key])
  }
  return result
}
const assoc = (prop, val) => obj => {
  return {
    ...obj,
    [prop]: val
  }
}

module.exports = {
  identity,
  pipe,
  decrement,
  incBy,
  tap,
  propEq,
  ifElse,
  when,
  evolve,
  assoc
}