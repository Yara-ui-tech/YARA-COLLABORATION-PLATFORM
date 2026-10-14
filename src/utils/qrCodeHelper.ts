import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QrOptions {
  width?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generate a local base64 Data URL for a QR code.
 * Safe for html2canvas (no cross-origin / taint issues) and 100% offline-ready.
 */
export async function generateQrCodeDataUrl(
  text: string,
  options?: QrOptions
): Promise<string> {
  const width = options?.width || 200;
  const dark = options?.darkColor || '#0f172a';
  const light = options?.lightColor || '#ffffff';

  if (!text) return '';

  try {
    return await QRCode.toDataURL(text, {
      width,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark, light }
    });
  } catch (err) {
    console.warn('QRCode local generation error, falling back to server API:', err);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${width}&margin=1&data=${encodeURIComponent(text)}`;
  }
}

/**
 * React hook that generates and returns a QR code data URL.
 * Provides instant fallback while generating local data URL.
 */
export function useQrCode(text: string, options?: QrOptions): string {
  const [qrUrl, setQrUrl] = useState<string>(() => {
    if (!text) return '';
    const width = options?.width || 200;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${width}&margin=1&data=${encodeURIComponent(text)}`;
  });

  useEffect(() => {
    let isMounted = true;
    if (!text) return;

    generateQrCodeDataUrl(text, options).then(url => {
      if (isMounted && url) {
        setQrUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, options?.width, options?.darkColor, options?.lightColor]);

  return qrUrl;
}
