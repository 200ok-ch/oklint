const glob = require('glob'),
      nodepath = require('path'),
      yaml = require('js-yaml'),
      fs = require('fs'),
      {die} = require('./util'),
      exec = require('child_process').exec

// TODO: restructure this in a way that it does not stop on the first
// error, but instead continues, collects all the errors, prints a
// report and then exits with error code 1

const [_node, _script, file] = process.argv

// takes a path to a `.oklint` file and an optional filter
// (whitelist), reads the .oklint (yaml) file and calls the plugins
// that corresponds to the keys found in the config
const applyRules = (path, filter) => {
  try {
    console.log(`Applying rules from ${path}...`)
    const config = yaml.safeLoad(fs.readFileSync(path, 'utf8'))
    for (const pluginName in config) {
      const pluginConfig = config[pluginName],
            pluginPath = './plugins/'+pluginName.replace(/-/g, '_'),
            pluginFn = require(pluginPath)
      console.log(`Applying plugin ${pluginName}...`)
      pluginFn(pluginConfig)(nodepath.dirname(path), filter)
    }
  } catch (e) {
    die(e)
  }
}

if (file) {
  // if a file is given it will only read its corresponding .oklint
  // file and pass the file as filter (array) to the plugins
  const dir = nodepath.dirname(file)
  const path = nodepath.join(dir, '.oklint')
  applyRules(path, [file])
} else {
  // if no file is given it will search for .oklint files recursively
  // and run their config against the list of changed files (in git)
  console.log(`Finding changed files via git...\n`)
  const CHANGED_FILES_CMD = 'git diff --name-only HEAD'
  exec(CHANGED_FILES_CMD, (error, stdout, stderr) => {
    console.log(stdout)
    const filter = stdout.trim().split("\n")
    glob('**/.oklint', (err, paths) => {
      if(err) die(err)
      if(!paths.length) die('You must have at least one `.oklint` file in your repo!')
      paths.map((path) => applyRules(path, filter))
    })
  })
}
