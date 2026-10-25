const test = require('node:test');
const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');
const {sha1Hex, checkBreach} = require('../static/password-check.js');

const password = 'correct horse battery staple';
const cryptoApi = webcrypto;

test('only a five-character prefix leaves the browser; padded entries ignored', async () => {
  const digest = await sha1Hex(password, cryptoApi);
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({url, options});
    return {ok:true, text:async () => `${'0'.repeat(35)}:0\r\n${digest.slice(5).toLowerCase()}:42\r\n`};
  };
  assert.deepEqual(await checkBreach(password, {fetchImpl, cryptoApi}), {status:'found', count:42});
  assert.equal(calls[0].url, `https://api.pwnedpasswords.com/range/${digest.slice(0, 5)}`);
  assert.equal(calls[0].options.headers['Add-Padding'], 'true');
  assert.equal(calls[0].url.includes(password), false);
  assert.equal(calls[0].options.body, undefined);
});

test('a valid no-match differs from unavailable responses', async () => {
  const options = {cryptoApi, fetchImpl:async () => ({ok:true,text:async () => `${'A'.repeat(35)}:3\n`})};
  assert.deepEqual(await checkBreach(password,options), {status:'not_found',count:0});
  for (const fetchImpl of [
    async () => ({ok:false}),
    async () => ({ok:true,text:async () => ''}),
    async () => ({ok:true,text:async () => 'malformed'}),
    async () => {throw new TypeError('offline')},
  ]) {
    assert.deepEqual(await checkBreach(password,{cryptoApi,fetchImpl}), {status:'unavailable',count:null});
  }
});

test('local strength bundle provides zxcvbn score', () => {
  const zxcvbn = require('../static/vendor/zxcvbn.js');
  const result = zxcvbn('password');
  assert.ok(result.score >= 0 && result.score <= 4);
  assert.ok(Array.isArray(result.feedback.suggestions));
});
