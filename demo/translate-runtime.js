// const fi = import('./fi.js')

export default function t(key, arg) {
	const t = fi[key]
	return (typeof t === 'function' ? t(arg) : t) + ''
}
