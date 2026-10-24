import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Line,
  Polygon,
  Circle,
} from 'react-native-svg';

interface PokedexFlapProps {
  width?: number;
  height?: number;
  isInsideFace?: boolean;
}

export const PokedexFlap: React.FC<PokedexFlapProps> = ({
  width = 340,
  height = 560,
  isInsideFace = false,
}) => {
  const viewBoxWidth = 340;
  const viewBoxHeight = 560;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="flapRedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#DF112C" />
            <Stop offset="20%" stopColor="#E8203B" />
            <Stop offset="80%" stopColor="#D80B27" />
            <Stop offset="100%" stopColor="#BD0820" />
          </LinearGradient>

          <LinearGradient id="flapInsideRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#B30820" />
            <Stop offset="50%" stopColor="#C91029" />
            <Stop offset="100%" stopColor="#DC143C" />
          </LinearGradient>

          <LinearGradient id="latchGoldFlap" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF176" />
            <Stop offset="45%" stopColor="#FFD54F" />
            <Stop offset="100%" stopColor="#FFB300" />
          </LinearGradient>

          <LinearGradient id="grooveGradFlap" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#730514" />
            <Stop offset="40%" stopColor="#8C081A" />
            <Stop offset="100%" stopColor="#FF4A62" />
          </LinearGradient>

          <LinearGradient id="hingeGradFlap" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#8C091A" />
            <Stop offset="25%" stopColor="#D61833" />
            <Stop offset="60%" stopColor="#E62642" />
            <Stop offset="85%" stopColor="#C21028" />
            <Stop offset="100%" stopColor="#6E0513" />
          </LinearGradient>
        </Defs>

        {!isInsideFace ? (
          /* FRONT FACE (Closed View - Pokedex completa.png) */
          <G>
            {/* Flap Drop Shadow */}
            <Path
              d="M 14,136 L 132,136 L 196,85 L 302,85 Q 310,85 310,93 L 310,524 Q 310,540 294,540 L 30,540 Q 14,540 14,524 Z"
              fill="#000000"
              opacity={0.25}
              transform="translate(2, 3)"
            />

            {/* Main Flap Body */}
            <Path
              d="M 14,136 L 132,136 L 196,85 L 302,85 Q 310,85 310,93 L 310,524 Q 310,540 294,540 L 30,540 Q 14,540 14,524 Z"
              fill="url(#flapRedGrad)"
              stroke="#1E1E1E"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Flap Top & Left Bevel Highlight */}
            <Path
              d="M 18,522 L 18,139 L 132,139 L 196,88 L 300,88"
              fill="none"
              stroke="#FF576E"
              strokeWidth="2"
              opacity={0.7}
              strokeLinejoin="round"
            />

            {/* Flap Inset Bevel Accent Line */}
            <Path
              d="M 24,148 L 128,148 L 192,97 L 298,97 L 298,522 L 24,522 Z"
              fill="none"
              stroke="#A3081D"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Yellow Triangular Clasp on Left Edge */}
            <G>
              <Polygon
                points="42,284 62,296 42,308"
                fill="#000000"
                opacity={0.25}
                transform="translate(1, 1)"
              />
              <Polygon
                points="40,282 60,294 40,306"
                fill="url(#latchGoldFlap)"
                stroke="#1E1E1E"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <Polygon
                points="42,284 54,293 42,295"
                fill="#FFFFFF"
                opacity={0.6}
              />
            </G>

            {/* Horizontal Recessed Groove near bottom */}
            <G>
              <Rect
                x="98"
                y="450"
                width="124"
                height="9"
                rx="4.5"
                ry="4.5"
                fill="url(#grooveGradFlap)"
                stroke="#1E1E1E"
                strokeWidth="1.5"
              />
              <Line
                x1="102"
                y1="458"
                x2="218"
                y2="458"
                stroke="#FF6B7E"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </G>

            {/* Right Side Hinge Cylinder */}
            <G>
              <Rect
                x="300"
                y="80"
                width="18"
                height="446"
                rx="5"
                ry="5"
                fill="url(#hingeGradFlap)"
                stroke="#1E1E1E"
                strokeWidth="3.5"
              />
              <Line x1="300" y1="96" x2="318" y2="96" stroke="#1E1E1E" strokeWidth="2.5" />
              <Line x1="300" y1="512" x2="318" y2="512" stroke="#1E1E1E" strokeWidth="2.5" />
              <Line
                x1="307"
                y1="100"
                x2="307"
                y2="508"
                stroke="#FFA4B0"
                strokeWidth="1.8"
                opacity={0.65}
              />
              <Circle
                cx="309"
                cy="522"
                r="11"
                fill="url(#hingeGradFlap)"
                stroke="#1E1E1E"
                strokeWidth="3"
              />
              <Circle
                cx="309"
                cy="522"
                r="5"
                fill="#800615"
              />
            </G>
          </G>
        ) : (
          /* INSIDE FACE (When opened 180 degrees) */
          <G>
            <Path
              d="M 14,85 L 120,85 L 184,136 L 302,136 Q 310,136 310,144 L 310,524 Q 310,540 294,540 L 30,540 Q 14,540 14,524 Z"
              fill="url(#flapInsideRed)"
              stroke="#1E1E1E"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Secondary Inner Display / Keypad Area */}
            <Rect
              x="36"
              y="160"
              width="250"
              height="180"
              rx="12"
              ry="12"
              fill="#2A2C30"
              stroke="#1E1E1E"
              strokeWidth="3"
            />
            {/* Screen inner shine */}
            <Line x1="42" y1="166" x2="280" y2="166" stroke="#484C54" strokeWidth="1.5" />

            {/* Keypad Grid of Buttons */}
            {Array.from({ length: 10 }).map((_, i) => {
              const row = Math.floor(i / 5);
              const col = i % 5;
              return (
                <Rect
                  key={i}
                  x={44 + col * 48}
                  y={370 + row * 44}
                  width={40}
                  height={32}
                  rx={6}
                  ry={6}
                  fill="#00A8B5"
                  stroke="#1E1E1E"
                  strokeWidth="2"
                />
              );
            })}
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
