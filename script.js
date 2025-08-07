document.addEventListener("DOMContentLoaded", function () {
  // --- Theme Toggle Logic ---
  console.log("Modernized site loaded successfully!");

  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  const setTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  // --- Hamburger Menu Logic ---
  const hamburgerButton = document.getElementById('hamburger-button');
  const navMenuContainer = document.querySelector('.nav-menu-container');

  if (hamburgerButton && navMenuContainer) {
    hamburgerButton.addEventListener('click', () => {
      navMenuContainer.classList.toggle('active');
    });

    const navLinks = navMenuContainer.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenuContainer.classList.contains('active')) {
                navMenuContainer.classList.remove('active');
            }
        });
    });
  }
});