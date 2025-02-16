import { useCallback, useEffect, useState } from 'react';
import './App.css'
import { BlocklyWorkspace } from 'react-blockly';
import ConfigFiles from './initialContent/content';
import * as Blockly from "blockly/core";
import { pythonGenerator } from "blockly/python";
// import { useTranslation } from "react-i18next"
import { defineLEDBlocks  } from './customBlock/ledBlock';

function App() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedXml, setGeneratedXml] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  // const [toolboxConfiguration, setToolboxConfiguration] = useState<Blockly.utils.toolbox.ToolboxDefinition>(ConfigFiles.INITIAL_TOOLBOX_JSON);
  const [serialState, setSerialState] = useState<"XML" | "JSON">("XML");

  // const {t} = useTranslation()

  useEffect(() => {
    // Định nghĩa custom blocks khi component được mount
    defineLEDBlocks();
  }, []);

  const onWorkspaceChange = useCallback((workspace : Blockly.Workspace) => {
    // workspace.registerButtonCallback("myFirstButtonPressed", () => {
    //   alert("button is pressed");
    // });
    const newXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    setGeneratedXml(newXml);
    const newJson = JSON.stringify(
      Blockly.serialization.workspaces.save(workspace)
    );
    setGeneratedJson(newJson);
    const code = pythonGenerator.workspaceToCode(workspace);
    setGeneratedCode(code);
  }, []);

  const onXmlChange = useCallback((newXml : string) => {
    setGeneratedXml(newXml);
  }, []);

  const onJsonChange = useCallback((newJson : object) => {
    setGeneratedJson(JSON.stringify(newJson));
  }, []);


  return (
    <div className='app'>
      <div className='container'>
      
      <div className="blockly-wrapper">
      <div className="blockly-container">
      <BlocklyWorkspace
      key={serialState}
        className="fill-height" 
        initialXml={
          serialState === "XML" ? ConfigFiles.INITIAL_XML : undefined
        } 
        initialJson={
          serialState === "JSON" ? ConfigFiles.INITIAL_JSON : undefined
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
        onXmlChange={onXmlChange}
        onJsonChange={onJsonChange}
        />
      </div>
      </div>

      {/* <div>
      <p>{generatedJson}</p>
      </div> */}

      <div className="textarea-wrapper">
        <div className='d-flex'>
        <button
          onClick={(e) =>{
            setSerialState(
              (e.target as HTMLElement).innerText == "XML" ? "XML" : "JSON"
            )
          }
          }
        >
          {serialState == "XML" ? "JSON" : "XML"}{" "}
        </button>
        <button onClick={() =>{
          console.log(generatedXml);
          console.log(generatedJson);
          console.log(generatedCode)
          }
          }>
          Print
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
