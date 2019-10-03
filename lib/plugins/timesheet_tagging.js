const glob = require('glob'),
      fs = require('fs'),
      parse = require('csv-parse'),
      {die} = require('../util')

const TAG_COLUMN = 2

module.exports = (config) => {
  const validate = (tags) => {
    if(config.each) {
      const results = config.each.map(pattern => {
        const matcher = new RegExp(pattern),
              tagList = tags.join(' '),
              msg = `'${tagList}' does not match ${matcher}`
        if(!matcher.test(tagList)) return msg
        return null
      })
      const errors = results.filter(Boolean)
      if (errors.length) return errors.join("\n")
    }
    return true
  }

  return (path, filter) => {
    glob(`${path}/*.csv`, (err, paths) => {
      if (filter) paths = paths.filter(x => filter.includes(x))
      paths.map((path) => {
        try {
          fs.readFile(path, (err, csv) => {
            if(err) die(err)
            parse(csv, (err, data) => {
              if(err) die(`Error in file ${path}\n${err}`)
              data.forEach((row, ridx) => {
                if(ridx) { // skip header
                  const tags = row[TAG_COLUMN].split(/\s+/)
                  const result = validate(tags)
                  const msg = `Invalid tags in ${path}:${ridx}\n${result}`
                  if(result!==true) die(msg)
                }
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
