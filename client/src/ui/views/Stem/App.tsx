import { useCallback, useEffect, useState } from 'react';
import './App.css'
import { BlocklyWorkspace } from 'react-blockly';
import ConfigFiles from '../../initialContent/content';
import * as Blockly from "blockly/core";
import { pythonGenerator } from "blockly/python";
import { useTranslation } from "react-i18next"
import { defineLEDBlocks  } from '../../customBlock/ledBlock';

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
    defineLEDBlocks();
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

   
  const handleSave = async () => {
    const response = await fetch("http://localhost:5000/write-and-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({generatedCode}),
    });

    const result = await response.json();
    alert(result.message);
  };

  const handleStop = async () => {
    const response = await fetch("http://localhost:5000/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    alert(result.message);
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
