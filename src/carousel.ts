export type CarouselOptions = {
    interval?: number;
    showControls?: boolean;
    showIndicator?: boolean;
    loop?: boolean;
};

export class Carousel {
    private selector: string;
    private root: HTMLElement | null = null;
    private items: HTMLElement[] = [];
    private currentIndex = 0;
    private options: Required<CarouselOptions>;
    private autoplayId: number | null = null;
    private abort: AbortController | null = null;

    constructor(selector: string, options: CarouselOptions = {}){
        this.selector = selector;
        this.options = {
            interval: options.interval ?? 5000,
            showControls: options.showControls ?? true,
            showIndicator: options.showIndicator ?? true,
            loop: options.loop ?? true,
        };
    }

    public init(): void {
        this.destroy();

        this.root = document.querySelector<HTMLElement>(this.selector);
        if(!this.root){
            console.warn(`[Carousel] Container não encontrado em ${this.selector}`);
            return;
        }

        const inner = this.root.querySelector<HTMLElement>('.carousel-inner');
        if(!inner){
            console.warn(`[Carousel] Estrutura Inválida: falta carousel-inner`);
            return;
        }

        this.items = Array.from( inner.querySelectorAll<HTMLElement>('.carousel-item') );
        if (this.items.length === 0) {
            console.warn(`[Carousel] Nenhum item encontrado`);
            return;
        }

        this.root.classList.add('carousel','slide');

        this.items.forEach((item, i) => item.classList.toggle("active", i === 0));

        if (this.items.length > 1){
            if (this.options.showIndicator) this.ensureIndicators();
            if (this.options.showControls)  this.ensureControls();
        }

        this.currentIndex = 0;
        this.bindEvents();
        this.syncState();

        if (this.items.length > 1 && this.options.interval > 0){
            this.startAutoPlay();
        }
    }

    public destroy(): void {
        this.stopAutoPlay();
        this.abort?.abort();
        this.abort = null;

        this.root?.querySelectorAll("[data-carousel-generated]").forEach(el => el.remove());

        this.root = null;
        this.items = [];
        this.currentIndex = 0;
    }

    private ensureIndicators(): void {
        if (!this.root || this.root.querySelector('.carousel-indicators')) return;

        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        indicators.dataset.carouselGenerated = "true";

        this.items.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.type = "button";
            btn.dataset.carouselIndicator = String(i);
            btn.setAttribute("aria-label", `Slide ${i + 1}`);

            if (i === 0) {
                btn.classList.add("active");
                btn.setAttribute("aria-current", "true");
            }

            indicators.appendChild(btn);
        });

        const inner = this.root.querySelector('.carousel-inner');
        this.root.insertBefore(indicators, inner);
    }

    private ensureControls(): void {
        if (!this.root) return;

        if (!this.root.querySelector('[data-carousel-prev]')){
            const prev = document.createElement("button");
            prev.type = "button";
            prev.className = "carousel-control-prev";

            prev.dataset.carouselPrev = "";
            prev.dataset.carouselGenerated = "true";
            prev.setAttribute("aria-label", "Anterior");
            prev.innerHTML = `<span class="carousel-control-prev-icon" aria-hidden="true"></span>`;
            this.root.appendChild(prev);
        }

        if (!this.root.querySelector('[data-carousel-next]')){
            const next = document.createElement("button");
            next.type = "button";
            next.className = "carousel-control-next";

            next.dataset.carouselNext = "";
            next.dataset.carouselGenerated = "true";
            next.setAttribute("aria-label", "Próximo");
            next.innerHTML = `<span class="carousel-control-next-icon" aria-hidden="true"></span>`;
            this.root.appendChild(next);
        }
    }

    private bindEvents(): void {
        if (!this.root) return;

        this.abort = new AbortController();
        const { signal } = this.abort;

        this.root.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            if (target.closest('[data-carousel-prev]')) return this.prev();
            if (target.closest('[data-carousel-next]')) return this.next();

            const indicator = target.closest<HTMLButtonElement>("[data-carousel-indicator]");
            if(indicator) { this.goTo(Number(indicator.dataset.carouselIndicator)); }
        }, { signal });

        this.root.addEventListener("mouseenter", () => this.stopAutoPlay(), { signal });
        this.root.addEventListener("mouseleave", () => {
            if (this.items.length > 1 && this.options.interval > 0) this.startAutoPlay();
        }, { signal });

        let startX: number | null = null;

        this.root.addEventListener("touchstart", (e) => {
            const touch = e.touches[0];
            startX = touch ? touch.clientX: null;
        }, { signal, passive:true });

        this.root.addEventListener("touchend", (e) => {
            if (startX === null) return;
            const touch = e.changedTouches[0];
            if (!touch) { startX = null; return; }

            const diff = touch.clientX - startX;
            startX = null;
            if (Math.abs(diff) < 40) return;
            diff > 0 ? this.prev() : this.next();
        }, { signal, passive:true });
    }

    private goTo(index: number): void {
        if (this.items.length === 0) return;
        const total = this.items.length;

        this.currentIndex = this.options.loop
            ? ((index % total) + total) % total
            : Math.max(0, Math.min(index, total - 1));

        this.syncState();
    }

    private next(): void { this.goTo(this.currentIndex + 1); }
    private prev(): void { this.goTo(this.currentIndex - 1); }

    private syncState(): void {
        this.items.forEach((item, i) =>
            item.classList.toggle("active", i === this.currentIndex)
        );

        this.root
            ?.querySelectorAll<HTMLButtonElement>("[data-carousel-indicator]")
            .forEach((btn, i) => {
                const active = i === this.currentIndex;
                btn.classList.toggle("active", active);
                btn.setAttribute("aria-current", active ? "true" : "false");
            });
    }

    private startAutoPlay(): void {
        this.stopAutoPlay();
        this.autoplayId = window.setInterval(
            () => this.next(), this.options.interval
        );
    }

    private stopAutoPlay(): void {
        if (this.autoplayId !== null) {
            clearInterval(this.autoplayId);
            this.autoplayId = null;
        }
    }
}