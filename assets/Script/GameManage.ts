import { _decorator, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { BLOCK_SIZE,PlayerContrl } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_STONE
}

enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END
}

@ccclass('GameManage')
export class GameManage extends Component {
  // Player 基类
  @property({ type:PlayerContrl })
  private playerContrl:PlayerContrl | null = null;
  
  // stone 预制体
  @property({ type: Prefab })
  private StonePrefab: Prefab | null = null;
  // 道路长度
  @property
  public RoadLength: number = 100;
  // 开始菜单 节点
  @property({ type: Node })
  private startMenu: Node | null = null;
  
  // count Label
  @property({ type: Label })
  private countLabel: Label | null = null;


  private _road: BlockType[] = []; // 用于生成道路的数组


  start() {
    this.curState = GameState.GS_INIT


    this.playerContrl.node.on('PlayJumpEnd',this.onPlayerJumpEnd,this)
  }

  set curState(val:GameState){
    switch (val) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAYING:

        if(this.startMenu){
          this.startMenu.active = false;
        }
        this.countLabel.string = '0'
        setTimeout(()=>{
          if(this.playerContrl){
            this.playerContrl.setInputActive(true)
          }
        },0.1)
        break;
      case GameState.GS_END:
        this.end()
        break;
    }
  }
  // 游戏初始化
  init(){ 
    if(this.startMenu){
      this.startMenu.active = true;
    }
    this.generateRoad();

    
    if(this.playerContrl){
      this.playerContrl.setInputActive(false);

      this.playerContrl.node.setPosition(Vec3.ZERO); // 回归原位

      this.playerContrl.reset();
    }
    
  }
  // 游戏点击开始时
  playing(){
    this.curState = GameState.GS_PLAYING
  }
  // 道路生成逻辑
  generateRoad() {
    // 初始化道路
    this.node.removeAllChildren()
    this._road = [];

    this._road.push(BlockType.BT_STONE); // 第一段路必须是石头
    for (let i = 1; i < this.RoadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) { // 如果上一段路是空白则必须生成石头(因为角色跳跃能力有限)
        this._road.push(BlockType.BT_STONE)
      } else {
        this._road.push(Math.floor(Math.random() * 2));  // 取 空白 和 石头 其中之一
      }
    }
    for (let j = 0; j < this._road.length; j++) {
      let block:Node | null = this.spawnBlockByType(this._road[j])

      if(block){
        this.node.addChild(block)
        block.setPosition( j * BLOCK_SIZE ,-1 * BLOCK_SIZE,0)
      }
    }
  }
  // 石块生成逻辑
  spawnBlockByType(type:BlockType){ 
    if(!this.StonePrefab) return ; 
    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_STONE:
        block = instantiate(this.StonePrefab); // 复制预制体 instantiate: 是 Cocos Creator 提供的克隆预制体的方法。当然它不仅能克隆预制体，你甚至可以用它克隆别的类型比如某个对象！
        break;
    }
    return block
  }

  checkJumpStatus(curStep:number){
    if(this._road[curStep] === BlockType.BT_NONE){ // 证明落在了白块下
      this.curState = GameState.GS_END
    }
  }

  onPlayerJumpEnd(roadIndex:number){

    if(this.countLabel){
      // 因为在最后一步可能出现步伐大的跳跃，但是此时无论跳跃是步伐大还是步伐小都不应该多增加分数
      this.countLabel.string = '' + (roadIndex >= this.RoadLength ? this.RoadLength : roadIndex)
    }
    this.checkJumpStatus(roadIndex)
  }

  // 游戏结束
  end(){
    // this.playerContrl.AnimBody.play("drop");
    
    
    this.init();
  }

  // update(deltaTime: number) {

  // }
}


