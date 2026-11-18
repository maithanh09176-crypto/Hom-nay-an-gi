import React from 'react';
import type { DishVisualSpec } from '../types/food';

interface DishIllustrationProps {
  visual: DishVisualSpec;
  dishId: number;
  className?: string;
}

export const DishIllustration: React.FC<DishIllustrationProps> = ({
  visual,
  dishId,
  className = '',
}) => {
  const { vessel, bgFrom, bgTo, mainColor, accentColor, garnishColor, variant } = visual;
  const gradId = `dish-bg-${dishId}`;
  const tilt = (variant - 2) * 3;

  return (
    <svg
      viewBox="0 0 240 180"
      className={`w-full h-full select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgFrom} />
          <stop offset="100%" stopColor={bgTo} />
        </linearGradient>
      </defs>

      <rect width="240" height="180" fill={`url(#${gradId})`} />

      {/* Subtle decorative table grain & accent circles unique per dish */}
      <circle
        cx={36 + variant * 8}
        cy={32 + (dishId % 3) * 6}
        r={18 + (dishId % 4) * 3}
        fill="#FFFFFF"
        fillOpacity="0.45"
      />
      <circle
        cx={204 - variant * 7}
        cy={142 - (dishId % 3) * 6}
        r={24 + (dishId % 3) * 4}
        fill="#FFFFFF"
        fillOpacity="0.35"
      />

      <g transform={`rotate(${tilt} 120 94)`}>
        {vessel === 'soup-bowl' && (
          <g>
            <ellipse cx="120" cy="140" rx="54" ry="12" fill="#000000" fillOpacity="0.08" />
            <path
              d="M54 88 C54 132, 84 146, 120 146 C156 146, 186 132, 186 88 Z"
              fill="#FFFDF8"
              stroke="#5B2333"
              strokeWidth="3"
            />
            <ellipse cx="120" cy="88" rx="66" ry="20" fill="#FFF7EB" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="120" cy="90" rx="58" ry="15" fill={mainColor} fillOpacity="0.88" />
            {/* Noodles / soup swirl */}
            <path
              d="M78 90 Q98 81 118 90 T160 89"
              fill="none"
              stroke="#FFF3D6"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M84 96 Q106 89 128 96 T154 94"
              fill="none"
              stroke="#FFE7BA"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Toppings */}
            <ellipse cx="102" cy="86" rx="14" ry="8" fill={accentColor} stroke="#5B2333" strokeWidth="2" />
            <ellipse cx="136" cy="87" rx="13" ry="7.5" fill={accentColor} stroke="#5B2333" strokeWidth="2" />
            <circle cx="118" cy="82" r="5" fill={garnishColor} />
            <circle cx="148" cy="92" r="4" fill={garnishColor} />
            {/* Chopsticks */}
            <path d="M150 76 L205 38" stroke="#8C5A3C" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M158 82 L212 48" stroke="#8C5A3C" strokeWidth="4.5" strokeLinecap="round" />
            {/* Steam */}
            <path d="M96 58 Q90 48 97 38" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.8" />
            <path d="M122 52 Q116 40 124 28" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.8" />
          </g>
        )}

        {vessel === 'dry-bowl' && (
          <g>
            <ellipse cx="120" cy="138" rx="56" ry="12" fill="#000000" fillOpacity="0.08" />
            <path
              d="M52 86 C54 128, 84 142, 120 142 C156 142, 186 128, 188 86 Z"
              fill="#FFEAF0"
              stroke="#5B2333"
              strokeWidth="3"
            />
            <ellipse cx="120" cy="86" rx="68" ry="22" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="120" cy="87" rx="58" ry="16" fill="#FFF3DC" />
            <path d="M76 86 Q104 75 130 88 T164 84" fill="none" stroke={mainColor} strokeWidth="5" strokeLinecap="round" />
            <circle cx="104" cy="82" r="10" fill={accentColor} stroke="#5B2333" strokeWidth="2" />
            <circle cx="136" cy="86" r="11" fill={mainColor} stroke="#5B2333" strokeWidth="2" />
            <ellipse cx="120" cy="94" rx="16" ry="7" fill={garnishColor} />
            <path d="M148 74 L204 34" stroke="#8C5A3C" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}

        {vessel === 'rice-plate' && (
          <g>
            <ellipse cx="120" cy="138" rx="68" ry="14" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="96" rx="74" ry="40" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="120" cy="96" rx="60" ry="30" fill="#FFF7EC" />
            {/* Steamed rice mound */}
            <path d="M74 102 C74 78, 118 76, 120 102 Z" fill="#FFFFFF" stroke="#E5DDD0" strokeWidth="2" />
            {/* Protein / main */}
            <ellipse cx="142" cy="95" rx="22" ry="14" fill={mainColor} stroke="#5B2333" strokeWidth="2.5" />
            {/* Egg or side */}
            <circle cx="116" cy="110" r="11" fill="#FFFDF8" stroke="#E8DFD1" strokeWidth="2" />
            <circle cx="116" cy="110" r="5.5" fill={accentColor} />
            {/* Herbs/cucumber */}
            <circle cx="88" cy="108" r="7" fill={garnishColor} />
            <circle cx="98" cy="114" r="6" fill={garnishColor} />
          </g>
        )}

        {vessel === 'bamboo-tray' && (
          <g>
            <ellipse cx="120" cy="136" rx="72" ry="16" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="96" rx="76" ry="42" fill="#E8C794" stroke="#7A542E" strokeWidth="3" />
            <ellipse cx="120" cy="96" rx="66" ry="34" fill="#C5E8D5" fillOpacity="0.6" />
            <rect x="74" y="76" width="32" height="22" rx="6" fill="#FFFDF8" stroke="#5B2333" strokeWidth="2" />
            <rect x="114" y="72" width="24" height="20" rx="5" fill={accentColor} stroke="#5B2333" strokeWidth="2" />
            <circle cx="148" cy="96" r="13" fill={mainColor} stroke="#5B2333" strokeWidth="2" />
            <circle cx="102" cy="110" r="10" fill={garnishColor} />
            <circle cx="122" cy="108" r="10" fill="#7D548A" stroke="#5B2333" strokeWidth="2" />
          </g>
        )}

        {vessel === 'banh-mi' && (
          <g>
            <ellipse cx="120" cy="128" rx="68" ry="12" fill="#000000" fillOpacity="0.08" />
            <path
              d="M48 96 C48 68, 192 68, 192 96 C192 114, 160 122, 120 122 C80 122, 48 114, 48 96 Z"
              fill="#E5A55D"
              stroke="#5B2333"
              strokeWidth="3"
            />
            <path d="M68 82 L88 94 M104 78 L124 92 M142 80 L160 94" stroke="#B87230" strokeWidth="3" strokeLinecap="round" />
            {/* Filling peek */}
            <path d="M62 98 Q90 88 120 98 T178 96" fill="none" stroke={garnishColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="96" cy="98" r="8" fill={accentColor} />
            <circle cx="136" cy="98" r="8" fill={mainColor} />
          </g>
        )}

        {vessel === 'steamed-bun' && (
          <g>
            <ellipse cx="120" cy="134" rx="54" ry="12" fill="#000000" fillOpacity="0.08" />
            <path d="M64 114 C64 72, 176 72, 176 114 C176 128, 64 128, 64 114 Z" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <path d="M108 78 L120 68 L132 78" fill="none" stroke="#E0CFC5" strokeWidth="3" strokeLinecap="round" />
            <circle cx="104" cy="102" r="4" fill="#5B2333" />
            <circle cx="136" cy="102" r="4" fill="#5B2333" />
            <path d="M114 109 Q120 114 126 109" fill="none" stroke="#5B2333" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="94" cy="107" rx="6" ry="3.5" fill="#FFB6C1" />
            <ellipse cx="146" cy="107" rx="6" ry="3.5" fill="#FFB6C1" />
          </g>
        )}

        {vessel === 'leaf-wrap' && (
          <g>
            <ellipse cx="120" cy="134" rx="60" ry="12" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="98" rx="64" ry="34" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <rect x="66" y="78" width="52" height="22" rx="11" fill={mainColor} stroke="#5B2333" strokeWidth="2.5" transform="rotate(-8 92 89)" />
            <rect x="114" y="88" width="54" height="22" rx="11" fill={garnishColor} stroke="#5B2333" strokeWidth="2.5" transform="rotate(6 141 99)" />
            <circle cx="106" cy="112" r="9" fill={accentColor} stroke="#5B2333" strokeWidth="2" />
          </g>
        )}

        {vessel === 'sticky-rice' && (
          <g>
            <ellipse cx="120" cy="136" rx="56" ry="12" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="102" rx="60" ry="30" fill="#82B686" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="120" cy="94" rx="46" ry="22" fill={mainColor} stroke="#5B2333" strokeWidth="2.5" />
            <circle cx="106" cy="90" r="8" fill={accentColor} />
            <circle cx="132" cy="94" r="9" fill={accentColor} />
            <circle cx="120" cy="84" r="5" fill={garnishColor} />
          </g>
        )}

        {vessel === 'skillet' && (
          <g>
            <ellipse cx="120" cy="138" rx="62" ry="12" fill="#000000" fillOpacity="0.08" />
            <rect x="176" y="90" width="38" height="12" rx="6" fill="#4A3F44" stroke="#5B2333" strokeWidth="2.5" />
            <circle cx="116" cy="96" r="46" fill="#4A3F44" stroke="#2D2229" strokeWidth="3" />
            <circle cx="116" cy="96" r="38" fill="#5D5056" />
            <ellipse cx="104" cy="90" rx="18" ry="12" fill={mainColor} />
            <circle cx="132" cy="102" r="12" fill="#FFFDF8" />
            <circle cx="132" cy="102" r="6" fill={accentColor} />
            <circle cx="98" cy="110" r="6" fill={garnishColor} />
          </g>
        )}

        {vessel === 'snack-plate' && (
          <g>
            <ellipse cx="120" cy="136" rx="64" ry="13" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="98" rx="66" ry="34" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="120" cy="98" rx="54" ry="26" fill="#FFEAF0" fillOpacity="0.6" />
            <rect x="82" y="80" width="22" height="16" rx="6" fill={mainColor} stroke="#5B2333" strokeWidth="2" transform="rotate(-12 93 88)" />
            <rect x="112" y="76" width="24" height="16" rx="6" fill={mainColor} stroke="#5B2333" strokeWidth="2" transform="rotate(8 124 84)" />
            <rect x="96" y="98" width="24" height="16" rx="6" fill={accentColor} stroke="#5B2333" strokeWidth="2" />
            <circle cx="144" cy="102" r="11" fill={garnishColor} stroke="#5B2333" strokeWidth="2" />
          </g>
        )}

        {vessel === 'dessert-cup' && (
          <g>
            <ellipse cx="120" cy="144" rx="42" ry="10" fill="#000000" fillOpacity="0.08" />
            <path
              d="M78 74 L90 132 C92 140, 148 140, 150 132 L162 74 Z"
              fill="#FFFDF8"
              fillOpacity="0.88"
              stroke="#5B2333"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M84 94 L156 94 L148 130 C146 135, 94 135, 92 130 Z" fill={mainColor} fillOpacity="0.9" />
            <ellipse cx="120" cy="74" rx="42" ry="12" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <circle cx="106" cy="74" r="9" fill={accentColor} />
            <circle cx="126" cy="70" r="10" fill={garnishColor} />
            <circle cx="138" cy="76" r="7" fill="#FFB6C1" />
            <path d="M138 70 L158 36" stroke="#FFB6C1" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {vessel === 'ice-cone' && (
          <g>
            <ellipse cx="120" cy="150" rx="28" ry="8" fill="#000000" fillOpacity="0.08" />
            <path d="M92 88 L120 148 L148 88 Z" fill={accentColor} stroke="#5B2333" strokeWidth="3" strokeLinejoin="round" />
            <path d="M102 108 L138 108 M110 126 L130 126" stroke="#B87E3A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="106" cy="78" r="18" fill={mainColor} stroke="#5B2333" strokeWidth="2.5" />
            <circle cx="134" cy="78" r="18" fill={garnishColor} stroke="#5B2333" strokeWidth="2.5" />
            <circle cx="120" cy="60" r="19" fill="#FFB6C1" stroke="#5B2333" strokeWidth="2.5" />
            <circle cx="120" cy="40" r="5.5" fill="#E11D48" />
          </g>
        )}

        {vessel === 'pizza' && (
          <g>
            <ellipse cx="120" cy="138" rx="64" ry="13" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="98" rx="64" ry="42" fill="#E8B872" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="120" cy="98" rx="54" ry="34" fill="#FFD97D" stroke="#D98A3C" strokeWidth="2" />
            <path d="M120 64 L120 132 M66 98 L174 98" stroke="#D99B48" strokeWidth="2" strokeOpacity="0.55" />
            <circle cx="98" cy="84" r="8" fill={mainColor} />
            <circle cx="140" cy="86" r="8" fill={mainColor} />
            <circle cx="100" cy="112" r="7" fill={mainColor} />
            <circle cx="140" cy="110" r="7" fill={mainColor} />
            <circle cx="120" cy="98" r="5" fill={garnishColor} />
          </g>
        )}

        {vessel === 'burger' && (
          <g>
            <ellipse cx="120" cy="138" rx="54" ry="12" fill="#000000" fillOpacity="0.08" />
            <path d="M72 114 H168 C168 128, 72 128, 72 114 Z" fill="#E5A55D" stroke="#5B2333" strokeWidth="3" />
            <rect x="68" y="102" width="104" height="12" rx="6" fill={mainColor} stroke="#5B2333" strokeWidth="2.5" />
            <path d="M68 96 Q84 106 100 96 T136 96 T172 96" fill="none" stroke={garnishColor} strokeWidth="6" strokeLinecap="round" />
            <path d="M72 90 C72 56, 168 56, 168 90 Z" fill="#EAA862" stroke="#5B2333" strokeWidth="3" />
            <circle cx="104" cy="74" r="2.5" fill="#FFFDF8" />
            <circle cx="124" cy="70" r="2.5" fill="#FFFDF8" />
            <circle cx="138" cy="78" r="2.5" fill="#FFFDF8" />
          </g>
        )}

        {vessel === 'fried-chicken' && (
          <g>
            <ellipse cx="120" cy="136" rx="60" ry="12" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="98" rx="64" ry="34" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <path d="M76 92 C76 74, 114 70, 126 88 C134 98, 124 114, 102 114 C84 114, 76 104, 76 92 Z" fill={mainColor} stroke="#5B2333" strokeWidth="2.5" />
            <rect x="122" y="92" width="24" height="10" rx="5" fill="#FFF2DC" stroke="#5B2333" strokeWidth="2" transform="rotate(14 134 97)" />
            <circle cx="146" cy="84" r="14" fill={accentColor} stroke="#5B2333" strokeWidth="2.5" />
          </g>
        )}

        {vessel === 'seafood-bowl' && (
          <g>
            <ellipse cx="120" cy="138" rx="56" ry="12" fill="#000000" fillOpacity="0.08" />
            <path d="M56 88 C58 130, 86 144, 120 144 C154 144, 182 130, 184 88 Z" fill="#C5E8D5" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="120" cy="88" rx="64" ry="20" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <ellipse cx="102" cy="86" rx="14" ry="10" fill={mainColor} stroke="#5B2333" strokeWidth="2" />
            <ellipse cx="136" cy="88" rx="14" ry="10" fill={accentColor} stroke="#5B2333" strokeWidth="2" />
            <circle cx="118" cy="94" r="9" fill={mainColor} stroke="#5B2333" strokeWidth="2" />
            <path d="M90 78 Q120 72 150 80" fill="none" stroke={garnishColor} strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {vessel === 'skewer' && (
          <g>
            <ellipse cx="120" cy="136" rx="60" ry="12" fill="#000000" fillOpacity="0.08" />
            <ellipse cx="120" cy="98" rx="64" ry="34" fill="#FFFDF8" stroke="#5B2333" strokeWidth="3" />
            <path d="M62 114 L172 72" stroke="#8C5A3C" strokeWidth="4" strokeLinecap="round" />
            <path d="M70 122 L180 80" stroke="#8C5A3C" strokeWidth="4" strokeLinecap="round" />
            <rect x="88" y="88" width="22" height="16" rx="6" fill={mainColor} stroke="#5B2333" strokeWidth="2" transform="rotate(-20 99 96)" />
            <rect x="114" y="78" width="22" height="16" rx="6" fill={accentColor} stroke="#5B2333" strokeWidth="2" transform="rotate(-20 125 86)" />
            <rect x="110" y="96" width="22" height="16" rx="6" fill={mainColor} stroke="#5B2333" strokeWidth="2" transform="rotate(-20 121 104)" />
          </g>
        )}
      </g>
    </svg>
  );
};
