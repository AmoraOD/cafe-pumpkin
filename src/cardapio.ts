export type food = {
    name: string;
    price: number;
    desc: string;
    category: string;
    btn_ctg: boolean;
}

export class Menu{
    private root: HTMLElement | null = null;
    private itens: HTMLElement[] = [];

    constructor() {}
}