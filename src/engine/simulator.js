import { parseCode, getLine } from './parser.js'
import { Environment } from './environment.js'
import { getInsight } from './insights.js'

/** @typedef {'sync'|'call'|'return'|'microtask'|'macrotask'|'timer'|'promise'} Phase */

/**
 * @typedef {object} ExecutionStep
 * @property {number} id
 * @property {Phase} phase
 * @property {string} description
 * @property {string[]} callStack
 * @property {string[]} microtaskQueue
 * @property {string[]} macrotaskQueue
 * @property {{ label: string }[]} webApis
 * @property {string[]} consoleOutput
 * @property {number} [highlightLine]
 * @property {string} [insight]
 * @property {string} [activeStackFrame]
 */

/**
 * @typedef {object} SimPromise
 * @property {'promise'} type
 * @property {'pending'|'fulfilled'|'rejected'} state
 * @property {*} value
 * @property {Array<ThenHandlerEntry>} onFulfilled
 * @property {Array<ThenHandlerEntry>} onRejected
 * @property {number} id
 */

/**
 * @typedef {object} ThenHandlerEntry
 * @property {SimPromise} childPromise
 * @property {string} label
 * @property {number} [sourceLine]
 * @property {number} [handlerLine]
 * @property {(value: *) => *} [handler]
 * @property {'fulfilled'|'rejected'} kind
 */

let promiseIdCounter = 0
let taskIdCounter = 0

/**
 * @returns {SimPromise}
 */
function createPromise() {
  return {
    type: 'promise',
    state: 'pending',
    value: undefined,
    onFulfilled: [],
    onRejected: [],
    id: ++promiseIdCounter,
  }
}

/**
 * Educational JS event-loop simulator (no eval).
 */
export class Simulator {
  constructor() {
    this.reset()
  }

  reset() {
    promiseIdCounter = 0
    taskIdCounter = 0
    /** @type {string[]} */
    this.callStack = []
    /** @type {Array<{ run: () => void, label: string }>} */
    this.microtaskQueue = []
    /** @type {Array<{ run: () => void, label: string }>} */
    this.macrotaskQueue = []
    /** @type {Array<{ label: string, delay: number, order: number, run: () => void }>} */
    this.webApis = []
    /** @type {string[]} */
    this.consoleOutput = []
    /** @type {ExecutionStep[]} */
    this.steps = []
    this.env = new Environment()
    this.timerOrder = 0
    this.runningMicrotasks = false
    /** @type {number} */
    this.currentLine = 1
  }

  /**
   * @param {Phase} phase
   * @param {string} description
   * @param {number} [highlightLine]
   * @param {string} [insightKey]
   */
  recordStep(phase, description, highlightLine, insightKey) {
    if (highlightLine !== undefined) {
      this.currentLine = highlightLine
    }
    const line = highlightLine ?? this.currentLine
    const insight = insightKey ? getInsight(insightKey) : undefined
    const activeStackFrame =
      this.callStack.length > 0 ? this.callStack[this.callStack.length - 1] : undefined

    this.steps.push({
      id: this.steps.length,
      phase,
      description,
      callStack: [...this.callStack],
      microtaskQueue: this.microtaskQueue.map((t) => t.label),
      macrotaskQueue: this.macrotaskQueue.map((t) => t.label),
      webApis: this.webApis.map((t) => ({ label: t.label })),
      consoleOutput: [...this.consoleOutput],
      highlightLine: line,
      insight,
      activeStackFrame,
    })
  }

  /**
   * @param {() => void} run
   * @param {string} label
   * @param {number} [sourceLine]
   * @param {string} [insightKey]
   */
  enqueueMicrotask(run, label, sourceLine, insightKey = 'microtaskEnqueue') {
    this.microtaskQueue.push({ run, label, sourceLine })
    this.recordStep('microtask', `Enqueued microtask: ${label}`, sourceLine, insightKey)
  }

  /**
   * @param {SimPromise} promise
   * @param {*} value
   */
  /**
   * @param {SimPromise} promise
   * @param {*} value
   */
  resolvePromise(promise, value) {
    if (promise.state !== 'pending') {
      this.recordStep(
        'promise',
        `resolve() ignored — Promise #${promise.id} already ${promise.state}`,
        undefined,
        'settleIgnored',
      )
      return
    }
    promise.state = 'fulfilled'
    promise.value = value
    this.recordStep('promise', `Promise #${promise.id} fulfilled`, undefined, 'promiseFulfilled')

    for (const entry of promise.onFulfilled) {
      this.scheduleThenMicrotask(entry, value)
    }
  }

  /**
   * @param {SimPromise} promise
   * @param {*} reason
   */
  rejectPromise(promise, reason) {
    if (promise.state !== 'pending') {
      this.recordStep(
        'promise',
        `reject() ignored — Promise #${promise.id} already ${promise.state}`,
        undefined,
        'settleIgnored',
      )
      return
    }
    promise.state = 'rejected'
    promise.value = reason
    this.recordStep('promise', `Promise #${promise.id} rejected`, undefined, 'promiseRejected')

    for (const entry of promise.onRejected) {
      this.scheduleThenMicrotask(entry, reason)
    }
  }

  /**
   * @param {ThenHandlerEntry} entry
   * @param {*} settledValue
   */
  scheduleThenMicrotask(entry, settledValue) {
    const { label, childPromise, sourceLine, handlerLine, handler, kind } = entry
    const execLine = handlerLine ?? sourceLine

    this.enqueueMicrotask(() => {
      this.callStack.push(label)
      this.recordStep('microtask', `Running microtask: ${label}`, execLine, 'microtaskRun')
      try {
        if (handler) {
          const result = handler(settledValue)
          this.resolvePromise(childPromise, result)
        } else if (kind === 'fulfilled') {
          this.resolvePromise(childPromise, settledValue)
        } else {
          this.rejectPromise(childPromise, settledValue)
        }
      } catch (err) {
        this.rejectPromise(childPromise, err)
      } finally {
        this.callStack.pop()
        this.recordStep('return', `Finished microtask: ${label}`, execLine)
      }
    }, label, execLine)
  }

  /**
   * @param {SimPromise} promise
   * @param {((value: *) => *) | null} onFulfilled
   * @param {((reason: *) => *) | null} onRejected
   * @param {number} sourceLine
   * @param {string} [insightOverride]
   * @returns {SimPromise}
   */
  attachThenHandlers(promise, onFulfilled, onRejected, sourceLine, insightOverride) {
    const childPromise = createPromise()
    const fulfilledLabel = `Promise.then #${++taskIdCounter}`
    const rejectedLabel = `Promise.then reject #${++taskIdCounter}`

    const fulfilledEntry = {
      childPromise,
      label: fulfilledLabel,
      sourceLine,
      handlerLine: onFulfilled?.handlerLine ?? sourceLine,
      handler: onFulfilled?.handler ?? null,
      kind: 'fulfilled',
    }

    const rejectedEntry = {
      childPromise,
      label: rejectedLabel,
      sourceLine,
      handlerLine: onRejected?.handlerLine ?? sourceLine,
      handler: onRejected?.handler ?? null,
      kind: 'rejected',
    }

    const insightKey =
      insightOverride ??
      (promise.state === 'fulfilled'
        ? 'thenFulfilledPromise'
        : promise.state === 'rejected'
          ? 'thenRejectedPromise'
          : 'thenRegister')

    if (promise.state === 'fulfilled') {
      this.scheduleThenMicrotask(fulfilledEntry, promise.value)
      this.recordStep('promise', `Registered .then (already fulfilled): ${fulfilledLabel}`, sourceLine, insightKey)
    } else if (promise.state === 'rejected') {
      const entry = onRejected?.handler
        ? rejectedEntry
        : {
            childPromise,
            label: `Promise.then propagate #${++taskIdCounter}`,
            sourceLine,
            handler: null,
            kind: 'rejected',
          }
      this.scheduleThenMicrotask(entry, promise.value)
      this.recordStep('promise', `Registered .then (already rejected)`, sourceLine, insightKey)
    } else {
      promise.onFulfilled.push(fulfilledEntry)
      promise.onRejected.push(
        onRejected?.handler
          ? rejectedEntry
          : {
              childPromise,
              label: `Promise.then propagate #${++taskIdCounter}`,
              sourceLine,
              handler: null,
              kind: 'rejected',
            },
      )
      this.recordStep(
        'promise',
        `Registered .then handlers: ${fulfilledLabel}${onRejected?.handler ? ` + ${rejectedLabel}` : ''}`,
        sourceLine,
        insightKey,
      )
    }

    return childPromise
  }

  /**
   * Build a .then / .catch handler with correct line tracking.
   * @param {*} fnValue
   * @param {import('acorn').Expression | null | undefined} sourceNode
   * @param {number} line
   * @param {string} label
   * @returns {{ handler: ((arg: *) => *) | null, handlerLine: number }}
   */
  createThenHandler(fnValue, sourceNode, line, label) {
    const handlerLine = sourceNode ? getLine(sourceNode) ?? line : line

    if (fnValue?.type === 'method' && fnValue.method === 'log') {
      return {
        handlerLine,
        handler: (arg) => {
          const formatted = formatValue(arg)
          this.consoleOutput.push(formatted)
          this.recordStep('microtask', `console.log → "${formatted}"`, handlerLine, 'consoleLog')
          return undefined
        },
      }
    }

    if (fnValue?.type === 'function') {
      const bodyLine = getHandlerEntryLine(fnValue) ?? handlerLine
      return {
        handlerLine: bodyLine,
        handler: (arg) => this.callFunction(fnValue, [arg], bodyLine, label),
      }
    }

    if (fnValue !== null && fnValue !== undefined) {
      this.recordStep(
        'promise',
        'Non-function passed to .then — value passes through unchanged',
        handlerLine,
        'nonFunctionThen',
      )
    }

    return { handler: null, handlerLine }
  }

  drainMicrotasks() {
    while (this.microtaskQueue.length > 0) {
      const task = this.microtaskQueue.shift()
      this.recordStep('microtask', `Dequeuing microtask: ${task.label}`, task.sourceLine, 'microtaskDrain')
      task.run()
    }
  }

  moveReadyTimersToMacrotaskQueue() {
    const ready = [...this.webApis].sort((a, b) => a.delay - b.delay || a.order - b.order)
    if (ready.length === 0) return

    this.webApis = []
    for (const timer of ready) {
      this.macrotaskQueue.push({
        label: timer.label,
        run: timer.run,
        sourceLine: timer.sourceLine,
      })
      this.recordStep('timer', `Timer ready → macrotask: ${timer.label}`, timer.sourceLine, 'timerReady')
    }
  }

  runEventLoop() {
    this.moveReadyTimersToMacrotaskQueue()

    while (
      this.microtaskQueue.length > 0 ||
      this.macrotaskQueue.length > 0 ||
      this.webApis.length > 0
    ) {
      this.drainMicrotasks()

      if (this.macrotaskQueue.length > 0) {
        const task = this.macrotaskQueue.shift()
        this.callStack.push(task.label)
        this.recordStep('macrotask', `Running macrotask: ${task.label}`, task.sourceLine, 'macrotaskRun')
        task.run()
        this.callStack.pop()
        this.recordStep('return', `Finished macrotask: ${task.label}`)
      } else if (this.webApis.length > 0) {
        this.moveReadyTimersToMacrotaskQueue()
      } else {
        break
      }
    }
  }

  /**
   * @param {string} source
   * @returns {{ steps: ExecutionStep[], output: string[] }}
   */
  run(source) {
    this.reset()
    const ast = parseCode(source)

    this.callStack.push('main()')
    this.recordStep('sync', 'Start synchronous execution', 1, 'syncStart')

    for (const statement of ast.body) {
      this.executeStatement(statement)
    }

    this.callStack.pop()
    this.recordStep('sync', 'Synchronous execution complete', undefined, 'syncComplete')

    this.runEventLoop()

    return {
      steps: this.steps,
      output: [...this.consoleOutput],
    }
  }

  /** @param {import('acorn').Statement} node */
  executeStatement(node) {
    const line = getLine(node)

    switch (node.type) {
      case 'ExpressionStatement':
        this.evaluate(node.expression)
        break
      case 'VariableDeclaration':
        for (const decl of node.declarations) {
          const value = decl.init
            ? this.evaluate(decl.init, getLine(decl.init))
            : undefined
          this.env.define(decl.id.name, value)
          this.recordStep('sync', `Declare ${decl.id.name}`, line)
        }
        break
      case 'FunctionDeclaration':
        this.env.define(node.id.name, {
          type: 'function',
          node,
          name: node.id.name,
        })
        this.recordStep('sync', `Declare function ${node.id.name}`, line)
        break
      default:
        throw new Error(
          `Unsupported statement at line ${line}: ${node.type}. Try a curated interview question.`,
        )
    }
  }

  /**
   * @param {import('acorn').Expression} node
   * @param {number} [parentLine]
   * @returns {*}
   */
  evaluate(node, parentLine) {
    const line = getLine(node) ?? parentLine ?? 1

    switch (node.type) {
      case 'Literal':
        return node.value
      case 'Identifier':
        if (node.name === 'undefined') return undefined
        if (node.name === 'Promise') return { type: 'builtin', name: 'Promise' }
        if (node.name === 'console') return { type: 'builtin', name: 'console' }
        if (node.name === 'setTimeout') return { type: 'builtin', name: 'setTimeout' }
        if (node.name === 'queueMicrotask') return { type: 'builtin', name: 'queueMicrotask' }
        return this.env.lookup(node.name)
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        return { type: 'function', node, name: 'anonymous' }
      case 'UnaryExpression':
        if (node.operator === 'void') {
          this.evaluate(node.argument, line)
          return undefined
        }
        throw new Error(`Unsupported unary operator: ${node.operator}`)
      case 'BinaryExpression':
        return this.evaluateBinary(node, line)
      case 'CallExpression': {
        const callee = node.callee
        if (callee.type === 'MemberExpression') {
          return this.evaluateMemberCall(callee, node.arguments, line)
        }
        const fn = this.evaluate(callee)
        const args = node.arguments.map((arg) => this.evaluate(arg))
        return this.callFunction(fn, args, line, 'call')
      }
      case 'NewExpression': {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Promise') {
          return this.createNewPromise(node.arguments[0], line)
        }
        throw new Error(`Unsupported new expression at line ${line}`)
      }
      case 'MemberExpression': {
        const object = this.evaluate(node.object)
        const property = node.computed
          ? this.evaluate(node.property, line)
          : node.property.name
        if (object?.type === 'builtin' && object.name === 'console' && property === 'log') {
          return { type: 'method', object, method: 'log' }
        }
        if (object?.type === 'promise' && property === 'then') {
          return { type: 'promiseThen', promise: object }
        }
        throw new Error(`Unsupported member access at line ${line}: ${property}`)
      }
      default:
        throw new Error(`Unsupported expression at line ${line}: ${node.type}`)
    }
  }

  /**
   * @param {import('acorn').MemberExpression} callee
   * @param {import('acorn').Expression[]} args
   * @param {number} line
   */
  evaluateMemberCall(callee, args, line) {
    const memberLine = getLine(callee.property) ?? line
    const object = this.evaluate(callee.object)
    const property = callee.computed
      ? this.evaluate(callee.property, memberLine)
      : callee.property.name

    if (object?.type === 'builtin' && object.name === 'Promise' && property === 'resolve') {
      const value = args[0] ? this.evaluate(args[0], line) : undefined
      const promise = createPromise()
      this.resolvePromise(promise, value)
      this.recordStep('promise', `Promise.resolve() → Promise #${promise.id}`, memberLine)
      return promise
    }

    if (object?.type === 'builtin' && object.name === 'Promise' && property === 'reject') {
      const reason = args[0] ? this.evaluate(args[0]) : undefined
      const promise = createPromise()
      this.rejectPromise(promise, reason)
      this.recordStep('promise', `Promise.reject() → Promise #${promise.id}`, memberLine)
      return promise
    }

    if (object?.type === 'builtin' && object.name === 'console' && property === 'log') {
      const values = args.map((arg) => this.evaluate(arg))
      const formatted = values.map((v) => formatValue(v)).join(' ')
      this.consoleOutput.push(formatted)
      this.recordStep('sync', `console.log → "${formatted}"`, memberLine, 'consoleLog')
      return undefined
    }

    if (object?.type === 'promise' && (property === 'then' || property === 'catch')) {
      const isChained = callee.object?.type === 'CallExpression'
      const insightKey = isChained ? 'chainedThen' : undefined
      const fulfilledLabel = `Promise.then #${taskIdCounter + 1}`
      const rejectedLabel = `Promise.then reject #${taskIdCounter + 2}`

      const fulfilledArgNode = property === 'catch' ? null : args[0]
      const rejectedArgNode = property === 'catch' ? args[0] : args[1]

      const onFulfilled =
        property === 'catch'
          ? { handler: null, handlerLine: memberLine }
          : this.createThenHandler(
              fulfilledArgNode ? this.evaluate(fulfilledArgNode) : null,
              fulfilledArgNode,
              memberLine,
              fulfilledLabel,
            )

      const onRejected = this.createThenHandler(
        rejectedArgNode ? this.evaluate(rejectedArgNode) : null,
        rejectedArgNode,
        memberLine,
        rejectedLabel,
      )

      return this.attachThenHandlers(object, onFulfilled, onRejected, memberLine, insightKey)
    }

    throw new Error(`Unsupported method call at line ${line}: ${property}`)
  }

  /**
   * @param {*} fn
   * @param {*} args
   * @param {number} line
   * @param {string} label
   */
  callFunction(fn, args, line, label) {
    if (typeof fn === 'function' && !fn?.type) {
      if (fn.__simName === 'resolve') {
        this.recordStep('promise', 'resolve() called', line, 'resolveCall')
      }
      if (fn.__simName === 'reject') {
        this.recordStep('promise', 'reject() called', line, 'rejectCall')
      }
      return fn(...args)
    }

    if (fn?.type === 'builtin' && fn.name === 'setTimeout') {
      const callback = args[0]
      const delay = args[1] ?? 0
      const timerLabel = `setTimeout callback #${++taskIdCounter}`
      const order = ++this.timerOrder
      const callbackLine = callback?.type === 'function' ? getHandlerEntryLine(callback) : line

      this.webApis.push({
        label: `${timerLabel} (${delay}ms)`,
        delay: Number(delay),
        order,
        sourceLine: callbackLine ?? line,
        run: () => {
          if (callback?.type === 'function') {
            this.callFunction(callback, [], callbackLine ?? line, timerLabel)
          }
        },
      })
      this.recordStep('timer', `setTimeout registered (${delay}ms) → Web APIs`, line, 'setTimeoutRegister')
      return undefined
    }

    if (fn?.type === 'builtin' && fn.name === 'queueMicrotask') {
      const callback = args[0]
      const microLabel = `queueMicrotask #${++taskIdCounter}`
      this.enqueueMicrotask(() => {
        if (callback?.type === 'function') {
          this.callFunction(callback, [], line, microLabel)
        }
      }, microLabel)
      return undefined
    }

    if (fn?.type === 'builtin' && fn.name === 'Promise') {
      const method = args.length
      if (method === 0) throw new Error('Promise static method missing')
      return undefined
    }

    if (fn?.type === 'function') {
      this.callStack.push(label)
      const callInsight = label.includes('Promise executor') ? 'promiseExecutor' : undefined
      this.recordStep('call', `Call ${label}`, line, callInsight)
      const result = this.executeFunctionBody(fn, args)
      this.callStack.pop()
      this.recordStep('return', `Return from ${label}`, line)
      return result
    }

    throw new Error(`Unsupported function call at line ${line}`)
  }

  /**
   * @param {*} executor
   * @param {number} line
   * @returns {SimPromise}
   */
  createNewPromise(executorNode, line) {
    const promise = createPromise()
    this.recordStep('promise', `new Promise #${promise.id} created`, line, 'promiseCreated')

    const executor =
      executorNode?.type === 'ArrowFunctionExpression' ||
      executorNode?.type === 'FunctionExpression'
        ? { type: 'function', node: executorNode, name: 'anonymous' }
        : this.evaluate(executorNode, line)

    if (executor?.type === 'function') {
      const resolve = Object.assign((value) => this.resolvePromise(promise, value), {
        __simName: 'resolve',
      })
      const reject = Object.assign((value) => this.rejectPromise(promise, value), {
        __simName: 'reject',
      })
      this.callStack.push(`Promise executor #${promise.id}`)
      this.recordStep('call', `Run Promise executor #${promise.id}`, line)
      this.executeFunctionBody(executor, [resolve, reject])
      this.callStack.pop()
      this.recordStep('return', `Promise executor #${promise.id} finished`)
    }

    return promise
  }

  /**
   * @param {import('acorn').BinaryExpression} node
   * @param {number} line
   */
  evaluateBinary(node, line) {
    const left = this.evaluate(node.left, getLine(node.left) ?? line)
    const right = this.evaluate(node.right, getLine(node.right) ?? line)

    switch (node.operator) {
      case '+':
        return typeof left === 'string' || typeof right === 'string'
          ? String(left) + String(right)
          : Number(left) + Number(right)
      case '-':
        return Number(left) - Number(right)
      case '*':
        return Number(left) * Number(right)
      case '/':
        return Number(left) / Number(right)
      default:
        throw new Error(`Unsupported binary operator: ${node.operator}`)
    }
  }

  /**
   * @param {{ type: 'function', node: import('acorn').Node }} fn
   * @param {*} args
   */
  executeFunctionBody(fn, args) {
    const { node } = fn
    const env = this.env.createChild()

    if (node.params) {
      node.params.forEach((param, i) => {
        if (param.type === 'Identifier') {
          env.define(param.name, args[i])
        }
      })
    }

    const prevEnv = this.env
    this.env = env

    let result = undefined
    if (node.body.type === 'BlockStatement') {
      for (const stmt of node.body.body) {
        const stmtResult = this.executeStatementInFunction(stmt)
        if (stmtResult?.type === 'return') {
          result = stmtResult.value
          break
        }
      }
    } else {
      result = this.evaluate(node.body, getLine(node.body))
    }

    this.env = prevEnv
    return result
  }

  /** @param {import('acorn').Statement} node */
  executeStatementInFunction(node) {
    const line = getLine(node)

    switch (node.type) {
      case 'ExpressionStatement':
        this.evaluate(node.expression, line)
        return undefined
      case 'ReturnStatement': {
        const value = node.argument ? this.evaluate(node.argument, line) : undefined
        return { type: 'return', value }
      }
      case 'VariableDeclaration':
        for (const decl of node.declarations) {
          const value = decl.init ? this.evaluate(decl.init, getLine(decl.init)) : undefined
          this.env.define(decl.id.name, value)
        }
        return undefined
      default:
        throw new Error(`Unsupported statement in function at line ${line}: ${node.type}`)
    }
  }
}

/**
 * @param {*} value
 * @returns {string}
 */
/**
 * @param {{ type: 'function', node: import('acorn').Node }} fn
 * @returns {number | undefined}
 */
function getHandlerEntryLine(fn) {
  const { node } = fn
  if (!node?.body) return getLine(node)
  if (node.body.type === 'BlockStatement' && node.body.body.length > 0) {
    return getLine(node.body.body[0])
  }
  return getLine(node.body)
}

/**
 * @param {*} value
 * @returns {string}
 */
function formatValue(value) {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'object' && value?.type === 'promise') {
    return `Promise<${value.state}>`
  }
  return String(value)
}

/**
 * @param {string} source
 * @returns {{ steps: ExecutionStep[], output: string[] }}
 */
export function simulate(source) {
  const simulator = new Simulator()
  return simulator.run(source)
}
