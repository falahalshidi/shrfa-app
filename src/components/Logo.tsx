import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface LogoProps {
  size?: number;
  showTagline?: boolean;
  style?: ViewStyle;
}

export default function Logo({ size, showTagline = true, style }: LogoProps) {
  const screenWidth = Dimensions.get('window').width;
  const logoSize = size || screenWidth * 0.6;
  const fontSize = logoSize * 0.25;
  const taglineFontSize = logoSize * 0.08;
  const maskHeight = fontSize * 1.5;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.logoContainer}>
        <MaskedView
          style={[styles.maskedView, { height: maskHeight, width: logoSize }]}
          maskElement={
            <View style={[styles.maskContainer, { height: maskHeight, width: logoSize }]}>
              <Text style={[styles.logoText, { fontSize }]}>شرفة</Text>
            </View>
          }
        >
          <LinearGradient
            colors={['#FF6B35', '#8B1A1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { height: maskHeight, width: logoSize }]}
          />
        </MaskedView>
      </View>
      
      {showTagline && (
        <Text style={[styles.tagline, { fontSize: taglineFontSize }]}>
          بين الأصالة والتراث .. تبدأ الحكاية
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskedView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
});

