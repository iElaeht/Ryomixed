const ffbinaries = require('ffbinaries');
const path = require('path');

console.log('⏳ Descargando binarios de FFmpeg...');

ffbinaries.downloadBinaries(['ffmpeg', 'ffprobe'], {
  destination: path.join(__dirname, 'bin')
}, function (err, results) {
  if (err) {
    console.error('❌ Error descargando FFmpeg:', err);
    process.exit(1);
  }
  console.log('✅ FFmpeg instalado correctamente en ./bin');
  process.exit(0);
});