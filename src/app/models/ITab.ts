interface ITab {

    active: boolean;
    audible: boolean;
    autoDiscardable: boolean;
    discarded: boolean;
    favIconUrl: string;
    height: number;
    highlighted: boolean;
    id: number;
    incognito: boolean;
    index: number;
    mutedInfo: { muted: boolean };
    pinned: boolean;
    selected: boolean;
    status: string;
    title: string;
    url: string;
    width: number;
    windowId: number;
}