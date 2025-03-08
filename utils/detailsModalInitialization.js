const detailsModalButtons = document.querySelectorAll('.details-modal-button');
const detailsName = document.querySelector('.details-name');
const detailsSize = document.querySelector('.details-size');
const detailsCreatedAt = document.querySelector('.details-created-at');

const pencilButton = document.querySelector('.rename-button');

const renameFileForm = document.getElementById('renameFileForm');
const formContainer = document.querySelector('.form-container');
const formNameField = document.getElementById('fileName');

let fileName = '';
let fileId;

detailsModalButtons.forEach((button) => {
  button.addEventListener('click', () => {
    fileName = button.getAttribute('data-name');
    fileId = button.getAttribute('data-id');
    const createdAt = button.getAttribute('data-created-at');

    console.log('details click listener for ' + fileName);

    detailsName.innerText = fileName;
    detailsCreatedAt.innerText = createdAt;
    detailsSize.innerText = 'Calculating...';

    fetch('/storage/file-size', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    })
      .then((response) => response.json())
      .then((data) => {
        detailsSize.innerText = data.size;
      })
      .catch((error) => new Error());
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
    `/storage/rename?fileId=${fileId}&_method=PUT`
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
