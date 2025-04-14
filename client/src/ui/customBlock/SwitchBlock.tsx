import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineSwitchBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "Switch_setup",
      "message0": "Thiết lập thư viện Switch",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Switch"
    },
      {
        "type": "Read_switch",
        "message0": "Khối switch số %1",
        "args0": [
          {
            "type": "field_number",
            "name": "PIN",
            "value": 1,
            "min": 1,
            "max": 2
          }
        ],
        "colour": 285,
        "tooltip": "Khối switch số %1",
        "output": "Number",
        "helpUrl": ""
      },
      
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['Switch_setup'] = function() {
    return "import SWITCH\n"
};

pythonGenerator.forBlock['Read_switch'] = function (block: Block) {
    const pin = block.getFieldValue('PIN');
    return [`SWITCH.read_switch(${pin})\n`, pythonGenerator.ORDER_ATOMIC];
  };
 
};

export const SwitchToolboxConfig = {
    kind: "category",
    name: "Switch Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "Switch_setup"
      },
      { kind: "block", type: "Read_switch" },
    ]
  };