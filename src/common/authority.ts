export class Authority {
    static instance: Authority;
    static get(){
        if(this.instance === undefined){
            this.instance = new (Authority);
        }
        return this.instance;
    }

    protected _isAuthority = false;

    constructor(){

    }

    requestAuthority(){
        this._isAuthority = true;
    }

    hasAuthority() {
        return this._isAuthority;
    }
}
export default Authority;