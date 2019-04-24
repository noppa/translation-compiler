// @flow

module.exports = function(source/*:any*/, map, meta) {
  console.log({...this._compilation.modules[0].reasons})
  const cb = this.async()
  cb(null, '"foo";')
}
