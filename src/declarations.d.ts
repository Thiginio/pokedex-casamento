declare module 'react-dom' {
  import * as React from 'react';
  export function createPortal(children: React.ReactNode, container: Element | DocumentFragment, key?: string | null): React.ReactPortal;
}

declare module 'react-dom/client';
