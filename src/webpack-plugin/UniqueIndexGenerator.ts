type OriginalName = string
type GeneratedIndex = number

class UniqueIndexGenerator {
	private nameCache: Map<OriginalName, GeneratedIndex>
	constructor() {
		this.nameCache = new Map()
	}

	uniqueIndexForName(name: string): GeneratedIndex {
		const { nameCache } = this
		let current = nameCache.get(name)
		if (current === undefined) {
			current = nameCache.size
			nameCache.set(name, current)
		}
		return current
	}
}

export default UniqueIndexGenerator
