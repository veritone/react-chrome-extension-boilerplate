const bluebird = require('bluebird');

global.Promise = bluebird;

function promisifier(method) {
  // return a function
  return function promisified(...args) {
    // which returns a promise
    return new Promise((resolve) => {
      args.push(resolve);
      method.apply(this, args);
    });
  };
}

function promisifyAll(obj, list) {
  list.forEach(api => bluebird.promisifyAll(obj[api], { promisifier }));
}

// let chrome extension api support Promise
promisifyAll(chrome, [
  'tabs',
  'windows',
  'browserAction',
  'contextMenus'
]);
promisifyAll(chrome.storage, [
  'local',
]);

require('./background/contextMenus');
require('./background/inject');
require('./background/badge');

chrome.cookies.onChanged.addListener(data => {
  if (data.cookie.domain === '.veritone.com' && !data.removed) {
    if (
      data.cookie.name.includes('veritone-session-id') &&
      data.cookie.secure
    ) {
      data.cookie.url = 'https://www' + data.cookie.domain;
      data.cookie.httpOnly = false;
      data.cookie.secure = false;
      delete data.cookie.hostOnly;
      delete data.cookie.session;
      chrome.cookies.set(data.cookie);
    }
  }
});
