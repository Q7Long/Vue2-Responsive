/*
1.首先将data中的数据转换成响应式的数据，在上一步中是将data中的数据注入到Vue实例中转换成getter和setter的形式 
2. 当数据发生变化的时候发送相应的通知
*/
class Observer {
	// 接收传过来的 data 数据
	constructor(data) {
		// 关于 data 数据的遍历我们单独的封装在 walk 里面
		this.walk(data)
	}
	walk (data) {
		console.log(data)
		// 首先对 data 进行判断，不能为空，必须是个对象，如果不是对象这里就没必要转
		if (!data || typeof data != 'object') {
			return
		}
		Object.keys(data).forEach((key) => {
			// 把每一个属性拿出来，单独定义一个方法，要把 data 中的属性转换成 getter 和 setter 的形式
			this.defineReactive(data, key, data[key])
		})
	}
	defineReactive (obj, key, value) {
		// 改造set赋值操作，使重新赋值的对象中属性也是响应式的，需要注意this指向
		let that = this
		// 解决data中简单数据类型的属性是响应式的，但是引用数据类型对象却不是响应式的问题
		this.walk(value)
		//1. 创建 Dep 对象
		let dep = new Dep()
		// 注意这点和 Vue.js 中的不太一样，vue.js里面是将数据转换成getter和setter之后注入到this(Vue实例中)
		// 而这里是直接对obj(data)中的数据进行遍历转换成getter和setter的形式
		Object.defineProperty(obj, key, {
			enumerable: true,
			configurable: true,
			get () {
				/*2. 要把对应的 Watcher 对象添加到 Dep 对象的 sub 数据中，当我们获取响应式data数据的时候			  把 Watcher 添加到 subs 数组中，Dep.target就是为了获取观察者，这里暂时没有 target 属性*/
				// 在这里添加观察者对象 Dep.target 表示观察者Watcher对象
				Dep.target && dep.addSub(Dep.target)
				return value
			},
			set (newValue) {
				console.log("set", newValue)
				// 如果新旧值相等那么就没必要更新了
				if (newValue === value) return
				value = newValue
				that.walk(value)
				//3. 当数据发生更改的时候，触发通知 更新视图
				dep.notify()
			}
		})
	}
}