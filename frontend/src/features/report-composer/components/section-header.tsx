'use client';

import React, { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeaderSection } from '@/features/report-composer/types/composer.types';

interface SectionHeaderProps {
  section: HeaderSection;

  isSelected: boolean;

  onUpdate: (id: string, changes: Partial<HeaderSection>) => void;

  onSelect: (id: string) => void;
}

export const SectionHeader: React.FC<Readonly<SectionHeaderProps>> = memo(
  function SectionHeader({ section, isSelected, onUpdate, onSelect }) {
    const handleTitleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        onUpdate(section.id, { title: e.target.value });
      },
      [section.id, onUpdate]
    );

    const handleSubtitleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        onUpdate(section.id, { subtitle: e.target.value });
      },
      [section.id, onUpdate]
    );

    const handleLogoToggle = useCallback(
      (checked: boolean): void => {
        onUpdate(section.id, { showLogo: checked });
      },
      [section.id, onUpdate]
    );

    const handleDateToggle = useCallback(
      (checked: boolean): void => {
        onUpdate(section.id, { showDate: checked });
      },
      [section.id, onUpdate]
    );

    return (
      <div
        className={cn(
          'composer-section group relative border rounded-md transition-all duration-200',
          isSelected
            ? 'border-primary/40 ring-1 ring-primary/15 bg-primary/[0.03]'
            : 'border-border/40 hover:border-border/70 bg-card/50'
        )}
        onClick={() => onSelect(section.id)}
        role="button"
        tabIndex={0}
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            {section.showLogo && (
              <div className="flex items-center gap-2 text-muted-foreground/50">
                <div className="w-8 h-8 rounded bg-muted/50 border border-border/30 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-medium">
                  Logo
                </span>
              </div>
            )}
            {section.showDate && (
              <div className="flex items-center gap-1.5 text-muted-foreground/40 ml-auto">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px] font-mono">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          <Input
            value={section.title}
            onChange={handleTitleChange}
            placeholder="Título do Relatório"
            className="text-lg font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/30"
            onClick={e => e.stopPropagation()}
          />

          <Input
            value={section.subtitle}
            onChange={handleSubtitleChange}
            placeholder="Subtítulo ou descrição"
            className="text-sm border-none bg-transparent p-0 h-auto mt-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground placeholder:text-muted-foreground/20"
            onClick={e => e.stopPropagation()}
          />

          <div className="h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mt-4" />
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isSelected ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-6 py-3 border-t border-border/20 bg-muted/20 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id={`logo-${section.id}`}
                checked={section.showLogo}
                onCheckedChange={handleLogoToggle}
              />
              <Label
                htmlFor={`logo-${section.id}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Exibir Logo
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`date-${section.id}`}
                checked={section.showDate}
                onCheckedChange={handleDateToggle}
              />
              <Label
                htmlFor={`date-${section.id}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Exibir Data
              </Label>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default SectionHeader;
