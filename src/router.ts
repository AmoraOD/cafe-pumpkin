type Route = {
    path: string;
    page: string;
    title: string;
};

const routes: Route[] = [
    { path: "/", page: "home.html", title: "Início"},
    { path: "/cardapio", page: "cardapio.html", title: "Cardápio"},
    { path: "/about", page: "about.html", title: "Sobre Nós"},
];

const DEFAULT_ROUTE = "/";

export class Router{
    private outlet: HTMLElement;
    private basePath: string;

    constructor (outletSelector: string, basePath = "/src/public/pages/") {
        const outlet = document.querySelector<HTMLElement>(outletSelector);
        if(!outlet) throw new Error(`Outlet não encontrada${outletSelector}`);

        this.outlet = outlet;
        this.basePath = basePath;
    }

    public Start(): void {
        window.addEventListener("hashchange", () => this.handleRoute());
        document.addEventListener("DOMContentLoaded", () => this.handleRoute());
        this.handleRoute();
    }
    
    private getCurrentPath(): string {
        const hash = window.location.hash.replace(/^#/, "");
        return hash === "" ? DEFAULT_ROUTE : hash;
    }

    private async handleRoute(): Promise<void> {
        const path = this.getCurrentPath();

        const route =
            routes.find(r => r.path === path) ??
            routes.find(r => r.path === DEFAULT_ROUTE)!;

        try{
            const res = await fetch(`${this.basePath}${route.page}`);
            if (!res.ok) throw new Error (`HTTP ${res.status}`);

            this.outlet.innerHTML = await res.text();

            window.scrollTo({top: 0, behavior: "smooth"});
            document.title = `${route.title} | Cafeteria Pumpking`;
            this.updateActiveLink(route.path);

            const toggler = document.querySelector<HTMLButtonElement>(".navbar-toggler");

            const nav = document.getElementById("nav-links");
            if (nav?.classList.contains("show") && toggler) {
                const collapse = (window as any).bootstrap?.Collapse?.getInstance(nav);

                collapse?.hide();
            }
        } catch (err) {
            console.error("Erro ao carregar rota -", err);
            this.outlet.innerHTML = `
                <div class="p-5 text-center">
                    <h2>Página não encontrada</h2>
                    <p>Ocorreu um erro ao carregar o conteúdo.</p>
                </div>`;
        }
    }

    private updateActiveLink(activePath: string): void {
        document.querySelectorAll<HTMLAnchorElement>("[data-route]").forEach(a => {
            const href = a.getAttribute("href") ?? "";
            const linkPath = href.replace(/^#/, "");
            a.classList.toggle("active", linkPath === activePath);
            a.setAttribute('aria-current', linkPath === activePath ? "page" : "false" );
        });
    }
}