'use client';

import React, { useImperativeHandle, forwardRef } from 'react';
import { TetrisSpinner } from './tetris-spinner';

export interface LoadingRef {
  startDisappearing: () => void;
}

export const Loading = forwardRef<LoadingRef>((props, ref) => {
  const spinnerRef = React.useRef<{ startDisappearingAnimation: () => void }>(null);

  useImperativeHandle(ref, () => ({
    startDisappearing: () => {
      spinnerRef.current?.startDisappearingAnimation();
    }
  }));

  return (
    <div className="min-h-screen flex items-center justify-center">
      <TetrisSpinner ref={spinnerRef} />
    </div>
  );
});

Loading.displayName = 'Loading'; 