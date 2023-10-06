import { _decorator, Component, Node , Label, Vec2, v2, input, Input, Color, Sprite, CCInteger} from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

// 格子枚举, 普通，开始节点，结束节点，路径，障碍物  0/1/2/3/4
export enum ECellType {
    NOMAL,
    START,
    END,
    PATH,
    OBSTACLES,
}

@ccclass('MapCell')
@executeInEditMode
export class MapCell extends Component {

    @property({type : Label})
    private eName: Label = null;

    @property({type : CCInteger})
    myType : number = 0;

    private mOnClick: (pos: Vec2) => void = null;
    private mX: number = null;
    private mY: number = null;

    protected onLoad(): void {
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    init(x: number, y: number, onClick: (pos: Vec2) => void) {
        this.mX = x;
        this.mY = y;
        this.mOnClick = onClick;
        this.eName.string = `${x}_${y}`;
    }
    
    setType(type: number) {
        let color: Color = new Color(113, 190, 113);
        switch(type) {
            case ECellType.START: {
                color = new Color(125, 125, 226);
                break;
            }
            case ECellType.END: {
                color = new Color(226, 125, 125);
                break;
            }
            case ECellType.PATH: {
                color = new Color(125, 226, 125);
                break;
            }
            case ECellType.OBSTACLES: {
                color = new Color(125, 125, 125);
                break;
            }
            case ECellType.NOMAL: {
                color = new Color(255, 255, 255);
                break;
            }
        }
        this.node.getComponent(Sprite).color = color;

    }

    onTouchEnd() {
        this.mOnClick && this.mOnClick(v2(this.mX, this.mY));
    }
}
