import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Platform } from 'react-native';
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
} from 'react-native-svg';

interface PokedexOpenProps {
  width?: number;
  height?: number;
  onPressScreen?: () => void;
  onPressDpad?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onPressModuleButton?: () => void;
  onPressSpriteButton?: (direction: 'next' | 'prev') => void;
  onPressButton?: (button: 'red' | 'blue' | 'black' | 'green') => void;
  screenContent?: React.ReactNode;
  showMissionsPrompt?: boolean;
  onPressGreenPad?: () => void;
  greenButtonLabel?: string;
  onPressClose?: () => void;
}

// Master Unified Proportions (Exact same as PokedexClosed)
const POKEDEX_BODY_WIDTH = 312;
const POKEDEX_BODY_HEIGHT = 536;
const POKEDEX_BODY_X = 12;
const POKEDEX_BODY_Y = 12;
const HINGE_X = 306;

export const PokedexOpen: React.FC<PokedexOpenProps> = ({
  width = 340,
  height = 560,
  screenContent,
  showMissionsPrompt = false,
  onPressGreenPad,
  onPressModuleButton,
  onPressSpriteButton,
  onPressDpad,
  greenButtonLabel,
  onPressClose,
}) => {
  const viewBoxWidth = 340;
  const viewBoxHeight = 560;

  // Animação de piscar para o botão de missões
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Animação contínua de pulso e radar para o botão preto circular (indica que deve ser tocado)
  const buttonPulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(buttonPulseAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [buttonPulseAnim]);

  useEffect(() => {
    if (showMissionsPrompt) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.15,
            duration: 450,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      blinkAnim.setValue(1);
    }
  }, [showMissionsPrompt, blinkAnim]);

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
          <LinearGradient id="bodyRedOpen" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E82038" />
            <Stop offset="45%" stopColor="#DC0A2D" />
            <Stop offset="100%" stopColor="#AD061E" />
          </LinearGradient>

          {/* Stepped 3D Shelf Shadow Gradient (Internal depth only) */}
          <LinearGradient id="stepShadowGradOpen" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#5E000D" />
            <Stop offset="50%" stopColor="#780213" />
            <Stop offset="100%" stopColor="#9C081D" />
          </LinearGradient>

          {/* Blue Big Lens Gradients */}
          <RadialGradient id="lensGlowOpen" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="25%" stopColor="#64D2FF" />
            <Stop offset="65%" stopColor="#0A84FF" />
            <Stop offset="100%" stopColor="#004FB0" />
          </RadialGradient>

          <LinearGradient id="lensRingOpen" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="50%" stopColor="#E2E7ED" />
            <Stop offset="100%" stopColor="#B0B8C4" />
          </LinearGradient>

          {/* Status LEDs Gradients */}
          <RadialGradient id="redLedOpen" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFA4A4" />
            <Stop offset="40%" stopColor="#FF2D55" />
            <Stop offset="100%" stopColor="#8E001A" />
          </RadialGradient>

          <RadialGradient id="yellowLedOpen" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFF9C4" />
            <Stop offset="40%" stopColor="#FFCC00" />
            <Stop offset="100%" stopColor="#B28900" />
          </RadialGradient>

          <RadialGradient id="greenLedOpen" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#C8FFD4" />
            <Stop offset="40%" stopColor="#34C759" />
            <Stop offset="100%" stopColor="#146627" />
          </RadialGradient>

          {/* Bezel Metallic Gradient */}
          <LinearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FAFBFD" />
            <Stop offset="40%" stopColor="#E6E9EE" />
            <Stop offset="100%" stopColor="#CFD4DC" />
          </LinearGradient>

          {/* Screen Dark Gray LCD Gradient */}
          <LinearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#43474D" />
            <Stop offset="50%" stopColor="#4F535A" />
            <Stop offset="100%" stopColor="#3A3E43" />
          </LinearGradient>

          {/* Green Touchpad / Keypad */}
          <LinearGradient id="greenPadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#5FE072" />
            <Stop offset="50%" stopColor="#3DB84D" />
            <Stop offset="100%" stopColor="#258A33" />
          </LinearGradient>

          {/* Red Pill Button */}
          <LinearGradient id="redPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF576C" />
            <Stop offset="70%" stopColor="#E51D35" />
            <Stop offset="100%" stopColor="#9C0518" />
          </LinearGradient>

          {/* Cyan Pill Button */}
          <LinearGradient id="cyanPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#54EDDE" />
            <Stop offset="70%" stopColor="#00A8B5" />
            <Stop offset="100%" stopColor="#00666E" />
          </LinearGradient>

          {/* Dark Buttons & D-Pad */}
          <LinearGradient id="darkButtonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4F535A" />
            <Stop offset="65%" stopColor="#36393E" />
            <Stop offset="100%" stopColor="#1E2023" />
          </LinearGradient>

          {/* Hinge 3D Cylinder Gradient */}
          <LinearGradient id="hingeGradOpen" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#690410" />
            <Stop offset="15%" stopColor="#8F0A1B" />
            <Stop offset="35%" stopColor="#D91A34" />
            <Stop offset="60%" stopColor="#F53652" />
            <Stop offset="85%" stopColor="#C41028" />
            <Stop offset="100%" stopColor="#5E030E" />
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
          fill="url(#bodyRedOpen)"
          stroke="#1E1E1E"
          strokeWidth="4"
        />

        {/* Outer Casing Left-Edge Bevel Line */}
        <Path
          d="M 20,528 L 20,138"
          fill="none"
          stroke="#850515"
          strokeWidth="2.5"
        />
        <Path
          d="M 22,528 L 22,138"
          fill="none"
          stroke="#FF576E"
          strokeWidth="1.2"
          opacity={0.5}
        />

        {/* 2. Top Header Section Background */}
        <Path
          d="M 14,38 Q 14,14 38,14 L 298,14 Q 322,14 322,38 L 322,80 L 195,80 L 135,130 L 14,130 Z"
          fill="url(#bodyRedOpen)"
        />

        {/* --- 3D STEPPED CUT TRANSITION (Internal console depth only) --- */}
        {/* Upper Step Edge Line */}
        <Path
          d={`M ${POKEDEX_BODY_X},124 L 135,124 L 195,76 L ${HINGE_X},76`}
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Vertical Stepped Facet / Drop-Shelf */}
        <Path
          d={`M ${POKEDEX_BODY_X},124 L 135,124 L 195,76 L ${HINGE_X},76 L ${HINGE_X},84 L 195,84 L 135,132 L ${POKEDEX_BODY_X},132 Z`}
          fill="url(#stepShadowGradOpen)"
        />

        {/* Lower Step Edge Line */}
        <Path
          d={`M ${POKEDEX_BODY_X},132 L 135,132 L 195,84 L ${HINGE_X},84`}
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Shelf Lower Edge Highlight */}
        <Path
          d={`M 14,134 L 135,134 L 195,86 L ${HINGE_X - 2},86`}
          fill="none"
          stroke="#FF697E"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity={0.8}
        />

        {/* Drop shadow cast by top shelf over the lower console */}
        <Path
          d={`M 14,134 L 135,134 L 195,86 L ${HINGE_X - 2},86 L ${HINGE_X - 2},96 L 195,96 L 135,144 L 14,144 Z`}
          fill="#000000"
          opacity={0.12}
        />

        {/* --- 3. SCREEN BEZEL WITH 3D CHAMFER & CUT DETAILS --- */}
        {/* Bezel fits symmetrically in the interior width (x=30 to x=296, w=266) */}
        <G>
          {/* Bezel Outer 3D Drop Shadow */}
          <Path
            d="M 44,148 L 282,148 Q 296,148 296,162 L 296,372 Q 296,386 282,386 L 70,386 L 30,346 L 30,162 Q 30,148 44,148 Z"
            fill="#000000"
            opacity={0.25}
            transform="translate(3, 4)"
          />

          {/* Main Bezel Body */}
          <Path
            d="M 44,148 L 282,148 Q 296,148 296,162 L 296,372 Q 296,386 282,386 L 70,386 L 30,346 L 30,162 Q 30,148 44,148 Z"
            fill="url(#bezelGrad)"
            stroke="#1E1E1E"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Bezel 3D Perimeter Inner Highlight */}
          <Path
            d="M 32,344 L 32,162 Q 32,150 44,150 L 282,150 Q 294,150 294,162"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity={0.85}
          />
          {/* Bezel 3D Perimeter Shadow */}
          <Path
            d="M 294,162 L 294,372 Q 294,384 282,384 L 70,384"
            fill="none"
            stroke="#9EA5B0"
            strokeWidth="2"
          />
          {/* Chamfer 3D Cut Edge Line */}
          <Line
            x1="32"
            y1="344"
            x2="70"
            y2="384"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            opacity={0.8}
          />

          {/* Bezel Top Center Red Sensor Dots with 3D Sockets (~1cm separation) */}
          <Circle cx="147" cy="160" r="4.2" fill="#1E1E1E" />
          <Circle cx="147" cy="160" r="3.2" fill="#D32F2F" />
          <Circle cx="146" cy="159" r="1" fill="#FFFFFF" opacity={0.8} />

          <Circle cx="179" cy="160" r="4.2" fill="#1E1E1E" />
          <Circle cx="179" cy="160" r="3.2" fill="#D32F2F" />
          <Circle cx="178" cy="159" r="1" fill="#FFFFFF" opacity={0.8} />

          {/* Inner Display Screen Well (Recessed into bezel) */}
          <Rect
            x="50"
            y="172"
            width="226"
            height="150"
            rx="11"
            ry="11"
            fill="#1A1C1E"
          />

          {/* Screen LCD Surface */}
          <Rect
            x="52"
            y="174"
            width="222"
            height="146"
            rx="10"
            ry="10"
            fill="url(#screenGrad)"
            stroke="#1E1E1E"
            strokeWidth="2.5"
          />

          {/* Screen Deep Well 3D Inner Drop Shadow */}
          <Path
            d="M 53,184 L 53,175 Q 53,175 62,175 L 273,175 L 273,180 L 58,180 L 58,319 L 53,319 Z"
            fill="#1E2024"
            opacity={0.9}
          />

          {/* Screen Diagonal Glare Line */}
          <Path
            d="M 64,176 L 154,176 L 120,318 L 56,318 Z"
            fill="#FFFFFF"
            opacity={0.035}
          />

          {/* Bottom Left on Bezel: Circular Red Button (aligned with screen left boundary) */}
          <Circle cx="66" cy="355" r="12" fill="#1E1E1E" />
          <Circle cx="66" cy="355" r="10.5" fill="#800615" />
          <Circle cx="66" cy="355" r="9" fill="url(#redPillGrad)" />
          <Circle cx="63" cy="352" r="2.8" fill="#FFFFFF" opacity={0.8} />
          <Path
            d="M 58,360 A 9,9 0 0,0 74,360"
            fill="none"
            stroke="#FFA4B0"
            strokeWidth="1"
            opacity={0.7}
          />

          {/* Bottom Right on Bezel: 4 Speaker Grille Slits (aligned with screen right boundary) */}
          {[342, 350, 358, 366].map((y, idx) => (
            <G key={idx}>
              <Line
                x1="220"
                y1={y}
                x2="274"
                y2={y}
                stroke="#1E1E1E"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <Line
                x1="221"
                y1={y + 1.2}
                x2="273"
                y2={y + 1.2}
                stroke="#FFFFFF"
                strokeWidth="0.8"
                opacity={0.5}
              />
            </G>
          ))}
        </G>

        {/* --- 4. LOWER CONTROLS AREA WITH 3D DEPTH CUTS & INSET SOCKETS --- */}

        {/* Left Dark Circular Button */}
        <G>
          <Circle cx="54" cy="425" r="23" fill="#750212" stroke="#1E1E1E" strokeWidth="1.5" />
          <Circle cx="54" cy="425" r="20" fill="#1E1E1E" />
          <Circle cx="54" cy="423" r="18.5" fill="url(#darkButtonGrad)" stroke="#1E1E1E" strokeWidth="2" />
          <Circle cx="50" cy="418" r="4.5" fill="#FFFFFF" opacity={0.25} />
          <Path
            d="M 36,436 A 21,21 0 0,0 72,436"
            fill="none"
            stroke="#FF697E"
            strokeWidth="1.2"
            opacity={0.5}
          />
        </G>

        {/* Center Pill Buttons */}
        <G>
          {/* Red Pill Button */}
          <Rect
            x="90"
            y="413"
            width="42"
            height="15"
            rx="7.5"
            ry="7.5"
            fill="#750212"
            stroke="#1E1E1E"
            strokeWidth="1.5"
          />
          <Rect
            x="92"
            y="414"
            width="38"
            height="12"
            rx="6"
            ry="6"
            fill="url(#redPillGrad)"
            stroke="#1E1E1E"
            strokeWidth="2"
          />
          <Line x1="96" y1="417" x2="126" y2="417" stroke="#FFAAB6" strokeWidth="1" strokeLinecap="round" opacity={0.7} />

          {/* Cyan Pill Button */}
          <Rect
            x="140"
            y="413"
            width="42"
            height="15"
            rx="7.5"
            ry="7.5"
            fill="#750212"
            stroke="#1E1E1E"
            strokeWidth="1.5"
          />
          <Rect
            x="142"
            y="414"
            width="38"
            height="12"
            rx="6"
            ry="6"
            fill="url(#cyanPillGrad)"
            stroke="#1E1E1E"
            strokeWidth="2"
          />
          <Line x1="146" y1="417" x2="176" y2="417" stroke="#E6FFFF" strokeWidth="1" strokeLinecap="round" opacity={0.7} />
        </G>

        {/* Center Bottom Green Display */}
        <G>
          <Rect
            x="90"
            y="440"
            width="94"
            height="50"
            rx="9"
            ry="9"
            fill="#6E0210"
            stroke="#1E1E1E"
            strokeWidth="2"
          />
          <Rect
            x="92"
            y="442"
            width="90"
            height="46"
            rx="7.5"
            ry="7.5"
            fill="url(#greenPadGrad)"
            stroke="#1E1E1E"
            strokeWidth="2.5"
          />
          <Rect
            x="95"
            y="444"
            width="84"
            height="42"
            rx="6"
            ry="6"
            fill="none"
            stroke="#A3FFAE"
            strokeWidth="1"
            opacity={0.45}
          />
          <Line x1="96" y1="456" x2="178" y2="456" stroke="#1F752B" strokeWidth="1" opacity={0.35} />
          <Line x1="96" y1="466" x2="178" y2="466" stroke="#1F752B" strokeWidth="1" opacity={0.35} />
          <Line x1="96" y1="476" x2="178" y2="476" stroke="#1F752B" strokeWidth="1" opacity={0.35} />
        </G>

        {/* Right D-Pad */}
        <G>
          <Path
            d="M 234,414 H 258 V 436 H 281 V 462 H 258 V 485 H 234 V 462 H 211 V 436 H 234 Z"
            fill="#750212"
            stroke="#1E1E1E"
            strokeWidth="2"
          />
          <Path
            d="M 236,417 H 256 V 440 H 279 V 460 H 256 V 483 H 236 V 460 H 213 V 440 H 236 Z"
            fill="#1E1E1E"
            transform="translate(1.5, 2.5)"
          />
          <Path
            d="M 236,416 H 256 V 438 H 278 V 458 H 256 V 480 H 236 V 458 H 214 V 438 H 236 Z"
            fill="url(#darkButtonGrad)"
            stroke="#1E1E1E"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <Path
            d="M 237,417 L 237,457 L 215,457 L 215,439 L 235,439 L 235,417 Z"
            fill="#FFFFFF"
            opacity={0.12}
          />
          <Circle cx="246" cy="448" r="7.5" fill="#1E2023" stroke="#1E1E1E" strokeWidth="1.5" />
          <Circle cx="246" cy="448" r="5" fill="#2C2F34" />
          <Path d="M 243,422 L 249,422 L 246,419 Z" fill="#1E1E1E" />
          <Path d="M 243,474 L 249,474 L 246,477 Z" fill="#1E1E1E" />
          <Path d="M 219,445 L 219,451 L 216,448 Z" fill="#1E1E1E" />
          <Path d="M 273,445 L 273,451 L 276,448 Z" fill="#1E1E1E" />
        </G>

        {/* 5. Right Side Hinge Cylinder (Symmetrical top and bottom caps matching closed state) */}
        <G>
          {/* Main Cylinder Body */}
          <Rect
            x={HINGE_X}
            y="66"
            width="18"
            height="456"
            rx="7"
            ry="7"
            fill="url(#hingeGradOpen)"
            stroke="#1E1E1E"
            strokeWidth="3.5"
          />

          {/* Top Joint Line (seamlessly connects with contour at y=80) */}
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

        {/* 6. Top Header Elements (Blue Lens & LEDs - Exact same position as closed) */}
        {/* Big Blue Lens */}
        <G>
          <Circle cx="60" cy="62" r="39" fill="#1E1E1E" />
          <Circle cx="60" cy="62" r="36" fill="url(#lensRingOpen)" />
          <Circle cx="60" cy="62" r="32" fill="#FFFFFF" />
          <Circle cx="60" cy="62" r="29" fill="#0C4A75" stroke="#1E1E1E" strokeWidth="1.5" />
          <Circle cx="60" cy="62" r="26.5" fill="url(#lensGlowOpen)" />
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
          <Circle cx="122" cy="40" r="7.5" fill="url(#redLedOpen)" />
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
          <Circle cx="146" cy="40" r="7.5" fill="url(#yellowLedOpen)" />
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
          <Circle cx="170" cy="40" r="7.5" fill="url(#greenLedOpen)" />
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
      {screenContent && (
        <View style={styles.screenOverlay}>
          {screenContent}
        </View>
      )}

      {/* 1. Alavanca Preta Circular - Agora fecha a Pokédex */}
      <View style={styles.moduleButtonContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.moduleButtonOverlay}
          onPress={onPressClose || onPressModuleButton}
          activeOpacity={0.6}
          accessibilityLabel="Fechar Pokédex"
        />
      </View>

      {/* 2. Pílulas (Print 4) - Alterna Visualização Pokémon: Arte, GIF, Shiny, Pixel */}
      <TouchableOpacity
        style={styles.redPillOverlay}
        onPress={() => onPressSpriteButton?.('prev')}
        activeOpacity={0.5}
        accessibilityLabel="Visualização Pokémon Anterior"
      />
      <TouchableOpacity
        style={styles.cyanPillOverlay}
        onPress={() => onPressSpriteButton?.('next')}
        activeOpacity={0.5}
        accessibilityLabel="Próxima Visualização Pokémon"
      />

      {/* 3. D-Pad (Print 1) - Setas de Controle */}
      <TouchableOpacity
        style={styles.dpadUpOverlay}
        onPress={() => onPressDpad?.('up')}
        activeOpacity={0.5}
        accessibilityLabel="Seta para Cima"
      />
      <TouchableOpacity
        style={styles.dpadDownOverlay}
        onPress={() => onPressDpad?.('down')}
        activeOpacity={0.5}
        accessibilityLabel="Seta para Baixo"
      />
      <TouchableOpacity
        style={styles.dpadLeftOverlay}
        onPress={() => onPressDpad?.('left')}
        activeOpacity={0.5}
        accessibilityLabel="Seta para Esquerda"
      />
      <TouchableOpacity
        style={styles.dpadRightOverlay}
        onPress={() => onPressDpad?.('right')}
        activeOpacity={0.5}
        accessibilityLabel="Seta para Direita"
      />

      {/* 4. Visor Verde Inferior - Botão Central Interativo com Efeito Pulsante ao Redor */}
      <View style={styles.greenPadContainer} pointerEvents="box-none">
        {/* Efeito Radar / Pulso Externo ao redor do retângulo verde */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.greenPulseRing,
            {
              opacity: buttonPulseAnim.interpolate({
                inputRange: [0, 0.6, 1],
                outputRange: [0.85, 0.35, 0],
              }),
              transform: [
                {
                  scale: buttonPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.0, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
        {/* Halo de luz que pulsa suavemente na borda do retângulo verde */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.greenGlowRing,
            {
              opacity: buttonPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.95],
              }),
            },
          ]}
        />

        <TouchableOpacity
          style={styles.greenPadOverlay}
          onPress={onPressGreenPad}
          activeOpacity={0.7}
          accessibilityLabel={`Ir para ${greenButtonLabel || 'Pokédex'}`}
        >
          <View style={styles.greenPadContent}>
            <Text style={styles.greenPadDestination}>
              {greenButtonLabel || '⚡ POKÉDEX'}
            </Text>
            <Text style={styles.greenPadSub}>Toque para acessar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenOverlay: {
    position: 'absolute',
    left: 52,
    top: 174,
    width: 222,
    height: 146,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F141C',
  },
  moduleButtonContainer: {
    position: 'absolute',
    left: 31,
    top: 402,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modulePulseRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#54EDDE',
    backgroundColor: 'rgba(84, 237, 222, 0.12)',
  },
  moduleGlowRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#54EDDE',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  moduleButtonOverlay: {
    width: 46,
    height: 46,
    borderRadius: 23,
    cursor: 'pointer' as any,
  },
  redPillOverlay: {
    position: 'absolute',
    left: 90,
    top: 410,
    width: 42,
    height: 20,
    borderRadius: 8,
    cursor: 'pointer' as any,
    zIndex: 50,
  },
  cyanPillOverlay: {
    position: 'absolute',
    left: 140,
    top: 410,
    width: 42,
    height: 20,
    borderRadius: 8,
    cursor: 'pointer' as any,
    zIndex: 50,
  },
  dpadUpOverlay: {
    position: 'absolute',
    left: 232,
    top: 412,
    width: 28,
    height: 26,
    borderRadius: 4,
    cursor: 'pointer' as any,
    zIndex: 50,
  },
  dpadDownOverlay: {
    position: 'absolute',
    left: 232,
    top: 458,
    width: 28,
    height: 26,
    borderRadius: 4,
    cursor: 'pointer' as any,
    zIndex: 50,
  },
  dpadLeftOverlay: {
    position: 'absolute',
    left: 210,
    top: 435,
    width: 26,
    height: 28,
    borderRadius: 4,
    cursor: 'pointer' as any,
    zIndex: 50,
  },
  dpadRightOverlay: {
    position: 'absolute',
    left: 256,
    top: 435,
    width: 26,
    height: 28,
    borderRadius: 4,
    cursor: 'pointer' as any,
    zIndex: 50,
  },
  greenPadContainer: {
    position: 'absolute',
    left: 88,
    top: 438,
    width: 98,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  greenPulseRing: {
    position: 'absolute',
    width: 96,
    height: 52,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#5FE072',
    backgroundColor: 'rgba(95, 224, 114, 0.16)',
  },
  greenGlowRing: {
    position: 'absolute',
    width: 96,
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#5FE072',
    shadowOpacity: 0.95,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  greenPadOverlay: {
    width: 90,
    height: 46,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    cursor: 'pointer' as any,
  },
  greenPadContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenPadDestination: {
    color: '#032009',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  greenPadSub: {
    color: '#0A3B12',
    fontSize: 6.2,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
    lineHeight: 7.5,
  },
});

