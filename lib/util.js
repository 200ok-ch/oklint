module.exports = {
  die: (msg) => {
    console.error(`\n${msg}\n`)
    process.exit(1)
  }
}
