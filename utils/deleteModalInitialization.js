const deleteModalOpenButtons = document.querySelectorAll(
  '.delete-modal-button'
);
const deleteModalForm = document.getElementById('deleteModalForm');

deleteModalOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const fileId = button.getAttribute('data-id');
    deleteModalForm.setAttribute(
      'action',
      `/storage/delete?fileId=${fileId}&_method=DELETE`
    );
  });
});
