import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import { javascriptGenerator } from 'blockly/javascript';

export const defineTimeBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "time_delay",
        "message0": "Khối chờ %1 giây",
        "args0": [
          {
            "type": "field_number",
            "name": "PIN",
            "value": 0,
            "min": 0,
            "max": 100
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        // "tooltip": "Tắt LED"
      },
      {
        "type": "time_now",
        "message0": "Thời gian hiện tại",
        "output": "Number",
        "colour": 160,
        "tooltip": "Trả về thời gian hiện tại (epoch time)",
        "helpUrl": ""
      },
      {
        "type": "time_process",
        "message0": "Thời gian tiến trình",
        "output": "Number",
        "colour": 160,
        "tooltip": "Trả về thời gian tiến trình bắt đầu chạy",
        "helpUrl": ""
      },
      {
        "type": "time_thread",
        "message0": "Thời gian luồng CPU",
        "output": "Number",
        "colour": 160,
        "tooltip": "Trả về thời gian tiến trình bắt đầu chạy",
        "helpUrl": ""
      },
      {
        "type": "time_perf",
        "message0": "Thời gian hoạt động",
        "output": "Number",
        "colour": 160,
        "tooltip": "Trả về thời gian tiến trình bắt đầu chạy",
        "helpUrl": ""
      },
      {
        "type": "create_variable",
        "message0": "let %1 = %2",
        "args0": [
          {
            "type": "field_input",
            "name": "VAR_NAME",
            "text": "a"
          },
          {
            "type": "input_value",
            "name": "VALUE"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Tạo biến mới",
        "helpUrl": ""
      }
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['time_delay'] = function(block: Block) {
    const pin = block.getFieldValue('PIN');
    return `time.sleep(${pin})\n`;
  };

  pythonGenerator.forBlock['time_now'] = function () {
    return ['time.time()', pythonGenerator.ORDER_ATOMIC];
  };

  pythonGenerator.forBlock['time_process'] = function () {
    return ['time.process_time()', pythonGenerator.ORDER_ATOMIC];
  };

  pythonGenerator.forBlock['time_thread'] = function () {
    return ['time.thread_time()', pythonGenerator.ORDER_ATOMIC];
  };
  pythonGenerator.forBlock['time_perf'] = function () {
    return ['time.perf_time()', pythonGenerator.ORDER_ATOMIC];
  };

  pythonGenerator.forBlock['create_variable'] = function (block) {
    const varName = block.getFieldValue('VAR_NAME');
    const value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || 'None';
    
    return `${varName} = ${value}\n`;
  };
  

};

export const timeToolboxConfig = {
    kind: "category",
    name: "Time Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "time_delay"
      },
      { kind: "block", type: "time_now" },
      { kind: "block", type: "time_process" },
      { kind: "block", type: "time_thread" },
      { kind: "block", type: "time_perf" },
      {
        kind: "block",
        type: "create_variable"
      }
      
    ]
  };