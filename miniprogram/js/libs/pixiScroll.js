import * as TweenMax from './TweenMax.min';
function pixiScroll(PIXI, app, property) {
    function ScrollContainer() {
        this.po = new PIXI.Container();
        this.scrollContainer = new PIXI.Container();
        this.po.addChild(this.scrollContainer);
        this.items = [];

        this.mask = new PIXI.Graphics();
        this.mask
            .beginFill(0xffffff)
            .drawRect(0, 135 * (property.height / 1334), property.width, property.height)
            .endFill();
        this.po.addChild(this.mask);
        this.scrollContainer.mask = this.mask;

        this.itemHeight = 0;

        var _this = this;

        var mousedown = false;
        var lastPos = null;
        var lastDiff = null;
        var scrollTween = null;
        // var maxVel = 0;

        function onmousemove(e) {
            var clientY = e.data.global.y;

            if (mousedown) {
                lastDiff = clientY - lastPos.y;
                lastPos.y = clientY;

                if (-_this.scrollContainer.y < 0) {
                    _this.scrollContainer.y += lastDiff / 2;
                } else {
                    _this.scrollContainer.y += lastDiff;
                }
            }
        }
        function onmousedown(e) {
            var clientY = e.data.global.y;
            mousedown = true;
            if (scrollTween) scrollTween.kill();
            lastPos = {
                y: clientY
            };
        }
        function onmouseup() {
            var goY = _this.scrollContainer.y + lastDiff * 10,
                ease = 'Quad.easeOut',
                time = Math.abs(lastDiff / _this.itemHeight),
                contentHigh = property.height;

            if (goY < -_this.itemHeight + contentHigh) {
                goY = -_this.itemHeight + contentHigh;
                ease = 'Back.easeOut';
                time = 0.1 + Math.abs(lastDiff / _this.itemHeight);
            }
            if (goY > 0) {
                goY = 0;
                ease = 'Back.easeOut';
                time = 0.1 + Math.abs(lastDiff / _this.itemHeight);
            }

            if (_this.scrollContainer.y > 0) {
                time = Math.abs(_this.scrollContainer.y / (contentHigh * 2));
                ease = 'Linear';
            }
            if (_this.scrollContainer.y < -_this.itemHeight + contentHigh) {
                time = Math.abs(_this.scrollContainer.y / (contentHigh * 2));
                ease = 'Linear';
            }

            scrollTween = TweenMax.to(_this.scrollContainer, time, {
                y: goY,
                ease: ease
            });

            mousedown = false;
            lastPos = null;
            lastDiff = null;
        }

        this.po.interactive = true;
        this.po.touchmove = onmousemove;
        this.po.touchstart = onmousedown;
        this.po.touchend = onmouseup;
    }

    function ListItem(value, apiName) {
        this.po = new PIXI.Container();
        this.bg = new PIXI.Graphics();
        this.po.addChild(this.bg);
        this.width = property.width - 60 * PIXI.ratio;
        this.drawHeight = 120 * PIXI.ratio;
        this.cornerRadius = 2 * PIXI.ratio;

        let itemsName = value.children && Object.keys(value.children);
        if (itemsName && itemsName.length) {
            this.child = new ChildListItem(this, value.children, itemsName);
            this.child.po.y = this.drawHeight - this.cornerRadius;
            this.childHeight = this.child.po.height - this.cornerRadius;
            this.po.addChild(this.child.po);
        }

        this.bg
            .beginFill(0xffffff)
            .drawRoundedRect(0, 0, this.width, this.drawHeight, this.cornerRadius)
            .endFill();
        this.po.x = 30 * PIXI.ratio;

        if (property.parent) {
            text1.call(this, 26, 26);
            text2.call(this);
        } else {
            let sprite = new PIXI.Sprite(PIXI.loader.resources[`images/${apiName}.png`].texture);
            this.bg.addChild(sprite);
            sprite.width = sprite.height = sprite.width * 0.32 * PIXI.ratio;
            sprite.position.set(this.width - sprite.width - 32 * PIXI.ratio, (this.drawHeight - sprite.height) / 2);
            text1.call(this, 32, 44);
        }

        this.drawHeight += 20 * PIXI.ratio;

        this.bg.interactive = true;
        this.bg.apiName = apiName;
        this.bg.touchstart = e => {
            e.target.recordY = e.data.global.y;
        };
        this.bg.touchend = e => {
            if (Math.abs(e.target.recordY - e.data.global.y) < 5) {
                if (this.child) {
                    this.child.po.visible = !this.child.po.visible;
                    e.target.children[0].alpha = this.child.po.visible ? 0.2 : 1;
                    e.target.children[1].alpha = e.target.children[0].alpha;
                    this.childHeight = -this.childHeight;
                    for (let i = sc.items.indexOf(this) + 1, len = sc.items.length; i < len; i++) {
                        sc.items[i].po.y = sc.items[i].po.y - this.childHeight;
                    }
                    let lastOne = sc.items.length - 1;
                    sc.itemHeight = sc.items[lastOne].po.y + sc.items[lastOne].drawHeight;
                    return;
                }
                let callback = property.method[e.target.apiName].callback;
                if (callback) return callback(e);
                window.router.to(e.target.apiName);
            }
        };

        function text1(fontSize, y) {
            let text1 = new PIXI.Text(value.label, {
                fontSize: `${fontSize * PIXI.ratio}px`
            });

            text1.position.set(32 * PIXI.ratio, y * PIXI.ratio);

            this.bg.addChild(text1);
        }

        function text2() {
            let text2 = new PIXI.Text(apiName, {
                fontSize: `${32 * PIXI.ratio}px`
            });
            text2.position.set(32 * PIXI.ratio, 65 * PIXI.ratio);
            this.bg.addChild(text2);
        }
    }

    function ChildListItem(parent, itemObj, itemsName) {
        let po = new PIXI.Graphics(),
            line,
            text,
            icon;
        for (let i = 0, item, len = itemsName.length; i < len; i++) {
            item = new PIXI.Graphics();
            item.beginFill(0xffffff)
                .drawRect(0, 0, parent.width, 96 * PIXI.ratio)
                .endFill();
            if (i) {
                line = new PIXI.Graphics()
                    .lineStyle(PIXI.ratio | 0, 0xd8d8d8)
                    .moveTo(30 * PIXI.ratio, 0)
                    .lineTo(parent.width - 30 * PIXI.ratio, 0);
                item.addChild(line);
            }

            text = new PIXI.Text(itemObj[itemsName[i]].label, {
                fontSize: `${32 * PIXI.ratio}px`
            });
            text.position.set(30 * PIXI.ratio, (item.height - text.height) / 2);

            icon = new PIXI.Sprite(PIXI.loader.resources['images/right.png'].texture);
            icon.width = icon.height = 48 * PIXI.ratio;
            icon.position.set(item.width - icon.width - 32 * PIXI.ratio, (item.height - icon.height) / 2);

            item.y = i * item.height + parent.cornerRadius;
            item.apiName = itemsName[i];

            item.interactive = true;
            item.touchstart = e => {
                if (!e.switchColorFn) e.switchColorFn = switchColorFn;
                e.currentTarget.touchmove = e => {
                    if (Math.abs(e.recordY - e.data.global.y) > 4) {
                        e.currentTarget.touchmove = e.currentTarget.touchend = null;
                        e.switchColorFn.call(item, 0xffffff);
                    }
                };
                e.currentTarget.touchend = e => {
                    e.target.touchmove = e.target.touchend = null;
                    if (Math.abs(e.recordY - e.data.global.y) < 5) {
                        let callback = itemObj[item.apiName].callback;
                        callback ? callback(e) : window.router.to(item.apiName);
                        e.switchColorFn.call(item, 0xffffff);
                    }
                };
                e.recordY = e.data.global.y;
                e.switchColorFn.call(item, 0xededed);
            };
            item.addChild(text, icon);
            po.addChild(item);
            this.totalHeight = item.y + item.height;
        }

        function switchColorFn(color) {
            this.clear();
            this.beginFill(color)
                .drawRect(0, 0, parent.width, 96 * PIXI.ratio)
                .endFill();
        }

        po.beginFill(0xffffff)
            .drawRoundedRect(0, 0, parent.width, this.totalHeight, parent.cornerRadius)
            .endFill();

        po.visible = false;
        this.po = po;
    }

    function Headline() {
        let div = new PIXI.Container(),
            sprite = new PIXI.Sprite(PIXI.loader.resources['images/APIicon.png'].texture);
        sprite.width = sprite.height = 96 * PIXI.ratio;
        sprite.position.set((property.width - sprite.width) / 2, 135 * (property.height / 1334));
        div.addChild(sprite);

        let text = new PIXI.Text('以下将演示小游戏接口能力，具体属性\n参数详见PC端的小游戏开发文档', {
            fontSize: `${28 * PIXI.ratio}px`,
            fill: 0x757575,
            lineHeight: 38 * PIXI.ratio,
            align: 'center'
        });
        text.position.set((property.width - text.width) / 2, sprite.y + sprite.height + 56 * PIXI.ratio);
        div.addChild(text);
        this.drawHeight = text.y + text.height + 90 * PIXI.ratio;
        this.po = div;
        sc.scrollContainer.addChild(this.po);
    }

    function PlaceholderDiv() {
        let div = new PIXI.Graphics();
        div.beginFill(0xffffff, 0)
            .drawRect(0, 0, 0, 135 * (property.height / 1334))
            .endFill();
        this.drawHeight = div.height;
        this.po = div;
        sc.scrollContainer.addChild(this.po);
    }
    function GoBack() {
        this.button = new PIXI.Graphics();
        this.arrow = new PIXI.Graphics();
        this.button.position.set(0, 52 * Math.ceil(PIXI.ratio));
        this.button
            .beginFill(0xffffff, 0)
            .drawRect(0, 0, 80 * PIXI.ratio, 80 * PIXI.ratio)
            .endFill();
        this.arrow
            .lineStyle(5 * PIXI.ratio, 0x333333)
            .moveTo(50 * PIXI.ratio, 20 * PIXI.ratio)
            .lineTo(30 * PIXI.ratio, 40 * PIXI.ratio)
            .lineTo(50 * PIXI.ratio, 60 * PIXI.ratio);
        this.button.interactive = true;
        this.button.touchend = () => {
            window.router.goBack();
        };

        this.button.addChild(this.arrow);
    }

    var sc = new ScrollContainer();
    sc.items.push(property.parent ? new PlaceholderDiv() : new Headline());
    sc.itemHeight += sc.items[0].drawHeight;

    function drawItemsFn(methods) {
        for (var i = 0, nameList = Object.keys(methods), len = nameList.length; i < len; i++) {
            var li = new ListItem(methods[nameList[i]], nameList[i]);
            sc.scrollContainer.addChild(li.po);
            li.po.y = sc.items[i].po.y + sc.items[i].drawHeight;
            sc.itemHeight += li.drawHeight;
            sc.items.push(li);
        }
    }

    drawItemsFn(property.method);

    property.parent && sc.po.addChild(new GoBack().button);
    property.parent && (sc.po.visible = false);
    app.stage.addChild(sc.po);
    return sc.po;
}

module.exports = pixiScroll;
