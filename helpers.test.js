const { identity, pipe, decrement, incBy, tap, propEq, ifElse, when, evolve, assoc } = require('./helpers')
const data = {
  cat: 'meow'
}

test('[identity] should return itself', () => {
  expect(identity('x')).toEqual('x')
})

test('[decrement] should minus 1 from itself', () => {
  expect(decrement(2)).toEqual(1)
})

test('[pipe] should compose fns', () => {
  expect(pipe(decrement, decrement)(3)).toEqual(1)
})

test('[incBy] should increase by specified amount', () => {
  expect(incBy(2)(3)).toEqual(5)
})

test('[tap] should return the value passed in', () => {
  expect(tap(incBy(2))(2)).toEqual(2)
})

test('[propEq] should return a boolean if prop satisfies given fns ', () => {
  expect(propEq('cat', (res) => res === 'meow')(data)).toEqual(true)
})

test('[ifElse] should act like an if else statement, but functionally', () => {
  expect(
    ifElse(
      (x) => x.cat === 'bark',
      (x) => x.dog = 'meow',
      identity
    )(data)
  ).toEqual(data)
})

test('[when] should act like an if statement, but functionally', () => {
  expect(
    when(
      (x) => x.cat === 'meow',
      identity
    )(data)
  ).toEqual(data)
})

test('[evolve] should transform each prop in an obj', () => {
  expect(
    evolve({
      cat: (s) => s + 'meow'
    })(data)
  ).toEqual({
    cat: 'meowmeow'
  })
})

test('[assoc] should add a new key value to obj', () => {
  expect(
    assoc('dog', 'bark')(data)
  ).toEqual({
    ...data,
    dog: 'bark'
  })
})
