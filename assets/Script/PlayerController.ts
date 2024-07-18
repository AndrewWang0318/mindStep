import { _decorator, Component, Node, Input, input, EventTouch, Animation, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 100; // 添加一个放大比
@ccclass('PlayerContrl')
export class PlayerContrl extends Component {
  // Body的动画
  @property(Animation)
  public AnimBody:Animation;

  
  private _touchStartTime: number = 0; // 点击开始时间
  private _longPressDuration: number = 0.3; // 长按判定时间


  private _startJump:boolean = false; // 是否在跳跃中
  private _jumpStep:number = 0; // 跳跃步数


  private _jumpTime:number = 0.3; // 跳跃时间

  private _curJumpTime:number = 0; // 当前跳跃时间
  private _curJumpSpeed:number = 0; // 当前跳跃速度

  private _curPos:Vec3 = new Vec3(); // 当前坐标
  private _deltaPos:Vec3 = new Vec3(0,0,0); // 需要增加的步长
  private _tarPos:Vec3 = new Vec3(); // 目标坐标
  
  private _curMoveIndex:number = 0; // 当前已跳跃的步数
  
  start() { 
    
  }

  setInputActive(type:boolean){ // 是否开启按钮输入
    if(type){
      input.on(Input.EventType.TOUCH_START, this.tapStart, this)
      input.on(Input.EventType.TOUCH_END, this.tapEnd, this)
    }else{
      input.off(Input.EventType.TOUCH_START, this.tapStart, this)
      input.off(Input.EventType.TOUCH_END, this.tapEnd, this)
    }
  }


  tapStart(evt: EventTouch) {
    this._touchStartTime = Date.now();
  }
  tapEnd(evt: EventTouch) {
    const isLongTap:boolean = Date.now() - this._touchStartTime >= this._longPressDuration * 1000;
    this.stepJump(isLongTap ? 2 : 1);
  }


  stepJump(step:number){
    if(this._startJump) return;

    if (this.AnimBody) {
      const animType = step === 1 ? 'oneStep' :'twoStep'
      const state = this.AnimBody.getState(animType); // 获取动画的状态
      this._jumpTime = state.duration;

      this.AnimBody.play(animType)
    }
    this._jumpStep = step
    this._curJumpTime = 0; // 重置当前跳跃时间
    this._curJumpSpeed = this._jumpStep * BLOCK_SIZE / this._jumpTime;

    this.node.getPosition(this._curPos) // 获取当前坐标点
    Vec3.add(this._tarPos,this._curPos,new Vec3(this._jumpStep * BLOCK_SIZE,0,0)); // 修改目标坐标点点


    this._curMoveIndex += step

    this._startJump = true
  }
  reset(){
    this._curMoveIndex = 0; // 跳跃步数置0
  }


  jumpEnd(){
    this.node.emit('PlayJumpEnd',this._curMoveIndex)
  }

  update(dt: number) {
    if(this._startJump){
      this._curJumpTime += dt;

      if(this._curJumpTime > this._jumpTime){ // 跳跃已经结束
        
        this.node.setPosition(this._tarPos); // 解决偏移量不准问题,最终落地到目标点

        this._startJump = false

        this.jumpEnd()
      }else{ // 跳跃中
        this.node.getPosition(this._curPos);// 持续给当前节点赋值

        this._deltaPos.x = this._curJumpSpeed * dt;
        Vec3.add(this._curPos,this._curPos,this._deltaPos);
        this.node.setPosition(this._curPos);
      }
    }
  }
}


