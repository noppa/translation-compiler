import './test'

setTimeout(async () => {
  const fi = await import('fi.js')
  console.log(fi)
})
