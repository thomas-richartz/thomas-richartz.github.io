class Interpreter {
  constructor() {
    this.stack = [];
    this.memory = {};
  }

  push(value) {
    this.stack.push(value);
  }

  pop() {
    return this.stack.pop();
  }

  execute() {
    // Execute the interpreter
    this.stack.forEach((value) => {
      console.log(value);
    });
  }
}

function main() {
  // Create an instance of the interpreter
  const interpreter = new Interpreter();

  // Execute the interpreter
  interpreter.execute();
}

// Call the main function
main();
