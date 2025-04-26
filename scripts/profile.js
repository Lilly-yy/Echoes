const avatarDisplay = document.getElementById('currentAvatar');
const avatarModal = document.getElementById('avatarModal');
const avatarOptions = document.getElementById('avatarOptions');
const closeModal = document.getElementById('closeModal');

// Load and set current avatar
const selectedAvatar = localStorage.getItem('selectedAvatar') || 'noavatar.png';
avatarDisplay.src = `../resources/avatars/${selectedAvatar}`;

// Open modal on click
avatarDisplay.addEventListener('click', () => {
  avatarModal.classList.remove('hidden');
});

// Close modal when clicking the close button or outside the modal
closeModal.addEventListener('click', () => avatarModal.classList.add('hidden'));

window.addEventListener('click', (e) => {
  if (e.target === avatarModal) {
    avatarModal.classList.add('hidden');
  }
});

// Generate avatar options
const allAvatars = ['noavatar.png'];
for (let i = 1; i <= 16; i++) {
  allAvatars.push(`avatar${i}.png`);
}

allAvatars.forEach((filename) => {
  const img = document.createElement('img');
  img.src = `../resources/avatars/${filename}`;
  img.alt = filename;
  img.className = 'w-16 h-16 rounded-full object-cover border border-gray-300 hover:border-blue-500 cursor-pointer transition';

  img.addEventListener('click', () => {
    localStorage.setItem('selectedAvatar', filename);
    avatarDisplay.src = `../resources/avatars/${filename}`;
    avatarModal.classList.add('hidden');
  });

  avatarOptions.appendChild(img);
});
