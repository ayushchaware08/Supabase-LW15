import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogOut, FolderOpen, Save } from 'lucide-react';

const CanvasPage = () => {
  const { user, signOut } = useAuth();
  const { id } = useParams();
  const [drawingId, setDrawingId] = useState<string>(id || '');
  const [activeTool, setActiveTool] = useState('brush');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [canvasData, setCanvasData] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [drawingTitle, setDrawingTitle] = useState('Untitled Drawing');
  const [isNewDrawingDialogOpen, setIsNewDrawingDialogOpen] = useState(false);
  const [newDrawingTitle, setNewDrawingTitle] = useState('');

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Create new drawing if no ID provided
  useEffect(() => {
    if (!id) {
      createNewDrawing();
    } else {
      loadDrawing(id);
    }
  }, [id]);

  const createNewDrawing = async (title?: string) => {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .insert({
          title: title || 'Untitled Drawing',
          canvas_data: [],
          created_by: user.id,
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;

      setDrawingId(data.id);
      setDrawingTitle(data.title);
      window.history.replaceState(null, '', `/canvas/${data.id}`);
      toast.success('New drawing created!');
    } catch (error) {
      console.error('Error creating drawing:', error);
      toast.error('Failed to create drawing');
    }
  };

  const loadDrawing = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setDrawingTitle(data.title);
      setCanvasData(data.canvas_data || []);
    } catch (error) {
      console.error('Error loading drawing:', error);
      toast.error('Failed to load drawing');
    }
  };

  const saveDrawing = async () => {
    if (!drawingId) return;

    try {
      const { error } = await supabase
        .from('drawings')
        .update({
          canvas_data: canvasData,
          updated_at: new Date().toISOString()
        })
        .eq('id', drawingId);

      if (error) throw error;
      toast.success('Drawing saved!');
    } catch (error) {
      console.error('Error saving drawing:', error);
      toast.error('Failed to save drawing');
    }
  };

  const exportDrawing = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${drawingTitle}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Drawing exported!');
  };

  const clearCanvas = () => {
    setCanvasData([]);
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
    }
    toast.success('Canvas cleared!');
  };

  const handleNewDrawing = () => {
    if (newDrawingTitle.trim()) {
      createNewDrawing(newDrawingTitle.trim());
      setNewDrawingTitle('');
      setIsNewDrawingDialogOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{drawingTitle}</h1>
          
          <Dialog open={isNewDrawingDialogOpen} onOpenChange={setIsNewDrawingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                New Drawing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Drawing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Drawing title"
                  value={newDrawingTitle}
                  onChange={(e) => setNewDrawingTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNewDrawing()}
                />
                <Button onClick={handleNewDrawing} className="w-full">
                  Create Drawing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Welcome, {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DrawingToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onClear={clearCanvas}
        onSave={saveDrawing}
        onExport={exportDrawing}
        onUndo={() => {}} // TODO: Implement undo
        onRedo={() => {}} // TODO: Implement redo
        activeColor={activeColor}
        onColorChange={setActiveColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        canUndo={false} // TODO: Implement undo/redo state
        canRedo={false}
        connectedUsers={connectedUsers}
      />

      {/* Canvas */}
      {drawingId && (
        <DrawingCanvas
          drawingId={drawingId}
          activeTool={activeTool}
          activeColor={activeColor}
          brushSize={brushSize}
          onCanvasDataChange={setCanvasData}
        />
      )}
    </div>
  );
};

export default CanvasPage;