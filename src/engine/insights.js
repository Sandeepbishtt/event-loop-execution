/**
 * Educational insights for tricky event-loop behavior.
 * @param {string} key
 * @returns {string | undefined}
 */
export function getInsight(key) {
  const insights = {
    syncStart:
      'Synchronous code always runs first, top to bottom, on the call stack. Nothing async runs until this finishes.',
    syncComplete:
      'Call stack is now empty. The event loop checks the microtask queue next — before any setTimeout callback.',
    promiseCreated:
      'new Promise(executor) runs the executor function immediately and synchronously on the call stack.',
    promiseExecutor:
      'You are inside the Promise executor. This is NOT a microtask — it runs right now, blocking the main thread.',
    resolveCall:
      'resolve() only marks the promise as fulfilled. It does NOT stop the executor — lines after resolve() still run synchronously.',
    rejectCall:
      'reject() marks the promise as rejected. Like resolve(), it does not stop the executor — but only the first settle call counts.',
    settleIgnored:
      'A promise can only settle once. Further resolve() or reject() calls are silently ignored.',
    promiseFulfilled:
      'The promise is fulfilled. Any .then handlers already registered will be scheduled as microtasks (not run yet if call stack is busy).',
    thenRegister:
      '.then(callback) does not run callback now. It registers a microtask that waits until the call stack is empty.',
    thenFulfilledPromise:
      'This promise is already fulfilled, so .then schedules its callback as a microtask immediately — but still not until sync code finishes.',
    promiseRejected:
      'The promise is rejected. The second .then argument (or .catch) will run as a microtask.',
    thenRejectedPromise:
      'This promise is already rejected — the error handler (2nd .then arg or .catch) runs as a microtask.',
    microtaskEnqueue:
      'Added to the microtask queue. Microtasks always run before the next macrotask (setTimeout).',
    microtaskRun:
      'Running a microtask — pushed onto the call stack. Microtasks must fully drain before any setTimeout callback.',
    microtaskDrain:
      'Draining the microtask queue. Even microtasks created during this drain run before moving on.',
    setTimeoutRegister:
      'setTimeout goes to Web APIs first. The callback is a macrotask — it waits until call stack is empty AND all microtasks finish.',
    timerReady:
      'Timer delay elapsed. Callback moves to the macrotask queue. Shorter delays run before longer ones.',
    macrotaskRun:
      'Running a macrotask (e.g. setTimeout callback). Only one macrotask per event loop turn, then microtasks drain again.',
    consoleLog:
      'console.log runs synchronously wherever it sits — call stack, executor, microtask, or macrotask.',
    chainedThen:
      'Chained .then: the second .then waits for the promise returned by the first .then — so 6 cannot run before 5.',
    nonFunctionThen:
      'If .then receives a non-function (like 3 or a Promise), it is ignored and the value passes through to the next step.',
  }

  return insights[key]
}
