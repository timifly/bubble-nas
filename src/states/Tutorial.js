import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, CENTER_X, CENTER_Y, 
    ROWS, COLUMNS, TILE_SIZE, ANCHOR_OFFSET, MIN_HEIGHT,
    HEADER_FONT_SIZE, DESC_FONT_SIZE, NAV_FONT_SIZE
} from '../utils/Constants';
import { setSize } from '../utils/Helpers';

const adjustSize = setSize(MIN_HEIGHT, CANVAS_HEIGHT);

class Tutorial extends Phaser.State {
    create() {       
        // builder
        this.createTiles();
        this.createInstructions();
        this.theme = this.game.data.audio.theme0;

        // events
        this.game.keyEnter.onDown.add(this.changeState, this);
    }

    createTiles() {
        this.tiles = this.add.group();
        this.tiles.createMultiple(ROWS * COLUMNS, 'tile-3', null, true);
        this.tiles.setAll('width', TILE_SIZE);
        this.tiles.setAll('height', TILE_SIZE);
        // rows and columns are opposites for this method
        this.tiles.align(COLUMNS, ROWS, TILE_SIZE, TILE_SIZE);
    }

    createInstructions() {
        this.instructions = this.add.group();

        let rules = "• 使用启动器清除所有气泡，以继续下一轮.\n"
            + "• 使用相同的颜色附着到3个或更多的簇，以消除气泡.\n"
            + "• 如果它们悬挂在集群上，也可以移除不同颜色的气泡.\n"
            + "• 去掉的每个泡泡都值10分.\n"
            + "• 每个被移除的悬挂气泡每个颜色值10 ^（总悬挂气泡）点.\n"
            + "• 总共有50回合和每场比赛6个学分。 祝你好运!"

        let rulesHeader = this.add.bitmapText(TILE_SIZE, ANCHOR_OFFSET, 'upheaval', 'RULES', HEADER_FONT_SIZE, this.instructions);
        let rulesDesc = this.add.text(TILE_SIZE, TILE_SIZE * 2, rules, {font: DESC_FONT_SIZE + "px monospace", fill: "white", align: "left", stroke: 'black', strokeThickness: 3}, this.instructions);

        let controls = "• 空格 = 启动泡泡\n"
            + "• 箭头左/右 = 旋转发射器\n"
            + "• ENTER = 选择导航\n"
            + "• 箭头 上/下 = 切换导航"
        
        let controlHeader = this.add.bitmapText(TILE_SIZE, CENTER_Y + TILE_SIZE, 'upheaval', 'CONTROLS', HEADER_FONT_SIZE, this.instructions);
        let controlDesc = this.add.text(TILE_SIZE, CENTER_Y + (TILE_SIZE * 2) + ANCHOR_OFFSET, controls, {font: DESC_FONT_SIZE + "px monospace", fill: "white", align: "left", stroke: 'black', strokeThickness: 3}, this.instructions);

        // adding instruction text
        let instructions = this.add.text(
            ANCHOR_OFFSET - adjustSize(3), CANVAS_HEIGHT - ANCHOR_OFFSET,
            "按ENTER键返回",
            { font: DESC_FONT_SIZE + "px monospace", fill: "white", align: "left", stroke: 'black', strokeThickness: 3 },
        );

        instructions.anchor.set(0, 0.35);
        instructions.alpha = 0;

        // Yoyo the text
        let instructionsTween = this.add.tween(instructions).
            to({ alpha: 1 }, 500, "Linear", true, 0, -1);

        instructionsTween.yoyo(true, 300); 
    }

    changeState(e) {
        this.state.start('menu');
    }

    shutdown() {
        this.game.keyEnter.onDown.remove(this.changeState, this);
    }
}

export default Tutorial;