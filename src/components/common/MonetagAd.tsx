import React, { useEffect, useRef } from 'react';

export const MonetagAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const zoneId = import.meta.env.VITE_MONETAG_ZONE_ID || '287164';

  useEffect(() => {
    if (!adRef.current) return;

    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://quge5.com/88/tag.min.js';
    script.setAttribute('data-zone', zoneId);
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    // Append to the container div
    adRef.current.appendChild(script);

    // Cleanup: remove the script if the component unmounts
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [zoneId]);

  return <div ref={adRef} className="monetag-ad-container my-4" />;
};
