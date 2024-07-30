const $menuBtn = document.querySelector('.menu-btn')
const $navigator = document.getElementById('nav-menu')
const $navLink = document.querySelectorAll('.nav__link')
const $themeToggle = document.getElementById('theme-toggle')

const toggleMenuBtn = () => {
  $menuBtn.classList.toggle('open')
  $menuBtn.classList.contains('open')
    ? $navigator.classList.add('show') &
      $menuBtn.setAttribute('aria-expanded', true) &
      document.body.classList.add('no-scroll')
    : $navigator.classList.remove('show') &
      $menuBtn.setAttribute('aria-expanded', false) &
      document.body.classList.remove('no-scroll')
}

$menuBtn.addEventListener('click', toggleMenuBtn)

function linkAction() {
  $navLink.forEach((n) => n.classList.remove('active'))
  this.classList.add('active')
  $navigator.classList.remove('show')
  $menuBtn.classList.toggle('open')
  document.body.classList.remove('no-scroll')
  $menuBtn.setAttribute('aria-expanded', false)
}

$navLink.forEach((n) => n.addEventListener('click', linkAction))

// Theme switcher logic
const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

$themeToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    setTheme('dark')
  } else {
    setTheme('light')
  }
})

// Load the saved theme
const savedTheme = localStorage.getItem('theme') || 'light'
setTheme(savedTheme)
$themeToggle.checked = savedTheme === 'dark'
