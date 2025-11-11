// src/components/Toggle.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

interface ToggleProps {
  initial?: boolean;
  onToggle?: (newValue: boolean) => void;
  width?: number;      // default 110 (≈6.8rem)
  height?: number;     // default 32
  activeColor?: string;// default '#0B00A9'
  inactiveColor?: string;// default '#2D2D2D'
  thumbColor?: string; // default '#FFF'
  textOn?: string;     // default 'Ativo'
  textOff?: string;    // default 'Inativo'
  textStyle?: object;  // override for text
}

const Toggle: React.FC<ToggleProps> = ({
  initial = true,
  onToggle = () => {},
  width = 110,
  height = 32,
  activeColor = '#0B00A9',
  inactiveColor = '#2D2D2D',
  thumbColor = '#FFF',
  textOn = 'Ativo',
  textOff = 'Inativo',
  textStyle = {},
}) => {

  const [isOn, setIsOn] = useState(initial);
  const anim = useRef(new Animated.Value(initial ? 1 : 0)).current;

  useEffect(() => {
    setIsOn(initial);
    Animated.timing(anim, {
      toValue: initial ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [initial]);

  const toggleSwitch = () => {
    const next = !isOn;
    setIsOn(next);
    onToggle(next);
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const PADDING = 4;
  const thumbSize = height - PADDING * 2;
  const TEXT_GAP = 8;  
  const trackWidth = width;
  const trackHeight = height;

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [PADDING, trackWidth - thumbSize - PADDING],
  });

  const fontSize = 14;
  const halfText = fontSize / 2;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleSwitch}
      style={{ width: trackWidth, height: trackHeight }}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: trackBg,
          },
        ]}
      >
        {isOn ? (
          <Text 
            style={[
              styles.text, 
              { 
                right: PADDING + thumbSize + TEXT_GAP,
                transform: [{ translateY: -halfText}]
              }, 
              textStyle
            ]}
          >{textOn}
          </Text>
        ) : (
          <Text 
            style={[
              styles.text, 
              { 
                left: PADDING + thumbSize + TEXT_GAP,
                transform: [{ translateY: -halfText }],
              },
              textStyle
            ]}
          >{textOff}
          </Text>
        )}

        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbColor,
              transform: [{ translateX: thumbTranslate }],
              top: PADDING, 
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
  },
  text: {
    position: 'absolute',
    top: '45%',
    // transform: [{ translateY: 40 }], 
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default Toggle;
