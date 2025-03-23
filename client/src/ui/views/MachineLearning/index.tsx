/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  ConnectionMode,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './style.css';
import ClassNode from './components/ClassNode/ClassNode';
import TrainingNode from './components/TrainingNode/TrainingNode';
import PreviewNode from './components/PreviewNode/PreviewNode';
import { initialEdges, initialNodes } from './initialData';
import { v4 as uuidv4 } from 'uuid';

// Định nghĩa AddClassNode bên ngoài và nhận onClick qua props
const AddClassNode = ({ data }: any) => {
  return (
    <div className="add-class-node">
      <button className="add-class-button" onClick={data.onClick}>
        <span className="plus-icon">+</span>
        Add a class
      </button>
    </div>
  );
};

// Định nghĩa nodeTypes object bên ngoài component chính
const nodeTypes = {
  classNode: ClassNode,
  trainingNode: TrainingNode,
  previewNode: PreviewNode,
  addClassNode: AddClassNode,
};

const MachineLearning = () => {
  const [classCount, setClassCount] = useState(2);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const setUpDataForTraining = (newNodes: Node[])=> {
    
    const classNodes = newNodes.filter(node => node.type === 'classNode');

    setNodes(nds => {
      return nds.map(node => 
        (node.type === 'trainingNode')
          ? { ...node, data: { ...node.data, classNodes } }
          : node
      );
    });
  }

  const handleDeleteClass = useCallback((nodeId: string) => {
    
    setNodes((nds) => {
      const deletedNodeIndex = nds.findIndex(node => node.id === nodeId);
      if (deletedNodeIndex === -1) return nds;

      // Lọc ra các class nodes (không bao gồm training, preview, add-class nodes)
      const classNodes = nds.filter(node => 
        node.type === 'classNode' && node.id !== nodeId
      );

      // Lọc ra các nodes khác (training, preview, add-class)
      const otherNodes = nds.filter(node => 
        node.type !== 'classNode'
      );

      // Chỉ cập nhật lại vị trí của các class nodes còn lại
      const reorderedClassNodes = classNodes.map((node, index) => ({
        ...node,
        position: { x: 50, y: index * 200 + 50 },
        data: {
          ...node.data,
          onDelete: handleDeleteClass 
        }
      }));

      // Cập nhật lại vị trí của add-class node
      const updatedOtherNodes = otherNodes.map(node => 
        node
      );

      setUpDataForTraining([...reorderedClassNodes, ...updatedOtherNodes])
      return [...reorderedClassNodes, ...updatedOtherNodes];
    });

    setEdges((eds) => eds.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));

    setClassCount(prev => prev - 1);
    // setUpDataForTraining()
  }, [nodes]);

  const handleImageUpload = useCallback((nodeId: string, files: FileList) => {
    const imageFiles = Array.from(files);
    const imagePromises = imageFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });
    console.log(nodes);
    
    Promise.all(imagePromises).then(imageUrls => {
      setNodes(prevNodes => {
          const newNode = prevNodes.map(node => {
              if (node.id === nodeId) {
                  return {
                      ...node,
                      data: {
                          ...node.data,
                          images: [...(node.data.images || []), ...imageUrls]
                      }
                  };
              }
              return node;
          });

          console.log("Updated Nodes:", newNode); // Log sau khi cập nhật
          setUpDataForTraining(newNode);
          return newNode;
      });
  });
    
  }, [nodes]);

  const handleDeleteImage = useCallback((nodeId: string, imageIndex: number) => {
    setNodes(nds => {
      const newNode = nds.map(node => {
        if (node.id === nodeId && node.data.images) {
          const newImages = [...node.data.images];
          newImages.splice(imageIndex, 1);
          return {
            ...node,
            data: {
              ...node.data,
              images: newImages
            }
          };
        }
        return node;
      })
      setUpDataForTraining(newNode)
      return newNode;
    } 
    );
    // setUpDataForTraining()
  }, []);

  const handleAddClass = useCallback(() => {
    const newClassCount = classCount + 1;
    const newNodeId = uuidv4();
    const yPosition = classCount * 200 + 50;

    const newNode: Node = {
      id: newNodeId,
      height: 187,
      width: 350,
      type: 'classNode',
      position: { x: 50, y: yPosition },
      data: {
        id: newClassCount,
        onDelete: handleDeleteClass,
        onUpload: handleImageUpload,
        onDeleteImage: handleDeleteImage,
        images: []
      }
    };

    const newEdge: Edge = {
      id: `e${newNodeId}-training`,
      source: newNodeId,
      target: 'training',
      type: 'smoothstep',
    };
    
    setNodes((nds) => {
      setUpDataForTraining([...nds, newNode])
      return [...nds, newNode]
    });
    setEdges((eds) => [...eds, newEdge]);
    setClassCount(newClassCount);
    // setUpDataForTraining()
  }, [classCount, handleDeleteClass, handleImageUpload, handleDeleteImage]);

  const addClassNode = {
    id: 'add-class',
    type: 'addClassNode',
    position: { x: 450, y: 50 },
    data: { onClick: handleAddClass },
  };

  // Khởi tạo nodes ban đầu
  useEffect(() => {
    
    setNodes([
      ...initialNodes.map(node => 
        node.type === 'classNode' 
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                onDelete: handleDeleteClass,
                onUpload: handleImageUpload,
                onDeleteImage: handleDeleteImage,
                images: [] 
              } 
            }
          : node
      ),
      addClassNode
    ]);
    setEdges(initialEdges);
  }, []);

  useEffect(() => {
    setNodes(nds => 
      nds.map(node => 
        node.id === 'add-class' 
          ? { ...node, data: { onClick: handleAddClass } }
          : node
      )
    );
  }, [handleAddClass]);

  // useEffect(() => {
  //   console.log(99999);
    
  //   const classNodes = nodes.filter(node => node.type === 'classNode');
  //   // const hasClassNodesChanged = (prevNodes: Node[], currentClassNodes: Node[]) => {
  //   //   if (prevNodes.length !== currentClassNodes.length) return true;
  //   //   return prevNodes.some((node, index) => 
  //   //     node.id !== currentClassNodes[index].id || 
  //   //     node.data.images !== currentClassNodes[index].data.images
  //   //   );
  //   // };

  //   setNodes(nds => {
  //     // const prevClassNodes = nds
  //     //   .filter(node => node.type === 'classNode');
      
  //     // if (!hasClassNodesChanged(prevClassNodes, classNodes)) {
  //     //   return nds;
  //     // }

  //     return nds.map(node => 
  //       (node.type === 'trainingNode')
  //         ? { ...node, data: { ...node.data, classNodes } }
  //         : node
  //     );
  //   });
  // }, [classCount]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const allowedChanges = changes.filter(change => change.type !== 'remove');
      setEdges((eds) => applyEdgeChanges(allowedChanges, eds));
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const isValidConnection = (
        (params.source?.startsWith('') && params.target === 'training') ||
        (params.source === 'training' && params.target === 'preview')
      );

      if (isValidConnection) {
        setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
      }
    },
    []
  );

  return (
    <div className="machine-learning-flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        snapToGrid
        deleteKeyCode={null}
        // nodesDraggable={false}
        // nodesConnectable={false}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default MachineLearning;