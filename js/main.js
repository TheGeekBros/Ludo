document.onload = () => {
}

let Common = {
	newComponent(componentName) {
		return document.querySelector('.components').querySelector('.' + componentName).cloneNode(true)
	},
	getAttribute(node, attributeName) {
		if (typeof node.getAttribute === 'function') {
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
	},
	setCSS(node, properties) {
		const pxProperties = ['left', 'top', 'right', 'bottom', 'width', 'height']
		for (let key in properties) {
			if (pxProperties.indexOf(key) > -1) {
				if (typeof properties[key] === 'number') {
					properties[key] += 'px'
				} else if (typeof properties[key] === 'string') {
					if (properties[key].indexOf('px') === -1) {
						properties[key] += 'px'
					}
				}
			}
		}
		Object.assign(node.style, properties)
	}
}