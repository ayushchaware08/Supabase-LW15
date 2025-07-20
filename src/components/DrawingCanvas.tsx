import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DrawingCanvasProps {
  drawingId: string;
  activeTool: string;
  activeColor: string;
  brushSize: number;
  onCanvasDataChange?: (data: any[]) => void;
}

interface DrawingEvent {
  id: string;
  type: 'start' | 'draw' | 'end' | 'shape';
  x: number;
  y: number;
  color: string;
  size: number;
  tool: string;
  shapeData?: any;
  userId: string;
  timestamp: number;
}

export const DrawingCanvas = ({ 
  drawingId, 
  activeTool, 
  activeColor, 
  brushSize,
  onCanvasDataChange 
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingEvent[]>([]);
  const [canvasData, setCanvasData] = useState<any[]>([]);
  const { user } = useAuth();

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Load existing drawing data
    loadDrawingData();
  }, [drawingId]);

  // Subscribe to real-time drawing events
  useEffect(() => {
    const channel = supabase
      .channel(`drawing-${drawingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'drawing_events',
          filter: `drawing_id=eq.${drawingId}`
        },
        (payload) => {
          const event = payload.new as any;
          if (event.user_id !== user?.id) {
            drawEvent(event.event_data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [drawingId, user?.id]);

  const loadDrawingData = async () => {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('canvas_data')
        .eq('id', drawingId)
        .single();

      if (error) throw error;

      if (data?.canvas_data) {
        setCanvasData(data.canvas_data);
        redrawCanvas(data.canvas_data);
      }
    } catch (error) {
      console.error('Error loading drawing:', error);
    }
  };

  const saveDrawingEvent = async (eventData: DrawingEvent) => {
    if (!user) return;

    try {
      await supabase
        .from('drawing_events')
        .insert({
          drawing_id: drawingId,
          user_id: user.id,
          event_type: eventData.type,
          event_data: eventData
        });
    } catch (error) {
      console.error('Error saving drawing event:', error);
    }
  };

  const redrawCanvas = (data: any[]) => {
    const context = contextRef.current;
    if (!context) return;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    
    data.forEach((item) => {
      drawEvent(item);
    });
  };

  const drawEvent = (event: DrawingEvent) => {
    const context = contextRef.current;
    if (!context) return;

    context.globalCompositeOperation = event.tool === 'eraser' ? 'destination-out' : 'source-over';
    context.strokeStyle = event.color;
    context.lineWidth = event.size;

    if (event.type === 'shape') {
      drawShape(event);
    } else if (event.type === 'draw') {
      context.lineTo(event.x, event.y);
      context.stroke();
    } else if (event.type === 'start') {
      context.beginPath();
      context.moveTo(event.x, event.y);
    }
  };

  const drawShape = (event: DrawingEvent) => {
    const context = contextRef.current;
    if (!context || !event.shapeData) return;

    const { startX, startY, endX, endY } = event.shapeData;
    
    context.beginPath();
    
    switch (event.tool) {
      case 'rectangle':
        context.rect(startX, startY, endX - startX, endY - startY);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        context.arc(startX, startY, radius, 0, 2 * Math.PI);
        break;
      case 'line':
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        break;
    }
    
    context.stroke();
  };

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!user) return;
    
    const { x, y } = getMousePos(e);
    setIsDrawing(true);
    lastPointRef.current = { x, y };

    if (['brush', 'eraser'].includes(activeTool)) {
      const event: DrawingEvent = {
        id: crypto.randomUUID(),
        type: 'start',
        x,
        y,
        color: activeColor,
        size: brushSize,
        tool: activeTool,
        userId: user.id,
        timestamp: Date.now()
      };

      drawEvent(event);
      saveDrawingEvent(event);
      setCurrentPath([event]);
    }
  }, [activeTool, activeColor, brushSize, user, getMousePos]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !user) return;

    const { x, y } = getMousePos(e);
    
    if (['brush', 'eraser'].includes(activeTool)) {
      const event: DrawingEvent = {
        id: crypto.randomUUID(),
        type: 'draw',
        x,
        y,
        color: activeColor,
        size: brushSize,
        tool: activeTool,
        userId: user.id,
        timestamp: Date.now()
      };

      drawEvent(event);
      saveDrawingEvent(event);
      setCurrentPath(prev => [...prev, event]);
    }
  }, [isDrawing, activeTool, activeColor, brushSize, user, getMousePos]);

  const stopDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !user) return;
    
    const { x, y } = getMousePos(e);
    setIsDrawing(false);

    if (['rectangle', 'circle', 'line'].includes(activeTool) && lastPointRef.current) {
      const event: DrawingEvent = {
        id: crypto.randomUUID(),
        type: 'shape',
        x,
        y,
        color: activeColor,
        size: brushSize,
        tool: activeTool,
        shapeData: {
          startX: lastPointRef.current.x,
          startY: lastPointRef.current.y,
          endX: x,
          endY: y
        },
        userId: user.id,
        timestamp: Date.now()
      };

      drawEvent(event);
      saveDrawingEvent(event);
      setCurrentPath([event]);
    }

    if (currentPath.length > 0) {
      const newCanvasData = [...canvasData, ...currentPath];
      setCanvasData(newCanvasData);
      onCanvasDataChange?.(newCanvasData);
    }
    
    setCurrentPath([]);
    lastPointRef.current = null;
  }, [isDrawing, activeTool, activeColor, brushSize, user, currentPath, canvasData, getMousePos, onCanvasDataChange]);

  return (
    <div className="flex-1 bg-background">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-border cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};