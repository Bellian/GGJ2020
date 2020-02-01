import LevelObject from "./levelObject";
import { vec2 } from "gl-matrix";

export class Placeholder extends LevelObject {

    render(): HTMLElement {
        const view = super.render();
        view.classList.add('placeholder');
        return view;
    }
}
export default Placeholder;