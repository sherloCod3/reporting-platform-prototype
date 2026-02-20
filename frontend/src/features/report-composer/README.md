# Experimental / Archived

This feature explores a **section-based, vertical document composer**.
It is **NOT** wired into production routes and does not represent
the current editing paradigm of the product.

Kept for reference and potential future extraction of UI patterns
(sidebar panel, component properties, preview rendering).

## Architecture Note

The product uses a **canvas-first, free-layout model** (`Component` with
absolute `x/y/width/height` positioning). This composer uses an incompatible
vertical-stack model (`ReportSection` with `order`). The two paradigms
cannot be merged, see the reconciliation analysis for details.
