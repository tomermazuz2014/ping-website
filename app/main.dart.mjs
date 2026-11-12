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
      AH: x0 => x0.selectionEnd,
      AI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      AJ: x0 => x0.completed,
      AK: l => new DataView(new ArrayBuffer(l)),
      AL: x0 => x0.history,
      AM: (x0,x1) => x0.start(x1),
      AN: x0 => x0.facingMode,
      AO: (x0,x1,x2) => x0.set(x1,x2),
      AP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AQ: x0 => x0.speed,
      AR: x0 => x0.apiKey,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: x0 => x0.current(),
      BH: x0 => x0.value,
      BI: () => Date.now(),
      BJ: x0 => x0.ready,
      BK: () => new Array(),
      BL: x0 => x0.href,
      BM: (x0,x1) => x0.end(x1),
      BN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BO: (x0,x1) => x0.querySelector(x1),
      BP: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      BQ: x0 => x0.heading,
      BR: x0 => x0.options,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      CH: x0 => x0.selectionDirection,
      CI: (a, i) => a.splice(i, 1),
      CJ: x0 => x0.tracks,
      CK: (x0,x1) => new WebSocket(x0,x1),
      CL: (x0,x1) => x0.removeItem(x1),
      CM: x0 => x0.length,
      CN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CP: x0 => globalThis.URL.createObjectURL(x0),
      CQ: x0 => x0.accuracy,
      CR: x0 => x0.name,
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
      DH: x0 => x0.selectionStart,
      DI: (a, l) => a.length = l,
      DJ: () => globalThis.window.ImageDecoder,
      DK: x0 => x0.reason,
      DL: (x0,x1,x2) => x0.setItem(x1,x2),
      DM: x0 => x0.buffered,
      DN: (x0,x1) => x0.append(x1),
      DO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      DP: x0 => x0.size,
      DQ: x0 => x0.altitudeAccuracy,
      DR: () => globalThis.firebase_core.getApps(),
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
      EH: x0 => x0.selectionEnd,
      EI: a => a.pop(),
      EJ: (o, p) => p in o,
      EK: x0 => x0.code,
      EL: x0 => new BroadcastChannel(x0),
      EM: x0 => x0.videoWidth,
      EN: (x0,x1) => { x0.onpause = x1 },
      EO: (x0,x1) => x0.appendChild(x1),
      EP: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      EQ: x0 => x0.altitude,
      ER: x0 => x0.name,
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
      FH: x0 => x0.keyCode,
      FI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      FJ: x0 => x0.groups,
      FK: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      FL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FM: x0 => x0.videoHeight,
      FN: (x0,x1) => { x0.onplay = x1 },
      FO: x0 => x0.head,
      FP: (x0,x1) => x0.getContext(x1),
      FQ: x0 => x0.timestamp,
      FR: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.index,
      GH: (x0,x1) => x0.scrollIntoView(x1),
      GI: (a, s, e) => a.slice(s, e),
      GJ: x0 => x0.naturalHeight,
      GK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GL: x0 => x0.close(),
      GM: x0 => x0.duration,
      GN: (x0,x1) => { x0.pointerEvents = x1 },
      GO: (x0,x1) => { x0.onerror = x1 },
      GP: x0 => x0.height,
      GQ: x0 => x0.longitude,
      GR: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: x0 => x0.next(),
      HH: x0 => x0.multiViewEnabled,
      HI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      HJ: x0 => x0.naturalWidth,
      HK: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      HL: (x0,x1) => x0.postMessage(x1),
      HM: (x0,x1) => { x0.playsInline = x1 },
      HN: (x0,x1) => { x0.transformOrigin = x1 },
      HO: (x0,x1) => x0.removeChild(x1),
      HP: x0 => x0.width,
      HQ: x0 => x0.latitude,
      HR: () => globalThis.firebase_core.SDK_VERSION,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.value,
      IH: (x0,x1) => x0.replaceWith(x1),
      II: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      IJ: (x0,x1) => x0.createElement(x1),
      IK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IL: (x0,x1) => { x0.onmessage = x1 },
      IM: (x0,x1) => { x0.controls = x1 },
      IN: (x0,x1) => { x0.objectFit = x1 },
      IO: (x0,x1) => { x0.onload = x1 },
      IP: x0 => x0.remove(),
      IQ: x0 => x0.coords,
      IR: (x0,x1,x2) => globalThis.firebase_core.registerVersion(x0,x1,x2),
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
      JH: (x0,x1) => { x0.type = x1 },
      JI: x0 => x0.abort(),
      JJ: (x0,x1) => { x0.pointerEvents = x1 },
      JK: (o, t) => typeof o === t,
      JL: (x0,x1,x2) => x0.insertBefore(x1,x2),
      JM: (x0,x1) => { x0.autoplay = x1 },
      JN: x0 => x0.getSupportedConstraints(),
      JO: (x0,x1) => { x0.src = x1 },
      JP: (x0,x1) => { x0.src = x1 },
      JQ: (x0,x1,x2,x3) => x0.decrypt(x1,x2,x3),
      JR: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: (o, m, a) => o[m].apply(o, a),
      KH: (x0,x1) => { x0.className = x1 },
      KI: () => new AbortController(),
      KJ: (x0,x1) => { x0.height = x1 },
      KK: x0 => x0.data,
      KL: x0 => x0.id,
      KM: (x0,x1) => { x0.width = x1 },
      KN: x0 => ({ideal: x0}),
      KO: (x0,x1) => { x0.crossOrigin = x1 },
      KP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KQ: x0 => x0.subtle,
      KR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
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
      LH: (x0,x1) => { x0.tabIndex = x1 },
      LI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      LJ: (x0,x1) => { x0.width = x1 },
      LK: (x0,x1,x2) => x0.close(x1,x2),
      LL: x0 => x0.offsetHeight,
      LM: (x0,x1) => { x0.height = x1 },
      LN: (x0,x1,x2) => ({width: x0,height: x1,deviceId: x2}),
      LO: (x0,x1) => { x0.lang = x1 },
      LP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LQ: x0 => x0.crypto,
      LR: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: () => globalThis.Symbol,
      MH: (x0,x1) => { x0.name = x1 },
      MI: (x0,x1) => globalThis.fetch(x0,x1),
      MJ: x0 => x0.style,
      MK: (x0,x1) => x0.close(x1),
      ML: x0 => x0.offsetWidth,
      MM: (x0,x1) => { x0.border = x1 },
      MN: (x0,x1) => ({width: x0,height: x1}),
      MO: (x0,x1) => { x0.type = x1 },
      MP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MQ: x0 => x0.isSecureContext,
      MR: (x0,x1) => x0.createScriptURL(x1),
      N: o => String(o),
      NB: x0 => new Uint16Array(x0),
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: (x0,x1) => x0.matchMedia(x1),
      NF: s => s.toUpperCase(),
      NG: (x0,x1) => new Intl.Segmenter(x0,x1),
      NH: (x0,x1) => { x0.placeholder = x1 },
      NI: (x0,x1) => x0.get(x1),
      NJ: (x0,x1) => { x0.src = x1 },
      NK: x0 => x0.close(),
      NL: x0 => x0.stopPropagation(),
      NM: x0 => x0.style,
      NN: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      NO: (x0,x1) => { x0.defer = x1 },
      NP: (x0,x1) => { x0.oncancel = x1 },
      NQ: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.unwrapKey(x1,x2,x3,x4,x5,x6,x7),
      NR: (x0,x1,x2) => x0.createScript(x1,x2),
      O: o => o === undefined,
      OB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: x0 => x0.Segmenter,
      OH: (x0,x1) => { x0.autocomplete = x1 },
      OI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      OJ: () => globalThis.document,
      OK: (x0,x1) => x0.send(x1),
      OL: x0 => x0.disabled,
      OM: (x0,x1) => { x0.id = x1 },
      ON: x0 => x0.deviceId,
      OO: (x0,x1) => { x0.async = x1 },
      OP: (x0,x1) => { x0.onchange = x1 },
      OQ: (x0,x1,x2,x3,x4,x5) => x0.importKey(x1,x2,x3,x4,x5),
      OR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: x0 => x0.buffer,
      PH: (x0,x1) => { x0.name = x1 },
      PI: (x0,x1) => x0.forEach(x1),
      PJ: (x0,x1) => x0.renderButton(x1),
      PK: x0 => x0.readyState,
      PL: (x0,x1) => { x0.min = x1 },
      PM: (x0,x1) => { x0.currentTime = x1 },
      PN: x0 => x0.getCapabilities(),
      PO: x0 => x0.stream,
      PP: x0 => x0.type,
      PQ: (x0,x1,x2,x3) => x0.generateKey(x1,x2,x3),
      PR: (o, p) => delete o[p],
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
      QH: (x0,x1) => { x0.placeholder = x1 },
      QI: x0 => x0.name,
      QJ: (x0,x1,x2) => x0.renderButton(x1,x2),
      QK: (x0,x1) => { x0.binaryType = x1 },
      QL: (x0,x1) => { x0.max = x1 },
      QM: x0 => x0.currentTime,
      QN: () => ({}),
      QO: x0 => x0.paused,
      QP: x0 => x0.lastModified,
      QQ: (x0,x1,x2,x3,x4) => x0.wrapKey(x1,x2,x3,x4),
      QR: (o, p, v) => o[p] = v,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: () => globalThis.window._flutter_skwasmInstance,
      RH: (x0,x1) => { x0.action = x1 },
      RI: x0 => x0.statusText,
      RJ: (x0,x1,x2,x3,x4,x5,x6,x7,x8) => ({type: x0,theme: x1,size: x2,text: x3,shape: x4,logo_alignment: x5,width: x6,locale: x7,click_listener: x8}),
      RK: (a, l) => a.length = l,
      RL: (x0,x1) => { x0.disabled = x1 },
      RM: (x0,x1) => { x0.playbackRate = x1 },
      RN: (x0,x1) => x0.applyConstraints(x1),
      RO: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      RP: x0 => x0.name,
      RQ: (x0,x1,x2) => x0.exportKey(x1,x2),
      RR: (x0,x1) => { x0.text = x1 },
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
      SH: (x0,x1) => { x0.method = x1 },
      SI: x0 => x0.url,
      SJ: () => globalThis.google.accounts.id,
      SK: () => new FileReader(),
      SL: (x0,x1) => { x0.scrollLeft = x1 },
      SM: x0 => x0.pause(),
      SN: (x0,x1) => { x0.whiteBalanceMode = x1 },
      SO: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      SP: (x0,x1) => x0.item(x1),
      SQ: x0 => x0.sessionStorage,
      SR: (x0,x1) => { x0.text = x1 },
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
      TG: (map, o, v) => map.set(o, v),
      TH: (x0,x1) => { x0.noValidate = x1 },
      TI: x0 => x0.status,
      TJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TK: (x0,x1) => x0.readAsArrayBuffer(x1),
      TL: (x0,x1) => { x0.spellcheck = x1 },
      TM: x0 => x0.play(),
      TN: x0 => x0.whiteBalanceMode,
      TO: (x0,x1,x2) => x0.readBarcodes(x1,x2),
      TP: x0 => x0.length,
      TQ: (x0,x1) => x0.getRandomValues(x1),
      TR: x0 => x0.trustedTypes,
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.top,
      UE: (o, i) => o[i],
      UF: x0 => x0.blur(),
      UG: () => new WeakMap(),
      UH: (x0,x1) => x0.removeAttribute(x1),
      UI: x0 => x0.getReader(),
      UJ: x0 => new MutationObserver(x0),
      UK: x0 => x0.result,
      UL: (x0,x1) => { x0.disabled = x1 },
      UM: x0 => x0.message,
      UN: (x0,x1) => { x0.exposureMode = x1 },
      UO: x0 => x0.text,
      UP: x0 => x0.files,
      UQ: (x0,x1,x2,x3) => x0.encrypt(x1,x2,x3),
      UR: (x0,x1,x2) => globalThis.firebase_analytics.setUserId(x0,x1,x2),
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
      VG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      VH: x0 => x0.isConnected,
      VI: x0 => x0.read(),
      VJ: x0 => ({childList: x0}),
      VK: () => new XMLHttpRequest(),
      VL: (x0,x1) => x0.transferFromImageBitmap(x1),
      VM: (x0,x1) => x0.removeAttribute(x1),
      VN: x0 => x0.exposureMode,
      VO: x0 => x0.format,
      VP: x0 => x0.target,
      VQ: () => globalThis.removeSplashFromWeb(),
      VR: (x0,x1) => globalThis.firebase_analytics.initializeAnalytics(x0,x1),
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
      WG: x0 => x0.history,
      WH: x0 => x0.click(),
      WI: x0 => x0.value,
      WJ: (x0,x1,x2) => x0.observe(x1,x2),
      WK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      WL: (x0,x1) => x0.getContext(x1),
      WM: x0 => x0.userAgent,
      WN: (x0,x1) => { x0.focusMode = x1 },
      WO: x0 => x0.bytes,
      WP: (x0,x1) => x0.replaceChildren(x1),
      WQ: () => globalThis.Notification.permission,
      WR: (x0,x1,x2) => globalThis.firebase_analytics.setUserProperties(x0,x1,x2),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      XH: (x0,x1) => x0.getElementsByClassName(x1),
      XI: x0 => x0.done,
      XJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      XK: x0 => x0.send(),
      XL: (x0,x1) => { x0.height = x1 },
      XM: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      XN: x0 => x0.focusMode,
      XO: x0 => x0.y,
      XP: x0 => x0.click(),
      XQ: x0 => x0.message,
      XR: (x0,x1,x2,x3) => globalThis.firebase_analytics.logEvent(x0,x1,x2,x3),
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      YH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      YI: x0 => x0.cancel(),
      YJ: x0 => new ResizeObserver(x0),
      YK: x0 => x0.type,
      YL: (x0,x1) => { x0.width = x1 },
      YM: (x0,x1) => x0.key(x1),
      YN: x0 => x0.enumerateDevices(),
      YO: x0 => x0.x,
      YP: (x0,x1) => { x0.accept = x1 },
      YQ: x0 => x0.code,
      YR: x0 => x0.close(),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: o => Object.keys(o),
      ZH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      ZI: x0 => x0.body,
      ZJ: (x0,x1) => x0.observe(x1),
      ZK: x0 => x0.response,
      ZL: x0 => x0.height,
      ZM: x0 => x0.length,
      ZN: x0 => x0.deviceId,
      ZO: x0 => x0.bottomLeft,
      ZP: (x0,x1) => { x0.multiple = x1 },
      ZQ: x0 => ({vapidKey: x0}),
      ZR: x0 => x0.disconnect(),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: x0 => x0.state,
      aH: (x0,x1) => x0.dispatchEvent(x1),
      aI: x0 => x0.headers,
      aJ: x0 => x0.disconnect(),
      aK: (x0,x1) => { x0.responseType = x1 },
      aL: x0 => x0.width,
      aM: (x0,x1) => x0.canShare(x1),
      aN: x0 => x0.kind,
      aO: x0 => x0.bottomRight,
      aP: (x0,x1) => { x0.type = x1 },
      aQ: (x0,x1) => globalThis.firebase_messaging.getToken(x0,x1),
      aR: x0 => x0.resume(),
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
      bG: x0 => x0.state,
      bH: (x0,x1) => x0.createEvent(x1),
      bI: x0 => x0.signal,
      bJ: x0 => x0.height,
      bK: x0 => x0.vendor,
      bL: x0 => x0.rasterEndMilliseconds,
      bM: (x0,x1) => x0.share(x1),
      bN: x0 => x0.facingMode,
      bO: x0 => x0.topRight,
      bP: (x0,x1) => x0.getAttribute(x1),
      bQ: x0 => x0.link,
      bR: x0 => x0.state,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: (x0,x1) => x0.go(x1),
      cH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      cI: (x0,x1) => x0.revokeObjectURL(x1),
      cJ: x0 => x0.width,
      cK: x0 => x0.navigator,
      cL: x0 => x0.rasterStartMilliseconds,
      cM: (x0,x1) => ({files: x0,text: x1}),
      cN: x0 => x0.mediaDevices,
      cO: x0 => x0.topLeft,
      cP: (x0,x1) => x0.debug(x1),
      cQ: x0 => x0.analyticsLabel,
      cR: () => new AudioContext(),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: x0 => x0.hash,
      dH: x0 => x0.readText(),
      dI: (x0,x1) => { x0.src = x1 },
      dJ: x0 => x0.contentRect,
      dK: () => globalThis.window,
      dL: x0 => x0.imageBitmaps,
      dM: x0 => ({files: x0}),
      dN: () => globalThis.BarcodeDetector.getSupportedFormats(),
      dO: x0 => x0.position,
      dP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dQ: x0 => x0.image,
      dR: (x0,x1) => x0.createMediaElementSource(x1),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: x0 => x0.location,
      eH: x0 => x0.clipboard,
      eI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      eJ: (x0,x1) => x0.item(x1),
      eK: (x0,x1) => x0.createElement(x1),
      eL: x0 => x0.canvasKitMaximumSurfaces,
      eM: x0 => ({text: x0}),
      eN: (x0,x1) => x0.call(x1),
      eO: x0 => x0.isValid,
      eP: x0 => ({createScriptURL: x0}),
      eQ: x0 => x0.body,
      eR: x0 => x0.createStereoPanner(),
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
      fG: x0 => x0.search,
      fH: (x0,x1) => x0.writeText(x1),
      fI: x0 => x0.naturalHeight,
      fJ: x0 => x0.length,
      fK: (x0,x1,x2) => x0.setAttribute(x1,x2),
      fL: x0 => x0.nextSibling,
      fM: x0 => ({name: x0}),
      fN: x0 => x0.reset,
      fO: (x0,x1,x2,x3) => ({formats: x0,tryHarder: x1,tryRotate: x2,tryInvert: x3}),
      fP: (x0,x1,x2) => x0.createPolicy(x1,x2),
      fQ: x0 => x0.title,
      fR: (x0,x1) => x0.connect(x1),
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: x0 => x0.pathname,
      gH: x0 => x0.unlock(),
      gI: x0 => x0.naturalWidth,
      gJ: x0 => x0.addedNodes,
      gK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gL: (x0,x1) => x0.debug(x1),
      gM: (x0,x1) => x0.query(x1),
      gN: x0 => x0.stopContinuousDecode,
      gO: (x0,x1,x2) => ({tryHarder: x0,tryRotate: x1,tryInvert: x2}),
      gP: (x0,x1) => x0.createScriptURL(x1),
      gQ: x0 => x0.fcmOptions,
      gR: x0 => x0.destination,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: x0 => x0.parentElement,
      hH: (x0,x1) => x0.lock(x1),
      hI: x0 => x0.decode(),
      hJ: x0 => x0.firstElementChild,
      hK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hL: x0 => x0.baseURI,
      hM: x0 => x0.state,
      hN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hO: () => globalThis.ZXingWASM,
      hP: (x0,x1) => { x0.nonce = x1 },
      hQ: x0 => x0.notification,
      hR: (x0,x1) => { x0.crossOrigin = x1 },
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
      iG: (x0,x1) => x0.querySelectorAll(x1),
      iH: x0 => x0.orientation,
      iI: (x0,x1) => { x0.decoding = x1 },
      iJ: x0 => x0.src,
      iK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iL: x0 => x0.hostElement,
      iM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iN: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      iO: (x0,x1) => { x0.height = x1 },
      iP: (x0,x1) => x0.querySelectorAll(x1),
      iQ: x0 => x0.messageId,
      iR: (x0,x1) => { x0.preload = x1 },
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (d, digits) => d.toFixed(digits),
      jH: (x0,x1) => x0.querySelector(x1),
      jI: (x0,x1) => { x0.crossOrigin = x1 },
      jJ: x0 => x0.decode(),
      jK: (x0,x1) => x0.warn(x1),
      jL: x0 => x0.location,
      jM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jN: x0 => x0.text,
      jO: (x0,x1) => { x0.width = x1 },
      jP: x0 => x0.nonce,
      jQ: x0 => x0.from,
      jR: x0 => x0.length,
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
      kG: x0 => x0.maxHeight,
      kH: (x0,x1) => { x0.title = x1 },
      kI: (x0,x1) => x0.createObjectURL(x1),
      kJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      kK: (x0,x1) => x0.log(x1),
      kL: (x0,x1) => x0.getModifierState(x1),
      kM: (x0,x1,x2) => x0.getCurrentPosition(x1,x2),
      kN: x0 => x0.barcodeFormat,
      kO: x0 => x0.height,
      kP: (x0,x1) => { x0.src = x1 },
      kQ: x0 => x0.collapseKey,
      kR: x0 => x0.getReader(),
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      lG: x0 => x0.maxWidth,
      lH: (x0,x1) => x0.vibrate(x1),
      lI: x0 => x0.URL,
      lJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      lK: () => globalThis.console,
      lL: x0 => x0.metaKey,
      lM: () => globalThis.Notification.requestPermission(),
      lN: x0 => x0.rawBytes,
      lO: x0 => x0.width,
      lP: x0 => x0.trustedTypes,
      lQ: x0 => x0.data,
      lR: x0 => x0.value,
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      mG: x0 => x0.minHeight,
      mH: x0 => x0.arrayBuffer(),
      mI: x0 => new Blob(x0),
      mJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      mK: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      mL: x0 => x0.altKey,
      mM: x0 => ({video: x0}),
      mN: x0 => x0.y,
      mO: (x0,x1) => { x0.srcObject = x1 },
      mP: x0 => x0.trustedTypes,
      mQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mR: x0 => x0.done,
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
      nG: x0 => x0.minWidth,
      nH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      nI: x0 => x0.close(),
      nJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nK: x0 => x0.detail,
      nL: x0 => x0.ctrlKey,
      nM: (x0,x1) => x0.getUserMedia(x1),
      nN: x0 => x0.x,
      nO: x0 => ({willReadFrequently: x0}),
      nP: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      nQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nR: x0 => x0.read(),
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: () => typeof dartUseDateNowForTicks !== "undefined",
      oG: (x0,x1) => x0.removeProperty(x1),
      oH: x0 => x0.status,
      oI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      oJ: x0 => x0.send(),
      oK: () => globalThis.document,
      oL: x0 => x0.isComposing,
      oM: x0 => x0.getVideoTracks(),
      oN: x0 => x0.resultPoints,
      oO: (x0,x1,x2) => x0.getContext(x1,x2),
      oP: x0 => { globalThis.onGoogleLibraryLoad = x0 },
      oQ: (x0,x1) => ({next: x0,error: x1}),
      oR: (x0,x1) => new OffscreenCanvas(x0,x1),
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
      pG: (x0,x1) => x0.add(x1),
      pH: (x0,x1) => x0.fetch(x1),
      pI: (x0,x1) => x0.decode(x1),
      pJ: x0 => x0.status,
      pK: x0 => x0.disconnect(),
      pL: x0 => x0.code,
      pM: x0 => x0.stop(),
      pN: x0 => x0.message,
      pO: () => new BarcodeDetector(),
      pP: (x0,x1) => x0.initialize(x1),
      pQ: (x0,x1) => globalThis.firebase_messaging.onMessage(x0,x1),
      pR: x0 => x0.assetBase,
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
      qG: x0 => x0.data,
      qH: x0 => x0.content,
      qI: x0 => x0.displayHeight,
      qJ: x0 => x0.response,
      qK: (x0,x1) => x0.assign(x1),
      qL: x0 => x0.repeat,
      qM: x0 => x0.active,
      qN: x0 => x0.videoElement,
      qO: x0 => ({formats: x0}),
      qP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qQ: x0 => globalThis.firebase_messaging.getMessaging(x0),
      qR: x0 => x0.loader,
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
      rG: (x0,x1) => { x0.scrollTop = x1 },
      rH: x0 => x0.document,
      rI: x0 => x0.displayWidth,
      rJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      rK: x0 => x0.location,
      rL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rM: x0 => ({audio: x0}),
      rN: x0 => x0.decodeContinuously,
      rO: x0 => new BarcodeDetector(x0),
      rP: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14,x15,x16) => ({client_id: x0,auto_select: x1,callback: x2,login_uri: x3,native_callback: x4,cancel_on_tap_outside: x5,prompt_parent_id: x6,nonce: x7,context: x8,state_cookie_domain: x9,ux_mode: x10,allowed_parent_origin: x11,intermediate_iframe_close_callback: x12,itp_support: x13,login_hint: x14,hd: x15,use_fedcm_for_prompt: x16}),
      rQ: x0 => globalThis.firebase_core.getApp(x0),
      rR: () => globalThis._flutter,
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      sH: x0 => new WeakRef(x0),
      sI: x0 => x0.duration,
      sJ: (x0,x1) => { x0.responseType = x1 },
      sK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sL: (x0,x1) => { x0.loop = x1 },
      sM: x0 => x0.getAudioTracks(),
      sN: (x0,x1) => new ZXing.BrowserMultiFormatReader(x0,x1),
      sO: (x0,x1) => x0.detect(x1),
      sP: x0 => x0.error,
      sQ: () => globalThis.firebase_core.getApp(),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: x0 => x0.now(),
      tG: (x0,x1) => { x0.value = x1 },
      tH: x0 => x0.deref(),
      tI: x0 => x0.image,
      tJ: () => new XMLHttpRequest(),
      tK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tL: (x0,x1) => { x0.volume = x1 },
      tM: x0 => x0.permissions,
      tN: (x0,x1) => ({width: x0,height: x1}),
      tO: x0 => x0.rawValue,
      tP: x0 => x0.credential,
      tQ: x0 => x0.measurementId,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: x0 => x0.performance,
      uG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      uH: () => globalThis.WeakRef,
      uI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      uJ: (x0,x1) => x0.get(x1),
      uK: (x0,x1) => x0.postMessage(x1),
      uL: (x0,x1) => { x0.muted = x1 },
      uM: x0 => x0.geolocation,
      uN: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      uO: x0 => x0.format,
      uP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uQ: x0 => x0.appId,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new Intl.Locale(x0),
      vE: (o, p, r) => o.replace(p, () => r),
      vF: x0 => new Uint8Array(x0),
      vG: (x0,x1) => { x0.value = x1 },
      vH: (map, o) => map.get(o),
      vI: x0 => new window.ImageDecoder(x0),
      vJ: x0 => x0.body,
      vK: x0 => x0.controller,
      vL: x0 => x0.load(),
      vM: x0 => x0.mediaDevices,
      vN: x0 => x0.facingMode,
      vO: x0 => x0.y,
      vP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vQ: x0 => x0.messagingSenderId,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => x0.region,
      wE: (o, p, r) => o.replaceAll(p, () => r),
      wF: (x0,x1,x2) => x0.slice(x1,x2),
      wG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      wH: x0 => x0.debugSkipFontRetryDelay,
      wI: x0 => x0.name,
      wJ: x0 => x0.headers,
      wK: x0 => x0.serviceWorker,
      wL: (x0,x1) => { x0.src = x1 },
      wM: x0 => x0.baseURI,
      wN: x0 => x0.height,
      wO: x0 => x0.x,
      wP: (x0,x1,x2) => ({enableHighAccuracy: x0,timeout: x1,maximumAge: x2}),
      wQ: x0 => x0.storageBucket,
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
      xG: x0 => x0.value,
      xH: (x0,x1,x2) => x0.set(x1,x2),
      xI: x0 => x0.repetitionCount,
      xJ: o => o.byteLength,
      xK: (x0,x1) => x0.getItem(x1),
      xL: x0 => x0.message,
      xM: x0 => x0.document,
      xN: x0 => x0.width,
      xO: x0 => x0.cornerPoints,
      xP: (x0,x1,x2,x3) => x0.getCurrentPosition(x1,x2,x3),
      xQ: x0 => x0.databaseURL,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: (x0,x1) => x0.adoptText(x1),
      yG: x0 => x0.selectionDirection,
      yH: x0 => x0.fontFallbackBaseUrl,
      yI: x0 => x0.frameCount,
      yJ: (x0,x1) => x0.getRandomValues(x1),
      yK: x0 => x0.localStorage,
      yL: x0 => x0.code,
      yM: (x0,x1) => { x0.transform = x1 },
      yN: x0 => x0.attachStreamToVideo,
      yO: x0 => x0.body,
      yP: x0 => x0.message,
      yQ: x0 => x0.authDomain,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: x0 => x0.first(),
      zG: x0 => x0.selectionStart,
      zH: (handle) => clearInterval(handle),
      zI: x0 => x0.selectedTrack,
      zJ: () => globalThis.crypto,
      zK: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      zL: x0 => x0.error,
      zM: x0 => x0.getSettings(),
      zN: () => new Map(),
      zO: x0 => globalThis.URL.revokeObjectURL(x0),
      zP: x0 => x0.code,
      zQ: x0 => x0.projectId,

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
