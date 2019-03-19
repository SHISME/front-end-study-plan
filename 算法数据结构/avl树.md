# AVL 树

AVL树，也称平衡二叉搜索树，AVL是其发明者姓名简写。AVL树属于树的一种，而且它也是一棵二叉搜索树，不同的是他通过一定机制能保证二叉搜索树的平衡，平衡的二叉搜索树的查询效率更高。

# AVL树特点

- AVL树是一棵二叉搜索树。
- AVL树的左右子节点也是AVL树。
- AVL树拥有二叉搜索树的所有基本特点。
- 每个节点的左右子节点的高度之差的绝对值最多为1，即平衡因子为范围为[-1,1]。

## 二叉搜索树的平衡

基础的二叉搜索树构建出来可能会存在不平衡的现象，比如极端情况下，按照A B C D E F G H顺序插入树中，结果为，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10ebee5df2c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

所以AVL树的出现就是为了解决平衡性问题，它的核心内容就是平衡处理机制，即所谓的旋转，一共有四种形式的旋转：右单旋、左单旋、左右双旋和右左双旋。

## 插入方式

AVL树一共有四种插入方式，根据插入方式不同需要做不同的旋转操作，现在往下看四种插入方式，设受插入节点影响而失去平衡的节点的父节点为Z，

### LL插入方式

插入的节点在E节点的左子树的左子树上，如下图，“A”节点插入影响“C”节点的平衡，“C”的父节点为“E”，插入节点“A”在“E”节点的左子树的左子树上。即“B”节点的左右子节点都算LL插入。

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10ede725a13?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### RR插入方式

插入的节点在E节点的右子树的右子树上，如下图，“I”节点插入影响“G”节点的平衡，“G”的父节点为“E”，插入节点“I”在“E”节点的右子树的右子树上。即“H”节点的左右子节点都算RR插入

### LR插入方式

插入的节点在Z节点的左子树的右子树上，如下图，“C”节点插入影响“B”节点的平衡，“B”的父节点为“E”，插入节点“C”在“E”节点的左子树的右子树上。即“D”节点的左右子节点都算LR插入

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f205dec1f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### RL插入方式

插入的节点在Z节点的右子树的左子树上，如下图，“G”节点插入影响“H”节点的平衡，“H”的父节点为“E”，插入节点“G”在“E”节点的右子树的左子树上。即“F”节点的左右子节点都算RL插入。

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10ee0e590df?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)


## 旋转

### 左旋转

左单旋用于处理RR插入方式，假设存在一棵树，如下，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f4b0e0ce2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

“G”节点左单旋即将“G”节点提高，原本它的父节点“E”则变为其左子节点，“G”节点原来的左子节点则变为其父节点“E”的右子节点。左单旋后的结果如下，重新达到了平衡。

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f36536e2c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 右旋转

右单旋用于处理LL插入方式，假设存在一棵树，如下，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f0a6c64f5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

“C”节点右单旋即将“C”节点提高，原本它的父节点“E”则变为其右子节点，“C”节点原来的右子节点则变为其父节点“E”的左子节点。右单旋后的结果如下，重新达到了平衡。

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f2524388f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 左右双旋

左右双旋用于处理LR插入方式，假设存在一棵树，如下，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f4793bdf8?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

先以“D”节点为轴进行左单旋，结果为，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f25ddd5c0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

再以“D”节点为轴进行右单旋，得到最终结果，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f52b61220?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

###  右左双旋

右左双旋用于处理RL插入方式，假设存在一棵树，如下，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f544be84e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

先以“F”节点为轴进行右单旋，结果为，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f6fa7a7ea?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

再以“F”节点为轴进行左单旋，得到最终结果，

![](https://user-gold-cdn.xitu.io/2018/8/9/1651c10f72d33b64?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



