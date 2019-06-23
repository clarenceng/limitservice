const LimitService = require('./limitService')

let limit

beforeEach(() => {
  limit = new LimitService
})

let outputter = (data) => data.reduce((acc, fund) => {
  let res = limit.loadFund(fund)
  if (res) acc.push(res)
  return acc
}, [])

test('reject if fund amount is over $5000', () => {
  const data = [{"id":"1","customer_id":"1","load_amount":"$5313.18","time":"2000-01-01T01:01:22Z"}]
  const expected = [{ id: '1', customer_id: '1', accepted: false }]
  expect(outputter(data)).toEqual(expected)
})

test('A maximum of $5,000 can be loaded per day', () => {
  const data = [
    {"id":"2","customer_id":"2","load_amount":"$2313.18","time":"2000-01-01T01:01:22Z"},
    {"id":"22","customer_id":"2","load_amount":"$5413.18","time":"2000-01-01T02:01:22Z"},
  ]
  const expected = [
    { id: '2', customer_id: '2', accepted: true },
    { id: '22', customer_id: '2', accepted: false }
  ]
  expect(outputter(data)).toEqual(expected)
})


test('A maximum of $20,000 can be loaded per week', () => {
  const data = [
    {"id":"3","customer_id":"33","load_amount":"$5000.00","time":"2000-01-04T01:01:22Z"},
    {"id":"33","customer_id":"33","load_amount":"$5000.00","time":"2000-01-05T03:04:33Z"},
    {"id":"333","customer_id":"33","load_amount":"$5000.00","time":"2000-01-06T01:01:22Z"},
    {"id":"3333","customer_id":"33","load_amount":"$5000.00","time":"2000-01-07T04:04:22Z"},
    {"id":"33333","customer_id":"33","load_amount":"$1.00","time":"2000-01-08T04:04:22Z"},
  ]
  const expected = [
    { id: '3', customer_id: '33', accepted: true },
    { id: '33', customer_id: '33', accepted: true },
    { id: '333', customer_id: '33', accepted: true },
    { id: '3333', customer_id: '33', accepted: true },
    { id: '33333', customer_id: '33', accepted: false }
  ]

  expect(outputter(data)).toEqual(expected)
  expect().toEqual()
})

test('A maximum of 3 loads can be performed per day, regardless of amount', () => {
  const data = [
    {"id":"4","customer_id":"4","load_amount":"$1000.18","time":"2000-01-01T01:01:22Z"},
    {"id":"44","customer_id":"4","load_amount":"$1000.18","time":"2000-01-01T02:01:22Z"},
    {"id":"444","customer_id":"4","load_amount":"$1000.18","time":"2000-01-01T02:01:22Z"},
    {"id":"4444","customer_id":"4","load_amount":"$1000.18","time":"2000-01-01T02:01:22Z"},
  ]
  const expected = [
    { id: '4', customer_id: '4', accepted: true },
    { id: '44', customer_id: '4', accepted: true },
    { id: '444', customer_id: '4', accepted: true },
    { id: '4444', customer_id: '4', accepted: false }
  ]
  expect(outputter(data)).toEqual(expected)
})

test('if a load ID is observed more than once for a particular user, all but the first instance can be ignored', () => {
  const data = [
    {"id":"5","customer_id":"5","load_amount":"$1000.18","time":"2000-01-01T01:01:22Z"},
    {"id":"5","customer_id":"5","load_amount":"$1000.18","time":"2000-01-01T02:01:22Z"},
    {"id":"5","customer_id":"5","load_amount":"$1000.18","time":"2000-01-01T02:01:22Z"},
  ]
  const expected = [
    { id: '5', customer_id: '5', accepted: true },
  ]
  expect(outputter(data)).toEqual(expected)
})
