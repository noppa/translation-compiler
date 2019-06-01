import * as constants from 'constants'

/* eslint-disable no-restricted-syntax, no-prototype-builtins, no-continue */
/* eslint-disable no-bitwise, no-underscore-dangle */

class VirtualStatsConfig {
	dev!: number
	nlink!: number
	uid!: number
	gid!: number
	rdev!: number
	blksize!: number
	ino!: number
	mode!: number
	size!: number
	atime!: number
	mtime!: number
	ctime!: number
	birthtime!: number
}

/**
 * Used to cache a stats object for the virtual file.
 *
 * Originally extracted from the `mock-fs` package,
 * later modified to conform to the code style of this repository
 * and to use TypeScript instead of JavScript.
 *
 * @author Tim Schaub http://tschaub.net/
 * @license https://github.com/tschaub/mock-fs/blob/0bbd60a247ddd6426d449ccd5b940670f6072fc1/license.md
 * @link https://github.com/tschaub/mock-fs/blob/0bbd60a247ddd6426d449ccd5b940670f6072fc1/lib/binding.js
 */
class VirtualStats extends VirtualStatsConfig {
	constructor(config: VirtualStatsConfig) {
		super()
		Object.assign(this, config)
	}

	/**
	 * Check if mode indicates property.
	 * @param property Property to check.
	 * @return Property matches mode.
	 */
	private checkModeProperty(property: number): boolean {
		return (this.mode & constants.S_IFMT) === property
	}

	isDirectory(): boolean {
		return this.checkModeProperty(constants.S_IFDIR)
	}

	isFile(): boolean {
		return this.checkModeProperty(constants.S_IFREG)
	}

	isBlockDevice(): boolean {
		return this.checkModeProperty(constants.S_IFBLK)
	}

	isCharacterDevice(): boolean {
		return this.checkModeProperty(constants.S_IFCHR)
	}

	isSymbolicLink(): boolean {
		return this.checkModeProperty(constants.S_IFLNK)
	}

	/**
	 * @return Is a named pipe.
	 */
	isFIFO(): boolean {
		return this.checkModeProperty(constants.S_IFIFO)
	}

	isSocket(): boolean {
		return this.checkModeProperty(constants.S_IFSOCK)
	}
}

export default VirtualStats
