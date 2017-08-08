document.onload = () => {}

let Components = {
	new(componentName) {
		document.querySelector('.components').querySelector('.' + componentName).cloneNode(false)
	}
}