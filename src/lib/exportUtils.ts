import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportAsImage = async (element: HTMLElement, fileName: string) => {
  try {
    // Wait for fonts and images to be ready
    await document.fonts.ready;
    
    // Extra safety: wait a bit for any layout/animations to settle
    await new Promise(resolve => setTimeout(resolve, 800));

    const canvas = await html2canvas(element, {
      scale: 2.5, // Balanced scale for quality vs performance
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (doc) => {
        // 1. Ensure all images in the clone have crossOrigin set
        const images = doc.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
          images[i].crossOrigin = "anonymous";
        }

        // 2. Sanitize styles: Replace oklch/lch/lab and advanced CSS which html2canvas cannot parse
        const allElements = doc.getElementsByTagName('*');
        const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke'];
        
        // Define common mappings to preserve the "vibe" during export if we find oklch
        const getSafeFallback = (prop: string, value: string) => {
          if (value.includes('oklch') || value.includes('oklab') || value.includes('lch(') || value.includes('lab(')) {
            // Check for common vibes
            if (value.includes('0.5') || value.includes('0.6')) return '#4f46e5'; // Indigo
            if (value.includes('0.1') || value.includes('0.2')) return '#0f172a'; // Slate-900
            if (value.includes('0.9')) return '#f8fafc'; // White/Slate-50
            
            if (prop === 'backgroundColor') return '#ffffff';
            if (prop === 'color') return '#1e293b';
            return '#cbd5e1';
          }
          return null;
        };

        const sanitizeElement = (el: HTMLElement) => {
          const style = window.getComputedStyle(el);
          
          if (el.classList.contains('export-safe-bg-white')) {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#0f172a';
          }

          colorProps.forEach(prop => {
            const value = style[prop as any];
            if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('lch(') || value.includes('lab('))) {
              const fallback = getSafeFallback(prop, value);
              if (fallback) {
                (el.style as any)[prop] = fallback;
              }
            }
          });

          // Also check for background shorthand which might contain oklch
          if (style.background && (style.background.includes('oklch') || style.background.includes('oklab'))) {
            el.style.background = '#ffffff';
          }

          // Disable modern filters that break canvas rendering
          if (style.backdropFilter && style.backdropFilter !== 'none') {
            el.style.backdropFilter = 'none';
            if (!el.style.backgroundColor || el.style.backgroundColor === 'rgba(0, 0, 0, 0)') {
               el.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            }
          }

          if (style.filter && (style.filter.includes('blur') || style.filter.includes('drop-shadow'))) {
             el.style.filter = 'none';
          }
        };

        for (let i = 0; i < allElements.length; i++) {
          sanitizeElement(allElements[i] as HTMLElement);
        }
      }
    });
    
    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = image;
    link.click();
  } catch (error) {
    console.error("Image export error:", error);
    throw error;
  }
};

export const exportAsPDF = async (element: HTMLElement, fileName: string, orientation: 'portrait' | 'landscape' = 'portrait') => {
  try {
    // Wait for fonts and images to be ready
    await document.fonts.ready;
    
    // Extra safety: wait a bit for any layout/animations to settle
    await new Promise(resolve => setTimeout(resolve, 800));

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (doc) => {
        // 1. Images
        const images = doc.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
          images[i].crossOrigin = "anonymous";
        }

        // 2. Sanitize styles: Replace oklch/lch/lab and advanced CSS which html2canvas cannot parse
        const allElements = doc.getElementsByTagName('*');
        const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke'];
        
        // Define common mappings to preserve the "vibe" during export if we find oklch
        const getSafeFallback = (prop: string, value: string) => {
          if (value.includes('oklch') || value.includes('oklab') || value.includes('lch(') || value.includes('lab(')) {
            // Check for common vibes
            if (value.includes('0.5') || value.includes('0.6')) return '#4f46e5'; // Indigo
            if (value.includes('0.1') || value.includes('0.2')) return '#0f172a'; // Slate-900
            if (value.includes('0.9')) return '#f8fafc'; // White/Slate-50
            
            if (prop === 'backgroundColor') return '#ffffff';
            if (prop === 'color') return '#1e293b';
            return '#cbd5e1';
          }
          return null;
        };

        const sanitizeElement = (el: HTMLElement) => {
          const style = window.getComputedStyle(el);
          
          if (el.classList.contains('export-safe-bg-white')) {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#0f172a';
          }

          colorProps.forEach(prop => {
            const value = style[prop as any];
            if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('lch(') || value.includes('lab('))) {
              const fallback = getSafeFallback(prop, value);
              if (fallback) {
                (el.style as any)[prop] = fallback;
              }
            }
          });

          // Also check for background shorthand which might contain oklch
          if (style.background && (style.background.includes('oklch') || style.background.includes('oklab'))) {
            el.style.background = '#ffffff';
          }

          // Disable modern filters that break canvas rendering
          if (style.backdropFilter && style.backdropFilter !== 'none') {
            el.style.backdropFilter = 'none';
            if (!el.style.backgroundColor || el.style.backgroundColor === 'rgba(0, 0, 0, 0)') {
               el.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            }
          }

          if (style.filter && (style.filter.includes('blur') || style.filter.includes('drop-shadow'))) {
             el.style.filter = 'none';
          }
        };

        for (let i = 0; i < allElements.length; i++) {
          sanitizeElement(allElements[i] as HTMLElement);
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: orientation === 'portrait' ? [canvas.width / 3, canvas.height / 3] : [canvas.width / 3, canvas.height / 3]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    throw error;
  }
};
