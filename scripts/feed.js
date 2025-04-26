// scripts/feed.js

// Set the avatar icon in top-right corner based on localStorage
const selectedAvatar = localStorage.getItem('selectedAvatar');
const avatarImg = document.getElementById('avatarIcon');

if (avatarImg) {
  avatarImg.src = selectedAvatar
    ? `../resources/avatars/${selectedAvatar}`
    : '../resources/avatars/noavatar.png';
}
