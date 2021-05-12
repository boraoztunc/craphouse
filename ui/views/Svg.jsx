import React from 'react';

export { MicOffSvg, MicOnSvg };

function MicOffSvg({ stroke, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      viewBox="0 0 48 48"
      {...props}

    >
      <path
        fill="#000"
        d="M16.8 9.6a7.2 7.2 0 1114.4 0v9.6a7.2 7.2 0 01-14.4 0V9.6z"
      ></path>
      <path
        fill="#000"
        d="M26.4 35.83c8.142-1.165 14.4-8.167 14.4-16.63a2.4 2.4 0 10-4.8 0c0 6.627-5.372 12-12 12-6.627 0-12-5.373-12-12a2.4 2.4 0 10-4.8 0c0 8.463 6.259 15.465 14.4 16.63v4.97h-7.2a2.4 2.4 0 100 4.8h19.2a2.4 2.4 0 100-4.8h-7.2v-4.97z"
      ></path>
      <rect
        width="5.277"
        height="49.727"
        x="36.895"
        y="2.468"
        fill="#000"
        stroke="#fff"
        strokeWidth="2"
        rx="2.638"
        transform="rotate(35.81 36.895 2.468)"
      ></rect>
    </svg>
  );
}

function MicOnSvg({ stroke, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      viewBox="0 0 48 48"
      stroke={stroke || '#111827'}
      {...props}
    >
      <path
        fill="#fff"
        d="M16.8 9.6a7.2 7.2 0 1114.4 0v9.6a7.2 7.2 0 01-14.4 0V9.6z"
      ></path>
      <path
        fill="#fff"
        d="M26.4 35.83c8.142-1.165 14.4-8.167 14.4-16.63a2.4 2.4 0 10-4.8 0c0 6.627-5.372 12-12 12-6.627 0-12-5.373-12-12a2.4 2.4 0 10-4.8 0c0 8.463 6.259 15.465 14.4 16.63v4.97h-7.2a2.4 2.4 0 100 4.8h19.2a2.4 2.4 0 100-4.8h-7.2v-4.97z"
      ></path>
    </svg>
  );
}
