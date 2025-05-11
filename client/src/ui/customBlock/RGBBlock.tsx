import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineRGBBlocks = () => {
  // Define blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "RGB_setup",
        "message0": "Thiết lập thư viện RGB",
        "nextStatement": null,
        "previousStatement": null,
        "colour": 230,
        "tooltip": "Thiết lập thư viện RGB"
      },
    {
      "type": "RGB_start",
      "message0": "Start RGB LED",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Start RGB LED",
      "helpUrl": ""
    },
    {
      "type": "RGB_stop",
      "message0": "Stop RGB LED",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Stop RGB LED",
      "helpUrl": ""
    },
    {
      "type": "RGB_color",
      "message0": "Set RGB Color (R %1 G %2 B %3 )",
      "args0": [
        {
          "type": "input_value",
          "name": "RED",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "GREEN",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "BLUE",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Set RGB color (0-255 for each component)",
      "helpUrl": ""
    }
  ]);

  pythonGenerator.forBlock['RGB_setup'] = function() {
    return "import RGB\n"
};

  // Define Python generators
  pythonGenerator.forBlock['RGB_start'] = function() {
    return "RGB.start()\n";
  };

  pythonGenerator.forBlock['RGB_stop'] = function() {
    return "RGB.stop()\n";
  };

  pythonGenerator.forBlock['RGB_color'] = function(block: Block) {
    const red = pythonGenerator.valueToCode(block, 'RED', pythonGenerator.ORDER_ATOMIC) || '0';
    const green = pythonGenerator.valueToCode(block, 'GREEN', pythonGenerator.ORDER_ATOMIC) || '0';
    const blue = pythonGenerator.valueToCode(block, 'BLUE', pythonGenerator.ORDER_ATOMIC) || '0';
    return `RGB.color(${red}, ${green}, ${blue})\n`;
  };
};

// Export toolbox configuration
export const RGBToolboxConfig = {
  kind: "category",
  name: "RGB LED",
  colour: "160",
  contents: [
    {
        kind: "block",
        type: "RGB_setup"
      },
    {
      kind: "block",
      type: "RGB_start"
    },
    {
      kind: "block",
      type: "RGB_stop"
    },
    {
      kind: "block",
      type: "RGB_color"
    },
    
  ]
}; 