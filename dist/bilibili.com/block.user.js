// ==UserScript==
// @name     B站用户屏蔽
// @namespace https://github.com/NateScarlet/Scripts/tree/master/user-script
// @description 隐藏不感兴趣的内容，支持用户、首页频道推广和广告。
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM.deleteValue
// @include	 https://search.bilibili.com/*
// @include	 https://space.bilibili.com/*
// @include	 https://www.bilibili.com/*
// @include	 https://live.bilibili.com/*
// @include	 https://t.bilibili.com/*
// @include	 https://message.bilibili.com/*
// @run-at   document-start
// @version   2026.02.04+7136145f
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key3, value) => key3 in obj ? __defProp(obj, key3, { enumerable: true, configurable: true, writable: true, value }) : obj[key3] = value;
  var __publicField = (obj, key3, value) => __defNormalProp(obj, typeof key3 !== "symbol" ? key3 + "" : key3, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // src/utils/isAbortError.ts
  function isAbortError(err) {
    return err instanceof DOMException && err.name === "AbortError";
  }

  // src/utils/Polling.ts
  var PollingContext = class {
    constructor() {
      /** stack 直到下次执行或中止轮询才会被清理 */
      this.cleanups = [];
      this.isDisposed = false;
      this.stopPolling = () => {
        this.dispose();
      };
      this.dispose = () => {
        if (this.isDisposed) {
          return;
        }
        this.isDisposed = true;
        while (this.cleanups.length > 0) {
          const cleanup = this.cleanups.pop();
          try {
            cleanup?.();
          } catch (err) {
            console.error(err);
          }
        }
      };
    }
    get signal() {
      if (this.lazySignal == null) {
        const ctr = new AbortController();
        this.cleanups.push(() => ctr.abort());
        this.lazySignal = ctr.signal;
      }
      return this.lazySignal;
    }
    get disposed() {
      return this.isDisposed;
    }
  };
  function createOptions({
    update: update2,
    scheduleNext = (next2) => {
      const handle = requestAnimationFrame(next2);
      return {
        dispose: () => cancelAnimationFrame(handle)
      };
    },
    onError
  }) {
    return {
      update: update2,
      scheduleNext,
      onError
    };
  }
  var Polling = class {
    constructor(...options) {
      this.start = () => {
        this.run();
      };
      this.stop = () => {
        this.active?.dispose();
      };
      this.options = createOptions(...options);
      this.start();
    }
    async run() {
      if (this.active != null) {
        return;
      }
      try {
        while (!this.active?.disposed) {
          const ctx = new PollingContext();
          this.active?.dispose();
          this.active = ctx;
          try {
            await this.options.update(ctx);
          } catch (err) {
            if (!isAbortError(err)) {
              this.options.onError?.(err);
            }
          }
          if (ctx.disposed) {
            return;
          }
          try {
            await new Promise((resolve, reject) => {
              if (ctx.disposed) {
                resolve();
                return;
              }
              ctx.cleanups.push(resolve);
              let nextTask;
              try {
                nextTask = this.options.scheduleNext(resolve);
                if (nextTask) {
                  const task = nextTask;
                  ctx.cleanups.push(() => task.dispose());
                }
              } catch (err) {
                reject(err);
              }
            });
          } catch (err) {
            ctx.dispose();
            this.options.onError?.(err);
          }
        }
      } finally {
        this.active?.dispose();
        this.active = void 0;
      }
    }
    get isRunning() {
      return this.active?.disposed === false;
    }
    dispose() {
      this.stop();
    }
  };

  // src/utils/waitUntil.ts
  async function waitUntil({
    ready,
    timeoutMs = 6e4,
    debounceMs = 500,
    onTimeout = () => {
      throw new Error("wait timeout");
    },
    scheduleNext = (next2) => setTimeout(next2, 100)
  }) {
    const startAt = performance.now();
    let readyAt = 0;
    do {
      if (await ready()) {
        if (!readyAt) {
          readyAt = performance.now();
        }
      } else {
        readyAt = 0;
      }
      await new Promise((resolve) => {
        scheduleNext(resolve);
      });
      if (performance.now() - startAt > timeoutMs) {
        return onTimeout();
      }
    } while (readyAt === 0 || performance.now() - readyAt <= debounceMs);
  }

  // node_modules/.pnpm/esm-env@1.2.2/node_modules/esm-env/true.js
  var true_default = true;

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/shared/utils.js
  var is_array = Array.isArray;
  var index_of = Array.prototype.indexOf;
  var includes = Array.prototype.includes;
  var array_from = Array.from;
  var define_property = Object.defineProperty;
  var get_descriptor = Object.getOwnPropertyDescriptor;
  var get_descriptors = Object.getOwnPropertyDescriptors;
  var object_prototype = Object.prototype;
  var array_prototype = Array.prototype;
  var get_prototype_of = Object.getPrototypeOf;
  var is_extensible = Object.isExtensible;
  function is_function(thing) {
    return typeof thing === "function";
  }
  var noop = () => {
  };
  function run_all(arr) {
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
  function deferred() {
    var resolve;
    var reject;
    var promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/constants.js
  var DERIVED = 1 << 1;
  var EFFECT = 1 << 2;
  var RENDER_EFFECT = 1 << 3;
  var MANAGED_EFFECT = 1 << 24;
  var BLOCK_EFFECT = 1 << 4;
  var BRANCH_EFFECT = 1 << 5;
  var ROOT_EFFECT = 1 << 6;
  var BOUNDARY_EFFECT = 1 << 7;
  var CONNECTED = 1 << 9;
  var CLEAN = 1 << 10;
  var DIRTY = 1 << 11;
  var MAYBE_DIRTY = 1 << 12;
  var INERT = 1 << 13;
  var DESTROYED = 1 << 14;
  var EFFECT_RAN = 1 << 15;
  var EFFECT_TRANSPARENT = 1 << 16;
  var EAGER_EFFECT = 1 << 17;
  var HEAD_EFFECT = 1 << 18;
  var EFFECT_PRESERVED = 1 << 19;
  var USER_EFFECT = 1 << 20;
  var EFFECT_OFFSCREEN = 1 << 25;
  var WAS_MARKED = 1 << 15;
  var REACTION_IS_UPDATING = 1 << 21;
  var ASYNC = 1 << 22;
  var ERROR_VALUE = 1 << 23;
  var STATE_SYMBOL = /* @__PURE__ */ Symbol("$state");
  var LEGACY_PROPS = /* @__PURE__ */ Symbol("legacy props");
  var LOADING_ATTR_SYMBOL = /* @__PURE__ */ Symbol("");
  var PROXY_PATH_SYMBOL = /* @__PURE__ */ Symbol("proxy path");
  var STALE_REACTION = new class StaleReactionError extends Error {
    constructor() {
      super(...arguments);
      __publicField(this, "name", "StaleReactionError");
      __publicField(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
    }
  }();
  var TEXT_NODE = 3;
  var COMMENT_NODE = 8;

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/shared/errors.js
  function lifecycle_outside_component(name) {
    if (true_default) {
      const error = new Error(`lifecycle_outside_component
\`${name}(...)\` can only be used during component initialisation
https://svelte.dev/e/lifecycle_outside_component`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/errors.js
  function async_derived_orphan() {
    if (true_default) {
      const error = new Error(`async_derived_orphan
Cannot create a \`$derived(...)\` with an \`await\` expression outside of an effect tree
https://svelte.dev/e/async_derived_orphan`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/async_derived_orphan`);
    }
  }
  function bind_invalid_checkbox_value() {
    if (true_default) {
      const error = new Error(`bind_invalid_checkbox_value
Using \`bind:value\` together with a checkbox input is not allowed. Use \`bind:checked\` instead
https://svelte.dev/e/bind_invalid_checkbox_value`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/bind_invalid_checkbox_value`);
    }
  }
  function derived_references_self() {
    if (true_default) {
      const error = new Error(`derived_references_self
A derived value cannot reference itself recursively
https://svelte.dev/e/derived_references_self`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/derived_references_self`);
    }
  }
  function effect_in_teardown(rune) {
    if (true_default) {
      const error = new Error(`effect_in_teardown
\`${rune}\` cannot be used inside an effect cleanup function
https://svelte.dev/e/effect_in_teardown`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/effect_in_teardown`);
    }
  }
  function effect_in_unowned_derived() {
    if (true_default) {
      const error = new Error(`effect_in_unowned_derived
Effect cannot be created inside a \`$derived\` value that was not itself created inside an effect
https://svelte.dev/e/effect_in_unowned_derived`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
    }
  }
  function effect_orphan(rune) {
    if (true_default) {
      const error = new Error(`effect_orphan
\`${rune}\` can only be used inside an effect (e.g. during component initialisation)
https://svelte.dev/e/effect_orphan`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/effect_orphan`);
    }
  }
  function effect_update_depth_exceeded() {
    if (true_default) {
      const error = new Error(`effect_update_depth_exceeded
Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
https://svelte.dev/e/effect_update_depth_exceeded`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
    }
  }
  function props_invalid_value(key3) {
    if (true_default) {
      const error = new Error(`props_invalid_value
Cannot do \`bind:${key3}={undefined}\` when \`${key3}\` has a fallback value
https://svelte.dev/e/props_invalid_value`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/props_invalid_value`);
    }
  }
  function rune_outside_svelte(rune) {
    if (true_default) {
      const error = new Error(`rune_outside_svelte
The \`${rune}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files
https://svelte.dev/e/rune_outside_svelte`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
    }
  }
  function state_descriptors_fixed() {
    if (true_default) {
      const error = new Error(`state_descriptors_fixed
Property descriptors defined on \`$state\` objects must contain \`value\` and always be \`enumerable\`, \`configurable\` and \`writable\`.
https://svelte.dev/e/state_descriptors_fixed`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
    }
  }
  function state_prototype_fixed() {
    if (true_default) {
      const error = new Error(`state_prototype_fixed
Cannot set prototype of \`$state\` object
https://svelte.dev/e/state_prototype_fixed`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
    }
  }
  function state_unsafe_mutation() {
    if (true_default) {
      const error = new Error(`state_unsafe_mutation
Updating state inside \`$derived(...)\`, \`$inspect(...)\` or a template expression is forbidden. If the value should not be reactive, declare it without \`$state\`
https://svelte.dev/e/state_unsafe_mutation`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
    }
  }
  function svelte_boundary_reset_onerror() {
    if (true_default) {
      const error = new Error(`svelte_boundary_reset_onerror
A \`<svelte:boundary>\` \`reset\` function cannot be called while an error is still being handled
https://svelte.dev/e/svelte_boundary_reset_onerror`);
      error.name = "Svelte error";
      throw error;
    } else {
      throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/constants.js
  var EACH_ITEM_REACTIVE = 1;
  var EACH_INDEX_REACTIVE = 1 << 1;
  var EACH_IS_CONTROLLED = 1 << 2;
  var EACH_IS_ANIMATED = 1 << 3;
  var EACH_ITEM_IMMUTABLE = 1 << 4;
  var PROPS_IS_IMMUTABLE = 1;
  var PROPS_IS_RUNES = 1 << 1;
  var PROPS_IS_UPDATED = 1 << 2;
  var PROPS_IS_BINDABLE = 1 << 3;
  var PROPS_IS_LAZY_INITIAL = 1 << 4;
  var TRANSITION_IN = 1;
  var TRANSITION_OUT = 1 << 1;
  var TRANSITION_GLOBAL = 1 << 2;
  var TEMPLATE_FRAGMENT = 1;
  var TEMPLATE_USE_IMPORT_NODE = 1 << 1;
  var TEMPLATE_USE_SVG = 1 << 2;
  var TEMPLATE_USE_MATHML = 1 << 3;
  var HYDRATION_START = "[";
  var HYDRATION_START_ELSE = "[!";
  var HYDRATION_END = "]";
  var HYDRATION_ERROR = {};
  var ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;
  var ELEMENT_IS_INPUT = 1 << 2;
  var UNINITIALIZED = /* @__PURE__ */ Symbol();
  var FILENAME = /* @__PURE__ */ Symbol("filename");
  var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/warnings.js
  var bold = "font-weight: bold";
  var normal = "font-weight: normal";
  function await_waterfall(name, location) {
    if (true_default) {
      console.warn(`%c[svelte] await_waterfall
%cAn async derived, \`${name}\` (${location}) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app
https://svelte.dev/e/await_waterfall`, bold, normal);
    } else {
      console.warn(`https://svelte.dev/e/await_waterfall`);
    }
  }
  function hydration_attribute_changed(attribute, html2, value) {
    if (true_default) {
      console.warn(`%c[svelte] hydration_attribute_changed
%cThe \`${attribute}\` attribute on \`${html2}\` changed its value between server and client renders. The client value, \`${value}\`, will be ignored in favour of the server value
https://svelte.dev/e/hydration_attribute_changed`, bold, normal);
    } else {
      console.warn(`https://svelte.dev/e/hydration_attribute_changed`);
    }
  }
  function hydration_mismatch(location) {
    if (true_default) {
      console.warn(
        `%c[svelte] hydration_mismatch
%c${location ? `Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near ${location}` : "Hydration failed because the initial UI does not match what was rendered on the server"}
https://svelte.dev/e/hydration_mismatch`,
        bold,
        normal
      );
    } else {
      console.warn(`https://svelte.dev/e/hydration_mismatch`);
    }
  }
  function state_proxy_equality_mismatch(operator) {
    if (true_default) {
      console.warn(`%c[svelte] state_proxy_equality_mismatch
%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${operator}\` will produce unexpected results
https://svelte.dev/e/state_proxy_equality_mismatch`, bold, normal);
    } else {
      console.warn(`https://svelte.dev/e/state_proxy_equality_mismatch`);
    }
  }
  function svelte_boundary_reset_noop() {
    if (true_default) {
      console.warn(`%c[svelte] svelte_boundary_reset_noop
%cA \`<svelte:boundary>\` \`reset\` function only resets the boundary the first time it is called
https://svelte.dev/e/svelte_boundary_reset_noop`, bold, normal);
    } else {
      console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/hydration.js
  var hydrating = false;
  function set_hydrating(value) {
    hydrating = value;
  }
  var hydrate_node;
  function set_hydrate_node(node) {
    if (node === null) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    return hydrate_node = node;
  }
  function hydrate_next() {
    return set_hydrate_node(get_next_sibling(hydrate_node));
  }
  function reset(node) {
    if (!hydrating) return;
    if (get_next_sibling(hydrate_node) !== null) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    hydrate_node = node;
  }
  function next(count = 1) {
    if (hydrating) {
      var i = count;
      var node = hydrate_node;
      while (i--) {
        node = /** @type {TemplateNode} */
        get_next_sibling(node);
      }
      hydrate_node = node;
    }
  }
  function skip_nodes(remove = true) {
    var depth = 0;
    var node = hydrate_node;
    while (true) {
      if (node.nodeType === COMMENT_NODE) {
        var data = (
          /** @type {Comment} */
          node.data
        );
        if (data === HYDRATION_END) {
          if (depth === 0) return node;
          depth -= 1;
        } else if (data === HYDRATION_START || data === HYDRATION_START_ELSE) {
          depth += 1;
        }
      }
      var next2 = (
        /** @type {TemplateNode} */
        get_next_sibling(node)
      );
      if (remove) node.remove();
      node = next2;
    }
  }
  function read_hydration_instruction(node) {
    if (!node || node.nodeType !== COMMENT_NODE) {
      hydration_mismatch();
      throw HYDRATION_ERROR;
    }
    return (
      /** @type {Comment} */
      node.data
    );
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/equality.js
  function equals(value) {
    return value === this.v;
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
  }
  function safe_equals(value) {
    return !safe_not_equal(value, this.v);
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/flags/index.js
  var async_mode_flag = false;
  var legacy_mode_flag = false;
  var tracing_mode_flag = false;

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dev/tracing.js
  var tracing_expressions = null;
  function tag(source2, label) {
    source2.label = label;
    tag_proxy(source2.v, label);
    return source2;
  }
  function tag_proxy(value, label) {
    value?.[PROXY_PATH_SYMBOL]?.(label);
    return value;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/shared/dev.js
  function get_error(label) {
    const error = new Error();
    const stack2 = get_stack();
    if (stack2.length === 0) {
      return null;
    }
    stack2.unshift("\n");
    define_property(error, "stack", {
      value: stack2.join("\n")
    });
    define_property(error, "name", {
      value: label
    });
    return (
      /** @type {Error & { stack: string }} */
      error
    );
  }
  function get_stack() {
    const limit = Error.stackTraceLimit;
    Error.stackTraceLimit = Infinity;
    const stack2 = new Error().stack;
    Error.stackTraceLimit = limit;
    if (!stack2) return [];
    const lines = stack2.split("\n");
    const new_lines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const posixified = line.replaceAll("\\", "/");
      if (line.trim() === "Error") {
        continue;
      }
      if (line.includes("validate_each_keys")) {
        return [];
      }
      if (posixified.includes("svelte/src/internal") || posixified.includes("node_modules/.vite")) {
        continue;
      }
      new_lines.push(line);
    }
    return new_lines;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/context.js
  var component_context = null;
  function set_component_context(context) {
    component_context = context;
  }
  var dev_stack = null;
  function set_dev_stack(stack2) {
    dev_stack = stack2;
  }
  var dev_current_component_function = null;
  function set_dev_current_component_function(fn) {
    dev_current_component_function = fn;
  }
  function push(props, runes = false, fn) {
    component_context = {
      p: component_context,
      i: false,
      c: null,
      e: null,
      s: props,
      x: null,
      l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
    };
    if (true_default) {
      component_context.function = fn;
      dev_current_component_function = fn;
    }
  }
  function pop(component2) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    var effects = context.e;
    if (effects !== null) {
      context.e = null;
      for (var fn of effects) {
        create_user_effect(fn);
      }
    }
    if (component2 !== void 0) {
      context.x = component2;
    }
    context.i = true;
    component_context = context.p;
    if (true_default) {
      dev_current_component_function = component_context?.function ?? null;
    }
    return component2 ?? /** @type {T} */
    {};
  }
  function is_runes() {
    return !legacy_mode_flag || component_context !== null && component_context.l === null;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/task.js
  var micro_tasks = [];
  function run_micro_tasks() {
    var tasks = micro_tasks;
    micro_tasks = [];
    run_all(tasks);
  }
  function queue_micro_task(fn) {
    if (micro_tasks.length === 0 && !is_flushing_sync) {
      var tasks = micro_tasks;
      queueMicrotask(() => {
        if (tasks === micro_tasks) run_micro_tasks();
      });
    }
    micro_tasks.push(fn);
  }
  function flush_tasks() {
    while (micro_tasks.length > 0) {
      run_micro_tasks();
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/error-handling.js
  var adjustments = /* @__PURE__ */ new WeakMap();
  function handle_error(error) {
    var effect2 = active_effect;
    if (effect2 === null) {
      active_reaction.f |= ERROR_VALUE;
      return error;
    }
    if (true_default && error instanceof Error && !adjustments.has(error)) {
      adjustments.set(error, get_adjustments(error, effect2));
    }
    if ((effect2.f & EFFECT_RAN) === 0) {
      if ((effect2.f & BOUNDARY_EFFECT) === 0) {
        if (true_default && !effect2.parent && error instanceof Error) {
          apply_adjustments(error);
        }
        throw error;
      }
      effect2.b.error(error);
    } else {
      invoke_error_boundary(error, effect2);
    }
  }
  function invoke_error_boundary(error, effect2) {
    while (effect2 !== null) {
      if ((effect2.f & BOUNDARY_EFFECT) !== 0) {
        try {
          effect2.b.error(error);
          return;
        } catch (e) {
          error = e;
        }
      }
      effect2 = effect2.parent;
    }
    if (true_default && error instanceof Error) {
      apply_adjustments(error);
    }
    throw error;
  }
  function get_adjustments(error, effect2) {
    const message_descriptor = get_descriptor(error, "message");
    if (message_descriptor && !message_descriptor.configurable) return;
    var indent = is_firefox ? "  " : "	";
    var component_stack = `
${indent}in ${effect2.fn?.name || "<unknown>"}`;
    var context = effect2.ctx;
    while (context !== null) {
      component_stack += `
${indent}in ${context.function?.[FILENAME].split("/").pop()}`;
      context = context.p;
    }
    return {
      message: error.message + `
${component_stack}
`,
      stack: error.stack?.split("\n").filter((line) => !line.includes("svelte/src/internal")).join("\n")
    };
  }
  function apply_adjustments(error) {
    const adjusted = adjustments.get(error);
    if (adjusted) {
      define_property(error, "message", {
        value: adjusted.message
      });
      define_property(error, "stack", {
        value: adjusted.stack
      });
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/status.js
  var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
  function set_signal_status(signal, status) {
    signal.f = signal.f & STATUS_MASK | status;
  }
  function update_derived_status(derived3) {
    if ((derived3.f & CONNECTED) !== 0 || derived3.deps === null) {
      set_signal_status(derived3, CLEAN);
    } else {
      set_signal_status(derived3, MAYBE_DIRTY);
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/utils.js
  function clear_marked(deps) {
    if (deps === null) return;
    for (const dep of deps) {
      if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
        continue;
      }
      dep.f ^= WAS_MARKED;
      clear_marked(
        /** @type {Derived} */
        dep.deps
      );
    }
  }
  function defer_effect(effect2, dirty_effects, maybe_dirty_effects) {
    if ((effect2.f & DIRTY) !== 0) {
      dirty_effects.add(effect2);
    } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
      maybe_dirty_effects.add(effect2);
    }
    clear_marked(effect2.deps);
    set_signal_status(effect2, CLEAN);
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/batch.js
  var batches = /* @__PURE__ */ new Set();
  var current_batch = null;
  var previous_batch = null;
  var batch_values = null;
  var queued_root_effects = [];
  var last_scheduled_effect = null;
  var is_flushing = false;
  var is_flushing_sync = false;
  var _commit_callbacks, _discard_callbacks, _pending, _blocking_pending, _deferred, _dirty_effects, _maybe_dirty_effects, _decrement_queued, _Batch_instances, traverse_effect_tree_fn, defer_effects_fn, commit_fn;
  var _Batch = class _Batch {
    constructor() {
      __privateAdd(this, _Batch_instances);
      __publicField(this, "committed", false);
      /**
       * The current values of any sources that are updated in this batch
       * They keys of this map are identical to `this.#previous`
       * @type {Map<Source, any>}
       */
      __publicField(this, "current", /* @__PURE__ */ new Map());
      /**
       * The values of any sources that are updated in this batch _before_ those updates took place.
       * They keys of this map are identical to `this.#current`
       * @type {Map<Source, any>}
       */
      __publicField(this, "previous", /* @__PURE__ */ new Map());
      /**
       * When the batch is committed (and the DOM is updated), we need to remove old branches
       * and append new ones by calling the functions added inside (if/each/key/etc) blocks
       * @type {Set<() => void>}
       */
      __privateAdd(this, _commit_callbacks, /* @__PURE__ */ new Set());
      /**
       * If a fork is discarded, we need to destroy any effects that are no longer needed
       * @type {Set<(batch: Batch) => void>}
       */
      __privateAdd(this, _discard_callbacks, /* @__PURE__ */ new Set());
      /**
       * The number of async effects that are currently in flight
       */
      __privateAdd(this, _pending, 0);
      /**
       * The number of async effects that are currently in flight, _not_ inside a pending boundary
       */
      __privateAdd(this, _blocking_pending, 0);
      /**
       * A deferred that resolves when the batch is committed, used with `settled()`
       * TODO replace with Promise.withResolvers once supported widely enough
       * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
       */
      __privateAdd(this, _deferred, null);
      /**
       * Deferred effects (which run after async work has completed) that are DIRTY
       * @type {Set<Effect>}
       */
      __privateAdd(this, _dirty_effects, /* @__PURE__ */ new Set());
      /**
       * Deferred effects that are MAYBE_DIRTY
       * @type {Set<Effect>}
       */
      __privateAdd(this, _maybe_dirty_effects, /* @__PURE__ */ new Set());
      /**
       * A set of branches that still exist, but will be destroyed when this batch
       * is committed — we skip over these during `process`
       * @type {Set<Effect>}
       */
      __publicField(this, "skipped_effects", /* @__PURE__ */ new Set());
      __publicField(this, "is_fork", false);
      __privateAdd(this, _decrement_queued, false);
    }
    is_deferred() {
      return this.is_fork || __privateGet(this, _blocking_pending) > 0;
    }
    /**
     *
     * @param {Effect[]} root_effects
     */
    process(root_effects) {
      queued_root_effects = [];
      this.apply();
      var effects = [];
      var render_effects = [];
      for (const root15 of root_effects) {
        __privateMethod(this, _Batch_instances, traverse_effect_tree_fn).call(this, root15, effects, render_effects);
      }
      if (this.is_deferred()) {
        __privateMethod(this, _Batch_instances, defer_effects_fn).call(this, render_effects);
        __privateMethod(this, _Batch_instances, defer_effects_fn).call(this, effects);
        for (const e of this.skipped_effects) {
          reset_branch(e);
        }
      } else {
        for (const fn of __privateGet(this, _commit_callbacks)) fn();
        __privateGet(this, _commit_callbacks).clear();
        if (__privateGet(this, _pending) === 0) {
          __privateMethod(this, _Batch_instances, commit_fn).call(this);
        }
        previous_batch = this;
        current_batch = null;
        flush_queued_effects(render_effects);
        flush_queued_effects(effects);
        previous_batch = null;
        __privateGet(this, _deferred)?.resolve();
      }
      batch_values = null;
    }
    /**
     * Associate a change to a given source with the current
     * batch, noting its previous and current values
     * @param {Source} source
     * @param {any} value
     */
    capture(source2, value) {
      if (value !== UNINITIALIZED && !this.previous.has(source2)) {
        this.previous.set(source2, value);
      }
      if ((source2.f & ERROR_VALUE) === 0) {
        this.current.set(source2, source2.v);
        batch_values?.set(source2, source2.v);
      }
    }
    activate() {
      current_batch = this;
      this.apply();
    }
    deactivate() {
      if (current_batch !== this) return;
      current_batch = null;
      batch_values = null;
    }
    flush() {
      this.activate();
      if (queued_root_effects.length > 0) {
        flush_effects();
        if (current_batch !== null && current_batch !== this) {
          return;
        }
      } else if (__privateGet(this, _pending) === 0) {
        this.process([]);
      }
      this.deactivate();
    }
    discard() {
      for (const fn of __privateGet(this, _discard_callbacks)) fn(this);
      __privateGet(this, _discard_callbacks).clear();
    }
    /**
     *
     * @param {boolean} blocking
     */
    increment(blocking) {
      __privateSet(this, _pending, __privateGet(this, _pending) + 1);
      if (blocking) __privateSet(this, _blocking_pending, __privateGet(this, _blocking_pending) + 1);
    }
    /**
     *
     * @param {boolean} blocking
     */
    decrement(blocking) {
      __privateSet(this, _pending, __privateGet(this, _pending) - 1);
      if (blocking) __privateSet(this, _blocking_pending, __privateGet(this, _blocking_pending) - 1);
      if (__privateGet(this, _decrement_queued)) return;
      __privateSet(this, _decrement_queued, true);
      queue_micro_task(() => {
        __privateSet(this, _decrement_queued, false);
        if (!this.is_deferred()) {
          this.revive();
        } else if (queued_root_effects.length > 0) {
          this.flush();
        }
      });
    }
    revive() {
      for (const e of __privateGet(this, _dirty_effects)) {
        __privateGet(this, _maybe_dirty_effects).delete(e);
        set_signal_status(e, DIRTY);
        schedule_effect(e);
      }
      for (const e of __privateGet(this, _maybe_dirty_effects)) {
        set_signal_status(e, MAYBE_DIRTY);
        schedule_effect(e);
      }
      this.flush();
    }
    /** @param {() => void} fn */
    oncommit(fn) {
      __privateGet(this, _commit_callbacks).add(fn);
    }
    /** @param {(batch: Batch) => void} fn */
    ondiscard(fn) {
      __privateGet(this, _discard_callbacks).add(fn);
    }
    settled() {
      return (__privateGet(this, _deferred) ?? __privateSet(this, _deferred, deferred())).promise;
    }
    static ensure() {
      if (current_batch === null) {
        const batch = current_batch = new _Batch();
        batches.add(current_batch);
        if (!is_flushing_sync) {
          queue_micro_task(() => {
            if (current_batch !== batch) {
              return;
            }
            batch.flush();
          });
        }
      }
      return current_batch;
    }
    apply() {
      if (!async_mode_flag || !this.is_fork && batches.size === 1) return;
      batch_values = new Map(this.current);
      for (const batch of batches) {
        if (batch === this) continue;
        for (const [source2, previous] of batch.previous) {
          if (!batch_values.has(source2)) {
            batch_values.set(source2, previous);
          }
        }
      }
    }
  };
  _commit_callbacks = new WeakMap();
  _discard_callbacks = new WeakMap();
  _pending = new WeakMap();
  _blocking_pending = new WeakMap();
  _deferred = new WeakMap();
  _dirty_effects = new WeakMap();
  _maybe_dirty_effects = new WeakMap();
  _decrement_queued = new WeakMap();
  _Batch_instances = new WeakSet();
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  traverse_effect_tree_fn = function(root15, effects, render_effects) {
    root15.f ^= CLEAN;
    var effect2 = root15.first;
    var pending_boundary = null;
    while (effect2 !== null) {
      var flags2 = effect2.f;
      var is_branch = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
      var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
      var skip = is_skippable_branch || (flags2 & INERT) !== 0 || this.skipped_effects.has(effect2);
      if (async_mode_flag && pending_boundary === null && (flags2 & BOUNDARY_EFFECT) !== 0 && effect2.b?.is_pending) {
        pending_boundary = effect2;
      }
      if (!skip && effect2.fn !== null) {
        if (is_branch) {
          effect2.f ^= CLEAN;
        } else if (pending_boundary !== null && (flags2 & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
          pending_boundary.b.defer_effect(effect2);
        } else if ((flags2 & EFFECT) !== 0) {
          effects.push(effect2);
        } else if (async_mode_flag && (flags2 & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
          render_effects.push(effect2);
        } else if (is_dirty(effect2)) {
          if ((flags2 & BLOCK_EFFECT) !== 0) __privateGet(this, _maybe_dirty_effects).add(effect2);
          update_effect(effect2);
        }
        var child2 = effect2.first;
        if (child2 !== null) {
          effect2 = child2;
          continue;
        }
      }
      var parent = effect2.parent;
      effect2 = effect2.next;
      while (effect2 === null && parent !== null) {
        if (parent === pending_boundary) {
          pending_boundary = null;
        }
        effect2 = parent.next;
        parent = parent.parent;
      }
    }
  };
  /**
   * @param {Effect[]} effects
   */
  defer_effects_fn = function(effects) {
    for (var i = 0; i < effects.length; i += 1) {
      defer_effect(effects[i], __privateGet(this, _dirty_effects), __privateGet(this, _maybe_dirty_effects));
    }
  };
  commit_fn = function() {
    var _a3;
    if (batches.size > 1) {
      this.previous.clear();
      var previous_batch_values = batch_values;
      var is_earlier = true;
      for (const batch of batches) {
        if (batch === this) {
          is_earlier = false;
          continue;
        }
        const sources = [];
        for (const [source2, value] of this.current) {
          if (batch.current.has(source2)) {
            if (is_earlier && value !== batch.current.get(source2)) {
              batch.current.set(source2, value);
            } else {
              continue;
            }
          }
          sources.push(source2);
        }
        if (sources.length === 0) {
          continue;
        }
        const others = [...batch.current.keys()].filter((s) => !this.current.has(s));
        if (others.length > 0) {
          var prev_queued_root_effects = queued_root_effects;
          queued_root_effects = [];
          const marked = /* @__PURE__ */ new Set();
          const checked = /* @__PURE__ */ new Map();
          for (const source2 of sources) {
            mark_effects(source2, others, marked, checked);
          }
          if (queued_root_effects.length > 0) {
            current_batch = batch;
            batch.apply();
            for (const root15 of queued_root_effects) {
              __privateMethod(_a3 = batch, _Batch_instances, traverse_effect_tree_fn).call(_a3, root15, [], []);
            }
            batch.deactivate();
          }
          queued_root_effects = prev_queued_root_effects;
        }
      }
      current_batch = null;
      batch_values = previous_batch_values;
    }
    this.committed = true;
    batches.delete(this);
  };
  var Batch = _Batch;
  function flushSync(fn) {
    var was_flushing_sync = is_flushing_sync;
    is_flushing_sync = true;
    try {
      var result;
      if (fn) {
        if (current_batch !== null) {
          flush_effects();
        }
        result = fn();
      }
      while (true) {
        flush_tasks();
        if (queued_root_effects.length === 0) {
          current_batch?.flush();
          if (queued_root_effects.length === 0) {
            last_scheduled_effect = null;
            return (
              /** @type {T} */
              result
            );
          }
        }
        flush_effects();
      }
    } finally {
      is_flushing_sync = was_flushing_sync;
    }
  }
  function flush_effects() {
    is_flushing = true;
    var source_stacks = true_default ? /* @__PURE__ */ new Set() : null;
    try {
      var flush_count = 0;
      while (queued_root_effects.length > 0) {
        var batch = Batch.ensure();
        if (flush_count++ > 1e3) {
          if (true_default) {
            var updates = /* @__PURE__ */ new Map();
            for (const source2 of batch.current.keys()) {
              for (const [stack2, update2] of source2.updated ?? []) {
                var entry = updates.get(stack2);
                if (!entry) {
                  entry = { error: update2.error, count: 0 };
                  updates.set(stack2, entry);
                }
                entry.count += update2.count;
              }
            }
            for (const update2 of updates.values()) {
              if (update2.error) {
                console.error(update2.error);
              }
            }
          }
          infinite_loop_guard();
        }
        batch.process(queued_root_effects);
        old_values.clear();
        if (true_default) {
          for (const source2 of batch.current.keys()) {
            source_stacks.add(source2);
          }
        }
      }
    } finally {
      is_flushing = false;
      last_scheduled_effect = null;
      if (true_default) {
        for (
          const source2 of
          /** @type {Set<Source>} */
          source_stacks
        ) {
          source2.updated = null;
        }
      }
    }
  }
  function infinite_loop_guard() {
    try {
      effect_update_depth_exceeded();
    } catch (error) {
      if (true_default) {
        define_property(error, "stack", { value: "" });
      }
      invoke_error_boundary(error, last_scheduled_effect);
    }
  }
  var eager_block_effects = null;
  function flush_queued_effects(effects) {
    var length = effects.length;
    if (length === 0) return;
    var i = 0;
    while (i < length) {
      var effect2 = effects[i++];
      if ((effect2.f & (DESTROYED | INERT)) === 0 && is_dirty(effect2)) {
        eager_block_effects = /* @__PURE__ */ new Set();
        update_effect(effect2);
        if (effect2.deps === null && effect2.first === null && effect2.nodes === null) {
          if (effect2.teardown === null && effect2.ac === null) {
            unlink_effect(effect2);
          } else {
            effect2.fn = null;
          }
        }
        if (eager_block_effects?.size > 0) {
          old_values.clear();
          for (const e of eager_block_effects) {
            if ((e.f & (DESTROYED | INERT)) !== 0) continue;
            const ordered_effects = [e];
            let ancestor = e.parent;
            while (ancestor !== null) {
              if (eager_block_effects.has(ancestor)) {
                eager_block_effects.delete(ancestor);
                ordered_effects.push(ancestor);
              }
              ancestor = ancestor.parent;
            }
            for (let j = ordered_effects.length - 1; j >= 0; j--) {
              const e2 = ordered_effects[j];
              if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
              update_effect(e2);
            }
          }
          eager_block_effects.clear();
        }
      }
    }
    eager_block_effects = null;
  }
  function mark_effects(value, sources, marked, checked) {
    if (marked.has(value)) return;
    marked.add(value);
    if (value.reactions !== null) {
      for (const reaction of value.reactions) {
        const flags2 = reaction.f;
        if ((flags2 & DERIVED) !== 0) {
          mark_effects(
            /** @type {Derived} */
            reaction,
            sources,
            marked,
            checked
          );
        } else if ((flags2 & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags2 & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
          set_signal_status(reaction, DIRTY);
          schedule_effect(
            /** @type {Effect} */
            reaction
          );
        }
      }
    }
  }
  function depends_on(reaction, sources, checked) {
    const depends = checked.get(reaction);
    if (depends !== void 0) return depends;
    if (reaction.deps !== null) {
      for (const dep of reaction.deps) {
        if (includes.call(sources, dep)) {
          return true;
        }
        if ((dep.f & DERIVED) !== 0 && depends_on(
          /** @type {Derived} */
          dep,
          sources,
          checked
        )) {
          checked.set(
            /** @type {Derived} */
            dep,
            true
          );
          return true;
        }
      }
    }
    checked.set(reaction, false);
    return false;
  }
  function schedule_effect(signal) {
    var effect2 = last_scheduled_effect = signal;
    while (effect2.parent !== null) {
      effect2 = effect2.parent;
      var flags2 = effect2.f;
      if (is_flushing && effect2 === active_effect && (flags2 & BLOCK_EFFECT) !== 0 && (flags2 & HEAD_EFFECT) === 0) {
        return;
      }
      if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
        if ((flags2 & CLEAN) === 0) return;
        effect2.f ^= CLEAN;
      }
    }
    queued_root_effects.push(effect2);
  }
  function reset_branch(effect2) {
    if ((effect2.f & BRANCH_EFFECT) !== 0 && (effect2.f & CLEAN) !== 0) {
      return;
    }
    set_signal_status(effect2, CLEAN);
    var e = effect2.first;
    while (e !== null) {
      reset_branch(e);
      e = e.next;
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/reactivity/create-subscriber.js
  function createSubscriber(start) {
    let subscribers = 0;
    let version = source(0);
    let stop;
    if (true_default) {
      tag(version, "createSubscriber version");
    }
    return () => {
      if (effect_tracking()) {
        get(version);
        render_effect(() => {
          if (subscribers === 0) {
            stop = untrack(() => start(() => increment(version)));
          }
          subscribers += 1;
          return () => {
            queue_micro_task(() => {
              subscribers -= 1;
              if (subscribers === 0) {
                stop?.();
                stop = void 0;
                increment(version);
              }
            });
          };
        });
      }
    };
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
  var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;
  function boundary(node, props, children) {
    new Boundary(node, props, children);
  }
  var _anchor, _hydrate_open, _props, _children, _effect, _main_effect, _pending_effect, _failed_effect, _offscreen_fragment, _pending_anchor, _local_pending_count, _pending_count, _pending_count_update_queued, _is_creating_fallback, _dirty_effects2, _maybe_dirty_effects2, _effect_pending, _effect_pending_subscriber, _Boundary_instances, hydrate_resolved_content_fn, hydrate_pending_content_fn, get_anchor_fn, run_fn, show_pending_snippet_fn, update_pending_count_fn;
  var Boundary = class {
    /**
     * @param {TemplateNode} node
     * @param {BoundaryProps} props
     * @param {((anchor: Node) => void)} children
     */
    constructor(node, props, children) {
      __privateAdd(this, _Boundary_instances);
      /** @type {Boundary | null} */
      __publicField(this, "parent");
      __publicField(this, "is_pending", false);
      /** @type {TemplateNode} */
      __privateAdd(this, _anchor);
      /** @type {TemplateNode | null} */
      __privateAdd(this, _hydrate_open, hydrating ? hydrate_node : null);
      /** @type {BoundaryProps} */
      __privateAdd(this, _props);
      /** @type {((anchor: Node) => void)} */
      __privateAdd(this, _children);
      /** @type {Effect} */
      __privateAdd(this, _effect);
      /** @type {Effect | null} */
      __privateAdd(this, _main_effect, null);
      /** @type {Effect | null} */
      __privateAdd(this, _pending_effect, null);
      /** @type {Effect | null} */
      __privateAdd(this, _failed_effect, null);
      /** @type {DocumentFragment | null} */
      __privateAdd(this, _offscreen_fragment, null);
      /** @type {TemplateNode | null} */
      __privateAdd(this, _pending_anchor, null);
      __privateAdd(this, _local_pending_count, 0);
      __privateAdd(this, _pending_count, 0);
      __privateAdd(this, _pending_count_update_queued, false);
      __privateAdd(this, _is_creating_fallback, false);
      /** @type {Set<Effect>} */
      __privateAdd(this, _dirty_effects2, /* @__PURE__ */ new Set());
      /** @type {Set<Effect>} */
      __privateAdd(this, _maybe_dirty_effects2, /* @__PURE__ */ new Set());
      /**
       * A source containing the number of pending async deriveds/expressions.
       * Only created if `$effect.pending()` is used inside the boundary,
       * otherwise updating the source results in needless `Batch.ensure()`
       * calls followed by no-op flushes
       * @type {Source<number> | null}
       */
      __privateAdd(this, _effect_pending, null);
      __privateAdd(this, _effect_pending_subscriber, createSubscriber(() => {
        __privateSet(this, _effect_pending, source(__privateGet(this, _local_pending_count)));
        if (true_default) {
          tag(__privateGet(this, _effect_pending), "$effect.pending()");
        }
        return () => {
          __privateSet(this, _effect_pending, null);
        };
      }));
      __privateSet(this, _anchor, node);
      __privateSet(this, _props, props);
      __privateSet(this, _children, children);
      this.parent = /** @type {Effect} */
      active_effect.b;
      this.is_pending = !!__privateGet(this, _props).pending;
      __privateSet(this, _effect, block(() => {
        active_effect.b = this;
        if (hydrating) {
          const comment2 = __privateGet(this, _hydrate_open);
          hydrate_next();
          const server_rendered_pending = (
            /** @type {Comment} */
            comment2.nodeType === COMMENT_NODE && /** @type {Comment} */
            comment2.data === HYDRATION_START_ELSE
          );
          if (server_rendered_pending) {
            __privateMethod(this, _Boundary_instances, hydrate_pending_content_fn).call(this);
          } else {
            __privateMethod(this, _Boundary_instances, hydrate_resolved_content_fn).call(this);
            if (__privateGet(this, _pending_count) === 0) {
              this.is_pending = false;
            }
          }
        } else {
          var anchor = __privateMethod(this, _Boundary_instances, get_anchor_fn).call(this);
          try {
            __privateSet(this, _main_effect, branch(() => children(anchor)));
          } catch (error) {
            this.error(error);
          }
          if (__privateGet(this, _pending_count) > 0) {
            __privateMethod(this, _Boundary_instances, show_pending_snippet_fn).call(this);
          } else {
            this.is_pending = false;
          }
        }
        return () => {
          __privateGet(this, _pending_anchor)?.remove();
        };
      }, flags));
      if (hydrating) {
        __privateSet(this, _anchor, hydrate_node);
      }
    }
    /**
     * Defer an effect inside a pending boundary until the boundary resolves
     * @param {Effect} effect
     */
    defer_effect(effect2) {
      defer_effect(effect2, __privateGet(this, _dirty_effects2), __privateGet(this, _maybe_dirty_effects2));
    }
    /**
     * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
     * @returns {boolean}
     */
    is_rendered() {
      return !this.is_pending && (!this.parent || this.parent.is_rendered());
    }
    has_pending_snippet() {
      return !!__privateGet(this, _props).pending;
    }
    /**
     * Update the source that powers `$effect.pending()` inside this boundary,
     * and controls when the current `pending` snippet (if any) is removed.
     * Do not call from inside the class
     * @param {1 | -1} d
     */
    update_pending_count(d) {
      __privateMethod(this, _Boundary_instances, update_pending_count_fn).call(this, d);
      __privateSet(this, _local_pending_count, __privateGet(this, _local_pending_count) + d);
      if (!__privateGet(this, _effect_pending) || __privateGet(this, _pending_count_update_queued)) return;
      __privateSet(this, _pending_count_update_queued, true);
      queue_micro_task(() => {
        __privateSet(this, _pending_count_update_queued, false);
        if (__privateGet(this, _effect_pending)) {
          internal_set(__privateGet(this, _effect_pending), __privateGet(this, _local_pending_count));
        }
      });
    }
    get_effect_pending() {
      __privateGet(this, _effect_pending_subscriber).call(this);
      return get(
        /** @type {Source<number>} */
        __privateGet(this, _effect_pending)
      );
    }
    /** @param {unknown} error */
    error(error) {
      var onerror = __privateGet(this, _props).onerror;
      let failed = __privateGet(this, _props).failed;
      if (__privateGet(this, _is_creating_fallback) || !onerror && !failed) {
        throw error;
      }
      if (__privateGet(this, _main_effect)) {
        destroy_effect(__privateGet(this, _main_effect));
        __privateSet(this, _main_effect, null);
      }
      if (__privateGet(this, _pending_effect)) {
        destroy_effect(__privateGet(this, _pending_effect));
        __privateSet(this, _pending_effect, null);
      }
      if (__privateGet(this, _failed_effect)) {
        destroy_effect(__privateGet(this, _failed_effect));
        __privateSet(this, _failed_effect, null);
      }
      if (hydrating) {
        set_hydrate_node(
          /** @type {TemplateNode} */
          __privateGet(this, _hydrate_open)
        );
        next();
        set_hydrate_node(skip_nodes());
      }
      var did_reset = false;
      var calling_on_error = false;
      const reset2 = () => {
        if (did_reset) {
          svelte_boundary_reset_noop();
          return;
        }
        did_reset = true;
        if (calling_on_error) {
          svelte_boundary_reset_onerror();
        }
        Batch.ensure();
        __privateSet(this, _local_pending_count, 0);
        if (__privateGet(this, _failed_effect) !== null) {
          pause_effect(__privateGet(this, _failed_effect), () => {
            __privateSet(this, _failed_effect, null);
          });
        }
        this.is_pending = this.has_pending_snippet();
        __privateSet(this, _main_effect, __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
          __privateSet(this, _is_creating_fallback, false);
          return branch(() => __privateGet(this, _children).call(this, __privateGet(this, _anchor)));
        }));
        if (__privateGet(this, _pending_count) > 0) {
          __privateMethod(this, _Boundary_instances, show_pending_snippet_fn).call(this);
        } else {
          this.is_pending = false;
        }
      };
      queue_micro_task(() => {
        try {
          calling_on_error = true;
          onerror?.(error, reset2);
          calling_on_error = false;
        } catch (error2) {
          invoke_error_boundary(error2, __privateGet(this, _effect) && __privateGet(this, _effect).parent);
        }
        if (failed) {
          __privateSet(this, _failed_effect, __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
            Batch.ensure();
            __privateSet(this, _is_creating_fallback, true);
            try {
              return branch(() => {
                failed(
                  __privateGet(this, _anchor),
                  () => error,
                  () => reset2
                );
              });
            } catch (error2) {
              invoke_error_boundary(
                error2,
                /** @type {Effect} */
                __privateGet(this, _effect).parent
              );
              return null;
            } finally {
              __privateSet(this, _is_creating_fallback, false);
            }
          }));
        }
      });
    }
  };
  _anchor = new WeakMap();
  _hydrate_open = new WeakMap();
  _props = new WeakMap();
  _children = new WeakMap();
  _effect = new WeakMap();
  _main_effect = new WeakMap();
  _pending_effect = new WeakMap();
  _failed_effect = new WeakMap();
  _offscreen_fragment = new WeakMap();
  _pending_anchor = new WeakMap();
  _local_pending_count = new WeakMap();
  _pending_count = new WeakMap();
  _pending_count_update_queued = new WeakMap();
  _is_creating_fallback = new WeakMap();
  _dirty_effects2 = new WeakMap();
  _maybe_dirty_effects2 = new WeakMap();
  _effect_pending = new WeakMap();
  _effect_pending_subscriber = new WeakMap();
  _Boundary_instances = new WeakSet();
  hydrate_resolved_content_fn = function() {
    try {
      __privateSet(this, _main_effect, branch(() => __privateGet(this, _children).call(this, __privateGet(this, _anchor))));
    } catch (error) {
      this.error(error);
    }
  };
  hydrate_pending_content_fn = function() {
    const pending2 = __privateGet(this, _props).pending;
    if (!pending2) return;
    __privateSet(this, _pending_effect, branch(() => pending2(__privateGet(this, _anchor))));
    queue_micro_task(() => {
      var anchor = __privateMethod(this, _Boundary_instances, get_anchor_fn).call(this);
      __privateSet(this, _main_effect, __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
        Batch.ensure();
        return branch(() => __privateGet(this, _children).call(this, anchor));
      }));
      if (__privateGet(this, _pending_count) > 0) {
        __privateMethod(this, _Boundary_instances, show_pending_snippet_fn).call(this);
      } else {
        pause_effect(
          /** @type {Effect} */
          __privateGet(this, _pending_effect),
          () => {
            __privateSet(this, _pending_effect, null);
          }
        );
        this.is_pending = false;
      }
    });
  };
  get_anchor_fn = function() {
    var anchor = __privateGet(this, _anchor);
    if (this.is_pending) {
      __privateSet(this, _pending_anchor, create_text());
      __privateGet(this, _anchor).before(__privateGet(this, _pending_anchor));
      anchor = __privateGet(this, _pending_anchor);
    }
    return anchor;
  };
  /**
   * @param {() => Effect | null} fn
   */
  run_fn = function(fn) {
    var previous_effect = active_effect;
    var previous_reaction = active_reaction;
    var previous_ctx = component_context;
    set_active_effect(__privateGet(this, _effect));
    set_active_reaction(__privateGet(this, _effect));
    set_component_context(__privateGet(this, _effect).ctx);
    try {
      return fn();
    } catch (e) {
      handle_error(e);
      return null;
    } finally {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_ctx);
    }
  };
  show_pending_snippet_fn = function() {
    const pending2 = (
      /** @type {(anchor: Node) => void} */
      __privateGet(this, _props).pending
    );
    if (__privateGet(this, _main_effect) !== null) {
      __privateSet(this, _offscreen_fragment, document.createDocumentFragment());
      __privateGet(this, _offscreen_fragment).append(
        /** @type {TemplateNode} */
        __privateGet(this, _pending_anchor)
      );
      move_effect(__privateGet(this, _main_effect), __privateGet(this, _offscreen_fragment));
    }
    if (__privateGet(this, _pending_effect) === null) {
      __privateSet(this, _pending_effect, branch(() => pending2(__privateGet(this, _anchor))));
    }
  };
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   */
  update_pending_count_fn = function(d) {
    var _a3;
    if (!this.has_pending_snippet()) {
      if (this.parent) {
        __privateMethod(_a3 = this.parent, _Boundary_instances, update_pending_count_fn).call(_a3, d);
      }
      return;
    }
    __privateSet(this, _pending_count, __privateGet(this, _pending_count) + d);
    if (__privateGet(this, _pending_count) === 0) {
      this.is_pending = false;
      for (const e of __privateGet(this, _dirty_effects2)) {
        set_signal_status(e, DIRTY);
        schedule_effect(e);
      }
      for (const e of __privateGet(this, _maybe_dirty_effects2)) {
        set_signal_status(e, MAYBE_DIRTY);
        schedule_effect(e);
      }
      __privateGet(this, _dirty_effects2).clear();
      __privateGet(this, _maybe_dirty_effects2).clear();
      if (__privateGet(this, _pending_effect)) {
        pause_effect(__privateGet(this, _pending_effect), () => {
          __privateSet(this, _pending_effect, null);
        });
      }
      if (__privateGet(this, _offscreen_fragment)) {
        __privateGet(this, _anchor).before(__privateGet(this, _offscreen_fragment));
        __privateSet(this, _offscreen_fragment, null);
      }
    }
  };

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/async.js
  function flatten(blockers, sync, async2, fn) {
    const d = is_runes() ? derived : derived_safe_equal;
    var pending2 = blockers.filter((b) => !b.settled);
    if (async2.length === 0 && pending2.length === 0) {
      fn(sync.map(d));
      return;
    }
    var batch = current_batch;
    var parent = (
      /** @type {Effect} */
      active_effect
    );
    var restore = capture();
    var blocker_promise = pending2.length === 1 ? pending2[0].promise : pending2.length > 1 ? Promise.all(pending2.map((b) => b.promise)) : null;
    function finish(values) {
      restore();
      try {
        fn(values);
      } catch (error) {
        if ((parent.f & DESTROYED) === 0) {
          invoke_error_boundary(error, parent);
        }
      }
      batch?.deactivate();
      unset_context();
    }
    if (async2.length === 0) {
      blocker_promise.then(() => finish(sync.map(d)));
      return;
    }
    function run3() {
      restore();
      Promise.all(async2.map((expression) => async_derived(expression))).then((result) => finish([...sync.map(d), ...result])).catch((error) => invoke_error_boundary(error, parent));
    }
    if (blocker_promise) {
      blocker_promise.then(run3);
    } else {
      run3();
    }
  }
  function capture() {
    var previous_effect = active_effect;
    var previous_reaction = active_reaction;
    var previous_component_context = component_context;
    var previous_batch2 = current_batch;
    if (true_default) {
      var previous_dev_stack = dev_stack;
    }
    return function restore(activate_batch = true) {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_component_context);
      if (activate_batch) previous_batch2?.activate();
      if (true_default) {
        set_from_async_derived(null);
        set_dev_stack(previous_dev_stack);
      }
    };
  }
  function unset_context() {
    set_active_effect(null);
    set_active_reaction(null);
    set_component_context(null);
    if (true_default) {
      set_from_async_derived(null);
      set_dev_stack(null);
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/deriveds.js
  var current_async_effect = null;
  function set_from_async_derived(v) {
    current_async_effect = v;
  }
  var recent_async_deriveds = /* @__PURE__ */ new Set();
  // @__NO_SIDE_EFFECTS__
  function derived(fn) {
    var flags2 = DERIVED | DIRTY;
    var parent_derived = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
      /** @type {Derived} */
      active_reaction
    ) : null;
    if (active_effect !== null) {
      active_effect.f |= EFFECT_PRESERVED;
    }
    const signal = {
      ctx: component_context,
      deps: null,
      effects: null,
      equals,
      f: flags2,
      fn,
      reactions: null,
      rv: 0,
      v: (
        /** @type {V} */
        UNINITIALIZED
      ),
      wv: 0,
      parent: parent_derived ?? active_effect,
      ac: null
    };
    if (true_default && tracing_mode_flag) {
      signal.created = get_error("created at");
    }
    return signal;
  }
  // @__NO_SIDE_EFFECTS__
  function async_derived(fn, label, location) {
    let parent = (
      /** @type {Effect | null} */
      active_effect
    );
    if (parent === null) {
      async_derived_orphan();
    }
    var boundary2 = (
      /** @type {Boundary} */
      parent.b
    );
    var promise = (
      /** @type {Promise<V>} */
      /** @type {unknown} */
      void 0
    );
    var signal = source(
      /** @type {V} */
      UNINITIALIZED
    );
    if (true_default) signal.label = label;
    var should_suspend = !active_reaction;
    var deferreds = /* @__PURE__ */ new Map();
    async_effect(() => {
      if (true_default) current_async_effect = active_effect;
      var d = deferred();
      promise = d.promise;
      try {
        Promise.resolve(fn()).then(d.resolve, d.reject).then(() => {
          if (batch === current_batch && batch.committed) {
            batch.deactivate();
          }
          unset_context();
        });
      } catch (error) {
        d.reject(error);
        unset_context();
      }
      if (true_default) current_async_effect = null;
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      if (should_suspend) {
        var blocking = boundary2.is_rendered();
        boundary2.update_pending_count(1);
        batch.increment(blocking);
        deferreds.get(batch)?.reject(STALE_REACTION);
        deferreds.delete(batch);
        deferreds.set(batch, d);
      }
      const handler = (value, error = void 0) => {
        current_async_effect = null;
        batch.activate();
        if (error) {
          if (error !== STALE_REACTION) {
            signal.f |= ERROR_VALUE;
            internal_set(signal, error);
          }
        } else {
          if ((signal.f & ERROR_VALUE) !== 0) {
            signal.f ^= ERROR_VALUE;
          }
          internal_set(signal, value);
          for (const [b, d2] of deferreds) {
            deferreds.delete(b);
            if (b === batch) break;
            d2.reject(STALE_REACTION);
          }
          if (true_default && location !== void 0) {
            recent_async_deriveds.add(signal);
            setTimeout(() => {
              if (recent_async_deriveds.has(signal)) {
                await_waterfall(
                  /** @type {string} */
                  signal.label,
                  location
                );
                recent_async_deriveds.delete(signal);
              }
            });
          }
        }
        if (should_suspend) {
          boundary2.update_pending_count(-1);
          batch.decrement(blocking);
        }
      };
      d.promise.then(handler, (e) => handler(null, e || "unknown"));
    });
    teardown(() => {
      for (const d of deferreds.values()) {
        d.reject(STALE_REACTION);
      }
    });
    if (true_default) {
      signal.f |= ASYNC;
    }
    return new Promise((fulfil) => {
      function next2(p) {
        function go() {
          if (p === promise) {
            fulfil(signal);
          } else {
            next2(promise);
          }
        }
        p.then(go, go);
      }
      next2(promise);
    });
  }
  // @__NO_SIDE_EFFECTS__
  function user_derived(fn) {
    const d = /* @__PURE__ */ derived(fn);
    if (!async_mode_flag) push_reaction_value(d);
    return d;
  }
  // @__NO_SIDE_EFFECTS__
  function derived_safe_equal(fn) {
    const signal = /* @__PURE__ */ derived(fn);
    signal.equals = safe_equals;
    return signal;
  }
  function destroy_derived_effects(derived3) {
    var effects = derived3.effects;
    if (effects !== null) {
      derived3.effects = null;
      for (var i = 0; i < effects.length; i += 1) {
        destroy_effect(
          /** @type {Effect} */
          effects[i]
        );
      }
    }
  }
  var stack = [];
  function get_derived_parent_effect(derived3) {
    var parent = derived3.parent;
    while (parent !== null) {
      if ((parent.f & DERIVED) === 0) {
        return (parent.f & DESTROYED) === 0 ? (
          /** @type {Effect} */
          parent
        ) : null;
      }
      parent = parent.parent;
    }
    return null;
  }
  function execute_derived(derived3) {
    var value;
    var prev_active_effect = active_effect;
    set_active_effect(get_derived_parent_effect(derived3));
    if (true_default) {
      let prev_eager_effects = eager_effects;
      set_eager_effects(/* @__PURE__ */ new Set());
      try {
        if (includes.call(stack, derived3)) {
          derived_references_self();
        }
        stack.push(derived3);
        derived3.f &= ~WAS_MARKED;
        destroy_derived_effects(derived3);
        value = update_reaction(derived3);
      } finally {
        set_active_effect(prev_active_effect);
        set_eager_effects(prev_eager_effects);
        stack.pop();
      }
    } else {
      try {
        derived3.f &= ~WAS_MARKED;
        destroy_derived_effects(derived3);
        value = update_reaction(derived3);
      } finally {
        set_active_effect(prev_active_effect);
      }
    }
    return value;
  }
  function update_derived(derived3) {
    var value = execute_derived(derived3);
    if (!derived3.equals(value)) {
      derived3.wv = increment_write_version();
      if (!current_batch?.is_fork || derived3.deps === null) {
        derived3.v = value;
        if (derived3.deps === null) {
          set_signal_status(derived3, CLEAN);
          return;
        }
      }
    }
    if (is_destroying_effect) {
      return;
    }
    if (batch_values !== null) {
      if (effect_tracking() || current_batch?.is_fork) {
        batch_values.set(derived3, value);
      }
    } else {
      update_derived_status(derived3);
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/sources.js
  var eager_effects = /* @__PURE__ */ new Set();
  var old_values = /* @__PURE__ */ new Map();
  function set_eager_effects(v) {
    eager_effects = v;
  }
  var eager_effects_deferred = false;
  function set_eager_effects_deferred() {
    eager_effects_deferred = true;
  }
  function source(v, stack2) {
    var signal = {
      f: 0,
      // TODO ideally we could skip this altogether, but it causes type errors
      v,
      reactions: null,
      equals,
      rv: 0,
      wv: 0
    };
    if (true_default && tracing_mode_flag) {
      signal.created = stack2 ?? get_error("created at");
      signal.updated = null;
      signal.set_during_effect = false;
      signal.trace = null;
    }
    return signal;
  }
  // @__NO_SIDE_EFFECTS__
  function state(v, stack2) {
    const s = source(v, stack2);
    push_reaction_value(s);
    return s;
  }
  // @__NO_SIDE_EFFECTS__
  function mutable_source(initial_value, immutable = false, trackable = true) {
    var _a3;
    const s = source(initial_value);
    if (!immutable) {
      s.equals = safe_equals;
    }
    if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
      ((_a3 = component_context.l).s ?? (_a3.s = [])).push(s);
    }
    return s;
  }
  function set(source2, value, should_proxy = false) {
    if (active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
    // to ensure we error if state is set inside an inspect effect
    (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !includes.call(current_sources, source2))) {
      state_unsafe_mutation();
    }
    let new_value = should_proxy ? proxy(value) : value;
    if (true_default) {
      tag_proxy(
        new_value,
        /** @type {string} */
        source2.label
      );
    }
    return internal_set(source2, new_value);
  }
  function internal_set(source2, value) {
    if (!source2.equals(value)) {
      var old_value = source2.v;
      if (is_destroying_effect) {
        old_values.set(source2, value);
      } else {
        old_values.set(source2, old_value);
      }
      source2.v = value;
      var batch = Batch.ensure();
      batch.capture(source2, old_value);
      if (true_default) {
        if (tracing_mode_flag || active_effect !== null) {
          source2.updated ?? (source2.updated = /* @__PURE__ */ new Map());
          const count = (source2.updated.get("")?.count ?? 0) + 1;
          source2.updated.set("", { error: (
            /** @type {any} */
            null
          ), count });
          if (tracing_mode_flag || count > 5) {
            const error = get_error("updated at");
            if (error !== null) {
              let entry = source2.updated.get(error.stack);
              if (!entry) {
                entry = { error, count: 0 };
                source2.updated.set(error.stack, entry);
              }
              entry.count++;
            }
          }
        }
        if (active_effect !== null) {
          source2.set_during_effect = true;
        }
      }
      if ((source2.f & DERIVED) !== 0) {
        const derived3 = (
          /** @type {Derived} */
          source2
        );
        if ((source2.f & DIRTY) !== 0) {
          execute_derived(derived3);
        }
        update_derived_status(derived3);
      }
      source2.wv = increment_write_version();
      mark_reactions(source2, DIRTY);
      if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
        if (untracked_writes === null) {
          set_untracked_writes([source2]);
        } else {
          untracked_writes.push(source2);
        }
      }
      if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
        flush_eager_effects();
      }
    }
    return value;
  }
  function flush_eager_effects() {
    eager_effects_deferred = false;
    for (const effect2 of eager_effects) {
      if ((effect2.f & CLEAN) !== 0) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      if (is_dirty(effect2)) {
        update_effect(effect2);
      }
    }
    eager_effects.clear();
  }
  function increment(source2) {
    set(source2, source2.v + 1);
  }
  function mark_reactions(signal, status) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    var runes = is_runes();
    var length = reactions.length;
    for (var i = 0; i < length; i++) {
      var reaction = reactions[i];
      var flags2 = reaction.f;
      if (!runes && reaction === active_effect) continue;
      if (true_default && (flags2 & EAGER_EFFECT) !== 0) {
        eager_effects.add(reaction);
        continue;
      }
      var not_dirty = (flags2 & DIRTY) === 0;
      if (not_dirty) {
        set_signal_status(reaction, status);
      }
      if ((flags2 & DERIVED) !== 0) {
        var derived3 = (
          /** @type {Derived} */
          reaction
        );
        batch_values?.delete(derived3);
        if ((flags2 & WAS_MARKED) === 0) {
          if (flags2 & CONNECTED) {
            reaction.f |= WAS_MARKED;
          }
          mark_reactions(derived3, MAYBE_DIRTY);
        }
      } else if (not_dirty) {
        if ((flags2 & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
          eager_block_effects.add(
            /** @type {Effect} */
            reaction
          );
        }
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/proxy.js
  var regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
  function proxy(value) {
    if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
      return value;
    }
    const prototype = get_prototype_of(value);
    if (prototype !== object_prototype && prototype !== array_prototype) {
      return value;
    }
    var sources = /* @__PURE__ */ new Map();
    var is_proxied_array = is_array(value);
    var version = state(0);
    var stack2 = true_default && tracing_mode_flag ? get_error("created at") : null;
    var parent_version = update_version;
    var with_parent = (fn) => {
      if (update_version === parent_version) {
        return fn();
      }
      var reaction = active_reaction;
      var version2 = update_version;
      set_active_reaction(null);
      set_update_version(parent_version);
      var result = fn();
      set_active_reaction(reaction);
      set_update_version(version2);
      return result;
    };
    if (is_proxied_array) {
      sources.set("length", state(
        /** @type {any[]} */
        value.length,
        stack2
      ));
      if (true_default) {
        value = /** @type {any} */
        inspectable_array(
          /** @type {any[]} */
          value
        );
      }
    }
    var path = "";
    let updating = false;
    function update_path(new_path) {
      if (updating) return;
      updating = true;
      path = new_path;
      tag(version, `${path} version`);
      for (const [prop2, source2] of sources) {
        tag(source2, get_label(path, prop2));
      }
      updating = false;
    }
    return new Proxy(
      /** @type {any} */
      value,
      {
        defineProperty(_, prop2, descriptor) {
          if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
            state_descriptors_fixed();
          }
          var s = sources.get(prop2);
          if (s === void 0) {
            s = with_parent(() => {
              var s2 = state(descriptor.value, stack2);
              sources.set(prop2, s2);
              if (true_default && typeof prop2 === "string") {
                tag(s2, get_label(path, prop2));
              }
              return s2;
            });
          } else {
            set(s, descriptor.value, true);
          }
          return true;
        },
        deleteProperty(target, prop2) {
          var s = sources.get(prop2);
          if (s === void 0) {
            if (prop2 in target) {
              const s2 = with_parent(() => state(UNINITIALIZED, stack2));
              sources.set(prop2, s2);
              increment(version);
              if (true_default) {
                tag(s2, get_label(path, prop2));
              }
            }
          } else {
            set(s, UNINITIALIZED);
            increment(version);
          }
          return true;
        },
        get(target, prop2, receiver) {
          if (prop2 === STATE_SYMBOL) {
            return value;
          }
          if (true_default && prop2 === PROXY_PATH_SYMBOL) {
            return update_path;
          }
          var s = sources.get(prop2);
          var exists = prop2 in target;
          if (s === void 0 && (!exists || get_descriptor(target, prop2)?.writable)) {
            s = with_parent(() => {
              var p = proxy(exists ? target[prop2] : UNINITIALIZED);
              var s2 = state(p, stack2);
              if (true_default) {
                tag(s2, get_label(path, prop2));
              }
              return s2;
            });
            sources.set(prop2, s);
          }
          if (s !== void 0) {
            var v = get(s);
            return v === UNINITIALIZED ? void 0 : v;
          }
          return Reflect.get(target, prop2, receiver);
        },
        getOwnPropertyDescriptor(target, prop2) {
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor && "value" in descriptor) {
            var s = sources.get(prop2);
            if (s) descriptor.value = get(s);
          } else if (descriptor === void 0) {
            var source2 = sources.get(prop2);
            var value2 = source2?.v;
            if (source2 !== void 0 && value2 !== UNINITIALIZED) {
              return {
                enumerable: true,
                configurable: true,
                value: value2,
                writable: true
              };
            }
          }
          return descriptor;
        },
        has(target, prop2) {
          if (prop2 === STATE_SYMBOL) {
            return true;
          }
          var s = sources.get(prop2);
          var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
          if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop2)?.writable)) {
            if (s === void 0) {
              s = with_parent(() => {
                var p = has ? proxy(target[prop2]) : UNINITIALIZED;
                var s2 = state(p, stack2);
                if (true_default) {
                  tag(s2, get_label(path, prop2));
                }
                return s2;
              });
              sources.set(prop2, s);
            }
            var value2 = get(s);
            if (value2 === UNINITIALIZED) {
              return false;
            }
          }
          return has;
        },
        set(target, prop2, value2, receiver) {
          var s = sources.get(prop2);
          var has = prop2 in target;
          if (is_proxied_array && prop2 === "length") {
            for (var i = value2; i < /** @type {Source<number>} */
            s.v; i += 1) {
              var other_s = sources.get(i + "");
              if (other_s !== void 0) {
                set(other_s, UNINITIALIZED);
              } else if (i in target) {
                other_s = with_parent(() => state(UNINITIALIZED, stack2));
                sources.set(i + "", other_s);
                if (true_default) {
                  tag(other_s, get_label(path, i));
                }
              }
            }
          }
          if (s === void 0) {
            if (!has || get_descriptor(target, prop2)?.writable) {
              s = with_parent(() => state(void 0, stack2));
              if (true_default) {
                tag(s, get_label(path, prop2));
              }
              set(s, proxy(value2));
              sources.set(prop2, s);
            }
          } else {
            has = s.v !== UNINITIALIZED;
            var p = with_parent(() => proxy(value2));
            set(s, p);
          }
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor?.set) {
            descriptor.set.call(receiver, value2);
          }
          if (!has) {
            if (is_proxied_array && typeof prop2 === "string") {
              var ls = (
                /** @type {Source<number>} */
                sources.get("length")
              );
              var n = Number(prop2);
              if (Number.isInteger(n) && n >= ls.v) {
                set(ls, n + 1);
              }
            }
            increment(version);
          }
          return true;
        },
        ownKeys(target) {
          get(version);
          var own_keys = Reflect.ownKeys(target).filter((key4) => {
            var source3 = sources.get(key4);
            return source3 === void 0 || source3.v !== UNINITIALIZED;
          });
          for (var [key3, source2] of sources) {
            if (source2.v !== UNINITIALIZED && !(key3 in target)) {
              own_keys.push(key3);
            }
          }
          return own_keys;
        },
        setPrototypeOf() {
          state_prototype_fixed();
        }
      }
    );
  }
  function get_label(path, prop2) {
    if (typeof prop2 === "symbol") return `${path}[Symbol(${prop2.description ?? ""})]`;
    if (regex_is_valid_identifier.test(prop2)) return `${path}.${prop2}`;
    return /^\d+$/.test(prop2) ? `${path}[${prop2}]` : `${path}['${prop2}']`;
  }
  function get_proxied_value(value) {
    try {
      if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
        return value[STATE_SYMBOL];
      }
    } catch {
    }
    return value;
  }
  var ARRAY_MUTATING_METHODS = /* @__PURE__ */ new Set([
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "sort",
    "splice",
    "unshift"
  ]);
  function inspectable_array(array) {
    return new Proxy(array, {
      get(target, prop2, receiver) {
        var value = Reflect.get(target, prop2, receiver);
        if (!ARRAY_MUTATING_METHODS.has(
          /** @type {string} */
          prop2
        )) {
          return value;
        }
        return function(...args) {
          set_eager_effects_deferred();
          var result = value.apply(this, args);
          flush_eager_effects();
          return result;
        };
      }
    });
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dev/equality.js
  function init_array_prototype_warnings() {
    const array_prototype2 = Array.prototype;
    const cleanup = Array.__svelte_cleanup;
    if (cleanup) {
      cleanup();
    }
    const { indexOf, lastIndexOf, includes: includes2 } = array_prototype2;
    array_prototype2.indexOf = function(item, from_index) {
      const index2 = indexOf.call(this, item, from_index);
      if (index2 === -1) {
        for (let i = from_index ?? 0; i < this.length; i += 1) {
          if (get_proxied_value(this[i]) === item) {
            state_proxy_equality_mismatch("array.indexOf(...)");
            break;
          }
        }
      }
      return index2;
    };
    array_prototype2.lastIndexOf = function(item, from_index) {
      const index2 = lastIndexOf.call(this, item, from_index ?? this.length - 1);
      if (index2 === -1) {
        for (let i = 0; i <= (from_index ?? this.length - 1); i += 1) {
          if (get_proxied_value(this[i]) === item) {
            state_proxy_equality_mismatch("array.lastIndexOf(...)");
            break;
          }
        }
      }
      return index2;
    };
    array_prototype2.includes = function(item, from_index) {
      const has = includes2.call(this, item, from_index);
      if (!has) {
        for (let i = 0; i < this.length; i += 1) {
          if (get_proxied_value(this[i]) === item) {
            state_proxy_equality_mismatch("array.includes(...)");
            break;
          }
        }
      }
      return has;
    };
    Array.__svelte_cleanup = () => {
      array_prototype2.indexOf = indexOf;
      array_prototype2.lastIndexOf = lastIndexOf;
      array_prototype2.includes = includes2;
    };
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/operations.js
  var $window;
  var $document;
  var is_firefox;
  var first_child_getter;
  var next_sibling_getter;
  function init_operations() {
    if ($window !== void 0) {
      return;
    }
    $window = window;
    $document = document;
    is_firefox = /Firefox/.test(navigator.userAgent);
    var element_prototype = Element.prototype;
    var node_prototype = Node.prototype;
    var text_prototype = Text.prototype;
    first_child_getter = get_descriptor(node_prototype, "firstChild").get;
    next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
    if (is_extensible(element_prototype)) {
      element_prototype.__click = void 0;
      element_prototype.__className = void 0;
      element_prototype.__attributes = null;
      element_prototype.__style = void 0;
      element_prototype.__e = void 0;
    }
    if (is_extensible(text_prototype)) {
      text_prototype.__t = void 0;
    }
    if (true_default) {
      element_prototype.__svelte_meta = null;
      init_array_prototype_warnings();
    }
  }
  function create_text(value = "") {
    return document.createTextNode(value);
  }
  // @__NO_SIDE_EFFECTS__
  function get_first_child(node) {
    return (
      /** @type {TemplateNode | null} */
      first_child_getter.call(node)
    );
  }
  // @__NO_SIDE_EFFECTS__
  function get_next_sibling(node) {
    return (
      /** @type {TemplateNode | null} */
      next_sibling_getter.call(node)
    );
  }
  function child(node, is_text) {
    if (!hydrating) {
      return /* @__PURE__ */ get_first_child(node);
    }
    var child2 = /* @__PURE__ */ get_first_child(hydrate_node);
    if (child2 === null) {
      child2 = hydrate_node.appendChild(create_text());
    } else if (is_text && child2.nodeType !== TEXT_NODE) {
      var text2 = create_text();
      child2?.before(text2);
      set_hydrate_node(text2);
      return text2;
    }
    if (is_text) {
      merge_text_nodes(
        /** @type {Text} */
        child2
      );
    }
    set_hydrate_node(child2);
    return child2;
  }
  function first_child(node, is_text = false) {
    if (!hydrating) {
      var first = /* @__PURE__ */ get_first_child(node);
      if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
      return first;
    }
    if (is_text) {
      if (hydrate_node?.nodeType !== TEXT_NODE) {
        var text2 = create_text();
        hydrate_node?.before(text2);
        set_hydrate_node(text2);
        return text2;
      }
      merge_text_nodes(
        /** @type {Text} */
        hydrate_node
      );
    }
    return hydrate_node;
  }
  function sibling(node, count = 1, is_text = false) {
    let next_sibling = hydrating ? hydrate_node : node;
    var last_sibling;
    while (count--) {
      last_sibling = next_sibling;
      next_sibling = /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(next_sibling);
    }
    if (!hydrating) {
      return next_sibling;
    }
    if (is_text) {
      if (next_sibling?.nodeType !== TEXT_NODE) {
        var text2 = create_text();
        if (next_sibling === null) {
          last_sibling?.after(text2);
        } else {
          next_sibling.before(text2);
        }
        set_hydrate_node(text2);
        return text2;
      }
      merge_text_nodes(
        /** @type {Text} */
        next_sibling
      );
    }
    set_hydrate_node(next_sibling);
    return next_sibling;
  }
  function clear_text_content(node) {
    node.textContent = "";
  }
  function should_defer_append() {
    if (!async_mode_flag) return false;
    if (eager_block_effects !== null) return false;
    var flags2 = (
      /** @type {Effect} */
      active_effect.f
    );
    return (flags2 & EFFECT_RAN) !== 0;
  }
  function merge_text_nodes(text2) {
    if (
      /** @type {string} */
      text2.nodeValue.length < 65536
    ) {
      return;
    }
    let next2 = text2.nextSibling;
    while (next2 !== null && next2.nodeType === TEXT_NODE) {
      next2.remove();
      text2.nodeValue += /** @type {string} */
      next2.nodeValue;
      next2 = text2.nextSibling;
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/misc.js
  function remove_textarea_child(dom) {
    if (hydrating && get_first_child(dom) !== null) {
      clear_text_content(dom);
    }
  }
  var listening_to_form_reset = false;
  function add_form_reset_listener() {
    if (!listening_to_form_reset) {
      listening_to_form_reset = true;
      document.addEventListener(
        "reset",
        (evt) => {
          Promise.resolve().then(() => {
            if (!evt.defaultPrevented) {
              for (
                const e of
                /**@type {HTMLFormElement} */
                evt.target.elements
              ) {
                e.__on_r?.();
              }
            }
          });
        },
        // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
        { capture: true }
      );
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
  function without_reactive_context(fn) {
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      return fn();
    } finally {
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  function listen_to_event_and_reset_event(element2, event2, handler, on_reset = handler) {
    element2.addEventListener(event2, () => without_reactive_context(handler));
    const prev = element2.__on_r;
    if (prev) {
      element2.__on_r = () => {
        prev();
        on_reset(true);
      };
    } else {
      element2.__on_r = () => on_reset(true);
    }
    add_form_reset_listener();
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/effects.js
  function validate_effect(rune) {
    if (active_effect === null) {
      if (active_reaction === null) {
        effect_orphan(rune);
      }
      effect_in_unowned_derived();
    }
    if (is_destroying_effect) {
      effect_in_teardown(rune);
    }
  }
  function push_effect(effect2, parent_effect) {
    var parent_last = parent_effect.last;
    if (parent_last === null) {
      parent_effect.last = parent_effect.first = effect2;
    } else {
      parent_last.next = effect2;
      effect2.prev = parent_last;
      parent_effect.last = effect2;
    }
  }
  function create_effect(type, fn, sync) {
    var parent = active_effect;
    if (true_default) {
      while (parent !== null && (parent.f & EAGER_EFFECT) !== 0) {
        parent = parent.parent;
      }
    }
    if (parent !== null && (parent.f & INERT) !== 0) {
      type |= INERT;
    }
    var effect2 = {
      ctx: component_context,
      deps: null,
      nodes: null,
      f: type | DIRTY | CONNECTED,
      first: null,
      fn,
      last: null,
      next: null,
      parent,
      b: parent && parent.b,
      prev: null,
      teardown: null,
      wv: 0,
      ac: null
    };
    if (true_default) {
      effect2.component_function = dev_current_component_function;
    }
    if (sync) {
      try {
        update_effect(effect2);
        effect2.f |= EFFECT_RAN;
      } catch (e2) {
        destroy_effect(effect2);
        throw e2;
      }
    } else if (fn !== null) {
      schedule_effect(effect2);
    }
    var e = effect2;
    if (sync && e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && // either `null`, or a singular child
    (e.f & EFFECT_PRESERVED) === 0) {
      e = e.first;
      if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
        e.f |= EFFECT_TRANSPARENT;
      }
    }
    if (e !== null) {
      e.parent = parent;
      if (parent !== null) {
        push_effect(e, parent);
      }
      if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
        var derived3 = (
          /** @type {Derived} */
          active_reaction
        );
        (derived3.effects ?? (derived3.effects = [])).push(e);
      }
    }
    return effect2;
  }
  function effect_tracking() {
    return active_reaction !== null && !untracking;
  }
  function teardown(fn) {
    const effect2 = create_effect(RENDER_EFFECT, null, false);
    set_signal_status(effect2, CLEAN);
    effect2.teardown = fn;
    return effect2;
  }
  function user_effect(fn) {
    validate_effect("$effect");
    if (true_default) {
      define_property(fn, "name", {
        value: "$effect"
      });
    }
    var flags2 = (
      /** @type {Effect} */
      active_effect.f
    );
    var defer = !active_reaction && (flags2 & BRANCH_EFFECT) !== 0 && (flags2 & EFFECT_RAN) === 0;
    if (defer) {
      var context = (
        /** @type {ComponentContext} */
        component_context
      );
      (context.e ?? (context.e = [])).push(fn);
    } else {
      return create_user_effect(fn);
    }
  }
  function create_user_effect(fn) {
    return create_effect(EFFECT | USER_EFFECT, fn, false);
  }
  function component_root(fn) {
    Batch.ensure();
    const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);
    return (options = {}) => {
      return new Promise((fulfil) => {
        if (options.outro) {
          pause_effect(effect2, () => {
            destroy_effect(effect2);
            fulfil(void 0);
          });
        } else {
          destroy_effect(effect2);
          fulfil(void 0);
        }
      });
    };
  }
  function effect(fn) {
    return create_effect(EFFECT, fn, false);
  }
  function async_effect(fn) {
    return create_effect(ASYNC | EFFECT_PRESERVED, fn, true);
  }
  function render_effect(fn, flags2 = 0) {
    return create_effect(RENDER_EFFECT | flags2, fn, true);
  }
  function template_effect(fn, sync = [], async2 = [], blockers = []) {
    flatten(blockers, sync, async2, (values) => {
      create_effect(RENDER_EFFECT, () => fn(...values.map(get)), true);
    });
  }
  function block(fn, flags2 = 0) {
    var effect2 = create_effect(BLOCK_EFFECT | flags2, fn, true);
    if (true_default) {
      effect2.dev_stack = dev_stack;
    }
    return effect2;
  }
  function branch(fn) {
    return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn, true);
  }
  function execute_effect_teardown(effect2) {
    var teardown2 = effect2.teardown;
    if (teardown2 !== null) {
      const previously_destroying_effect = is_destroying_effect;
      const previous_reaction = active_reaction;
      set_is_destroying_effect(true);
      set_active_reaction(null);
      try {
        teardown2.call(null);
      } finally {
        set_is_destroying_effect(previously_destroying_effect);
        set_active_reaction(previous_reaction);
      }
    }
  }
  function destroy_effect_children(signal, remove_dom = false) {
    var effect2 = signal.first;
    signal.first = signal.last = null;
    while (effect2 !== null) {
      const controller = effect2.ac;
      if (controller !== null) {
        without_reactive_context(() => {
          controller.abort(STALE_REACTION);
        });
      }
      var next2 = effect2.next;
      if ((effect2.f & ROOT_EFFECT) !== 0) {
        effect2.parent = null;
      } else {
        destroy_effect(effect2, remove_dom);
      }
      effect2 = next2;
    }
  }
  function destroy_block_effect_children(signal) {
    var effect2 = signal.first;
    while (effect2 !== null) {
      var next2 = effect2.next;
      if ((effect2.f & BRANCH_EFFECT) === 0) {
        destroy_effect(effect2);
      }
      effect2 = next2;
    }
  }
  function destroy_effect(effect2, remove_dom = true) {
    var removed = false;
    if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes !== null && effect2.nodes.end !== null) {
      remove_effect_dom(
        effect2.nodes.start,
        /** @type {TemplateNode} */
        effect2.nodes.end
      );
      removed = true;
    }
    destroy_effect_children(effect2, remove_dom && !removed);
    remove_reactions(effect2, 0);
    set_signal_status(effect2, DESTROYED);
    var transitions = effect2.nodes && effect2.nodes.t;
    if (transitions !== null) {
      for (const transition2 of transitions) {
        transition2.stop();
      }
    }
    execute_effect_teardown(effect2);
    var parent = effect2.parent;
    if (parent !== null && parent.first !== null) {
      unlink_effect(effect2);
    }
    if (true_default) {
      effect2.component_function = null;
    }
    effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes = effect2.ac = null;
  }
  function remove_effect_dom(node, end) {
    while (node !== null) {
      var next2 = node === end ? null : get_next_sibling(node);
      node.remove();
      node = next2;
    }
  }
  function unlink_effect(effect2) {
    var parent = effect2.parent;
    var prev = effect2.prev;
    var next2 = effect2.next;
    if (prev !== null) prev.next = next2;
    if (next2 !== null) next2.prev = prev;
    if (parent !== null) {
      if (parent.first === effect2) parent.first = next2;
      if (parent.last === effect2) parent.last = prev;
    }
  }
  function pause_effect(effect2, callback, destroy = true) {
    var transitions = [];
    pause_children(effect2, transitions, true);
    var fn = () => {
      if (destroy) destroy_effect(effect2);
      if (callback) callback();
    };
    var remaining = transitions.length;
    if (remaining > 0) {
      var check = () => --remaining || fn();
      for (var transition2 of transitions) {
        transition2.out(check);
      }
    } else {
      fn();
    }
  }
  function pause_children(effect2, transitions, local) {
    if ((effect2.f & INERT) !== 0) return;
    effect2.f ^= INERT;
    var t = effect2.nodes && effect2.nodes.t;
    if (t !== null) {
      for (const transition2 of t) {
        if (transition2.is_global || local) {
          transitions.push(transition2);
        }
      }
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (child2.f & BRANCH_EFFECT) !== 0 && (effect2.f & BLOCK_EFFECT) !== 0;
      pause_children(child2, transitions, transparent ? local : false);
      child2 = sibling2;
    }
  }
  function resume_effect(effect2) {
    resume_children(effect2, true);
  }
  function resume_children(effect2, local) {
    if ((effect2.f & INERT) === 0) return;
    effect2.f ^= INERT;
    if ((effect2.f & CLEAN) === 0) {
      set_signal_status(effect2, DIRTY);
      schedule_effect(effect2);
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
      resume_children(child2, transparent ? local : false);
      child2 = sibling2;
    }
    var t = effect2.nodes && effect2.nodes.t;
    if (t !== null) {
      for (const transition2 of t) {
        if (transition2.is_global || local) {
          transition2.in();
        }
      }
    }
  }
  function move_effect(effect2, fragment) {
    if (!effect2.nodes) return;
    var node = effect2.nodes.start;
    var end = effect2.nodes.end;
    while (node !== null) {
      var next2 = node === end ? null : get_next_sibling(node);
      fragment.append(node);
      node = next2;
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/legacy.js
  var captured_signals = null;

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/runtime.js
  var is_updating_effect = false;
  var is_destroying_effect = false;
  function set_is_destroying_effect(value) {
    is_destroying_effect = value;
  }
  var active_reaction = null;
  var untracking = false;
  function set_active_reaction(reaction) {
    active_reaction = reaction;
  }
  var active_effect = null;
  function set_active_effect(effect2) {
    active_effect = effect2;
  }
  var current_sources = null;
  function push_reaction_value(value) {
    if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & DERIVED) !== 0)) {
      if (current_sources === null) {
        current_sources = [value];
      } else {
        current_sources.push(value);
      }
    }
  }
  var new_deps = null;
  var skipped_deps = 0;
  var untracked_writes = null;
  function set_untracked_writes(value) {
    untracked_writes = value;
  }
  var write_version = 1;
  var read_version = 0;
  var update_version = read_version;
  function set_update_version(value) {
    update_version = value;
  }
  function increment_write_version() {
    return ++write_version;
  }
  function is_dirty(reaction) {
    var flags2 = reaction.f;
    if ((flags2 & DIRTY) !== 0) {
      return true;
    }
    if (flags2 & DERIVED) {
      reaction.f &= ~WAS_MARKED;
    }
    if ((flags2 & MAYBE_DIRTY) !== 0) {
      var dependencies = (
        /** @type {Value[]} */
        reaction.deps
      );
      var length = dependencies.length;
      for (var i = 0; i < length; i++) {
        var dependency = dependencies[i];
        if (is_dirty(
          /** @type {Derived} */
          dependency
        )) {
          update_derived(
            /** @type {Derived} */
            dependency
          );
        }
        if (dependency.wv > reaction.wv) {
          return true;
        }
      }
      if ((flags2 & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
      // traversal of the graph in the other batches still happens
      batch_values === null) {
        set_signal_status(reaction, CLEAN);
      }
    }
    return false;
  }
  function schedule_possible_effect_self_invalidation(signal, effect2, root15 = true) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    if (!async_mode_flag && current_sources !== null && includes.call(current_sources, signal)) {
      return;
    }
    for (var i = 0; i < reactions.length; i++) {
      var reaction = reactions[i];
      if ((reaction.f & DERIVED) !== 0) {
        schedule_possible_effect_self_invalidation(
          /** @type {Derived} */
          reaction,
          effect2,
          false
        );
      } else if (effect2 === reaction) {
        if (root15) {
          set_signal_status(reaction, DIRTY);
        } else if ((reaction.f & CLEAN) !== 0) {
          set_signal_status(reaction, MAYBE_DIRTY);
        }
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
  function update_reaction(reaction) {
    var _a3;
    var previous_deps = new_deps;
    var previous_skipped_deps = skipped_deps;
    var previous_untracked_writes = untracked_writes;
    var previous_reaction = active_reaction;
    var previous_sources = current_sources;
    var previous_component_context = component_context;
    var previous_untracking = untracking;
    var previous_update_version = update_version;
    var flags2 = reaction.f;
    new_deps = /** @type {null | Value[]} */
    null;
    skipped_deps = 0;
    untracked_writes = null;
    active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
    current_sources = null;
    set_component_context(reaction.ctx);
    untracking = false;
    update_version = ++read_version;
    if (reaction.ac !== null) {
      without_reactive_context(() => {
        reaction.ac.abort(STALE_REACTION);
      });
      reaction.ac = null;
    }
    try {
      reaction.f |= REACTION_IS_UPDATING;
      var fn = (
        /** @type {Function} */
        reaction.fn
      );
      var result = fn();
      var deps = reaction.deps;
      var is_fork = current_batch?.is_fork;
      if (new_deps !== null) {
        var i;
        if (!is_fork) {
          remove_reactions(reaction, skipped_deps);
        }
        if (deps !== null && skipped_deps > 0) {
          deps.length = skipped_deps + new_deps.length;
          for (i = 0; i < new_deps.length; i++) {
            deps[skipped_deps + i] = new_deps[i];
          }
        } else {
          reaction.deps = deps = new_deps;
        }
        if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
          for (i = skipped_deps; i < deps.length; i++) {
            ((_a3 = deps[i]).reactions ?? (_a3.reactions = [])).push(reaction);
          }
        }
      } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
        remove_reactions(reaction, skipped_deps);
        deps.length = skipped_deps;
      }
      if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
        for (i = 0; i < /** @type {Source[]} */
        untracked_writes.length; i++) {
          schedule_possible_effect_self_invalidation(
            untracked_writes[i],
            /** @type {Effect} */
            reaction
          );
        }
      }
      if (previous_reaction !== null && previous_reaction !== reaction) {
        read_version++;
        if (previous_reaction.deps !== null) {
          for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) {
            previous_reaction.deps[i2].rv = read_version;
          }
        }
        if (previous_deps !== null) {
          for (const dep of previous_deps) {
            dep.rv = read_version;
          }
        }
        if (untracked_writes !== null) {
          if (previous_untracked_writes === null) {
            previous_untracked_writes = untracked_writes;
          } else {
            previous_untracked_writes.push(.../** @type {Source[]} */
            untracked_writes);
          }
        }
      }
      if ((reaction.f & ERROR_VALUE) !== 0) {
        reaction.f ^= ERROR_VALUE;
      }
      return result;
    } catch (error) {
      return handle_error(error);
    } finally {
      reaction.f ^= REACTION_IS_UPDATING;
      new_deps = previous_deps;
      skipped_deps = previous_skipped_deps;
      untracked_writes = previous_untracked_writes;
      active_reaction = previous_reaction;
      current_sources = previous_sources;
      set_component_context(previous_component_context);
      untracking = previous_untracking;
      update_version = previous_update_version;
    }
  }
  function remove_reaction(signal, dependency) {
    let reactions = dependency.reactions;
    if (reactions !== null) {
      var index2 = index_of.call(reactions, signal);
      if (index2 !== -1) {
        var new_length = reactions.length - 1;
        if (new_length === 0) {
          reactions = dependency.reactions = null;
        } else {
          reactions[index2] = reactions[new_length];
          reactions.pop();
        }
      }
    }
    if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
    // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
    // allows us to skip the expensive work of disconnecting and immediately reconnecting it
    (new_deps === null || !includes.call(new_deps, dependency))) {
      var derived3 = (
        /** @type {Derived} */
        dependency
      );
      if ((derived3.f & CONNECTED) !== 0) {
        derived3.f ^= CONNECTED;
        derived3.f &= ~WAS_MARKED;
      }
      update_derived_status(derived3);
      destroy_derived_effects(derived3);
      remove_reactions(derived3, 0);
    }
  }
  function remove_reactions(signal, start_index) {
    var dependencies = signal.deps;
    if (dependencies === null) return;
    for (var i = start_index; i < dependencies.length; i++) {
      remove_reaction(signal, dependencies[i]);
    }
  }
  function update_effect(effect2) {
    var flags2 = effect2.f;
    if ((flags2 & DESTROYED) !== 0) {
      return;
    }
    set_signal_status(effect2, CLEAN);
    var previous_effect = active_effect;
    var was_updating_effect = is_updating_effect;
    active_effect = effect2;
    is_updating_effect = true;
    if (true_default) {
      var previous_component_fn = dev_current_component_function;
      set_dev_current_component_function(effect2.component_function);
      var previous_stack = (
        /** @type {any} */
        dev_stack
      );
      set_dev_stack(effect2.dev_stack ?? dev_stack);
    }
    try {
      if ((flags2 & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
        destroy_block_effect_children(effect2);
      } else {
        destroy_effect_children(effect2);
      }
      execute_effect_teardown(effect2);
      var teardown2 = update_reaction(effect2);
      effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
      effect2.wv = write_version;
      if (true_default && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && effect2.deps !== null) {
        for (var dep of effect2.deps) {
          if (dep.set_during_effect) {
            dep.wv = increment_write_version();
            dep.set_during_effect = false;
          }
        }
      }
    } finally {
      is_updating_effect = was_updating_effect;
      active_effect = previous_effect;
      if (true_default) {
        set_dev_current_component_function(previous_component_fn);
        set_dev_stack(previous_stack);
      }
    }
  }
  async function tick() {
    if (async_mode_flag) {
      return new Promise((f) => {
        requestAnimationFrame(() => f());
        setTimeout(() => f());
      });
    }
    await Promise.resolve();
    flushSync();
  }
  function get(signal) {
    var flags2 = signal.f;
    var is_derived = (flags2 & DERIVED) !== 0;
    captured_signals?.add(signal);
    if (active_reaction !== null && !untracking) {
      var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
      if (!destroyed && (current_sources === null || !includes.call(current_sources, signal))) {
        var deps = active_reaction.deps;
        if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
          if (signal.rv < read_version) {
            signal.rv = read_version;
            if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
              skipped_deps++;
            } else if (new_deps === null) {
              new_deps = [signal];
            } else {
              new_deps.push(signal);
            }
          }
        } else {
          (active_reaction.deps ?? (active_reaction.deps = [])).push(signal);
          var reactions = signal.reactions;
          if (reactions === null) {
            signal.reactions = [active_reaction];
          } else if (!includes.call(reactions, active_reaction)) {
            reactions.push(active_reaction);
          }
        }
      }
    }
    if (true_default) {
      recent_async_deriveds.delete(signal);
      if (tracing_mode_flag && !untracking && tracing_expressions !== null && active_reaction !== null && tracing_expressions.reaction === active_reaction) {
        if (signal.trace) {
          signal.trace();
        } else {
          var trace2 = get_error("traced at");
          if (trace2) {
            var entry = tracing_expressions.entries.get(signal);
            if (entry === void 0) {
              entry = { traces: [] };
              tracing_expressions.entries.set(signal, entry);
            }
            var last = entry.traces[entry.traces.length - 1];
            if (trace2.stack !== last?.stack) {
              entry.traces.push(trace2);
            }
          }
        }
      }
    }
    if (is_destroying_effect && old_values.has(signal)) {
      return old_values.get(signal);
    }
    if (is_derived) {
      var derived3 = (
        /** @type {Derived} */
        signal
      );
      if (is_destroying_effect) {
        var value = derived3.v;
        if ((derived3.f & CLEAN) === 0 && derived3.reactions !== null || depends_on_old_values(derived3)) {
          value = execute_derived(derived3);
        }
        old_values.set(derived3, value);
        return value;
      }
      var should_connect = (derived3.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0);
      var is_new = derived3.deps === null;
      if (is_dirty(derived3)) {
        if (should_connect) {
          derived3.f |= CONNECTED;
        }
        update_derived(derived3);
      }
      if (should_connect && !is_new) {
        reconnect(derived3);
      }
    }
    if (batch_values?.has(signal)) {
      return batch_values.get(signal);
    }
    if ((signal.f & ERROR_VALUE) !== 0) {
      throw signal.v;
    }
    return signal.v;
  }
  function reconnect(derived3) {
    if (derived3.deps === null) return;
    derived3.f |= CONNECTED;
    for (const dep of derived3.deps) {
      (dep.reactions ?? (dep.reactions = [])).push(derived3);
      if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
        reconnect(
          /** @type {Derived} */
          dep
        );
      }
    }
  }
  function depends_on_old_values(derived3) {
    if (derived3.v === UNINITIALIZED) return true;
    if (derived3.deps === null) return false;
    for (const dep of derived3.deps) {
      if (old_values.has(dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
        /** @type {Derived} */
        dep
      )) {
        return true;
      }
    }
    return false;
  }
  function untrack(fn) {
    var previous_untracking = untracking;
    try {
      untracking = true;
      return fn();
    } finally {
      untracking = previous_untracking;
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/utils.js
  var DOM_BOOLEAN_ATTRIBUTES = [
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "disabled",
    "formnovalidate",
    "indeterminate",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "seamless",
    "selected",
    "webkitdirectory",
    "defer",
    "disablepictureinpicture",
    "disableremoteplayback"
  ];
  var DOM_PROPERTIES = [
    ...DOM_BOOLEAN_ATTRIBUTES,
    "formNoValidate",
    "isMap",
    "noModule",
    "playsInline",
    "readOnly",
    "value",
    "volume",
    "defaultValue",
    "defaultChecked",
    "srcObject",
    "noValidate",
    "allowFullscreen",
    "disablePictureInPicture",
    "disableRemotePlayback"
  ];
  var PASSIVE_EVENTS = ["touchstart", "touchmove"];
  function is_passive_event(name) {
    return PASSIVE_EVENTS.includes(name);
  }
  var STATE_CREATION_RUNES = (
    /** @type {const} */
    [
      "$state",
      "$state.raw",
      "$derived",
      "$derived.by"
    ]
  );
  var RUNES = (
    /** @type {const} */
    [
      ...STATE_CREATION_RUNES,
      "$state.eager",
      "$state.snapshot",
      "$props",
      "$props.id",
      "$bindable",
      "$effect",
      "$effect.pre",
      "$effect.tracking",
      "$effect.root",
      "$effect.pending",
      "$inspect",
      "$inspect().with",
      "$inspect.trace",
      "$host"
    ]
  );

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/events.js
  var all_registered_events = /* @__PURE__ */ new Set();
  var root_event_handles = /* @__PURE__ */ new Set();
  function create_event(event_name, dom, handler, options = {}) {
    function target_handler(event2) {
      if (!options.capture) {
        handle_event_propagation.call(dom, event2);
      }
      if (!event2.cancelBubble) {
        return without_reactive_context(() => {
          return handler?.call(this, event2);
        });
      }
    }
    if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
      queue_micro_task(() => {
        dom.addEventListener(event_name, target_handler, options);
      });
    } else {
      dom.addEventListener(event_name, target_handler, options);
    }
    return target_handler;
  }
  function event(event_name, dom, handler, capture2, passive) {
    var options = { capture: capture2, passive };
    var target_handler = create_event(event_name, dom, handler, options);
    if (dom === document.body || // @ts-ignore
    dom === window || // @ts-ignore
    dom === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
    dom instanceof HTMLMediaElement) {
      teardown(() => {
        dom.removeEventListener(event_name, target_handler, options);
      });
    }
  }
  function delegate(events) {
    for (var i = 0; i < events.length; i++) {
      all_registered_events.add(events[i]);
    }
    for (var fn of root_event_handles) {
      fn(events);
    }
  }
  var last_propagated_event = null;
  function handle_event_propagation(event2) {
    var handler_element = this;
    var owner_document = (
      /** @type {Node} */
      handler_element.ownerDocument
    );
    var event_name = event2.type;
    var path = event2.composedPath?.() || [];
    var current_target = (
      /** @type {null | Element} */
      path[0] || event2.target
    );
    last_propagated_event = event2;
    var path_idx = 0;
    var handled_at = last_propagated_event === event2 && event2.__root;
    if (handled_at) {
      var at_idx = path.indexOf(handled_at);
      if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
      window)) {
        event2.__root = handler_element;
        return;
      }
      var handler_idx = path.indexOf(handler_element);
      if (handler_idx === -1) {
        return;
      }
      if (at_idx <= handler_idx) {
        path_idx = at_idx;
      }
    }
    current_target = /** @type {Element} */
    path[path_idx] || event2.target;
    if (current_target === handler_element) return;
    define_property(event2, "currentTarget", {
      configurable: true,
      get() {
        return current_target || owner_document;
      }
    });
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      var throw_error;
      var other_errors = [];
      while (current_target !== null) {
        var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
        current_target.host || null;
        try {
          var delegated = current_target["__" + event_name];
          if (delegated != null && (!/** @type {any} */
          current_target.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          event2.target === current_target)) {
            delegated.call(current_target, event2);
          }
        } catch (error) {
          if (throw_error) {
            other_errors.push(error);
          } else {
            throw_error = error;
          }
        }
        if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
          break;
        }
        current_target = parent_element;
      }
      if (throw_error) {
        for (let error of other_errors) {
          queueMicrotask(() => {
            throw error;
          });
        }
        throw throw_error;
      }
    } finally {
      event2.__root = handler_element;
      delete event2.currentTarget;
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/reconciler.js
  function create_fragment_from_html(html2) {
    var elem = document.createElement("template");
    elem.innerHTML = html2.replaceAll("<!>", "<!---->");
    return elem.content;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/template.js
  function assign_nodes(start, end) {
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    if (effect2.nodes === null) {
      effect2.nodes = { start, end, a: null, t: null };
    }
  }
  // @__NO_SIDE_EFFECTS__
  function from_html(content, flags2) {
    var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
    var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
    var node;
    var has_start = !content.startsWith("<!>");
    return () => {
      if (hydrating) {
        assign_nodes(hydrate_node, null);
        return hydrate_node;
      }
      if (node === void 0) {
        node = create_fragment_from_html(has_start ? content : "<!>" + content);
        if (!is_fragment) node = /** @type {TemplateNode} */
        get_first_child(node);
      }
      var clone = (
        /** @type {TemplateNode} */
        use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
      );
      if (is_fragment) {
        var start = (
          /** @type {TemplateNode} */
          get_first_child(clone)
        );
        var end = (
          /** @type {TemplateNode} */
          clone.lastChild
        );
        assign_nodes(start, end);
      } else {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
  function text(value = "") {
    if (!hydrating) {
      var t = create_text(value + "");
      assign_nodes(t, t);
      return t;
    }
    var node = hydrate_node;
    if (node.nodeType !== TEXT_NODE) {
      node.before(node = create_text());
      set_hydrate_node(node);
    } else {
      merge_text_nodes(
        /** @type {Text} */
        node
      );
    }
    assign_nodes(node, node);
    return node;
  }
  function comment() {
    if (hydrating) {
      assign_nodes(hydrate_node, null);
      return hydrate_node;
    }
    var frag = document.createDocumentFragment();
    var start = document.createComment("");
    var anchor = create_text();
    frag.append(start, anchor);
    assign_nodes(start, anchor);
    return frag;
  }
  function append(anchor, dom) {
    if (hydrating) {
      var effect2 = (
        /** @type {Effect & { nodes: EffectNodes }} */
        active_effect
      );
      if ((effect2.f & EFFECT_RAN) === 0 || effect2.nodes.end === null) {
        effect2.nodes.end = hydrate_node;
      }
      hydrate_next();
      return;
    }
    if (anchor === null) {
      return;
    }
    anchor.before(
      /** @type {Node} */
      dom
    );
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/render.js
  var should_intro = true;
  function set_text(text2, value) {
    var str = value == null ? "" : typeof value === "object" ? value + "" : value;
    if (str !== (text2.__t ?? (text2.__t = text2.nodeValue))) {
      text2.__t = str;
      text2.nodeValue = str + "";
    }
  }
  function mount(component2, options) {
    return _mount(component2, options);
  }
  var document_listeners = /* @__PURE__ */ new Map();
  function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
    init_operations();
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = (events2) => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive = is_passive_event(event_name);
        target.addEventListener(event_name, handle_event_propagation, { passive });
        var n = document_listeners.get(event_name);
        if (n === void 0) {
          document.addEventListener(event_name, handle_event_propagation, { passive });
          document_listeners.set(event_name, 1);
        } else {
          document_listeners.set(event_name, n + 1);
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    var component2 = void 0;
    var unmount2 = component_root(() => {
      var anchor_node = anchor ?? target.appendChild(create_text());
      boundary(
        /** @type {TemplateNode} */
        anchor_node,
        {
          pending: () => {
          }
        },
        (anchor_node2) => {
          if (context) {
            push({});
            var ctx = (
              /** @type {ComponentContext} */
              component_context
            );
            ctx.c = context;
          }
          if (events) {
            props.$$events = events;
          }
          if (hydrating) {
            assign_nodes(
              /** @type {TemplateNode} */
              anchor_node2,
              null
            );
          }
          should_intro = intro;
          component2 = Component(anchor_node2, props) || {};
          should_intro = true;
          if (hydrating) {
            active_effect.nodes.end = hydrate_node;
            if (hydrate_node === null || hydrate_node.nodeType !== COMMENT_NODE || /** @type {Comment} */
            hydrate_node.data !== HYDRATION_END) {
              hydration_mismatch();
              throw HYDRATION_ERROR;
            }
          }
          if (context) {
            pop();
          }
        }
      );
      return () => {
        for (var event_name of registered_events) {
          target.removeEventListener(event_name, handle_event_propagation);
          var n = (
            /** @type {number} */
            document_listeners.get(event_name)
          );
          if (--n === 0) {
            document.removeEventListener(event_name, handle_event_propagation);
            document_listeners.delete(event_name);
          } else {
            document_listeners.set(event_name, n);
          }
        }
        root_event_handles.delete(event_handle);
        if (anchor_node !== anchor) {
          anchor_node.parentNode?.removeChild(anchor_node);
        }
      };
    });
    mounted_components.set(component2, unmount2);
    return component2;
  }
  var mounted_components = /* @__PURE__ */ new WeakMap();

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/blocks/branches.js
  var _batches, _onscreen, _offscreen, _outroing, _transition, _commit, _discard;
  var BranchManager = class {
    /**
     * @param {TemplateNode} anchor
     * @param {boolean} transition
     */
    constructor(anchor, transition2 = true) {
      /** @type {TemplateNode} */
      __publicField(this, "anchor");
      /** @type {Map<Batch, Key>} */
      __privateAdd(this, _batches, /* @__PURE__ */ new Map());
      /**
       * Map of keys to effects that are currently rendered in the DOM.
       * These effects are visible and actively part of the document tree.
       * Example:
       * ```
       * {#if condition}
       * 	foo
       * {:else}
       * 	bar
       * {/if}
       * ```
       * Can result in the entries `true->Effect` and `false->Effect`
       * @type {Map<Key, Effect>}
       */
      __privateAdd(this, _onscreen, /* @__PURE__ */ new Map());
      /**
       * Similar to #onscreen with respect to the keys, but contains branches that are not yet
       * in the DOM, because their insertion is deferred.
       * @type {Map<Key, Branch>}
       */
      __privateAdd(this, _offscreen, /* @__PURE__ */ new Map());
      /**
       * Keys of effects that are currently outroing
       * @type {Set<Key>}
       */
      __privateAdd(this, _outroing, /* @__PURE__ */ new Set());
      /**
       * Whether to pause (i.e. outro) on change, or destroy immediately.
       * This is necessary for `<svelte:element>`
       */
      __privateAdd(this, _transition, true);
      __privateAdd(this, _commit, () => {
        var batch = (
          /** @type {Batch} */
          current_batch
        );
        if (!__privateGet(this, _batches).has(batch)) return;
        var key3 = (
          /** @type {Key} */
          __privateGet(this, _batches).get(batch)
        );
        var onscreen = __privateGet(this, _onscreen).get(key3);
        if (onscreen) {
          resume_effect(onscreen);
          __privateGet(this, _outroing).delete(key3);
        } else {
          var offscreen = __privateGet(this, _offscreen).get(key3);
          if (offscreen) {
            __privateGet(this, _onscreen).set(key3, offscreen.effect);
            __privateGet(this, _offscreen).delete(key3);
            offscreen.fragment.lastChild.remove();
            this.anchor.before(offscreen.fragment);
            onscreen = offscreen.effect;
          }
        }
        for (const [b, k] of __privateGet(this, _batches)) {
          __privateGet(this, _batches).delete(b);
          if (b === batch) {
            break;
          }
          const offscreen2 = __privateGet(this, _offscreen).get(k);
          if (offscreen2) {
            destroy_effect(offscreen2.effect);
            __privateGet(this, _offscreen).delete(k);
          }
        }
        for (const [k, effect2] of __privateGet(this, _onscreen)) {
          if (k === key3 || __privateGet(this, _outroing).has(k)) continue;
          const on_destroy = () => {
            const keys = Array.from(__privateGet(this, _batches).values());
            if (keys.includes(k)) {
              var fragment = document.createDocumentFragment();
              move_effect(effect2, fragment);
              fragment.append(create_text());
              __privateGet(this, _offscreen).set(k, { effect: effect2, fragment });
            } else {
              destroy_effect(effect2);
            }
            __privateGet(this, _outroing).delete(k);
            __privateGet(this, _onscreen).delete(k);
          };
          if (__privateGet(this, _transition) || !onscreen) {
            __privateGet(this, _outroing).add(k);
            pause_effect(effect2, on_destroy, false);
          } else {
            on_destroy();
          }
        }
      });
      /**
       * @param {Batch} batch
       */
      __privateAdd(this, _discard, (batch) => {
        __privateGet(this, _batches).delete(batch);
        const keys = Array.from(__privateGet(this, _batches).values());
        for (const [k, branch2] of __privateGet(this, _offscreen)) {
          if (!keys.includes(k)) {
            destroy_effect(branch2.effect);
            __privateGet(this, _offscreen).delete(k);
          }
        }
      });
      this.anchor = anchor;
      __privateSet(this, _transition, transition2);
    }
    /**
     *
     * @param {any} key
     * @param {null | ((target: TemplateNode) => void)} fn
     */
    ensure(key3, fn) {
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      var defer = should_defer_append();
      if (fn && !__privateGet(this, _onscreen).has(key3) && !__privateGet(this, _offscreen).has(key3)) {
        if (defer) {
          var fragment = document.createDocumentFragment();
          var target = create_text();
          fragment.append(target);
          __privateGet(this, _offscreen).set(key3, {
            effect: branch(() => fn(target)),
            fragment
          });
        } else {
          __privateGet(this, _onscreen).set(
            key3,
            branch(() => fn(this.anchor))
          );
        }
      }
      __privateGet(this, _batches).set(batch, key3);
      if (defer) {
        for (const [k, effect2] of __privateGet(this, _onscreen)) {
          if (k === key3) {
            batch.skipped_effects.delete(effect2);
          } else {
            batch.skipped_effects.add(effect2);
          }
        }
        for (const [k, branch2] of __privateGet(this, _offscreen)) {
          if (k === key3) {
            batch.skipped_effects.delete(branch2.effect);
          } else {
            batch.skipped_effects.add(branch2.effect);
          }
        }
        batch.oncommit(__privateGet(this, _commit));
        batch.ondiscard(__privateGet(this, _discard));
      } else {
        if (hydrating) {
          this.anchor = hydrate_node;
        }
        __privateGet(this, _commit).call(this);
      }
    }
  };
  _batches = new WeakMap();
  _onscreen = new WeakMap();
  _offscreen = new WeakMap();
  _outroing = new WeakMap();
  _transition = new WeakMap();
  _commit = new WeakMap();
  _discard = new WeakMap();

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/blocks/if.js
  function if_block(node, fn, elseif = false) {
    if (hydrating) {
      hydrate_next();
    }
    var branches = new BranchManager(node);
    var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
    function update_branch(condition, fn2) {
      if (hydrating) {
        const is_else = read_hydration_instruction(node) === HYDRATION_START_ELSE;
        if (condition === is_else) {
          var anchor = skip_nodes();
          set_hydrate_node(anchor);
          branches.anchor = anchor;
          set_hydrating(false);
          branches.ensure(condition, fn2);
          set_hydrating(true);
          return;
        }
      }
      branches.ensure(condition, fn2);
    }
    block(() => {
      var has_branch = false;
      fn((fn2, flag = true) => {
        has_branch = true;
        update_branch(flag, fn2);
      });
      if (!has_branch) {
        update_branch(false, null);
      }
    }, flags2);
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/blocks/each.js
  function pause_effects(state2, to_destroy, controlled_anchor) {
    var transitions = [];
    var length = to_destroy.length;
    var group;
    var remaining = to_destroy.length;
    for (var i = 0; i < length; i++) {
      let effect2 = to_destroy[i];
      pause_effect(
        effect2,
        () => {
          if (group) {
            group.pending.delete(effect2);
            group.done.add(effect2);
            if (group.pending.size === 0) {
              var groups = (
                /** @type {Set<EachOutroGroup>} */
                state2.outrogroups
              );
              destroy_effects(array_from(group.done));
              groups.delete(group);
              if (groups.size === 0) {
                state2.outrogroups = null;
              }
            }
          } else {
            remaining -= 1;
          }
        },
        false
      );
    }
    if (remaining === 0) {
      var fast_path = transitions.length === 0 && controlled_anchor !== null;
      if (fast_path) {
        var anchor = (
          /** @type {Element} */
          controlled_anchor
        );
        var parent_node = (
          /** @type {Element} */
          anchor.parentNode
        );
        clear_text_content(parent_node);
        parent_node.append(anchor);
        state2.items.clear();
      }
      destroy_effects(to_destroy, !fast_path);
    } else {
      group = {
        pending: new Set(to_destroy),
        done: /* @__PURE__ */ new Set()
      };
      (state2.outrogroups ?? (state2.outrogroups = /* @__PURE__ */ new Set())).add(group);
    }
  }
  function destroy_effects(to_destroy, remove_dom = true) {
    for (var i = 0; i < to_destroy.length; i++) {
      destroy_effect(to_destroy[i], remove_dom);
    }
  }
  var offscreen_anchor;
  function each(node, flags2, get_collection, get_key, render_fn, fallback_fn = null) {
    var anchor = node;
    var items = /* @__PURE__ */ new Map();
    var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
    if (is_controlled) {
      var parent_node = (
        /** @type {Element} */
        node
      );
      anchor = hydrating ? set_hydrate_node(get_first_child(parent_node)) : parent_node.appendChild(create_text());
    }
    if (hydrating) {
      hydrate_next();
    }
    var fallback3 = null;
    var each_array = derived_safe_equal(() => {
      var collection = get_collection();
      return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
    });
    var array;
    var first_run = true;
    function commit() {
      state2.fallback = fallback3;
      reconcile(state2, array, anchor, flags2, get_key);
      if (fallback3 !== null) {
        if (array.length === 0) {
          if ((fallback3.f & EFFECT_OFFSCREEN) === 0) {
            resume_effect(fallback3);
          } else {
            fallback3.f ^= EFFECT_OFFSCREEN;
            move(fallback3, null, anchor);
          }
        } else {
          pause_effect(fallback3, () => {
            fallback3 = null;
          });
        }
      }
    }
    var effect2 = block(() => {
      array = /** @type {V[]} */
      get(each_array);
      var length = array.length;
      let mismatch = false;
      if (hydrating) {
        var is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;
        if (is_else !== (length === 0)) {
          anchor = skip_nodes();
          set_hydrate_node(anchor);
          set_hydrating(false);
          mismatch = true;
        }
      }
      var keys = /* @__PURE__ */ new Set();
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      var defer = should_defer_append();
      for (var index2 = 0; index2 < length; index2 += 1) {
        if (hydrating && hydrate_node.nodeType === COMMENT_NODE && /** @type {Comment} */
        hydrate_node.data === HYDRATION_END) {
          anchor = /** @type {Comment} */
          hydrate_node;
          mismatch = true;
          set_hydrating(false);
        }
        var value = array[index2];
        var key3 = get_key(value, index2);
        var item = first_run ? null : items.get(key3);
        if (item) {
          if (item.v) internal_set(item.v, value);
          if (item.i) internal_set(item.i, index2);
          if (defer) {
            batch.skipped_effects.delete(item.e);
          }
        } else {
          item = create_item(
            items,
            first_run ? anchor : offscreen_anchor ?? (offscreen_anchor = create_text()),
            value,
            key3,
            index2,
            render_fn,
            flags2,
            get_collection
          );
          if (!first_run) {
            item.e.f |= EFFECT_OFFSCREEN;
          }
          items.set(key3, item);
        }
        keys.add(key3);
      }
      if (length === 0 && fallback_fn && !fallback3) {
        if (first_run) {
          fallback3 = branch(() => fallback_fn(anchor));
        } else {
          fallback3 = branch(() => fallback_fn(offscreen_anchor ?? (offscreen_anchor = create_text())));
          fallback3.f |= EFFECT_OFFSCREEN;
        }
      }
      if (hydrating && length > 0) {
        set_hydrate_node(skip_nodes());
      }
      if (!first_run) {
        if (defer) {
          for (const [key4, item2] of items) {
            if (!keys.has(key4)) {
              batch.skipped_effects.add(item2.e);
            }
          }
          batch.oncommit(commit);
          batch.ondiscard(() => {
          });
        } else {
          commit();
        }
      }
      if (mismatch) {
        set_hydrating(true);
      }
      get(each_array);
    });
    var state2 = { effect: effect2, flags: flags2, items, outrogroups: null, fallback: fallback3 };
    first_run = false;
    if (hydrating) {
      anchor = hydrate_node;
    }
  }
  function skip_to_branch(effect2) {
    while (effect2 !== null && (effect2.f & BRANCH_EFFECT) === 0) {
      effect2 = effect2.next;
    }
    return effect2;
  }
  function reconcile(state2, array, anchor, flags2, get_key) {
    var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
    var length = array.length;
    var items = state2.items;
    var current = skip_to_branch(state2.effect.first);
    var seen;
    var prev = null;
    var to_animate;
    var matched = [];
    var stashed = [];
    var value;
    var key3;
    var effect2;
    var i;
    if (is_animated) {
      for (i = 0; i < length; i += 1) {
        value = array[i];
        key3 = get_key(value, i);
        effect2 = /** @type {EachItem} */
        items.get(key3).e;
        if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
          effect2.nodes?.a?.measure();
          (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).add(effect2);
        }
      }
    }
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key3 = get_key(value, i);
      effect2 = /** @type {EachItem} */
      items.get(key3).e;
      if (state2.outrogroups !== null) {
        for (const group of state2.outrogroups) {
          group.pending.delete(effect2);
          group.done.delete(effect2);
        }
      }
      if ((effect2.f & EFFECT_OFFSCREEN) !== 0) {
        effect2.f ^= EFFECT_OFFSCREEN;
        if (effect2 === current) {
          move(effect2, null, anchor);
        } else {
          var next2 = prev ? prev.next : current;
          if (effect2 === state2.effect.last) {
            state2.effect.last = effect2.prev;
          }
          if (effect2.prev) effect2.prev.next = effect2.next;
          if (effect2.next) effect2.next.prev = effect2.prev;
          link(state2, prev, effect2);
          link(state2, effect2, next2);
          move(effect2, next2, anchor);
          prev = effect2;
          matched = [];
          stashed = [];
          current = skip_to_branch(prev.next);
          continue;
        }
      }
      if ((effect2.f & INERT) !== 0) {
        resume_effect(effect2);
        if (is_animated) {
          effect2.nodes?.a?.unfix();
          (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).delete(effect2);
        }
      }
      if (effect2 !== current) {
        if (seen !== void 0 && seen.has(effect2)) {
          if (matched.length < stashed.length) {
            var start = stashed[0];
            var j;
            prev = start.prev;
            var a = matched[0];
            var b = matched[matched.length - 1];
            for (j = 0; j < matched.length; j += 1) {
              move(matched[j], start, anchor);
            }
            for (j = 0; j < stashed.length; j += 1) {
              seen.delete(stashed[j]);
            }
            link(state2, a.prev, b.next);
            link(state2, prev, a);
            link(state2, b, start);
            current = start;
            prev = b;
            i -= 1;
            matched = [];
            stashed = [];
          } else {
            seen.delete(effect2);
            move(effect2, current, anchor);
            link(state2, effect2.prev, effect2.next);
            link(state2, effect2, prev === null ? state2.effect.first : prev.next);
            link(state2, prev, effect2);
            prev = effect2;
          }
          continue;
        }
        matched = [];
        stashed = [];
        while (current !== null && current !== effect2) {
          (seen ?? (seen = /* @__PURE__ */ new Set())).add(current);
          stashed.push(current);
          current = skip_to_branch(current.next);
        }
        if (current === null) {
          continue;
        }
      }
      if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
        matched.push(effect2);
      }
      prev = effect2;
      current = skip_to_branch(effect2.next);
    }
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        if (group.pending.size === 0) {
          destroy_effects(array_from(group.done));
          state2.outrogroups?.delete(group);
        }
      }
      if (state2.outrogroups.size === 0) {
        state2.outrogroups = null;
      }
    }
    if (current !== null || seen !== void 0) {
      var to_destroy = [];
      if (seen !== void 0) {
        for (effect2 of seen) {
          if ((effect2.f & INERT) === 0) {
            to_destroy.push(effect2);
          }
        }
      }
      while (current !== null) {
        if ((current.f & INERT) === 0 && current !== state2.fallback) {
          to_destroy.push(current);
        }
        current = skip_to_branch(current.next);
      }
      var destroy_length = to_destroy.length;
      if (destroy_length > 0) {
        var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
        if (is_animated) {
          for (i = 0; i < destroy_length; i += 1) {
            to_destroy[i].nodes?.a?.measure();
          }
          for (i = 0; i < destroy_length; i += 1) {
            to_destroy[i].nodes?.a?.fix();
          }
        }
        pause_effects(state2, to_destroy, controlled_anchor);
      }
    }
    if (is_animated) {
      queue_micro_task(() => {
        if (to_animate === void 0) return;
        for (effect2 of to_animate) {
          effect2.nodes?.a?.apply();
        }
      });
    }
  }
  function create_item(items, anchor, value, key3, index2, render_fn, flags2, get_collection) {
    var v = (flags2 & EACH_ITEM_REACTIVE) !== 0 ? (flags2 & EACH_ITEM_IMMUTABLE) === 0 ? mutable_source(value, false, false) : source(value) : null;
    var i = (flags2 & EACH_INDEX_REACTIVE) !== 0 ? source(index2) : null;
    if (true_default && v) {
      v.trace = () => {
        get_collection()[i?.v ?? index2];
      };
    }
    return {
      v,
      i,
      e: branch(() => {
        render_fn(anchor, v ?? value, i ?? index2, get_collection);
        return () => {
          items.delete(key3);
        };
      })
    };
  }
  function move(effect2, next2, anchor) {
    if (!effect2.nodes) return;
    var node = effect2.nodes.start;
    var end = effect2.nodes.end;
    var dest = next2 && (next2.f & EFFECT_OFFSCREEN) === 0 ? (
      /** @type {EffectNodes} */
      next2.nodes.start
    ) : anchor;
    while (node !== null) {
      var next_node = (
        /** @type {TemplateNode} */
        get_next_sibling(node)
      );
      dest.before(node);
      if (node === end) {
        return;
      }
      node = next_node;
    }
  }
  function link(state2, prev, next2) {
    if (prev === null) {
      state2.effect.first = next2;
    } else {
      prev.next = next2;
    }
    if (next2 === null) {
      state2.effect.last = prev;
    } else {
      next2.prev = prev;
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/timing.js
  var now = true_default ? () => performance.now() : () => Date.now();
  var raf = {
    // don't access requestAnimationFrame eagerly outside method
    // this allows basic testing of user code without JSDOM
    // bunder will eval and remove ternary when the user's app is built
    tick: (
      /** @param {any} _ */
      (_) => (true_default ? requestAnimationFrame : noop)(_)
    ),
    now: () => now(),
    tasks: /* @__PURE__ */ new Set()
  };

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/loop.js
  function run_tasks() {
    const now2 = raf.now();
    raf.tasks.forEach((task) => {
      if (!task.c(now2)) {
        raf.tasks.delete(task);
        task.f();
      }
    });
    if (raf.tasks.size !== 0) {
      raf.tick(run_tasks);
    }
  }
  function loop(callback) {
    let task;
    if (raf.tasks.size === 0) {
      raf.tick(run_tasks);
    }
    return {
      promise: new Promise((fulfill) => {
        raf.tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        raf.tasks.delete(task);
      }
    };
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/transitions.js
  function dispatch_event(element2, type) {
    without_reactive_context(() => {
      element2.dispatchEvent(new CustomEvent(type));
    });
  }
  function css_property_to_camelcase(style) {
    if (style === "float") return "cssFloat";
    if (style === "offset") return "cssOffset";
    if (style.startsWith("--")) return style;
    const parts = style.split("-");
    if (parts.length === 1) return parts[0];
    return parts[0] + parts.slice(1).map(
      /** @param {any} word */
      (word) => word[0].toUpperCase() + word.slice(1)
    ).join("");
  }
  function css_to_keyframe(css) {
    const keyframe = {};
    const parts = css.split(";");
    for (const part of parts) {
      const [property, value] = part.split(":");
      if (!property || value === void 0) break;
      const formatted_property = css_property_to_camelcase(property.trim());
      keyframe[formatted_property] = value.trim();
    }
    return keyframe;
  }
  var linear = (t) => t;
  function transition(flags2, element2, get_fn, get_params) {
    var _a3;
    var is_intro = (flags2 & TRANSITION_IN) !== 0;
    var is_outro = (flags2 & TRANSITION_OUT) !== 0;
    var is_both = is_intro && is_outro;
    var is_global = (flags2 & TRANSITION_GLOBAL) !== 0;
    var direction = is_both ? "both" : is_intro ? "in" : "out";
    var current_options;
    var inert = element2.inert;
    var overflow = element2.style.overflow;
    var intro;
    var outro;
    function get_options() {
      return without_reactive_context(() => {
        return current_options ?? (current_options = get_fn()(element2, get_params?.() ?? /** @type {P} */
        {}, {
          direction
        }));
      });
    }
    var transition2 = {
      is_global,
      in() {
        element2.inert = inert;
        if (!is_intro) {
          outro?.abort();
          outro?.reset?.();
          return;
        }
        if (!is_outro) {
          intro?.abort();
        }
        intro = animate(element2, get_options(), outro, 1, () => {
          dispatch_event(element2, "introend");
          intro?.abort();
          intro = current_options = void 0;
          element2.style.overflow = overflow;
        });
      },
      out(fn) {
        if (!is_outro) {
          fn?.();
          current_options = void 0;
          return;
        }
        element2.inert = true;
        outro = animate(element2, get_options(), intro, 0, () => {
          dispatch_event(element2, "outroend");
          fn?.();
        });
      },
      stop: () => {
        intro?.abort();
        outro?.abort();
      }
    };
    var e = (
      /** @type {Effect & { nodes: EffectNodes }} */
      active_effect
    );
    ((_a3 = e.nodes).t ?? (_a3.t = [])).push(transition2);
    if (is_intro && should_intro) {
      var run3 = is_global;
      if (!run3) {
        var block2 = (
          /** @type {Effect | null} */
          e.parent
        );
        while (block2 && (block2.f & EFFECT_TRANSPARENT) !== 0) {
          while (block2 = block2.parent) {
            if ((block2.f & BLOCK_EFFECT) !== 0) break;
          }
        }
        run3 = !block2 || (block2.f & EFFECT_RAN) !== 0;
      }
      if (run3) {
        effect(() => {
          untrack(() => transition2.in());
        });
      }
    }
  }
  function animate(element2, options, counterpart, t2, on_finish) {
    var is_intro = t2 === 1;
    if (is_function(options)) {
      var a;
      var aborted2 = false;
      queue_micro_task(() => {
        if (aborted2) return;
        var o = options({ direction: is_intro ? "in" : "out" });
        a = animate(element2, o, counterpart, t2, on_finish);
      });
      return {
        abort: () => {
          aborted2 = true;
          a?.abort();
        },
        deactivate: () => a.deactivate(),
        reset: () => a.reset(),
        t: () => a.t()
      };
    }
    counterpart?.deactivate();
    if (!options?.duration && !options?.delay) {
      dispatch_event(element2, is_intro ? "introstart" : "outrostart");
      on_finish();
      return {
        abort: noop,
        deactivate: noop,
        reset: noop,
        t: () => t2
      };
    }
    const { delay = 0, css, tick: tick2, easing = linear } = options;
    var keyframes = [];
    if (is_intro && counterpart === void 0) {
      if (tick2) {
        tick2(0, 1);
      }
      if (css) {
        var styles = css_to_keyframe(css(0, 1));
        keyframes.push(styles, styles);
      }
    }
    var get_t = () => 1 - t2;
    var animation2 = element2.animate(keyframes, { duration: delay, fill: "forwards" });
    animation2.onfinish = () => {
      animation2.cancel();
      dispatch_event(element2, is_intro ? "introstart" : "outrostart");
      var t1 = counterpart?.t() ?? 1 - t2;
      counterpart?.abort();
      var delta = t2 - t1;
      var duration = (
        /** @type {number} */
        options.duration * Math.abs(delta)
      );
      var keyframes2 = [];
      if (duration > 0) {
        var needs_overflow_hidden = false;
        if (css) {
          var n = Math.ceil(duration / (1e3 / 60));
          for (var i = 0; i <= n; i += 1) {
            var t = t1 + delta * easing(i / n);
            var styles2 = css_to_keyframe(css(t, 1 - t));
            keyframes2.push(styles2);
            needs_overflow_hidden || (needs_overflow_hidden = styles2.overflow === "hidden");
          }
        }
        if (needs_overflow_hidden) {
          element2.style.overflow = "hidden";
        }
        get_t = () => {
          var time = (
            /** @type {number} */
            /** @type {globalThis.Animation} */
            animation2.currentTime
          );
          return t1 + delta * easing(time / duration);
        };
        if (tick2) {
          loop(() => {
            if (animation2.playState !== "running") return false;
            var t3 = get_t();
            tick2(t3, 1 - t3);
            return true;
          });
        }
      }
      animation2 = element2.animate(keyframes2, { duration, fill: "forwards" });
      animation2.onfinish = () => {
        get_t = () => t2;
        tick2?.(t2, 1 - t2);
        on_finish();
      };
    };
    return {
      abort: () => {
        if (animation2) {
          animation2.cancel();
          animation2.effect = null;
          animation2.onfinish = noop;
        }
      },
      deactivate: () => {
        on_finish = noop;
      },
      reset: () => {
        if (t2 === 0) {
          tick2?.(1, 0);
        }
      },
      t: () => get_t()
    };
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/shared/attributes.js
  var whitespace = [..." 	\n\r\f \v\uFEFF"];
  function to_class(value, hash2, directives) {
    var classname = value == null ? "" : "" + value;
    if (hash2) {
      classname = classname ? classname + " " + hash2 : hash2;
    }
    if (directives) {
      for (var key3 in directives) {
        if (directives[key3]) {
          classname = classname ? classname + " " + key3 : key3;
        } else if (classname.length) {
          var len = key3.length;
          var a = 0;
          while ((a = classname.indexOf(key3, a)) >= 0) {
            var b = a + len;
            if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
              classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
            } else {
              a = b;
            }
          }
        }
      }
    }
    return classname === "" ? null : classname;
  }
  function append_styles(styles, important = false) {
    var separator = important ? " !important;" : ";";
    var css = "";
    for (var key3 in styles) {
      var value = styles[key3];
      if (value != null && value !== "") {
        css += " " + key3 + ": " + value + separator;
      }
    }
    return css;
  }
  function to_css_name(name) {
    if (name[0] !== "-" || name[1] !== "-") {
      return name.toLowerCase();
    }
    return name;
  }
  function to_style(value, styles) {
    if (styles) {
      var new_style = "";
      var normal_styles;
      var important_styles;
      if (Array.isArray(styles)) {
        normal_styles = styles[0];
        important_styles = styles[1];
      } else {
        normal_styles = styles;
      }
      if (value) {
        value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
        var in_str = false;
        var in_apo = 0;
        var in_comment = false;
        var reserved_names = [];
        if (normal_styles) {
          reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
        }
        if (important_styles) {
          reserved_names.push(...Object.keys(important_styles).map(to_css_name));
        }
        var start_index = 0;
        var name_index = -1;
        const len = value.length;
        for (var i = 0; i < len; i++) {
          var c = value[i];
          if (in_comment) {
            if (c === "/" && value[i - 1] === "*") {
              in_comment = false;
            }
          } else if (in_str) {
            if (in_str === c) {
              in_str = false;
            }
          } else if (c === "/" && value[i + 1] === "*") {
            in_comment = true;
          } else if (c === '"' || c === "'") {
            in_str = c;
          } else if (c === "(") {
            in_apo++;
          } else if (c === ")") {
            in_apo--;
          }
          if (!in_comment && in_str === false && in_apo === 0) {
            if (c === ":" && name_index === -1) {
              name_index = i;
            } else if (c === ";" || i === len - 1) {
              if (name_index !== -1) {
                var name = to_css_name(value.substring(start_index, name_index).trim());
                if (!reserved_names.includes(name)) {
                  if (c !== ";") {
                    i++;
                  }
                  var property = value.substring(start_index, i).trim();
                  new_style += " " + property + ";";
                }
              }
              start_index = i + 1;
              name_index = -1;
            }
          }
        }
      }
      if (normal_styles) {
        new_style += append_styles(normal_styles);
      }
      if (important_styles) {
        new_style += append_styles(important_styles, true);
      }
      new_style = new_style.trim();
      return new_style === "" ? null : new_style;
    }
    return value == null ? null : String(value);
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/class.js
  function set_class(dom, is_html, value, hash2, prev_classes, next_classes) {
    var prev = dom.__className;
    if (hydrating || prev !== value || prev === void 0) {
      var next_class_name = to_class(value, hash2, next_classes);
      if (!hydrating || next_class_name !== dom.getAttribute("class")) {
        if (next_class_name == null) {
          dom.removeAttribute("class");
        } else if (is_html) {
          dom.className = next_class_name;
        } else {
          dom.setAttribute("class", next_class_name);
        }
      }
      dom.__className = value;
    } else if (next_classes && prev_classes !== next_classes) {
      for (var key3 in next_classes) {
        var is_present = !!next_classes[key3];
        if (prev_classes == null || is_present !== !!prev_classes[key3]) {
          dom.classList.toggle(key3, is_present);
        }
      }
    }
    return next_classes;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/style.js
  function update_styles(dom, prev = {}, next2, priority) {
    for (var key3 in next2) {
      var value = next2[key3];
      if (prev[key3] !== value) {
        if (next2[key3] == null) {
          dom.style.removeProperty(key3);
        } else {
          dom.style.setProperty(key3, value, priority);
        }
      }
    }
  }
  function set_style(dom, value, prev_styles, next_styles) {
    var prev = dom.__style;
    if (hydrating || prev !== value) {
      var next_style_attr = to_style(value, next_styles);
      if (!hydrating || next_style_attr !== dom.getAttribute("style")) {
        if (next_style_attr == null) {
          dom.removeAttribute("style");
        } else {
          dom.style.cssText = next_style_attr;
        }
      }
      dom.__style = value;
    } else if (next_styles) {
      if (Array.isArray(next_styles)) {
        update_styles(dom, prev_styles?.[0], next_styles[0]);
        update_styles(dom, prev_styles?.[1], next_styles[1], "important");
      } else {
        update_styles(dom, prev_styles, next_styles);
      }
    }
    return next_styles;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/attributes.js
  var IS_CUSTOM_ELEMENT = /* @__PURE__ */ Symbol("is custom element");
  var IS_HTML = /* @__PURE__ */ Symbol("is html");
  function remove_input_defaults(input) {
    if (!hydrating) return;
    var already_removed = false;
    var remove_defaults = () => {
      if (already_removed) return;
      already_removed = true;
      if (input.hasAttribute("value")) {
        var value = input.value;
        set_attribute2(input, "value", null);
        input.value = value;
      }
      if (input.hasAttribute("checked")) {
        var checked = input.checked;
        set_attribute2(input, "checked", null);
        input.checked = checked;
      }
    };
    input.__on_r = remove_defaults;
    queue_micro_task(remove_defaults);
    add_form_reset_listener();
  }
  function set_value(element2, value) {
    var attributes = get_attributes(element2);
    if (attributes.value === (attributes.value = // treat null and undefined the same for the initial value
    value ?? void 0) || // @ts-expect-error
    // `progress` elements always need their value set when it's `0`
    element2.value === value && (value !== 0 || element2.nodeName !== "PROGRESS")) {
      return;
    }
    element2.value = value ?? "";
  }
  function set_checked(element2, checked) {
    var attributes = get_attributes(element2);
    if (attributes.checked === (attributes.checked = // treat null and undefined the same for the initial value
    checked ?? void 0)) {
      return;
    }
    element2.checked = checked;
  }
  function set_attribute2(element2, attribute, value, skip_warning) {
    var attributes = get_attributes(element2);
    if (hydrating) {
      attributes[attribute] = element2.getAttribute(attribute);
      if (attribute === "src" || attribute === "srcset" || attribute === "href" && element2.nodeName === "LINK") {
        if (!skip_warning) {
          check_src_in_dev_hydration(element2, attribute, value ?? "");
        }
        return;
      }
    }
    if (attributes[attribute] === (attributes[attribute] = value)) return;
    if (attribute === "loading") {
      element2[LOADING_ATTR_SYMBOL] = value;
    }
    if (value == null) {
      element2.removeAttribute(attribute);
    } else if (typeof value !== "string" && get_setters(element2).includes(attribute)) {
      element2[attribute] = value;
    } else {
      element2.setAttribute(attribute, value);
    }
  }
  function get_attributes(element2) {
    return (
      /** @type {Record<string | symbol, unknown>} **/
      // @ts-expect-error
      element2.__attributes ?? (element2.__attributes = {
        [IS_CUSTOM_ELEMENT]: element2.nodeName.includes("-"),
        [IS_HTML]: element2.namespaceURI === NAMESPACE_HTML
      })
    );
  }
  var setters_cache = /* @__PURE__ */ new Map();
  function get_setters(element2) {
    var cache_key = element2.getAttribute("is") || element2.nodeName;
    var setters = setters_cache.get(cache_key);
    if (setters) return setters;
    setters_cache.set(cache_key, setters = []);
    var descriptors;
    var proto = element2;
    var element_proto = Element.prototype;
    while (element_proto !== proto) {
      descriptors = get_descriptors(proto);
      for (var key3 in descriptors) {
        if (descriptors[key3].set) {
          setters.push(key3);
        }
      }
      proto = get_prototype_of(proto);
    }
    return setters;
  }
  function check_src_in_dev_hydration(element2, attribute, value) {
    if (!true_default) return;
    if (attribute === "srcset" && srcset_url_equal(element2, value)) return;
    if (src_url_equal(element2.getAttribute(attribute) ?? "", value)) return;
    hydration_attribute_changed(
      attribute,
      element2.outerHTML.replace(element2.innerHTML, element2.innerHTML && "..."),
      String(value)
    );
  }
  function src_url_equal(element_src, url) {
    if (element_src === url) return true;
    return new URL(element_src, document.baseURI).href === new URL(url, document.baseURI).href;
  }
  function split_srcset(srcset) {
    return srcset.split(",").map((src) => src.trim().split(" ").filter(Boolean));
  }
  function srcset_url_equal(element2, srcset) {
    var element_urls = split_srcset(element2.srcset);
    var urls = split_srcset(srcset);
    return urls.length === element_urls.length && urls.every(
      ([url, width], i) => width === element_urls[i][1] && // We need to test both ways because Vite will create an a full URL with
      // `new URL(asset, import.meta.url).href` for the client when `base: './'`, and the
      // relative URLs inside srcset are not automatically resolved to absolute URLs by
      // browsers (in contrast to img.src). This means both SSR and DOM code could
      // contain relative or absolute URLs.
      (src_url_equal(element_urls[i][0], url) || src_url_equal(url, element_urls[i][0]))
    );
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
  function bind_value(input, get3, set2 = get3) {
    var batches2 = /* @__PURE__ */ new WeakSet();
    listen_to_event_and_reset_event(input, "input", async (is_reset) => {
      if (true_default && input.type === "checkbox") {
        bind_invalid_checkbox_value();
      }
      var value = is_reset ? input.defaultValue : input.value;
      value = is_numberlike_input(input) ? to_number(value) : value;
      set2(value);
      if (current_batch !== null) {
        batches2.add(current_batch);
      }
      await tick();
      if (value !== (value = get3())) {
        var start = input.selectionStart;
        var end = input.selectionEnd;
        var length = input.value.length;
        input.value = value ?? "";
        if (end !== null) {
          var new_length = input.value.length;
          if (start === end && end === length && new_length > length) {
            input.selectionStart = new_length;
            input.selectionEnd = new_length;
          } else {
            input.selectionStart = start;
            input.selectionEnd = Math.min(end, new_length);
          }
        }
      }
    });
    if (
      // If we are hydrating and the value has since changed,
      // then use the updated value from the input instead.
      hydrating && input.defaultValue !== input.value || // If defaultValue is set, then value == defaultValue
      // TODO Svelte 6: remove input.value check and set to empty string?
      untrack(get3) == null && input.value
    ) {
      set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
      if (current_batch !== null) {
        batches2.add(current_batch);
      }
    }
    render_effect(() => {
      if (true_default && input.type === "checkbox") {
        bind_invalid_checkbox_value();
      }
      var value = get3();
      if (input === document.activeElement) {
        var batch = (
          /** @type {Batch} */
          previous_batch ?? current_batch
        );
        if (batches2.has(batch)) {
          return;
        }
      }
      if (is_numberlike_input(input) && value === to_number(input.value)) {
        return;
      }
      if (input.type === "date" && !value && !input.value) {
        return;
      }
      if (value !== input.value) {
        input.value = value ?? "";
      }
    });
  }
  function is_numberlike_input(input) {
    var type = input.type;
    return type === "number" || type === "range";
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
  function is_bound_this(bound_value, element_or_component) {
    return bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component;
  }
  function bind_this(element_or_component = {}, update2, get_value, get_parts) {
    effect(() => {
      var old_parts;
      var parts;
      render_effect(() => {
        old_parts = parts;
        parts = get_parts?.() || [];
        untrack(() => {
          if (element_or_component !== get_value(...parts)) {
            update2(element_or_component, ...parts);
            if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
              update2(null, ...old_parts);
            }
          }
        });
      });
      return () => {
        queue_micro_task(() => {
          if (parts && is_bound_this(get_value(...parts), element_or_component)) {
            update2(null, ...parts);
          }
        });
      };
    });
    return element_or_component;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/store/utils.js
  function subscribe_to_store(store, run3, invalidate) {
    if (store == null) {
      run3(void 0);
      if (invalidate) invalidate(void 0);
      return noop;
    }
    const unsub = untrack(
      () => store.subscribe(
        run3,
        // @ts-expect-error
        invalidate
      )
    );
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/store/shared/index.js
  var subscriber_queue = [];
  function writable(value, start = noop) {
    let stop = null;
    const subscribers = /* @__PURE__ */ new Set();
    function set2(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          const run_queue = !subscriber_queue.length;
          for (const subscriber of subscribers) {
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update2(fn) {
      set2(fn(
        /** @type {T} */
        value
      ));
    }
    function subscribe(run3, invalidate = noop) {
      const subscriber = [run3, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set2, update2) || noop;
      }
      run3(
        /** @type {T} */
        value
      );
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = null;
        }
      };
    }
    return { set: set2, update: update2, subscribe };
  }
  function get2(store) {
    let value;
    subscribe_to_store(store, (_) => value = _)();
    return value;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/store.js
  var is_store_binding = false;
  var IS_UNMOUNTED = /* @__PURE__ */ Symbol();
  function store_get(store, store_name, stores) {
    const entry = stores[store_name] ?? (stores[store_name] = {
      store: null,
      source: mutable_source(void 0),
      unsubscribe: noop
    });
    if (true_default) {
      entry.source.label = store_name;
    }
    if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
      entry.unsubscribe();
      entry.store = store ?? null;
      if (store == null) {
        entry.source.v = void 0;
        entry.unsubscribe = noop;
      } else {
        var is_synchronous_callback = true;
        entry.unsubscribe = subscribe_to_store(store, (v) => {
          if (is_synchronous_callback) {
            entry.source.v = v;
          } else {
            set(entry.source, v);
          }
        });
        is_synchronous_callback = false;
      }
    }
    if (store && IS_UNMOUNTED in stores) {
      return get2(store);
    }
    return get(entry.source);
  }
  function setup_stores() {
    const stores = {};
    function cleanup() {
      teardown(() => {
        for (var store_name in stores) {
          const ref = stores[store_name];
          ref.unsubscribe();
        }
        define_property(stores, IS_UNMOUNTED, {
          enumerable: false,
          value: true
        });
      });
    }
    return [stores, cleanup];
  }
  function capture_store_binding(fn) {
    var previous_is_store_binding = is_store_binding;
    try {
      is_store_binding = false;
      return [fn(), is_store_binding];
    } finally {
      is_store_binding = previous_is_store_binding;
    }
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/client/reactivity/props.js
  function prop(props, key3, flags2, fallback3) {
    var runes = !legacy_mode_flag || (flags2 & PROPS_IS_RUNES) !== 0;
    var bindable = (flags2 & PROPS_IS_BINDABLE) !== 0;
    var lazy = (flags2 & PROPS_IS_LAZY_INITIAL) !== 0;
    var fallback_value = (
      /** @type {V} */
      fallback3
    );
    var fallback_dirty = true;
    var get_fallback = () => {
      if (fallback_dirty) {
        fallback_dirty = false;
        fallback_value = lazy ? untrack(
          /** @type {() => V} */
          fallback3
        ) : (
          /** @type {V} */
          fallback3
        );
      }
      return fallback_value;
    };
    var setter;
    if (bindable) {
      var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
      setter = get_descriptor(props, key3)?.set ?? (is_entry_props && key3 in props ? (v) => props[key3] = v : void 0);
    }
    var initial_value;
    var is_store_sub = false;
    if (bindable) {
      [initial_value, is_store_sub] = capture_store_binding(() => (
        /** @type {V} */
        props[key3]
      ));
    } else {
      initial_value = /** @type {V} */
      props[key3];
    }
    if (initial_value === void 0 && fallback3 !== void 0) {
      initial_value = get_fallback();
      if (setter) {
        if (runes) props_invalid_value(key3);
        setter(initial_value);
      }
    }
    var getter;
    if (runes) {
      getter = () => {
        var value = (
          /** @type {V} */
          props[key3]
        );
        if (value === void 0) return get_fallback();
        fallback_dirty = true;
        return value;
      };
    } else {
      getter = () => {
        var value = (
          /** @type {V} */
          props[key3]
        );
        if (value !== void 0) {
          fallback_value = /** @type {V} */
          void 0;
        }
        return value === void 0 ? fallback_value : value;
      };
    }
    if (runes && (flags2 & PROPS_IS_UPDATED) === 0) {
      return getter;
    }
    if (setter) {
      var legacy_parent = props.$$legacy;
      return (
        /** @type {() => V} */
        (function(value, mutation) {
          if (arguments.length > 0) {
            if (!runes || !mutation || legacy_parent || is_store_sub) {
              setter(mutation ? getter() : value);
            }
            return value;
          }
          return getter();
        })
      );
    }
    var overridden = false;
    var d = ((flags2 & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
      overridden = false;
      return getter();
    });
    if (true_default) {
      d.label = key3;
    }
    if (bindable) get(d);
    var parent_effect = (
      /** @type {Effect} */
      active_effect
    );
    return (
      /** @type {() => V} */
      (function(value, mutation) {
        if (arguments.length > 0) {
          const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
          set(d, new_value);
          overridden = true;
          if (fallback_value !== void 0) {
            fallback_value = new_value;
          }
          return value;
        }
        if (is_destroying_effect && overridden || (parent_effect.f & DESTROYED) !== 0) {
          return d.v;
        }
        return get(d);
      })
    );
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/index-client.js
  if (true_default) {
    let throw_rune_error = function(rune) {
      if (!(rune in globalThis)) {
        let value;
        Object.defineProperty(globalThis, rune, {
          configurable: true,
          // eslint-disable-next-line getter-return
          get: () => {
            if (value !== void 0) {
              return value;
            }
            rune_outside_svelte(rune);
          },
          set: (v) => {
            value = v;
          }
        });
      }
    };
    throw_rune_error("$state");
    throw_rune_error("$effect");
    throw_rune_error("$derived");
    throw_rune_error("$inspect");
    throw_rune_error("$props");
    throw_rune_error("$bindable");
  }
  function onMount(fn) {
    if (component_context === null) {
      lifecycle_outside_component("onMount");
    }
    if (legacy_mode_flag && component_context.l !== null) {
      init_update_callbacks(component_context).m.push(fn);
    } else {
      user_effect(() => {
        const cleanup = untrack(fn);
        if (typeof cleanup === "function") return (
          /** @type {() => void} */
          cleanup
        );
      });
    }
  }
  function init_update_callbacks(context) {
    var l = (
      /** @type {ComponentContextLegacy} */
      context.l
    );
    return l.u ?? (l.u = { a: [], b: [], m: [] });
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/version.js
  var PUBLIC_VERSION = "5";

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/internal/disclose-version.js
  var _a;
  if (typeof window !== "undefined") {
    ((_a = window.__svelte ?? (window.__svelte = {})).v ?? (_a.v = /* @__PURE__ */ new Set())).add(PUBLIC_VERSION);
  }

  // node_modules/.pnpm/@mdi+js@7.4.47/node_modules/@mdi/js/mdi.js
  var mdiAccountCancelOutline = "M10 4A4 4 0 0 0 6 8A4 4 0 0 0 10 12A4 4 0 0 0 14 8A4 4 0 0 0 10 4M10 6A2 2 0 0 1 12 8A2 2 0 0 1 10 10A2 2 0 0 1 8 8A2 2 0 0 1 10 6M10 13C7.33 13 2 14.33 2 17V20H11.5A6.5 6.5 0 0 1 11.03 18.1H3.9V17C3.9 16.36 7.03 14.9 10 14.9C10.5 14.9 11 14.95 11.5 15.03A6.5 6.5 0 0 1 12.55 13.29C11.61 13.1 10.71 13 10 13M17.5 13C15 13 13 15 13 17.5C13 20 15 22 17.5 22C20 22 22 20 22 17.5C22 15 20 13 17.5 13M17.5 14.5C19.16 14.5 20.5 15.84 20.5 17.5C20.5 18.06 20.35 18.58 20.08 19L16 14.92C16.42 14.65 16.94 14.5 17.5 14.5M14.92 16L19 20.08C18.58 20.35 18.06 20.5 17.5 20.5C15.84 20.5 14.5 19.16 14.5 17.5C14.5 16.94 14.65 16.42 14.92 16Z";
  var mdiAccountCheckOutline = "M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4M11,6A2,2 0 0,0 9,8A2,2 0 0,0 11,10A2,2 0 0,0 13,8A2,2 0 0,0 11,6M11,13C11.68,13 12.5,13.09 13.41,13.26L11.74,14.93L11,14.9C8.03,14.9 4.9,16.36 4.9,17V18.1H11.1L13,20H3V17C3,14.34 8.33,13 11,13Z";
  var mdiCancel = "M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z";
  var mdiCheck = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
  var mdiCheckCircleOutline = "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z";
  var mdiClose = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
  var mdiEyeOff = "M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z";
  var mdiEyeOffOutline = "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z";
  var mdiOpenInNew = "M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z";

  // src/bilibili.com/utils/getCurrentTheme.ts
  var cache;
  function compute() {
    const match = getComputedStyle(document.body).backgroundColor.match(
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+)?\s*\)$/
    );
    if (match) {
      const luminance = (0.299 * Number.parseInt(match[1], 10) + 0.587 * Number.parseInt(match[2], 10) + 0.114 * Number.parseInt(match[3], 10)) / 255;
      return luminance > 0.5 ? "light" : "dark";
    }
    return "light";
  }
  function getCurrentTheme() {
    const now2 = performance?.now() ?? Date.now();
    if (!cache || now2 >= cache.notAfter) {
      cache = { value: compute(), notAfter: now2 + 1e3 };
    }
    return cache.value;
  }

  // src/utils/GMValue.ts
  var GMValue = class {
    constructor(key3, defaultValue) {
      this.key = key3;
      this.defaultValue = defaultValue;
      this.loadingCount = 0;
      this.listeners = /* @__PURE__ */ new Set();
      this.addChangeListener = (listener) => {
        this.listeners.add(listener);
        return () => {
          this.listeners.delete(listener);
        };
      };
      this.subscribe = (run3) => {
        run3(this.value);
        return this.addChangeListener(run3);
      };
      this.refresh = async () => {
        if (this.isLoading) {
          await this.currentAction;
          return;
        }
        this.loadingCount += 1;
        this.currentAction = (async () => {
          try {
            const value = await GM.getValue(this.key);
            let newValue;
            if (value == null) {
              newValue = void 0;
            } else if (typeof value === "string") {
              newValue = JSON.parse(value);
            } else {
              throw new Error(
                `GMValue(${this.key}): unrecognizable value '${value}'`
              );
            }
            if (JSON.stringify(this.value) !== JSON.stringify(newValue)) {
              this.value = newValue;
              this.listeners.forEach((i) => i(this.value));
            }
          } finally {
            this.loadingCount -= 1;
          }
        })();
        await this.currentAction;
      };
      this.flush = async () => {
        this.loadingCount += 1;
        this.currentAction = (async () => {
          try {
            if (this.value == null) {
              await GM.deleteValue(this.key);
            } else {
              await GM.setValue(this.key, JSON.stringify(this.value));
            }
            this.listeners.forEach((i) => i(this.value));
          } finally {
            this.loadingCount -= 1;
          }
        })();
        await this.currentAction;
      };
      this.get = () => {
        return this.value ?? this.defaultValue();
      };
      this.set = (v) => {
        this.value = v;
        this.flush();
      };
      this.dispose = () => {
        this.polling.stop();
      };
      this.polling = new Polling({
        update: () => this.refresh(),
        scheduleNext: (next2) => {
          const handle = setTimeout(next2, 500);
          return {
            dispose: () => clearTimeout(handle)
          };
        }
      });
    }
    get isLoading() {
      return this.loadingCount > 0;
    }
  };

  // src/bilibili.com/models/homePageSettings.ts
  var homePageSettings_default = new class HomePageSettings {
    constructor() {
      this.value = new GMValue(
        "homePageSettings@cb2f3e6c-a1e5-44de-b618-7715559b02ad",
        () => ({})
      );
      this.subscribe = (run3) => {
        return this.value.subscribe(run3);
      };
      this.floorCard = new class {
        constructor(parent) {
          this.parent = parent;
          this.shouldExclude = (i) => {
            if (this.excludeAll) {
              return true;
            }
            if (this.excludeByChannel.includes(i.channel)) {
              return true;
            }
            return false;
          };
        }
        get value() {
          return this.parent.value.get().floorCard;
        }
        set value(v) {
          this.parent.value.set({
            ...this.parent.value.get(),
            floorCard: v
          });
        }
        get excludeAll() {
          return this.value?.excludeAll;
        }
        set excludeAll(v) {
          this.value = {
            ...this.value,
            excludeAll: v
          };
        }
        get excludeByChannel() {
          return this.value?.excludeByChannel ?? [];
        }
        set excludeByChannel(v) {
          this.value = {
            ...this.value,
            excludeByChannel: Array.from(new Set(v)).sort()
          };
        }
      }(this);
    }
    get allowAdblockTips() {
      return this.value.get().allowAdblockTips ?? false;
    }
    set allowAdblockTips(v) {
      this.value.set({
        ...this.value.get(),
        allowAdblockTips: v || void 0
      });
    }
  }();

  // src/bilibili.com/components/SettingsDrawer/HomePageSettings.svelte
  var root_2 = from_html(`<div class="text-gray-500 dark:text-gray-400 text-sm italic py-1">可通过指针悬停在卡片上时左上角显示的按钮来屏蔽单个频道的推广</div>`);
  var root_4 = from_html(`<li class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pl-2 pr-1 py-1 flex items-center shadow-sm"><span class="text-sm text-gray-700 dark:text-gray-300"> </span> <button type="button" class="ml-1 p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors" title="移除"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"></path></svg></button></li>`);
  var root_3 = from_html(`<div><div class="text-sm text-gray-500 dark:text-gray-400 mb-2">已屏蔽频道 <span class="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 rounded-md text-xs text-gray-700 dark:text-gray-300 ml-1"> </span></div> <ol class="flex flex-wrap gap-2 items-center"></ol></div>`);
  var root = from_html(`<section><h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">主页</h2> <div class="space-y-4"><label class="flex items-start gap-3 cursor-pointer group"><input type="checkbox" class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"/> <div class="select-none"><span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">允许</span> <span class="text-xs px-1.5 py-0.5 rounded font-medium mx-1" style="
            color: #e58900;
            background-color: #fff0e3;
          ">检测到您的页面...</span> <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">提示</span></div></label> <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"><h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">楼层推广卡片</h3> <div class="space-y-3"><label class="flex items-center gap-3 cursor-pointer group"><input type="checkbox" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"/> <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">屏蔽所有</span></label> <!></div></div></div></section>`);
  function HomePageSettings2($$anchor, $$props) {
    push($$props, true);
    const $homePageSettings = () => store_get(homePageSettings_default, "$homePageSettings", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    var section = root();
    var div = sibling(child(section), 2);
    var label = child(div);
    var input = child(label);
    remove_input_defaults(input);
    input.__change = (e) => {
      homePageSettings_default.allowAdblockTips = e.currentTarget.checked;
    };
    next(2);
    reset(label);
    var div_1 = sibling(label, 2);
    var div_2 = sibling(child(div_1), 2);
    var label_1 = child(div_2);
    var input_1 = child(label_1);
    remove_input_defaults(input_1);
    input_1.__change = (e) => {
      homePageSettings_default.floorCard.excludeAll = e.currentTarget.checked;
    };
    next(2);
    reset(label_1);
    var node = sibling(label_1, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var fragment = comment();
        var node_1 = first_child(fragment);
        {
          var consequent = ($$anchor3) => {
            var div_3 = root_2();
            append($$anchor3, div_3);
          };
          var alternate = ($$anchor3) => {
            var div_4 = root_3();
            var div_5 = child(div_4);
            var span = sibling(child(div_5));
            var text2 = child(span, true);
            reset(span);
            reset(div_5);
            var ol = sibling(div_5, 2);
            each(ol, 5, () => $homePageSettings()?.floorCard?.excludeByChannel ?? [], (channel) => channel, ($$anchor4, channel) => {
              var li = root_4();
              var span_1 = child(li);
              var text_1 = child(span_1, true);
              reset(span_1);
              var button = sibling(span_1, 2);
              button.__click = () => {
                homePageSettings_default.floorCard.excludeByChannel = homePageSettings_default.floorCard.excludeByChannel.filter((i) => i !== get(channel));
              };
              var svg = child(button);
              var path = child(svg);
              reset(svg);
              reset(button);
              reset(li);
              template_effect(() => {
                set_text(text_1, get(channel));
                set_attribute2(path, "d", mdiClose);
              });
              append($$anchor4, li);
            });
            reset(ol);
            reset(div_4);
            template_effect(() => set_text(text2, ($homePageSettings()?.floorCard?.excludeByChannel ?? []).length));
            append($$anchor3, div_4);
          };
          if_block(node_1, ($$render) => {
            if (($homePageSettings()?.floorCard?.excludeByChannel ?? []).length === 0) $$render(consequent);
            else $$render(alternate, false);
          });
        }
        append($$anchor2, fragment);
      };
      if_block(node, ($$render) => {
        if (!($homePageSettings()?.floorCard?.excludeAll ?? false)) $$render(consequent_1);
      });
    }
    reset(div_2);
    reset(div_1);
    reset(div);
    reset(section);
    template_effect(() => {
      set_checked(input, $homePageSettings()?.allowAdblockTips ?? false);
      set_checked(input_1, $homePageSettings()?.floorCard?.excludeAll ?? false);
    });
    append($$anchor, section);
    pop();
    $$cleanup();
  }
  delegate(["change", "click"]);

  // src/bilibili.com/models/searchSettings.ts
  var SearchSettingsModel = class {
    constructor() {
      this.value = new GMValue(
        "searchSettings@aa1595c8-1664-40de-a80c-9de375c2466a",
        () => ({})
      );
      this.subscribe = (run3) => {
        return this.value.subscribe(run3);
      };
    }
    get strictTitleMatch() {
      return this.value.get().strictTitleMatch ?? false;
    }
    set strictTitleMatch(v) {
      this.value.set({
        ...this.value.get(),
        strictTitleMatch: v || void 0
      });
    }
    get disableNavSuggestion() {
      return this.value.get().disableNavSuggestion;
    }
    set disableNavSuggestion(v) {
      this.value.set({
        ...this.value.get(),
        disableNavSuggestion: v
      });
    }
    get trending() {
      return this.value.get().trending ?? "on";
    }
    set trending(v) {
      this.value.set({
        ...this.value.get(),
        trending: v === "on" ? void 0 : v
      });
    }
  };
  var searchSettings = new SearchSettingsModel();
  var searchSettings_default = searchSettings;

  // src/bilibili.com/components/SettingsDrawer/SearchSettings.svelte
  var root2 = from_html(`<section><h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">搜索</h2> <div class="space-y-4"><div class="p-3 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"><label class="flex items-start gap-3 cursor-pointer group pointer-events-auto"><input type="checkbox" class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"/> <div><div class="text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">严格标题匹配</div> <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">标题必须包含所有关键词，屏蔽联想词和标签匹配</div></div></label></div> <div class="p-3 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"><label class="flex items-start gap-3 cursor-pointer group pointer-events-auto"><input type="checkbox" class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"/> <div><div class="text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">禁用导航栏搜索建议</div> <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">仅隐藏文本，不影响默认搜索行为</div></div></label></div></div></section>`);
  function SearchSettings($$anchor, $$props) {
    push($$props, true);
    const $searchSettings = () => store_get(searchSettings_default, "$searchSettings", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    var section = root2();
    var div = sibling(child(section), 2);
    var div_1 = child(div);
    var label = child(div_1);
    var input = child(label);
    remove_input_defaults(input);
    input.__change = (e) => {
      searchSettings_default.strictTitleMatch = e.currentTarget.checked;
    };
    next(2);
    reset(label);
    reset(div_1);
    var div_2 = sibling(div_1, 2);
    var label_1 = child(div_2);
    var input_1 = child(label_1);
    remove_input_defaults(input_1);
    input_1.__change = (e) => {
      searchSettings_default.disableNavSuggestion = e.currentTarget.checked;
    };
    next(2);
    reset(label_1);
    reset(div_2);
    reset(div);
    reset(section);
    template_effect(() => {
      set_checked(input, $searchSettings()?.strictTitleMatch ?? false);
      set_checked(input_1, $searchSettings()?.disableNavSuggestion ?? false);
    });
    append($$anchor, section);
    pop();
    $$cleanup();
  }
  delegate(["change"]);

  // src/utils/castDate.ts
  function castDate(v) {
    if (v instanceof Date) {
      return v;
    }
    return new Date(v);
  }

  // src/utils/createDate.ts
  function createDate({
    base = /* @__PURE__ */ new Date(),
    year,
    yearOffset,
    month,
    monthOffset,
    date,
    dateOffset,
    hours,
    hoursOffset,
    minutes,
    minutesOffset,
    seconds,
    secondsOffset,
    milliseconds,
    millisecondsOffset
  } = {}) {
    const ret = new Date(castDate(base));
    if (year != null) {
      ret.setFullYear(year);
    }
    if (yearOffset) {
      ret.setFullYear(ret.getFullYear() + yearOffset);
    }
    if (month != null) {
      ret.setMonth(month);
    }
    if (monthOffset) {
      ret.setMonth(ret.getMonth() + monthOffset);
    }
    if (date != null) {
      ret.setDate(date);
    }
    if (dateOffset) {
      ret.setDate(ret.getDate() + dateOffset);
    }
    if (hours != null) {
      ret.setHours(hours);
    }
    if (hoursOffset) {
      ret.setHours(ret.getHours() + hoursOffset);
    }
    if (minutes != null) {
      ret.setMinutes(minutes);
    }
    if (minutesOffset) {
      ret.setMinutes(ret.getMinutes() + minutesOffset);
    }
    if (seconds != null) {
      ret.setSeconds(seconds);
    }
    if (secondsOffset) {
      ret.setSeconds(ret.getSeconds() + secondsOffset);
    }
    if (milliseconds != null) {
      ret.setMilliseconds(milliseconds);
    }
    if (millisecondsOffset) {
      ret.setMilliseconds(ret.getMilliseconds() + millisecondsOffset);
    }
    return ret;
  }

  // src/utils/roundDecimal.ts
  function roundDecimal(v, decimalPlaces) {
    const factor = 10 ** decimalPlaces;
    return Math.round(v * factor + Number.EPSILON) / factor;
  }

  // src/utils/Duration.ts
  function leadingInt(s) {
    let i = 0;
    let x = 0;
    for (; i < s.length; i += 1) {
      const c = s[i];
      if (c < "0" || c > "9") {
        break;
      }
      if (x > Number.MAX_SAFE_INTEGER / 10) {
        throw new Error("overflow");
      }
      x = x * 10 + Number.parseInt(c, 10);
      if (x < 0) {
        throw new Error("overflow");
      }
    }
    return [x, s.slice(i)];
  }
  function leadingNegative(s) {
    if (s === "") {
      return [false, s];
    }
    const c = s[0];
    if (c === "-" || c === "+") {
      return [c === "-", s.slice(1)];
    }
    return [false, s];
  }
  function leadingFraction(s) {
    let x = 0;
    let i = 0;
    let scale = 1;
    let overflow = false;
    for (; i < s.length; i += 1) {
      const c = s[i];
      if (c < "0" || c > "9") {
        break;
      }
      if (overflow) {
        continue;
      }
      if (x > Number.MAX_SAFE_INTEGER / 10) {
        overflow = true;
        continue;
      }
      const y = x * 10 + Number.parseInt(c, 10);
      if (y < 0) {
        overflow = true;
        continue;
      }
      x = y;
      scale *= 10;
    }
    return [x, scale, s.slice(i)];
  }
  function padLeft(v, c, n) {
    let ret = v;
    while (ret.length < n) {
      ret = c + ret;
    }
    return ret;
  }
  function formatSeconds(v) {
    let ret = v.toFixed(3);
    if (ret.indexOf(".") < 2) {
      ret = `0${ret}`;
    }
    return ret;
  }
  var _a2;
  _a2 = Symbol.toPrimitive;
  var _Duration = class _Duration {
    constructor({
      invalid = false,
      negative = false,
      years = 0,
      months = 0,
      weeks = 0,
      days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0,
      milliseconds = 0
    } = {}) {
      this.invalid = false;
      this.negative = false;
      this.years = 0;
      this.months = 0;
      this.weeks = 0;
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      this.milliseconds = 0;
      this.toISOString = () => {
        if (this.invalid) {
          return "";
        }
        let b = "";
        if (this.negative) {
          b += "-";
        }
        b += "P";
        const prefixWidth = b.length;
        if (this.years) {
          b = this.years.toString();
          b += "Y";
        }
        if (this.months) {
          b = this.months.toString();
          b += "M";
        }
        if (this.weeks) {
          b = this.weeks.toString();
          b += "W";
        }
        if (this.days) {
          b += this.days.toString();
          b += "D";
        }
        if (this.hours || this.minutes || this.seconds || this.milliseconds) {
          b += "T";
        }
        if (this.hours) {
          b += this.hours.toString();
          b += "H";
        }
        if (this.minutes) {
          b += this.minutes.toString();
          b += "M";
        }
        if (this.seconds || this.milliseconds) {
          b += roundDecimal(
            this.seconds + this.milliseconds / _Duration.SECOND,
            3
          ).toString();
          b += "S";
        }
        if (b.length === prefixWidth) {
          b += "0D";
        }
        return b;
      };
      this.toMilliseconds = () => {
        if (this.invalid) {
          return NaN;
        }
        return (this.negative ? -1 : 1) * (this.years * _Duration.YEAR + this.months * _Duration.MONTH + this.weeks * _Duration.WEEK + this.days * _Duration.DAY + this.hours * _Duration.HOUR + this.minutes * _Duration.MINUTE + this.seconds * _Duration.SECOND + this.milliseconds * _Duration.MILLISECOND);
      };
      this.toSeconds = () => {
        return this.toMilliseconds() / _Duration.SECOND;
      };
      this.toHours = () => {
        return this.toMilliseconds() / _Duration.HOUR;
      };
      this.toMinutes = () => {
        return this.toMilliseconds() / _Duration.MINUTE;
      };
      /**
       * Format duration to `HH:MM:SS.sss` format
       */
      this.toTimeCode = (fixed = false) => {
        if (this.invalid) {
          return "";
        }
        let v = this.toMilliseconds();
        let sign = "";
        if (v < 0) {
          sign = "-";
          v = -v;
        }
        v /= 1e3;
        const seconds = v % 60;
        v = Math.trunc(v / 60);
        const minutes = v % 60;
        v = Math.trunc(v / 60);
        const hours = v;
        let ret = `${padLeft(hours.toFixed(0), "0", 2)}:${padLeft(
          minutes.toFixed(0),
          "0",
          2
        )}:${formatSeconds(seconds)}`;
        if (!fixed) {
          if (ret.startsWith("0") && ret[1] !== ":") {
            ret = ret.slice(1);
          }
          ret = ret.replace(/\.?0+$/, "");
        }
        ret = sign + ret;
        return ret;
      };
      this.add = (other) => {
        return _Duration.fromMilliseconds(
          this.toMilliseconds() + _Duration.cast(other).toMilliseconds()
        );
      };
      this.sub = (other) => {
        return _Duration.fromMilliseconds(
          this.toMilliseconds() - _Duration.cast(other).toMilliseconds()
        );
      };
      this.abs = () => {
        return _Duration.fromMilliseconds(Math.abs(this.toMilliseconds()));
      };
      this.isZero = () => {
        return this.toMilliseconds() === 0;
      };
      this.validOrUndefined = () => {
        if (this.valid) {
          return this;
        }
      };
      this.truncate = (unitMs) => {
        if (unitMs <= 0) {
          return this;
        }
        const ms = this.toMilliseconds();
        return _Duration.fromMilliseconds(ms - ms % unitMs);
      };
      this.ceil = (unitMs) => {
        if (unitMs <= 0) {
          return this;
        }
        const ms0 = this.toMilliseconds();
        const ms1 = ms0 - ms0 % unitMs;
        if (ms1 < ms0) {
          return _Duration.fromMilliseconds(ms1 + unitMs);
        }
        return _Duration.fromMilliseconds(ms1);
      };
      this.floor = (unitMs) => {
        if (unitMs <= 0) {
          return this;
        }
        const ms0 = this.toMilliseconds();
        const ms1 = ms0 - ms0 % unitMs;
        if (ms1 > ms0) {
          return _Duration.fromMilliseconds(ms1 - unitMs);
        }
        return _Duration.fromMilliseconds(ms1);
      };
      this.valueOf = () => {
        return this.toMilliseconds();
      };
      this.toString = () => {
        if (this.invalid) {
          return "Invalid Duration";
        }
        return this.toISOString();
      };
      this[_a2] = (hint) => {
        switch (hint) {
          case "number":
            return this.toMilliseconds();
          case "string":
            return this.toISOString();
          default:
            return this.toISOString();
        }
      };
      this.multiply = (v) => {
        if (v === -1) {
          return new _Duration({
            invalid: this.invalid,
            negative: !this.negative,
            years: this.years,
            months: this.months,
            weeks: this.weeks,
            days: this.days,
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds,
            milliseconds: this.milliseconds
          });
        }
        return new _Duration({
          invalid: this.invalid,
          negative: this.negative,
          years: this.years * v,
          months: this.months * v,
          weeks: this.weeks * v,
          days: this.days * v,
          hours: this.hours * v,
          minutes: this.minutes * v,
          seconds: this.seconds * v,
          milliseconds: this.milliseconds * v
        });
      };
      this.createDate = (base) => {
        const direction = this.negative ? -1 : 1;
        return createDate({
          base,
          yearOffset: this.years * direction,
          monthOffset: this.months * direction,
          dateOffset: this.days * direction + 7 * this.weeks * direction,
          hoursOffset: this.hours * direction,
          minutesOffset: this.minutes * direction,
          secondsOffset: this.seconds * direction,
          millisecondsOffset: this.milliseconds * direction
        });
      };
      let invalidCount = 0;
      if (invalid) {
        invalidCount += 1;
      }
      function checkNumber(v) {
        if (Number.isFinite(v)) {
          return v;
        }
        invalidCount += 1;
        return 0;
      }
      this.negative = negative;
      this.years = checkNumber(years);
      this.months = checkNumber(months);
      this.weeks = checkNumber(weeks);
      this.days = checkNumber(days);
      this.hours = checkNumber(hours);
      this.minutes = checkNumber(minutes);
      this.seconds = checkNumber(seconds);
      this.milliseconds = checkNumber(milliseconds);
      this.invalid = invalidCount > 0;
    }
    get valid() {
      return !this.invalid;
    }
  };
  _Duration.MILLISECOND = 1;
  _Duration.SECOND = 1e3;
  _Duration.MINUTE = _Duration.SECOND * 60;
  _Duration.HOUR = _Duration.MINUTE * 60;
  _Duration.DAY = _Duration.HOUR * 24;
  _Duration.WEEK = _Duration.DAY * 7;
  _Duration.MONTH = _Duration.DAY / 10 * 146097 / 4800 * 10;
  _Duration.YEAR = _Duration.MONTH * 12;
  _Duration.fromMilliseconds = (milliseconds = 0) => {
    const d = {};
    let ms = milliseconds;
    if (ms < 0) {
      d.negative = true;
      ms = -ms;
    }
    d.hours = Math.trunc(ms / _Duration.HOUR);
    ms %= _Duration.HOUR;
    d.minutes = Math.trunc(ms / _Duration.MINUTE);
    ms %= _Duration.MINUTE;
    d.seconds = Math.trunc(ms / _Duration.SECOND);
    ms %= _Duration.SECOND;
    d.milliseconds = ms;
    return new _Duration(d);
  };
  _Duration.fromTimeCode = (value) => {
    if (value === "") {
      return new _Duration({ invalid: true });
    }
    let s = value;
    const d = {
      negative: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    if (s.startsWith("-")) {
      s = s.slice(1);
      d.negative = true;
    }
    const parts = s.split(/[:：]/);
    parts.splice(0, 0, ...["0", "0"].splice(parts.length - 1));
    const [hours, minutes, seconds] = parts;
    if (hours) {
      d.hours = parseFloat(hours);
    }
    if (minutes) {
      d.minutes = parseFloat(minutes);
    }
    if (seconds) {
      d.seconds = parseFloat(seconds);
    }
    return new _Duration(d);
  };
  /**
   * @param value iso 8601 duration string
   */
  _Duration.parse = (value) => {
    const d = {
      invalid: false,
      negative: false,
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    };
    let s = value;
    [d.negative, s] = leadingNegative(s);
    if (s === "" || !s.startsWith("P")) {
      d.invalid = true;
      return new _Duration(d);
    }
    s = s.slice(1);
    let afterT = false;
    while (s) {
      if (s.startsWith("T")) {
        s = s.slice(1);
        afterT = true;
      }
      let v = 0;
      let f = 0;
      let scale = 1;
      let neg = false;
      let pre = false;
      let post = false;
      [neg, s] = leadingNegative(s);
      const pl = s.length;
      [v, s] = leadingInt(s);
      pre = pl !== s.length;
      if (neg) {
        v = -v;
      }
      if (s.startsWith(".")) {
        s = s.slice(1);
        const pl2 = s.length;
        [f, scale, s] = leadingFraction(s);
        post = pl2 !== s.length;
        if (neg) {
          f = -f;
        }
      }
      if (!pre && !post) {
        d.invalid = true;
        return new _Duration(d);
      }
      const u = s[0];
      s = s.slice(1);
      if (!afterT) {
        switch (u) {
          case "Y":
            d.years += v;
            d.months += f * (_Duration.YEAR / _Duration.MONTH / scale);
            break;
          case "M":
            d.months += v;
            d.weeks += f * (_Duration.MONTH / _Duration.WEEK / scale);
            break;
          case "W":
            d.weeks += v;
            d.days += f * (_Duration.WEEK / _Duration.DAY / scale);
            break;
          case "D":
            d.days += v;
            d.hours += f * (_Duration.DAY / _Duration.HOUR / scale);
            break;
          default:
            d.invalid = true;
            return new _Duration(d);
        }
      } else {
        switch (u) {
          case "H":
            d.hours += v;
            d.minutes += f * (_Duration.HOUR / _Duration.MINUTE / scale);
            break;
          case "M":
            d.minutes += v;
            d.seconds += f * (_Duration.MINUTE / _Duration.SECOND / scale);
            break;
          case "S":
            d.seconds += v;
            d.milliseconds += f * (_Duration.SECOND / _Duration.MILLISECOND / scale);
            break;
          default:
            d.invalid = true;
            return new _Duration(d);
        }
      }
      if (post && s !== "") {
        d.invalid = true;
        return new _Duration(d);
      }
    }
    return new _Duration(d);
  };
  _Duration.cast = (v) => {
    if (v instanceof _Duration) {
      return v;
    }
    if (typeof v === "string") {
      if (v.startsWith("P") || v.startsWith("-P")) {
        return _Duration.parse(v);
      }
      return _Duration.fromTimeCode(v);
    }
    return new _Duration(v);
  };
  var Duration = _Duration;

  // src/utils/optionalArray.ts
  function optionalArray(arr) {
    if (!arr || arr.length === 0) {
      return;
    }
    return arr;
  }

  // src/bilibili.com/models/videoListSettings.ts
  var videoListSettings_default = new class VideoListSettings {
    constructor() {
      this.value = new GMValue("videoListSettings@4eb93ea9-8748-4647-876f-30451395e561", () => ({}));
      this.subscribe = (run3) => {
        return this.value.subscribe(run3);
      };
    }
    get allowAdvertisement() {
      return this.value.get().allowAdvertisement ?? false;
    }
    set allowAdvertisement(v) {
      this.value.set({
        ...this.value.get(),
        allowAdvertisement: v || void 0
      });
    }
    get allowPromoted() {
      return this.value.get().allowPromoted ?? false;
    }
    set allowPromoted(v) {
      this.value.set({
        ...this.value.get(),
        allowPromoted: v || void 0
      });
    }
    get excludeKeywords() {
      return this.value.get().excludeKeywords ?? [];
    }
    set excludeKeywords(v) {
      this.value.set({
        ...this.value.get(),
        excludeKeywords: optionalArray(v.filter((i) => i))
      });
    }
    get durationGte() {
      return Duration.parse(this.value.get().durationGte ?? "");
    }
    set durationGte(v) {
      const d = Duration.cast(v);
      if (d.toMilliseconds() >= Duration.HOUR) {
        this.durationGte = "PT1M";
        return;
      }
      this.value.set({
        ...this.value.get(),
        durationGte: d.invalid ? void 0 : d.toISOString()
      });
    }
    get durationLt() {
      const v = Duration.parse(this.value.get().durationLt ?? "");
      if (v.toMilliseconds() <= 10 * Duration.MINUTE) {
        return Duration.parse("");
      }
      return v;
    }
    set durationLt(v) {
      const d = Duration.cast(v);
      if (d.valid && d.toMilliseconds() <= 10 * Duration.MINUTE) {
        this.durationLt = "PT30M";
        return;
      }
      this.value.set({
        ...this.value.get(),
        durationLt: d.invalid ? void 0 : d.toISOString()
      });
    }
  }();

  // src/utils/growTextAreaHeight.ts
  function growTextAreaHeight(el) {
    const maxHeight = Math.min(window.innerHeight, el.scrollHeight);
    if (el.scrollHeight > el.clientHeight && el.clientHeight < maxHeight) {
      el.style.height = `${maxHeight}px`;
    }
  }

  // src/bilibili.com/components/SettingsDrawer/VideoListSettings.svelte
  var root3 = from_html(`<section><h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">视频列表</h2> <div class="space-y-4"><div class="space-y-3"><label class="flex items-center gap-3 cursor-pointer group"><input type="checkbox" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"/> <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">允许广告（非视频）</span></label> <label class="flex items-center gap-3 cursor-pointer group"><input type="checkbox" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"/> <span class="text-gray-700 dark:text-gray-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">允许推广</span></label></div> <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4"><h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">时长限制</h3> <div class="grid grid-cols-2 gap-3"><label><div class="text-xs text-gray-500 dark:text-gray-400 mb-1">最短（含）</div> <input class="
              w-full px-3 py-2 bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              text-gray-900 dark:text-gray-100 placeholder-gray-400
              text-sm
            " type="text" placeholder="HH:MM:SS"/></label> <label><div class="text-xs text-gray-500 dark:text-gray-400 mb-1">最长（不含）</div> <input class="
              w-full px-3 py-2 bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              text-gray-900 dark:text-gray-100 placeholder-gray-400
              text-sm
            " type="text" placeholder="HH:MM:SS"/></label></div></div> <div class="space-y-2"><label class="block text-sm font-semibold text-gray-900 dark:text-gray-100">排除关键词 <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">每行一个，不区分大小写</span></label> <textarea class="
          w-full px-3 py-2 bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-700 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
          text-gray-900 dark:text-gray-100 placeholder-gray-400
          min-h-[100px] resize-y
        " placeholder="输入关键词..."></textarea> <div class="text-xs text-gray-500 dark:text-gray-400">不显示标题含这些关键词的视频。</div></div></div></section>`);
  function VideoListSettings2($$anchor, $$props) {
    push($$props, true);
    const $videoListSettings = () => store_get(videoListSettings_default, "$videoListSettings", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let durationGte = state(proxy(videoListSettings_default.durationGte.toTimeCode()));
    let durationLt = state(proxy(videoListSettings_default.durationLt.toTimeCode()));
    user_effect(() => {
      videoListSettings_default.durationGte = get(durationGte);
    });
    user_effect(() => {
      videoListSettings_default.durationLt = get(durationLt);
    });
    let excludedKeywordsBuffer = state(void 0);
    let excludedKeywords = user_derived(() => get(excludedKeywordsBuffer) ?? ($videoListSettings()?.excludeKeywords ?? []).join("\n"));
    function updateExcludedKeywords(v) {
      set(excludedKeywordsBuffer, v, true);
      videoListSettings_default.excludeKeywords = v.split("\n");
    }
    var section = root3();
    var div = sibling(child(section), 2);
    var div_1 = child(div);
    var label = child(div_1);
    var input = child(label);
    remove_input_defaults(input);
    input.__change = (e) => {
      videoListSettings_default.allowAdvertisement = e.currentTarget.checked;
    };
    next(2);
    reset(label);
    var label_1 = sibling(label, 2);
    var input_1 = child(label_1);
    remove_input_defaults(input_1);
    input_1.__change = (e) => {
      videoListSettings_default.allowPromoted = e.currentTarget.checked;
    };
    next(2);
    reset(label_1);
    reset(div_1);
    var div_2 = sibling(div_1, 2);
    var div_3 = sibling(child(div_2), 2);
    var label_2 = child(div_3);
    var input_2 = sibling(child(label_2), 2);
    remove_input_defaults(input_2);
    input_2.__keydown = (e) => e.stopPropagation();
    reset(label_2);
    var label_3 = sibling(label_2, 2);
    var input_3 = sibling(child(label_3), 2);
    remove_input_defaults(input_3);
    input_3.__keydown = (e) => e.stopPropagation();
    reset(label_3);
    reset(div_3);
    reset(div_2);
    var div_4 = sibling(div_2, 2);
    var textarea = sibling(child(div_4), 2);
    remove_textarea_child(textarea);
    textarea.__input = (e) => {
      const el = e.currentTarget;
      updateExcludedKeywords(el.value);
      growTextAreaHeight(el);
    };
    textarea.__keydown = (e) => e.stopPropagation();
    next(2);
    reset(div_4);
    reset(div);
    reset(section);
    template_effect(() => {
      set_checked(input, $videoListSettings()?.allowAdvertisement ?? false);
      set_checked(input_1, $videoListSettings()?.allowPromoted ?? false);
      set_value(textarea, get(excludedKeywords));
    });
    bind_value(input_2, () => get(durationGte), ($$value) => set(durationGte, $$value));
    bind_value(input_3, () => get(durationLt), ($$value) => set(durationLt, $$value));
    event("focus", textarea, (e) => growTextAreaHeight(e.currentTarget));
    event("blur", textarea, () => {
      set(excludedKeywordsBuffer, void 0);
    });
    append($$anchor, section);
    pop();
    $$cleanup();
  }
  delegate(["change", "keydown", "input"]);

  // src/bilibili.com/models/blockedUserPatterns.ts
  var blockedUserPatterns_default = new class {
    constructor() {
      this.value = new GMValue(
        "blockedUserPatterns@206ceed9-b514-4902-ad70-aa621fed5cd4",
        () => []
      );
      this.get = () => {
        return this.value.get();
      };
      this.subscribe = (run3) => {
        return this.value.subscribe(run3);
      };
      this.set = (patterns) => {
        this.value.set(
          patterns.map((pattern) => {
            let finalPattern = pattern;
            try {
              new RegExp(pattern);
            } catch {
              finalPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            }
            return {
              pattern: finalPattern,
              blockedAt: Date.now()
            };
          })
        );
      };
      this.shouldBlock = (name) => {
        return this.value.get().some((p) => {
          try {
            return new RegExp(p.pattern).test(name);
          } catch {
            return false;
          }
        });
      };
    }
  }();

  // src/bilibili.com/components/SettingsDrawer/BlockedUserPatternSettings.svelte
  var root4 = from_html(`<section><h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">屏蔽名称匹配的用户</h2> <div class="space-y-2"><div class="relative"><textarea class="
          w-full px-3 py-2 bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-700 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
          text-gray-900 dark:text-gray-100 placeholder-gray-400
          min-h-[100px] resize-y
        " placeholder="输入匹配规则..."></textarea></div> <div class="text-xs text-gray-500 dark:text-gray-400">每行一个，支持正则表达式。</div></div></section>`);
  function BlockedUserPatternSettings($$anchor, $$props) {
    push($$props, true);
    const $blockedUserPatterns = () => store_get(blockedUserPatterns_default, "$blockedUserPatterns", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let blockedUserPatternsBuffer = state(void 0);
    let patternsList = user_derived(() => $blockedUserPatterns() ?? []);
    let patternsText = user_derived(() => get(blockedUserPatternsBuffer) ?? get(patternsList).map((i) => i.pattern).join("\n"));
    function updatePatterns(v) {
      set(blockedUserPatternsBuffer, v, true);
      blockedUserPatterns_default.set(v.split("\n").map((i) => i.trim()).filter((i) => i));
    }
    var section = root4();
    var div = sibling(child(section), 2);
    var div_1 = child(div);
    var textarea = child(div_1);
    remove_textarea_child(textarea);
    textarea.__input = (e) => {
      const el = e.currentTarget;
      updatePatterns(el.value);
      growTextAreaHeight(el);
    };
    textarea.__keydown = (e) => e.stopPropagation();
    reset(div_1);
    next(2);
    reset(div);
    reset(section);
    template_effect(() => set_value(textarea, get(patternsText)));
    event("focus", textarea, (e) => growTextAreaHeight(e.currentTarget));
    event("blur", textarea, () => {
      set(blockedUserPatternsBuffer, void 0);
    });
    append($$anchor, section);
    pop();
    $$cleanup();
  }
  delegate(["input", "keydown"]);

  // src/bilibili.com/models/blockedUsers.ts
  var blockedUsers_default = new class {
    constructor() {
      this.value = new GMValue("blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4", () => ({}));
      this.has = (id) => {
        return id in this.value.get();
      };
      this.subscribe = (run3) => {
        return this.value.subscribe(run3);
      };
      this.get = (id) => {
        const value = this.value.get()[id];
        if (!value) {
          return;
        }
        const {
          blockedAt: rawBlockedAt = 0,
          name = id,
          note = ""
        } = typeof value === "boolean" ? {} : value ?? {};
        const blockedAt = new Date(rawBlockedAt);
        return {
          id,
          blockedAt,
          name,
          idAsNumber: Number.parseInt(id, 10),
          rawBlockedAt,
          note
        };
      };
      this.distinctID = () => {
        return Object.keys(this.value.get());
      };
      this.add = ({
        id,
        name,
        note
      }) => {
        if (this.has(id)) {
          return;
        }
        this.value.set({
          ...this.value.get(),
          [id]: {
            name: name.trim(),
            blockedAt: Date.now(),
            note: note || void 0
          }
        });
      };
      this.update = (id, update2) => {
        const existing = this.get(id);
        if (existing) {
          this.value.set({
            ...this.value.get(),
            [id]: {
              name: update2.name || existing.name,
              blockedAt: update2.blockedAt || existing.blockedAt.getTime(),
              note: (update2.note ?? existing.note) || void 0
            }
          });
        }
      };
      this.remove = (id) => {
        if (!this.has(id)) {
          return;
        }
        this.value.set(
          Object.fromEntries(
            Object.entries(this.value.get()).filter(([k]) => k !== id)
          )
        );
      };
      this.toggle = (user, force) => {
        const want = force ?? !this.has(user.id);
        if (want) {
          this.add(user);
        } else {
          this.remove(user.id);
        }
      };
    }
  }();

  // src/utils/compare.ts
  function compare(a, b) {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  }

  // src/utils/isNonNull.ts
  function isNonNull(v) {
    return v != null;
  }

  // node_modules/.pnpm/svelte@5.49.1/node_modules/svelte/src/transition/index.js
  var linear2 = (x) => x;
  function cubic_out(t) {
    const f = t - 1;
    return f * f * f + 1;
  }
  function split_css_unit(value) {
    const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
    return split ? [parseFloat(split[1]), split[2] || "px"] : [
      /** @type {number} */
      value,
      "px"
    ];
  }
  function fade(node, { delay = 0, duration = 400, easing = linear2 } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
      delay,
      duration,
      easing,
      css: (t) => `opacity: ${t * o}`
    };
  }
  function fly(node, { delay = 0, duration = 400, easing = cubic_out, x = 0, y = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === "none" ? "" : style.transform;
    const od = target_opacity * (1 - opacity);
    const [x_value, x_unit] = split_css_unit(x);
    const [y_value, y_unit] = split_css_unit(y);
    return {
      delay,
      duration,
      easing,
      css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x_value}${x_unit}, ${(1 - t) * y_value}${y_unit});
			opacity: ${target_opacity - od * u}`
    };
  }

  // src/bilibili.com/components/SettingsDrawer/PromptDialog.svelte
  var root_22 = from_html(`<label for="dialog-input" class="block text-sm font-medium mb-1"> </label>`);
  var root_1 = from_html(`<div class="
      fixed inset-0
      bg-black/25 dark:bg-white/25 backdrop-blur-sm
      flex items-center justify-center p-4
    " role="dialog" aria-modal="true"><div class="
        bg-white text-black dark:bg-black dark:text-white rounded-lg shadow-xl w-full max-w-lg
      " role="document"><form><div class="border-b px-4 py-3 flex justify-between items-center"><h3 class="text-lg font-medium"> </h3> <button type="button" class="p-1 rounded-full hover:bg-gray-100 dark:hover:gray-900 transition-colors" title="关闭" aria-label="关闭"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"></path></svg></button></div> <div class="p-4"><!> <input id="dialog-input" class="
              w-full p-2 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-500 rounded-md
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              focus:outline-none shadow-sm
            " type="text"/></div> <div class="border-t px-4 py-3 flex justify-end gap-2"><button type="button" class="
              px-4 py-2 rounded-md text-sm font-medium
              bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors
            ">取消</button> <button type="submit" class="
              px-4 py-2 rounded-md text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 transition-colors
            "> </button></div></form></div></div>`);
  function PromptDialog($$anchor, $$props) {
    push($$props, true);
    let title = prop($$props, "title", 3, "编辑"), label = prop($$props, "label", 3, ""), value = prop($$props, "value", 15, ""), placeholder = prop($$props, "placeholder", 3, ""), actionText = prop($$props, "actionText", 3, "保存");
    let visible = state(false);
    let pendingResult = null;
    let dialogEl = state(void 0);
    let inputEl = state(void 0);
    onMount(() => {
      set(visible, true);
    });
    user_effect(() => {
      if (get(inputEl)) {
        get(inputEl).select();
        get(inputEl).scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
    function close(v) {
      pendingResult = v;
      set(visible, false);
    }
    function handleOutroEnd() {
      $$props.onClose(pendingResult);
    }
    var fragment = comment();
    var node = first_child(fragment);
    {
      var consequent_1 = ($$anchor2) => {
        var div = root_1();
        div.__click = (e) => {
          if (e.target === e.currentTarget) close(null);
        };
        var div_1 = child(div);
        div_1.__click = (e) => e.stopPropagation();
        var form = child(div_1);
        var div_2 = child(form);
        var h3 = child(div_2);
        var text2 = child(h3, true);
        reset(h3);
        var button = sibling(h3, 2);
        button.__click = () => close(null);
        var svg = child(button);
        var path = child(svg);
        reset(svg);
        reset(button);
        reset(div_2);
        var div_3 = sibling(div_2, 2);
        var node_1 = child(div_3);
        {
          var consequent = ($$anchor3) => {
            var label_1 = root_22();
            var text_1 = child(label_1, true);
            reset(label_1);
            template_effect(() => set_text(text_1, label()));
            append($$anchor3, label_1);
          };
          if_block(node_1, ($$render) => {
            if (label()) $$render(consequent);
          });
        }
        var input = sibling(node_1, 2);
        remove_input_defaults(input);
        bind_this(input, ($$value) => set(inputEl, $$value), () => get(inputEl));
        reset(div_3);
        var div_4 = sibling(div_3, 2);
        var button_1 = child(div_4);
        button_1.__click = () => close(null);
        var button_2 = sibling(button_1, 2);
        var text_2 = child(button_2, true);
        reset(button_2);
        reset(div_4);
        reset(form);
        reset(div_1);
        bind_this(div_1, ($$value) => set(dialogEl, $$value), () => get(dialogEl));
        reset(div);
        template_effect(
          ($0, $1) => {
            set_attribute2(div, "data-theme", $0);
            set_attribute2(div_1, "data-theme", $1);
            set_text(text2, title());
            set_attribute2(path, "d", mdiClose);
            set_attribute2(input, "placeholder", placeholder());
            set_text(text_2, actionText());
          },
          [getCurrentTheme, getCurrentTheme]
        );
        event("outroend", div, handleOutroEnd);
        event("submit", form, (e) => {
          e.preventDefault();
          close(value());
        });
        bind_value(input, value);
        transition(3, div_1, () => fly, () => ({ y: 24, duration: 300 }));
        transition(3, div, () => fade, () => ({ duration: 300 }));
        append($$anchor2, div);
      };
      if_block(node, ($$render) => {
        if (get(visible)) $$render(consequent_1);
      });
    }
    append($$anchor, fragment);
    pop();
  }
  delegate(["click"]);

  // src/bilibili.com/components/SettingsDrawer/BlockedUsersSettings.svelte
  var root_23 = from_html(`<time> </time>`);
  var root_12 = from_html(`<div class="absolute left-0 right-0 h-12 flex items-center bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0 group"><div class="w-48 flex-none text-right px-4 text-xs text-gray-500 dark:text-gray-400 font-mono"><!></div> <div class="flex-auto text-center cursor-pointer px-4 truncate font-medium text-gray-900 dark:text-gray-100" role="button"><span class="hover:underline"> </span> <div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5"> </div></div> <div class="w-64 flex-none flex justify-center items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity"><a target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"></path></svg> <span>个人空间</span></a> <button type="button" class="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"></path></svg> <span>取消屏蔽</span></button></div></div>`);
  var root5 = from_html(`<div class="space-y-4"><h2 class="flex-none text-lg font-bold text-gray-900 dark:text-gray-100">已屏蔽用户 <span class="text-sm font-normal text-gray-500 dark:text-gray-400"> </span></h2> <div class="flex flex-col overflow-hidden max-h-[600px] border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm"><div class="flex-none flex items-center bg-gray-50 dark:bg-gray-950/50 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 h-10 pr-2 border-b border-gray-200 dark:border-gray-800"><div class="w-48 flex-none">屏蔽时间</div> <div class="flex-auto">名称</div> <div class="w-64 flex-none">操作</div></div> <div class="flex-1 overflow-auto relative custom-scrollbar"><div></div></div></div></div> <!>`, 1);
  function BlockedUsersSettings($$anchor, $$props) {
    push($$props, true);
    const $blockedUsers = () => store_get(blockedUsers_default, "$blockedUsers", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let items = user_derived(() => {
      void $blockedUsers();
      return blockedUsers_default.distinctID().map(blockedUsers_default.get).filter(isNonNull).sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.idAsNumber, b.idAsNumber);
      });
    });
    let scrollTop = state(0);
    const rowHeight = 48;
    const gap = 8;
    const itemTotalHeight = rowHeight + gap;
    const containerHeight = 600;
    let totalHeight = user_derived(() => get(items).length * itemTotalHeight - (get(items).length > 0 ? gap : 0));
    let startIndex = user_derived(() => Math.max(0, Math.floor(get(scrollTop) / itemTotalHeight)));
    let endIndex = user_derived(() => Math.min(get(items).length, Math.ceil((get(scrollTop) + containerHeight) / itemTotalHeight) + 1));
    let visibleItems = user_derived(() => get(items).slice(get(startIndex), get(endIndex)).map((item, index2) => ({ ...item, top: (get(startIndex) + index2) * itemTotalHeight })));
    function handleScroll(e) {
      set(scrollTop, e.target.scrollTop, true);
    }
    let editingItem = state(null);
    var fragment = root5();
    var div = first_child(fragment);
    var h2 = child(div);
    var span = sibling(child(h2));
    var text2 = child(span);
    reset(span);
    reset(h2);
    var div_1 = sibling(h2, 2);
    var div_2 = sibling(child(div_1), 2);
    var div_3 = child(div_2);
    each(div_3, 21, () => get(visibleItems), (item) => item.id, ($$anchor2, item) => {
      var div_4 = root_12();
      var div_5 = child(div_4);
      var node = child(div_5);
      {
        var consequent = ($$anchor3) => {
          var time = root_23();
          var text_1 = child(time, true);
          reset(time);
          template_effect(
            ($0, $1) => {
              set_attribute2(time, "datetime", $0);
              set_text(text_1, $1);
            },
            [
              () => get(item).blockedAt.toISOString(),
              () => get(item).blockedAt.toLocaleString()
            ]
          );
          append($$anchor3, time);
        };
        if_block(node, ($$render) => {
          if (get(item).rawBlockedAt) $$render(consequent);
        });
      }
      reset(div_5);
      var div_6 = sibling(div_5, 2);
      div_6.__click = () => {
        set(editingItem, get(item), true);
      };
      var span_1 = child(div_6);
      var text_2 = child(span_1, true);
      reset(span_1);
      var div_7 = sibling(span_1, 2);
      var text_3 = child(div_7, true);
      reset(div_7);
      reset(div_6);
      var div_8 = sibling(div_6, 2);
      var a_1 = child(div_8);
      var svg = child(a_1);
      var path = child(svg);
      reset(svg);
      next(2);
      reset(a_1);
      var button = sibling(a_1, 2);
      button.__click = () => {
        blockedUsers_default.remove(get(item).id);
      };
      var svg_1 = child(button);
      var path_1 = child(svg_1);
      reset(svg_1);
      next(2);
      reset(button);
      reset(div_8);
      reset(div_4);
      template_effect(() => {
        set_style(div_4, `top: ${get(item).top ?? ""}px;`);
        set_text(text_2, get(item).name);
        set_attribute2(div_7, "title", get(item).note);
        set_text(text_3, get(item).note);
        set_attribute2(a_1, "href", `https://space.bilibili.com/${get(item).id ?? ""}`);
        set_attribute2(path, "d", mdiOpenInNew);
        set_attribute2(path_1, "d", mdiAccountCheckOutline);
      });
      append($$anchor2, div_4);
    });
    reset(div_3);
    reset(div_2);
    reset(div_1);
    reset(div);
    var node_1 = sibling(div, 2);
    {
      var consequent_1 = ($$anchor2) => {
        {
          let $0 = user_derived(() => `为 ${get(editingItem).name} 添加备注:`);
          PromptDialog($$anchor2, {
            title: "编辑备注",
            get label() {
              return get($0);
            },
            get value() {
              return get(editingItem).note;
            },
            placeholder: "输入备注...",
            actionText: "保存备注",
            onClose: (v) => {
              if (get(editingItem) && v != null) {
                blockedUsers_default.update(get(editingItem).id, { note: v });
              }
              set(editingItem, null);
            }
          });
        }
      };
      if_block(node_1, ($$render) => {
        if (get(editingItem)) $$render(consequent_1);
      });
    }
    template_effect(() => {
      set_text(text2, `(${get(items).length ?? ""})`);
      set_style(div_3, `height: ${get(totalHeight) ?? ""}px; width: 100%;`);
    });
    event("scroll", div_2, handleScroll);
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  delegate(["click"]);

  // src/bilibili.com/models/blockedLiveRooms.ts
  var blockedLiveRooms_default = new class {
    constructor() {
      this.value = new GMValue(
        "blockedLiveRooms@031f022e-51b9-4361-8cfb-80263a0d7595",
        () => ({})
      );
      this.has = (id) => {
        return !!this.value.get()[id];
      };
      this.subscribe = (run3) => {
        return this.value.subscribe(run3);
      };
      this.get = (id) => {
        const value = this.value.get()[id];
        return {
          id,
          blockedAt: new Date(value.blockedAt),
          owner: value.owner
        };
      };
      this.distinctID = () => {
        return Object.keys(this.value.get());
      };
      this.add = ({ id, owner }) => {
        if (this.has(id)) {
          return;
        }
        this.value.set({
          ...this.value.get(),
          [id]: {
            owner: owner.trim(),
            blockedAt: Date.now()
          }
        });
      };
      this.remove = (id) => {
        if (!this.has(id)) {
          return;
        }
        this.value.set(
          Object.fromEntries(
            Object.entries(this.value.get()).filter(([k]) => k !== id)
          )
        );
      };
      this.toggle = (room, force) => {
        const want = force ?? !this.has(room.id);
        if (want) {
          this.add(room);
        } else {
          this.remove(room.id);
        }
      };
    }
  }();

  // src/bilibili.com/components/SettingsDrawer/BlockedLiveRoomsSettings.svelte
  var root_13 = from_html(`<div class="absolute left-0 right-0 h-12 flex items-center bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0 group"><div class="w-48 flex-none text-right px-4 text-xs text-gray-500 dark:text-gray-400 font-mono"><time> </time></div> <div class="flex-auto text-center truncate px-4 font-medium text-gray-900 dark:text-gray-100"> </div> <div class="w-48 flex-none flex justify-center items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity"><a target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"></path></svg> <span>前往</span></a> <button type="button" class="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"></path></svg> <span>取消屏蔽</span></button></div></div>`);
  var root6 = from_html(`<div class="space-y-4"><h2 class="flex-none text-lg font-bold text-gray-900 dark:text-gray-100">已屏蔽直播间 <span class="text-sm font-normal text-gray-500 dark:text-gray-400"> </span></h2> <div class="flex flex-col overflow-hidden max-h-[600px] border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm"><div class="flex-none flex items-center bg-gray-50 dark:bg-gray-950/50 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 h-10 pr-2 border-b border-gray-200 dark:border-gray-800"><div class="w-48 flex-none">屏蔽时间</div> <div class="flex-auto">所有者</div> <div class="w-48 flex-none">操作</div></div> <div class="flex-1 overflow-auto relative custom-scrollbar"><div></div></div></div></div>`);
  function BlockedLiveRoomsSettings($$anchor, $$props) {
    push($$props, true);
    const $blockedLiveRooms = () => store_get(blockedLiveRooms_default, "$blockedLiveRooms", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let items = user_derived(() => {
      void $blockedLiveRooms();
      return blockedLiveRooms_default.distinctID().map(blockedLiveRooms_default.get).sort((a, b) => {
        const dateCompare = compare(a.blockedAt, b.blockedAt);
        if (dateCompare !== 0) {
          return -dateCompare;
        }
        return compare(a.id, b.id);
      });
    });
    let scrollTop = state(0);
    const rowHeight = 48;
    const gap = 8;
    const itemTotalHeight = rowHeight + gap;
    const containerHeight = 600;
    let totalHeight = user_derived(() => get(items).length * itemTotalHeight - (get(items).length > 0 ? gap : 0));
    let startIndex = user_derived(() => Math.max(0, Math.floor(get(scrollTop) / itemTotalHeight)));
    let endIndex = user_derived(() => Math.min(get(items).length, Math.ceil((get(scrollTop) + containerHeight) / itemTotalHeight) + 1));
    let visibleItems = user_derived(() => get(items).slice(get(startIndex), get(endIndex)).map((item, index2) => ({ ...item, top: (get(startIndex) + index2) * itemTotalHeight })));
    function handleScroll(e) {
      set(scrollTop, e.target.scrollTop, true);
    }
    var div = root6();
    var h2 = child(div);
    var span = sibling(child(h2));
    var text2 = child(span);
    reset(span);
    reset(h2);
    var div_1 = sibling(h2, 2);
    var div_2 = sibling(child(div_1), 2);
    var div_3 = child(div_2);
    each(div_3, 21, () => get(visibleItems), (item) => item.id, ($$anchor2, item) => {
      var div_4 = root_13();
      var div_5 = child(div_4);
      var time = child(div_5);
      var text_1 = child(time, true);
      reset(time);
      reset(div_5);
      var div_6 = sibling(div_5, 2);
      var text_2 = child(div_6, true);
      reset(div_6);
      var div_7 = sibling(div_6, 2);
      var a_1 = child(div_7);
      var svg = child(a_1);
      var path = child(svg);
      reset(svg);
      next(2);
      reset(a_1);
      var button = sibling(a_1, 2);
      button.__click = () => {
        blockedLiveRooms_default.remove(get(item).id);
      };
      var svg_1 = child(button);
      var path_1 = child(svg_1);
      reset(svg_1);
      next(2);
      reset(button);
      reset(div_7);
      reset(div_4);
      template_effect(
        ($0, $1) => {
          set_style(div_4, `top: ${get(item).top ?? ""}px;`);
          set_attribute2(time, "datetime", $0);
          set_text(text_1, $1);
          set_text(text_2, get(item).owner);
          set_attribute2(a_1, "href", `https://live.bilibili.com/${get(item).id ?? ""}`);
          set_attribute2(path, "d", mdiOpenInNew);
          set_attribute2(path_1, "d", mdiCheck);
        },
        [
          () => get(item).blockedAt.toISOString(),
          () => get(item).blockedAt.toLocaleString()
        ]
      );
      append($$anchor2, div_4);
    });
    reset(div_3);
    reset(div_2);
    reset(div_1);
    reset(div);
    template_effect(() => {
      set_text(text2, `(${get(items).length ?? ""})`);
      set_style(div_3, `height: ${get(totalHeight) ?? ""}px; width: 100%;`);
    });
    event("scroll", div_2, handleScroll);
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["click"]);

  // src/bilibili.com/components/SettingsDrawer/SettingsDrawer.svelte
  var root_14 = from_html(
    `<div class="
      fixed inset-0
      bg-black/40 backdrop-blur-sm
      cursor-zoom-out
      z-50
    " role="button" tabindex="-1"></div> <div class="
      fixed inset-y-0 right-0 w-full max-w-screen-2xl
      bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100
      shadow-2xl z-50 flex flex-col
    "><header class="
        flex-none flex items-center justify-between
        px-6 py-4
        border-b border-gray-200 dark:border-gray-800
      "><h2 class="text-xl font-bold">设置</h2> <button type="button" class="
          p-2 rounded-full
          hover:bg-gray-100 dark:hover:bg-gray-800
          text-gray-500 dark:text-gray-400
          transition-colors
        " title="关闭"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"></path></svg></button></header> <div class="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar"><div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start"><div class="space-y-6 lg:space-y-8"><div class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800"><!></div> <div class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800"><!></div></div> <div class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 h-full"><!></div> <div class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 h-full"><!></div></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8"><div class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 min-w-0"><!></div> <div class="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 min-w-0"><!></div></div> <div class="h-8"></div></div></div>`,
    1
  );
  function SettingsDrawer($$anchor, $$props) {
    push($$props, true);
    let isOpen = state(false);
    function open() {
      set(isOpen, true);
    }
    function close() {
      set(isOpen, false);
    }
    var $$exports = { open, close };
    var fragment = comment();
    var node = first_child(fragment);
    {
      var consequent = ($$anchor2) => {
        var fragment_1 = root_14();
        var div = first_child(fragment_1);
        div.__click = close;
        var div_1 = sibling(div, 2);
        var header = child(div_1);
        var button = sibling(child(header), 2);
        button.__click = close;
        var svg = child(button);
        var path = child(svg);
        reset(svg);
        reset(button);
        reset(header);
        var div_2 = sibling(header, 2);
        var div_3 = child(div_2);
        var div_4 = child(div_3);
        var div_5 = child(div_4);
        var node_1 = child(div_5);
        HomePageSettings2(node_1, {});
        reset(div_5);
        var div_6 = sibling(div_5, 2);
        var node_2 = child(div_6);
        SearchSettings(node_2, {});
        reset(div_6);
        reset(div_4);
        var div_7 = sibling(div_4, 2);
        var node_3 = child(div_7);
        VideoListSettings2(node_3, {});
        reset(div_7);
        var div_8 = sibling(div_7, 2);
        var node_4 = child(div_8);
        BlockedUserPatternSettings(node_4, {});
        reset(div_8);
        reset(div_3);
        var div_9 = sibling(div_3, 2);
        var div_10 = child(div_9);
        var node_5 = child(div_10);
        BlockedUsersSettings(node_5, {});
        reset(div_10);
        var div_11 = sibling(div_10, 2);
        var node_6 = child(div_11);
        BlockedLiveRoomsSettings(node_6, {});
        reset(div_11);
        reset(div_9);
        next(2);
        reset(div_2);
        reset(div_1);
        template_effect(
          ($0, $1) => {
            set_attribute2(div, "data-theme", $0);
            set_attribute2(div_1, "data-theme", $1);
            set_attribute2(path, "d", mdiClose);
          },
          [getCurrentTheme, getCurrentTheme]
        );
        transition(3, div, () => fade, () => ({ duration: 200 }));
        transition(3, div_1, () => fly, () => ({ x: "100%", duration: 300, opacity: 1 }));
        append($$anchor2, fragment_1);
      };
      if_block(node, ($$render) => {
        if (get(isOpen)) $$render(consequent);
      });
    }
    append($$anchor, fragment);
    return pop($$exports);
  }
  delegate(["click"]);

  // src/utils/obtainHTMLElementByDataKey.ts
  function obtainHTMLElementByDataKey({
    tag: tag2,
    key: key3,
    parentNode = document,
    onDidCreate
  }) {
    const match = parentNode.querySelector(
      `[data-${key3}]`
    );
    if (match) {
      return match;
    }
    const el = document.createElement(tag2);
    el.setAttribute(`data-${key3}`, "");
    onDidCreate?.(el);
    return el;
  }

  // src/bilibili.com/style.css
  var style_default = '/* \n用户脚本样式\nhttps://github.com/NateScarlet/user-scripts/blob/master/src/bilibili.com/\n*/\n\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}\n\n/* \n! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com\n*/\n\n/*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: \'\';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user\'s configured `sans` font-family by default.\n5. Use the user\'s configured `sans` font-feature-settings by default.\n6. Use the user\'s configured `sans` font-variation-settings by default.\n7. Disable tap highlights on iOS\n*/\n\nhtml,\n:host {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4; /* 3 */\n  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* 4 */\n  font-feature-settings: normal; /* 5 */\n  font-variation-settings: normal; /* 6 */\n  -webkit-tap-highlight-color: transparent; /* 7 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user\'s configured `mono` font-family by default.\n2. Use the user\'s configured `mono` font-feature-settings by default.\n3. Use the user\'s configured `mono` font-variation-settings by default.\n4. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */\n  font-feature-settings: normal; /* 2 */\n  font-variation-settings: normal; /* 3 */\n  font-size: 1em; /* 4 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-feature-settings: inherit; /* 1 */\n  font-variation-settings: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  font-weight: inherit; /* 1 */\n  line-height: inherit; /* 1 */\n  letter-spacing: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\ninput:where([type=\'button\']),\ninput:where([type=\'reset\']),\ninput:where([type=\'submit\']) {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type=\'search\'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nReset default styling for dialogs.\n*/\n\ndialog {\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user\'s configured gray 400 color.\n*/\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role="button"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don\'t get the pointer cursor.\n*/\n\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n/* Make elements with the HTML hidden attribute stay hidden by default */\n\n[hidden]:where(:not([hidden="until-found"])) {\n  display: none;\n}\n\n* {\n  font-size: 16px;\n  line-height: 24px;\n}\n\n.pointer-events-auto {\n  pointer-events: auto;\n}\n\n.visible {\n  visibility: visible;\n}\n\n.static {\n  position: static;\n}\n\n.fixed {\n  position: fixed;\n}\n\n.absolute {\n  position: absolute;\n}\n\n.relative {\n  position: relative;\n}\n\n.inset-0 {\n  inset: 0px;\n}\n\n.inset-y-0 {\n  top: 0px;\n  bottom: 0px;\n}\n\n.left-0 {\n  left: 0px;\n}\n\n.left-2 {\n  left: 0.5rem;\n}\n\n.right-0 {\n  right: 0px;\n}\n\n.top-2 {\n  top: 0.5rem;\n}\n\n.isolate {\n  isolation: isolate;\n}\n\n.z-20 {\n  z-index: 20;\n}\n\n.z-50 {\n  z-index: 50;\n}\n\n.m-1 {\n  margin: 0.25rem;\n}\n\n.-mx-2 {\n  margin-left: -0.5rem;\n  margin-right: -0.5rem;\n}\n\n.mx-1 {\n  margin-left: 0.25rem;\n  margin-right: 0.25rem;\n}\n\n.mb-1 {\n  margin-bottom: 0.25rem;\n}\n\n.mb-2 {\n  margin-bottom: 0.5rem;\n}\n\n.mb-3 {\n  margin-bottom: 0.75rem;\n}\n\n.mb-4 {\n  margin-bottom: 1rem;\n}\n\n.ml-1 {\n  margin-left: 0.25rem;\n}\n\n.ml-2 {\n  margin-left: 0.5rem;\n}\n\n.mr-1 {\n  margin-right: 0.25rem;\n}\n\n.mt-0\\.5 {\n  margin-top: 0.125rem;\n}\n\n.mt-1 {\n  margin-top: 0.25rem;\n}\n\n.mt-6 {\n  margin-top: 1.5rem;\n}\n\n.block {\n  display: block;\n}\n\n.inline {\n  display: inline;\n}\n\n.flex {\n  display: flex;\n}\n\n.inline-flex {\n  display: inline-flex;\n}\n\n.grid {\n  display: grid;\n}\n\n.\\!hidden {\n  display: none !important;\n}\n\n.hidden {\n  display: none;\n}\n\n.h-10 {\n  height: 2.5rem;\n}\n\n.h-12 {\n  height: 3rem;\n}\n\n.h-4 {\n  height: 1rem;\n}\n\n.h-6 {\n  height: 1.5rem;\n}\n\n.h-7 {\n  height: 1.75rem;\n}\n\n.h-8 {\n  height: 2rem;\n}\n\n.h-full {\n  height: 100%;\n}\n\n.max-h-\\[600px\\] {\n  max-height: 600px;\n}\n\n.min-h-\\[100px\\] {\n  min-height: 100px;\n}\n\n.w-4 {\n  width: 1rem;\n}\n\n.w-48 {\n  width: 12rem;\n}\n\n.w-6 {\n  width: 1.5rem;\n}\n\n.w-64 {\n  width: 16rem;\n}\n\n.w-full {\n  width: 100%;\n}\n\n.min-w-0 {\n  min-width: 0px;\n}\n\n.max-w-lg {\n  max-width: 32rem;\n}\n\n.max-w-screen-2xl {\n  max-width: 1536px;\n}\n\n.flex-1 {\n  flex: 1 1 0%;\n}\n\n.flex-auto {\n  flex: 1 1 auto;\n}\n\n.flex-none {\n  flex: none;\n}\n\n.cursor-pointer {\n  cursor: pointer;\n}\n\n.cursor-zoom-out {\n  cursor: zoom-out;\n}\n\n.select-none {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n\n.resize-y {\n  resize: vertical;\n}\n\n.grid-cols-1 {\n  grid-template-columns: repeat(1, minmax(0, 1fr));\n}\n\n.grid-cols-2 {\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n}\n\n.flex-col {\n  flex-direction: column;\n}\n\n.flex-wrap {\n  flex-wrap: wrap;\n}\n\n.items-start {\n  align-items: flex-start;\n}\n\n.items-center {\n  align-items: center;\n}\n\n.justify-end {\n  justify-content: flex-end;\n}\n\n.justify-center {\n  justify-content: center;\n}\n\n.justify-between {\n  justify-content: space-between;\n}\n\n.gap-2 {\n  gap: 0.5rem;\n}\n\n.gap-3 {\n  gap: 0.75rem;\n}\n\n.gap-6 {\n  gap: 1.5rem;\n}\n\n.space-x-4 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(1rem * var(--tw-space-x-reverse));\n  margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));\n}\n\n.space-y-2 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));\n}\n\n.space-y-3 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));\n}\n\n.space-y-4 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(1rem * var(--tw-space-y-reverse));\n}\n\n.space-y-6 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-y-auto {\n  overflow-y: auto;\n}\n\n.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.rounded {\n  border-radius: 0.25rem;\n}\n\n.rounded-2xl {\n  border-radius: 1rem;\n}\n\n.rounded-full {\n  border-radius: 9999px;\n}\n\n.rounded-lg {\n  border-radius: 0.5rem;\n}\n\n.rounded-md {\n  border-radius: 0.375rem;\n}\n\n.rounded-xl {\n  border-radius: 0.75rem;\n}\n\n.border {\n  border-width: 1px;\n}\n\n.border-b {\n  border-bottom-width: 1px;\n}\n\n.border-t {\n  border-top-width: 1px;\n}\n\n.border-none {\n  border-style: none;\n}\n\n.border-gray-100 {\n  --tw-border-opacity: 1;\n  border-color: rgb(243 244 246 / var(--tw-border-opacity, 1));\n}\n\n.border-gray-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(229 231 235 / var(--tw-border-opacity, 1));\n}\n\n.border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity, 1));\n}\n\n.bg-\\[rgba\\(33\\2c 33\\2c 33\\2c \\.8\\)\\] {\n  background-color: rgba(33,33,33,.8);\n}\n\n.bg-black\\/25 {\n  background-color: rgb(0 0 0 / 0.25);\n}\n\n.bg-black\\/40 {\n  background-color: rgb(0 0 0 / 0.4);\n}\n\n.bg-blue-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(37 99 235 / var(--tw-bg-opacity, 1));\n}\n\n.bg-gray-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));\n}\n\n.bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity, 1));\n}\n\n.bg-gray-50 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(249 250 251 / var(--tw-bg-opacity, 1));\n}\n\n.bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));\n}\n\n.fill-current {\n  fill: currentColor;\n}\n\n.p-0\\.5 {\n  padding: 0.125rem;\n}\n\n.p-1 {\n  padding: 0.25rem;\n}\n\n.p-2 {\n  padding: 0.5rem;\n}\n\n.p-3 {\n  padding: 0.75rem;\n}\n\n.p-4 {\n  padding: 1rem;\n}\n\n.p-5 {\n  padding: 1.25rem;\n}\n\n.px-1\\.5 {\n  padding-left: 0.375rem;\n  padding-right: 0.375rem;\n}\n\n.px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n\n.px-3 {\n  padding-left: 0.75rem;\n  padding-right: 0.75rem;\n}\n\n.px-4 {\n  padding-left: 1rem;\n  padding-right: 1rem;\n}\n\n.px-6 {\n  padding-left: 1.5rem;\n  padding-right: 1.5rem;\n}\n\n.py-0\\.5 {\n  padding-top: 0.125rem;\n  padding-bottom: 0.125rem;\n}\n\n.py-1 {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n}\n\n.py-2 {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n\n.py-3 {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n}\n\n.py-4 {\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n\n.pl-2 {\n  padding-left: 0.5rem;\n}\n\n.pr-1 {\n  padding-right: 0.25rem;\n}\n\n.pr-2 {\n  padding-right: 0.5rem;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.text-right {\n  text-align: right;\n}\n\n.font-mono {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;\n}\n\n.text-lg {\n  font-size: 20px;\n  line-height: 28px;\n}\n\n.text-sm {\n  font-size: 14px;\n  line-height: 20px;\n}\n\n.text-xl {\n  font-size: 24px;\n  line-height: 32px;\n}\n\n.text-xs {\n  font-size: 12px;\n  line-height: 14px;\n}\n\n.font-bold {\n  font-weight: 700;\n}\n\n.font-medium {\n  font-weight: 500;\n}\n\n.font-normal {\n  font-weight: 400;\n}\n\n.font-semibold {\n  font-weight: 600;\n}\n\n.italic {\n  font-style: italic;\n}\n\n.text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity, 1));\n}\n\n.text-blue-600 {\n  --tw-text-opacity: 1;\n  color: rgb(37 99 235 / var(--tw-text-opacity, 1));\n}\n\n.text-gray-400 {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity, 1));\n}\n\n.text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity, 1));\n}\n\n.text-gray-700 {\n  --tw-text-opacity: 1;\n  color: rgb(55 65 81 / var(--tw-text-opacity, 1));\n}\n\n.text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(17 24 39 / var(--tw-text-opacity, 1));\n}\n\n.text-red-600 {\n  --tw-text-opacity: 1;\n  color: rgb(220 38 38 / var(--tw-text-opacity, 1));\n}\n\n.text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n}\n\n.placeholder-gray-400::-moz-placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-placeholder-opacity, 1));\n}\n\n.placeholder-gray-400::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-placeholder-opacity, 1));\n}\n\n.opacity-0 {\n  opacity: 0;\n}\n\n.shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-sm {\n  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-xl {\n  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n\n.filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n\n.backdrop-blur-sm {\n  --tw-backdrop-blur: blur(4px);\n  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n}\n\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.transition-opacity {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.duration-200 {\n  transition-duration: 200ms;\n}\n\n.ease-in-out {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.last\\:border-0:last-child {\n  border-width: 0px;\n}\n\n.hover\\:bg-blue-700:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(29 78 216 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:bg-gray-100:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:bg-gray-200:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:bg-gray-50:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(249 250 251 / var(--tw-bg-opacity, 1));\n}\n\n.hover\\:text-blue-700:hover {\n  --tw-text-opacity: 1;\n  color: rgb(29 78 216 / var(--tw-text-opacity, 1));\n}\n\n.hover\\:text-red-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(239 68 68 / var(--tw-text-opacity, 1));\n}\n\n.hover\\:text-red-700:hover {\n  --tw-text-opacity: 1;\n  color: rgb(185 28 28 / var(--tw-text-opacity, 1));\n}\n\n.hover\\:underline:hover {\n  text-decoration-line: underline;\n}\n\n.focus\\:border-blue-500:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(59 130 246 / var(--tw-border-opacity, 1));\n}\n\n.focus\\:outline-none:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n\n.focus\\:ring-2:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.focus\\:ring-blue-500:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity, 1));\n}\n\n.group:hover .group-hover\\:text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity, 1));\n}\n\n.group:hover .group-hover\\:text-blue-600 {\n  --tw-text-opacity: 1;\n  color: rgb(37 99 235 / var(--tw-text-opacity, 1));\n}\n\n.group:hover .group-hover\\:opacity-100 {\n  opacity: 1;\n}\n\n@media (min-width: 1024px) {\n\n  .lg\\:mt-8 {\n    margin-top: 2rem;\n  }\n\n  .lg\\:grid-cols-2 {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-3 {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n\n  .lg\\:gap-8 {\n    gap: 2rem;\n  }\n\n  .lg\\:space-y-8 > :not([hidden]) ~ :not([hidden]) {\n    --tw-space-y-reverse: 0;\n    margin-top: calc(2rem * calc(1 - var(--tw-space-y-reverse)));\n    margin-bottom: calc(2rem * var(--tw-space-y-reverse));\n  }\n\n  .lg\\:p-6 {\n    padding: 1.5rem;\n  }\n}\n\n.dark\\:border-gray-500:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-border-opacity: 1;\n  border-color: rgb(107 114 128 / var(--tw-border-opacity, 1));\n}\n\n.dark\\:border-gray-600:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-border-opacity: 1;\n  border-color: rgb(75 85 99 / var(--tw-border-opacity, 1));\n}\n\n.dark\\:border-gray-700:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-border-opacity: 1;\n  border-color: rgb(55 65 81 / var(--tw-border-opacity, 1));\n}\n\n.dark\\:border-gray-800:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-border-opacity: 1;\n  border-color: rgb(31 41 55 / var(--tw-border-opacity, 1));\n}\n\n.dark\\:border-gray-800\\/50:where([data-theme="dark"], [data-theme="dark"] *) {\n  border-color: rgb(31 41 55 / 0.5);\n}\n\n.dark\\:bg-black:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));\n}\n\n.dark\\:bg-gray-700:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(55 65 81 / var(--tw-bg-opacity, 1));\n}\n\n.dark\\:bg-gray-800:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity, 1));\n}\n\n.dark\\:bg-gray-900:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(17 24 39 / var(--tw-bg-opacity, 1));\n}\n\n.dark\\:bg-gray-900\\/30:where([data-theme="dark"], [data-theme="dark"] *) {\n  background-color: rgb(17 24 39 / 0.3);\n}\n\n.dark\\:bg-gray-950:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(3 7 18 / var(--tw-bg-opacity, 1));\n}\n\n.dark\\:bg-gray-950\\/50:where([data-theme="dark"], [data-theme="dark"] *) {\n  background-color: rgb(3 7 18 / 0.5);\n}\n\n.dark\\:bg-white\\/25:where([data-theme="dark"], [data-theme="dark"] *) {\n  background-color: rgb(255 255 255 / 0.25);\n}\n\n.dark\\:text-blue-400:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(96 165 250 / var(--tw-text-opacity, 1));\n}\n\n.dark\\:text-gray-100:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(243 244 246 / var(--tw-text-opacity, 1));\n}\n\n.dark\\:text-gray-300:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(209 213 219 / var(--tw-text-opacity, 1));\n}\n\n.dark\\:text-gray-400:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity, 1));\n}\n\n.dark\\:text-red-400:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(248 113 113 / var(--tw-text-opacity, 1));\n}\n\n.dark\\:text-white:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n}\n\n.dark\\:hover\\:bg-gray-700:hover:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(55 65 81 / var(--tw-bg-opacity, 1));\n}\n\n.dark\\:hover\\:bg-gray-800:hover:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity, 1));\n}\n\n.dark\\:hover\\:bg-gray-800\\/50:hover:where([data-theme="dark"], [data-theme="dark"] *) {\n  background-color: rgb(31 41 55 / 0.5);\n}\n\n.dark\\:hover\\:text-blue-300:hover:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(147 197 253 / var(--tw-text-opacity, 1));\n}\n\n.dark\\:hover\\:text-red-300:hover:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(252 165 165 / var(--tw-text-opacity, 1));\n}\n\n.group:hover .dark\\:group-hover\\:text-blue-400:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(96 165 250 / var(--tw-text-opacity, 1));\n}\n\n.group:hover .dark\\:group-hover\\:text-white:where([data-theme="dark"], [data-theme="dark"] *) {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n}\n';

  // src/bilibili.com/utils/obtainStyledShadowRoot.ts
  var key2 = "36fff111-0148-4cc1-869b-06dfdfc36861";
  var map = /* @__PURE__ */ new WeakMap();
  function obtainStyledShadowRoot(el) {
    const root15 = map.get(el) ?? el.shadowRoot ?? el.attachShadow({ mode: "closed" });
    map.set(el, root15);
    obtainHTMLElementByDataKey({
      tag: "style",
      key: key2,
      parentNode: root15,
      onDidCreate: (el2) => {
        el2.innerHTML = style_default;
        root15.prepend(el2);
      }
    });
    return root15;
  }

  // src/utils/randomUUID.ts
  function fallback2() {
    const ts = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (ts + Math.random()) * 16 % 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  function randomUUID() {
    if (window.isSecureContext && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return fallback2();
  }

  // src/utils/obtainHTMLElementByID.ts
  function obtainHTMLElementByID({
    tag: tag2,
    id,
    onDidCreate
  }) {
    const match = document.getElementById(id);
    if (match) {
      return match;
    }
    const el = document.createElement(tag2);
    el.id = id;
    onDidCreate?.(el);
    return el;
  }

  // src/bilibili.com/components/SettingsDrawer/index.ts
  var _SettingsDrawer = class _SettingsDrawer {
    constructor() {
      this.open = () => {
        this.component?.open();
      };
      this.close = () => {
        this.component?.close();
      };
      this.render = () => {
        obtainHTMLElementByID({
          tag: "div",
          id: _SettingsDrawer.id,
          onDidCreate: (el) => {
            el.style.position = "fixed";
            el.style.zIndex = "9999";
            document.body.append(el);
            this.component = mount(SettingsDrawer, {
              target: obtainStyledShadowRoot(el)
            });
          }
        });
      };
    }
  };
  _SettingsDrawer.id = `settings-${randomUUID()}`;
  var SettingsDrawer2 = _SettingsDrawer;

  // src/bilibili.com/components/FullHeaderButton.svelte
  var root7 = from_html(`<button type="button" class="right-entry__outside"><svg viewBox="2 2 20 20" class="right-entry-icon" style="height: 20px; fill: currentColor;"><path fill-rule="evenodd" clip-rule="evenodd"></path></svg> <span class="right-entry-text">屏蔽</span></button>`);
  function FullHeaderButton($$anchor, $$props) {
    push($$props, true);
    var button = root7();
    button.__click = (e) => {
      e.preventDefault();
      e.stopPropagation();
      $$props.settings.open();
    };
    var svg = child(button);
    var path = child(svg);
    reset(svg);
    next(2);
    reset(button);
    template_effect(() => set_attribute2(path, "d", mdiEyeOffOutline));
    append($$anchor, button);
    pop();
  }
  delegate(["click"]);

  // src/bilibili.com/components/FullHeaderButton.ts
  var _FullHeaderButton = class _FullHeaderButton {
    constructor(settings) {
      this.render = () => {
        const parent = document.querySelector(".right-entry");
        if (!parent) {
          return;
        }
        void obtainHTMLElementByID({
          tag: "li",
          id: _FullHeaderButton.id,
          onDidCreate: (el) => {
            el.classList.add("right-entry-item");
            parent.prepend(...[parent.firstChild, el].filter(isNonNull));
            mount(FullHeaderButton, {
              target: el,
              props: {
                settings: this.settings
              }
            });
          }
        });
      };
      this.settings = settings;
    }
  };
  _FullHeaderButton.id = `full-header-button-${randomUUID()}`;
  var FullHeaderButton2 = _FullHeaderButton;

  // src/bilibili.com/models/migrate.ts
  async function migrateV1() {
    const key3 = "blockedUserIDs@7ced1613-89d7-4754-8989-2ad0d7cfa9db";
    const oldValue = await GM.getValue(key3);
    if (!oldValue) {
      return;
    }
    const newValue = {};
    JSON.parse(String(oldValue)).forEach((i) => {
      newValue[i] = true;
    });
    await GM.setValue(
      "blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4",
      JSON.stringify(newValue)
    );
    await GM.deleteValue(key3);
  }
  async function migrate() {
    await migrateV1();
  }

  // src/bilibili.com/utils/parseUserURL.ts
  function parseUserURL(rawURL) {
    if (!rawURL) {
      return;
    }
    const url = new URL(rawURL, window.location.href);
    switch (url.host) {
      case "space.bilibili.com": {
        const match = /^\/(\d+)\/?/.exec(url.pathname);
        if (!match) {
          return;
        }
        return { id: match[1] };
      }
      case "cm.bilibili.com": {
        const id = url.searchParams.get("space_mid");
        if (id) {
          return { id };
        }
        break;
      }
      default:
    }
  }

  // src/bilibili.com/components/UserBlockButtonInline.svelte
  var root8 = from_html(`<span class="h-f-btn"> </span>`);
  function UserBlockButtonInline($$anchor, $$props) {
    push($$props, true);
    const $blockedUsers = () => store_get(blockedUsers_default, "$blockedUsers", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let isBlocked = user_derived(() => $blockedUsers() && blockedUsers_default.has($$props.user.id));
    var span = root8();
    span.__click = (e) => {
      e.stopPropagation();
      blockedUsers_default.toggle({
        id: $$props.user.id,
        name: document.querySelector("#h-name, .nickname")?.innerText ?? ""
      });
    };
    var text2 = child(span, true);
    reset(span);
    template_effect(() => set_text(text2, get(isBlocked) ? "取消屏蔽" : "屏蔽"));
    append($$anchor, span);
    pop();
    $$cleanup();
  }
  delegate(["click"]);

  // src/bilibili.com/components/UserBlockStatus.svelte
  var root9 = from_html(`<span> </span>`);
  function UserBlockStatus($$anchor, $$props) {
    push($$props, true);
    const $blockedUsers = () => store_get(blockedUsers_default, "$blockedUsers", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let isBlocked = user_derived(() => $blockedUsers() && blockedUsers_default.has($$props.user.id));
    var span = root9();
    var text2 = child(span, true);
    reset(span);
    template_effect(() => set_text(text2, get(isBlocked) ? "取消屏蔽" : "屏蔽"));
    append($$anchor, span);
    pop();
    $$cleanup();
  }

  // src/bilibili.com/components/UserBlockButton.ts
  var _UserBlockButton = class _UserBlockButton {
    constructor(user) {
      this.user = user;
      this.render = () => {
        const parentV1 = document.querySelector(".h-action");
        if (parentV1) {
          obtainHTMLElementByID({
            tag: "div",
            id: _UserBlockButton.id,
            onDidCreate: (el) => {
              el.style.display = "inline";
              parentV1.append(...[el, parentV1.lastChild].filter(isNonNull));
              mount(UserBlockButtonInline, {
                target: el,
                props: {
                  user: this.user
                }
              });
            }
          });
          return;
        }
        const parentV2 = document.querySelector(".operations .interactions");
        if (parentV2) {
          obtainHTMLElementByID({
            tag: "div",
            id: _UserBlockButton.id,
            onDidCreate: (el) => {
              el.style.cssText = `cursor: pointer;
display: flex;
justify-content: center;
align-items: center;
width: 150px;
height: 34px;
border-radius: 6px;
font-size: 14px;
font-weight: 700;
color: var(--text_white);
border: 1px solid rgba(255,255,255,.2);
background-color: rgba(255,255,255,.14);
transition: all .3s;
margin-right: 24px;
`;
              el.addEventListener("mouseenter", () => {
                el.style.backgroundColor = "rgba(255,255,255,.4)";
              });
              el.addEventListener("mouseleave", () => {
                el.style.backgroundColor = "rgba(255,255,255,.14)";
              });
              el.addEventListener("click", (e) => {
                e.stopPropagation();
                blockedUsers_default.toggle({
                  id: this.user.id,
                  name: document.querySelector("#h-name, .nickname")?.innerText ?? ""
                });
              });
              parentV2.append(...[el, parentV2.lastChild].filter(isNonNull));
              mount(UserBlockStatus, {
                target: el,
                props: {
                  user: this.user
                }
              });
            }
          });
        }
      };
    }
  };
  _UserBlockButton.id = `user-block-button-${randomUUID()}`;
  var UserBlockButton = _UserBlockButton;

  // src/bilibili.com/utils/parseVideoURL.ts
  function parseVideoURL(rawURL) {
    if (!rawURL) {
      return;
    }
    const url = new URL(rawURL, window.location.href);
    if (url.host !== "www.bilibili.com") {
      return;
    }
    const match = /^\/video\/(BV[0-9a-zA-Z]+)\/?/.exec(url.pathname);
    if (!match) {
      return;
    }
    return {
      id: match[1]
    };
  }

  // src/utils/setHTMLElementDisplayHidden.ts
  function setHTMLElementDisplayHidden(el, want) {
    const actual = el.style.display === "none";
    if (actual === want) {
      return;
    }
    if (want) {
      el.style.display = "none";
    } else {
      el.style.display = "";
    }
  }

  // src/bilibili.com/components/VideoHoverButton.svelte
  var root10 = from_html(`<button type="button"><svg viewBox="-3 -1 28 28" class="h-7 fill-current"><path fill-rule="evenodd" clip-rule="evenodd"></path></svg></button>`);
  function VideoHoverButton($$anchor, $$props) {
    push($$props, true);
    const $blockedUsers = () => store_get(blockedUsers_default, "$blockedUsers", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let user = prop($$props, "user", 15);
    function setUser(u) {
      user(u);
    }
    let isBlocked = user_derived(() => $blockedUsers() && blockedUsers_default.has(user().id));
    var $$exports = { setUser };
    var button = root10();
    button.__click = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (get(isBlocked)) {
        blockedUsers_default.remove(user().id);
      } else {
        blockedUsers_default.add(user());
      }
    };
    var svg = child(button);
    var path = child(svg);
    reset(svg);
    reset(button);
    template_effect(() => {
      set_attribute2(button, "title", get(isBlocked) ? "取消屏蔽此用户" : "屏蔽此用户");
      set_class(button, 1, `rounded-md cursor-pointer z-20 border-none ${get(isBlocked) ? "bg-white text-black" : "text-white bg-[rgba(33,33,33,.8)]"}`);
      set_attribute2(path, "d", get(isBlocked) ? mdiAccountCheckOutline : mdiAccountCancelOutline);
    });
    append($$anchor, button);
    var $$pop = pop($$exports);
    $$cleanup();
    return $$pop;
  }
  delegate(["click"]);

  // src/utils/ExactSearchMatcher.ts
  var ExactSearchMatcher = class {
    constructor(q) {
      this.match = (...searchKey) => {
        if (this.keywords.length === 0) {
          return true;
        }
        return this.keywords.every((i) => {
          return searchKey.some((j) => j.toLowerCase().includes(i));
        });
      };
      this.keywords = q.split(/\s/).map((i) => i.trim().toLowerCase()).filter((i) => i);
    }
  };

  // src/bilibili.com/Context.ts
  var Context = class {
    constructor({ query }) {
      this.shouldExcludeVideo = (v) => {
        if (v.isPromoted && !videoListSettings_default.allowPromoted) {
          return true;
        }
        if (v.user) {
          if (blockedUsers_default.has(v.user.id)) {
            return true;
          }
          if (v.user.name && blockedUserPatterns_default.shouldBlock(v.user.name)) {
            return true;
          }
        }
        if (v.duration) {
          const durationMs = Duration.cast(v.duration).toMilliseconds();
          if (durationMs <= 0) {
          } else if (videoListSettings_default.durationGte.valid && !(durationMs >= videoListSettings_default.durationGte.toMilliseconds())) {
            return true;
          } else if (videoListSettings_default.durationLt.valid && !(durationMs < videoListSettings_default.durationLt.toMilliseconds())) {
            return true;
          }
        }
        if (this.query && v.title && searchSettings_default.strictTitleMatch) {
          if (!this.m.match(v.title)) {
            return true;
          }
        }
        if (v.title && videoListSettings_default.excludeKeywords.some(
          (i) => v.title.toLowerCase().includes(i.toLowerCase())
        )) {
          return true;
        }
        return false;
      };
      this.shouldExcludeLiveRoom = (v) => {
        if (v.owner && blockedUsers_default.has(v.owner.id)) {
          return true;
        }
        if (v.room && blockedLiveRooms_default.has(v.room.id)) {
          return true;
        }
        return false;
      };
      this.query = query;
      this.m = new ExactSearchMatcher(query);
    }
  };

  // src/bilibili.com/components/VideoDetailPatch.ts
  var VideoDetailPatch = class {
    constructor(ctx) {
      this.ctx = ctx;
      this.blockedTitles = /* @__PURE__ */ new Set();
      this.instances = /* @__PURE__ */ new WeakMap();
      this.render = () => {
        document.querySelectorAll(".video-page-card-small").forEach((i) => {
          const rawURL = i.querySelector(".upname a")?.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const user = parseUserURL(rawURL);
          let hidden = false;
          let note = "";
          if (user) {
            const duration = i.querySelector(".duration")?.textContent?.trim() ?? "";
            const titleEl = i.querySelector(".title");
            const title = (titleEl?.getAttribute("title") || titleEl?.textContent) ?? "";
            if (title) {
              note = `${title}`;
            }
            const video = parseVideoURL(
              titleEl?.parentElement?.getAttribute("href")
            );
            if (video?.id) {
              note += `(${video.id})`;
            }
            hidden = this.ctx.shouldExcludeVideo({ user, duration, title });
            if (hidden) {
              this.blockedTitles.add(title);
            }
          } else {
            hidden = !videoListSettings_default.allowAdvertisement;
          }
          setHTMLElementDisplayHidden(i, hidden);
          if (user && !hidden) {
            const target = i.querySelector(".pic-box");
            if (target) {
              const userData = {
                id: user.id,
                name: i.querySelector(".upname .name")?.textContent || user.id,
                note
              };
              const wrapper = obtainHTMLElementByDataKey({
                tag: "div",
                key: "video-detail-hover-button",
                parentNode: target,
                onDidCreate: (el) => {
                  target.append(el);
                  const s = mount(VideoHoverButton, {
                    target: el,
                    props: {
                      user: userData
                    }
                  });
                  this.instances.set(el, s);
                }
              });
              const comp = this.instances.get(wrapper);
              if (comp) {
                comp.setUser(userData);
              }
            }
          }
        });
        document.querySelectorAll(".bpx-player-ending-related-item").forEach((i) => {
          const title = i.querySelector(
            ".bpx-player-ending-related-item-title"
          )?.textContent;
          if (!title) {
            return;
          }
          const hidden = this.blockedTitles.has(title) || this.ctx.shouldExcludeVideo({ title });
          setHTMLElementDisplayHidden(i, hidden);
        });
      };
    }
  };

  // src/bilibili.com/components/SSRVideoRankPatch.ts
  var SSRVideoRankPatch = class {
    constructor() {
      this.instances = /* @__PURE__ */ new WeakMap();
      this.render = () => {
        document.querySelectorAll(".rank-item").forEach((i) => {
          const user = parseUserURL(
            i.querySelector(".up-name")?.parentElement?.getAttribute("href")
          );
          if (!user) {
            return;
          }
          const name = i.querySelector(".up-name")?.textContent ?? "";
          const isBlocked = blockedUsers_default.has(user.id);
          setHTMLElementDisplayHidden(i, isBlocked);
          if (!isBlocked) {
            const target = i.querySelector(".img");
            if (target) {
              const userData = {
                id: user.id,
                name,
                note: ""
              };
              const wrapper = obtainHTMLElementByDataKey({
                tag: "div",
                key: "ssr-video-rank-hover-button",
                parentNode: target,
                onDidCreate: (el) => {
                  target.append(el);
                  const s = mount(VideoHoverButton, {
                    target: el,
                    props: {
                      user: userData
                    }
                  });
                  this.instances.set(el, s);
                }
              });
              const comp = this.instances.get(wrapper);
              if (comp) {
                comp.setUser(userData);
              }
            }
          }
        });
      };
    }
  };

  // node_modules/.pnpm/es-toolkit@1.39.9/node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
  function isPlainObject(value) {
    if (!value || typeof value !== "object") {
      return false;
    }
    const proto = Object.getPrototypeOf(value);
    const hasObjectPrototype = proto === null || proto === Object.prototype || Object.getPrototypeOf(proto) === null;
    if (!hasObjectPrototype) {
      return false;
    }
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  // src/utils/castPlainObject.ts
  function castPlainObject(value) {
    if (isPlainObject(value)) {
      return value;
    }
    return { value };
  }

  // src/utils/evalInContentScope.ts
  function evalInContentScope(javascript) {
    try {
      return JSON.parse(
        window.eval(`JSON.stringify(eval(${JSON.stringify(javascript)}))`)
      );
    } catch (err) {
      return err;
    }
  }

  // src/utils/getElementSelector.ts
  var attributeName = `data-select-${randomUUID()}`;
  var nextValue = 1;
  function getElementSelector(el) {
    let v = el.getAttribute(attributeName);
    if (!v) {
      v = nextValue.toString();
      nextValue += 1;
      el.setAttribute(attributeName, v);
    }
    return `[${attributeName}='${v}']`;
  }

  // src/bilibili.com/components/VueVideoRankPatch.ts
  var VueVideoRankPatch = class {
    constructor() {
      this.instances = /* @__PURE__ */ new WeakMap();
      this.render = () => {
        document.querySelectorAll(".video-card").forEach((i) => {
          const selector = getElementSelector(i);
          const videoData = evalInContentScope(
            `document.querySelector(${JSON.stringify(
              selector
            )}).__vue__._props.videoData`
          );
          const { owner, title, bvid } = castPlainObject(videoData);
          const { mid, name } = castPlainObject(owner);
          if (typeof mid !== "number" || typeof name !== "string") {
            return;
          }
          const userID = mid.toString();
          const isBlocked = blockedUsers_default.has(userID);
          setHTMLElementDisplayHidden(i, isBlocked);
          if (!isBlocked) {
            const target = i.querySelector(".video-card__content");
            if (target) {
              const userData = {
                id: userID,
                name,
                note: (typeof title === "string" ? title : "") + (typeof bvid === "string" ? `(${bvid})` : "")
              };
              const wrapper = obtainHTMLElementByDataKey({
                tag: "div",
                key: "vue-video-rank-hover-button",
                parentNode: target,
                onDidCreate: (el) => {
                  target.append(el);
                  const s = mount(VideoHoverButton, {
                    target: el,
                    props: {
                      user: userData
                    }
                  });
                  this.instances.set(el, s);
                }
              });
              const comp = this.instances.get(wrapper);
              if (comp) {
                comp.setUser(userData);
              }
            }
          }
        });
      };
    }
  };

  // src/utils/injectStyle.ts
  function injectStyle(id, css) {
    obtainHTMLElementByID({
      tag: "style",
      id,
      onDidCreate: (el) => {
        document.head.appendChild(el);
        el.innerHTML = css;
      }
    });
  }

  // src/bilibili.com/components/VideoListPatchStatus.svelte
  var root_15 = from_html(`<div class="w-full text-gray-500 dark:text-gray-400 text-center m-1"><!> <button type="button" class="border rounded py-1 px-2 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition ease-in-out duration-200"> </button></div>`);
  function VideoListPatchStatus($$anchor, $$props) {
    push($$props, true);
    const $stateStore = () => store_get($$props.stateStore, "$stateStore", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    var fragment = comment();
    var node = first_child(fragment);
    {
      var consequent_1 = ($$anchor2) => {
        var div = root_15();
        var node_1 = child(div);
        {
          var consequent = ($$anchor3) => {
            var text2 = text();
            template_effect(() => set_text(text2, `${$stateStore().matchCount ?? ""} 条视频符合屏蔽规则`));
            append($$anchor3, text2);
          };
          var alternate = ($$anchor3) => {
            var text_1 = text();
            template_effect(() => set_text(text_1, `已屏蔽 ${$stateStore().matchCount ?? ""} 条视频`));
            append($$anchor3, text_1);
          };
          if_block(node_1, ($$render) => {
            if ($stateStore().disabled) $$render(consequent);
            else $$render(alternate, false);
          });
        }
        var button = sibling(node_1, 2);
        button.__click = function(...$$args) {
          $$props.onToggle?.apply(this, $$args);
        };
        var text_2 = child(button, true);
        reset(button);
        reset(div);
        template_effect(
          ($0) => {
            set_attribute2(div, "data-theme", $0);
            set_text(text_2, $stateStore().disabled ? "屏蔽" : "全部显示");
          },
          [getCurrentTheme]
        );
        append($$anchor2, div);
      };
      if_block(node, ($$render) => {
        if ($stateStore().matchCount > 0) $$render(consequent_1);
      });
    }
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  delegate(["click"]);

  // src/bilibili.com/components/VideoListPatch.ts
  var _VideoListPatch = class _VideoListPatch {
    constructor(ctx) {
      this.ctx = ctx;
      this.matchCountStore = writable(0);
      this.disabledStore = writable(false);
      this.instances = /* @__PURE__ */ new WeakMap();
      this.render = () => {
        injectStyle(
          _VideoListPatch.parentKey,
          `[data-${_VideoListPatch.parentKey}]:hover [data-${_VideoListPatch.key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${_VideoListPatch.parentKey}] [data-${_VideoListPatch.key}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
        );
        let matchCount = 0;
        const disabled = get2(this.disabledStore);
        let listEl;
        document.querySelectorAll(".bili-video-card").forEach((i) => {
          const rawURL = i.querySelector("a.bili-video-card__info--owner")?.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const user = parseUserURL(rawURL);
          let match = false;
          let note = "";
          if (user) {
            const authorEl = i.querySelector(".bili-video-card__info--author");
            const authorName = (authorEl?.getAttribute("title") || authorEl?.textContent) ?? "";
            const duration = i.querySelector(".bili-video-card__stats__duration")?.textContent?.trim() ?? "";
            const titleEl = i.querySelector(".bili-video-card__info--tit");
            const title = (titleEl?.getAttribute("title") || titleEl?.textContent) ?? "";
            if (title) {
              note = `${title}`;
            }
            const video = parseVideoURL(
              titleEl?.parentElement?.getAttribute("href") ?? titleEl?.querySelector("a")?.getAttribute("href")
            );
            if (video?.id) {
              note += `(${video.id})`;
            }
            const isPromoted = i.classList.contains("is-rcmd") && !i.classList.contains("enable-no-interest");
            match = this.ctx.shouldExcludeVideo({
              user: { ...user, name: authorName },
              duration,
              title,
              isPromoted
            });
          } else {
            match = !videoListSettings_default.allowAdvertisement;
          }
          if (match) {
            matchCount += 1;
          }
          let container = i;
          while (container.parentElement?.childElementCount === 1 || Array.from(container.parentElement?.classList.values() ?? []).some(
            (cls) => _VideoListPatch.knownParentContainerClass.has(cls)
          )) {
            container = container.parentElement;
          }
          listEl = container.parentElement || void 0;
          const hidden = !disabled && match;
          setHTMLElementDisplayHidden(container, hidden);
          if (user && !hidden) {
            const target = i.querySelector(".bili-video-card__image--wrap");
            if (target) {
              const userData = {
                id: user.id,
                name: i.querySelector(".bili-video-card__info--author")?.textContent || user.id,
                note
              };
              const wrapper = obtainHTMLElementByDataKey({
                tag: "div",
                key: _VideoListPatch.key,
                parentNode: target,
                onDidCreate: (el) => {
                  target.setAttribute(`data-${_VideoListPatch.parentKey}`, "");
                  target.append(el);
                  const s = mount(VideoHoverButton, {
                    target: obtainStyledShadowRoot(el),
                    props: {
                      user: userData
                    }
                  });
                  this.instances.set(el, s);
                }
              });
              const comp = this.instances.get(wrapper);
              if (comp) {
                comp.setUser(userData);
              }
            }
          }
        });
        this.matchCountStore.set(matchCount);
        obtainHTMLElementByID({
          id: `video-list-patch-status-${_VideoListPatch.id}`,
          tag: "div",
          onDidCreate: (el) => {
            listEl?.parentElement?.insertBefore(el, listEl);
            const shadowRoot = obtainStyledShadowRoot(el);
            const stateStore = writable({ matchCount, disabled });
            this.matchCountStore.subscribe((v) => {
              stateStore.update((s) => ({ ...s, matchCount: v }));
            });
            this.disabledStore.subscribe((v) => {
              stateStore.update((s) => ({ ...s, disabled: v }));
            });
            mount(VideoListPatchStatus, {
              target: shadowRoot,
              props: {
                stateStore,
                onToggle: () => {
                  this.disabledStore.update((v) => !v);
                  this.render();
                }
              }
            });
          }
        });
      };
    }
  };
  _VideoListPatch.id = randomUUID();
  _VideoListPatch.parentKey = "dde57f95-0cb5-4443-bbeb-2466d63db0f1";
  _VideoListPatch.key = "a1161956-2be7-4796-9f1b-528707156b11";
  _VideoListPatch.knownParentContainerClass = /* @__PURE__ */ new Set([
    "bili-feed-card",
    "feed-card"
  ]);
  var VideoListPatch = _VideoListPatch;

  // src/bilibili.com/components/AdblockTipPatch.ts
  var AdblockTipPatch = class {
    constructor() {
      this.render = () => {
        const el = document.querySelector(".adblock-tips");
        if (el instanceof HTMLElement) {
          setHTMLElementDisplayHidden(el, !homePageSettings_default.allowAdblockTips);
        }
      };
    }
  };

  // src/bilibili.com/components/HomePageFloorCardHoverButton.svelte
  var root11 = from_html(`<button type="button" title="屏蔽此频道的楼层卡片" class="absolute top-2 left-2 rounded-md cursor-pointer text-white bg-[rgba(33,33,33,.8)] z-20 border-none"><svg viewBox="-2 -2 28 28" class="h-7 fill-current"><path fill-rule="evenodd" clip-rule="evenodd"></path></svg></button>`);
  function HomePageFloorCardHoverButton($$anchor, $$props) {
    push($$props, true);
    let floorCard = prop($$props, "floorCard", 15);
    function setFloorCard(f) {
      floorCard(f);
    }
    var $$exports = { setFloorCard };
    var button = root11();
    button.__click = (e) => {
      e.preventDefault();
      e.stopPropagation();
      homePageSettings_default.floorCard.excludeByChannel = [
        ...homePageSettings_default.floorCard.excludeByChannel,
        floorCard().channel
      ];
    };
    var svg = child(button);
    var path = child(svg);
    reset(svg);
    reset(button);
    template_effect(() => set_attribute2(path, "d", mdiEyeOff));
    append($$anchor, button);
    return pop($$exports);
  }
  delegate(["click"]);

  // src/bilibili.com/components/HomePageFloorCardPatch.ts
  var _HomePageFloorCardPatch = class _HomePageFloorCardPatch {
    constructor() {
      this.instances = /* @__PURE__ */ new WeakMap();
      this.render = () => {
        injectStyle(
          _HomePageFloorCardPatch.parentKey,
          `[data-${_HomePageFloorCardPatch.parentKey}]:hover [data-${_HomePageFloorCardPatch.key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${_HomePageFloorCardPatch.parentKey}] [data-${_HomePageFloorCardPatch.key}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
        );
        document.querySelectorAll(".floor-single-card").forEach((el) => {
          const channel = el.querySelector(".floor-title")?.textContent?.trim();
          if (!channel) {
            return;
          }
          const i = { channel };
          const hidden = homePageSettings_default.floorCard.shouldExclude(i);
          setHTMLElementDisplayHidden(el, hidden);
          if (!hidden) {
            const target = el.querySelector(".cover-container");
            if (target) {
              const wrapper = obtainHTMLElementByDataKey({
                tag: "div",
                key: _HomePageFloorCardPatch.key,
                parentNode: target,
                onDidCreate: (el2) => {
                  target.setAttribute(
                    `data-${_HomePageFloorCardPatch.parentKey}`,
                    ""
                  );
                  target.append(el2);
                  const s = mount(HomePageFloorCardHoverButton, {
                    target: obtainStyledShadowRoot(el2),
                    props: {
                      floorCard: i
                    }
                  });
                  this.instances.set(el2, s);
                }
              });
              const comp = this.instances.get(wrapper);
              if (comp) {
                comp.setFloorCard(i);
              }
            }
          }
        });
      };
    }
  };
  _HomePageFloorCardPatch.parentKey = "51d5da07-ab2d-4342-8496-c3c53980bb74";
  _HomePageFloorCardPatch.key = "85e3e435-2ad2-4a7d-839f-69318799db0f";
  var HomePageFloorCardPatch = _HomePageFloorCardPatch;

  // src/bilibili.com/components/MiniHeaderButton.svelte
  var root12 = from_html(`<div class="item"><span class="name">屏蔽</span></div>`);
  function MiniHeaderButton($$anchor, $$props) {
    push($$props, true);
    var div = root12();
    div.__click = (e) => {
      e.preventDefault();
      e.stopPropagation();
      $$props.settings.open();
    };
    append($$anchor, div);
    pop();
  }
  delegate(["click"]);

  // src/bilibili.com/components/MiniHeaderButton.ts
  var _MiniHeaderButton = class _MiniHeaderButton {
    constructor(settings) {
      this.render = () => {
        const parent = document.querySelector(
          ".nav-user-center .user-con:nth-child(2)"
        );
        if (!parent) {
          return;
        }
        void obtainHTMLElementByID({
          tag: "div",
          id: _MiniHeaderButton.id,
          onDidCreate: (el) => {
            el.classList.add("item");
            parent.prepend(...[parent.firstChild, el].filter(isNonNull));
            mount(MiniHeaderButton, {
              target: el,
              props: {
                settings: this.settings
              }
            });
          }
        });
      };
      this.settings = settings;
    }
  };
  _MiniHeaderButton.id = `mini-header-button-${randomUUID()}`;
  var MiniHeaderButton2 = _MiniHeaderButton;

  // src/bilibili.com/components/PlaylistPatch.ts
  var PlaylistPatch = class {
    constructor(ctx) {
      this.ctx = ctx;
      this.instances = /* @__PURE__ */ new WeakMap();
      this.render = () => {
        document.querySelectorAll(".video-card").forEach((i) => {
          const rawURL = i.querySelector("a.upname")?.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const user = parseUserURL(rawURL);
          let hidden = false;
          if (user) {
            const duration = i.querySelector(".duration")?.textContent?.trim() ?? "";
            const title = (i.querySelector(".title")?.getAttribute("title") || i.querySelector(".title")?.textContent) ?? "";
            hidden = this.ctx.shouldExcludeVideo({ user, duration, title });
          } else {
            hidden = !videoListSettings_default.allowAdvertisement;
          }
          setHTMLElementDisplayHidden(i, hidden);
          if (user && !hidden) {
            const target = i.querySelector(".pic-box");
            if (target) {
              const userData = {
                id: user.id,
                name: i.querySelector(".upname .name")?.textContent || user.id,
                note: ""
              };
              const wrapper = obtainHTMLElementByDataKey({
                tag: "div",
                key: "playlist-video-hover-button",
                parentNode: target,
                onDidCreate: (el) => {
                  target.append(el);
                  const s = mount(VideoHoverButton, {
                    target: el,
                    props: {
                      user: userData
                    }
                  });
                  this.instances.set(el, s);
                }
              });
              const comp = this.instances.get(wrapper);
              if (comp) {
                comp.setUser(userData);
              }
            }
          }
        });
      };
    }
  };

  // src/bilibili.com/utils/parseLiveRoomURL.ts
  function parseLiveRoomURL(rawURL) {
    if (!rawURL) {
      return;
    }
    const url = new URL(rawURL, window.location.href);
    switch (url.host) {
      case "live.bilibili.com": {
        const match = /^\/(\d+)\/?/.exec(url.pathname);
        if (!match) {
          return;
        }
        return { id: match[1] };
      }
      default:
    }
  }

  // src/bilibili.com/components/LiveRoomHoverButton.svelte
  var root13 = from_html(`<button type="button" style="z-index: 200;"><svg viewBox="0 0 24 24" class="h-8 fill-current"><path fill-rule="evenodd" clip-rule="evenodd"></path></svg></button>`);
  function LiveRoomHoverButton($$anchor, $$props) {
    push($$props, true);
    const $blockedLiveRooms = () => store_get(blockedLiveRooms_default, "$blockedLiveRooms", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let room = prop($$props, "room", 15);
    function setRoom(r) {
      room(r);
    }
    let isBlocked = user_derived(() => $blockedLiveRooms() && blockedLiveRooms_default.has(room().id));
    var $$exports = { setRoom };
    var button = root13();
    button.__click = (e) => {
      e.preventDefault();
      e.stopPropagation();
      blockedLiveRooms_default.toggle(room(), !get(isBlocked));
    };
    var svg = child(button);
    var path = child(svg);
    reset(svg);
    reset(button);
    template_effect(() => {
      set_attribute2(button, "title", get(isBlocked) ? "取消屏蔽此直播间" : "屏蔽此直播间");
      set_class(button, 1, `absolute top-2 left-2 p-1 rounded-md cursor-pointer isolate border-none ${get(isBlocked) ? "bg-white text-black" : "text-white bg-[rgba(33,33,33,.8)]"}`);
      set_attribute2(path, "d", get(isBlocked) ? mdiCheckCircleOutline : mdiCancel);
    });
    append($$anchor, button);
    var $$pop = pop($$exports);
    $$cleanup();
    return $$pop;
  }
  delegate(["click"]);

  // src/bilibili.com/components/LiveRoomListStatus.svelte
  var root_16 = from_html(`<div style="width: 100%; color: #6b7280; text-align: center; margin: 4px; font-size: 14px;"> <button type="button"> </button></div>`);
  function LiveRoomListStatus($$anchor, $$props) {
    const $matchCountStore = () => store_get($$props.matchCountStore, "$matchCountStore", $$stores);
    const $disabledStore = () => store_get($$props.disabledStore, "$disabledStore", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let matchCount = user_derived($matchCountStore);
    let disabled = user_derived($disabledStore);
    let isHovered = state(false);
    var fragment = comment();
    var node = first_child(fragment);
    {
      var consequent = ($$anchor2) => {
        var div = root_16();
        var text2 = child(div);
        var button = sibling(text2);
        button.__click = function(...$$args) {
          $$props.onToggleDisabled?.apply(this, $$args);
        };
        var text_1 = child(button, true);
        reset(button);
        reset(div);
        template_effect(() => {
          set_text(text2, `${get(disabled) ? `${get(matchCount)} 个直播间符合屏蔽规则` : `已屏蔽 ${get(matchCount)} 个直播间`} `);
          set_style(button, `border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px 8px; color: black; background-color: ${get(isHovered) ? "#f3f4f6" : "transparent"}; transition: background-color 0.2s ease-in-out; cursor: pointer; margin-left: 8px;`);
          set_text(text_1, get(disabled) ? "屏蔽" : "全部显示");
        });
        event("mouseenter", button, () => set(isHovered, true));
        event("mouseleave", button, () => set(isHovered, false));
        append($$anchor2, div);
      };
      if_block(node, ($$render) => {
        if (get(matchCount) > 0) $$render(consequent);
      });
    }
    append($$anchor, fragment);
    $$cleanup();
  }
  delegate(["click"]);

  // src/bilibili.com/components/LiveRoomListPatch.ts
  var _LiveRoomPatch = class _LiveRoomPatch {
    constructor(ctx) {
      this.ctx = ctx;
      this.disabledStore = writable(false);
      this.matchCountStore = writable(0);
      this.instances = /* @__PURE__ */ new WeakMap();
      this.render = () => {
        injectStyle(
          _LiveRoomPatch.parentKey,
          `[data-${_LiveRoomPatch.parentKey}]:hover [data-${_LiveRoomPatch.key}] {
  filter: opacity(1);
  transition: filter 0.2s linear 0.2s;
}

[data-${_LiveRoomPatch.parentKey}] [data-${_LiveRoomPatch.key}] {
  filter: opacity(0);
  z-index: 10;
  position: absolute;
  top: 8px;
  left: 8px;
  transition: filter 0.2s linear 0s;
}
`
        );
        let matchCount = 0;
        const disabled = get2(this.disabledStore);
        let listEl;
        document.querySelectorAll("a#card").forEach((i) => {
          const rawURL = i.getAttribute("href");
          if (!rawURL) {
            return;
          }
          const room = parseLiveRoomURL(rawURL);
          if (!room) {
            return;
          }
          const match = this.ctx.shouldExcludeLiveRoom({ room });
          if (match) {
            matchCount += 1;
          }
          let container = i;
          while (container.parentElement?.childElementCount === 1) {
            container = container.parentElement;
          }
          listEl = container.parentElement || void 0;
          const hidden = !disabled && match;
          setHTMLElementDisplayHidden(container, hidden);
          if (!hidden) {
            const target = i.querySelector(".Item_cover-wrap_BmU4h");
            if (target) {
              const roomData = {
                id: room.id,
                owner: i.querySelector(".Item_nickName_KO2QE")?.textContent || room.id
              };
              const wrapper = obtainHTMLElementByDataKey({
                tag: "div",
                key: _LiveRoomPatch.key,
                parentNode: target,
                onDidCreate: (el) => {
                  target.setAttribute(`data-${_LiveRoomPatch.parentKey}`, "");
                  target.append(el);
                  const s = mount(LiveRoomHoverButton, {
                    target: obtainStyledShadowRoot(el),
                    props: {
                      room: roomData
                    }
                  });
                  this.instances.set(el, s);
                }
              });
              const comp = this.instances.get(wrapper);
              if (comp) {
                comp.setRoom(roomData);
              }
            }
          }
        });
        this.matchCountStore.set(matchCount);
        obtainHTMLElementByID({
          id: `live-room-list-patch-status-${_LiveRoomPatch.id}`,
          tag: "div",
          onDidCreate: (el) => {
            listEl?.parentElement?.insertBefore(el, listEl);
            const shadowRoot = obtainStyledShadowRoot(el);
            mount(LiveRoomListStatus, {
              target: shadowRoot,
              props: {
                matchCountStore: this.matchCountStore,
                disabledStore: this.disabledStore,
                onToggleDisabled: () => {
                  this.disabledStore.update((v) => !v);
                  this.render();
                }
              }
            });
          }
        });
      };
    }
  };
  _LiveRoomPatch.id = randomUUID();
  _LiveRoomPatch.parentKey = "321c1408-3ba8-4f8e-8ec8-4c491cf648c6";
  _LiveRoomPatch.key = "c2ad7200-7141-46cd-a0ce-ba71ca52e396";
  var LiveRoomPatch = _LiveRoomPatch;

  // src/bilibili.com/components/LiveHeaderButton.svelte
  var root14 = from_html(`<div style="display: flex; align-items: center; margin: 0 20px; flex-direction: column; gap: 4px; padding: 12px; font-size: 14px; cursor: pointer; color: inherit;"><svg viewBox="2 2 20 20" style="height: 20px; fill: currentColor;"><path fill-rule="evenodd" clip-rule="evenodd"></path></svg> <span>屏蔽</span></div>`);
  function LiveHeaderButton($$anchor, $$props) {
    push($$props, true);
    var div = root14();
    div.__click = (e) => {
      e.preventDefault();
      e.stopPropagation();
      $$props.onClick();
    };
    var svg = child(div);
    var path = child(svg);
    reset(svg);
    next(2);
    reset(div);
    template_effect(() => set_attribute2(path, "d", mdiEyeOffOutline));
    append($$anchor, div);
    pop();
  }
  delegate(["click"]);

  // src/bilibili.com/components/LiveHeaderButton.ts
  var _LiveHeaderButton = class _LiveHeaderButton {
    constructor(settings) {
      this.render = () => {
        const parent = document.querySelector(".link-navbar");
        if (!parent) {
          return;
        }
        void obtainHTMLElementByID({
          tag: "div",
          id: _LiveHeaderButton.id,
          onDidCreate: (el) => {
            el.style.fontSize = "14px";
            parent.append(...[el, parent.lastChild].filter(isNonNull));
            mount(LiveHeaderButton, {
              target: el,
              props: {
                onClick: () => this.settings.open()
              }
            });
          }
        });
      };
      this.settings = settings;
    }
  };
  _LiveHeaderButton.id = `live-header-button-${randomUUID()}`;
  var LiveHeaderButton2 = _LiveHeaderButton;

  // src/bilibili.com/components/NavSearchSuggestionPatch.ts
  var NavSearchSuggestionPatch = class {
    constructor() {
      this.placeholder = "搜索";
      this.originalPlaceholder = "";
    }
    render() {
      if (!this.originalPlaceholder && !searchSettings_default.disableNavSuggestion) {
        return;
      }
      const match = document.querySelector(".nav-search-input[placeholder]");
      if (match instanceof HTMLInputElement) {
        if (searchSettings_default.disableNavSuggestion) {
          if (match.placeholder != this.placeholder) {
            this.originalPlaceholder = match.placeholder;
            match.placeholder = this.placeholder;
            const ob = new MutationObserver(() => {
              if (!searchSettings_default.disableNavSuggestion) {
                ob.disconnect();
                return;
              }
              if (match.placeholder != this.placeholder) {
                match.placeholder = this.placeholder;
              }
            });
            ob.observe(match, { attributeFilter: ["placeholder"] });
          }
        } else {
          match.placeholder = this.originalPlaceholder;
          this.originalPlaceholder = "";
        }
      }
    }
  };

  // src/bilibili.com/block.user.ts
  async function createApp() {
    const rawURL = window.location.href;
    const settings = new SettingsDrawer2();
    const navSuggestion = new NavSearchSuggestionPatch();
    const components = [settings, navSuggestion];
    const user = parseUserURL(rawURL);
    const url = new URL(rawURL);
    let headerButton;
    await waitUntil({
      ready: () => {
        if ((document.querySelector(".right-entry")?.childElementCount ?? 0) >= 2) {
          headerButton = new FullHeaderButton2(settings);
          return true;
        }
        if ((document.querySelector(".nav-user-center .user-con:nth-child(2)")?.childElementCount ?? 0) >= 2) {
          headerButton = new MiniHeaderButton2(settings);
          return true;
        }
        if (document.querySelector(".link-navbar .right-part")) {
          headerButton = new LiveHeaderButton2(settings);
          return true;
        }
        navSuggestion.render();
        return false;
      }
    });
    if (headerButton) {
      console.log(headerButton);
      components.push(headerButton);
    }
    const data = {
      query: ""
    };
    if (url.host === "search.bilibili.com") {
      data.query = url.searchParams.get("keyword") ?? "";
    }
    const ctx = new Context(data);
    if (user) {
      components.push(new UserBlockButton(user));
    } else if (parseVideoURL(rawURL)) {
      components.push(new VideoDetailPatch(ctx));
    } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/v/popular/rank/all")) {
      components.push(new SSRVideoRankPatch());
    } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/v/popular/")) {
      components.push(new VueVideoRankPatch());
    } else if (url.host === "www.bilibili.com" && url.pathname.startsWith("/list/")) {
      components.push(new PlaylistPatch(ctx));
    } else if (url.host === "live.bilibili.com") {
      components.push(new LiveRoomPatch(ctx), new VideoListPatch(ctx));
    } else {
      components.push(new VideoListPatch(ctx));
    }
    if (url.host === "www.bilibili.com" && url.pathname === "/") {
      components.push(new AdblockTipPatch(), new HomePageFloorCardPatch());
    }
    return {
      render: () => components.forEach((i) => {
        try {
          i.render();
        } catch (err) {
          console.error("failed to render", i.constructor.name, err);
        }
      })
    };
  }
  function routeKey() {
    const { host, pathname, search } = window.location;
    if (host === "search.bilibili.com") {
      const q = new URLSearchParams(search);
      return `search:${q.get("keyword") ?? ""}`;
    }
    return pathname;
  }
  async function main() {
    await migrate();
    let initialRouteKey = routeKey();
    let app = await createApp();
    new Polling({
      update: async () => {
        const currentRouteKey = routeKey();
        if (currentRouteKey !== initialRouteKey) {
          app = await createApp();
          initialRouteKey = currentRouteKey;
        }
        app.render();
      },
      scheduleNext: (next2) => {
        const handle = setTimeout(next2, 100);
        return {
          dispose: () => clearTimeout(handle)
        };
      }
    });
  }
  main();
})();
