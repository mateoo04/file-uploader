const deleteModalOpenButtons = document.querySelectorAll(
  '.delete-modal-button'
);
const deleteModalForm = document.getElementById('deleteModalForm');

deleteModalOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const fileName = button.getAttribute('data-value');
    deleteModalForm.setAttribute(
      'action',
      `/delete?fileName=${fileName}&_method=DELETE`
    );
  });
});
