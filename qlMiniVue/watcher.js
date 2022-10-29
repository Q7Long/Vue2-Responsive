/* watcher.js */
/* Watcher 对象有很多，不同的 Watcher 对象更新视图的时候所做的事情是不一样的。
所以在 Watcher 类中还有一个属性，比如叫 cb 属性，该属性就是一个回调函数，当我们创建一个 Watcher 对象的时候，我们需要传入一个回调函数，在回调函数中指明如何去更新视图。
更新视图的时候还是需要数据，比如这里有一个属性 key ，key属性就是 data 属性中的属性名，有了属性名，我们就可以获取 Vue 实例中的属性值。
另外还会有一个属性 oldValue 表示数据发生变化之前的值，在 update 方法中，我们可以获取属性发生变化后的新值，可以与旧值进行比较，观察数据是否发生变化，如果发生变化，更新视图，如果没有发生变化，就不用更新视图了*/

class Watcher {
	constructor(vm, key, cb) {
		// vm 是 Vue 实例
		this.vm = vm
		// key 是 data 中的属性名称，有了属性名称，我们就可以获取到 key 对应的属性值了
		this.key = key
		/* cb 回调函数 负责的就是更新视图的具体方法。当我们创建一个Watcher对象的时候，
		我们是一定要给它传一个回调函数的，在这个回调函数中，指明如何对视图进行更新操作 */
		this.cb = cb
		/* 把观察者的存放在 Dep.target，给Dep添加 target 属性，这个 this 对应的就是 Watcher 类的实例，
		在compile.js里面的compileText方法里面New出来的Watcher实例，
		然后在 observer.js中的get()方法中使用，那么是什么时候触发的 get 方法呢？ */
		Dep.target = this
		/* 旧数据，从 Vue 实例上根据 key 获取属性的旧值。更新视图的时候要进行比较，
		还有一点就是 vm[key] key其实就是data中的某一个属性，因为数据已经被注入到了Vue的实例中了，
		vm[key]取值就触发了 get 方法，然后在Vue类中就会触发get操作，然后里面的返回值是一个 return data[key]
		而获取这个data就会触发在observer.js里面的get方法，然后就会触发dep.addSub(Dep.target)操作
		将 target 里面的 Watcher 类的实例中的添加到了 dep.subs 数组中了 */
		this.oldValue = vm[key]
		// 因为上面已经存储好了，所以这里Dep.target 就不用存在了
		Dep.target = null
	}
	/*观察者中的必备方法 用来更新视图，只要调用 update() 方法，我们就可以获取一个新的值，
	就是我们要更新的新的值。update方法是为了完成视图的更新，只要数据发生变化就会调用update()方法，
	而只要调用update()方法就会获取到新值，这个地方获取的值就是新值*/
	update () {
		/* 获取新值 只要调用 update() 方法就会获取到新值，这个地方获取的值就是新值 
		这一点特别注意，和上面的不一样！这里的 this.vm[this.key] 获取的是新值，
		因为调用 update() 是要更新视图就是获取的新值。*/
		let newValue = this.vm[this.key]
		// 比较旧值和新值，如果新值旧值相等，就不用更新视图了
		if (newValue === this.oldValue) return
		// 调用具体的更新方法，通过调用回调函数去更新视图
		this.cb(newValue)
	}
}