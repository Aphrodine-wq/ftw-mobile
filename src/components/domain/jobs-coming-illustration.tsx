import { memo } from "react";
import Svg, { Rect, Path, Circle, G } from "react-native-svg";
import { BRAND } from "@src/lib/constants";

const PRIMARY = BRAND.colors.primary;
const LIGHT = "#FDF2F3";
const DARK = "#0F1419";
const MUTED = "#5C6370";
const SURFACE = "#F5F3F0";
const BORDER = "#C8C3BC";

export const JobsComingIllustration = memo(function JobsComingIllustration({
  size = 100,
}: {
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 80" fill="none">
      {/* Clipboard body */}
      <Rect x="6" y="10" width="60" height="66" rx="3" fill="#FFFFFF" stroke={BORDER} strokeWidth="1.5" />
      {/* Clipboard clip */}
      <Rect x="22" y="5" width="28" height="10" rx="2.5" fill={SURFACE} stroke={BORDER} strokeWidth="1.2" />
      <Circle cx="36" cy="10" r="2.5" fill={BORDER} />

      {/* Job card 1 */}
      <G>
        <Rect x="13" y="22" width="46" height="14" rx="2" fill={LIGHT} />
        <Rect x="18" y="26" width="20" height="2.5" rx="1.25" fill={PRIMARY} />
        <Rect x="18" y="30" width="13" height="2" rx="1" fill={MUTED} opacity="0.5" />
        <Circle cx="52" cy="29" r="4" fill={PRIMARY} />
        <Path d="M49.8 29 L51.5 30.7 L54.5 27.7" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </G>

      {/* Job card 2 */}
      <G>
        <Rect x="13" y="40" width="46" height="14" rx="2" fill={LIGHT} />
        <Rect x="18" y="44" width="17" height="2.5" rx="1.25" fill={DARK} />
        <Rect x="18" y="48" width="11" height="2" rx="1" fill={MUTED} opacity="0.5" />
        <Circle cx="52" cy="47" r="4" fill={SURFACE} stroke={BORDER} strokeWidth="1.2" />
      </G>

      {/* Job card 3 */}
      <G>
        <Rect x="13" y="58" width="46" height="14" rx="2" fill={LIGHT} />
        <Rect x="18" y="62" width="22" height="2.5" rx="1.25" fill={DARK} />
        <Rect x="18" y="66" width="10" height="2" rx="1" fill={MUTED} opacity="0.5" />
        <Circle cx="52" cy="65" r="4" fill={SURFACE} stroke={BORDER} strokeWidth="1.2" />
      </G>
    </Svg>
  );
});

export default JobsComingIllustration;
