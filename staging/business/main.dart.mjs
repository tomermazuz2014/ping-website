// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: (x0,x1) => x0.observe(x1),
      AF: x0 => x0.wheelDeltaY,
      AG: x0 => x0.next(),
      AH: x0 => x0.maxHeight,
      AI: x0 => x0.content,
      AJ: (x0,x1) => x0.warn(x1),
      AK: (x0,x1) => x0.get(x1),
      AL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AM: (x0,x1) => x0.transferFromImageBitmap(x1),
      AN: x0 => x0.document,
      AO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AP: x0 => x0.fcmOptions,
      AQ: (x0,x1) => { x0.value = x1 },
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: x0 => x0.current(),
      BH: x0 => x0.maxWidth,
      BI: x0 => x0.document,
      BJ: (x0,x1) => x0.log(x1),
      BK: x0 => x0.body,
      BL: (x0,x1) => x0.removeChild(x1),
      BM: (x0,x1) => x0.getContext(x1),
      BN: (x0,x1) => x0.querySelector(x1),
      BO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BP: x0 => x0.notification,
      BQ: x0 => x0.gain,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      CH: x0 => x0.minHeight,
      CI: x0 => new WeakRef(x0),
      CJ: () => globalThis.console,
      CK: x0 => x0.headers,
      CL: x0 => x0.click(),
      CM: (x0,x1) => { x0.height = x1 },
      CN: (x0,x1) => x0.append(x1),
      CO: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12) => ({client_id: x0,scope: x1,include_granted_scopes: x2,redirect_uri: x3,callback: x4,state: x5,enable_granular_consent: x6,enable_serial_consent: x7,login_hint: x8,hd: x9,ux_mode: x10,select_account: x11,error_callback: x12}),
      CP: x0 => x0.messageId,
      CQ: x0 => x0.resume(),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: (x0,x1) => x0.getPropertyValue(x1),
      DF: x0 => x0.identifier,
      DG: x0 => x0.v8BreakIterator,
      DH: x0 => x0.minWidth,
      DI: x0 => x0.deref(),
      DJ: (o, t) => typeof o === t,
      DK: x0 => x0.platformHint(),
      DL: (o, a) => o + a,
      DM: (x0,x1) => { x0.width = x1 },
      DN: x0 => x0.body,
      DO: x0 => x0.message,
      DP: x0 => x0.from,
      DQ: x0 => x0.play(),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: x0 => globalThis.parseFloat(x0),
      EF: x0 => x0.touches,
      EG: () => globalThis.Intl,
      EH: (x0,x1) => x0.removeProperty(x1),
      EI: () => globalThis.WeakRef,
      EJ: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      EK: () => globalThis.pingPwaInstall,
      EL: x0 => x0.children,
      EM: x0 => x0.height,
      EN: (x0,x1) => { x0.id = x1 },
      EO: x0 => x0.type,
      EP: x0 => x0.collapseKey,
      EQ: (x0,x1) => { x0.currentTime = x1 },
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: (x0,x1) => x0.getComputedStyle(x1),
      FF: x0 => x0.pressure,
      FG: (x0,x1) => x0.segment(x1),
      FH: (x0,x1) => x0.add(x1),
      FI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      FJ: x0 => x0.detail,
      FK: x0 => x0.isInstalled(),
      FL: x0 => x0.firstChild,
      FM: x0 => x0.width,
      FN: x0 => globalThis.URL.revokeObjectURL(x0),
      FO: x0 => x0.error_description,
      FP: x0 => x0.data,
      FQ: x0 => x0.state,
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.index,
      GH: x0 => x0.data,
      GI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      GJ: () => globalThis.document,
      GK: (o, p) => p in o,
      GL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GM: x0 => x0.rasterEndMilliseconds,
      GN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GO: x0 => x0.code,
      GP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GQ: () => new AudioContext(),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: x0 => x0.next(),
      HH: (x0,x1) => { x0.scrollTop = x1 },
      HI: x0 => x0.abort(),
      HJ: x0 => x0.disconnect(),
      HK: x0 => x0.groups,
      HL: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      HM: x0 => x0.rasterStartMilliseconds,
      HN: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      HO: x0 => x0.error,
      HP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HQ: (x0,x1) => x0.createMediaElementSource(x1),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.value,
      IH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      II: () => new AbortController(),
      IJ: (x0,x1) => x0.getRandomValues(x1),
      IK: o => o.byteLength,
      IL: (x0,x1) => x0.item(x1),
      IM: x0 => x0.imageBitmaps,
      IN: x0 => globalThis.URL.createObjectURL(x0),
      IO: (x0,x1) => x0.initialize(x1),
      IP: (x0,x1) => ({next: x0,error: x1}),
      IQ: x0 => x0.createGain(),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (o, p) => p in o,
      JF: x0 => x0.pointerId,
      JG: x0 => x0.done,
      JH: (x0,x1) => { x0.value = x1 },
      JI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      JJ: () => globalThis.crypto,
      JK: () => new Array(),
      JL: x0 => x0.size,
      JM: x0 => x0.canvasKitMaximumSurfaces,
      JN: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      JO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JP: (x0,x1) => globalThis.firebase_messaging.onMessage(x0,x1),
      JQ: x0 => x0.createStereoPanner(),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: (o, m, a) => o[m].apply(o, a),
      KH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      KI: (x0,x1) => globalThis.fetch(x0,x1),
      KJ: l => new DataView(new ArrayBuffer(l)),
      KK: (x0,x1) => new WebSocket(x0,x1),
      KL: x0 => x0.name,
      KM: x0 => x0.nextSibling,
      KN: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      KO: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16) => ({client_id: x0,auto_select: x1,callback: x2,login_uri: x3,native_callback: x4,cancel_on_tap_outside: x5,prompt_parent_id: x6,nonce: x7,context: x8,state_cookie_domain: x9,ux_mode: x10,allowed_parent_origin: x11,intermediate_iframe_close_callback: x12,itp_support: x13,login_hint: x14,hd: x15,use_fedcm_for_prompt: x16}),
      KP: x0 => globalThis.firebase_messaging.getMessaging(x0),
      KQ: (x0,x1) => x0.connect(x1),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LF: (x0,x1) => x0.getModifierState(x1),
      LG: x0 => x0.iterator,
      LH: (x0,x1) => { x0.value = x1 },
      LI: (x0,x1) => x0.get(x1),
      LJ: (x0,x1) => x0.assign(x1),
      LK: x0 => x0.reason,
      LL: x0 => x0.length,
      LM: (x0,x1) => x0.debug(x1),
      LN: x0 => x0.height,
      LO: x0 => x0.error,
      LP: x0 => globalThis.firebase_core.getApp(x0),
      LQ: x0 => x0.load(),
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: () => globalThis.Symbol,
      MH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      MI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      MJ: x0 => x0.location,
      MK: x0 => x0.code,
      ML: x0 => x0.files,
      MM: x0 => x0.hostElement,
      MN: x0 => x0.width,
      MO: x0 => x0.credential,
      MP: () => globalThis.firebase_core.getApp(),
      MQ: x0 => x0.destination,
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: (x0,x1) => x0.matchMedia(x1),
      NF: s => s.toUpperCase(),
      NG: (x0,x1) => new Intl.Segmenter(x0,x1),
      NH: x0 => x0.value,
      NI: (x0,x1) => x0.forEach(x1),
      NJ: () => globalThis.window,
      NK: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      NL: (x0,x1) => { x0.display = x1 },
      NM: x0 => x0.location,
      NN: (x0,x1) => x0.getContext(x1),
      NO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NP: x0 => x0.measurementId,
      NQ: x0 => x0.code,
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: x0 => x0.Segmenter,
      OH: x0 => x0.selectionDirection,
      OI: x0 => x0.name,
      OJ: x0 => x0.naturalHeight,
      OK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OL: x0 => x0.style,
      OM: (x0,x1) => x0.getModifierState(x1),
      ON: (x0,x1) => { x0.height = x1 },
      OO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OP: x0 => x0.appId,
      OQ: x0 => x0.message,
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: x0 => x0.buffer,
      PH: x0 => x0.selectionStart,
      PI: x0 => x0.statusText,
      PJ: x0 => x0.naturalWidth,
      PK: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      PL: (x0,x1) => { x0.accept = x1 },
      PM: x0 => x0.metaKey,
      PN: (x0,x1) => { x0.width = x1 },
      PO: (x0,x1,x2) => ({enableHighAccuracy: x0,timeout: x1,maximumAge: x2}),
      PP: x0 => x0.messagingSenderId,
      PQ: x0 => x0.error,
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: f => f.dartFunction,
      QF: (a, s) => a.join(s),
      QG: x0 => x0.wasmMemory,
      QH: x0 => x0.selectionEnd,
      QI: x0 => x0.url,
      QJ: (x0,x1) => x0.createElement(x1),
      QK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QL: (x0,x1) => { x0.multiple = x1 },
      QM: x0 => x0.altKey,
      QN: x0 => x0.height,
      QO: (x0,x1,x2,x3) => x0.getCurrentPosition(x1,x2,x3),
      QP: x0 => x0.storageBucket,
      QQ: x0 => x0.duration,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: () => globalThis.window._flutter_skwasmInstance,
      RH: x0 => x0.value,
      RI: x0 => x0.status,
      RJ: (x0,x1) => { x0.pointerEvents = x1 },
      RK: x0 => x0.data,
      RL: (x0,x1) => { x0.draggable = x1 },
      RM: x0 => x0.ctrlKey,
      RN: x0 => x0.width,
      RO: x0 => x0.message,
      RP: x0 => x0.databaseURL,
      RQ: (x0,x1) => { x0.playbackRate = x1 },
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (x0,x1) => x0.closest(x1),
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SF: () => globalThis.console,
      SG: () => new TextDecoder(),
      SH: x0 => x0.selectionDirection,
      SI: x0 => x0.getReader(),
      SJ: (x0,x1) => { x0.height = x1 },
      SK: (x0,x1,x2) => x0.close(x1,x2),
      SL: (x0,x1) => { x0.type = x1 },
      SM: x0 => x0.isComposing,
      SN: x0 => x0.remove(),
      SO: x0 => x0.code,
      SP: x0 => x0.authDomain,
      SQ: (x0,x1) => { x0.crossOrigin = x1 },
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: x0 => x0.bottom,
      TE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      TF: s => s.trimRight(),
      TG: (a, i) => a.splice(i, 1),
      TH: x0 => x0.selectionStart,
      TI: x0 => x0.read(),
      TJ: (x0,x1) => { x0.width = x1 },
      TK: (x0,x1) => x0.close(x1),
      TL: x0 => x0.getProperties(),
      TM: x0 => x0.code,
      TN: (x0,x1) => { x0.src = x1 },
      TO: x0 => x0.speed,
      TP: x0 => x0.projectId,
      TQ: (x0,x1) => { x0.preload = x1 },
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.top,
      UE: (o, i) => o[i],
      UF: x0 => x0.blur(),
      UG: a => a.pop(),
      UH: x0 => x0.selectionEnd,
      UI: x0 => x0.value,
      UJ: x0 => x0.style,
      UK: x0 => x0.close(),
      UL: x0 => ({multiple: x0}),
      UM: x0 => x0.repeat,
      UN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UO: x0 => x0.heading,
      UP: x0 => x0.apiKey,
      UQ: x0 => x0.length,
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.right,
      VE: o => o.length,
      VF: x0 => x0.button,
      VG: (map, o, v) => map.set(o, v),
      VH: x0 => x0.keyCode,
      VI: x0 => x0.done,
      VJ: (x0,x1) => { x0.src = x1 },
      VK: (x0,x1) => x0.send(x1),
      VL: (x0,x1,x2) => x0.select(x1,x2),
      VM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VO: x0 => x0.accuracy,
      VP: x0 => x0.options,
      VQ: x0 => x0.getReader(),
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.left,
      WE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      WF: x0 => x0.innerHeight,
      WG: (map, o) => map.get(o),
      WH: (x0,x1) => x0.scrollIntoView(x1),
      WI: x0 => x0.cancel(),
      WJ: () => globalThis.document,
      WK: x0 => x0.readyState,
      WL: () => globalThis.window.navigator,
      WM: x0 => x0.userAgent,
      WN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WO: x0 => x0.altitudeAccuracy,
      WP: x0 => x0.name,
      WQ: x0 => x0.value,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: () => new WeakMap(),
      XH: x0 => x0.multiViewEnabled,
      XI: x0 => x0.body,
      XJ: x0 => x0.src,
      XK: (x0,x1) => { x0.binaryType = x1 },
      XL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XM: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      XN: (x0,x1) => { x0.onerror = x1 },
      XO: x0 => x0.altitude,
      XP: () => globalThis.firebase_core.getApps(),
      XQ: x0 => x0.done,
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: x0 => x0.debugSkipFontRetryDelay,
      YH: (x0,x1) => x0.replaceWith(x1),
      YI: x0 => x0.headers,
      YJ: (x0,x1) => x0.revokeObjectURL(x1),
      YK: (a, l) => a.length = l,
      YL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YM: (x0,x1,x2,x3,x4,x5) => ({clientId: x0,scope: x1,redirectURI: x2,state: x3,nonce: x4,usePopup: x5}),
      YN: (x0,x1) => { x0.oncancel = x1 },
      YO: x0 => x0.timestamp,
      YP: x0 => x0.name,
      YQ: x0 => x0.read(),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: x0 => x0.status,
      ZH: (x0,x1) => { x0.type = x1 },
      ZI: x0 => x0.signal,
      ZJ: (x0,x1) => { x0.src = x1 },
      ZK: x0 => x0.decode(),
      ZL: (x0,x1) => x0.postMessage(x1),
      ZM: x0 => globalThis.AppleID.auth.init(x0),
      ZN: (x0,x1) => { x0.onchange = x1 },
      ZO: x0 => x0.longitude,
      ZP: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      ZQ: (x0,x1) => new OffscreenCanvas(x0,x1),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: (x0,x1,x2) => x0.set(x1,x2),
      aH: (x0,x1) => { x0.className = x1 },
      aI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      aJ: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      aK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      aL: x0 => x0.controller,
      aM: () => globalThis.AppleID.auth.signIn(),
      aN: x0 => x0.type,
      aO: x0 => x0.latitude,
      aP: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      aQ: x0 => x0.assetBase,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetX,
      bE: x0 => new window.FinalizationRegistry(x0),
      bF: x0 => x0.clientWidth,
      bG: x0 => x0.arrayBuffer(),
      bH: (x0,x1) => { x0.tabIndex = x1 },
      bI: (a, s, e) => a.slice(s, e),
      bJ: x0 => x0.naturalHeight,
      bK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bL: x0 => x0.serviceWorker,
      bM: x0 => x0.error,
      bN: x0 => x0.lastModified,
      bO: x0 => x0.coords,
      bP: () => globalThis.firebase_core.SDK_VERSION,
      bQ: x0 => x0.loader,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      cH: (x0,x1) => { x0.name = x1 },
      cI: (x0,x1) => x0.renderButton(x1),
      cJ: x0 => x0.naturalWidth,
      cK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      cL: (x0,x1) => x0.getItem(x1),
      cM: x0 => x0.lastName,
      cN: x0 => x0.target,
      cO: (x0,x1,x2,x3) => x0.decrypt(x1,x2,x3),
      cP: (x0,x1,x2) => globalThis.firebase_core.registerVersion(x0,x1,x2),
      cQ: () => globalThis._flutter,
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: (x0,x1) => x0.fetch(x1),
      dH: (x0,x1) => { x0.placeholder = x1 },
      dI: (x0,x1,x2) => x0.renderButton(x1,x2),
      dJ: x0 => x0.decode(),
      dK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dL: x0 => x0.localStorage,
      dM: x0 => x0.firstName,
      dN: (x0,x1) => x0.replaceChildren(x1),
      dO: x0 => x0.subtle,
      dP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: x0 => x0.fontFallbackBaseUrl,
      eH: (x0,x1) => { x0.autocomplete = x1 },
      eI: (x0,x1,x2,x3,x4,x5,x6,x7,x8) => ({type: x0,theme: x1,size: x2,text: x3,shape: x4,logo_alignment: x5,width: x6,locale: x7,click_listener: x8}),
      eJ: (x0,x1) => { x0.decoding = x1 },
      eK: x0 => x0.send(),
      eL: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      eM: x0 => x0.name,
      eN: (x0,x1) => x0.getAttribute(x1),
      eO: x0 => x0.crypto,
      eP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.body,
      fE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      fF: (x0,x1) => x0.removeChild(x1),
      fG: (handle) => clearInterval(handle),
      fH: (x0,x1) => { x0.name = x1 },
      fI: () => globalThis.google.accounts.id,
      fJ: (x0,x1) => { x0.crossOrigin = x1 },
      fK: x0 => x0.status,
      fL: x0 => x0.history,
      fM: x0 => x0.email,
      fN: (x0,x1) => x0.debug(x1),
      fO: x0 => x0.isSecureContext,
      fP: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      gH: (x0,x1) => { x0.placeholder = x1 },
      gI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      gJ: (x0,x1) => x0.createObjectURL(x1),
      gK: x0 => x0.response,
      gL: x0 => x0.href,
      gM: x0 => x0.user,
      gN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gO: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.unwrapKey(x1,x2,x3,x4,x5,x6,x7),
      gP: (x0,x1) => x0.createScriptURL(x1),
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: () => Date.now(),
      hH: (x0,x1) => { x0.action = x1 },
      hI: x0 => new MutationObserver(x0),
      hJ: x0 => x0.URL,
      hK: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      hL: (x0,x1) => x0.removeItem(x1),
      hM: x0 => x0.state,
      hN: x0 => ({createScriptURL: x0}),
      hO: (x0,x1,x2,x3,x4,x5) => x0.importKey(x1,x2,x3,x4,x5),
      hP: (x0,x1,x2) => x0.createScript(x1,x2),
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: x0 => x0.hasFocus(),
      iE: x0 => x0.preventDefault(),
      iF: x0 => x0.hostElement,
      iG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      iH: (x0,x1) => { x0.method = x1 },
      iI: x0 => ({childList: x0}),
      iJ: x0 => new Blob(x0),
      iK: (x0,x1) => { x0.responseType = x1 },
      iL: (x0,x1,x2) => x0.setItem(x1,x2),
      iM: x0 => x0.id_token,
      iN: (x0,x1,x2) => x0.createPolicy(x1,x2),
      iO: (x0,x1,x2,x3) => x0.generateKey(x1,x2,x3),
      iP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      jH: (x0,x1) => { x0.noValidate = x1 },
      jI: (x0,x1,x2) => x0.observe(x1,x2),
      jJ: x0 => x0.close(),
      jK: () => new XMLHttpRequest(),
      jL: x0 => new BroadcastChannel(x0),
      jM: x0 => x0.code,
      jN: (x0,x1) => x0.createScriptURL(x1),
      jO: (x0,x1,x2,x3,x4) => x0.wrapKey(x1,x2,x3,x4),
      jP: (o, p) => delete o[p],
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.shiftKey,
      kE: x0 => x0.timeStamp,
      kF: x0 => ({runApp: x0}),
      kG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      kH: (x0,x1) => x0.removeAttribute(x1),
      kI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      kJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      kK: x0 => x0.prompt(),
      kL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kM: x0 => x0.authorization,
      kN: (x0,x1) => x0.appendChild(x1),
      kO: (x0,x1,x2) => x0.exportKey(x1,x2),
      kP: (o, p, v) => o[p] = v,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      lG: x0 => x0.history,
      lH: x0 => x0.isConnected,
      lI: x0 => new ResizeObserver(x0),
      lJ: (x0,x1) => x0.decode(x1),
      lK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      lL: x0 => x0.close(),
      lM: (x0,x1) => x0.key(x1),
      lN: x0 => x0.head,
      lO: x0 => x0.sessionStorage,
      lP: (x0,x1) => { x0.text = x1 },
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      mG: x0 => x0.search,
      mH: x0 => x0.click(),
      mI: (x0,x1) => x0.observe(x1),
      mJ: x0 => x0.displayHeight,
      mK: (x0,x1) => x0.onChange(x1),
      mL: (x0,x1) => x0.postMessage(x1),
      mM: x0 => x0.length,
      mN: (x0,x1) => { x0.nonce = x1 },
      mO: (x0,x1) => x0.getRandomValues(x1),
      mP: (x0,x1) => { x0.text = x1 },
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: false}),
      nE: x0 => x0.ctrlKey,
      nF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      nG: x0 => x0.location,
      nH: (x0,x1) => x0.getElementsByClassName(x1),
      nI: x0 => x0.disconnect(),
      nJ: x0 => x0.displayWidth,
      nK: () => new FileReader(),
      nL: (x0,x1) => { x0.onmessage = x1 },
      nM: (x0,x1) => x0.canShare(x1),
      nN: (x0,x1) => x0.querySelectorAll(x1),
      nO: (x0,x1,x2,x3) => x0.encrypt(x1,x2,x3),
      nP: x0 => x0.trustedTypes,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: () => typeof dartUseDateNowForTicks !== "undefined",
      oG: x0 => x0.pathname,
      oH: (x0,x1) => x0.dispatchEvent(x1),
      oI: x0 => x0.height,
      oJ: x0 => x0.duration,
      oK: (x0,x1) => x0.readAsArrayBuffer(x1),
      oL: (x0,x1,x2) => x0.insertBefore(x1,x2),
      oM: (x0,x1) => x0.share(x1),
      oN: x0 => x0.nonce,
      oO: () => globalThis.removeSplashFromWeb(),
      oP: (x0,x1) => { x0.crossOrigin = x1 },
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pE: x0 => x0.x,
      pF: () => Date.now(),
      pG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      pH: (x0,x1) => x0.createEvent(x1),
      pI: x0 => x0.width,
      pJ: x0 => x0.image,
      pK: x0 => x0.result,
      pL: x0 => x0.id,
      pM: x0 => x0.message,
      pN: (x0,x1) => { x0.src = x1 },
      pO: () => globalThis.Notification.permission,
      pP: (x0,x1) => { x0.type = x1 },
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.scrollTop,
      qF: () => 1000 * performance.now(),
      qG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      qH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      qI: x0 => x0.contentRect,
      qJ: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      qK: () => new XMLHttpRequest(),
      qL: x0 => x0.offsetHeight,
      qM: (x0,x1) => ({files: x0,text: x1}),
      qN: (x0,x1) => { x0.src = x1 },
      qO: x0 => x0.message,
      qP: (x0,x1,x2) => globalThis.firebase_analytics.setUserId(x0,x1,x2),
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.offsetTop,
      rF: (x0,x1) => x0.requestAnimationFrame(x1),
      rG: o => Object.keys(o),
      rH: x0 => x0.readText(),
      rI: (x0,x1) => x0.item(x1),
      rJ: x0 => new window.ImageDecoder(x0),
      rK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      rL: x0 => x0.offsetWidth,
      rM: x0 => ({files: x0}),
      rN: (x0,x1) => { x0.defer = x1 },
      rO: x0 => x0.code,
      rP: (x0,x1) => globalThis.firebase_analytics.initializeAnalytics(x0,x1),
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sG: x0 => x0.state,
      sH: x0 => x0.clipboard,
      sI: x0 => x0.length,
      sJ: x0 => x0.name,
      sK: x0 => x0.send(),
      sL: x0 => x0.stopPropagation(),
      sM: x0 => ({text: x0}),
      sN: (x0,x1) => { x0.async = x1 },
      sO: () => globalThis.Notification.requestPermission(),
      sP: (x0,x1,x2) => globalThis.firebase_analytics.setUserProperties(x0,x1,x2),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: x0 => x0.now(),
      tG: x0 => x0.hash,
      tH: (x0,x1) => x0.writeText(x1),
      tI: x0 => x0.addedNodes,
      tJ: x0 => x0.repetitionCount,
      tK: x0 => x0.type,
      tL: x0 => x0.disabled,
      tM: x0 => ({name: x0}),
      tN: x0 => x0.trustedTypes,
      tO: x0 => ({vapidKey: x0}),
      tP: (x0,x1,x2,x3) => globalThis.firebase_analytics.logEvent(x0,x1,x2,x3),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: x0 => x0.performance,
      uG: x0 => x0.state,
      uH: x0 => x0.unlock(),
      uI: x0 => x0.firstElementChild,
      uJ: x0 => x0.frameCount,
      uK: x0 => x0.response,
      uL: (x0,x1) => { x0.min = x1 },
      uM: (x0,x1) => x0.query(x1),
      uN: x0 => x0.trustedTypes,
      uO: (x0,x1) => globalThis.firebase_messaging.getToken(x0,x1),
      uP: x0 => x0.close(),
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new Intl.Locale(x0),
      vE: (o, p, r) => o.replace(p, () => r),
      vF: x0 => new Uint8Array(x0),
      vG: (x0,x1) => x0.go(x1),
      vH: (x0,x1) => x0.lock(x1),
      vI: (x0,x1) => x0.createElement(x1),
      vJ: x0 => x0.selectedTrack,
      vK: (x0,x1) => { x0.responseType = x1 },
      vL: (x0,x1) => { x0.max = x1 },
      vM: x0 => x0.state,
      vN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      vO: x0 => x0.link,
      vP: x0 => x0.disconnect(),
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => x0.region,
      wE: (o, p, r) => o.replaceAll(p, () => r),
      wF: (x0,x1,x2) => x0.slice(x1,x2),
      wG: (a, l) => a.length = l,
      wH: x0 => x0.orientation,
      wI: (x0,x1,x2) => x0.setAttribute(x1,x2),
      wJ: x0 => x0.completed,
      wK: x0 => x0.vendor,
      wL: (x0,x1) => { x0.disabled = x1 },
      wM: x0 => x0.permissions,
      wN: x0 => { globalThis.onGoogleLibraryLoad = x0 },
      wO: x0 => x0.analyticsLabel,
      wP: (x0,x1) => { x0.src = x1 },
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.script,
      xE: x0 => x0.deltaMode,
      xF: (x0,x1) => x0.decode(x1),
      xG: x0 => x0.parentElement,
      xH: (x0,x1) => x0.querySelector(x1),
      xI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xJ: x0 => x0.ready,
      xK: x0 => x0.navigator,
      xL: (x0,x1) => { x0.scrollLeft = x1 },
      xM: x0 => x0.geolocation,
      xN: x0 => x0.requestCode(),
      xO: x0 => x0.image,
      xP: x0 => x0.pause(),
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: (x0,x1) => x0.adoptText(x1),
      yG: (x0,x1) => x0.querySelectorAll(x1),
      yH: (x0,x1) => { x0.title = x1 },
      yI: (x0,x1,x2) => x0.addEventListener(x1,x2),
      yJ: x0 => x0.tracks,
      yK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yL: (x0,x1) => { x0.spellcheck = x1 },
      yM: x0 => x0.mediaDevices,
      yN: (x0,x1) => x0.initCodeClient(x1),
      yO: x0 => x0.body,
      yP: x0 => x0.currentTime,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: x0 => x0.first(),
      zG: (d, digits) => d.toFixed(digits),
      zH: (x0,x1) => x0.vibrate(x1),
      zI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zJ: () => globalThis.window.ImageDecoder,
      zK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zL: (x0,x1) => { x0.disabled = x1 },
      zM: x0 => x0.baseURI,
      zN: () => globalThis.google.accounts.oauth2,
      zO: x0 => x0.title,
      zP: (x0,x1) => { x0.loop = x1 },

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
