class Controller{
    private startPos:[number, number] | undefined = undefined;
    constructor(){
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init(){
        document.querySelectorAll('controller')[0].addEventListener('touchstart', (ev) => {
            this.startPos = [(ev as TouchEvent).targetTouches[0].clientX, (ev as TouchEvent).targetTouches[0].clientY];
        });
        document.querySelectorAll('controller')[0].addEventListener('touchmove', (ev) => {
            if(this.startPos !== undefined){
                
            }
        });
        document.querySelectorAll('controller')[0].addEventListener('touchend', (ev) => {
            
        });
    }
}