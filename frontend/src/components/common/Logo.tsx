import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  textClassName = 'text-lg font-headline font-bold text-[#1F3A32] leading-tight',
  subtextClassName = 'text-[10px] uppercase tracking-wider text-[#A8B5A0] font-mono block',
}) => {
  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Container background */}
        <rect width="40" height="40" rx="10" fill="#1F3A32" />
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          rx="9.25"
          stroke="#C8A96B"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />

        {/* Stylized Geometric 'T' */}
        <path
          d="M10 13.5C10 12.3954 10.8954 11.5 12 11.5H28C29.1046 11.5 30 12.3954 30 13.5V15C30 15.5523 29.5523 16 29 16H22.5V28C22.5 29.1046 21.6046 30 20.5 30H19.5C18.3954 30 17.5 29.1046 17.5 28V16H11C10.4477 16 10 15.5523 10 15V13.5Z"
          fill="url(#logo-gold-grad)"
        />

        {/* Subtle Event Sparkle Star */}
        <path
          d="M31 7.5L31.8 9.7L34 10.5L31.8 11.3L31 13.5L30.2 11.3L28 10.5L30.2 9.7L31 7.5Z"
          fill="#C8A96B"
        />

        <defs>
          <linearGradient
            id="logo-gold-grad"
            x1="10"
            y1="11.5"
            x2="30"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F2E6D0" />
            <stop offset="0.45" stopColor="#C8A96B" />
            <stop offset="1" stopColor="#A88B4E" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={textClassName}>The Xperience</span>
          <span className={subtextClassName}>AI Event Operations</span>
        </div>
      )}
    </div>
  );
};
