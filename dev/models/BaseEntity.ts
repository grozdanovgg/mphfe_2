import IConstructOptions from './IConstructOptions';


export default class BaseEntity {
    constructor(options) {
        this.applyOptions(options);
    }
    protected applyOptions(options: IConstructOptions) {

        for (const option in options) {
            // TODO this does not work, but similar logic should be implemented
            // if (this.hasOwnProperty(option)) {
            this[option] = options[option];
            // }
        }
    }
}