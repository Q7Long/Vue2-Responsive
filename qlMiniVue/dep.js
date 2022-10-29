/* Dep.js */

// 实现 Dep 类，这个类的功能是收集依赖，添加观察者。通知所有观察者
/*什么时候收集依赖呢？ 是在 get 中收集依赖，添加相应的观察者
什么时候通知观察者呢？ 是在 set 中通知依赖通知观察者，数据更新之后会调用set方法，对应的通知观察者中的 update()方法去更新相应的视图*/

class Dep {
	constructor() {
		// 存储所有的观察者
		this.subs = []
	}

	// 添加观察者 当调用addSub方法的时候，我们会传递一个观察者
	addSub (sub) {
		// 判断观察者是否存在 和 是否拥有update方法
		if (sub && sub.update) {
			this.subs.push(sub)
		}
	}
	// 通知方法，发送通知：就是调用 sub 方法中的 update 方法
	// 数据发生变化之后会通知所有的观察者其实就是通知所有的观察者，调用它的update这样一个方法
	notify () {
		this.subs.forEach((sub) => {
			sub.update()
		})
	}
}

// 在 get 中添加 Dep.target (观察者)
// 在 set 中 触发 notify (通知)

// 在 observer.js 中使用Dep
/* Dep是收集依赖发送通知，所以我们要给所有的响应式数据添加一个Dep对象，
这样我们就可以通过Dep收集对应的依赖，也就是当数据发生改变的时候，也可以进行通知的发送
也就是使用响应式数据的时候收集依赖，创建观察者对象，当数据发生变化的时候，通知所有的观察者，调用
观察者中的update方法，更新视图
下一步进入 observer.js，在observer.js中使用Dep中的 addSub()方法 和 notify() 方法。
*/