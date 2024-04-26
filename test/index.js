import { parseInput } from "../src/parser.js";

const inputString =
  "cv_,gt_>PTH,BCH250:[0:1];cv0:5,gt8:12>LFO;out:8:0:1:2:3:4;out:2:4:0:1:2:0";
const parsedObject = parseInput(inputString);
console.log(parsedObject);

// parsedObject.chains[0].modules[0].parameters[0].value = 3;
// parsedObject.outs[0].destination.channel = 3
// parsedObject.outs[0].source.chain = 1
