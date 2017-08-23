document.onload = () => {}

let Common = {
	newComponent(componentName) {
		return document.querySelector('.components').querySelector('.' + componentName).cloneNode(true)
	},
	getAttribute(node, attributeName) {
		if(typeof node.getAttribute === 'function') {
			return node.getAttribute('data-' + attributeName)
		}
		console.error('No getAttribute function exist for', node)
		return node
	},
	setAttribute(node, attributeName, attributeValue) {
		if (typeof node.setAttribute === 'function') {
			return node.setAttribute('data-' + attributeName, attributeValue)
		}
		console.error('No setAttribute function exist for', node)
		return node
	}
}