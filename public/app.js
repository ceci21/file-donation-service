const fileUploadButton = document.querySelector('.file-upload-button');
const backupDownloadLink = document.querySelector('.backup-download-link');
const dotVisual = document.querySelector('.upload-feedback-visual');
const uploadText = document.querySelector('.upload-feedback');
const donorsChart = document.querySelector('.donors-chart');
const donorNameField = document.querySelector('.donor-name');
const warningMsgEl = document.querySelector('.warning-msg');

const checkIfAlphanumeric = str => {
  return !/[^a-zA-Z0-9]/.test(str);
};

const disableForm = () => {
  fileUploadButton.disabled = true;
  warningMsgEl.classList.remove('hide');
};

const enableForm = () => {
  fileUploadButton.disabled = false;
  warningMsgEl.classList.add('hide');
};

const recordNamedDonation = name => {
  axios.get(`http://file-donation-service.glitch.me/donate/${name}`).then(() => {
    console.log('named donation made for', name);
  });
};

const recordAnonymousDonation = () => {
  axios.get(`http://file-donation-service.glitch.me/donate`).then(() => {
    console.log('anonymous donation made');
  });
};

axios.get('http://file-donation-service.glitch.me/donors').then(res => {
  if (res && res.data) {
    let donors = res.data;
    donors.sort(function({ donation_count: a }, { donation_count: b }) {
      return b - a;
    });
    donors = donors.slice();
    donors.forEach(entry => {
      const name = entry.donor_name;
      const donationCount = entry.donation_count;
      const rowEl = document.createElement('div');
      if (!isNaN(donationCount) && donationCount > 0) {
        rowEl.innerHTML = name + ' ' + donationCount;
        donorsChart.appendChild(rowEl);
      }
    });
  }
});

donorNameField.addEventListener('change', e => {
  if (e && e.target && typeof e.target.value === 'string') {
    const donorName = e.target.value;
    const isAlphanumeric = checkIfAlphanumeric(donorName);
    if (!isAlphanumeric) {
      disableForm();
    } else {
      enableForm();
    }
  }
});

fileUploadButton.addEventListener('change', () => {
  const donorName = donorNameField.value;
  const isAlphanumeric = checkIfAlphanumeric(donorName);
  if (!isAlphanumeric) {
    return disableForm();
  } else {
    enableForm();
  }
  if (typeof donorName === 'string' && donorName !== '') {
    recordNamedDonation(donorName);
  } else {
    recordAnonymousDonation();
  }
  const file = fileUploadButton.files[0];
  const url = URL.createObjectURL(file);
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

console.log('test 1');
