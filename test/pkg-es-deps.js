import test from 'ava';
import pkgEsDeps from '../src/pkg-es-deps';
import { mock as depMock } from 'es-dep-unit';

test('pkgEsDeps', async t => {
  const _ = await pkgEsDeps.prod('./fixtures/pkg-es-deps/package.json');
  const dep = depMock(['fixtures', 'pkg-es-deps']);
  t.deepEqual(_[0], dep(null, null, './main.js').resolved);
  t.deepEqual(_[1], dep('./a.js', './main.js', './a.js').resolved);
  t.deepEqual(_[2], dep('./b.js', './main.js', './b.js').resolved);
  t.is(_.length, 3);
});

test('pkgEsDeps :: unresolvable', t => t.throws(pkgEsDeps.prod(), TypeError));
test('pkgEsDeps :: invalid input', t => t.throws(pkgEsDeps.prod(2), TypeError));
test('pkgEsDeps :: invalid input', t => t.throws(pkgEsDeps.prod(2), TypeError));

test('pkgEsDepsTest', async t => {
  const _ = await pkgEsDeps.dev('./fixtures/pkg-es-deps-test/');
  const dep = depMock(['fixtures', 'pkg-es-deps-test']);
  t.deepEqual(_[0], dep(null, null, './test.js').resolved);
  t.deepEqual(_[1], dep('./index.js', './test.js', './index.js').resolved);
  t.is(_.length, 2);
});

test('pkgEsDepsTest :: unresolvable', t => t.throws(pkgEsDeps.dev(), TypeError));
test('pkgEsDepsTest :: invalid input', t => t.throws(pkgEsDeps.dev(2), TypeError));
test('pkgEsDepsTest :: invalid input', t => t.throws(pkgEsDeps.dev(2), TypeError));
