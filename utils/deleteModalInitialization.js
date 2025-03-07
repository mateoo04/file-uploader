const deleteModalOpenButtons = document.querySelectorAll(
  '.delete-modal-button'
);
const deleteModalForm = document.getElementById('deleteModalForm');

deleteModalOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const fileName = button.getAttribute('data-name');
    deleteModalForm.setAttribute(
      'action',
      `/storage/delete?fileName=${fileName}&_method=DELETE`
    );
  });
});
