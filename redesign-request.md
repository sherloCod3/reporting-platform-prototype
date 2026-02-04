# Redesign QReports – Figma/Notion/IDE Hybrid

## Contexto

Projeto atual usa gradientes/cores vibrantes. Meta: UI neutra, content-first, inspirada em Figma + Notion + VS Code.

## Requisitos

### 1. Design System

**Substituir:**

- ❌ Gradientes (`gradient-bg`, `gradient-report-*`)
- ❌ Cores vibrantes (indigo-500, purple-600)
- ❌ Borders dashed em componentes

**Por:**

- ✅ Paleta neutra (grays 50-900)
- ✅ Accent color único: `#0066FF` (blue)
- ✅ Borders sólidas 1px
- ✅ Sombras mínimas (apenas elevação funcional)

**Referência de cores:**

```
Light: bg-white, text-gray-900, border-gray-200
Dark: bg-gray-950, text-gray-50, border-gray-800
Accent: blue-600 (substituir indigo)
```

### 2. Tipografia (Notion-style)

- Page titles: 32px bold, tracking -0.02em
- Adicionar linha decorativa fina (2px × 48px) abaixo de títulos principais
- Section headers: 14px uppercase, tracking 0.05em, text-gray-500
- Body: 14px regular

### 3. Layout IDE-Inspired

**Top Bar (altura 48px):**

- Background: `bg-background/80 backdrop-blur`
- Breadcrumb (esquerda) + Actions (centro) + Save (direita)
- Remover gradiente atual

**Sidebar (largura 56px):**

- Activity bar estilo VS Code
- Ícones verticais: Type, Table, Chart, Image
- Tooltips com atalhos (ex: "Texto (T)")
- Background: `bg-muted/30`

**Canvas:**

- Adicionar zoom controls (top-right): -, 100%, +, fit
- Grid sutil (opacity 0.03 light, 0.05 dark)
- Paper (A4) com `shadow-sm` ao invés de `shadow-xl`

**Status Bar (altura 28px):**

- Info de conexão + componentes count + selected details
- Text 12px, `text-muted-foreground`

### 4. Componentes no Canvas

**Borders:**

```tsx
// Substituir:
border-dashed border-slate-300

// Por:
border border-border bg-background
hover:border-primary/50 hover:shadow-sm
[selected]:border-primary [selected]:ring-1 [selected]:ring-primary/20
```

**Toolbar flutuante:**

- Aparecer no hover/seleção
- Background: `bg-background/95 backdrop-blur`
- Ícones 14px, spacing compacto

**Resize handle:**

- Canto inferior direito
- `bg-primary/20` 12×12px

### 5. SQL Editor Modal

**Header:**

```tsx
// Substituir gradiente por:
<div className="px-6 py-4 border-b border-border">
  <DialogTitle className="text-base font-semibold">SQL Editor</DialogTitle>
  <p className="text-xs text-muted-foreground">Componente #X</p>
</div>
```

**Layout:**

- Split 50/50 (editor | resultados)
- Separator vertical sutil
- Results header: metrics (rows, duration) em `text-xs text-muted-foreground`

### 6. Cards (Dashboard)

**Substituir:**

```tsx
// De:
<div className="gradient-report-1 h-24">

// Para:
<div className="bg-muted border-l-2 border-l-primary h-20 flex items-center px-4">
  <Icon className="w-5 h-5 text-primary" />
</div>
```

**Body:**

- Padding: 24px (p-6)
- Title: 16px semibold
- Description: 14px `text-muted-foreground`
- Action button: `variant="outline"`

---

## Arquivos Prioritários

Aplique mudanças nesta ordem:

1. **globals.css** – Atualizar CSS variables (cores, spacing)
2. **report-editor.tsx** – Top bar, canvas, sidebar, componentes
3. **dashboard-card.tsx** – Remover gradientes
4. **query-results-table.tsx** – Header minimalista
5. **app-sidebar.tsx** – Ajustar cores, remover gradiente do logo

---

## Validação

Antes de commitar, checar:

- [ ] Zero uso de `gradient-*` classes
- [ ] Cores apenas de `gray-*` e `blue-*` (accent)
- [ ] Borders todas `border-border` (sem dashed)
- [ ] Typography usa tracking/line-height especificados
- [ ] Canvas tem zoom controls funcionais
- [ ] Status bar mostra info contextual

---

## Referências

**Inspiração visual:**

- Figma canvas (zoom, grid, selection)
- Notion database views (tipografia, spacing)
- VS Code sidebar (activity bar, tooltips)

**Componentes base:**
Seguir `@cursor-qreports-ui-prompt.md` – reutilizar `Button`, `Card`, `Dialog` existentes.

---

## Output Esperado

Mostre para cada arquivo alterado:

1. Diff das mudanças principais (antes/depois)
2. Screenshot mental (descreva visual resultante)
3. Métricas: linhas alteradas, componentes afetados

Se precisar criar CSS novo, justifique por quê existing utilities não servem.

```


```
