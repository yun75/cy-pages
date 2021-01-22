const test = require('ava')
const cyunPages = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => cyunPages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(cyunPages('w'), 'w@zce.me')
  t.is(cyunPages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
