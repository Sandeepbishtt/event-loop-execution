/**
 * Simple lexical environment for variable storage.
 */
export class Environment {
  /** @param {Environment | null} [parent] */
  constructor(parent = null) {
    this.parent = parent
    this.bindings = new Map()
  }

  /** @param {string} name @param {*} value */
  define(name, value) {
    this.bindings.set(name, value)
  }

  /** @param {string} name @param {*} value */
  assign(name, value) {
    const env = this.resolve(name)
    if (!env) {
      throw new Error(`Undefined variable: ${name}`)
    }
    env.bindings.set(name, value)
  }

  /** @param {string} name */
  lookup(name) {
    const env = this.resolve(name)
    if (!env) {
      throw new Error(`Undefined variable: ${name}`)
    }
    return env.bindings.get(name)
  }

  /** @param {string} name */
  resolve(name) {
    if (this.bindings.has(name)) {
      return this
    }
    return this.parent?.resolve(name) ?? null
  }

  /** @returns {Environment} */
  createChild() {
    return new Environment(this)
  }
}
