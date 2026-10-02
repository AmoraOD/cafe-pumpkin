export function startMenu(): void{
    const header_menu = document.getElementById('principal-menu');
    const toggle_menu = document.getElementById('menu-mobile-toggle');
    const nav_menu    = document.getElementById('container-menu');

    if (!header_menu || !toggle_menu || !nav_menu){
        console.warn('Elementos menu não encontrados');
        return;
    }

    toggle_menu.addEventListener('click', () => {
        const isOpen = nav_menu.classList.toggle('active');
        toggle_menu.setAttribute('aria-expanded', String(isOpen));
        toggle_menu.setAttribute('aria-label', isOpen ? 'Fechar Menu' : 'Abrir Menu');
    });

    nav_menu.querySelectorAll('a').forEach(item => {
        item.addEventListener('click', () => {
            if(window.innerWidth <= 768){
                nav_menu.classList.remove('active');
                toggle_menu.setAttribute('aria-expanded', 'false');
                toggle_menu.setAttribute('arial-label', 'Abrir Menu');
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav_menu.classList.contains('active')) {
            nav_menu.classList.remove('active');
            toggle_menu.setAttribute('aria-expanded', 'false');
            toggle_menu.setAttribute('aria-label', 'Abrir menu');
        }
    });

}