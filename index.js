import {EventEmitter} from "eventemitter3";

/** 
 * @template {[]} ARGS
 */
export class TypedEvent {

  /**
   * @type {EventEmitter}
   * @private
   * @readonly
   */
  _emitter;

  /**
   * @type {(string | symbol)}
   * @private
   * @readonly
   */
  _eventName;

  /**
   * @param {EventEmitter} emitter 
   * @param {EventEmitter.ValidEventTypes} eventName
   * @param {function(ARGS,function,Error)} errorReporter
   */
  constructor(emitter, eventName) {
    this._emitter = emitter;
    this._eventName = eventName;
  }

  /** @param {ARGS} args */
  emit(...args) {
    return this._emitter.emit(this._eventName, ...args);
  }

  /** @param {ARGS} args */
  safeEmit(...args) {
    return safeEmit(this._emitter, this._eventName, ...args);
  }

  /**
   * @param {(...:ARGS)=>any} handler 
   * @param {object} thisArg 
   */
  on(handler, thisArg=undefined) {
    return this._emitter.on(this._eventName, handler, thisArg);
  }

  /**
   * @param {(...:ARGS)=>any} handler
   * @param {object} thisArg 
   */
  once(handler, thisArg=undefined) {
    return this._emitter.once(this._eventName, handler, thisArg);
  }

  /**
   * @param {(...:ARGS)=>any} handler
   * @param {object} thisArg
   */
  off(handler, thisArg=undefined) {
    return this._emitter.off(this._eventName, handler, thisArg);
  }

}

/**
 * @param {EventEmitter} emitter
 * @param {EventEmitter.ValidEventTypes} eventName
 * @param {any[]} args
 */
export const safeEmit = (emitter, eventName, ...args) => {
  let listeners = emitter._events[eventName];
  if(!listeners) return false;
  if(!(listeners instanceof Array)) {
    listeners = [listeners];
  }
  for(let l of listeners) {
    if(l.once) {
      emitter.removeListener(eventName, l.fn, l.context, true);
    }
    try{
      l.fn.apply(l.context, args);
    } catch (err) {      
      const listenerError = new ListenerError(emitter, eventName, args, l.fn, l.context, l.once, err);
      if(emitter._events['listenerError'] != null) {
        safeEmit(emitter, 'listenerError', listenerError);
      } else {
        console.log(listenerError);
      }
    }
  }
  return true;
}
 

export class ListenerError extends Error {
  /** 
   * @type {EventEmitter} 
   * @readonly
   */
  emitter;

  /** 
   * @type {EventEmitter.ValidEventTypes} 
   * @readonly
   */
  eventName;

  /** 
   * @type {any[]}
   * @readonly
   */
  eventArgs;

  /**
   * @type {function}
   * @readonly
   */
  listener

  /**
   * @type {any}
   * @readonly
   */
  context

  /**
   * @type {boolean}
   * @readonly
   */
  once  

  /**
   * @type {Error}
   * @readonly
   */
  cause  

  /**
   * 
   * @param {EventEmitter} emitter 
   * @param {EventEmitter.ValidEventTypes} eventName 
   * @param {any[]} eventArgs 
   * @param {function} listener 
   * @param {any} context 
   * @param {boolean} once 
   * @param {Error} cause 
   */
  constructor(emitter, eventName, eventArgs, listener, context, once, cause) {
    super("ListenerError", {cause:cause});
    this.emitter = emitter;
    this.eventName = eventName;
    this.eventArgs = eventArgs;
    this.listener = listener;
    this.context = context;
    this.once = once;
    this.cause = cause;
  }
}