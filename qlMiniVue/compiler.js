/* 
Compiler.js
Compiler主要是对Dom元素进行操作 */
class Compiler {
	constructor(vm) {
		// 这里创建Vue实例的时候就传入了 options,在Vue类中重新将 options.el 赋值给了 this.$el
		this.el = vm.$el
		// 将 vm 实例暂存到 vm 中
		this.vm = vm
		// 调用compile方法，传入el(DOM对象)
		this.compile(this.el)
	}
	//编译模板，处理文本节点和元素节点。编译模板的方法 compile 对模板的编译其实就是对DOM的操作，所以这里的 el 是DOM元素
	compile (el) {
		// 遍历DOM对象中所有的节点，并且判断所有节点的类型，因为需要对不同的节点进行不同的操作 
		//获取子节点. 这里传入的 el 其实就是index.html里面的<div id="app"></div>部分，获取 el 对象中所有的子节点
		// let childNodes = [...el.childNodes]   这样也可以转换成真数组
		let childNodes = el.childNodes;
		//childNodes是一个伪数组，需要转换成真正的数组，然后可以执行forEach来进行遍历，每遍历一次获取一个节点，然后判断节点的类型.
		Array.from(childNodes).forEach((node) => {
			//处理文本节点
			if (this.isTextNode(node)) {
				this.compileText(node);
			} else if (this.isElementNode(node)) {
				// 处理元素节点
				this.compileElement(node);
			}
			//判断node节点，是有还有子节点，如果有子节点，需要递归调用compile方法
			if (node.childNodes && node.childNodes.length) {
				this.compile(node);
			}
		});
	}

	// 编译文本节点，处理差值表达式
	compileText (node) {
		// console.dir(node);
		// {{ msg }}
		//我们是用data中的属性值替换掉大括号中的内容
		let reg = /\{\{(.+)\}\}/;
		//获取文本节点的内容
		let value = node.textContent;
		console.log(value)   // {{msg}}
		//判断文本节点的内容是否能够匹配正则表达式，如果匹配说明是标准的插值表达式的内容，那么就执行替换操作
		if (reg.test(value)) {
			//获取插值表达式中的变量名,去掉空格（RegExp.$1 表示获取正则表达式中第一个分组的内容。）
			let key = RegExp.$1.trim();
			console.log(key)   // msg
			/*根据变量名，获取data中的具体值，然后替换掉差值表达式中的变量名. 我们上面将Vue实例赋值给了this.vm，所以这里的this.vm 就指的是Vue的实例，
			我们之前将data中的数据注入到了Vue中了，那么我们就可以通过this[key]就可以取到key对应的属性值，因为这里的Vue实例this被暂存到了this.vm中，
			那么拿到具体的值就是 this.vm[key]  replace 方法中第一个值可以是正则表达式，替换后的内容就交给了这个节点的内容*/
			node.textContent = value.replace(reg, this.vm[key]);
			//创建Watcher对象，当数据发生变化后，更新视图
			new Watcher(this.vm, key, (newValue) => {
				//newValue是更新后的值
				node.textContent = newValue;
			});
		}
	}

	// 编译元素节点，处理指令
	compileElement (node) {
		// node.attributes 可以拿到html标签上的所有属性
		// 1、获取当前节点下的所有的属性，然后通过循环的方式，取出每个属性，判断其是否为指令
		// 2、 如果是指令，获取指令的名称与指令对应的值.
		// 3、 分别对v-text指令与v-model指令的情况进行处理.
		//通过node.attributes获取当前节点下所有属性，node.attributes是一个伪数组
		Array.from(node.attributes).forEach((attr) => {
			//获取属性的名称
			let attrName = attr.name;
			//判断是否为指令，调用我们之前写的isDirective方法，判断是指令进行下一步
			if (this.isDirective(attrName)) {
				//如果是指令，需要分别进行处理，也就是分别对v-text与v-model指令
				//进行处理。
				//为了避免在这里书写大量的if判断语句，这里做一个简单的处理.
				//对属性名字进行截取，只获取v-text/v-model中的text/model，获取到属性名字，其实这里就是对其进行一个截取操作，比如这里获取到的是v-text，那么这里截取之后就是获取到的是个text，那么attrName就是text，v-model就是model
				attrName = attrName.substr(2);
				//获取指令对应的值 v-text指令对应的值为msg,v-model指令对应的值为msg,count
				let key = attr.value;
				// 然后这里将 node key attrName都传入到update方法中
				this.update(node, key, attrName);
			}
		});
	}
	/*  compileElement 里面的方法  star*/
	update (node, key, attrName) {
		//根据传递过来的属性名字拼接Updater后缀获取方法。假如这里的attrName是text的话，那么对应的 key 是 msg 的话那么这里的结果就是 textUpdater，这是一个方法，这个方法是处理 v-text指令的一个方法
		let updateFn = this[attrName + "Updater"];
		// 我们先判断这个方法有没有，如果有我们就传入node 和 this.vm[key](this.vm[msg])->其实就是"Hello World"这个值
		updateFn && updateFn.call(this, node, this.vm[key], key); //注意：传递的是根据指令的值获取到的是data中对应属性的值。
	}
	/* 处理v-text指令  如果说这里的node节点是<div v-text="msg"></div>的话，那么这里的 value 就是"Hello World"
	如果后续还有其他的方法，我们只需要在后面加一个后缀实现其方法就可以了 比如下面的 v-model 指令就可以直接实现modelUpdater()方法即可，
	这样写的好处就是不需要写很多的判断了，不用判断是v-model还是v-text直接添加一个 Updater 即可
	Vue中是有很多指令的，如果我们要写成判断的话，需要写特别多的判断，这样我们只需要实现一个方法即可*/
	textUpdater (node, value, key) {
		// 因为这里是将value的值Hello World给了div，这个字符串是在div里面展示的，所以这里用的是node.textContent
		node.textContent = value;
		/* 在textUpdater中创建Watcher实例，这里的this并不是Compiler的实例
		因为在update()方法中，不是通过 this.textUpdater 和this.modelUpdater调用的
		而是通过updateFn方式调用的，这里的this就不是Compiler对象了，那么怎么改变this指向呢
		我们可以通过在update()方法中使用call方法，改变 this 指向
		*/
		new Watcher(this.vm, key, (newValue) => {
			node.textContent = newValue
		})
	}
	//处理v-model 这里需要传入三个参数 node value key 
	modelUpdater (node, value, key) {
		//v-model是文本框的属性，给文本框赋值需要通过value属性，因为v-model都是给文本框添加的
		node.value = value;
		// 在modelUpdater中创建Watcher实例
		new Watcher(this.vm, key, (newValue) => {
			node.value = newValue
		})
		//实现双向绑定
		node.addEventListener("input", () => {
			this.vm[key] = node.value;
		});
	}
	/*  compileElement 里面的方法  end*/

	// 判断元素的属性是否为指令
	isDirective (attrName) {
		// 元素当中如果是指令的话，那么就是 v- 开头的
		return attrName.startsWith("v-")
	}

	// 判断节点是否为文本节点， 
	isTextNode (node) {
		// 如果是文本节点需要对插值表达式进行解析
		return node.nodeType === 3
	}

	// 判断节点是否为元素节点
	isElementNode (node) {
		// 如果等于1表明是一个元素节点，如果是元素节点需要解析对应的指令，解析指令封装进一个方法中
		return node.nodeType === 1
	}
}