const detailsModalButtons = document.querySelectorAll('.details-modal-button');
const detailsName = document.querySelector('.details-name');
const detailsSize = document.querySelector('.details-size');
const detailsUploadDate = document.querySelector('.details-upload-date');

const pencilButton = document.querySelector('.rename-button');

const renameFileForm = document.getElementById('renameFileForm');
const formContainer = document.querySelector('.form-container');
const formNameField = document.getElementById('fileName');

let fileName = '';

detailsModalButtons.forEach((button) => {
  button.addEventListener('click', () => {
    fileName = button.getAttribute('data-name');
    const size = button.getAttribute('data-size');
    const uploadDate = button.getAttribute('data-upload-date');

    console.log('details click listener for ' + fileName);

    detailsName.innerText = fileName;
    detailsSize.innerText = size;
    detailsUploadDate.innerText = uploadDate;
  });
});

pencilButton.addEventListener('click', () => {
  console.log('pencil click listener for ' + fileName);

  detailsName.style.display = 'none';
  pencilButton.style.display = 'none';
  formContainer.style.display = 'block';

  formNameField.value = fileName;

  renameFileForm.setAttribute(
    'action',
    `/storage/rename?previousName=${fileName}&_method=PUT`
  );
});

document
  .getElementById('detailsModal')
  .addEventListener('hidden.bs.modal', function () {
    detailsName.style.display = '';
    pencilButton.style.display = '';
    formContainer.style.display = 'none';

    formNameField.value = '';

    renameFileForm.setAttribute('action', '');
  });
