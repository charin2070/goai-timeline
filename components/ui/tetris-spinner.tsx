'use client';

import React, { forwardRef, useImperativeHandle } from 'react';

interface Block {
  x: number;
  y: number;
  color: string;
}

const TETRIS_SHAPES: Block[][] = [
  // I-piece (горизонтальная линия)
  [
    { x: 0, y: 1, color: 'bg-cyan-500' },
    { x: 1, y: 1, color: 'bg-cyan-500' },
    { x: 2, y: 1, color: 'bg-cyan-500' },
    { x: 3, y: 1, color: 'bg-cyan-500' },
  ],
  // O-piece (квадрат)
  [
    { x: 1, y: 0, color: 'bg-yellow-500' },
    { x: 2, y: 0, color: 'bg-yellow-500' },
    { x: 1, y: 1, color: 'bg-yellow-500' },
    { x: 2, y: 1, color: 'bg-yellow-500' },
  ],
  // T-piece
  [
    { x: 1, y: 0, color: 'bg-purple-500' },
    { x: 0, y: 1, color: 'bg-purple-500' },
    { x: 1, y: 1, color: 'bg-purple-500' },
    { x: 2, y: 1, color: 'bg-purple-500' },
  ],
  // L-piece
  [
    { x: 0, y: 0, color: 'bg-orange-500' },
    { x: 0, y: 1, color: 'bg-orange-500' },
    { x: 1, y: 1, color: 'bg-orange-500' },
    { x: 2, y: 1, color: 'bg-orange-500' },
  ],
  // S-piece
  [
    { x: 1, y: 0, color: 'bg-green-500' },
    { x: 2, y: 0, color: 'bg-green-500' },
    { x: 0, y: 1, color: 'bg-green-500' },
    { x: 1, y: 1, color: 'bg-green-500' },
  ],
];

export interface TetrisSpinnerRef {
  startDisappearingAnimation: () => void;
}

export interface TetrisSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  blockSize?: string | number;
  blockGap?: string | number;
  shape?: number; // allow to force a shape index
}

export const TetrisSpinner = forwardRef<TetrisSpinnerRef, TetrisSpinnerProps>(({
  width = '4em',
  height = '4em',
  blockSize = '0.85em',
  blockGap = '1.15em',
  shape,
  style,
  className = '',
  ...rest
}, ref) => {
  // Use deterministic initial state to prevent hydration mismatch
  const [currentShapeIndex, setCurrentShapeIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isDisappearing, setIsDisappearing] = React.useState(false);
  const [isFlickering, setIsFlickering] = React.useState(false);

  // Получаем скорость из переменной окружения, по умолчанию 300ms
  const spinnerSpeed = parseInt(process.env.NEXT_PUBLIC_SPINNER_SPEED || '300', 10);
  const animationDuration = Math.floor(spinnerSpeed / 2); // Половина времени для анимации

  // Функция для запуска анимации исчезновения
  const startDisappearingAnimation = () => {
    setIsDisappearing(true);

    // Выстраиваем в линию
    setTimeout(() => {
      setIsFlickering(true);

      // Мерцание
      const flickerInterval = setInterval(() => {
        setIsFlickering(prev => !prev);
      }, 100);

      // Исчезновение
      setTimeout(() => {
        clearInterval(flickerInterval);
        setIsVisible(false);
      }, 600);
    }, 300);
  };

  useImperativeHandle(ref, () => ({
    startDisappearingAnimation
  }));

  React.useEffect(() => {
    // Set random initial shape only on client side to prevent hydration mismatch
    if (typeof shape === 'number' && shape >= 0 && shape < TETRIS_SHAPES.length) {
      setCurrentShapeIndex(shape);
    } else {
      setCurrentShapeIndex(Math.floor(Math.random() * TETRIS_SHAPES.length));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  React.useEffect(() => {
    // Анимация появления
    const entranceTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const interval = setInterval(() => {
      if (!isDisappearing) {
        setIsAnimating(true);

        setTimeout(() => {
          setCurrentShapeIndex((prev) => {
            if (typeof shape === 'number' && shape >= 0 && shape < TETRIS_SHAPES.length) {
              return shape;
            }
            return (prev + 1) % TETRIS_SHAPES.length;
          });
          setIsAnimating(false);
        }, animationDuration);
      }
    }, spinnerSpeed);

    return () => {
      clearTimeout(entranceTimer);
      clearInterval(interval);
    };
  }, [spinnerSpeed, animationDuration, isDisappearing, shape]);

  const currentShape = TETRIS_SHAPES[currentShapeIndex];

  return (
    <div
      className={`relative transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-75'
      } ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...rest}
    >
      {/* Блоки текущей фигуры */}
      {currentShape.map((block, index) => (
        <div
          key={index}
          className={`absolute ${block.color} rounded-sm shadow-md transition-all duration-300 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${isFlickering ? 'opacity-50' : ''}`}
          style={{
            width: typeof blockSize === 'number' ? `${blockSize}px` : blockSize,
            height: typeof blockSize === 'number' ? `${blockSize}px` : blockSize,
            left: isDisappearing
              ? (typeof blockGap === 'number'
                  ? `${index * blockGap}px`
                  : `calc(${index} * ${blockGap})`)
              : (typeof blockGap === 'number'
                  ? `${block.x * blockGap}px`
                  : `calc(${block.x} * ${blockGap})`),
            top: isDisappearing
              ? (typeof blockGap === 'number'
                  ? `${1.5 * blockGap}px`
                  : `calc(1.5 * ${blockGap})`)
              : (typeof blockGap === 'number'
                  ? `${block.y * blockGap}px`
                  : `calc(${block.y} * ${blockGap})`),
            transform: isAnimating ? 'scale(0.8) opacity-50' : 'scale(1) opacity-100',
            transitionDelay: isVisible ? `${index * 50}ms` : '0ms',
          }}
        />
      ))}
    </div>
  );
});

TetrisSpinner.displayName = 'TetrisSpinner';