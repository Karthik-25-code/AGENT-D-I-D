import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";
import { v4 as uuidv4 } from "uuid";

const Canvas = () => {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const socketRef = useRef(null);

  // --- 1. SETUP WEBSOCKET ---
  useEffect(() => {
    // Connect to your Python Backend
    socketRef.current = new WebSocket("ws://127.0.0.1:8000/ws/draw");

    socketRef.current.onopen = () => {
      console.log("Connected to Agent D-I-D Brain");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_stroke") {
        // Add the line from Jarvis or other users
        setLines((prev) => [...prev, data]);
      } 
      else if (data.type === "live_update") {
        // Optional: For real-time dragging (advanced)
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  // --- 2. DRAWING HANDLERS ---
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    
    // Start a new line
    const newLine = {
      id: uuidv4(),
      points: [pos.x, pos.y],
      color: "#000000", // Black for User
      strokeWidth: 5,
      agent: "user",
      type: "new_stroke"
    };

    setLines([...lines, newLine]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // Update the last line locally
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    // Force React to re-render the line
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    
    // SEND THE FINISHED STROKE TO BACKEND
    const lastLine = lines[lines.length - 1];
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // Send the full line data + "end_stroke" signal
      socketRef.current.send(JSON.stringify({
        ...lastLine,
        type: "end_stroke" 
      }));
    }
  };

  return (
    <div>
      <h2 style={{position: 'absolute', top: 10, left: 10, zIndex: 100}}>
        Agent D-I-D: <span style={{color: 'blue'}}>Jarvis Mode</span>
      </h2>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;