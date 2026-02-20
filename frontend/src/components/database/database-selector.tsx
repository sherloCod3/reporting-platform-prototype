'use client';

import { useState } from 'react';
import { useDatabase } from '@/hooks/use-database';
import { Database, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

/** Dropdown para selecionar e alternar entre bancos de dados disponiveis. */
export function DatabaseSelector() {
  const { status, databases, isLoading, fetchDatabases, switchDatabase } =
    useDatabase();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && databases.length === 0) {
      await fetchDatabases();
    }
  };

  const handleSelectDatabase = async (database: string) => {
    if (database !== status?.database) {
      await switchDatabase(database);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 min-w-[180px] justify-between"
          disabled={!status?.connected}
        >
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="truncate">
              {status?.database || 'Select database'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel>Available Databases</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">Loading databases...</span>
          </DropdownMenuItem>
        ) : databases.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No databases found</span>
          </DropdownMenuItem>
        ) : (
          databases.map(db => (
            <DropdownMenuItem
              key={db}
              onClick={() => handleSelectDatabase(db)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{db}</span>
              {status?.database === db && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
