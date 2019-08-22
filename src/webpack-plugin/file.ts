import { InputFileSystem } from 'webpack'
import VirtualStats from './VirtualStats'

export function getStats(contents: string) {
	return new VirtualStats({
		// TODO: Change these arbitrary defaults to meaningful values.
		dev: 8675309,
		nlink: 1,
		uid: 501,
		gid: 20,
		rdev: 0,
		blksize: 4096,
		ino: 44700000,
		mode: 33188,
		size: 1,
		atime: 1,
		mtime: 1,
		ctime: 1,
		birthtime: 1,
	})
}

export function setFile(fs: InputFileSystem, filepath: string, contents: string) {
	// Hack to allow access to fs private apis
	const _fs = fs as any
	const stats = getStats(contents)
	_fs._readFileStorage.data.set(filepath, [null, contents])
	_fs._statStorage.data.set(filepath, [null, stats])
}

export function setFileIfNotExists(
	fs: InputFileSystem,
	filepath: string,
	contentsProvider: () => string,
) {
	const _fs = fs as any
	if (!_fs._readFileStorage.data.has(filepath)) {
		return setFile(fs, filepath, contentsProvider())
	}
}

export function appendToFile(fs: InputFileSystem, filepath: string, newContents: string) {
	const _fs = fs as any
	const [, existingFile] = _fs._readFileStorage.data.get(filepath) || [null, '']
	const contents = [existingFile, newContents].filter(Boolean).join('\n')
	return setFile(fs, filepath, contents)
}
