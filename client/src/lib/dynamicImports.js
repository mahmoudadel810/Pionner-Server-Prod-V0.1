// Dynamic imports for heavy UI components to improve initial load performance

// Radix UI Components - Load on demand
export const Accordion = () => import('@radix-ui/react-accordion');
export const AlertDialog = () => import('@radix-ui/react-alert-dialog');
export const AspectRatio = () => import('@radix-ui/react-aspect-ratio');
export const Avatar = () => import('@radix-ui/react-avatar');
export const Checkbox = () => import('@radix-ui/react-checkbox');
export const Collapsible = () => import('@radix-ui/react-collapsible');
export const ContextMenu = () => import('@radix-ui/react-context-menu');
export const Dialog = () => import('@radix-ui/react-dialog');
export const DropdownMenu = () => import('@radix-ui/react-dropdown-menu');
export const HoverCard = () => import('@radix-ui/react-hover-card');
export const Label = () => import('@radix-ui/react-label');
export const Menubar = () => import('@radix-ui/react-menubar');
export const NavigationMenu = () => import('@radix-ui/react-navigation-menu');
export const Popover = () => import('@radix-ui/react-popover');
export const Progress = () => import('@radix-ui/react-progress');
export const RadioGroup = () => import('@radix-ui/react-radio-group');
export const ScrollArea = () => import('@radix-ui/react-scroll-area');
export const Select = () => import('@radix-ui/react-select');
export const Separator = () => import('@radix-ui/react-separator');
export const Slider = () => import('@radix-ui/react-slider');
export const Switch = () => import('@radix-ui/react-switch');
export const Tabs = () => import('@radix-ui/react-tabs');
export const Toggle = () => import('@radix-ui/react-toggle');
export const ToggleGroup = () => import('@radix-ui/react-toggle-group');
export const Tooltip = () => import('@radix-ui/react-tooltip');

// Other heavy components
export const EmblaCarousel = () => import('embla-carousel-react');
export const ResizablePanels = () => import('react-resizable-panels');
export const Vaul = () => import('vaul');

// Utility function to preload components
export const preloadComponent = (componentImport) => {
  return componentImport().then(module => module.default || module);
};

// Preload commonly used components after initial load
export const preloadCommonComponents = () => {
  setTimeout(() => {
    // Preload commonly used UI components
    preloadComponent(Dialog);
    preloadComponent(DropdownMenu);
    preloadComponent(Select);
    preloadComponent(Tabs);
  }, 3000);
}; 