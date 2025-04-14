import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import { javascriptGenerator } from 'blockly/javascript';

export const defineTimeBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "Time_setup",
      "message0": "Thiết lập thư viện Time",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Time"
    },
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
        "colour": 60,
        // "tooltip": "Tắt LED"
      },
      {
        "type": "time_now",
        "message0": "Thời gian hiện tại",
        "output": "Number",
        "colour": 60,
        "tooltip": "Trả về thời gian hiện tại (epoch time)",
        "helpUrl": ""
      },
      {
        "type": "time_process",
        "message0": "Thời gian tiến trình",
        "output": "Number",
        "colour": 60,
        "tooltip": "Trả về thời gian tiến trình bắt đầu chạy",
        "helpUrl": ""
      },
      {
        "type": "time_thread",
        "message0": "Thời gian luồng CPU",
        "output": "Number",
        "colour": 60,
        "tooltip": "Trả về thời gian tiến trình bắt đầu chạy",
        "helpUrl": ""
      },
      {
        "type": "time_perf",
        "message0": "Thời gian hoạt động",
        "output": "Number",
        "colour": 60,
        "tooltip": "Trả về thời gian tiến trình bắt đầu chạy",
        "helpUrl": ""
      },
      
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['Time_setup'] = function() {
    return "import time\n"
};

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
  
};

export const timeToolboxConfig = {
    kind: "category",
    name: "Time Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "Time_setup"
      },
      {
        kind: "block",
        type: "time_delay"
      },
      { kind: "block", type: "time_now" },
      { kind: "block", type: "time_process" },
      { kind: "block", type: "time_thread" },
      { kind: "block", type: "time_perf" },
      
    ]
  };