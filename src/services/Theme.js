// NyxScream Brand Theme & Colors
export const NYXSCREAM = {
  // Primary Colors
  void: '#0D0221',           // Midnight Void
  shadow: '#1A0A2E',         // Shadow Layer
  abyss: '#0f0518',          // Deep Abyss
  
  // Accent Colors
  scream: '#FF003C',         // Scream Red
  screamGlow: 'rgba(255, 0, 60, 0.5)',
  nyx: '#9D00FF',            // Nyx Purple
  nyxGlow: 'rgba(157, 0, 255, 0.5)',
  electric: '#00F0FF',       // Electric Cyan
  electricGlow: 'rgba(0, 240, 255, 0.3)',
  
  // Text Colors
  ghost: '#E0E0E0',          // Ghost White
  mist: '#6B6B6B',           // Mist Gray
  fog: 'rgba(224, 224, 224, 0.1)'
};

export const getTierColor = (tier) => {
  switch(tier?.toLowerCase()) {
    case 'void':
      return NYXSCREAM.void;
    case 'shadow':
      return NYXSCREAM.nyx;
    case 'abyss':
      return NYXSCREAM.scream;
    default:
      return NYXSCREAM.mist;
  }
};

export const getCreatorTierColor = (tier) => {
  switch(tier?.toLowerCase()) {
    case 'whisper':
      return NYXSCREAM.electric;
    case 'echo':
      return NYXSCREAM.nyx;
    case 'scream':
      return NYXSCREAM.scream;
    default:
      return NYXSCREAM.mist;
  }
};

export const getCreatorTierBadge = (tier) => {
  switch(tier?.toLowerCase()) {
    case 'whisper':
      return { icon: '🌑', name: 'WHISPER' };
    case 'echo':
      return { icon: '🔊', name: 'ECHO' };
    case 'scream':
      return { icon: '🔴', name: 'SCREAM' };
    default:
      return { icon: '⚫', name: 'NEW' };
  }
};