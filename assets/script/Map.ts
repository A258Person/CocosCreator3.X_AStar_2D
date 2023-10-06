import { _decorator, Component, Node, Vec2, Color, Prefab, v2,v3, EditBox, instantiate, Toggle, Input, UITransform, Sprite } from 'cc';

import AStar from "./AStar";
import {MapCell, ECellType } from "./MapCell";
const { ccclass, property } = _decorator;

@ccclass('Map')
export class Map extends Component {

    @property({type : Prefab})
    eCell: Prefab = null;

    @property({type : Node})
    eLayout: Node = null;

    @property({type : EditBox})
    eX: EditBox = null;

    @property({type : EditBox})
    eY: EditBox = null;

    @property({type : Node})
    eEditCheck: Node = null;

    private star = new AStar();
    private mCells = {};

    private mSize: Vec2 = null;
    private mStart: Vec2 = null;
    private mEnd: Vec2 = null;
    private mObstacles: Vec2[] = [];
    private mType: 4|8 = 4; 
    private mEditType: 'start'|'end'|'obs' = null;
    private mLastPath: Vec2[] = [];
    start () {
        const start = v2(1, 4);
        const end = v2(9, 6);
        const obstacles = [
            v2(5, 0),
            v2(5, 1),
            v2(5, 2),
            v2(5, 3),
            v2(5, 4),
            v2(5, 5),
            v2(5, 6),
            v2(5, 7),
            v2(5, 8),
        ];
        this.eX.string = "12";
        this.eY.string = "12";

        this.createMap();
        this.setStart(start);
        this.setEnd(end);
        this.setObstacles(obstacles);

        this.runAStar();
        this.refreshUI();
    }

    runAStar() {
        this.star.init(this.mSize, this.mStart, this.mEnd, this.mObstacles);
        this.star.run(this.mType);
    }
    
    refreshUI() {
        this.mObstacles.forEach((ele) => {
            this.setCell(ele, ECellType.OBSTACLES);
        });
        this.mLastPath = this.star.getPath();
        this.mLastPath.forEach((ele) => {
            this.setCell(ele, ECellType.PATH);
        });
        this.setCell(this.mStart, ECellType.START);
        this.setCell(this.mEnd, ECellType.END);
    
        let tempX = 2 + (50 + 2) * this.mSize.x;
        let tempY = this.eLayout.getComponent(UITransform).contentSize.height;
        this.eLayout.getComponent(UITransform).setContentSize(tempX, tempY);
    }

    createMap() {
        const x = Number(this.eX.string);
        const y = Number(this.eY.string);

        this.mSize = v2(x, y);
        this.mCells = {};
        this.mStart = null;
        this.mEnd = null;
        this.mObstacles = [];

        let tempX = 2 + (50 + 2) * this.mSize.x;
        let tempY = this.eLayout.getComponent(UITransform).contentSize.height;
        this.eLayout.getComponent(UITransform).setContentSize(tempX, tempY);
        this.eLayout.destroyAllChildren();
        for (let y = 0; y < this.mSize.y; y++){
            for (let x = 0; x < this.mSize.x; x++) {
                this.createCell(x, y);
            }
        }
    }

    // 创建cell
    createCell(x: number, y: number) {
        const node = instantiate(this.eCell);
        node.parent = this.eLayout;
        this.mCells[`${x}_${y}`] = node.getComponent(MapCell);
        this.mCells[`${x}_${y}`].init(x, y, this.onCellClick.bind(this));
    }

    // 设置cell类型
    setCell(pos: Vec2, type: ECellType) {
        this.mCells[`${pos.x}_${pos.y}`].setType(type);
    }

    // 设置开始节点
    setStart(pos: Vec2) {
        console.log("开始设置起点")
        if (this.mStart) {
            this.setCell(this.mStart, ECellType.NOMAL);
        }
        this.setCell(pos, ECellType.START);
        this.mStart = pos;
    }

    // 设置目标节点
    setEnd(pos: Vec2) {
        if (this.mEnd) {
            this.setCell(this.mEnd, ECellType.NOMAL);
        }
        this.setCell(pos, ECellType.END);
        this.mEnd = pos;
    }

    // 设置障碍
    setObstacle(pos: Vec2) {
        if (pos.x === this.mStart.x && pos.y === this.mStart.y) {
            return;
        }
        if (pos.x === this.mEnd.x && pos.y === this.mEnd.y) {
            return;
        }
        let idx = -1;
        for (let i = 0; i < this.mObstacles.length; i++) {
            const ele = this.mObstacles[i];
            if (pos.x === ele.x && pos.y === ele.y) {
                idx = i;
                break;
            }
        }
        if (idx >= 0) {
            this.setCell(pos, ECellType.NOMAL);
            this.mObstacles.splice(idx, 1);
        } else {
            this.setCell(pos, ECellType.OBSTACLES);
            this.mObstacles.push(pos);
        }
    }

    setPath(pos: Vec2) {
        this.setCell(pos, ECellType.PATH);
    }

    clearPath() {
        this.mLastPath.forEach((ele, i) => {
            if (i ===0 || i === this.mLastPath.length - 1) {
                return;
            }
            this.setCell(ele, ECellType.NOMAL);
        })
        this.mLastPath.length = 0;
    }

    // 批量添加障碍物
    setObstacles(posArr: Vec2[]) {
        posArr.forEach((ele) => {
            this.setObstacle(ele);
        });
    }

    // 选择寻路类型
    onClickType(toggle: Toggle, tag: string) {
        this.mType = Number(tag) as any;
    }

    // 点击进行执行寻路
    onClickRun() {
        this.clearPath();
        this.runAStar();
        this.refreshUI();
    }

    // 地图尺寸编辑完毕
    onSizeEditEnd() {
        this.createMap();
    }

    // 点击左上角的选项
    onCellEdit(event , tag: string) {
        if (this.mEditType === tag) {
            this.mEditType = null;
        } else {
            this.mEditType = tag as any;
        }
        if (this.mEditType) {
            this.eEditCheck.position = event.target.position;
            this.eEditCheck.active = true;
            let color = null;
            if (this.mEditType === 'start') {
                color = new Color(125, 125, 226);
            } else if (this.mEditType === 'end') {
                color = new Color(226, 125, 125);
            } else if (this.mEditType === 'obs') {
                color = new Color(125, 125, 125);
            }
            this.eEditCheck.getComponentInChildren(Sprite).color = color;
        } else {
            this.eEditCheck.active = false;
        }
    }

    // 绑定的回调,点击格子设置对应的颜色
    onCellClick(pos: Vec2) {
        if (this.mEditType) {
            this.clearPath();
        }
        console.log("点击一个方块坐标", pos);
        if (this.mEditType === 'start') {
            this.setStart(pos);
        } else if (this.mEditType === 'end') {
            this.setEnd(pos);
        } else if (this.mEditType === 'obs') {
            this.setObstacle(pos);
        }
    }
}

