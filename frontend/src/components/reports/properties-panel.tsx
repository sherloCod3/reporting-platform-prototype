import { Component, ComponentStyle } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface PropertiesPanelProps {
  component: Component | null;
  onUpdate: (id: number, changes: Partial<Component>) => void;
}

export function PropertiesPanel({ component, onUpdate }: PropertiesPanelProps) {
  if (!component) {
    return (
      <div className="w-[300px] border-l border-border bg-card p-4 text-muted-foreground text-sm flex items-center justify-center h-full text-center">
        Selecione um componente para editar propriedades
      </div>
    );
  }

  const handleStyleChange = (
    key: keyof ComponentStyle,
    value: string | number | undefined
  ) => {
    onUpdate(component.id, {
      style: {
        ...component.style,
        [key]: value
      }
    });
  };

  const handleChange = (
    key: keyof Component,
    value: string | number | undefined
  ) => {
    onUpdate(component.id, { [key]: value });
  };

  return (
    <div className="w-[300px] border-l border-border bg-card flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2 capitalize">
          Propriedades {component.type}
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            ID: {component.id}
          </span>
        </h3>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground">
            Layout
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] mb-1 block">Posição X</Label>
              <Input
                type="number"
                value={Math.round(component.x)}
                onChange={e => handleChange('x', parseInt(e.target.value) || 0)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] mb-1 block">Posição Y</Label>
              <Input
                type="number"
                value={Math.round(component.y)}
                onChange={e => handleChange('y', parseInt(e.target.value) || 0)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] mb-1 block">Largura</Label>
              <Input
                type="number"
                value={Math.round(component.width)}
                onChange={e =>
                  handleChange('width', parseInt(e.target.value) || 0)
                }
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] mb-1 block">Altura</Label>
              <Input
                type="number"
                value={Math.round(component.height)}
                onChange={e =>
                  handleChange('height', parseInt(e.target.value) || 0)
                }
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground">
            Aparência
          </Label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Opacidade</Label>
              <span className="text-xs text-muted-foreground">
                {Math.round((component.style?.opacity ?? 1) * 100)}%
              </span>
            </div>
            <Slider
              value={[(component.style?.opacity ?? 1) * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) => handleStyleChange('opacity', val / 100)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] mb-1 block">Fundo</Label>
              <div className="flex gap-1">
                <Input
                  type="color"
                  value={component.style?.backgroundColor || '#ffffff'}
                  onChange={e =>
                    handleStyleChange('backgroundColor', e.target.value)
                  }
                  className="h-7 w-7 p-0 border-0"
                />
                <Input
                  type="text"
                  value={component.style?.backgroundColor || ''}
                  onChange={e =>
                    handleStyleChange('backgroundColor', e.target.value)
                  }
                  placeholder="None"
                  className="h-7 text-xs flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-[10px] mb-1 block">Cor da Borda</Label>
              <div className="flex gap-1">
                <Input
                  type="color"
                  value={component.style?.borderColor || '#000000'}
                  onChange={e =>
                    handleStyleChange('borderColor', e.target.value)
                  }
                  className="h-7 w-7 p-0 border-0"
                />
                <Input
                  type="text"
                  value={component.style?.borderColor || ''}
                  onChange={e =>
                    handleStyleChange('borderColor', e.target.value)
                  }
                  placeholder="None"
                  className="h-7 text-xs flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] mb-1 block">Largura da Borda</Label>
              <Input
                type="number"
                value={component.style?.borderWidth || 0}
                onChange={e =>
                  handleStyleChange(
                    'borderWidth',
                    parseInt(e.target.value) || 0
                  )
                }
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] mb-1 block">Raio</Label>
              <Input
                type="number"
                value={component.style?.borderRadius || 0}
                onChange={e =>
                  handleStyleChange(
                    'borderRadius',
                    parseInt(e.target.value) || 0
                  )
                }
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        {component.type === 'text' && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground">
                Tipografia
              </Label>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-[10px] mb-1 block">
                    Família da Fonte
                  </Label>
                  <Select
                    value={component.style?.fontFamily || 'Inter'}
                    onValueChange={val => handleStyleChange('fontFamily', val)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] mb-1 block">Tamanho (px)</Label>
                  <Input
                    type="number"
                    value={component.style?.fontSize || 14}
                    onChange={e =>
                      handleStyleChange('fontSize', parseInt(e.target.value))
                    }
                    className="h-7 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[10px] mb-1 block">Cor</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={component.style?.color || '#000000'}
                      onChange={e => handleStyleChange('color', e.target.value)}
                      className="h-7 w-7 p-0 border-0"
                    />
                    <Input
                      type="text"
                      value={component.style?.color || ''}
                      onChange={e => handleStyleChange('color', e.target.value)}
                      className="h-7 text-xs flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[10px] mb-1 block">Alinhamento</Label>
                <div className="flex bg-muted/50 p-1 rounded-md border border-border/50">
                  {['left', 'center', 'right', 'justify'].map(align => (
                    <Button
                      key={align}
                      variant={
                        component.style?.textAlign === align
                          ? 'secondary'
                          : 'ghost'
                      }
                      size="icon"
                      className="h-6 w-1/4"
                      onClick={() => handleStyleChange('textAlign', align)}
                      title={align}
                    >
                      {align === 'left' && <AlignLeft className="w-3 h-3" />}
                      {align === 'center' && (
                        <AlignCenter className="w-3 h-3" />
                      )}
                      {align === 'right' && <AlignRight className="w-3 h-3" />}
                      {align === 'justify' && (
                        <AlignJustify className="w-3 h-3" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
