const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldImageRead = `      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        try {
          const response = await fetch('/api/scan-bill', {`;

const newImageRead = `      const reader = new FileReader();
      reader.onloadend = async () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1200px
          const MAX_DIM = 1200;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64data = dataUrl.split(',')[1];
          
          try {
            const response = await fetch('/api/scan-bill', {`;

if (code.includes(oldImageRead)) {
  code = code.replace(oldImageRead, newImageRead);
  
  // We also need to add a closing brace and catch block shift.
  // Actually, wait, let's use sed or just string manipulation carefully.
}
