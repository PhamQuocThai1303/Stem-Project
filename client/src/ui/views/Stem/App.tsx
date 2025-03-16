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

  const handleRunSSH = async () => {
    try {
      const res = await fetch("http://localhost:5000/run-ssh");
      const data = await res.json();
      setResponse(data.message + "\n" + data.output);
      console.log(data);
      
    } catch (error) {
      console.log(error);
      console.log(response);
      
      // setResponse("Error: " + error.message);
    }
  };

  const startMonitoring = () => {
    try {
      const eventSource = new EventSource("http://localhost:5000/monitor-data");
  
      // Xử lý dữ liệu nhận được từ SSE
      eventSource.onmessage = (event) => {
        console.log("📊 Data từ monitor-data: ", event.data);
  
        if (event.data.includes("Stopped monitoring")) {
          toast.info("⏹️ Đã dừng giám sát do không còn tiến trình nào.");
          eventSource.close(); // Dừng kết nối SSE
        } else {
          toast.success(`📊 Dữ liệu mới: ${event.data}`);
        }
      };
  
      // Xử lý lỗi SSE
      eventSource.onerror = (error) => {
        console.error("❌ Lỗi từ SSE:", error);
        toast.error("❌ Mất kết nối đến server.");
        eventSource.close(); // Đảm bảo dừng SSE nếu lỗi
      };
    } catch (error) {
      console.error("❌ Lỗi khi giám sát:", error);
      toast.error("❌ Lỗi khi bắt đầu giám sát.");
    }
  };
   
  const handleSave = async () => {
    try {
      // 🟢 Gọi API monitor-data NGAY khi gửi write-and-upload
      
  
      const response = await fetch("http://localhost:5000/write-and-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedCode }),
      });
  
      const result = await response.json();
      toast.info(result.message);
  
      if (!response.ok) throw new Error(result.message);
      // startMonitoring();
    } catch (error) {
      toast.error("❌ Lỗi khi ghi và upload: " + error.message);
    }
  };

  const handleStop = async () => {
    const response = await fetch("http://localhost:5000/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    toast.info(result.message);
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
        <button onClick={() =>{
          console.log(generatedCode)
          console.log(generatedJson);
          handleRunSSH()
          }
          }>
          Print
        </button>

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
