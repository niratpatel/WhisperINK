fetch('https://www.google.com')
  .then(res => console.log('Success:', res.status))
  .catch(err => console.error('Error:', err));