import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Line,
  Polygon,
} from 'react-native-svg';

interface PokedexClosedProps {
  width?: number;
  height?: number;
}

// Master Unified Proportions
const POKEDEX_BODY_WIDTH = 312;
const POKEDEX_BODY_HEIGHT = 536;
const POKEDEX_BODY_X = 12;
const POKEDEX_BODY_Y = 12;
const HINGE_X = 306;

export const PokedexClosed: React.FC<PokedexClosedProps> = ({
  width = 340,
  height = 560,
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
          {/* Main Body Gradient */}
          <LinearGradient id="bodyRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E82038" />
            <Stop offset="45%" stopColor="#DC0A2D" />
            <Stop offset="100%" stopColor="#AD061E" />
          </LinearGradient>

          {/* Cover Flap Gradient */}
          <LinearGradient id="flapRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#DF112C" />
            <Stop offset="18%" stopColor="#EA223E" />
            <Stop offset="82%" stopColor="#D80B27" />
            <Stop offset="100%" stopColor="#B30820" />
          </LinearGradient>

          {/* Blue Big Lens Gradients */}
          <RadialGradient id="lensGlow" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="25%" stopColor="#64D2FF" />
            <Stop offset="65%" stopColor="#0A84FF" />
            <Stop offset="100%" stopColor="#004FB0" />
          </RadialGradient>

          <LinearGradient id="lensRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="50%" stopColor="#E2E7ED" />
            <Stop offset="100%" stopColor="#B0B8C4" />
          </LinearGradient>

          {/* Status LEDs Gradients */}
          <RadialGradient id="redLed" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFA4A4" />
            <Stop offset="40%" stopColor="#FF2D55" />
            <Stop offset="100%" stopColor="#8E001A" />
          </RadialGradient>

          <RadialGradient id="yellowLed" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFF9C4" />
            <Stop offset="40%" stopColor="#FFCC00" />
            <Stop offset="100%" stopColor="#B28900" />
          </RadialGradient>

          <RadialGradient id="greenLed" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#C8FFD4" />
            <Stop offset="40%" stopColor="#34C759" />
            <Stop offset="100%" stopColor="#146627" />
          </RadialGradient>

          {/* Hinge 3D Cylinder Gradient */}
          <LinearGradient id="hingeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#690410" />
            <Stop offset="15%" stopColor="#8F0A1B" />
            <Stop offset="35%" stopColor="#D91A34" />
            <Stop offset="60%" stopColor="#F53652" />
            <Stop offset="85%" stopColor="#C41028" />
            <Stop offset="100%" stopColor="#5E030E" />
          </LinearGradient>

          {/* Latch Golden Gradient */}
          <LinearGradient id="latchGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF59D" />
            <Stop offset="45%" stopColor="#FFD54F" />
            <Stop offset="100%" stopColor="#FFB300" />
          </LinearGradient>

          {/* Recessed Groove Inner Shadow */}
          <LinearGradient id="grooveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#5E000D" />
            <Stop offset="45%" stopColor="#7A0414" />
            <Stop offset="100%" stopColor="#FF5269" />
          </LinearGradient>
        </Defs>

        {/* 1. Main Pokédex Outer Body Chassis (Unified Dimensions) */}
        <Rect
          x={POKEDEX_BODY_X}
          y={POKEDEX_BODY_Y}
          width={POKEDEX_BODY_WIDTH}
          height={POKEDEX_BODY_HEIGHT}
          rx="26"
          ry="26"
          fill="url(#bodyRed)"
          stroke="#1E1E1E"
          strokeWidth="4"
        />

        {/* Outer Casing Left-Edge Bevel Line */}
        <Path
          d="M 20,528 L 20,136"
          fill="none"
          stroke="#8A0516"
          strokeWidth="2.5"
        />
        <Path
          d="M 22,528 L 22,136"
          fill="none"
          stroke="#FF5A70"
          strokeWidth="1.2"
          opacity={0.5}
        />

        {/* 2. Top Header Section Background */}
        <Path
          d="M 14,38 Q 14,14 38,14 L 298,14 Q 322,14 322,38 L 322,80 L 195,80 L 135,130 L 14,130 Z"
          fill="url(#bodyRed)"
        />

        {/* Top Header Characteristic Clean Contour Line */}
        <Path
          d={`M ${POKEDEX_BODY_X},130 L 135,130 L 195,80 L ${HINGE_X},80`}
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* 3. FRONT COVER FLAP */}
        <G>
          {/* Flap Outer Drop Shadow */}
          <Path
            d={`M 16,134 L 134,134 L 196,84 L ${HINGE_X},84 L ${HINGE_X},516 Q ${HINGE_X},532 290,532 L 34,532 Q 16,532 16,516 Z`}
            fill="#000000"
            opacity={0.3}
            transform="translate(2.5, 3.5)"
          />

          {/* Flap Main Surface */}
          <Path
            d={`M 16,134 L 134,134 L 196,84 L ${HINGE_X},84 L ${HINGE_X},516 Q ${HINGE_X},532 290,532 L 34,532 Q 16,532 16,516 Z`}
            fill="url(#flapRed)"
            stroke="#1E1E1E"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Flap Top & Left Outer Bevel Highlight */}
          <Path
            d={`M 19,514 L 19,137 L 134,137 L 196,87 L ${HINGE_X - 2},87`}
            fill="none"
            stroke="#FF576E"
            strokeWidth="2.2"
            opacity={0.8}
            strokeLinejoin="round"
          />

          {/* Inset 3D Panel Cut Line (Faithful to Pokedex completa.png) */}
          <Path
            d={`M 26,148 L 130,148 L 192,97 L ${HINGE_X - 8},97 L ${HINGE_X - 8},512 L 26,512 Z`}
            fill="none"
            stroke="#750010"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <Path
            d={`M 28,150 L 130,150 L 192,99 L ${HINGE_X - 10},99 L ${HINGE_X - 10},510 L 28,510 Z`}
            fill="none"
            stroke="#FF6E82"
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity={0.7}
          />

          {/* Yellow Triangular Clasp on Left Edge */}
          <G>
            <Polygon
              points="42,284 63,296 42,308"
              fill="#000000"
              opacity={0.35}
              transform="translate(1.5, 1.5)"
            />
            <Polygon
              points="42,284 63,296 42,308"
              fill="url(#latchGold)"
              stroke="#1E1E1E"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <Line
              x1="43"
              y1="285"
              x2="61"
              y2="296"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <Line
              x1="43"
              y1="307"
              x2="61"
              y2="296"
              stroke="#D48800"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </G>

          {/* Horizontal Recessed Pill Groove */}
          <G>
            <Rect
              x="98"
              y="449"
              width="124"
              height="10"
              rx="5"
              ry="5"
              fill="url(#grooveGrad)"
              stroke="#1E1E1E"
              strokeWidth="1.8"
            />
            <Line
              x1="104"
              y1="451"
              x2="216"
              y2="451"
              stroke="#3D0008"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Line
              x1="104"
              y1="458"
              x2="216"
              y2="458"
              stroke="#FF7588"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </G>
        </G>

        {/* 4. Right Side Hinge Cylinder (Symmetrical top and bottom caps) */}
        <G>
          {/* Main Cylinder Body */}
          <Rect
            x={HINGE_X}
            y="66"
            width="18"
            height="456"
            rx="7"
            ry="7"
            fill="url(#hingeGrad)"
            stroke="#1E1E1E"
            strokeWidth="3.5"
          />

          {/* Top Joint Line (connects seamlessly with contour at y=80) */}
          <Line
            x1={HINGE_X}
            y1="80"
            x2={HINGE_X + 18}
            y2="80"
            stroke="#1E1E1E"
            strokeWidth="3"
          />

          {/* Bottom Joint Line (mirroring top joint at y=508) */}
          <Line
            x1={HINGE_X}
            y1="508"
            x2={HINGE_X + 18}
            y2="508"
            stroke="#1E1E1E"
            strokeWidth="3"
          />
        </G>

        {/* 5. Top Header Elements (Blue Lens & LEDs) */}
        {/* Big Blue Lens */}
        <G>
          <Circle cx="60" cy="62" r="39" fill="#1E1E1E" />
          <Circle cx="60" cy="62" r="36" fill="url(#lensRing)" />
          <Circle cx="60" cy="62" r="32" fill="#FFFFFF" />
          <Circle cx="60" cy="62" r="29" fill="#0C4A75" stroke="#1E1E1E" strokeWidth="1.5" />
          <Circle cx="60" cy="62" r="26.5" fill="url(#lensGlow)" />
          <Path
            d="M 43,54 A 18,18 0 0,1 68,43"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Circle cx="48" cy="50" r="3.2" fill="#FFFFFF" />
          <Circle cx="69" cy="71" r="2.2" fill="#64D2FF" opacity={0.6} />
        </G>

        {/* 3 Status LEDs */}
        <G>
          <Circle cx="122" cy="40" r="10.5" fill="#1E1E1E" />
          <Circle cx="122" cy="40" r="9" fill="#750212" />
          <Circle cx="122" cy="40" r="7.5" fill="url(#redLed)" />
          <Circle cx="120" cy="38" r="2.2" fill="#FFFFFF" opacity={0.9} />
          <Path
            d="M 115,44 A 8,8 0 0,0 129,44"
            fill="none"
            stroke="#FF7A8C"
            strokeWidth="1"
            opacity={0.6}
          />
        </G>

        <G>
          <Circle cx="146" cy="40" r="10.5" fill="#1E1E1E" />
          <Circle cx="146" cy="40" r="9" fill="#8C6B00" />
          <Circle cx="146" cy="40" r="7.5" fill="url(#yellowLed)" />
          <Circle cx="144" cy="38" r="2.2" fill="#FFFFFF" opacity={0.9} />
          <Path
            d="M 139,44 A 8,8 0 0,0 153,44"
            fill="none"
            stroke="#FFE082"
            strokeWidth="1"
            opacity={0.6}
          />
        </G>

        <G>
          <Circle cx="170" cy="40" r="10.5" fill="#1E1E1E" />
          <Circle cx="170" cy="40" r="9" fill="#0C4F1B" />
          <Circle cx="170" cy="40" r="7.5" fill="url(#greenLed)" />
          <Circle cx="168" cy="38" r="2.2" fill="#FFFFFF" opacity={0.9} />
          <Path
            d="M 163,44 A 8,8 0 0,0 177,44"
            fill="none"
            stroke="#81C784"
            strokeWidth="1"
            opacity={0.6}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
