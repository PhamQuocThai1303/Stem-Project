/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useState } from 'react';
import './App.css'
import { BlocklyWorkspace } from 'react-blockly';
import ConfigFiles from '../../initialContent/content';
import * as Blockly from "blockly/core";
import { pythonGenerator } from "blockly/python";
import { useTranslation } from "react-i18next"
import { defineLEDBlocks  } from '../../customBlock/ledBlock';
import { toast } from 'react-toastify';
import { defineTimeBlocks } from '../../customBlock/timeBlock';
import { define7SegmentBlocks } from '../../customBlock/7SegmentBlock';
import { defineDHTBlocks } from '../../customBlock/DHTBlock';
import { defineBuzzerBlocks } from '../../customBlock/BuzzerBlock';
import { defineSonarBlocks } from '../../customBlock/SonarBlock';
import { defineServoBlocks } from '../../customBlock/ServoBlock';
import { defineSwitchBlocks } from '../../customBlock/SwitchBlock';
import { defineButtonBlocks } from '../../customBlock/ButtonBlock';
import { defineFanBlocks } from '../../customBlock/FanBlock';
import { defineCommonBlocks } from '../../customBlock/CommonBlock';
import { defineLCDBlocks } from '../../customBlock/LCDBlock';

function App() {
  const [generatedCode, setGeneratedCode] = useState("");
  // const [generatedXml, setGeneratedXml] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  // const [toolboxConfiguration, setToolboxConfiguration] = useState<Blockly.utils.toolbox.ToolboxDefinition>(ConfigFiles.INITIAL_TOOLBOX_JSON);
  // const [serialState, setSerialState] = useState<"XML" | "JSON">("XML");
  const [response, setResponse] = useState("");

  const {t} = useTranslation()

  useEffect(() => {
    // Định nghĩa custom blocks khi component được mount
    defineCommonBlocks();
    defineLEDBlocks();
    defineTimeBlocks();
    define7SegmentBlocks();
    defineDHTBlocks();
    defineBuzzerBlocks();
    defineSonarBlocks();
    defineServoBlocks();
    defineSwitchBlocks();
    defineButtonBlocks();
    defineFanBlocks();
    defineLCDBlocks()
  }, []);

  const onWorkspaceChange = useCallback((workspace : Blockly.Workspace) => {
    // workspace.registerButtonCallback("myFirstButtonPressed", () => {
    //   alert("button is pressed");
    // });
    const newJson = JSON.stringify(
      Blockly.serialization.workspaces.save(workspace)
    );
    setGeneratedJson(newJson);
    const code = pythonGenerator.workspaceToCode(workspace);
    setGeneratedCode(code);
  }, []);

  const onJsonChange = useCallback((newJson : object) => {
    setGeneratedJson(JSON.stringify(newJson));
  }, []);

  const startMonitoring = () => {
    
    try {
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const ws = new WebSocket(`ws://localhost:3000/ws/${connectionId}`);
  
      ws.onmessage = (event) => {
        try {
          console.log("📊 Data từ websocket: ", event.data);
          // Cập nhật response state với dữ liệu mới
          setResponse(prev => prev + "\n" + event.data);
        } catch (error) {
          console.error("Lỗi khi xử lý dữ liệu:", error);
          if (error instanceof Error) {
            toast.error("❌ Lỗi khi xử lý dữ liệu: " + error.message);
          }
        }
      };
  
      ws.onerror = (error) => {
        console.error("❌ Lỗi websocket:", error);
        toast.error("❌ Mất kết nối đến server.");
        ws.close();
      };

      ws.onclose = () => {
        console.log("WebSocket đã đóng");
        toast.info("⏹️ Đã dừng giám sát.");
      };

      // Cleanup function
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error("❌ Lỗi khi bắt đầu giám sát:", error);
      if (error instanceof Error) {
        toast.error("❌ Lỗi khi bắt đầu giám sát: " + error.message);
      } else {
        toast.error("❌ Lỗi không xác định khi bắt đầu giám sát");
      }
    }
  };
   
  const handleSave = async () => {
    try {
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/upload/${connectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: generatedCode
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }

      const result = await response.json();
      toast.success("✅ " + result.message);
      // startMonitoring();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("❌ Lỗi khi lưu code: " + error.message);
      } else {
        toast.error("❌ Lỗi không xác định khi lưu code");
      }
    }
  };

  const handleStop = async () => {
    try {
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/execute/${connectionId}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }

      const result = await response.json();
      toast.info(result.message);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("❌ Lỗi khi dừng thực thi: " + error.message);
      } else {
        toast.error("❌ Lỗi không xác định khi dừng thực thi");
      }
    }
  };

  return (
    <div className='app'>
      {/* <Header/> */}
      <div className='container-f'>
      <div className="blockly-wrapper">
      <div className="blockly-container">
      <BlocklyWorkspace
        className="fill-height" 
        initialJson={
          ConfigFiles.INITIAL_JSON
        }
        workspaceConfiguration={{
          grid: {
            spacing: 20,
            length: 3,
            colour: "#ccc",
            snap: true,
          },
        }}       
        toolboxConfiguration={ConfigFiles.INITIAL_TOOLBOX_JSON} 
        onWorkspaceChange={onWorkspaceChange}
        onJsonChange={onJsonChange}
        />
      </div>
      </div>

      {/* <div>
      <p>{generatedJson}</p>
      </div> */}

      <div className="textarea-wrapper">
        <div className='d-flex gap-5'>
        <button
          onClick={() =>{
            handleSave()
          }
          }
        >
          {t("Import")}
        </button>
        {/* <button onClick={() =>{
          console.log(generatedCode)
          console.log(generatedJson);
          }
          }>
          Print
        </button> */}

        <button onClick={() =>{
          handleStop()
          }
          }>
          Stop
        </button>
        </div>
      
    <textarea
      className="code-textarea"
      value={generatedCode}
      readOnly
    />
  </div>
      </div>
    </div>
  )
}

export default App
