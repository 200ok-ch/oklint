const glob = require('glob'),
      fs = require ('fs'),
      nodepath = require('path'),
      {die} = require('../util')

module.exports = (config) => {
  const matcher = new RegExp(config.global)
  return (path, filter) => {
    glob(`${path}/**/*`, (err, paths) => {
      if (filter) paths = paths.filter(x => filter.includes(x))
      paths.map((path) => {
        try {
          fs.lstat(path, (err, stat) => {
            if(err) die(err)
            if(stat.isFile()) {
              const filename = nodepath.basename(path)
              const msg = `${path} does not conform to ${matcher}`
              if(!matcher.test(filename)) die(msg)
            }
          })
        } catch (e) {
          die(e)
        }
      })
    })
  }
}
