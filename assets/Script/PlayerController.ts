import { _decorator, Component, Node, Input, input, EventTouch, Animation, Vec3 } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('PlayerContrl')
export class PlayerContrl extends Component {
  @property(Animation)
  private AnimBody:Animation;

  private _touchStartTime: number = 0; // 点击开始时间
  private _longPressDuration: number = 0.3; // 长按判定时间

  private _curJumpSpeed:number = 0.3; // 跳跃速度

  private _curPos:Vec3 = new Vec3(); // 当前坐标
  private _tarPos:Vec3 = new Vec3(); // 目标坐标
  private _deltaPos:Vec3 = new Vec3(0,0,0); // 需要增加的步长
  
  private _BaseLength:number = 100;

  start() {
    input.on(Input.EventType.TOUCH_START, this.tapStart, this)
    input.on(Input.EventType.TOUCH_END, this.tapEnd, this)
  }
  tapStart(evt: EventTouch) {
    this._touchStartTime = Date.now();
  }
  tapEnd(evt: EventTouch) {
    if (Date.now() - this._touchStartTime >= this._longPressDuration * 1000) { // 长按
      this.AnimBody.play('twoStep')
    }else{ // 短按
      this.AnimBody.play('oneStep')
    }



    this.node.getPosition(this._curPos)
  }


  update(dt: number) {

  }
}


