import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineButtonBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "Button_setup",
      "message0": "Thiết lập thư viện Button",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Button"
    },
      {
        "type": "Read_button",
        "message0": "Khối button số %1",
        "args0": [
          {
            "type": "field_number",
            "name": "PIN",
            "value": 1,
            "min": 1,
            "max": 2
          }
        ],
        "colour": 160,
        "tooltip": "Khối button số %1",
        "output": "Number",
        "helpUrl": ""
      },
      
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['Button_setup'] = function() {
    return "import BUTTON\n"
};

pythonGenerator.forBlock['Read_button'] = function (block: Block) {
    const pin = block.getFieldValue('PIN');
    return [`BUTTON.read_button(${pin})\n`, pythonGenerator.ORDER_ATOMIC];
  };
 
};

export const ButtonToolboxConfig = {
    kind: "category",
    name: "Button Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "Button_setup"
      },
      { kind: "block", type: "Read_button" },
    ]
  };