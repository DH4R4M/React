import React, { useRef, useState, useEffect } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'
  const [history, setHistory] = useState([]); // For undo/redo functionality
  const [historyIndex, setHistoryIndex] = useState(-1); // Current position in history

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setLastPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Save the current canvas state for undo/redo
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dataURL = canvas.toDataURL();

    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, dataURL]);
    setHistoryIndex(historyIndex + 1);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    ctx.strokeStyle = tool === 'brush' ? color : '#ffffff'; // Eraser uses white color
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    setLastPos(currentPos);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousemove', draw);
    };
  }, [isDrawing, lastPos, color, lineWidth, tool]);

  // Clear the canvas
  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Undo functionality
  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const image = new Image();
    image.src = history[newIndex];
    image.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(image, 0, 0);
    };
    setHistoryIndex(newIndex);
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const image = new Image();
    image.src = history[newIndex];
    image.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(image, 0, 0);
    };
    setHistoryIndex(newIndex);
  };

  // Save canvas as image
  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_drawing.png';
    link.click();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={950}
        height={550}
        style={{ border: '1px solid black' }}
      />
      <div style={{ marginTop: '10px' }}>
        {/* Brush and Color */}
        <label htmlFor="brushColor">Brush Color: </label>
        <input
          type="color"
          id="brushColor"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <label htmlFor="brushSize" style={{ marginLeft: '10px' }}>Brush Size: </label>
        <input
          type="range"
          id="brushSize"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
        />

        {/* Tool Selection */}
        <button onClick={() => setTool('brush')} style={{ marginLeft: '10px' }}>
          Brush
        </button>
        <button onClick={() => setTool('eraser')} style={{ marginLeft: '10px' }}>
          Eraser
        </button>

        {/* Clear Canvas */}
        <button onClick={clearCanvas} style={{ marginLeft: '10px' }}>
          Clear
        </button>

        {/* Undo / Redo */}
        <button onClick={undo} style={{ marginLeft: '10px' }}>
          Undo
        </button>
        <button onClick={redo} style={{ marginLeft: '10px' }}>
          Redo
        </button>

        {/* Save Drawing */}
        <button onClick={saveCanvas} style={{ marginLeft: '10px' }}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Canvas;
