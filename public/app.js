
const db = firebase.database();
const app = db.app;
app.initializeApp({
  databaseURL: "https://file-donation-service.firebaseio.com" // Realtime Database
  // storageBucket: "YOUR_APP.appspot.com",          // Storage
  // messagingSenderId: "123456789"
});

const ref = db.ref("https://file-donation-service.firebaseio.com");
db.enableLogging((message) => {
  console.log('test')
  console.log(message)
});

const fileUpload = document.querySelector('.file-upload')
const backupDownload = document.querySelector('.backup-download')
const dotVisual = document.querySelector('.dot-visual');
const uploadText = document.querySelector('.upload-text')


fileUpload.addEventListener('change', () => {
  const file = fileUpload.files[0]
  const url = URL.createObjectURL(file)
  const split = file.name.split('.');
  const newName = split[0] + '-backup.' + split[1];

  backupDownload.href = url;
  backupDownload.download = newName;
  dotVisual.innerHTML = '';
  uploadText.classList.remove('hide');
  uploadText.classList.add('pulsate');

  const timeUntilUploadCompletion = 4200;
  const interval_addDots = setInterval(function() {
    dotVisual.innerHTML += '<div>...</div>';
  }, 250);

  setTimeout(function() {
    // backupDownload.innerText = `File ${file.name} uploaded! Size: ${file.size}`;
    clearInterval(interval_addDots);
    dotVisual.innerHTML += 'Done!';
    uploadText.classList.remove('pulsate');
    backupDownload.classList.remove('hide');
    uploadText.parentElement.classList.add('hide');
    // backupDownload.click();
  }, timeUntilUploadCompletion);
});

console.log('test 1')
