const test = require('ava')
const cyPages = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => cyPages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(cyPages('w'), 'w@zce.me')
  t.is(cyPages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
