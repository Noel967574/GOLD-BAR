export default function JewelryArt({ category, name }) {
  const gold = `gold-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const productName = name.toLowerCase();
  const isNecklace = /necklace|chain|pendant|cuban/.test(productName) || category === 'Necklaces' || category === 'Pendants';
  let shape;
  if (category === 'Rings' && !isNecklace) {
    shape = <><ellipse cx="180" cy="198" rx="91" ry="62" fill="none" stroke={`url(#${gold})`} strokeWidth="30" /><ellipse cx="180" cy="198" rx="91" ry="62" fill="none" stroke="#fff1c9" strokeOpacity=".7" strokeWidth="5" /><path d="M143 142l37-30 37 30-10 15h-54z" fill={`url(#${gold})`} /></>;
  } else if (category === 'Earrings') {
    shape = <><circle cx="130" cy="185" r="52" fill="none" stroke={`url(#${gold})`} strokeWidth="19" /><circle cx="236" cy="185" r="52" fill="none" stroke={`url(#${gold})`} strokeWidth="19" /><circle cx="130" cy="185" r="52" fill="none" stroke="#fff0bd" strokeOpacity=".72" strokeWidth="4" /><circle cx="236" cy="185" r="52" fill="none" stroke="#fff0bd" strokeOpacity=".72" strokeWidth="4" /></>;
  } else if (category === 'Bracelets') {
    shape = <><ellipse cx="180" cy="190" rx="112" ry="74" transform="rotate(-25 180 190)" fill="none" stroke={`url(#${gold})`} strokeWidth="23" /><ellipse cx="180" cy="190" rx="112" ry="74" transform="rotate(-25 180 190)" fill="none" stroke="#fff0bd" strokeOpacity=".72" strokeWidth="4" /><circle cx="270" cy="146" r="12" fill="#f3d992" stroke="#a77c37" strokeWidth="3" /></>;
  } else if (isNecklace && !/pendant|diamond/.test(productName)) {
    shape = <><path d="M74 76c16 111 50 186 106 208 56-22 90-97 106-208" fill="none" stroke={`url(#${gold})`} strokeWidth="19" strokeLinecap="round" /><path d="M74 76c16 111 50 186 106 208 56-22 90-97 106-208" fill="none" stroke="#fff1c5" strokeOpacity=".78" strokeWidth="4" strokeLinecap="round" /><path d="M111 160l17-4m-6 28 18-5m1 28 18-6m10 28 18-7m43-62-17-4m6 28-18-5m-1 28-18-6m-10 28-18-7" stroke="#986b2e" strokeWidth="3" strokeLinecap="round" /></>;
  } else if (isNecklace) {
    shape = <><path d="M73 80c18 112 46 176 107 188 61-12 89-76 107-188" fill="none" stroke={`url(#${gold})`} strokeWidth="11" strokeLinecap="round" /><path d="M73 80c18 112 46 176 107 188 61-12 89-76 107-188" fill="none" stroke="#fff0bd" strokeOpacity=".75" strokeWidth="3" /><path d="M180 251l29 35-29 44-29-44z" fill={`url(#${gold})`} stroke="#fff1c9" strokeWidth="3" /></>;
  } else {
    shape = <><ellipse cx="180" cy="190" rx="112" ry="74" transform="rotate(-25 180 190)" fill="none" stroke={`url(#${gold})`} strokeWidth="23" /><ellipse cx="180" cy="190" rx="112" ry="74" transform="rotate(-25 180 190)" fill="none" stroke="#fff0bd" strokeOpacity=".72" strokeWidth="4" /><circle cx="270" cy="146" r="12" fill="#f3d992" stroke="#a77c37" strokeWidth="3" /></>;
  }

  return (
    <svg className="jewelry-art" viewBox="0 0 360 360" role="img" aria-label={`${name}, crafted gold jewelry`}>
      <defs><linearGradient id={gold} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f8e6ae" /><stop offset=".32" stopColor="#b6873e" /><stop offset=".55" stopColor="#fff1bd" /><stop offset=".78" stopColor="#a7732c" /><stop offset="1" stopColor="#f2d58f" /></linearGradient></defs>
      <ellipse cx="180" cy="301" rx="104" ry="13" fill="#877350" opacity=".14" />
      {shape}
    </svg>
  );
}
