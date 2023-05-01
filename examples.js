import { TypedEvent, safeEmit } from "./index.js";
import { EventEmitter } from "eventemitter3";

class Kitty {
  /** @readonly */
  emitter = new EventEmitter();

  /** 
   * @type {TypedEvent<[string, integer]>}
   * @readonly
   */
  eventSay = new TypedEvent(this.emitter, "say");

  /** 
   * @param {string} word 
   * @param {integer} cnt
   */
  say(word, cnt) {
    this.eventSay.safeEmit(word, cnt);
  }
}

const kitty = new Kitty();

kitty.eventSay.on((w, c) => { throw new Error('unhandled') }); // it will be ignored by safeEmit 

kitty.eventSay.once((w, c) => console.log(`once say ${w}:${typeof(w)} ${c}:${typeof(c)}`));
kitty.eventSay.once((w, c) => console.log(`on say ${w}:${typeof(w)} ${c}:${typeof(c)}`));

kitty.say("meow", 3);


//////////////

const emitter = new EventEmitter();
/** @type {TypedEvent<[string,number]>} */
const eventUpdated = new TypedEvent(emitter, 'updated');

// VSCode recognizes the event signature and higlights the types of the callback arguments
eventUpdated.on((s,i) => console.log(`str ${s} num ${i}`)); 

// VSCode shows the correct argument types of the emit
eventUpdated.emit("a", 1);

//////////////

emitter.on("evt", (v) => { throw new Error("unhandled")});
emitter.on("evt", (v) => console.log("this is fine", v));
safeEmit(emitter, "evt", 42);
console.log("no interruption")
