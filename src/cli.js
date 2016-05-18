/* eslint-disable no-underscore-dangle */
import path from 'path';
import R from 'ramda';
import Promise from 'pinkie-promise';
import { allFiles } from './fs';
import pkgEsDeps from './pkg-es-deps';
// import kit from 'es-dep-kit';
import loadJsonFile from 'load-json-file';
// import isBuiltinModule from 'is-builtin-module';
import kit from 'es-dep-kit';

const _declProdModules = R.pipe(R.prop('dependencies'), R.keys);
const _declDevModules = R.pipe(R.prop('devDependencies'), R.keys);

const preCwd = _ => path.join(process.cwd(), _);

const log = console.log; // eslint-disable-line
const err = console.error; // eslint-disable-line

const _files = R.pipe(
  R.filter(kit.isResolved),
  R.filter(R.either(kit.isEntry, kit.isRequestedLocalFile)),
  R.map(kit._resolved)
);

const _modules = R.pipe(
  R.filter(kit.isRequestedPackage),
  R.map(kit._requested)
);

// log('yo');
const relativeToCwd = _ => path.relative(process.cwd(), _);

Promise.all([
  loadJsonFile('./package.json'),
  pkgEsDeps.prod('./package.json'),
  pkgEsDeps.dev('./'),
  allFiles('./'),
]).then(([
  pkg,
  prodDeps,
  devDeps,
  _existingFiles,
]) => {
  const pkgName = pkg.name;
  const prodFiles = _files(prodDeps);
  const devFiles = _files(devDeps);

  const usedFiles = R.union(prodFiles, devFiles);
  const existingFiles = _existingFiles.map(preCwd);
  const unusedFiles = R.difference(existingFiles, usedFiles);

  const prodModules = _modules(prodDeps);
  const devModules = _modules(devDeps);
  const declaredProdModules = _declProdModules(pkg);
  const declaredDevModules = _declDevModules(pkg);
  const unusedProdModules = R.difference(declaredProdModules, prodModules);
  const unusedDevModules = R.difference(declaredDevModules, devModules);

  return {
    pkgName,
    usedFiles,
    existingFiles,
    unusedFiles,
    prodModules,
    devModules,
    declaredProdModules,
    declaredDevModules,
    unusedProdModules,
    unusedDevModules,
  };
}).then(_ => {
  log(`\`${_.pkgName}\` uses ${_.usedFiles.length} files out of ${_.existingFiles.length} existing`);
  log(`\`${_.pkgName}\` uses ${_.prodModules.length} prod modules out of ${_.declaredProdModules.length} declared`);
  log(`\`${_.pkgName}\` uses ${_.devModules.length} dev modules out of ${_.declaredDevModules.length} declared`);
  log('Unused Files:');
  log(_.unusedFiles.map(relativeToCwd).map(_ => `  ✗ ${_}`).join('\n'));
  log('Unused Prod Modules:');
  log(_.unusedProdModules.map(_ => `  ✗ ${_}`).join('\n'));
  log('Unused Dev Modules:');
  log(_.unusedDevModules.map(_ => `  ✗ ${_}`).join('\n'));
})
.catch(err);
