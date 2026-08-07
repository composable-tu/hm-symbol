# HM Symbol

由于华为开发者联盟官网的图标资源非常不齐全，而 DevEco Studio 中甚至没有图标预览，因此有了这个网站。

纯 AI 编写，用于便捷查找 HM Symbol 中的图标，方便鸿蒙开发者使用。

## 关于别名机制

HM Symbol 中，对图标的命名有一部分是物理描述性命名，比如「复制」操作对应的图标不叫 `copy`，而叫 `plus_square_on_square`（一个加号方块叠在另一个方块上）。这种命名对开发者并不直观——你脑子里想搜的是「copy」，但字体里根本没有这个词。

因此，本仓库引入了别名机制。在本网站搜索图标时，除了搜索到图标本名，也可以搜索到打了对应别名的图标。

欢迎提交 PR 为图标补充别名。编辑 [`src/overrides.json`](src/overrides.json) 即可，格式如下：

```json5
[
    {
        "name": "<Symbol 名>", // Symbol 中的原始名
        "aliases": ["<别名 1>", "<别名 2>"]
    }
]
```

以为复制图标添加 `copy` / `duplicate` 别名为例：

```json
[
  { "name": "plus_square_on_square", "aliases": [ "copy", "duplicate" ] }
]
```
