import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineFanBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "Fan_setup",
      "message0": "Thiết lập thư viện Fan",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Fan"
    },
      {
        "type": "Fan_on",
        "message0": "Khối bật quạt",
        "colour": 160,
        "tooltip": "Bật quạt",
        "nextStatement": null,
        "previousStatement": null,
        "helpUrl": ""
      },
      {
        "type": "Fan_off",
        "message0": "Khối tắt quạt",
        "colour": 160,
        "tooltip": "Tắt quạt",
        "helpUrl": "",
        "nextStatement": null,
        "previousStatement": null,
      },
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['Fan_setup'] = function() {
    return "import FAN\n"
};

pythonGenerator.forBlock['Fan_on'] = function () {
    return "FAN.on()\n"
  };
 
  pythonGenerator.forBlock['Fan_off'] = function () {
    return "FAN.off()\n"
  };

};

export const FanToolboxConfig = {
    kind: "category",
    name: "Fan Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "Fan_setup"
      },
      { kind: "block", type: "Fan_on" },
      { kind: "block", type: "Fan_off" },
    ]
  };