const fileUploadButton = document.querySelector('.file-upload-button');
const backupDownloadLink = document.querySelector('.backup-download-link');
const dotVisual = document.querySelector('.upload-feedback-visual');
const uploadText = document.querySelector('.upload-feedback');
const donorsChart = document.querySelector('.donors-chart');



fileUploadButton.addEventListener('change', () => {
  const file = fileUploadButton.files[0]
  const url = URL.createObjectURL(file)
  const split = file.name.split('.');
  const newName = split[0] + '-backup.' + split[1];

  backupDownloadLink.href = url;
  backupDownloadLink.download = newName;
  dotVisual.innerHTML = '';
  uploadText.classList.remove('hide');
  uploadText.classList.add('pulsate');

  const interval_addDots = setInterval(function() {
    dotVisual.innerHTML += '<div>...</div>';
  }, 250);

  setTimeout(function() {
    // backupDownloadLink.innerText = `File ${file.name} uploaded! Size: ${file.size}`;
    clearInterval(interval_addDots);
    dotVisual.innerHTML += 'Done!';
    uploadText.classList.remove('pulsate');
    backupDownloadLink.classList.remove('hide');
    uploadText.parentElement.classList.add('hide');
    // backupDownloadLink.click();
  }, 2000);
});

console.log('test 1')
