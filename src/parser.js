class Chain {
  #input;
  #modules;

  /**
   * @param {Input} input
   * @param {Module[]} modules
   */
  constructor(input, modules) {
    this.#input = input;
    this.#modules = modules;
  }

  get input() {
    return this.#input;
  }

  set input(value) {
    console.log(`Chain input changed`);
    this.#input = value;
  }

  get modules() {
    return this.#modules;
  }

  set modules(value) {
    console.log(`Chain modules updated`);
    this.#modules = value;
  }
}

class Module {
  #name;
  #parameters;

  /**
   * @param {string} name
   * @param {Parameter[]} parameters
   */
  constructor(name, parameters) {
    this.#name = name;
    this.#parameters = parameters;
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    console.log(`Updating module name from ${this.#name} to ${value}`);
    this.#name = value;
  }

  get parameters() {
    return this.#parameters;
  }

  set parameters(value) {
    console.log(`Updating parameters for module ${this.#name}`);
    this.#parameters = value;
  }
}

class Parameter {
  #value;

  /**
   * @param {string|number} value
   */
  constructor(value) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }

  set value(newValue) {
    console.log(`Parameter value changed from ${this.#value} to ${newValue}`);
    this.#value = newValue;
  }
}

class Input {
  #cv;
  #gt;

  /**
   * @param {Peripheral} cv
   * @param {Peripheral} gt
   */
  constructor(cv, gt) {
    this.#cv = cv;
    this.#gt = gt;
  }

  get cv() {
    return this.#cv;
  }

  set cv(value) {
    console.log(`Input CV changed`);
    this.#cv = value;
  }

  get gt() {
    return this.#gt;
  }

  set gt(value) {
    console.log(`Input GT changed`);
    this.#gt = value;
  }
}

class Source {
  #module;
  #chain;

  /**
   *
   * @param {number} module
   * @param {number} chain
   */
  constructor(module, chain) {
    this.#module = module;
    this.#chain = chain;
  }

  get module() {
    return this.#module;
  }

  set module(value) {
    console.log(`Source module changed from ${this.#module} to ${value}`);
    this.#module = value;
  }

  get chain() {
    return this.#chain;
  }

  set chain(value) {
    console.log(`Source chain changed from ${this.#chain} to ${value}`);
    this.#chain = value;
  }
}

class Peripheral {
  #pid;
  #channel;

  /**
   *
   * @param {number} pid
   * @param {number} channel
   */
  constructor(pid, channel) {
    this.#pid = pid;
    this.#channel = channel;
  }

  get pid() {
    return this.#pid;
  }

  set pid(value) {
    console.log(`Peripheral PID changed from ${this.#pid} to ${value}`);
    this.#pid = value;
  }

  get channel() {
    return this.#channel;
  }

  set channel(value) {
    console.log(`Peripheral channel changed from ${this.#channel} to ${value}`);
    this.#channel = value;
  }
}

class Out {
  #source;
  #destination;

  /**
   * @param {{cv:{module:number,chain:number},gt:{module:number,chain:number}}} source
   * @param {{pid:number,channel:number}} destination
   */
  constructor(source, destination) {
    this.#source = {
      cv: new Source(source.cv.module, source.cv.chain),
      gt: new Source(source.gt.module, source.gt.chain),
    };
    this.#destination = new Peripheral(destination.pid, destination.channel);
  }

  get source() {
    return this.#source;
  }

  set source(value) {
    if (!(value instanceof Source)) {
      throw new TypeError("Source must be an instance of Source");
    }
    console.log(`Out source changed`);
    this.#source = value;
  }

  get destination() {
    return this.#destination;
  }

  set destination(value) {
    if (!(value instanceof Peripheral)) {
      throw new TypeError("Destination must be an instance of Peripheral");
    }
    console.log(`Out destination changed`);
    this.#destination = value;
  }
}

function parseModules(modulePart) {
  const modules = [];
  const basicModuleRegex = /^([a-zA-Z]+)(\d*)/;

  modulePart.split(",").forEach((tempModule) => {
    let moduleName = tempModule.match(basicModuleRegex)[1];
    let params =
      tempModule.slice(moduleName.length).match(/\d+|\[[^\]]+\]/g) || [];

    const parameters = params.map((param) => {
      if (param.startsWith("[")) {
        return new Parameter(param.slice(1, -1));
      } else {
        return new Parameter(isNaN(param) ? param : parseInt(param));
      }
    });

    modules.push(new Module(moduleName, parameters));
  });

  return modules;
}

/**
 * @param {RegExpMatchArray} match
 */
function parseInputSetting(match) {
  return match
    ? {
        pid: match[1] ? parseInt(match[1]) : null,
        ch: match[2] ? parseInt(match[2]) : null,
      }
    : { pid: null, ch: null };
}

function parseChain(part) {
  const [inputPart, modulePart] = part.split(">");
  const inputSettings = {
    cv: parseInputSetting(inputPart.match(/cv_?(\d*):?(\d*)/)),
    gt: parseInputSetting(inputPart.match(/gt_?(\d*):?(\d*)/)),
  };
  const input = new Input(
    new Peripheral(inputSettings.cv.ch, inputSettings.cv.pid),
    new Peripheral(inputSettings.gt.ch, inputSettings.gt.pid)
  );
  const modules = parseModules(modulePart);

  return new Chain(input, modules);
}

function parseOutput(part) {
  const [, cvModule, cvChain, gtModule, gtChain, pid, channel] =
    part.split(":");

  return new Out(
    {
      cv: { module: parseInt(cvModule), chain: parseInt(cvChain) },
      gt: { module: parseInt(gtModule), chain: parseInt(gtChain) },
    },
    {
      pid: parseInt(pid),
      channel: parseInt(channel),
    }
  );
}

export function parseInput(inputString) {
  const parts = inputString.split(";");
  /**@type {{chains:Chain[],outs:Out[]}} */
  const result = { chains: [], outs: [] };

  parts.forEach((part) => {
    if (part.includes(">")) {
      result.chains.push(parseChain(part));
    } else if (part.startsWith("out")) {
      result.outs.push(parseOutput(part));
    }
  });

  return result;
}
