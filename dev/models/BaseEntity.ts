import IConstructOptions from './IConstructOptions';


export default class BaseEntity {
    constructor(options) {
        this.applyOptions(options);
    }
    protected applyOptions(options: IConstructOptions) {

        for (const option in options) {
            if (this.hasOwnProperty(option)) {
                this[option] = options[option];
            }
        }
    }
}