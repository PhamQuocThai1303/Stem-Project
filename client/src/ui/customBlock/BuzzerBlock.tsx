import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineBuzzerBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "Buzzer_setup",
      "message0": "Thiết lập thư viện Buzzer",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Buzzer"
    },
      {
        "type": "Buzzer_on",
        "message0": "Khối bật buzzer",
        "colour": 160,
        "tooltip": "Bật buzzer",
        "nextStatement": null,
        "previousStatement": null,
        "helpUrl": ""
      },
      {
        "type": "Buzzer_off",
        "message0": "Khối tắt buzzer",
        "colour": 160,
        "tooltip": "Tắt buzzer",
        "helpUrl": "",
        "nextStatement": null,
        "previousStatement": null,
      },
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['Buzzer_setup'] = function() {
    return "import Buzzer\n"
};

pythonGenerator.forBlock['Buzzer_on'] = function () {
    return "Buzzer.on()\n"
  };
 
  pythonGenerator.forBlock['Buzzer_off'] = function () {
    return "Buzzer.off()\n"
  };

};

export const BuzzerToolboxConfig = {
    kind: "category",
    name: "Buzzer Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "Buzzer_setup"
      },
      { kind: "block", type: "Buzzer_on" },
      { kind: "block", type: "Buzzer_off" },
    ]
  };