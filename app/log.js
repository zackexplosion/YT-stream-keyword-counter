function log(){
  let arg = Array.prototype.slice.call(arguments, 0)
  arg.unshift(moment().format('LL LTS') + ':')
  console.log.apply(null, arg)
}

module.exports = log