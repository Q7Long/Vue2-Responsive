/*
当我们在使用Vue的时候，首先会根据Vue类来创建Vue的实例。
那么Vue类主要的功能如下：
- 负责接收初始化的参数(选项)
- 负责把data中的属性注入到Vue实例，转换成getter/setter(可以通过this来访问data中的属性)
- 负责调用observer监听data中所有属性的变化(当属性值发生变化后更新视图)
- 负责调用compiler解析指令/差值表达式
结构
Vue中包含了_proxyData这个私有方法，该方法的作用就是将data中的属性转换成getter/setter并且注入到Vue的实例中。
*/

class Vue {
	constructor(options) {
		// 1、通过属性保存选项的数据
		// 在new Vue的时候我们会传入一些选项，这里用options接收
		// options:表示在创建Vue实例的时候传递过来的参数，将其保存到$options中。
		this.$options = options || {};
		//获取参数中的data属性保存到$data中.
		this.$data = options.data || {};
		// 我们这个选项中还有一个el，如果是字符串，我们需要找到这个元素，转成dom对象，我们大部分情况都是传入的字符串，如果不是我们直接获取就行
		this.$el = typeof options.el === "string"
			? document.querySelector(options.el)
			: options.el;
		// 2、把data中的成员转换成getter和setter,注入到vue实例中.
		//通过proxy函数后，在控制台上，可以通过vm.msg直接获取数据，而不用输入vm.$data.msg，将获取到的数据this.$data直接传入_proxyData直接传入
		this._proxyData(this.$data);
		//3.调用observer对象，监听数据的变化
		new Observer(this.$data)
		//4.调用compiler对象，解析指令和差值表达式，这里传入的是vue的实例
		new Compiler(this)
	}
	_proxyData (data) {
		//遍历data中的所有属性，还有一种是vue3中的Proxy的方式(这里暂时不考虑)
		Object.keys(data).forEach((key) => {
			// 把data中的属性输入注入到Value实例中，注意，这里使用的是箭头函数，this表示的就是Vue的实例。
			//后期我们可以通过this的形式来访问data中的属性。
			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get () {
					return data[key];
				},
				set (newValue) {
					if (newValue === data[key]) {
						return;
					}
					data[key] = newValue;
				},
			});
		});
	}
}