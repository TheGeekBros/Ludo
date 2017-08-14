document.onload = () => {}

let Components = {
	new(componentName) {
		return document.querySelector('.components').querySelector('.' + componentName).cloneNode(true)
	}
}