const glob = require('glob'),
      fs = require('fs'),
      parse = require('csv-parse'),
      {die} = require('../util')

module.exports = (config) => {
  const headerMatchers = config.header.map((str) => new RegExp(str))
  const dataMatchers = config.data.map((str) => new RegExp(str))

  return (path, filter) => {
    const pattern = `${path}/*.csv`
    glob(pattern, (err, paths) => {
      if (filter) paths = paths.filter(x => filter.includes(x))
      paths.map((path) => {
        try {
          fs.readFile(path, (err, csv) => {
            if(err) die(err)
            parse(csv, (err, data) => {
              if(err) die(`Error in file ${path}\n${err}`)
              data.forEach((row, ridx) => {
                row.forEach((value, cidx) => {
                  const matcher = ridx ? dataMatchers[cidx] : headerMatchers[cidx]
                  const msg = `${path}:${ridx}:${cidx} '${value}' does not match ${matcher}`
                  if(!matcher.test(value)) die(msg)
                })
              })
            })
          })
        } catch (e) {
          die(e)
        }
      })
    })
  }
}
