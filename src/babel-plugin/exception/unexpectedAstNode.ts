import { Node } from '@babel/types'

type ErrorParams = {
	node: Node
	msg: string
}

class UnexpectedAstNodeException extends Error {
	constructor(params: ErrorParams) {
		super(params.msg)
	}
}

export default UnexpectedAstNodeException
