export default interface IPool {
    name: string;
    url: string;
    tabAddress?: string;
    lastBlock?: number;
    lastBlockHTMLSelector?: string;
    forToken?: string;
    active?: boolean;
}
