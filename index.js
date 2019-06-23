const fs = require('fs')
const LimitService = require('./limitService')

fs.readFile('./input.txt', 'utf8', (inputErr, inputData) => {
  fs.readFile('./output.txt', 'utf8', (outputErr, ouputData) => {
    if (inputErr) {
      return console.error('error from input.txt', err)
    }
    if (outputErr) {
      return console.error('error from output.txt', err)
    }

    let input = inputData.split('\n')
    let expectedOutput = ouputData.split('\n')
    let limit = new LimitService

    // Creates an array of outputs from the LimitService
    let output = input.reduce((acc, fund) => {
      let parse = JSON.parse(fund)
      let res = JSON.stringify(limit.loadFund(parse))
      if (res) acc.push(res)
      return acc
    }, [])

    // Checks if the output is equal to the expected output
    for (var i = 0; i < output.length; i++) {
      if (output[i] !== expectedOutput[i]) {
        console.log('[ERROR] output:', output[i], 'expected:', expectedOutput[i])
      } else {
        console.log('[PASS]', output[i])
      }
    }
  })
})
  


