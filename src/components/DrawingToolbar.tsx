import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Brush, 
  Eraser, 
  Square, 
  Circle, 
  Minus, 
  Download, 
  Save, 
  Undo, 
  Redo,
  Palette,
  Users
} from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  connectedUsers: number;
}

const colors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
];

export const DrawingToolbar = ({
  activeTool,
  onToolChange,
  onClear,
  onSave,
  onExport,
  onUndo,
  onRedo,
  activeColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  canUndo,
  canRedo,
  connectedUsers
}: DrawingToolbarProps) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-card border-b">
      {/* Drawing Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={activeTool === 'brush' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange('brush')}
        >
          <Brush className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'eraser' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange('eraser')}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'rectangle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange('rectangle')}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'circle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange('circle')}
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange('line')}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Color Picker */}
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        <div className="flex gap-1">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 ${
                activeColor === color ? 'border-ring' : 'border-muted'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
        <input
          type="color"
          value={activeColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-6 rounded border cursor-pointer"
        />
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Brush Size */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Size:</span>
        <Input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-sm w-8">{brushSize}</span>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Users className="h-4 w-4" />
        <Badge variant="secondary">{connectedUsers} online</Badge>
      </div>
    </div>
  );
};