import {

    Edge,
    Node,
  } from 'reactflow';
  import { v4 as uuidv4 } from 'uuid';

export const initialNodes: Node[] = [
    {
      id: uuidv4(),
      type: 'classNode',
      position: { x: 50, y: 50 },
      data: { id: 1, images: [], name: 'Class 1' }
    },
    {
      id: uuidv4(),
      type: 'classNode',
      position: { x: 50, y: 250 },
      data: { id: 2, images: [], name: 'Class 2' }
    },
    {
      id: 'training',
      type: 'trainingNode',
      position: { x: 450, y: 150 },
      data: { classNodes: [] }
    },
    {
      id: 'preview',
      type: 'previewNode',
      position: { x: 850, y: 150 },
      data: { classNodes: [] }
    },
  ];

  export const initialEdges: Edge[] = [
    {
      id: `e${initialNodes[0].id}-training`,
      source: initialNodes[0].id,
      target: 'training',
      type: 'smoothstep',
    },
    {
      id: `e${initialNodes[1].id}-training`,
      source: initialNodes[1].id,
      target: 'training',
      type: 'smoothstep',
    },
    {
      id: 'e-training-preview',
      source: 'training',
      target: 'preview',
      type: 'smoothstep',
    },
  ];