import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineDHTBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "DHT_setup",
      "message0": "Thiết lập thư viện DHT",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện DHT"
    },
      {
        "type": "DHT_T",
        "message0": "Khối nhiệt độ",
        "output": "Number",
        "colour": 160,
        "tooltip": "Trả về nhiệt độ",
        "helpUrl": ""
      },
      {
        "type": "DHT_H",
        "message0": "Khối độ ẩm",
        "output": "Number",
        "colour": 160,
        "tooltip": "Trả về độ ẩm",
        "helpUrl": ""
      },
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['DHT_setup'] = function() {
    return "import DHT\n"
};

pythonGenerator.forBlock['DHT_T'] = function () {
    return ['DHT.temperature()', pythonGenerator.ORDER_ATOMIC];
  };
 
  pythonGenerator.forBlock['DHT_H'] = function () {
    return ['DHT.humidity()', pythonGenerator.ORDER_ATOMIC];
  };

};

export const DHTToolboxConfig = {
    kind: "category",
    name: "DHT Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "DHT_setup"
      },
      { kind: "block", type: "DHT_T" },
      { kind: "block", type: "DHT_H" },
    ]
  };