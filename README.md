# strive 💪

Strive. Don't give up. Try a bunch of different approaches to get what you're looking for.

[![npm version](https://badge.fury.io/js/strive.svg)](https://badge.fury.io/js/strive)
[![Build Status](https://travis-ci.com/shalvah/strive.svg?branch=master)](https://travis-ci.com/shalvah/strive)
[![npm](https://img.shields.io/npm/dt/strive)](https://www.npmjs.com/package/strive)

Strive is a tool that allows you to try different techniques to accomplish a task, minus the boilerplate. Let's see how.

Suppose you were building an app that fetches song lyrics from some online services. The songs aren't popular, so there's no guarantee any single site (say, genius.com) will have them. So you have a couple of options. Here's how you could do this with strive:

```js
    const strategies = [
        function tryGeniusAPI() {
        // try calling genius.com API
        },

        function tryMusixMatchAPI() {
        },

        function tryLyricFindAPI() {
        },

        function tryLastFM() {
        },
    ];
const didWeGetTheLyrics = (result) => {
    // some function that checks the results for lyrics
    // and returns true or false
}

const strive = require("strive");
const { result, lastAttempt, success } = await strive({
    strategies,
    check: didWeGetTheLyrics,
});
```

Strive will run the first strategy, then check its result by passing it to the `check` function (`didWeGetTheLyrics`). If the check returns false, Strive will move on to the next strategy, and so forth. When one of the strategies gives a result that passes the check, Strive will exit, returning a Promise that resolves to this:
```
{
  result: <yourSongLyrics>, // whatever value the successful strategy returned,
  lastAttempt: "tryLyricFindAPI", // the name of the successful strategy
  success: true
}
``` 

If none of the strategies produces a passing result, the response from Strive will look like this:
```
{
  result: <emptyLyrics>, // whatever value the last strategy returned,
  lastAttempt: "tryLastFM", // the name of the last strategy in the list
  success: false
}
``` 

### An easier way - Using `values`
There's an easier way we could do this. Let's assume these site's APIs work in the same manner; the only thing different is the URLs. We could replace these separate strategies with a single _action_ and a list of the different values to try. The action is the actual work that's done (calling an API), the values are the parameters Strive uses for the action:

```js
    const values = [
        ["api.genius.com"],
        // You can pass multiple parameters
        ["api.musixmatch.com", apiKeys.musixmatch],
        ["lyricfind.com/api", apiKeys.lyricFind],
        ["api.last.fm", apiKeys.lastFM, {other: "parameter"}],
    ];
const { result, lastAttempt, success } = await strive({
    values,
    action: (apiUrl, apiKey, extraParams) => { /* Make the API call */ },
    check: didWeGetTheLyrics,
});
```

Strive will call the action with each set of values (URL, API key, extra parameters) until it gets a result that passes the check. The response from Strive is similar to when using strategies, with one change: the `lastAttempt` is the array index of the last value tried. 

### Using mutations
There's a middle ground between multiple `strategies` and multiple `values` with one `action`: multiple `mutations`, one `action`. Like before, the action is the actual work that's done (calling an API). The mutations provide Strive with the parameters for the action. Mutations, however, allow you to dynamically generate these parameters.


```js
    const mutations = [
        function useGeniusAPI() {
            if (song.isOld()) {
                return ["old-api.genius.com"];
            }
            return ["api.genius.com"];
        },

        function useMusixMatchAPI() {
            return ["api.musixmatch.com", apiKeys.musixmatch];
        },

        function useLyricFindAPI() {
            return ["lyricfind.com/api", apiKeys.lyricFind];
        },

        function useLastFM() {
            return ["api.last.fm", apiKeys.lastFM, {other: "parameter"}];
        },
    ];
const { result, lastAttempt, success } = await strive({
    mutations,
    action: (apiUrl, apiKey, extraParams) => { /* Make the API call */ },
    check: didWeGetTheLyrics,
});
```

Similar to when using values, each mutation only has to return an array containing the parameters for the action. The elements of the returned array will be used when calling the action. 

In the response from Strive, `lastAttempt` will be the name of the successful mutation, or the last mutation if none was successful.

## Important notes
### Function names
It is **not** recommended to use anonymous functions with Strive. This is because Strive uses the function's `name` property for logging and reporting purposes (`lastAttempt`). Anonymous functions do not have this value set.

```js
const tryAzLyrics = function () {};
const tryLyricsFind = () => {};
const strategies = [
    function tryGenius () {}, // 👍 This is good
    tryAzLyrics, // 👍 This is good
    tryLyricFind, // 👍 This is good
    function () {}, // ❌ Bad, anonymous function 
    () => {}, // ❌ Bad, anonymous function 
];
```

### Async operations
Strive will always return a Promise containing the result as described above. Async functions or functions returning Promises are also supported as mutations, actions and strategies; strive will await them before continuing. 

### Other options
There's a few other options you can pass to the `strive` function:

### `race`
Strive runs all strategies/actions sequentially by default. If you want to run all in parallel and return the first successful one, then pass in `race: true`.

Note that this only works when you have functions that return promises. Strive will fire all of them off and return the first successful one (that passes the check) using [`promise.any`](https://www.npmjs.com/package/promise.any).
 
```javascript
const { result, lastAttempt, success } = await strive({
    strategies,
    race: true,
    check: didWeGetTheLyrics,
});
```

You should use this if you have multiple asynchronous operations, and you want the first successful one, and you don't care which one it is. 

#### `ignoreErrors`
By default, if any errors are thrown _while performing your action or strategy_, strive will ignore them and move on to the next action/strategy (or return `undefined` if it's the final one).

> ⚠ Note that this is only while executing the `action` or any of the `strategies`. If an error occurs while executing one of the `mutations`, strive will quit and throw that error back at you.

If you want strive to quit when it encounters an error in an action or strategy, pass in `ignoreErrors: false`.

> ⚠ Note that when `race` is true and `ignoreErrors` is `false`, all errors will be ignored. Only if the last strategy fails is its error thrown.

#### `defaultValue`
By default, when strive runs through all the techniques and all of them fail the `check`, strive will return the following :

```
{
  result: <resultFromTheLastAttempt>,
  lastAttempt: <nameOfTheLastAttempt>,
  success: false,
}
```

You can specify a different value for the `result` by supplying a `defaultValue`. (Note that the `lastAttempt` and `success` values will still be as shown above.)

### Logging
Strive uses the [`debug` package](https://www.npmjs.com/package/debug) to log info about the strategy, mutation or value it's currently trying. The debug name is `lib:strive`. This means if you start your application with the environment variable `DEBUG=lib:strive` )or use a wildcard), you'll see log messages like this:

```
Trying value at 0: "api.genius.com"
Trying strategy tryGeniusAPI
Trying mutation useGeniusAPI
```
