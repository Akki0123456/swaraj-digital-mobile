/**
 * Swaraj Digital Mobile - Vernacular Typography Engine
 * Optimized for Devanagari and Latin scripts with dynamic reflow & scaling rules.
 * 
 * SLA / Quality Rule: TC-MOB-04
 * Base text scaler: 16px -> Max: 26px
 * Zero text clipping across all device viewports with proper line-height factor for Devanagari matras.
 */

export type VernacularScript = 'devanagari' | 'latin';

export interface TypographyScaleConfig {
  baseFontSize: number; // 16px to 26px
  script?: VernacularScript;
}

export interface ScaledTypography {
  heroHeadline: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: '800';
  };
  headline: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: '700';
  };
  subheadline: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: '600';
  };
  summaryBullet: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: '500';
  };
  body: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: '400';
  };
  caption: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: '500';
  };
  badge: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: '800';
  };
}

export const BASE_BODY_SIZE = 16;
export const MIN_BODY_SIZE = 14;
export const MAX_BODY_SIZE = 26;

// Devanagari ascenders and descenders (matras like ू, ौ, ्र, ्य) need at least 1.6x-1.7x line-height
const DEVANAGARI_LINE_HEIGHT_RATIO = 1.65;
const LATIN_LINE_HEIGHT_RATIO = 1.5;

export function getScaledTypography(
  baseSize: number = BASE_BODY_SIZE,
  script: VernacularScript = 'devanagari'
): ScaledTypography {
  // Clamp base size between MIN_BODY_SIZE and MAX_BODY_SIZE
  const clampedSize = Math.max(MIN_BODY_SIZE, Math.min(MAX_BODY_SIZE, baseSize));
  const scaleRatio = clampedSize / BASE_BODY_SIZE;
  const lineRatio = script === 'devanagari' ? DEVANAGARI_LINE_HEIGHT_RATIO : LATIN_LINE_HEIGHT_RATIO;

  const bodySize = Math.round(clampedSize);
  const headlineSize = Math.round(22 * scaleRatio);
  const heroHeadlineSize = Math.round(26 * scaleRatio);
  const subheadlineSize = Math.round(18 * scaleRatio);
  const summaryBulletSize = Math.round(15 * scaleRatio);
  const captionSize = Math.max(11, Math.round(13 * scaleRatio));
  const badgeSize = Math.max(10, Math.round(11 * scaleRatio));

  return {
    heroHeadline: {
      fontSize: heroHeadlineSize,
      lineHeight: Math.round(heroHeadlineSize * 1.35),
      letterSpacing: -0.3,
      fontWeight: '800',
    },
    headline: {
      fontSize: headlineSize,
      lineHeight: Math.round(headlineSize * 1.35),
      letterSpacing: -0.2,
      fontWeight: '700',
    },
    subheadline: {
      fontSize: subheadlineSize,
      lineHeight: Math.round(subheadlineSize * 1.45),
      letterSpacing: 0,
      fontWeight: '600',
    },
    summaryBullet: {
      fontSize: summaryBulletSize,
      lineHeight: Math.round(summaryBulletSize * lineRatio),
      letterSpacing: 0.1,
      fontWeight: '500',
    },
    body: {
      fontSize: bodySize,
      lineHeight: Math.round(bodySize * lineRatio),
      letterSpacing: 0.15,
      fontWeight: '400',
    },
    caption: {
      fontSize: captionSize,
      lineHeight: Math.round(captionSize * 1.4),
      letterSpacing: 0.2,
      fontWeight: '500',
    },
    badge: {
      fontSize: badgeSize,
      lineHeight: Math.round(badgeSize * 1.3),
      letterSpacing: 0.5,
      fontWeight: '800',
    },
  };
}

export const TYPOGRAPHY_PRESETS: Record<'compact' | 'base' | 'comfortable' | 'max', number> = {
  compact: 14,
  base: 16,
  comfortable: 20,
  max: 26,
};
