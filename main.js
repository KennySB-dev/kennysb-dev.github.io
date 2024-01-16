
const $menuBtn = document.querySelector('.menu-btn')
const $navigator = document.getElementById('nav-menu')
const $navLink = document.querySelectorAll('.nav__link')


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
