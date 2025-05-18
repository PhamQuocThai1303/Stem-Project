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
import { defineRGBBlocks } from '../../customBlock/RGBBlock';
import { FaUpload, FaStop, FaDownload } from 'react-icons/fa';

function App() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [response, setResponse] = useState("");
  const [workspace, setWorkspace] = useState<Blockly.Workspace | null>(null);

  const {t} = useTranslation()

  useEffect(() => {
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
    defineLCDBlocks();
    defineRGBBlocks();
  }, []);

  const onWorkspaceChange = useCallback((workspace: Blockly.Workspace) => {
    setWorkspace(workspace);
    try {
      const state = Blockly.serialization.workspaces.save(workspace);
      if (state && state.blocks && state.blocks.blocks && state.blocks.blocks.length > 0) {
        localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
      }
      
      const code = pythonGenerator.workspaceToCode(workspace);
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error saving workspace:', error);
    }
  }, []);

  const onJsonChange = useCallback((newJson: object) => {
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

    const containsSensorBlocks = (code: string) => {
    return code.includes("import DHT") 
    || code.includes("import SONAR") 
    || code.includes("import BUTTON") 
    || code.includes("import SWITCH");
    }
   
  const handleSave = async () => {
    try {
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const isSensor = containsSensorBlocks(generatedCode);

      const uploadPromise = fetch(`http://localhost:3000/api/upload/${connectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: generatedCode,
          isSensor: isSensor
        }),
      });

      toast.info("Đang tải lên và thực thi code...");
      
      uploadPromise
        .then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.detail);
            });
          }
          return response.json();
        })
        .then(result => {
          toast.success("✅ " + result.message);
        })
        .catch(error => {
          if (error instanceof Error) {
            // toast.error("❌ Lỗi khi lưu code: " + error.message);
          } else {
            toast.error("❌ Lỗi không xác định khi lưu code");
          }
        });
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

      const stopPromise = fetch(`http://localhost:3000/api/execute/${connectionId}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      toast.info("Đang dừng tiến trình...");
      
      stopPromise
        .then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.detail);
            });
          }
          return response.json();
        })
        .then(result => {
          toast.info(result.message);
        })
        .catch(error => {
          if (error instanceof Error) {
            toast.error("❌ Lỗi khi dừng thực thi: " + error.message);
          } else {
            toast.error("❌ Lỗi không xác định khi dừng thực thi");
          }
        });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("❌ Lỗi khi dừng thực thi: " + error.message);
      } else {
        toast.error("❌ Lỗi không xác định khi dừng thực thi");
      }
    }
  };

  const handleDownloadBlocks = () => {
    try {
      const workspace = Blockly.getMainWorkspace();
      
      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xml);
      
      const blob = new Blob([xmlText], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocks.xml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Lỗi khi tải xuống blocks:', error);
      toast.error('Có lỗi xảy ra khi tải xuống blocks');
    }
  };

  const handleImportBlocks = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xml';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const xmlText = event.target?.result as string;
              const workspace = Blockly.getMainWorkspace();
              
              workspace.clear();
              
              const dom = Blockly.utils.xml.textToDom(xmlText);
              Blockly.Xml.domToWorkspace(dom, workspace);
              
              toast.success('Đã tải file XML thành công!');
            } catch (error) {
              console.error('Lỗi khi đọc file XML:', error);
              toast.error('File XML không hợp lệ');
            }
          };
          reader.readAsText(file);
        } catch (error) {
          console.error('Lỗi khi đọc file:', error);
          toast.error('Có lỗi xảy ra khi đọc file');
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Lỗi khi tải file:', error);
      toast.error('Có lỗi xảy ra khi tải file');
    }
  };

  return (
    <div className='app'>
      <div className='container-f'>
        <div className="blockly-wrapper">
          <div className="blockly-container">
            <BlocklyWorkspace
              className="fill-height"
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
              initialJson={(() => {
                const saved = localStorage.getItem('blocklyWorkspace');
                if (saved) {
                  try {
                    return JSON.parse(saved);
                  } catch {
                    return ConfigFiles.INITIAL_JSON;
                  }
                }
                return ConfigFiles.INITIAL_JSON;
              })()}
            />
          </div>
        </div>

        <div className="textarea-wrapper">
          <div className="button-group">
            <button onClick={handleSave}>
              {t("Upload")}
            </button>
            <button onClick={handleStop}>
              {t("Stop")}
            </button>
            <button onClick={handleDownloadBlocks}>
              {t("Download XML")}
            </button>
            <button onClick={handleImportBlocks}>
              {t("Import XML")}
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
  );
}

export default App;
