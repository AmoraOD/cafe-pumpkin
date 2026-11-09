export type CarouselOptions = {
    interval?: number;
    showControls?: boolean;
    showIndicator?: boolean;
    loop?: boolean;
};

export class Carousel{
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
            interval: options.interval ?? 500,
            showControls: options.showControls ?? true,
            showIndicator: options.showIndicator ?? true,
            loop: options.loop ?? true,
        };
    }

    public init(): void{
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
    }

    private destroy(): void{}
}