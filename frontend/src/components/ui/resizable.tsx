"use client";

import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  direction = "horizontal",
  ...props
}: React.ComponentProps<typeof Group> & {
  direction?: "horizontal" | "vertical";
}) => (
  <Group
    orientation={direction}
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className,
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative flex w-px items-center justify-center bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      // ARIA Orientation "horizontal" = Horizontal Line (for Vertical Group)
      "aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-4 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0",

      // ARIA Orientation "vertical" = Vertical Line (for Horizontal Group)
      "aria-[orientation=vertical]:h-full aria-[orientation=vertical]:w-px aria-[orientation=vertical]:after:left-1/2 aria-[orientation=vertical]:after:h-full aria-[orientation=vertical]:after:w-4 aria-[orientation=vertical]:after:-translate-x-1/2",

      className,
    )}
    {...props}>
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border transition-transform aria-[orientation=horizontal]:rotate-90">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
