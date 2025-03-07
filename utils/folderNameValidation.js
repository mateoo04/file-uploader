document
  .getElementById('createFolderModal')
  .addEventListener('submit', (event) => {
    event.preventDefault();

    const folderName = event.target.folderName.value;

    fetch('/storage/check-name-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderName }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.available) {
          document.getElementById('nameUnavailableError').style.display =
            'block';
        } else {
          document.getElementById('nameUnavailableError').style.display =
            'none';
          event.target.submit();
        }
      })
      .catch((error) => new Error());
  });
