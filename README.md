# eventemitter3-typedevent
Proposal for the js event system.

There are some problems with EventEmitter and with eventemitter3 in particular
and this solution is created to solve them.

## 1. Lack of support @js-doc @event

I widely use events in my projects and I need to specify signatures for event in order to reduce bugs and speed up coding.
There is a reserved word `@event` in @jsdoc for that. Unfortunately, VSCode does not support it properly.

It tried many approaches and found a good solution. 
This is C#-like events, when every event is an object and have a strict signature.
I implemented it in the class TypedEvent. Now you can specify and use events this way:

```javascript
const emitter = new EventEmitter();
/** @type {TypedEvent<[string,number]>} */
const eventUpdated = new TypedEvent(emitter, 'updated');

// VSCode recognizes the event signature and higlights the types of the callback arguments
eventUpdated.on((s,i) => console.log(`str ${s} num ${i}`)); 

// VSCode shows the correct argument types of the emit
eventUpdated.emit("a", 1);
```

Also, the TypedEvent is compatible with the standard emitter code.
It means, you can easily refactor your project and start using TypedEvent. 
Typed event won't break the code which is still using emitter directly.

## 2. Error in any listener interupts the execution flow of the code that called the emit.

For example, this code:
```javascript
update(fields) {
  this.emitter.emit('preUpdate'); // The code may be interrupted here!
  
  // ... update model ...

  this.emitter.emit('postUpdate');
}
```

This code may be interrupted if a listener throws an error.
I think, that this behavior is wrong. 
Observer should not affect the observable object!

That is why I wrote a helper function `safeEmit`, that allows to ignore errors.

For example, this code:
```javascript

emitter.on("evt", (v) => { throw new Error("unhandled")});
emitter.on("evt", (v) => console.log("this is fine", v));

safeEmit(emitter, "evt", 42); // will continue the execution despite the error from the first listener

console.log("no interruption")

```

I also added safeEmit to TypedEvent.
